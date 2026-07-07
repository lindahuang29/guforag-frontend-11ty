// pagination.js — 頁碼分頁元件
// 從容器 data-total 讀取總筆數（dataTotal），自動算總頁數（totalPages）、渲染頁碼，並處理點擊切頁。
// 行為：
//   - 永遠顯示第 1 頁與最後一頁
//   - 中間最多顯示 visiblePages 個頁碼，超出用 ... 省略
//   - 第一頁／上一頁／下一頁／最末頁的箭頭依當前頁的可用性切換淺灰／深灰圖
(function () {
    "use strict";

    const PER_PAGE = 5;       // 每頁筆數
    const VISIBLE_PAGES = 3;   // 中間頁碼最多顯示幾個

    function render(container, totalPages, current) {
        const ul = container.querySelector("ul");
        if (!ul) return;
        ul.innerHTML = "";

        // 第一頁
        if (current > 1) {
            ul.insertAdjacentHTML("beforeend",
                '<li class="first"><a href="#" data-page="1" aria-label="第一頁">' +
                '<img src="./images/icon_pagination_arrow_first_base.svg" alt=""></a></li>');
        } else {
            ul.insertAdjacentHTML("beforeend",
                '<li class="first disabled"><a href="#" aria-label="第一頁不可用" aria-disabled="true" tabindex="-1">' +
                '<img src="./images/icon_pagination_arrow_first_lighter.svg" alt=""></a></li>');
        }

        // 上一頁
        if (current > 1) {
            ul.insertAdjacentHTML("beforeend",
                '<li class="prev"><a href="#" data-page="' + (current - 1) + '" aria-label="上一頁">' +
                '<img src="./images/icon_pagination_pre_base.svg" alt=""></a></li>');
        } else {
            ul.insertAdjacentHTML("beforeend",
                '<li class="prev disabled"><a href="#" aria-label="上一頁不可用" aria-disabled="true" tabindex="-1">' +
                '<img src="./images/icon_pagination_pre_lighter.svg" alt=""></a></li>');
        }

        // 第 1 頁
        if (current === 1) {
            ul.insertAdjacentHTML("beforeend",
                '<li class="active"><a href="#" aria-label="第1頁" aria-current="page">1</a></li>');
        } else {
            ul.insertAdjacentHTML("beforeend",
                '<li><a href="#" data-page="1" aria-label="第1頁">1</a></li>');
        }

        // 中間頁碼範圍
        let start, end;
        if (totalPages <= VISIBLE_PAGES + 2) {
            start = 2;
            end = totalPages - 1;
        } else {
            start = current - Math.floor(VISIBLE_PAGES / 2);
            end = current + Math.floor(VISIBLE_PAGES / 2);

            if (start < 2) {
                start = 2;
                end = start + VISIBLE_PAGES - 1;
            }
            if (end > totalPages - 1) {
                end = totalPages - 1;
                start = end - VISIBLE_PAGES + 1;
                if (start < 2) start = 2;
            }
        }

        if (start > 2) {
            ul.insertAdjacentHTML("beforeend", '<li class="ellipsis">...</li>');
        }

        for (let i = start; i <= end; i++) {
            if (i === current) {
                ul.insertAdjacentHTML("beforeend",
                    '<li class="active"><a href="#" aria-label="第' + i + '頁" aria-current="page">' + i + '</a></li>');
            } else {
                ul.insertAdjacentHTML("beforeend",
                    '<li><a href="#" data-page="' + i + '" aria-label="第' + i + '頁">' + i + '</a></li>');
            }
        }

        if (end < totalPages - 1) {
            ul.insertAdjacentHTML("beforeend", '<li class="ellipsis">...</li>');
        }

        // 最後一頁
        if (totalPages > 1) {
            if (current === totalPages) {
                ul.insertAdjacentHTML("beforeend",
                    '<li class="active"><a href="#" aria-label="第' + totalPages + '頁" aria-current="page">' + totalPages + '</a></li>');
            } else {
                ul.insertAdjacentHTML("beforeend",
                    '<li><a href="#" data-page="' + totalPages + '" aria-label="第' + totalPages + '頁">' + totalPages + '</a></li>');
            }
        }

        // 下一頁
        if (current < totalPages) {
            ul.insertAdjacentHTML("beforeend",
                '<li class="next"><a href="#" data-page="' + (current + 1) + '" aria-label="下一頁">' +
                '<img src="./images/icon_pagination_next_base.svg" alt=""></a></li>');
        } else {
            ul.insertAdjacentHTML("beforeend",
                '<li class="next disabled"><a href="#" aria-label="下一頁不可用" aria-disabled="true" tabindex="-1">' +
                '<img src="./images/icon_pagination_next_lighter.svg" alt=""></a></li>');
        }

        // 最末頁
        if (current < totalPages) {
            ul.insertAdjacentHTML("beforeend",
                '<li class="last"><a href="#" data-page="' + totalPages + '" aria-label="最末頁">' +
                '<img src="./images/icon_pagination_arrow_last_base.svg" alt=""></a></li>');
        } else {
            ul.insertAdjacentHTML("beforeend",
                '<li class="last disabled"><a href="#" aria-label="最末頁不可用" aria-disabled="true" tabindex="-1">' +
                '<img src="./images/icon_pagination_arrow_last_lighter.svg" alt=""></a></li>');
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".pagination").forEach(function (container) {
            const dataTotal = Number(container.dataset.total) || 0;
            if (dataTotal <= 0) return;
            const totalPages = Math.ceil(dataTotal / PER_PAGE);
            let current = 1;

            render(container, totalPages, current);

            container.addEventListener("click", function (e) {
                const a = e.target.closest("a[data-page]");
                if (!a) return;
                e.preventDefault();
                current = parseInt(a.dataset.page, 10);
                render(container, totalPages, current);
            });
        });
    });
})();
