// dashboard-table.js — 列表展開切換
// 點 .row-btn → 切換其對應 row-detail 的 .is-open。
// 以按鈕的 aria-controls 對應到明細列。

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".row-btn");

        if (!btn) return;

        const detailId = btn.getAttribute("aria-controls");
        const detail = detailId ? document.getElementById(detailId) : null;

        if (!detail) return;

        const open = !detail.classList.contains("is-open");

        detail.classList.toggle("is-open", open);
        btn.classList.toggle("active", open);
        btn.setAttribute("aria-expanded", String(open));
    });
});
