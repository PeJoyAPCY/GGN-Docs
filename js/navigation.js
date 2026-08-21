// ======================================================
// GGN Docs
// NAVIGATION
// ======================================================


// ======================================================
// INITIALIZE NAVIGATION
// ======================================================

function initializeNavigation() {

    console.log(
        "กำลังเตรียมระบบ Navigation..."
    );


    setupNavigationEvents();


    // ----------------------------------------------
    // INITIAL ACTIVE STATE
    // ----------------------------------------------

    const currentPage =
        getCurrentPage();


    if (currentPage) {

        updateNavigationActiveState(
            currentPage
        );

    }


    console.log(
        "Navigation พร้อมใช้งาน"
    );

}


// ======================================================
// SETUP NAVIGATION EVENTS
// ======================================================

function setupNavigationEvents() {

    /*
     * ใช้ [data-page] เป็นตัวกำหนด Navigation
     *
     * ไม่แยก .nav-button อีกชุด
     * เพื่อป้องกัน Event ถูกผูกซ้ำ
     */

    const navItems =
        document.querySelectorAll(
            "[data-page]"
        );


    if (
        !navItems ||
        navItems.length === 0
    ) {

        console.warn(
            "ไม่พบ Navigation Items"
        );

        return;

    }


    navItems.forEach(
        function (
            item
        ) {

            // ------------------------------------------
            // ป้องกัน Event ซ้ำ
            // ------------------------------------------

            if (
                item.dataset.navigationBound ===
                "true"
            ) {

                return;

            }


            item.addEventListener(
                "click",
                function (
                    event
                ) {

                    event.preventDefault();


                    const pageId =
                        item.dataset.page;


                    if (!pageId) {

                        console.warn(
                            "Navigation ไม่มี data-page"
                        );

                        return;

                    }


                    showPage(
                        pageId
                    );

                }
            );


            item.dataset.navigationBound =
                "true";

        }
    );

}


// ======================================================
// SHOW PAGE
// ======================================================

function showPage(
    pageId
) {

    if (!pageId) {

        return;

    }


    console.log(
        "กำลังเปลี่ยนหน้า:",
        pageId
    );


    // ==================================================
    // CHECK TARGET PAGE
    // ==================================================

    const targetPage =
        document.getElementById(
            pageId
        );


    if (!targetPage) {

        console.warn(
            "ไม่พบหน้า:",
            pageId
        );

        return;

    }


    // ==================================================
    // CURRENT PAGE
    // ==================================================

    const currentPage =
        getCurrentPage();


    // ==================================================
    // SAME PAGE
    // ==================================================

    if (
        currentPage ===
        pageId
    ) {

        updateNavigationActiveState(
            pageId
        );


        return;

    }


    // ==================================================
    // HIDE ALL PAGES
    // ==================================================

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        function (
            page
        ) {

            page.classList.remove(
                "active"
            );

        }
    );


    // ==================================================
    // SHOW TARGET PAGE
    // ==================================================

    targetPage.classList.add(
        "active"
    );


    // ==================================================
    // UPDATE NAVIGATION ACTIVE STATE
    // ==================================================

    updateNavigationActiveState(
        pageId
    );


    // ==================================================
    // INITIALIZE PAGE
    // ==================================================

    handlePageInitialized(
        pageId
    );

}


// ======================================================
// UPDATE ACTIVE NAVIGATION
// ======================================================

function updateNavigationActiveState(
    pageId
) {

    const navItems =
        document.querySelectorAll(
            "[data-page]"
        );


    navItems.forEach(
        function (
            item
        ) {

            const itemPage =
                item.dataset.page;


            if (
                itemPage ===
                pageId
            ) {

                item.classList.add(
                    "active"
                );

            } else {

                item.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ======================================================
// GET CURRENT PAGE
// ======================================================

function getCurrentPage() {

    const activePage =
        document.querySelector(
            ".page.active"
        );


    if (!activePage) {

        return "";

    }


    return (
        activePage.id ||
        ""
    );

}


// ======================================================
// INITIALIZE PAGE
// ======================================================

function initializePage(
    pageId
) {

    if (!pageId) {

        return;

    }


    const targetPage =
        document.getElementById(
            pageId
        );


    if (!targetPage) {

        console.warn(
            "ไม่พบหน้าสำหรับ Initialize:",
            pageId
        );

        return;

    }


    handlePageInitialized(
        pageId
    );

}


// ======================================================
// END NAVIGATION
// ======================================================