/*
-------------------------------------------------
  eleventy.config.js — Eleventy 設定
  - SCSS 由 Eleventy 的建置事件編譯：
      入口 src/scss/main.scss → dist/css/main.css（對應 base.html 的 <link>）
      addWatchTarget 監看所有 .scss（含 src/_includes 裡的元件 scss），
      任一 partial 一變更，Eleventy 就重建、重編並觸發瀏覽器自動重整。
-------------------------------------------------
*/

const sass = require("sass");
const fs = require("node:fs");

module.exports = function (eleventyConfig) {
  // ===== 靜態資源 passthrough =====
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });

  // ----- 元件 JS（每加一個元件 js 在這加一行）-----
  eleventyConfig.addPassthroughCopy({
    "src/_includes/components/pagination/pagination.js": "js/pagination.js",
    "src/_includes/ui/tabs/tabs.js": "js/tabs.js",
    "src/_includes/components/dashboard-table/dashboard-table.js": "js/dashboard-table.js",
    "src/_includes/components/mobile-nav/mobile-nav.js": "js/mobile-nav.js",
  });

  // ===== SCSS 編譯：每次建置（含 watch 重建）編譯 main.scss → dist/css/main.css =====
  eleventyConfig.on("eleventy.before", () => {
    const result = sass.compile("src/scss/main.scss", {
      loadPaths: ["src/scss", "node_modules"],
      style: "expanded",
      sourceMap: false,
    });
    fs.mkdirSync("dist/css", { recursive: true });
    fs.writeFileSync("dist/css/main.css", result.css);
  });

  // 監看所有 scss（含 src/_includes 元件）→ 一改就重建並自動重整
  eleventyConfig.addWatchTarget("src/**/*.scss");

  // ===== Dev server：存檔後改「整頁重載」=====
  //   靠 JS 生成的內容（pagination 頁碼等）在預設的局部更新後會消失，
  //   改 domDiff: false 讓每次存檔都重跑元件 JS。僅開發用，不影響產出。
  eleventyConfig.setServerOptions({ domDiff: false });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "dist",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"],
  };
};
