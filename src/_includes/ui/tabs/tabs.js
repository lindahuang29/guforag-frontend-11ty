// tabs.js — 頁籤切換
// 1) 點到的 tab 加 is-active、其他移除
// 2) 若同一組 .js-tabs-wrap 內有 .tab-panel，依 data-tab 切換對應面板的 is-active

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (e) => {
        const tab = e.target.closest(".js-tab");

        if (!tab || tab.classList.contains("is-active")) return;

        const tabs = tab.closest(".js-tabs");
        const activeTab = tabs.querySelector(".js-tab.is-active");

        if (activeTab) {
            activeTab.classList.remove("is-active");
        }
        tab.classList.add("is-active");

        // 切換對應面板（頁籤與面板共用 data-tab；限同一 .js-tabs-wrap 範圍）
        const wrap = tab.closest(".js-tabs-wrap");

        if (!wrap) return;

        const key = tab.getAttribute("data-tab");

        wrap.querySelectorAll(".tab-panel").forEach((panel) => {
            panel.classList.toggle("is-active", panel.getAttribute("data-tab") === key);
        });
    });
});