// 手機選單：開關、子選單展開、開啟時鎖定背景捲動
// lockBodyScroll / unlockBodyScroll

// 鎖定背景捲動，回傳補償掉的捲軸寬度（無捲軸時為 0），供呼叫端對齊其他固定定位元素
function lockBodyScroll() {
    const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
    const scrollbarWidth = hasScrollbar
        ? window.innerWidth - document.documentElement.clientWidth
        : 0;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth) {
        document.body.style.paddingRight = scrollbarWidth + "px";
    }

    return scrollbarWidth;
}

function unlockBodyScroll() {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
}

document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.querySelector(".nav-toggle");
    const menuWrap = document.querySelector(".mobile-menu-wrap");
    const overlay = document.querySelector(".mobile-nav .overlay");
    const mobileNav = document.querySelector(".mobile-nav");

    if (!navToggle || !menuWrap) return;

    function openMenu() {
        navToggle.classList.add('active');
        menuWrap.classList.add('open');
        if (overlay) overlay.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');

        const scrollbarWidth = lockBodyScroll();
        // 固定定位、寬度 100% 的選單跟 body 一樣補上捲軸寬度，右緣才會對齊
        if (mobileNav && scrollbarWidth) {
            mobileNav.style.paddingRight = scrollbarWidth + "px";
        }
    }

    function closeMenu() {
        navToggle.classList.remove('active');
        menuWrap.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');

        unlockBodyScroll();
        if (mobileNav) mobileNav.style.paddingRight = "";
    }

    navToggle.addEventListener('click', () => {
        if (menuWrap.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // 按 Esc 關閉
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuWrap.classList.contains('open')) {
            closeMenu();
        }
    });
});