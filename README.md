# 普新精舍 60期夜間初級禪修班——結業典禮互動式執事與流程手冊 ☸

本專案是一個為 **普新精舍 60期夜間初級禪修班結業典禮** 量身打造的**響應式單頁網頁應用程式 (SPA)**。它將原本龐雜、難以在手機上閱讀的 Excel 流程表與分散的 PDF 站位地圖，完美整合進一個精緻、流暢且具有「現代禪風」美學的網頁中，大眾與執事義工只需透過手機即可輕鬆掌握法會細節。

---

## 🌟 核心特色功能

1. **⏱️ 互動式典禮時間軸 (Ceremony Timeline)**
   - 專為**夜間禪修班（18:30 - 21:30）**優化的流暢時間軸。
   - 摺疊式卡片設計，點擊可快速查看各階段的「說明」、「注意事項」及「執事人員分工表」。
   
2. **🔍 智能個人執事查詢 (My Duties Lookup)**
   - 輸入名字或下拉選取，即可生成客製化「個人專屬執事卡」。
   - 精確匯總該義工在典禮中的所有職務、時間段與執掌內容，並支援**一鍵地圖定位**。

3. **🗺️ 響應式 SVG 互動站位地圖 (Interactive SVG Maps)**
   - **地圖 A：結業頒證** —— 清淨講堂平面圖，標示 1-12 組座椅與頒獎各執事位置。
   - **地圖 B：傳燈發願** —— 傳燈儀式學員長捧燈「佛前排班」弧形站位與移壇路線。
   - **地圖 C：供燈供僧** —— 禪堂平面圖，精緻繪製 **108 盞摩尼寶珠心燈**排列矩陣與供奉動線。
   - **雙向連動**：點擊地圖圓點顯示職掌；點擊職掌高亮地圖，搜尋名字時站位點會以**金色呼吸燈**閃爍。

4. **🎵 音訊播放與梵唄歌曲練習 (Ceremony Media)**
   - 完整收錄《獻給導師》與改編自甜蜜蜜的《結業頒證～在哪裡》優美歌詞。
   - 整合 `獻給導師2025.m4a` 實錄音檔，內建高雅播放器，方便用手機隨時練習對位。

5. **✏️ 互動排班編輯器與一鍵匯出 (Admin Allocator)**
   - 提供直覺的後台排班編輯介面。您可以貼上義工名單庫，透過下拉選單或手動輸入快速為 `XXX` 職缺指派名字。
   - 排班會即時更新至前台流程與地圖；排定完畢後一鍵點擊**「匯出並下載 data.js」**，覆蓋本地檔案即可完成資料庫更新。

---

## 📂 專案結構

```
closing-ceremony-helper/
│
├── index.html          # 網頁骨架結構與單頁 SPA 頁面
├── style.css           # 現代禪風 Vanilla CSS (含深/淺雙色主題、毛玻璃、呼吸燈動畫)
├── data.js             # 典禮流程與執事名單資料庫 (全域 window.CEREMONY_DATA)
├── app.js              # 控制邏輯 (地圖渲染、個人搜尋、排班編輯、音訊播放)
├── 獻給導師2025.m4a    # 現場傳燈梵唄音檔
└── README.md           # 本說明文件
```

---

## 💻 本地如何運行與測試

本網頁採用極度相容的純前端架構，**不需要任何本機伺服器、編譯或安裝依賴**：
- 直接**雙擊 `index.html`** 檔案，即可在您電腦上的任意瀏覽器中流暢開啟！
- 透過 `file://` 協議開啟依然完全支援 offline 離線使用與所有互動功能（包含音訊播放與資料匯出）。

---

## 🚀 如何推送至 GitHub 並使用 Vercel 免費發布

您希望將此網頁部署於 **Vercel** 上，讓大家能透過手機網址（如：`https://your-name.vercel.app`）直接開啟。請依照以下極簡步驟操作：

### 第一步：在 GitHub 上建立新倉庫
1. 登入您的 [GitHub](https://github.com/) 帳號。
2. 點擊右上角的 **「New」** 建立新倉庫（Repository）。
3. 命名為 `closing-ceremony-helper`，選擇為 **Public**（公開），且**不要**勾選 "Add a README.md" 或 ".gitignore"（因為本專案已經有寫好這兩個檔案了），然後點擊 **「Create repository」**。

### 第二步：使用終端機將程式推送至 GitHub
打開 Mac 的 **終端機 (Terminal)**，進入本專案資料夾路徑，並依序執行以下指令：

```bash
# 1. 確保目前在專案根目錄 closing-ceremony-helper 中
cd "/Users/randy/Library/CloudStorage/GoogleDrive-randy.tsay@gmail.com/我的雲端硬碟/05 普新精舍/60期夜初班/結業典禮/closing-ceremony-helper"

# 2. 追蹤所有網頁檔案
git add .

# 3. 提交本地變更
git commit -m "feat: init elegant meditation closing ceremony helper web app"

# 4. 關聯至您的 GitHub 遠端倉庫 (請將下方的連結替換為 GitHub 給您的網址)
git remote add origin https://github.com/Randytsay/closing-ceremony-helper.git

# 5. 推送至 GitHub 主分支
git push -u origin main
```

### 第三步：在 Vercel 導入並秒級發布
1. 進入 [Vercel 官網](https://vercel.com/)，註冊/登入（建議直接點選 "Continue with GitHub" 關聯）。
2. 在 Vercel 控制台點擊 **「Add New...」** ➡ **「Project」**。
3. 在 Git 列表中找到剛才推送的 `closing-ceremony-helper` 倉庫，點擊 **「Import」**。
4. 在 Configuration 頁面**完全不需要做任何修改 (Zero Config)**，直接點選下方藍色的 **「Deploy」** 按鈕。
5. 等待約 15-30 秒，看到慶祝拉炮動畫，您的專屬網址即生成完畢！大眾隨即可透過此網址在手機上隨開即用。

---

## 🔄 日常排班更新流程

當您需要調整或更新執事姓名時，操作極其輕鬆：
1. 用手機或電腦打開網頁，切換到 **「執事分配」** (Admin) 分頁。
2. 直接點擊對應職缺的下拉選單指派義工姓名，或在輸入框中手動修改/分工。
3. 調整完成後，點擊**「匯出並下載 data.js」**，下載新的 `data.js` 檔案。
4. 將新下載的 <code>data.js</code> **拖曳覆蓋**本機專案資料夾中舊的 <code>data.js</code>。
5. 在終端機執行推送命令：
   ```bash
   git add data.js
   git commit -m "chore: update duty assignments"
   git push
   ```
6. **Vercel 將在 10 秒內自動偵測並重新部署發布**！大眾只要重新整理網頁，即可看到最新、最精準的執事名單。

---
祝願法會圓滿順利，法輪常轉，大眾精進菩提！ 阿彌陀佛 ☸
