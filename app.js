/* ==========================================================================
   普新精舍 結業典禮掌中寶 - 核心邏輯控制 (app.js)
   處理單頁路由、時間軸生成、個人執事智能搜尋、互動 SVG 平面圖及排班分配器。
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 核心資料庫引用
  const data = window.CEREMONY_DATA;
  if (!data) {
    console.error("無法載入 data.js 的典禮資料！");
    return;
  }

  // 全局變數
  let currentActiveTab = "timeline";
  let currentActiveMapId = "map_awards";
  let activeHighlightRoleId = null;
  let volunteerPool = [...data.defaultVolunteers];

  // DOM 元素快取
  const tabs = document.querySelectorAll(".nav-tab");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeIcon = themeToggleBtn.querySelector(".theme-icon");
  
  // 1. 路由切換控制 (Tab Navigation)
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  function switchTab(tabId) {
    tabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab") === tabId));
    tabPanels.forEach(panel => panel.classList.remove("active"));
    
    const targetPanel = document.getElementById(`tab-${tabId}`);
    if (targetPanel) targetPanel.classList.add("active");
    
    currentActiveTab = tabId;
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 切換至地圖分頁時，重新渲染目前選取的 SVG 地圖
    if (tabId === "maps") {
      renderActiveMap();
    }
    if (tabId === "master-grid") {
      renderMasterGrid();
    }
  }

  // 2. 深淺色模式切換 (Theme Toggle)
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    themeIcon.textContent = newTheme === "dark" ? "🌙" : "☀️";
  });

  /* --------------------------------------------------------------------------
     A. 典禮流程時間軸模組 (Timeline Module)
     -------------------------------------------------------------------------- */
  const timelineContainer = document.getElementById("timeline-list");

  function renderTimeline() {
    // 檢查當前哪一個流程節點是展開狀態
    const currentlyExpandedCard = timelineContainer.querySelector(".timeline-card.expanded");
    const expandedStageId = currentlyExpandedCard ? currentlyExpandedCard.id.replace("timeline-stage-", "") : null;

    timelineContainer.innerHTML = "";
    
    data.stages.forEach((stage, index) => {
      // 如果有已展開的節點，則維持該節點展開；若是首次載入則預設展開第一步
      const isExpanded = expandedStageId ? (stage.id === expandedStageId) : (index === 0);
      
      const card = document.createElement("div");
      card.className = `timeline-card ${isExpanded ? "active expanded" : ""}`;
      card.id = `timeline-stage-${stage.id}`;
      
      // 注意事項清單生成
      const notesListHtml = stage.notes.map(note => `<li>${note}</li>`).join("");
      
      // 執事表格生成
      const dutiesRowsHtml = stage.roles.map(role => {
        return `
          <tr>
            <td><strong>${role.title}</strong></td>
            <td>
              <span class="highlight-name" data-name="${role.assignee}">${role.assignee}</span>
            </td>
            <td>${role.desc}</td>
            <td style="text-align: right;">
              <button class="btn-locate" data-map="${stage.mapId}" data-role="${role.id}">📍 定位</button>
            </td>
          </tr>
        `;
      }).join("");

      card.innerHTML = `
        <div class="timeline-card-header">
          <div class="timeline-title-group">
            <span class="timeline-time">${stage.time}</span>
            <h3>${stage.title}</h3>
            <span class="timeline-duration">${stage.duration}</span>
          </div>
          <span class="timeline-arrow">▼</span>
        </div>
        <div class="timeline-card-content" style="${isExpanded ? "display: block;" : "display: none;"}">
          <p class="timeline-desc">${stage.desc}</p>
          
          ${stage.notes.length > 0 ? `
            <div class="timeline-notes-box">
              <h5>⚠️ 注意事項</h5>
              <ul>${notesListHtml}</ul>
            </div>
          ` : ""}

          ${stage.roles.length > 0 ? `
            <div class="timeline-duties-box">
              <h5>👥 執事分工</h5>
              <table class="duties-table">
                <thead>
                  <tr>
                    <th style="width: 25%;">職稱</th>
                    <th style="width: 20%;">執事人員</th>
                    <th style="width: 45%;">工作內容</th>
                    <th style="width: 10%; text-align: right;">站位</th>
                  </tr>
                </thead>
                <tbody>
                  ${dutiesRowsHtml}
                </tbody>
              </table>
            </div>
          ` : ""}
        </div>
      `;

      // 摺疊/展開事件綁定
      const cardHeader = card.querySelector(".timeline-card-header");
      cardHeader.addEventListener("click", () => {
        const content = card.querySelector(".timeline-card-content");
        const arrow = card.querySelector(".timeline-arrow");
        const isExpanded = card.classList.contains("expanded");
        
        // 收合其他卡片
        document.querySelectorAll(".timeline-card").forEach(c => {
          if (c !== card) {
            c.classList.remove("expanded");
            c.querySelector(".timeline-card-content").style.display = "none";
          }
        });

        if (isExpanded) {
          card.classList.remove("expanded");
          content.style.display = "none";
        } else {
          card.classList.add("expanded");
          content.style.display = "block";
        }
      });

      // 點擊「定位」按鈕，切換至地圖並高亮特定位置
      card.querySelectorAll(".btn-locate").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation(); // 阻止卡片摺疊觸發
          const mapId = btn.getAttribute("data-map");
          const roleId = btn.getAttribute("data-role");
          
          currentActiveMapId = mapId;
          activeHighlightRoleId = roleId;
          
          // 切換至地圖分頁
          switchTab("maps");
        });
      });

      // 點擊派任人員姓名，自動將其填入搜尋框並查詢
      card.querySelectorAll(".highlight-name").forEach(nameSpan => {
        nameSpan.addEventListener("click", (e) => {
          e.stopPropagation();
          const name = nameSpan.getAttribute("data-name").trim();
          if (name && name !== "XXX" && name !== "學長團隊" && name !== "課務團隊" && name !== "全體義工團隊") {
            const firstSingleName = name.split(/[,、.\s]/)[0]; // 取第一個名字
            document.getElementById("search-name-input").value = firstSingleName;
            switchTab("search");
            performSearch(firstSingleName);
          }
        });
      });

      timelineContainer.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     B. 個人執事查詢模組 (Search Module)
     -------------------------------------------------------------------------- */
  const searchInput = document.getElementById("search-name-input");
  const searchBtn = document.getElementById("btn-search");
  const searchClearBtn = document.getElementById("btn-search-clear");
  const searchResultArea = document.getElementById("search-result-area");
  const datalist = document.getElementById("volunteer-datalist");

  // 更新 datalist 人員建議清單
  function updateDatalist() {
    datalist.innerHTML = "";
    
    // 搜集 data 中所有已排定的人名
    const assignedNames = new Set();
    data.stages.forEach(stage => {
      stage.roles.forEach(role => {
        const names = role.assignee.split(/[,、.\s]/);
        names.forEach(n => {
          const trimmed = n.trim();
          if (trimmed && trimmed !== "XXX") {
            assignedNames.add(trimmed);
          }
        });
      });
    });

    // 合併 defaultVolunteers
    volunteerPool.forEach(n => assignedNames.add(n));

    // 填入 datalist
    Array.from(assignedNames).sort().forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      datalist.appendChild(opt);
    });
  }

  // 監聽輸入框以顯示/隱藏清除按鈕
  searchInput.addEventListener("input", () => {
    searchClearBtn.style.display = searchInput.value ? "block" : "none";
  });

  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchClearBtn.style.display = "none";
    searchInput.focus();
  });

  searchBtn.addEventListener("click", () => {
    performSearch(searchInput.value.trim());
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch(searchInput.value.trim());
    }
  });

  function performSearch(name) {
    if (!name) {
      alert("請輸入姓名進行查詢！");
      return;
    }

    // 搜尋該名義工參與的所有職務
    const userDuties = [];
    
    data.stages.forEach(stage => {
      stage.roles.forEach(role => {
        // 模糊匹配：人名中是否包含搜尋字串 (例如「永昌」匹配「總學長永昌」)
        if (role.assignee.includes(name)) {
          userDuties.push({
            stageId: stage.id,
            stageTitle: stage.title,
            time: stage.time,
            mapId: stage.mapId,
            roleId: role.id,
            roleTitle: role.title,
            roleDesc: role.desc
          });
        }
      });
    });

    if (userDuties.length === 0) {
      searchResultArea.innerHTML = `
        <div class="search-empty-state" style="border-color: #dc3545;">
          <span class="state-icon" style="color: #dc3545;">🧘</span>
          <h3>查無您的執事資料</h3>
          <p>找不到姓名包含「<strong>${name}</strong>」的排班。請確認名字是否輸入正確，或前往「執事分配」分頁手動為其指派任務。</p>
        </div>
      `;
      return;
    }

    // 渲染個人執事卡
    const dutiesListHtml = userDuties.map(duty => {
      return `
        <div class="personal-task-item">
          <div class="personal-task-meta">
            <div class="personal-task-time-title">
              <span class="personal-task-time">${duty.time}</span>
              <span class="personal-task-stage">${duty.stageTitle}</span>
            </div>
            <button class="btn-locate" data-map="${duty.mapId}" data-role="${duty.roleId}">📍 顯示站位</button>
          </div>
          <div class="personal-task-title">${duty.roleTitle}</div>
          <div class="personal-task-desc">
            <strong>職掌內容：</strong>${duty.roleDesc}
          </div>
        </div>
      `;
    }).join("");

    searchResultArea.innerHTML = `
      <div class="personal-duty-card">
        <div class="personal-header">
          <div class="personal-welcome">
            <h3>阿彌陀佛，${name} 學長！</h3>
            <p>您在本次結業典禮中共擔任 <strong>${userDuties.length}</strong> 項執事職掌。請查看下方日程表與站位動線：</p>
          </div>
          <span class="personal-badge">夜間班執事</span>
        </div>
        <div class="personal-tasks-list">
          ${dutiesListHtml}
        </div>
      </div>
    `;

    // 綁定站位高亮連動按鈕
    searchResultArea.querySelectorAll(".btn-locate").forEach(btn => {
      btn.addEventListener("click", () => {
        const mapId = btn.getAttribute("data-map");
        const roleId = btn.getAttribute("data-role");
        
        currentActiveMapId = mapId;
        activeHighlightRoleId = roleId;
        
        switchTab("maps");
      });
    });
  }

  /* --------------------------------------------------------------------------
     C. 互動 SVG 站位地圖模組 (Interactive Maps Module)
     -------------------------------------------------------------------------- */
  const mapSelectBtns = document.querySelectorAll(".btn-map-select");
  const svgMapWrapper = document.getElementById("svg-map-wrapper");
  const currentMapTitle = document.getElementById("current-map-title");
  const currentMapDesc = document.getElementById("current-map-desc");
  const zoneTableContainer = document.getElementById("map-zone-table-container");
  
  // 地圖選擇按鈕事件
  mapSelectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      mapSelectBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const mapId = btn.getAttribute("data-map");
      currentActiveMapId = mapId;
      activeHighlightRoleId = null; // 切換地圖時清除先前的高亮
      
      renderActiveMap();
    });
  });

  function renderActiveMap() {
    // 更新標題與描述
    const mapConfig = data.maps[currentActiveMapId];
    currentMapTitle.textContent = mapConfig.name;
    currentMapDesc.textContent = mapConfig.description;

    // 清空 wrapper
    svgMapWrapper.innerHTML = "";

    // 根據目前的 mapId 生成對應的 SVG 平面圖
    let svgHtml = "";
    if (currentActiveMapId === "map_awards") {
      svgHtml = generateAwardsMapSvg();
    } else if (currentActiveMapId === "map_lamps") {
      svgHtml = generateLampsMapSvg();
    } else if (currentActiveMapId === "map_offering") {
      svgHtml = generateOfferingMapSvg();
    }

    svgMapWrapper.innerHTML = svgHtml;

    // 渲染下方分區人員表格
    renderZoneTable();

    // 註冊地圖中執事站點的點擊事件
    const spots = svgMapWrapper.querySelectorAll(".svg-officer-spot");
    spots.forEach(spot => {
      spot.addEventListener("click", () => {
        const roleId = spot.getAttribute("data-role-id");
        // 高亮地圖圓點
        spots.forEach(s => s.classList.remove("highlighted"));
        spot.classList.add("highlighted");
        // 高亮下方表格對應列
        highlightTableRow(roleId);
      });
    });

    // 如果有需要自動高亮的角色 (從時間軸或搜尋跳轉而來)
    if (activeHighlightRoleId) {
      const targetSpot = svgMapWrapper.querySelector(`.svg-officer-spot[data-role-id="${activeHighlightRoleId}"]`);
      if (targetSpot) {
        spots.forEach(s => s.classList.remove("highlighted"));
        targetSpot.classList.add("highlighted");
        highlightTableRow(activeHighlightRoleId);
        setTimeout(() => {
          targetSpot.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      }
    }

    // 將地圖選擇按鈕狀態同步
    mapSelectBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-map") === currentActiveMapId);
    });
  }

  // 高亮表格中對應角色的列，並滾動至可見
  function highlightTableRow(roleId) {
    if (!zoneTableContainer) return;
    // 移除其他高亮
    zoneTableContainer.querySelectorAll(".zone-row").forEach(r => r.classList.remove("highlighted"));
    const targetRow = zoneTableContainer.querySelector(`.zone-row[data-role-id="${roleId}"]`);
    if (targetRow) {
      targetRow.classList.add("highlighted");
      setTimeout(() => {
        targetRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }

  // 渲染分區人員表格（依 zone 標籤分組）
  function renderZoneTable() {
    if (!zoneTableContainer) return;

    const stageRoles = getRolesForMap(currentActiveMapId);

    // 依 zone 標籤（position.label 的前綴）分組
    // 使用 position.zone 欄位（若有）；否則以 position.label 作為分組 key
    // 先建立區域組：以 zone 欄位 or label 分組
    const zoneMap = new Map(); // zone key -> [{role, pos, stage}]
    stageRoles.forEach(({ role, position, stage }) => {
      if (!position) return;
      const zoneKey = position.zone || position.label || "其他";
      if (!zoneMap.has(zoneKey)) zoneMap.set(zoneKey, []);
      zoneMap.get(zoneKey).push({ role, position, stage });
    });

    // 建立各 zone 的色彩索引（依序循環顏色）
    const zoneColors = [
      "#d4af37", // 金
      "#5b9bd5", // 藍
      "#70ad47", // 綠
      "#ed7d31", // 橙
      "#9b59b6", // 紫
      "#e74c3c", // 紅
      "#1abc9c", // 青
      "#f39c12", // 黃橙
      "#2980b9", // 深藍
      "#27ae60", // 深綠
      "#8e44ad", // 深紫
      "#c0392b", // 深紅
    ];
    const zoneColorMap = new Map();
    let colorIdx = 0;
    zoneMap.forEach((_, key) => {
      zoneColorMap.set(key, zoneColors[colorIdx % zoneColors.length]);
      colorIdx++;
    });

    // 用同樣的顏色更新 SVG 圓點顏色
    zoneMap.forEach((items, zoneKey) => {
      const color = zoneColorMap.get(zoneKey);
      items.forEach(({ role }) => {
        const spot = svgMapWrapper.querySelector(`.svg-officer-spot[data-role-id="${role.id}"] .svg-officer-circle`);
        if (spot) {
          spot.style.fill = color;
          spot.style.stroke = color;
        }
        // 也更新標籤文字顏色
        const label = svgMapWrapper.querySelector(`.svg-officer-spot[data-role-id="${role.id}"] .svg-zone-label`);
        if (label) label.style.fill = color;
      });
    });

    // 生成 HTML
    let html = "";
    zoneMap.forEach((items, zoneKey) => {
      const color = zoneColorMap.get(zoneKey);
      html += `
        <div class="zone-section">
          <div class="zone-section-title" style="border-left: 4px solid ${color}; padding-left: 10px;">
            <span class="zone-color-dot" style="background: ${color};"></span>
            ${zoneKey}
          </div>
          <table class="zone-personnel-table">
            <thead>
              <tr>
                <th>職掌</th>
                <th>執事人員</th>
                <th>工作說明</th>
              </tr>
            </thead>
            <tbody>
      `;
      items.forEach(({ role, position, stage }) => {
        const isUnassigned = !role.assignee || role.assignee === "XXX";
        const assigneeDisplay = isUnassigned
          ? `<span style="color: var(--text-muted); opacity: 0.6;">未指派</span>`
          : `<span class="zone-assignee-name">${role.assignee}</span>`;
        html += `
          <tr class="zone-row" data-role-id="${role.id}"
              title="點擊高亮地圖站點"
              onclick="(function(el){
                var roleId = el.getAttribute('data-role-id');
                var spots = document.querySelectorAll('.svg-officer-spot');
                spots.forEach(function(s){ s.classList.remove('highlighted'); });
                var targetSpot = document.querySelector('.svg-officer-spot[data-role-id=\"'+roleId+'\"]');
                if(targetSpot){ targetSpot.classList.add('highlighted'); targetSpot.scrollIntoView({behavior:'smooth',block:'nearest'}); }
                document.querySelectorAll('.zone-row').forEach(function(r){ r.classList.remove('highlighted'); });
                el.classList.add('highlighted');
              })(this)">
            <td><strong>${role.title}</strong><br><span style="font-size:11px;color:var(--text-muted);">${stage.time} ${stage.title}</span></td>
            <td>${assigneeDisplay}</td>
            <td style="font-size: 13px; color: var(--text-secondary);">${role.desc.length > 60 ? role.desc.substring(0, 60) + '…' : role.desc}</td>
          </tr>
        `;
      });
      html += `
            </tbody>
          </table>
        </div>
      `;
    });

    if (html === "") {
      html = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">此地圖尚無執事站位資料。</div>`;
    }

    zoneTableContainer.innerHTML = html;
  }

  // 顯示地圖中點擊角色的工作詳情（現在改為高亮表格列）
  // 保留此函數以相容從時間軸/搜尋跳轉而來的連結
  function showRoleDetails(roleId) {
    highlightTableRow(roleId);
  }

  // 生成 地圖 A：結業頒證
  function generateAwardsMapSvg() {
    return `
      <div class="static-map-container" style="position: relative; width: 100%; display: flex; justify-content: center;">
        <img src="清淨.jpg" class="static-map-image" alt="清淨講堂結業頒證平面圖" />
      </div>
    `;
  }

  // 生成 地圖 B：傳燈與發願
  function generateLampsMapSvg() {
    return `
      <div class="static-map-container" style="position: relative; width: 100%; display: flex; justify-content: center;">
        <img src="清淨.jpg" class="static-map-image" alt="清淨講堂傳燈與發願平面圖" />
      </div>
    `;
  }

  // 生成 地圖 C：禪堂供燈供僧
  function generateOfferingMapSvg() {
    return `
      <div class="static-map-container" style="position: relative; width: 100%; display: flex; justify-content: center;">
        <img src="禪堂.jpg" class="static-map-image" alt="禪堂供燈與供僧平面圖" />
      </div>
    `;
  }


  // 獲取與特定地圖關聯的所有角色與位置資訊
  function getRolesForMap(mapId) {
    const rolesList = [];
    data.stages.forEach(stage => {
      if (stage.mapId === mapId) {
        // Special case: Map A (結業頒證) should only display core roles of the "awards_grad" stage
        // as drawn in the Word document. The rest will only be displayed in the tables.
        if (mapId === "map_awards" && stage.id !== "awards_grad") {
          return;
        }
        stage.roles.forEach(role => {
          // 找到該角色在 positions 中的座標
          const pos = stage.positions ? stage.positions.find(p => p.roleId === role.id) : null;
          rolesList.push({
            stage: stage,
            role: role,
            position: pos
          });
        });
      }
    });
    return rolesList;
  }

  /* --------------------------------------------------------------------------
     D. 音訊控制與梵唄練習模組 (Audio & Songs Module)
     -------------------------------------------------------------------------- */
  const audio = document.getElementById("ceremony-audio");

  // 原生 Audio 已經非常簡潔漂亮，可在 CSS 中進行包裹樣式美化
  if (audio) {
    audio.addEventListener("error", (e) => {
      console.log("音檔載入提示：獻給導師 2025 音檔將於與 index.html 置於同目錄下時正常播放。");
    });
  }

  /* --------------------------------------------------------------------------
     D2. 執事總表模組 (Master Grid Module)
     -------------------------------------------------------------------------- */
  const gridSearchInput = document.getElementById("grid-search-input");
  const gridClearBtn = document.getElementById("btn-grid-clear");
  const masterGridRows = document.getElementById("master-grid-rows");

  if (gridSearchInput) {
    gridSearchInput.addEventListener("input", () => {
      if (gridClearBtn) gridClearBtn.style.display = gridSearchInput.value ? "block" : "none";
      renderMasterGrid();
    });
  }

  if (gridClearBtn) {
    gridClearBtn.addEventListener("click", () => {
      gridSearchInput.value = "";
      gridClearBtn.style.display = "none";
      renderMasterGrid();
      gridSearchInput.focus();
    });
  }

  function renderMasterGrid() {
    if (!masterGridRows) return;
    masterGridRows.innerHTML = "";

    const filterText = gridSearchInput ? gridSearchInput.value.trim().toLowerCase() : "";

    // 24位人員名單
    const allPeople = [...volunteerPool];

    // 分組的物理階段定義
    const stageGroups = [
      { name: "報到與預演", ids: ["checkin", "rehearsal"] },
      { name: "結業頒證", ids: ["welcome", "awards_grad", "awards_full", "awards_sincere", "awards_diligence", "awards_study", "awards_bodhi", "sharing"] },
      { name: "傳燈發願", ids: ["sermon", "lamps", "lamps_vow"] },
      { name: "供燈供僧 (禪堂)", ids: ["offering"] },
      { name: "撤場與其他", ids: ["farewell", "announcements", "cleanup"] }
    ];

    // 對於每個人，尋找他們在各個階段的執事
    allPeople.forEach(personName => {
      // 搜尋過濾：如果輸入了篩選字串，且這個人的姓名中不包含該字串，則跳過
      if (filterText && !personName.toLowerCase().includes(filterText)) {
        return;
      }

      const row = document.createElement("tr");
      
      // 1. 人員姓名 (Sticky cell)
      let nameCellHtml = `<td class="master-grid-sticky-cell">${personName}</td>`;
      row.innerHTML += nameCellHtml;

      // 2. 搜尋此人在這 5 個階段的任務
      stageGroups.forEach(group => {
        const dutiesInGroup = [];
        
        data.stages.forEach(stage => {
          if (group.ids.includes(stage.id)) {
            stage.roles.forEach(role => {
              if (role.assignee.includes(personName)) {
                // 如果 assignee 包含了這個名字，說明他有這個任務
                dutiesInGroup.push(`<span class="grid-role-badge" data-stage="${stage.id}" data-role="${role.id}">📍 ${role.title}</span>`);
              }
            });
          }
        });

        if (dutiesInGroup.length > 0) {
          row.innerHTML += `<td><div class="grid-duties-cell">${dutiesInGroup.join("")}</div></td>`;
        } else {
          row.innerHTML += `<td style="color: var(--text-muted); opacity: 0.5; text-align: center;">-</td>`;
        }
      });

      // 綁定點擊 badge 跳轉到地圖或流程高亮定位
      row.querySelectorAll(".grid-role-badge").forEach(badge => {
        badge.addEventListener("click", () => {
          const stageId = badge.getAttribute("data-stage");
          const roleId = badge.getAttribute("data-role");
          
          // 查找對應的地圖 ID
          const stage = data.stages.find(s => s.id === stageId);
          if (stage) {
            currentActiveMapId = stage.mapId;
            activeHighlightRoleId = roleId;
            switchTab("maps");
          }
        });
      });

      masterGridRows.appendChild(row);
    });
  }

  /* --------------------------------------------------------------------------
     E. 執事排班編輯器模組 (Admin & Duty Allocator Module)
     -------------------------------------------------------------------------- */
  const volunteerPoolInput = document.getElementById("admin-volunteer-pool");
  const applyPoolBtn = document.getElementById("btn-admin-apply-pool");
  const exportBtn = document.getElementById("btn-admin-export");
  const resetBtn = document.getElementById("btn-admin-reset");
  const editorStagesContainer = document.getElementById("editor-stages-container");

  let adminModuleInitialized = false;

  // 初始化 Admin 模組
  function initAdminModule() {
    if (!volunteerPoolInput || !editorStagesContainer) return;
    
    // 1. 初始化名單庫文字
    volunteerPoolInput.value = volunteerPool.join("\n");
    
    if (adminModuleInitialized) {
      renderEditorList();
      return;
    }
    
    // 2. 綁定更新名單庫按鈕
    applyPoolBtn.addEventListener("click", () => {
      const lines = volunteerPoolInput.value.split("\n");
      volunteerPool = lines.map(line => line.trim()).filter(line => line.length > 0);
      alert(`名單庫已更新！共收錄 ${volunteerPool.length} 位義工學長。`);
      
      // 重新渲染編輯表格與下拉選單，並更新 lookup datalist
      renderEditorList();
      updateDatalist();
    });

    // 3. 綁定重設按鈕
    resetBtn.addEventListener("click", () => {
      if (confirm("確定要重設所有執事指派為「XXX」嗎？此動作將清空目前所有填寫的名字。")) {
        data.stages.forEach(stage => {
          stage.roles.forEach(role => {
            role.assignee = "XXX";
          });
        });
        // 總學長預設保留
        const bodhiStage = data.stages.find(s => s.id === "awards_bodhi");
        if (bodhiStage) {
          const leaderRole = bodhiStage.roles.find(r => r.id === "bodhi_leader_rep");
          if (leaderRole) leaderRole.assignee = "永昌";
        }
        
        renderEditorList();
        renderTimeline();
        updateDatalist();
        alert("已重設完畢！");
      }
    });

    // 4. 綁定匯出 data.js 按鈕
    exportBtn.addEventListener("click", () => {
      exportDataJs();
    });

    adminModuleInitialized = true;
    renderEditorList();
  }

  // 渲染右側執事排班表編輯清單
  function renderEditorList() {
    if (!editorStagesContainer) return;
    editorStagesContainer.innerHTML = "";

    data.stages.forEach(stage => {
      const stageItem = document.createElement("div");
      stageItem.className = "editor-stage-item";
      
      let rolesFormHtml = "";
      stage.roles.forEach(role => {
        // 拆分目前指派的多個姓名（在編輯器中必須保留 XXX 以便渲染空白下拉選單）
        let currentAssignees = role.assignee.split(/[,、.\s]/)
          .map(n => n.trim())
          .filter(n => n.length > 0 && n !== "None");

        if (currentAssignees.length === 0) {
          currentAssignees = ["XXX"];
        }

        const combinedPool = Array.from(new Set([...volunteerPool, ...currentAssignees])).filter(n => n !== "XXX");

        let assigneesInputsHtml = "";
        currentAssignees.forEach((name, idx) => {
          let selectOptionsHtml = `<option value="XXX" ${name === "XXX" ? "selected" : ""}>XXX (從缺)</option>`;
          
          let selectedValue = "CUSTOM";
          if (name === "XXX") {
            selectedValue = "XXX";
          } else if (combinedPool.includes(name)) {
            selectedValue = name;
          }

          combinedPool.forEach(pName => {
            if (pName && pName !== "XXX") {
              selectOptionsHtml += `<option value="${pName}" ${selectedValue === pName ? "selected" : ""}>${pName}</option>`;
            }
          });

          assigneesInputsHtml += `
            <div class="assignee-input-row" style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
              <select class="admin-role-select" data-stage-id="${stage.id}" data-role-id="${role.id}" data-index="${idx}" style="flex: 1; min-width: 0; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);">
                ${selectOptionsHtml}
                <option value="CUSTOM" ${selectedValue === "CUSTOM" ? "selected" : ""}>✍️ 手動輸入...</option>
              </select>
              <input type="text" class="admin-role-input" data-stage-id="${stage.id}" data-role-id="${role.id}" data-index="${idx}" value="${name === "XXX" ? "" : name}" placeholder="手動輸入人名..." style="display: ${selectedValue === "CUSTOM" ? "block" : "none"}; flex: 1; min-width: 0; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
              <button type="button" class="btn-delete-assignee" data-stage-id="${stage.id}" data-role-id="${role.id}" data-index="${idx}" style="padding: 6px 10px; background: none; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-muted); cursor: pointer; transition: all 0.2s;" title="刪除此人">🗑️</button>
            </div>
          `;
        });

        rolesFormHtml += `
          <div class="editor-role-row" style="display: flex; flex-direction: column; gap: 4px; padding: 12px 0; border-bottom: 1px dashed var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="editor-role-label" style="font-weight: 700; font-size: 15px; color: var(--text-primary); text-align: left; width: auto; max-width: 70%; line-height: 1.3;">${role.title}</span>
              <button type="button" class="btn-add-assignee btn-secondary" data-stage-id="${stage.id}" data-role-id="${role.id}" style="padding: 4px 10px; font-size: 12px; border-radius: 6px; display: flex; align-items: center; gap: 4px; border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary); cursor: pointer;">➕ 增加人員</button>
            </div>
            <div class="assignees-container" style="display: flex; flex-direction: column;">
              ${assigneesInputsHtml}
            </div>
            <div class="editor-role-desc" style="font-size: 13px; color: var(--text-muted); margin-top: 4px; line-height: 1.4; margin-left: 0;">
              ${role.desc}
            </div>
          </div>
        `;
      });

      stageItem.innerHTML = `
        <div class="editor-stage-title-time">
          <h4>${stage.title}</h4>
          <span class="badge">${stage.time}</span>
        </div>
        <div class="editor-roles-grid" style="display: flex; flex-direction: column; gap: 8px; padding-left: 0;">
          ${rolesFormHtml}
        </div>
      `;

      // 監聽增加人員按鈕
      stageItem.querySelectorAll(".btn-add-assignee").forEach(btn => {
        btn.addEventListener("click", () => {
          const stageId = btn.getAttribute("data-stage-id");
          const roleId = btn.getAttribute("data-role-id");
          const s = data.stages.find(x => x.id === stageId);
          if (s) {
            const r = s.roles.find(x => x.id === roleId);
            if (r) {
              let assignees = r.assignee.split(/[,、.\s]/)
                .map(n => n.trim())
                .filter(n => n.length > 0 && n !== "None");
              assignees.push("XXX");
              const updated = assignees.join("、");
              updateAssigneeInMemory(stageId, roleId, updated);
            }
          }
        });
      });

      // 監聽刪除人員按鈕
      stageItem.querySelectorAll(".btn-delete-assignee").forEach(btn => {
        btn.addEventListener("click", () => {
          const stageId = btn.getAttribute("data-stage-id");
          const roleId = btn.getAttribute("data-role-id");
          const idx = parseInt(btn.getAttribute("data-index"), 10);
          const s = data.stages.find(x => x.id === stageId);
          if (s) {
            const r = s.roles.find(x => x.id === roleId);
            if (r) {
              let assignees = r.assignee.split(/[,、.\s]/)
                .map(n => n.trim())
                .filter(n => n.length > 0 && n !== "None");
              
              if (assignees.length > 0) {
                assignees.splice(idx, 1);
              }
              const updated = assignees.join("、") || "XXX";
              updateAssigneeInMemory(stageId, roleId, updated);
            }
          }
        });
      });

      // Helper: 收集某個 role 所有欄位的值並更新
      function syncRoleAssignees(stageId, roleId, stageContainer) {
        const values = [];
        const selectElements = stageContainer.querySelectorAll(`.admin-role-select[data-stage-id="${stageId}"][data-role-id="${roleId}"]`);
        
        selectElements.forEach(select => {
          const index = select.getAttribute("data-index");
          const input = stageContainer.querySelector(`.admin-role-input[data-stage-id="${stageId}"][data-role-id="${roleId}"][data-index="${index}"]`);
          
          const selVal = select.value;
          if (selVal === "CUSTOM") {
            const textVal = input.value.trim();
            if (textVal) values.push(textVal);
          } else if (selVal !== "XXX") {
            values.push(selVal);
          }
        });

        const updated = values.join("、") || "XXX";
        updateAssigneeInMemory(stageId, roleId, updated);
      }

      // 監聽下拉選單變化
      stageItem.querySelectorAll(".admin-role-select").forEach(select => {
        const stageId = select.getAttribute("data-stage-id");
        const roleId = select.getAttribute("data-role-id");
        const idx = select.getAttribute("data-index");
        const textInput = stageItem.querySelector(`.admin-role-input[data-stage-id="${stageId}"][data-role-id="${roleId}"][data-index="${idx}"]`);

        select.addEventListener("change", () => {
          const val = select.value;
          if (val === "CUSTOM") {
            textInput.style.display = "block";
            textInput.focus();
          } else {
            textInput.style.display = "none";
            textInput.value = val === "XXX" ? "" : val;
            syncRoleAssignees(stageId, roleId, stageItem);
          }
        });
      });

      // 監聽文字輸入框變化
      stageItem.querySelectorAll(".admin-role-input").forEach(input => {
        const stageId = input.getAttribute("data-stage-id");
        const roleId = input.getAttribute("data-role-id");
        const idx = input.getAttribute("data-index");
        const select = stageItem.querySelector(`.admin-role-select[data-stage-id="${stageId}"][data-role-id="${roleId}"][data-index="${idx}"]`);

        input.addEventListener("input", () => {
          const val = input.value.trim();
          const hasOption = Array.from(select.options).some(opt => opt.value === val);
          if (hasOption) {
            select.value = val;
            input.style.display = "none";
          } else {
            select.value = "CUSTOM";
          }
          syncRoleAssignees(stageId, roleId, stageItem);
        });
      });

      editorStagesContainer.appendChild(stageItem);
    });
  }

  // 更新儲存於記憶體中的排班人名
  function updateAssigneeInMemory(stageId, roleId, newAssignee) {
    const stage = data.stages.find(s => s.id === stageId);
    if (stage) {
      const role = stage.roles.find(r => r.id === roleId);
      if (role) {
        role.assignee = newAssignee;
        
        // 即時重新渲染所有前台介面，確保完全同步連動！
        renderTimeline();
        updateDatalist();
        renderMasterGrid();
        renderActiveMap();
        initAdminModule();
        
        // 即時雙向同步：寫回飛書雲端試算表
        syncWithFeishuCloud(roleId, newAssignee);
      }
    }
  }

  // 雙向同步：寫回飛書雲端試算表 (前端發送 Vercel Serverless Function 呼叫)
  function syncWithFeishuCloud(roleId, assignee) {
    // 移除舊的狀態提示
    const oldGlow = document.querySelector(".sync-status-glow");
    if (oldGlow) oldGlow.remove();

    const statusGlow = document.createElement("div");
    statusGlow.className = "sync-status-glow";
    statusGlow.innerHTML = `<span>⏳ 正在同步雲端班表...</span>`;
    document.body.appendChild(statusGlow);

    fetch('/api/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roleId, assignee })
    })
    .then(res => {
      if (!res.ok) throw new Error("HTTP error " + res.status);
      return res.json();
    })
    .then(result => {
      if (result.code === 0) {
        statusGlow.className = "sync-status-glow success";
        statusGlow.innerHTML = `<span>✅ 雲端同步成功！</span>`;
      } else {
        statusGlow.className = "sync-status-glow error";
        statusGlow.innerHTML = `<span>❌ 雲端同步失敗: ${result.msg}</span>`;
      }
      setTimeout(() => {
        statusGlow.style.opacity = 0;
        setTimeout(() => statusGlow.remove(), 400);
      }, 2000);
    })
    .catch(err => {
      statusGlow.className = "sync-status-glow error";
      statusGlow.innerHTML = `<span>⚠️ 離線模式 (僅儲存於網頁)</span>`;
      setTimeout(() => {
        statusGlow.style.opacity = 0;
        setTimeout(() => statusGlow.remove(), 400);
      }, 2000);
    });
  }

  // 匯出 data.js 檔案下載
  function exportDataJs() {
    // 將 window.CEREMONY_DATA 物件序列化為格式精美的 Javascript 原始碼字串
    const dataString = JSON.stringify(data, null, 2);
    
    const fileContent = `// 普新精舍 60期夜間初級禪修班——結業典禮資料庫
// 透過全局變數 window.CEREMONY_DATA 供 app.js 讀取，以確保能在本地 file:// 協議下直接雙擊運作。

window.CEREMONY_DATA = ${dataString};
`;

    // 建立 Blob 與虛擬下載節點
    const blob = new Blob([fileContent], { type: "application/javascript;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  /* --------------------------------------------------------------------------
     F. 應用程式初次載入啟動 (Bootstrapping)
     -------------------------------------------------------------------------- */
  // 實際桌次配置圖切換展開邏輯
  const toggleActualSeatBtn = document.getElementById("btn-toggle-actual-seat");
  const actualSeatImages = document.getElementById("actual-seat-images");
  if (toggleActualSeatBtn && actualSeatImages) {
    toggleActualSeatBtn.addEventListener("click", () => {
      const isHidden = actualSeatImages.style.display === "none";
      actualSeatImages.style.display = isHidden ? "block" : "none";
      toggleActualSeatBtn.querySelector(".seat-arrow").textContent = isHidden ? "▲" : "▼";
    });
  }

  // 全域同步狀態管理
  let isSyncing = false;

  async function syncRosterData(options = {}) {
    if (isSyncing) return;
    isSyncing = true;

    const { showToast = false, isManual = false } = options;

    // 獲取同步按鈕與圖示
    const syncBtn = document.getElementById("cloud-sync");
    if (syncBtn) {
      syncBtn.classList.add("spinning");
      syncBtn.disabled = true;
    }

    let statusGlow = null;
    if (showToast) {
      // 移除舊的狀態提示
      const oldGlow = document.querySelector(".sync-status-glow");
      if (oldGlow) oldGlow.remove();

      statusGlow = document.createElement("div");
      statusGlow.className = "sync-status-glow";
      statusGlow.innerHTML = `<span>⏳ 正在同步雲端班表...</span>`;
      document.body.appendChild(statusGlow);
    }

    console.log("📡 正在向飛書雲端同步最新班表...");

    let hasChanges = false;

    try {
      const response = await fetch(`/api/get-data?t=${Date.now()}`);
      const result = await response.json();
      if (result.code === 0 && result.values && result.values.length > 0) {
        console.log("📡 [Success] 順利從飛書獲取即時排班數據！");
        
        const sheetRows = result.values;
        // 表頭過濾：排除第一行如果是 "角色 ID" 或 "角色ID" 的標題行
        const dataRows = sheetRows[0] && (String(sheetRows[0][0]).includes("角色") || String(sheetRows[0][0]).includes("ID"))
          ? sheetRows.slice(1)
          : sheetRows;
          
        // 蒐集飛書上所有非預設字樣的真實姓名，用以動態擴充前端名單庫
        const sheetNames = new Set();
        const ignoreList = ["XXX", "None", "", "學長團隊", "課務團隊", "全體義工團隊", "學員代表", "12位學員長", "各組學員長", "課務長"];
        
        dataRows.forEach(row => {
          if (row && row.length >= 1) {
            const roleId = row[0] ? String(row[0]).trim() : "";
            if (!roleId) return;
            
            let assignee = "XXX";
            if (row.length >= 3 && row[2] !== null && row[2] !== undefined) {
              assignee = String(row[2]).trim() || "XXX";
            }
            
            // 拆分姓名並加進臨時 Set 中，排除忽略名單
            if (assignee && assignee !== "XXX") {
              const names = assignee.split(/[,、.\s]+/).map(n => n.trim()).filter(n => n.length > 0);
              names.forEach(name => {
                if (!ignoreList.includes(name)) {
                  sheetNames.add(name);
                }
              });
            }
            
            data.stages.forEach(stage => {
              const r = stage.roles.find(x => x.id === roleId);
              if (r) {
                if (r.assignee !== assignee) {
                  r.assignee = assignee;
                  hasChanges = true;
                }
              }
            });
          }
        });

        // 動態將新名字合併至前端的 volunteerPool 中
        if (sheetNames.size > 0) {
          const originalSize = volunteerPool.length;
          const mergedSet = new Set([...volunteerPool, ...sheetNames]);
          if (mergedSet.size !== originalSize) {
            volunteerPool = Array.from(mergedSet).sort((a, b) => a.localeCompare(b, "zh-Hant"));
            hasChanges = true; // 變更標記設為 true 以觸發 UI 重新渲染與下拉選單更新
            console.log(`👥 [Sync] 動態名單庫已自動合併飛書新姓名！名單數由 ${originalSize} 增加至 ${volunteerPool.length}。`);
          }
        }

        if (showToast && statusGlow) {
          statusGlow.className = "sync-status-glow success";
          statusGlow.innerHTML = `<span>✅ 雲端班表同步成功！</span>`;
          setTimeout(() => {
            statusGlow.style.opacity = 0;
            setTimeout(() => statusGlow.remove(), 400);
          }, 2000);
        }
      } else {
        throw new Error(result.msg || "飛書返回錯誤代碼");
      }
    } catch (e) {
      console.log("ℹ️ [Offline/Fallback] 無法從 API 取得即時數據，採用本地/現有班表：", e.message);
      if (showToast && statusGlow) {
        statusGlow.className = "sync-status-glow error";
        statusGlow.innerHTML = `<span>❌ 雲端同步失敗</span>`;
        setTimeout(() => {
          statusGlow.style.opacity = 0;
          setTimeout(() => statusGlow.remove(), 400);
        }, 2000);
      }
    } finally {
      // 僅在資料有變更或初次載入時，才執行重新渲染，避免無謂的頁面狀態重設與摺疊收合！
      const isInitialLoad = (timelineContainer.children.length === 0);
      if (hasChanges || isInitialLoad) {
        console.log("🔄 [Render] 檢測到排班異動，正在更新前端畫面元件...");
        renderTimeline();
        updateDatalist();
        renderMasterGrid();
        renderActiveMap();
        initAdminModule();
      }

      isSyncing = false;
      if (syncBtn) {
        syncBtn.classList.remove("spinning");
        syncBtn.disabled = false;
      }
    }
  }

  async function bootstrap() {
    // 1. 初次載入，連線飛書同步班表
    await syncRosterData({ showToast: false });

    // 2. 註冊手動同步按鈕事件
    const syncBtn = document.getElementById("cloud-sync");
    if (syncBtn) {
      syncBtn.addEventListener("click", () => {
        syncRosterData({ showToast: true, isManual: true });
      });
    }

    // 3. 註冊視窗焦點同步 (讓使用者一切回頁面就自動更新)
    window.addEventListener("focus", () => {
      syncRosterData({ showToast: false });
    });

    // 4. 設定每 30 秒自動背景輪詢同步
    setInterval(() => {
      syncRosterData({ showToast: false });
    }, 30000);
  }

  bootstrap();
});
