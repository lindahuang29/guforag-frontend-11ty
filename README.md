# GufoFAQ 切版範本（React-friendly）

設計師切版的標準範本。照這個結構切版，HTML 和 CSS 可以幾乎原樣搬進 React 專案。

## 為什麼

整頁式切版（HTML + jQuery + 單一大 SCSS）轉成 React 需要大量人工：重複的區塊要逐頁比對、jQuery 套件要整段重寫、CSS 難以拆分。

這個範本沿用原本的 class 命名與設計，只改三件事：

- 一個元件一個資料夾（HTML、SCSS、JS 同住），頁面是元件的組合
- jQuery 換成各元件自己的 vanilla JS（標準 DOM API）
- 轉換成 React 時，HTML→JSX 是機械式替換，CSS 原樣沿用，JS 是現成的行為規格

## 怎麼執行

需要 [Node.js](https://nodejs.org/) 18 以上。第一次執行：

```bash
npm install
```

日常使用：

```bash
npm run dev      # 即時預覽 http://localhost:8080（含 SCSS 編譯、存檔自動重整）
npm run build    # 輸出純靜態 HTML 到 dist/（交付物，雙擊即開）
```

## 結構

```
src/_includes/
├── layouts/       整頁模板（page-shell = 一般頁外殼，選它 header/footer 自動出現）
├── components/    大元件：會用到其他元件的組合區塊
└── ui/            小元件：不依賴其他元件的積木
```

每個元件資料夾內：`元件.html`（結構）、`_元件.scss`（樣式）、`元件.js`（行為），有才放。

範例頁（原版對照在上層資料夾的同名檔案）：

- `src/4-2_qaHistory_detail.html` — 表格、手風琴、彈窗
- `src/1-1-4_columnSelect_excel.html` — 步驟條、表單、錯誤狀態

## 規則

完整規範在 [GUIDELINE.md](GUIDELINE.md)，AI 轉換時也以它為準。
交付前跑一次 GUIDELINE 末尾的檢查清單。
