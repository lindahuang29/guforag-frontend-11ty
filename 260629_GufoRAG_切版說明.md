# GufoRAG 切版說明文件 [2026/06/29]

**專案名稱**：GufoRAG — 後台介面前端切版
**文件日期**：2026-06-29
**文件對象**：工程師
**本次提供功能**：儀表板頁面

---

## 1. 專案概述與使用技術

### 1-1. 專案簡介

本專案為 GufoRAG 後台介面之前端靜態切版。

### 1-2. 技術棧

| 項目 | 內容 |
|---|---|
| 靜態網站產生器 | Eleventy `^2.0.1` |
| 樣式 | Sass（Dart Sass `^1.69.0`），SCSS 語法 |
| 模板引擎 | Nunjucks（`.html` 以 njk 解析） |
| JavaScript | 原生 DOM API，無框架、無套件 |
| Node.js | 18 以上 |

>  本專案的 SCSS 由 Eleventy 在建置事件中編譯，CSS 會輸出到 `dist/css/main.css`。

---

## 2. 快速開始

需要 Node.js 18+。

```bash
# 第一次
npm install

# 日常開發：即時預覽（含 SCSS 編譯、存檔自動整頁重載）
npm run dev      # → http://localhost:8090

# 產出純靜態交付物到 dist/（雙擊即可開）
npm run build
```

| 指令 | 說明 |
|---|---|
| `npm run dev` | 啟動 Eleventy dev server，port **8090**，監看所有 `.scss` 與模板，存檔自動重編並整頁重載 |
| `npm run build` | 一次性建置，輸出到 `dist/` |

> `dist/` 與 `node_modules/` 已列入 `.gitignore`，是建置產物，**不可手動編輯**。

---

## 3. 專案結構

### 3-1. 資料夾架構

```
GufoRAG/
├── eleventy.config.js          ← Eleventy 設定（SCSS 編譯、JS passthrough、dev server）
├── package.json                ← 指令與相依
├── README.md                   ← 專案理念與上手
├── GUIDELINE.md                ← 切版規範（鐵則）
├── 260629_GufoRAG_切版說明.md   ← 本文件
│
├── src/                        ← 所有原始碼（Eleventy 的 input）
│   ├── 1-1_homepage.html       ← 頁面：選 layout + 組合元件 + 頁面資料
│   │
│   ├── _includes/              ← 可被 include 的東西（不會單獨輸出成頁面）
│   │   ├── layouts/            ←   整頁模板（只放模板，不放元件）
│   │   │   ├── base.html       ←     <head> + 全頁外框 + footer + script 清單
│   │   │   ├── page-shell.html ←     一般頁外殼：header + <main> 容器
│   │   │   └── _layout.scss    ←     骨架樣式（.full-wrap / .main）
│   │   │
│   │   ├── components/         ←   大元件：會用到其他元件，或是某大元件的專屬子片段
│   │   └── ui/                 ←   小元件：不依賴任何其他元件的積木
│   │
│   ├── scss/                   ← 全域樣式
│   │   ├── _var.scss           ←   顏色變數（三層 design tokens）
│   │   ├── _mixin.scss         ←   scrollbar 等 mixin
│   │   ├── _base.scss          ←   html/body/標籤預設
│   │   ├── _utilities.scss     ←   工具 class（flex / gap / col / text-*）
│   │   └── main.scss           ←   只放 @use 組裝清單（編譯入口）
│   │
│   └── images/                 ← 圖片與 icon（passthrough 原樣複製到 dist/images）
│
└── dist/                       ← build 輸出（gitignore，勿手改）
    ├── 1-1_homepage.html
    ├── css/main.css
    ├── js/*.js
    └── images/
```

### 3-2. 頁面清單

| 頁面                                             | 輸出                     | 說明       |
| ------------------------------------------------ | ------------------------ | ---------- |
| [`src/1-1_homepage.html`](src/1-1_homepage.html) | `dist/1-1_homepage.html` | 儀表板首頁 |

---

## 4. 建置流程（Eleventy + SCSS）

所有建置邏輯集中在 [`eleventy.config.js`](eleventy.config.js)。它做四件事：

**1. 靜態資源 passthrough**

```js
eleventyConfig.addPassthroughCopy({ "src/images": "images" });
```

`src/images/` 原樣複製到 `dist/images/`。

**2. 元件 JS passthrough**

每個元件的 JS 各複製成 `dist/js/<元件>.js`：

```js
eleventyConfig.addPassthroughCopy({
  "src/_includes/components/pagination/pagination.js": "js/pagination.js",
  "src/_includes/ui/tabs/tabs.js": "js/tabs.js",
  "src/_includes/components/dashboard-table/dashboard-table.js": "js/dashboard-table.js",
  "src/_includes/components/mobile-nav/mobile-nav.js": "js/mobile-nav.js",
});
```

> **新增有 JS 的元件時，要在這裡加一行**（並在 `base.html` 加 `<script>`）。

**3. SCSS 編譯**

```js
eleventyConfig.on("eleventy.before", () => {
  const result = sass.compile("src/scss/main.scss", {
    loadPaths: ["src/scss", "node_modules"],
    style: "expanded",
  });
  fs.writeFileSync("dist/css/main.css", result.css);
});
eleventyConfig.addWatchTarget("src/**/*.scss");
```

- 入口是 `src/scss/main.scss`，輸出 `dist/css/main.css`（對應 `base.html` 的 `<link>`）。
- 每次建置（含 watch 重建）都重編譯。
- `addWatchTarget("src/**/*.scss")` 讓**任一 partial 變更**（含元件 scss）都觸發重建、重編、瀏覽器自動重整。

**4. Dev server：整頁重載**

```js
eleventyConfig.setServerOptions({ domDiff: false });
```

預設 Eleventy 是局部 DOM 更新，但靠 JS 生成的內容（pagination 頁碼等）會在局部更新後消失。關掉 `domDiff` 讓每次存檔都重跑元件 JS。**僅開發用，不影響 build 產出。**

**5. 目錄與模板引擎設定**

```js
return {
  dir: { input: "src", includes: "_includes", output: "dist" },
  htmlTemplateEngine: "njk",      // .html 用 Nunjucks 解析
  markdownTemplateEngine: "njk",
  templateFormats: ["html", "njk", "md"],
};
```

---

## 5. 元件說明

### 5-1. Layouts

#### `layouts/base.html` — 全頁外框

| 項目 | 內容 |
|---|---|
| **用途** | 提供 `<html>`/`<head>`、`.full-wrap` 外框、footer、全站 script 清單。所有頁面最終都被它包住。 |
| **結構** | `<head>`（title、favicon、`css/main.css`）→ `<body><div class="full-wrap">{{ content }}{% include footer %}</div>` → script 清單 |
| **參數** | `title`（由頁面 front matter 傳入）、`content`（Eleventy 注入的頁面內容） |
| **注意** | **新增元件 JS 時，要在這裡的 `<script defer>` 清單加一行。** |

#### `layouts/page-shell.html` — 一般頁外殼

| 項目 | 內容 |
|---|---|
| **用途** | 一般頁面的外殼：自動帶入 header，並把頁面內容包進 `<main class="main">`。 |
| **結構** | `layout: layouts/base.html` → `{% include header %}` + `<main>{{ content }}</main>` |
| **使用** | 頁面 front matter 設 `layout: layouts/page-shell.html` 即可。 |

#### `layouts/_layout.scss` — 骨架樣式

定義 `.full-wrap`（flex column、`min-height:100vh`，撐滿視窗讓 footer 沉底）與 `.main`（`padding:24px`、深色背景 `--color-bg-darker`）。

---

### 5-2. UI 小元件

#### `ui/button` — 按鈕（純樣式）

| 項目 | 內容 |
|---|---|
| **用途** | 各種動作按鈕，可用於 `<button>` 或 `<a>`。 |
| **結構** | `<button class="button button-primary">文字</button>`；含 icon 時內放 `<img class="icon">`，padding 自動微調（`&:has(.icon)`）。 |
| **變體** | `.button-primary`、`.button-secondary-border`（外框式）、`.button-gray`、`.button-green`、`.button-brown`、`.button-red`。基底 `.button` 必加。 |
| **狀態** | Default / Hover（顏色加深）/ Disabled（`.disabled` 或 `:disabled`，`opacity:.6`、`not-allowed`）。 |
| **注意** | 基底 `.button` 提供排版，變體只給顏色，兩者要一起加。 |

#### `ui/default-table` — 表格基底（純樣式）

| 項目 | 內容 |
|---|---|
| **用途** | 全站表格的基底樣式；其他表格（dashboard-table、歷史紀錄）都以它為基底再擴充。 |
| **結構** | `<div class="scrollTable"><table class="default-table">…</table></div>`。外層 `.scrollTable` 提供橫向捲動與細捲軸。 |
| **樣式** | `table-layout:fixed`、`border-collapse`；`thead` 深色底；`tbody tr` 底線分隔。 |
| **注意** | 寬表格用 inline `style="min-width:..."` 搭配 `.scrollTable` 達成橫捲。 |

#### `ui/form-group` — 表單欄位（純樣式）

| 項目 | 內容 |
|---|---|
| **用途** | label + 輸入控制項的水平排版，支援 `<input>`/`<select>`/`<textarea>`。 |
| **結構** | `.form-group > (.label .control-label) + .field > .form-control`。 |
| **變體** | `.label-auto`（label 寬度自適應，預設 130px）；`textarea.form-control`（固定高+細捲軸）；`select.form-control`（自訂下拉箭頭 icon）。 |
| **狀態** | Default / Focus（藍框+陰影）/ Error（`.error` 紅框+陰影）/ Disabled（灰底）/ select placeholder（選空值 option 時文字轉灰，`:has(option[value=""]:checked)`）。 |
| **注意** | pagination 內的「每頁筆數」下拉即用簡化版 `.form-group > .field > select.form-control`。 |

#### `ui/stat-card` — 統計卡（純樣式）

| 項目 | 內容 |
|---|---|
| **用途** | 顯示一個數字 + 標籤的統計卡（儀表板用）。 |
| **結構** | `<div class="stat-card success"><span class="num">1</span><span class="label">Completed</span></div>`。 |
| **變體** | `.success` / `.warning` / `.info` / `.danger`（決定文字與外框色，邊框用 `currentColor`）。 |
| **注意** | 顏色用 `color` 帶動 border（`border-color: currentColor`）。手機（≤766px）字級與間距縮小。 |

#### `ui/status` — 狀態標籤（純樣式）

| 項目 | 內容 |
|---|---|
| **用途** | 圓點 + 文字的狀態指示。 |
| **結構** | `<span class="status success"><span class="dot"></span>completed</span>`。 |
| **變體** | `.success` / `.warning` / `.info` / `.danger`（決定文字色，圓點用 `currentColor`）。底色固定 `--status-bg-default`。 |

#### `ui/tag` — 標籤（HTML + 樣式）

| 項目 | 內容 |
|---|---|
| **用途** | 膠囊形標籤，圓點 + 文字。 |
| **結構** | `<div class="tag {{variant}}"><span class="dot"></span><span class="text">…</span></div>`。 |
| **參數** | include 前 `{% set tag = { text, variant } %}`；多筆時用 `tagList` 並以 `tag` 當迴圈變數。 |
| **變體** | `.success` / `.warning` / `.neutral`（決定圓點顏色）。 |
| **使用** | 單筆：`{% set tag = {...} %}{% include "ui/tag/tag.html" %}`；多筆：`{% for tag in tagList %}{% include ... %}{% endfor %}`。 |

#### `ui/tabs` — 頁籤列（樣式 + JS）

| 項目 | 內容 |
|---|---|
| **用途** | 通用頁籤切換：按鈕列 + 對應面板。 |
| **結構** | `.js-tabs-wrap`（範圍界線）> `.tabs.js-tabs`（按鈕列，內含 `.tab.js-tab[data-tab]`）+ `.tab-panels`（面板群，內含 `.tab-panel[data-tab]`）。 |
| **必要 class** | `js-tabs-wrap` / `js-tabs` / `js-tab` / `tab-panel`，配 `data-tab` 對應與 `is-active` 表示啟用。 |
| **變體** | `.tab-panels-scroll`（加在面板群上 → 面板限高 320px 並捲動）。 |
| **狀態** | Default / `.is-active`（頁籤底線高亮、面板顯示）。 |
| **交互** | 點頁籤切 `is-active`，並依 `data-tab` 切同一 `js-tabs-wrap` 內對應面板（`tabs.js`，詳下）。 |
| **注意** | 面板 `.tab-panel` 預設 `display:none`，`.is-active` 才顯示。面板內容樣式由使用方自管。 |

**交互行為（`tabs.js`）**

- 監聽 `document` click，`e.target.closest(".js-tab")` 找頁籤；已是 `is-active` 則略過。
- 移除同一 `.js-tabs` 內舊的 `is-active`，加到被點的頁籤。
- 取 `data-tab`，在同一 `.js-tabs-wrap` 範圍內把對應 `data-tab` 的 `.tab-panel` 切成 `is-active`。
- **範圍以 `.js-tabs-wrap` 為界**，因此同頁多組頁籤互不干擾。

#### `ui/footer` — 頁尾（純樣式）

| 項目 | 內容 |
|---|---|
| **用途** | 版權文字頁尾。由 `base.html` 自動 include（`{% include "ui/footer/footer.html" %}`），頁面不需自行加入。 |
| **結構** | `<footer class="footer">版權所有© 2025 …</footer>`，純樣式、無互動、不依賴其他元件，故歸 `ui/`。 |

---

### 5-3. Components 大元件

#### `components/header` — 頁首（含 mobile-nav）

| 項目 | 內容 |
|---|---|
| **用途** | 全站頁首：LOGO + 版本號 + 桌機主選單 + 漢堡鈕；並 include 手機選單。 |
| **結構** | `.header > .logo（img+.version）+ nav.desktop-nav > ul.main-menu + button.nav-toggle（三條 span）`，末端 `{% include mobile-nav %}`。 |
| **參數** | 內部 `{% set menuItems = [...] %}` 定義主選單（全站共用，mobile-nav 沿用）。頁面用 front matter 設 `currentPage`（= 當前頁 menu key）來高亮對應項。 |
| **變體/狀態** | 選單項 `.active`（當前頁，底線高亮）；登出項 `.logout`（左側分隔線）；漢堡鈕 `.active`（變 X）。 |
| **RWD** | ≤991px：隱藏 `.desktop-nav`，顯示 `.nav-toggle`，header 高 60px。 |
| **注意** | `position: sticky; top:0; z-index:1000`，會固定在頂部。`menuItems` 與 `currentPage` 的 key 要對得上才會高亮。 |

#### `components/mobile-nav` — 手機選單（header 子片段）

| 項目 | 內容 |
|---|---|
| **用途** | 手機版滑出選單面板，是 header 的專屬子片段。 |
| **結構** | `.mobile-nav > .overlay（遮罩）+ .mobile-menu-wrap > ul.mobile-menu`。資料沿用 header 的 `menuItems`。 |
| **狀態** | `.mobile-menu-wrap.open`（滑入顯示）、`.overlay.active`（遮罩淡入）、`.nav-toggle.active`（漢堡變 X）。 |
| **交互** | 開關選單、鎖背景捲動、Esc/點遮罩關閉（`mobile-nav.js`，詳下）。 |
| **注意** | 容器 `pointer-events:none`，只有可見子元素接收事件（避免未展開時擋住頁面）。它必須與 header 同頁（共用 `menuItems`），故由 header include。 |

**交互行為（`mobile-nav.js`）**

- 提供 `lockBodyScroll()` / `unlockBodyScroll()`：開選單時鎖 `body` 捲動，並用捲軸寬度補 `padding-right`（避免版面跳動），同寬度也補到固定定位的 `.mobile-nav` 讓右緣對齊。
- `openMenu()` / `closeMenu()`：切換 `.nav-toggle.active`、`.mobile-menu-wrap.open`、`.overlay.active`，並更新 `aria-expanded`。
- 綁定：漢堡鈕 toggle、點遮罩關閉、按 `Esc` 關閉。
- 若找不到 `.nav-toggle` / `.mobile-menu-wrap` 則直接 return（防呆）。

#### `components/dashboard-summary` — 統計卡列

| 項目 | 內容 |
|---|---|
| **用途** | 儀表板頂部四張統計卡：Completed / Pending / Progress / Failed。 |
| **結構** | 兩組 `.flex-row`，各放兩張 `ui/stat-card`（success/warning/info/danger），用 col 與 gap 工具 class 排版，RWD `mobile-column`。 |
| **參數** | include 前 `{% set summaryData = { completed, pending, progress, failed } %}`（四個數字）。 |
| **注意** | 卡片視覺來自 `ui/stat-card`，本元件只負責版面與資料注入。 |

#### `components/dashboard-table` — 可展開資料表

| 項目 | 內容 |
|---|---|
| **用途** | 儀表板主列表。每筆資料 = 一組「主列 + 明細列」；明細列含 4 個頁籤（訊息/詳細資料/歷史紀錄/錯誤文件）。 |
| **結構** | `.scrollTable > table.default-table.dashboard-table`。`tbody` 內每筆 `{% for row in rows %}` 產生：`tr.row-main`（名稱欄含展開鈕 `.row-btn` + 短欄位 + `ui/status`）與 `tr.row-detail`（內含 `.detail-collapse` 折疊容器 + `js-tabs-wrap` 頁籤結構，4 個 `tab-*.html` 子片段）。 |
| **參數** | front matter `rows: [{ id, name, start, end, duration, type, status, statusLabel }]`；可選 include 前 `{% set activeTab = "detail" %}` 指定展開後預設亮的頁籤（預設 `message`）。內部 `{% set tabList %}` 定義頁籤清單。 |
| **狀態** | `.row-detail.is-open`（展開，grid 0fr→1fr 滑動）、`.row-btn.active`（icon 右→下、加底色）、頁籤 `.is-active`。 |
| **交互** | 兩支 JS 協作：`dashboard-table.js` 控列展開、`tabs.js` 控頁籤切換（詳下，tabs.js 行為見 [§5-2 ui/tabs](#5-2-ui-小元件)）。 |
| **子片段** | `tab-message.html`（pipeline 訊息）、`tab-detail.html`（JSON `pre.detail-json`）、`tab-history.html`（用 `default-table`+`status` 的歷史表）、`tab-error.html`（空狀態文字）。 |
| **注意** | 頁籤 `key`（`tabList`）必須與面板 `data-tab` 及 `tab-*.html` 檔名一致，增減頁籤時三處一起改。展開動畫用 CSS grid `grid-template-rows`，自適應內容高度，無需固定值。長文/格式化內容（訊息、JSON）依規範**寫死在子片段當樣式示範**，不進 front matter。 |

**交互行為（`dashboard-table.js`）**

- 監聽 `document` click，`closest(".row-btn")` 找展開鈕。
- 讀按鈕的 `aria-controls` → `getElementById` 找到對應 `tr.row-detail`。
- toggle 該明細列的 `.is-open`、按鈕的 `.active`，並同步 `aria-expanded`。
- 與 `tabs.js` 互補：本檔管「列展開/收合」，`tabs.js` 管「展開後的頁籤切換」。

#### `components/pagination` — 頁碼分頁

| 項目 | 內容 |
|---|---|
| **用途** | 頁碼分頁 + 每頁筆數下拉；頁碼由 JS 依總筆數動態生成。 |
| **結構** | `.pagination[data-total] > ul（JS 填入）+ .page-info（共 N 筆 + ui/form-group 的筆數 select）`。 |
| **參數** | include 前 `{% set dataTotal = 3 %}`（總筆數，寫入 `data-total`）。每頁筆數常數 `PER_PAGE=5` 在 `pagination.js`。 |
| **狀態** | 頁碼 `.active`（當前頁）；箭頭 `.first/.prev/.next/.last` 的 `.disabled`（首末頁時，換淺灰 icon、停用點擊）；`.ellipsis`（省略號）。 |
| **交互** | 頁碼由 JS 依總筆數動態生成與切頁（`pagination.js`，詳下）。 |
| **注意** | 因為頁碼是 JS 動態生成，dev server 才需 `domDiff:false`（否則存檔後頁碼消失）。<br />想改每頁筆數，改 `pagination.js` 的 `PER_PAGE`（並同步 HTML 下拉的 option） |

**交互行為（`pagination.js`）**

- IIFE 包裝；常數 `PER_PAGE=5`、`VISIBLE_PAGES=3`。
- `DOMContentLoaded` 時掃描所有 `.pagination`，讀 `data-total` 算總頁數 `Math.ceil(total/PER_PAGE)`，呼叫 `render()` 畫出頁碼。
- `render(container, totalPages, current)`：永遠顯示第 1 頁與最末頁，中間最多 `VISIBLE_PAGES` 個，超出用 `...`；首/上/下/末箭頭依當前頁可用性切換深/淺灰 icon。
- 容器上監聽 click，點 `a[data-page]` → 更新 `current` → 重新 `render()`。
- 目前只重繪頁碼 UI（不實際切換資料）。

---

### 5-4. JavaScript 共通規則與載入流程

所有元件 JS 都遵守同一套規則：**只用標準 DOM API、包在 `DOMContentLoaded` 內、只操作自己元件的 class、不依賴 jQuery 或任何套件**。

**初始化與載入流程**

1. `base.html` 以 `<script defer>` 依序載入 `dist/js/*.js`。
2. `defer` 保證 DOM 解析完才執行；各檔再各自包在 `DOMContentLoaded` 監聽內綁定。
3. 多數元件用**事件委派**（在 `document` 上監聽 click，再用 `closest()` 找目標），因此對動態插入的節點也有效。

> 規範：JS **只操作自己元件的 class**；若需操作別的元件，應呼叫該元件 JS 提供的函式，不可直接改別人的內部 class。

---

## 6. 頁面架構

### 6-1. Layout 串接鏈

頁面不直接寫 `<html>`，而是**選一個 layout**，由 layout 層層包裹：

```
1-1_homepage.html
   └─ layout: layouts/page-shell.html      ← 加上 header + <main> 容器
         └─ layout: layouts/base.html      ← 加上 <head> + .full-wrap + footer + <script>
```

| Layout | 自動提供 | 適用 |
|---|---|---|
| `layouts/page-shell.html` | `<head>` + **header** + `<main>` 容器 + **footer** + script 清單 | 一般頁面（首選） |
| `layouts/base.html` | 只有 `<head>` + 空白外框 + footer + script 清單 | 特殊版型（如登入頁） |

> `header` 與 `footer` 是 layout 自動帶入的，**頁面不需自行 include**。

### 6-2. 建立一個新頁面（基礎架構）

一個最小可運作的新頁面只需三件事：**選 layout、填 front matter、依序 include 元件**。

```njk
---
layout: layouts/page-shell.html      # 一般頁用 page-shell（自動有 header/footer）
title: GufoRAG::頁面標題             # 顯示於瀏覽器分頁
permalink: 2-1_example.html          # 輸出到 dist/ 的檔名
currentPage: dashboard               # 對應 header menuItems 的 key（高亮選單）

# 頁面資料寫在這（會被元件取用）
---

{# 區塊順序 = include 行序 #}
```

建立步驟：

1. 在 `src/` 下新增 `檔名.html`（檔名通常對應 `permalink`）。
2. front matter 設 `layout`、`title`、`permalink`，並視需要設 `currentPage` 與頁面資料。
3. body 依需要的版面順序，用 `{% set %}` 傳參 + `{% include %}` 組合元件（區塊順序 = include 行序，調版面就是調行序）。
4. `npm run dev` 即時預覽，確認後 `npm run build` 產出到 `dist/`。

### 6-3. 各頁的組成

#### 1-1_homepage.html — 儀表板首頁

**版面組合**

| 順序 | 區塊 | 元件 | 用途 |
|---|---|---|---|
| 0 | 頁首 / 頁尾 | `header`（含 `mobile-nav`）、`footer` | 由 page-shell/base 自動提供 |
| 1 | 右上標籤列 | `ui/tag` ×2（`{% for %}` 渲染） | 顯示標籤（Gufonet / Weaviate） |
| 2 | 統計卡列 | `components/dashboard-summary` | 四張卡：Completed / Pending / Progress / Failed |
| 3 | 主資料表 | `components/dashboard-table` | 可展開列表，每列展開後有 4 個頁籤 |
| 4 | 分頁 | `components/pagination` | 頁碼分頁（JS 依總筆數生成） |

**完整頁面骨架**

```njk
---
layout: layouts/page-shell.html      # 自動帶入 header / <main> / footer
title: GufoRAG::儀表板               # 瀏覽器分頁標題
permalink: 1-1_homepage.html         # 輸出到 dist/ 的檔名
currentPage: dashboard               # 對應 header menuItems 的 key（高亮選單）

# 主資料表的列資料；示意 3 筆
rows:
  - id: 1
    name: 目錄資料
    start: "2025-08-20 06:04:53"
    end: "2025-08-20 04:04:53"
    duration: 29.905s
    type: sync
    status: danger             # 對應 ui/status 變體：success / warning / info / danger
    statusLabel: failed
---

{# 1. 右上標籤列：set 後用 for 迴圈渲染（version 用 tag 當迴圈變數）#}
<div class="flex-row justify-content-end gap-8">
  {% set tagList = [
    { text: "Gufonet",  variant: "warning" },
    { text: "Weaviate", variant: "success" }
  ] %}
  {% for tag in tagList %}{% include "ui/tag/tag.html" %}{% endfor %}
</div>

{# 2. 統計卡列 #}
{% set summaryData = { completed: 1, pending: 1, progress: 1, failed: 1 } %}
{% include "components/dashboard-summary/dashboard-summary.html" %}

{# 3 + 4. 主資料表 + 分頁（用工具 class .flex-row.column.gap-16 直排）#}
<div class="flex-row column gap-16" style="margin-top: 1.5rem;">
  {% include "components/dashboard-table/dashboard-table.html" %}

  {% set dataTotal = 3 %}
  {% include "components/pagination/pagination.html" %}
</div>
```

**變數設定**

頁面用到的元件變數、定義位置與用途：

| 變數 | 定義位置 | 型別 | 給誰用 | 說明 |
|---|---|---|---|---|
| `rows` | front matter | 陣列 | `dashboard-table` | 每筆 `{ id, name, start, end, duration, type, status, statusLabel }` |
| `tagList` | include 前 `{% set %}` | 陣列 | `ui/tag` | 每筆 `{ text, variant }`；以 `tag` 當迴圈變數 |
| `summaryData` | include 前 `{% set %}` | 物件 | `dashboard-summary` | `{ completed, pending, progress, failed }` 四個數字 |
| `dataTotal` | include 前 `{% set %}` | 數字 | `pagination` | 總筆數，寫入 `data-total`，JS 依此算頁數 |
| `activeTab`（可選） | include 前 `{% set %}` | 字串 | `dashboard-table` | 展開後預設亮的頁籤 key，未設預設 `message` |

**各區塊元件使用**

| 區塊 | 元件（詳見 §5） | 必要設定 | 可調項 |
|---|---|---|---|
| 右上標籤列 | [`ui/tag`](#5-2-ui-小元件) | `{% set tagList %}` + `{% for %}` 渲染 | `variant`：success / warning / neutral |
| 統計卡列 | [`components/dashboard-summary`](#5-3-components-大元件) | `{% set summaryData %}` | 四個數字；卡片變體由元件內部固定 |
| 主資料表 | [`components/dashboard-table`](#5-3-components-大元件) | front matter `rows` | `{% set activeTab %}` 改展開後預設頁籤 |
| 分頁 | [`components/pagination`](#5-3-components-大元件) | `{% set dataTotal %}` | 每頁筆數改 `pagination.js` 的 `PER_PAGE` |

---

> **維護本文件**：當你新增/刪除頁面或元件、調整建置流程、或變更變數結構時，請同步更新本文件對應章節（特別是 [§3 結構](#3-專案結構)、[§5 元件](#5-元件說明)、[§6 頁面](#6-頁面架構)）。
