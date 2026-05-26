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
    timelineContainer.innerHTML = "";
    
    data.stages.forEach((stage, index) => {
      const card = document.createElement("div");
      card.className = `timeline-card ${index === 0 ? "active expanded" : ""}`;
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
        <div class="timeline-card-content" style="${index === 0 ? "display: block;" : ""}">
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
                    <th style="width: 20%;">派任人員</th>
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
  const clickDetailsCard = document.getElementById("map-click-details");
  
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
    // 隱藏細節面板
    clickDetailsCard.style.display = "none";
    
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

    // 註冊地圖中执事站點的點擊事件
    const spots = svgMapWrapper.querySelectorAll(".svg-officer-spot");
    spots.forEach(spot => {
      spot.addEventListener("click", () => {
        const roleId = spot.getAttribute("data-role-id");
        showRoleDetails(roleId);
        
        // 移除其他高亮，高亮此點
        spots.forEach(s => s.classList.remove("highlighted"));
        spot.classList.add("highlighted");
      });
    });

    // 如果有需要自動高亮的角色 (從時間軸或搜尋跳轉而來)
    if (activeHighlightRoleId) {
      const targetSpot = svgMapWrapper.querySelector(`.svg-officer-spot[data-role-id="${activeHighlightRoleId}"]`);
      if (targetSpot) {
        // 先移除其他高亮
        spots.forEach(s => s.classList.remove("highlighted"));
        targetSpot.classList.add("highlighted");
        
        // 延遲滾動至地圖視區，並展開詳細說明
        showRoleDetails(activeHighlightRoleId);
        
        // 讓地圖自動縮放滾動，確保能看見
        targetSpot.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    // 將地圖選擇按鈕狀態同步
    mapSelectBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-map") === currentActiveMapId);
    });
  }

  // 顯示地圖中點擊角色的工作詳情
  function showRoleDetails(roleId) {
    let matchedRole = null;
    let matchedStage = null;

    // 遍歷 stages 尋找該角色
    for (let stage of data.stages) {
      for (let role of stage.roles) {
        if (role.id === roleId) {
          matchedRole = role;
          matchedStage = stage;
          break;
        }
      }
      if (matchedRole) break;
    }

    if (matchedRole && matchedStage) {
      document.getElementById("detail-role-title").textContent = matchedStage.title;
      document.getElementById("detail-role-time").textContent = matchedStage.time;
      document.getElementById("detail-role-name").textContent = matchedRole.title;
      document.getElementById("detail-role-assignee").textContent = matchedRole.assignee;
      document.getElementById("detail-role-desc").textContent = matchedRole.desc;
      clickDetailsCard.style.display = "block";
    }
  }

  // 生成 地圖 A：結業頒證 SVG
  function generateAwardsMapSvg() {
    const stageRoles = getRolesForMap("map_awards");
    
    // 渲染西單 1-6 組、東單 7-12 組座椅
    let chairsHtml = "";
    
    // 西單 (1-6)
    for (let i = 1; i <= 6; i++) {
      const y = 160 + (i - 1) * 45;
      chairsHtml += `
        <rect class="svg-chair" x="320" y="${y}" width="80" height="24" rx="4" />
        <text class="svg-chair-label" x="360" y="${y + 15}">第 ${i} 組</text>
      `;
    }
    
    // 東單 (7-12)
    for (let i = 7; i <= 12; i++) {
      const y = 160 + (i - 7) * 45;
      chairsHtml += `
        <rect class="svg-chair" x="500" y="${y}" width="80" height="24" rx="4" />
        <text class="svg-chair-label" x="540" y="${y + 15}">第 ${i} 組</text>
      `;
    }

    // 生成執事站點 (根據 positions 定位)
    let spotsHtml = "";
    stageRoles.forEach(roleObj => {
      const pos = roleObj.position;
      if (pos) {
        spotsHtml += `
          <g class="svg-officer-spot" data-role-id="${roleObj.role.id}">
            <circle class="svg-officer-circle" cx="${pos.x}" cy="${pos.y}" r="11" />
            <text class="svg-officer-label" x="${pos.x}" y="${pos.y}">執</text>
            <text class="svg-chair-label" x="${pos.x}" y="${pos.y + 24}" style="fill: var(--color-gold); font-weight: 500;">${pos.label}</text>
          </g>
        `;
      }
    });

    return `
      <svg class="svg-element" viewBox="0 0 900 500" width="100%" height="100%">
        <!-- 講堂背景外牆 -->
        <rect class="svg-hall-bg" x="0" y="0" width="900" height="500" />
        <rect class="svg-wall" x="50" y="40" width="800" height="420" rx="12" />
        
        <!-- 前門/後門標示 -->
        <rect x="50" y="240" width="3" height="50" fill="var(--bg-secondary)" />
        <text x="35" y="270" class="svg-chair-label" style="transform: rotate(-90deg); transform-origin: 35px 270px;">西單前門</text>
        
        <rect x="847" y="240" width="3" height="50" fill="var(--bg-secondary)" />
        <text x="865" y="270" class="svg-chair-label" style="transform: rotate(90deg); transform-origin: 865px 270px;">講堂後門</text>
        
        <!-- 舞台與講桌 -->
        <rect class="svg-stage" x="200" y="40" width="500" height="85" />
        <text x="450" y="65" class="svg-label-text" style="font-size: 16px;">台 上 佛 前</text>
        
        <rect class="svg-lectern" x="420" y="85" width="60" height="25" rx="3" fill="#b8860b" stroke="var(--color-gold)" />
        <text x="450" y="102" class="svg-officer-label" style="fill: white; font-size: 10px;">住持講桌</text>
        
        <rect class="svg-chair" x="570" y="85" width="70" height="25" rx="3" />
        <text x="605" y="101" class="svg-chair-label">證書長條桌</text>

        <!-- 法師座位 (5位) -->
        <circle cx="300" cy="95" r="8" class="svg-chair" />
        <circle cx="330" cy="95" r="8" class="svg-chair" />
        <circle cx="360" cy="95" r="8" class="svg-chair" />
        <circle cx="390" cy="95" r="8" class="svg-chair" />
        <circle cx="510" cy="95" r="8" class="svg-chair" />
        
        <!-- 中央走道 -->
        <line x1="450" y1="125" x2="450" y2="460" stroke="var(--border-color)" stroke-dasharray="4,4" stroke-width="2" />
        <text x="450" y="280" class="svg-label-text" style="font-size: 13px;">中 央 走 道</text>
        
        <!-- 東西單標記 -->
        <text x="250" y="280" class="svg-label-text" style="font-size: 24px; opacity: 0.15;">西 單 (West)</text>
        <text x="650" y="280" class="svg-label-text" style="font-size: 24px; opacity: 0.15;">東 單 (East)</text>

        <!-- 座椅區 -->
        ${chairsHtml}

        <!-- 執事站點 -->
        ${spotsHtml}
      </svg>
    `;
  }

  // 生成 地圖 B：傳燈與發願 SVG
  function generateLampsMapSvg() {
    const stageRoles = getRolesForMap("map_lamps");

    // 繪製基本講堂輪廓
    let baseHtml = "";
    
    // 西單 (1-6) 與 東單 (7-12) 座椅
    for (let i = 1; i <= 6; i++) {
      const y = 160 + (i - 1) * 45;
      baseHtml += `<rect class="svg-chair" x="320" y="${y}" width="80" height="24" rx="4" style="opacity: 0.4;" />`;
    }
    for (let i = 7; i <= 12; i++) {
      const y = 160 + (i - 7) * 45;
      baseHtml += `<rect class="svg-chair" x="500" y="${y}" width="80" height="24" rx="4" style="opacity: 0.4;" />`;
    }

    // 繪製學員長「佛前排班」捧燈的圓弧小圓點 (12位，中央留空)
    let choirHtml = "";
    const arcPoints = [
      { x: 300, y: 135 }, { x: 325, y: 138 }, { x: 350, y: 140 },
      { x: 375, y: 142 }, { x: 400, y: 144 }, { x: 420, y: 145 }, // 左6位
      { x: 480, y: 145 }, { x: 500, y: 144 }, { x: 525, y: 142 },
      { x: 550, y: 140 }, { x: 575, y: 138 }, { x: 600, y: 135 }  // 右6位
    ];
    arcPoints.forEach((pt, i) => {
      choirHtml += `
        <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="var(--color-gold)" style="filter: drop-shadow(0 0 4px var(--color-gold));" />
        <circle cx="${pt.x}" cy="${pt.y}" r="2" fill="white" />
      `;
    });
    
    // 繪製移壇動線：中央通道至講堂後方的亮金色箭頭
    const arrowPath = `
      <path d="M 450,140 L 450,440" fill="none" stroke="var(--color-gold)" stroke-width="3" stroke-dasharray="6,6" style="opacity: 0.8;" />
      <!-- 左右移壇二路 -->
      <path d="M 360,145 L 360,125 L 450,125" fill="none" stroke="var(--color-gold)" stroke-width="2" stroke-dasharray="4,4" />
      <path d="M 540,145 L 540,125 L 450,125" fill="none" stroke="var(--color-gold)" stroke-width="2" stroke-dasharray="4,4" />
      <!-- 箭頭 -->
      <polygon points="450,445 444,435 456,435" fill="var(--color-gold)" />
    `;

    // 執事站點定位
    let spotsHtml = "";
    stageRoles.forEach(roleObj => {
      const pos = roleObj.position;
      if (pos) {
        spotsHtml += `
          <g class="svg-officer-spot" data-role-id="${roleObj.role.id}">
            <circle class="svg-officer-circle" cx="${pos.x}" cy="${pos.y}" r="11" />
            <text class="svg-officer-label" x="${pos.x}" y="${pos.y}">執</text>
            <text class="svg-chair-label" x="${pos.x}" y="${pos.y + 24}" style="fill: var(--color-gold); font-weight: 500;">${pos.label}</text>
          </g>
        `;
      }
    });

    return `
      <svg class="svg-element" viewBox="0 0 900 500" width="100%" height="100%">
        <!-- 講堂輪廓 -->
        <rect class="svg-hall-bg" x="0" y="0" width="900" height="500" />
        <rect class="svg-wall" x="50" y="40" width="800" height="420" rx="12" />
        
        <!-- 舞台與講桌 -->
        <rect class="svg-stage" x="200" y="40" width="500" height="85" />
        <rect class="svg-lectern" x="420" y="85" width="60" height="25" rx="3" fill="#b8860b" stroke="var(--color-gold)" />
        <text x="450" y="102" class="svg-officer-label" style="fill: white; font-size: 10px;">主法法師</text>
        
        <!-- 講桌旁經架示意 -->
        <rect x="380" y="88" width="15" height="15" fill="var(--bg-tertiary)" stroke="var(--border-color)" />
        <text x="388" y="99" class="svg-chair-label" style="font-size: 8px;">架</text>
        
        <rect x="500" y="88" width="15" height="15" fill="var(--bg-tertiary)" stroke="var(--border-color)" />
        <text x="508" y="99" class="svg-chair-label" style="font-size: 8px;">架</text>
        
        <text x="450" y="65" class="svg-label-text" style="font-size: 15px;">傳燈與發願</text>

        <!-- 基本骨架 -->
        ${baseHtml}
        
        <!-- 移壇動線 -->
        ${arrowPath}
        <text x="495" y="420" class="svg-chair-label" style="fill: var(--color-gold); font-weight: bold;">二路移壇往禪堂</text>
        
        <!-- 捧燈唱誦弧線 -->
        ${choirHtml}
        <text x="450" y="165" class="svg-chair-label" style="fill: var(--color-gold); font-size: 10px; font-weight: 500;">學員長佛前捧燈 (中留空位)</text>

        <!-- 執事站位 -->
        ${spotsHtml}
      </svg>
    `;
  }

  // 生成 地圖 C：供燈與供僧 SVG
  function generateOfferingMapSvg() {
    const stageRoles = getRolesForMap("map_offering");

    // 繪製禪堂骨架 (中式大殿柱子與佛龕)
    // 圓柱 4 根
    const pillars = [
      { x: 260, y: 220 }, { x: 640, y: 220 },
      { x: 260, y: 440 }, { x: 640, y: 440 }
    ];
    let pillarsHtml = "";
    pillars.forEach(p => {
      pillarsHtml += `
        <circle cx="${p.x}" cy="${p.y}" r="15" fill="var(--bg-secondary)" stroke="var(--border-color)" stroke-width="2" />
        <circle cx="${p.x}" cy="${p.y}" r="6" fill="var(--border-color)" />
      `;
    });

    // 摩尼寶珠燈板 144 盞小圓點矩陣 (向量繪製同心圓排布)
    let maniLampsHtml = "";
    const outerRadius = 70;
    const innerRadius = 35;
    const cx = 450, cy = 250;
    
    // 外圈 108 盞 (在圖上精簡表示為 18 個發光點)
    for (let i = 0; i < 18; i++) {
      const angle = (i * 2 * Math.PI) / 18;
      const lx = cx + outerRadius * Math.cos(angle);
      const ly = cy + outerRadius * Math.sin(angle);
      maniLampsHtml += `<circle cx="${lx}" cy="${ly}" r="4" fill="var(--color-gold)" style="filter: drop-shadow(0 0 3px var(--color-gold));" />`;
    }
    // 內圈 36 盞 (在圖上精簡表示為 8 個發光點)
    for (let i = 0; i < 8; i++) {
      const angle = (i * 2 * Math.PI) / 8 + Math.PI/8;
      const lx = cx + innerRadius * Math.cos(angle);
      const ly = cy + innerRadius * Math.sin(angle);
      maniLampsHtml += `<circle cx="${lx}" cy="${ly}" r="4" fill="var(--color-gold)" style="filter: drop-shadow(0 0 3px var(--color-gold));" />`;
    }
    // 中心一顆摩尼寶珠
    maniLampsHtml += `
      <circle cx="${cx}" cy="${cy}" r="10" fill="var(--color-gold)" style="filter: drop-shadow(0 0 8px var(--color-gold));" />
      <polygon points="${cx},${cy-7} ${cx-5},${cy+3} ${cx+5},${cy+3}" fill="white" />
    `;

    // 供養水晶紅包盤
    const plates = [
      { x: 380, y: 160 }, { x: 405, y: 160 }, // 西側 2 個
      { x: 495, y: 160 }, { x: 520, y: 160 }  // 東側 2 個
    ];
    let platesHtml = "";
    plates.forEach(p => {
      platesHtml += `
        <circle cx="${p.x}" cy="${p.y}" r="8" fill="#e0f2f1" stroke="var(--color-gold)" stroke-width="1.5" />
        <rect x="${p.x - 4}" y="${p.y - 4}" width="8" height="8" rx="1" fill="#dc3545" />
      `;
    });

    // 學員供奉路線 (東進西出 O 型環線)
    const flowPath = `
      <path d="M 640,460 L 640,240 A 190,190 0 0,0 260,240 L 260,460" fill="none" stroke="var(--color-gold)" stroke-width="2" stroke-dasharray="4,4" />
      <!-- 進場箭頭 (東側進) -->
      <polygon points="640,300 635,310 645,310" fill="var(--color-gold)" style="transform: rotate(180deg); transform-origin: 640px 300px;" />
      <!-- 離場箭頭 (西側出) -->
      <polygon points="260,350 255,360 265,360" fill="var(--color-gold)" />
    `;

    // 執事站點定位
    let spotsHtml = "";
    stageRoles.forEach(roleObj => {
      const pos = roleObj.position;
      if (pos) {
        spotsHtml += `
          <g class="svg-officer-spot" data-role-id="${roleObj.role.id}">
            <circle class="svg-officer-circle" cx="${pos.x}" cy="${pos.y}" r="11" />
            <text class="svg-officer-label" x="${pos.x}" y="${pos.y}">執</text>
            <text class="svg-chair-label" x="${pos.x}" y="${pos.y + 24}" style="fill: var(--color-gold); font-weight: 500;">${pos.label}</text>
          </g>
        `;
      }
    });

    return `
      <svg class="svg-element" viewBox="0 0 900 600" width="100%" height="100%">
        <!-- 禪堂背景外牆 -->
        <rect class="svg-hall-bg" x="0" y="0" width="900" height="600" />
        <rect class="svg-wall" x="120" y="40" width="660" height="520" rx="12" />
        
        <!-- 禪堂後方/前門標示 -->
        <text x="450" y="540" class="svg-chair-label" style="font-size: 12px;">禪 堂 後 方 (大門入口)</text>

        <!-- 佛龕 Altar -->
        <rect class="svg-stage" x="330" y="40" width="240" height="65" rx="4" />
        <text x="450" y="70" class="svg-label-text" style="font-size: 16px; font-weight: bold; fill: var(--color-gold);">大雄寶殿 佛龕</text>

        <!-- 住持師父座椅 (獅子座) -->
        <rect class="svg-lectern" x="425" y="115" width="50" height="35" rx="4" fill="#8b0000" stroke="var(--color-gold)" stroke-width="1.5" />
        <circle cx="450" cy="132" r="10" fill="var(--color-gold)" style="opacity: 0.15;" />
        <text x="450" y="136" class="svg-officer-label" style="fill: var(--color-gold); font-size: 9px; font-weight: bold;">住持座椅</text>

        <!-- 大眾法師座椅 (左右各 2-3 把靠背椅) -->
        <rect class="svg-chair" x="350" y="120" width="24" height="24" rx="2" />
        <text x="362" y="135" class="svg-chair-label" style="font-size: 8px;">師</text>
        <rect class="svg-chair" x="380" y="120" width="24" height="24" rx="2" />
        <text x="392" y="135" class="svg-chair-label" style="font-size: 8px;">師</text>
        
        <rect class="svg-chair" x="496" y="120" width="24" height="24" rx="2" />
        <text x="508" y="135" class="svg-chair-label" style="font-size: 8px;">師</text>
        <rect class="svg-chair" x="526" y="120" width="24" height="24" rx="2" />
        <text x="538" y="135" class="svg-chair-label" style="font-size: 8px;">師</text>

        <!-- 摩尼寶珠板 -->
        <circle cx="450" cy="250" r="100" fill="rgba(212, 175, 55, 0.03)" stroke="var(--border-color)" stroke-width="1" />
        <text x="450" y="365" class="svg-chair-label" style="fill: var(--color-gold); font-weight: bold; font-size: 11px;">摩尼寶珠燈板 (144盞心燈)</text>
        ${maniLampsHtml}

        <!-- 水晶紅包盤 -->
        ${platesHtml}
        <text x="450" y="180" class="svg-chair-label" style="font-size: 9px;">紅包獻供水晶盤</text>

        <!-- 禪堂大圓柱 -->
        ${pillarsHtml}

        <!-- 移壇供奉動線 -->
        ${flowPath}
        <text x="690" y="360" class="svg-chair-label" style="fill: var(--color-gold); font-weight: bold; transform: rotate(90deg); transform-origin: 690px 360px;">學員東單進場</text>
        <text x="210" y="360" class="svg-chair-label" style="fill: var(--color-gold); font-weight: bold; transform: rotate(-90deg); transform-origin: 210px 360px;">供畢西單歸位</text>

        <!-- 執事站位 -->
        ${spotsHtml}
      </svg>
    `;
  }

  // 獲取與特定地圖關聯的所有角色與位置資訊
  function getRolesForMap(mapId) {
    const rolesList = [];
    data.stages.forEach(stage => {
      if (stage.mapId === mapId) {
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
     E. 執事排班編輯器模組 (Admin & Duty Allocator Module)
     -------------------------------------------------------------------------- */
  const volunteerPoolInput = document.getElementById("admin-volunteer-pool");
  const applyPoolBtn = document.getElementById("btn-admin-apply-pool");
  const exportBtn = document.getElementById("btn-admin-export");
  const resetBtn = document.getElementById("btn-admin-reset");
  const editorStagesContainer = document.getElementById("editor-stages-container");

  // 初始化 Admin 模組
  function initAdminModule() {
    // 1. 初始化名單庫文字
    volunteerPoolInput.value = volunteerPool.join("\n");
    
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

    renderEditorList();
  }

  // 渲染右側執事排班表編輯清單
  function renderEditorList() {
    editorStagesContainer.innerHTML = "";

    data.stages.forEach(stage => {
      const stageItem = document.createElement("div");
      stageItem.className = "editor-stage-item";
      
      let rolesFormHtml = "";
      stage.roles.forEach(role => {
        // 生成下拉選單選項
        let selectOptionsHtml = `<option value="XXX" ${role.assignee === "XXX" ? "selected" : ""}>XXX (空缺)</option>`;
        
        // 確保目前指派的人名，即使不在 volunteerPool 中也能顯示在下拉選單裡
        const currentAssignees = role.assignee.split(/[,、.\s]/).map(n => n.trim());
        const combinedPool = Array.from(new Set([...volunteerPool, ...currentAssignees]));

        combinedPool.forEach(name => {
          if (name && name !== "XXX") {
            // 如果 role.assignee 是多個名字 (e.g. "義工A, 義工B")，我們只要 assignee 內包含它就先選中是不對的。
            // 這裡如果是單選下拉選單，只要 assignee === name 就選中；否則，我們也提供直接 text input 修改以利多人排班！
            const isSelected = role.assignee === name;
            selectOptionsHtml += `<option value="${name}" ${isSelected ? "selected" : ""}>${name}</option>`;
          }
        });

        rolesFormHtml += `
          <div class="editor-role-row">
            <span class="editor-role-label">${role.title}</span>
            <select class="admin-role-select" data-stage-id="${stage.id}" data-role-id="${role.id}">
              ${selectOptionsHtml}
              <option value="CUSTOM">✍️ 手動輸入/多人分工...</option>
            </select>
            <input type="text" class="admin-role-input" data-stage-id="${stage.id}" data-role-id="${role.id}" value="${role.assignee}" placeholder="指派人員名字..." />
          </div>
          <div class="editor-role-desc" style="margin-left: 160px; margin-bottom: 8px;">
            ${role.desc}
          </div>
        `;
      });

      stageItem.innerHTML = `
        <div class="editor-stage-title-time">
          <h4>${stage.title}</h4>
          <span class="badge">${stage.time}</span>
        </div>
        <div class="editor-roles-grid">
          ${rolesFormHtml}
        </div>
      `;

      // 事件綁定：監聽下拉選單與輸入框變化，即時同步至 in-memory data
      stageItem.querySelectorAll(".admin-role-select").forEach(select => {
        const stageId = select.getAttribute("data-stage-id");
        const roleId = select.getAttribute("data-role-id");
        const textInput = stageItem.querySelector(`.admin-role-input[data-stage-id="${stageId}"][data-role-id="${roleId}"]`);

        select.addEventListener("change", () => {
          const val = select.value;
          if (val === "CUSTOM") {
            textInput.style.display = "block";
            textInput.focus();
          } else {
            textInput.value = val;
            updateAssigneeInMemory(stageId, roleId, val);
          }
        });
      });

      stageItem.querySelectorAll(".admin-role-input").forEach(input => {
        const stageId = input.getAttribute("data-stage-id");
        const roleId = input.getAttribute("data-role-id");
        const select = stageItem.querySelector(`.admin-role-select[data-stage-id="${stageId}"][data-role-id="${roleId}"]`);

        input.addEventListener("input", () => {
          const val = input.value.trim();
          
          // 如果輸入的值在下拉選單中有對應，就同步下拉選單；否則下拉選單選「手動輸入」
          const hasOption = Array.from(select.options).some(opt => opt.value === val);
          if (hasOption) {
            select.value = val;
          } else {
            select.value = "CUSTOM";
          }
          
          updateAssigneeInMemory(stageId, roleId, val);
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
        
        // 即時重新渲染前台時間軸與搜尋，確保連動同步！
        renderTimeline();
        updateDatalist();
      }
    }
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
  function bootstrap() {
    renderTimeline();
    updateDatalist();
    renderActiveMap();
    initAdminModule();
  }

  bootstrap();
});
