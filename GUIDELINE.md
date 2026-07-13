# 切版規範（規格書）

本文件是這個專案的**規範**：定義檔案結構、語法白名單、各層級的規則，以及與 React 的對應關係。
適用對象：產生或修改本專案程式碼的人與 AI，以及將本專案轉換成 React 的人與 AI。
範例頁 `src/1-1_homepage.html`（儀表板）是本規範的標準實作；各頁面與元件的逐一說明見 [`260629_GufoRAG_切版說明.md`](260629_GufoRAG_切版說明.md)。
執行方式見 [README.md](README.md)。

核心原則：**沿用設計團隊既有的 class 命名、markup 結構與 SCSS 寫法**。
本專案相對於整頁式切版只改三件事：

1. 檔案組織：每個元件一個資料夾（html + scss + js 同住）
2. 互動行為是各元件自己的 vanilla JS（標準 DOM API），不用 jQuery 與任何第三方套件
3. 頁面用 include 組合、重複內容寫成 front matter 資料

---

## 1. 檔案結構

```
GufoRAG/
├── src/
│   ├── _includes/
│   │   ├── layouts/                   ← 整頁模板（只放模板，不放元件）
│   │   │   ├── base.html              ←   <head> + 全頁外框 + footer + script 清單
│   │   │   ├── page-shell.html        ←   一般頁外殼：header + <main> 容器
│   │   │   └── _layout.scss           ←   骨架樣式（.full-wrap、.main）
│   │   ├── components/                ← 大元件：會用到其他元件的組合區塊
│   │   │   └── <元件名>/              ←   一個元件 = 一個資料夾
│   │   │       ├── <元件名>.html      ←     元件 HTML（唯一正本）
│   │   │       ├── _<元件名>.scss     ←     元件樣式（有才放）
│   │   │       └── <元件名>.js        ←     元件行為（有才放）
│   │   └── ui/                        ← 小元件：不依賴其他元件的積木
│   ├── scss/
│   │   ├── _var.scss                  ←   顏色變數（三層 design tokens：Primitives → Roles → Component Tokens）
│   │   ├── _mixin.scss                ←   scrollbar 等 mixin
│   │   ├── _base.scss                 ←   html/body/標籤預設
│   │   ├── _utilities.scss            ←   text-*、flex-row、gap-*、col-* 等工具 class
│   │   └── main.scss                  ←   只放 @use 組裝清單
│   ├── images/
│   └── <頁面>.html                    ← 頁面 = 選 layout + 元件組合
└── dist/                              ← build 輸出（不可手動編輯）
```

### 1-1. 放置規則（三個桶）

| 桶 | 判斷句 | 例 |
|---|---|---|
| `layouts/` | 是整頁的**模板**嗎？ | base、page-shell |
| `components/` | 它的 html / scss / js **會用到其他元件**，或是某大元件的**專屬子片段**嗎？（大） | header、mobile-nav、dashboard-summary、dashboard-table、pagination |
| `ui/` | **不依賴任何其他元件**的最小單位？（小） | button、tabs、stat-card、tag |

「專屬子片段」指由某個大元件 include、不會單獨使用的部分：`mobile-nav`（header 的手機版選單，沿用 header 的 `menuItems`，由 header include）、`dashboard-table` 的 `tab-*.html`（明細列的四個頁籤面板，直接住在 dashboard-table 資料夾）。它們放在 `components/`（或所屬大元件的資料夾）而非 `ui/`。

### 1-2. 元件檔案規則

- html / scss / js 三種檔案**有才放**：純樣式元件只有 scss（button、stat-card）、純行為元件只有 js + scss（tabs——結構直接寫在使用它的元件裡）
- 有 scss → 在 `scss/main.scss` 對應分組加一行 `@use`
- 有 js → 在 `eleventy.config.js` 的 passthrough 清單和 `layouts/base.html` 的 script 清單各加一行
- 同一個元件絕不複製貼上；要用就 include，修改只改它資料夾裡的那一份
- 誰的按鈕開的彈窗，彈窗就 include 在誰裡面

---

## 2. 模板語法白名單

全專案**只允許**以下 4 個模板語法，其他（macro、filter、shortcode、自訂 data 檔等）一律禁止：

| 語法 | 用途 | React 對應 |
|---|---|---|
| front matter（檔首兩條 `---` 之間的 YAML） | 頁面設定（layout、title、permalink）與頁面資料 | props / API 資料 |
| `{% include "桶/元件/檔.html" %}` | 引入元件 | `<Component />` |
| `{% set 名 = 值 %}` | include 前傳參數 | props |
| `{% for x in 清單 %}…{% endfor %}`（搭配 `{% if %}`） | 渲染重複結構 | `.map()` |

例外：`layouts/` 內的 `{{ content | safe }}` 是固定管線（頁面內容的注入點），不需修改。

`{% set %}` 的變數在 include 後**不會消失**（整頁共用）：同頁第二次使用同元件必須重新 set 全部參數；不同元件的參數名不可相同。

---

## 3. 頁面規則

### 3-1. front matter 必填欄位

```yaml
---
layout: layouts/page-shell.html        # 或 layouts/base.html
title: GufoRAG::頁面標題
permalink: 檔名.html                   # 輸出到 dist/ 的檔名
currentPage: dashboard                 # 對應 header menuItems 的 key（高亮選單；用 page-shell 的頁要設）
# （頁面資料寫在這之後）
---
```

| layout | 自動提供 | 適用 |
|---|---|---|
| `layouts/page-shell.html` | `<head>` + header + main 容器 + footer + script 清單 | 一般頁面 |
| `layouts/base.html` | 只有 `<head>` + 空白外框 + footer + script 清單 | 特殊版型（如登入頁） |

### 3-2. 內容區規則

- 區塊順序 = include 的行序；調整版面 = 調整行序
- 重複資料（表格列、選項清單）寫在 front matter，元件用 `{% for %}` 渲染；範例資料放 2~3 筆即可
- 短欄位（編號、時間、標題）資料化放 front matter；**長文／格式化內容**（AI 回答、免責聲明全文）直接寫在元件當樣式示範，不進 front matter——它在正式環境是 API 回傳或 markdown 渲染，這裡只示範它的長相
- 一次性版面直接寫在頁面檔，不抽元件

### 3-3. 什麼該切成元件

1. 出現在 2 頁以上 → 切
2. 同一頁內重複出現 → 切（轉換後是 `.map()`）
3. 有自己的互動行為 → 切（js 跟著元件走）
4. 一次性版面 → 不切

---

## 4. HTML / CSS 規則

- **class 命名沿用既有系統**（既有元件的詞彙：`.header`、`.form-group`、`.stat-card`、`.js-tabs`…）；新元件的命名跟隨同樣風格
- 狀態 class 沿用既有慣例：`.active`／`.is-active`、`.is-open`、`.error`、`.disabled`（轉換後 = React state / props）
- SCSS 寫法沿用既有風格（巢狀、`&` 修飾）；顏色用 `_var.scss` 變數
- 每個元件的 scss 只寫自己的 class；**A 元件的 scss 禁止出現 B 元件的 class**
- 禁止依頁面覆寫元件（`.page-xxx .button {...}`）
- 間距優先用既有工具 class（`flex-row column gap-16` 等）；簡單的一次性間距與表格欄寬（`<col style="width:...">`）允許行內 style（與既有切版習慣一致），但**不可**用行內 style 寫顏色與字級

---

## 5. JS 規則：元件的行為跟元件住在一起

每個有互動的元件，行為寫在自己資料夾的 `<元件名>.js`：

```
components/pagination/
├── pagination.html
├── _pagination.scss
└── pagination.js     ← 這個元件的行為
```

### 寫法規則

- **只用標準 DOM API**（`querySelectorAll`、`addEventListener`、`classList`、`closest`…，MDN 查得到的才能用）；禁止 jQuery 與任何第三方套件
- 只操作**自己元件**的 class；跨元件時各管各的（例：`dashboard-table.js` 只管列展開，展開後的頁籤切換交給 `tabs.js`）；要操作別的元件，呼叫該元件 js 提供的函式
- 包在 `DOMContentLoaded` 裡綁定；同元件可能出現多次時用 `querySelectorAll().forEach()`
- 跳窗用 `<dialog>` 元素 + `showModal()` / `close()`（標準 API）

### 新增元件 js 的登記（各加一行）

1. `eleventy.config.js`：passthrough 清單加 `"src/_includes/桶/元件/元件.js": "js/元件.js"`
2. `layouts/base.html`：script 清單加 `<script defer src="./js/元件.js"></script>`

### 不在切版範圍的互動

日期選擇、表單驗證、資料載入：保留原生元素或靜態外觀，由 React 套件實作。

---

## 6. React 轉換對照

| 本專案 | React |
|---|---|
| `layouts/page-shell.html` | route layout（Next.js `layout.tsx`、React Router `<Outlet />` 外層） |
| `components/xxx/`、`ui/xxx/` | 一個 component 資料夾（`Xxx.tsx` + 同名 scss） |
| 元件的 `_xxx.scss` | **原樣複製**到元件旁 `import './xxx.scss'`，不改寫 |
| 元件的 `xxx.js` | 行為規格：改寫成該元件的 `useState` / 事件處理（DOM 操作 → state 驅動） |
| `{% include %}` | `<Xxx />` |
| `{% set xxx %}` | props |
| front matter 資料 + `{% for %}` | `data.map(item => <Row item={item} />)` |
| `.active`／`.is-active`、`.is-open`、`.error` 狀態 class | `useState` 布林 / props（`className={open ? "x is-open" : "x"}`） |
| `<dialog>` + `showModal()` | React 可沿用 dialog，或換 Dialog 元件 |
| `_var.scss` 顏色變數 | 全域引入一次，元件照用 `var(--...)` |

tabs 的頁籤切換在本範本用 document 層級的事件委派實作、以 `.js-tabs-wrap` 為範圍界線（同頁多組頁籤互不干擾）；轉 React 時改由各 Tabs 元件自管 `activeTab` state，不要跨元件共用。pagination 的頁碼由 JS 依 `data-total` 動態生成，轉 React 時改為 state 驅動渲染（`current` / `totalPages`）。

HTML → JSX 為機械式替換：`class`→`className`、標籤自閉合、`{# #}`→`{/* */}`。
CSS 不需任何翻譯：交付的樣式即正式環境的最終樣式。

---

## 7. 交付前檢查清單

- [ ] `npm run build` 成功；`dist/` 每一頁雙擊可開、外觀與互動正確
- [ ] 沒有 jQuery 與任何第三方 JS 套件；js 只用標準 DOM API
- [ ] 每個有互動的元件：js 在自己資料夾，且已在 `eleventy.config.js` 與 `base.html` 登記
- [ ] 重複區塊都是 include；重複列／選項用 `{% for %}` + front matter 資料
- [ ] class 命名沿用既有系統；新顏色定義在 `_var.scss`
- [ ] 放對桶：整頁模板 → `layouts/`；會用到其他元件 → `components/`；零依賴 → `ui/`
- [ ] 只用了 §2 白名單內的模板語法

---

## 8. Dos & Don'ts

```html
<!-- ❌ 每頁貼一份 header（170 行 × 6 頁） -->
<header class="header">...</header>

<!-- ✅ page-shell 自動提供；其他元件用 include -->
{% include "components/dashboard-summary/dashboard-summary.html" %}
```

```html
<!-- ❌ 表格列複製 16 次 -->
<tr class="row-main">...</tr><tr class="row-detail">...</tr>
<!-- ……× 16 -->

<!-- ✅ 資料寫在頁面 front matter 的 rows，元件內用迴圈渲染，示意 3 筆 -->
{% for row in rows %}
<tr class="row-main">…</tr>
<tr class="row-detail">…</tr>
{% endfor %}
```

```js
// ❌ jQuery，且所有頁面的行為擠在一支 main.js
$(".js-tab").on("click", function () { $(this).addClass("is-active"); });

// ✅ 標準 DOM API，寫在 ui/tabs/tabs.js（事件委派 + closest）
document.addEventListener("click", (e) => {
  const tab = e.target.closest(".js-tab");
  if (tab) tab.classList.add("is-active");
});
```

```scss
/* ❌ 在 A 元件的 scss 裡改 B 元件 */
.dashboard-table .button { padding: 0; }

/* ✅ 各自的樣式寫在各自的檔案 */
```
