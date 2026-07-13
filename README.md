# GufoRAG Frontend — 11ty（react-friendly 切版）

GufoRAG 後台介面的 **Eleventy (11ty) 前端靜態切版專案**。照 [`GUIDELINE.md`](GUIDELINE.md) 的結構切版——一元件一資料夾、頁面是元件的組合、JS 只用標準 DOM API——HTML 和 CSS 可以幾乎原樣搬進 React 專案。

## 為什麼

整頁式切版（HTML + jQuery + 單一大 SCSS）轉成 React 需要大量人工：重複的區塊要逐頁比對、jQuery 套件要整段重寫、CSS 難以拆分。

這個專案沿用設計團隊的 class 命名與設計，只改三件事：

- 一個元件一個資料夾（HTML、SCSS、JS 同住），頁面是元件的組合
- 互動行為是各元件自己的 vanilla JS（標準 DOM API），無 jQuery、無任何第三方套件
- 轉換成 React 時，HTML→JSX 是機械式替換，CSS 原樣沿用，JS 是現成的行為規格

## 怎麼執行

需要 [Node.js](https://nodejs.org/) 18 以上（`.nvmrc` 寫 22，CI 也讀它）。第一次執行：

```bash
npm install
```

日常使用：

```bash
npm run dev      # 即時預覽 http://localhost:8090（含 SCSS 編譯、存檔自動重整）
npm run build    # 輸出純靜態 HTML 到 dist/（交付物，雙擊即開）
```

## 結構

> 這裡是**專案現況**（會隨新增頁面/元件而變）。**規則**在 [`GUIDELINE.md`](GUIDELINE.md)——那份不會因為多切一頁就要改。

```
src/
├── _includes/
│   ├── layouts/       整頁模板（page-shell = 一般頁外殼，選它 header/footer 自動出現）
│   ├── components/    大元件：會用到其他元件的組合區塊
│   └── ui/            小元件：不依賴其他元件的積木
├── scss/              全域樣式（_var 三層 design tokens、_mixin、_base、_utilities、main 組裝清單）
├── images/
└── 1-1_homepage.html  頁面：儀表板首頁（目前唯一一頁）
```

每個元件資料夾內：`元件.html`（結構）、`_元件.scss`（樣式）、`元件.js`（行為），有才放。

## 元件使用一覽

> 各元件的結構、狀態與交互細節見 [`260629_GufoRAG_切版說明.md`](260629_GufoRAG_切版說明.md) §5。

### 需要參數的元件

| 元件 | 參數 |
|---|---|
| `ui/tag` | 單筆：include 前 `{% set tag = { text, variant } %}`；多筆：set `tagList` 後 `{% for tag in tagList %}` include。`variant`：success / warning / neutral |
| `components/dashboard-summary` | include 前 `{% set summaryData = { completed, pending, progress, failed } %}`（四個數字） |
| `components/dashboard-table` | front matter `rows:`（`id`、`name`、`start`、`end`、`duration`、`type`、`status`、`statusLabel`）；選填 include 前 `{% set activeTab %}` 指定展開後預設頁籤（預設 `message`） |
| `components/pagination` | include 前 `{% set dataTotal = 總筆數 %}`（寫入 `data-total`，JS 依此算頁數）；每頁筆數改 `pagination.js` 的 `PER_PAGE` |

### 自動引入

`header`（內含 mobile-nav）由 `page-shell` 提供、`footer` 由 `base` 提供，頁面不需 include。
含子元件的元件：`header`（含 `mobile-nav`）、`dashboard-table`（含 `tab-message` / `tab-detail` / `tab-history` / `tab-error` 四個子片段）。

### 純樣式 / 純行為元件（直接寫 class）

純樣式直接寫 class：`button`、`default-table`、`form-group`、`stat-card`、`status`。
純行為＋樣式：`ui/tabs` 無 html，結構照 `.js-tabs-wrap` > `.js-tabs` > `.js-tab[data-tab]` ＋ `.tab-panel[data-tab]` 寫在使用它的元件裡。

## 部署（GitHub Pages）

push 到 `main` 會自動觸發 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：`npm ci` → `npm run build`（紅就擋下部署）→ 把 `dist/` 發布到 GitHub Pages。也可在 GitHub 的 **Actions** 頁手動觸發（workflow_dispatch）。

- **線上網址**：<https://shawnshen1206.github.io/guforag-frontend-11ty/>（根 URL 由部署流程補的轉址頁導到儀表板；直接開 `/1-1_homepage.html` 也可以）。
- **一次性設定**：repo → **Settings → Pages → Build and deployment → Source** 選「**GitHub Actions**」。沒開的話 deploy job 會失敗，開啟後對該次重跑（Re-run jobs）即可。
- `dist/` 在 `.gitignore` 內、不進版控——由流程現建現部署，不需 `gh-pages` 分支。
- 全站用相對路徑，在 `/guforag-frontend-11ty/` 子路徑下可直接運作，不需額外 base path 設定。

## 規則

完整規範在 [`GUIDELINE.md`](GUIDELINE.md)，AI 轉換時也以它為準。
交付前跑一次 GUIDELINE 末尾的檢查清單。
