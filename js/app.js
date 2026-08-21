// ======================================================
// GGN Docs
// APP.JS
// Main Application Controller
// ======================================================


// ======================================================
// APPLICATION INITIALIZE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


// ======================================================
// INITIALIZE APP
// ======================================================

function initializeApp() {

    console.log(
        "กำลังเริ่มต้น GGN Docs..."
    );


    // ==================================================
    // AUTHENTICATION
    // ==================================================

    initializeAuthentication();


    // ==================================================
    // NAVIGATION
    // ==================================================

    initializeNavigation();


    // ==================================================
    // DOCUMENT SYSTEM
    // ==================================================

    setupDocuments();


    // ==================================================
    // INSPECTION SYSTEM
    // ==================================================

    setupInspections();


    // ==================================================
    // DOCUMENT SEARCH
    // ==================================================

    setupDocumentSearch();


    // ==================================================
    // INITIAL PAGE
    // ==================================================

    initializeCurrentPage();


    // ==================================================
    // APP READY
    // ==================================================

    appReady();


    console.log(
        "GGN Docs เริ่มต้นระบบเรียบร้อย"
    );

}


// ======================================================
// AUTHENTICATION INITIALIZE
// ======================================================

function initializeAuthentication() {

    console.log(
        "กำลังเตรียมระบบ Authentication..."
    );


    // ==================================================
    // RESTORE SESSION
    // ==================================================

    const currentUser =
        restoreSession();


    if (currentUser) {

        console.log(
            "พบ Session เดิม:",
            currentUser
        );

    }


    // ==================================================
    // GOOGLE LOGIN
    // ==================================================

    waitForGoogle();


    // ==================================================
    // LOGOUT
    // ==================================================

    setupLogout();


    console.log(
        "Authentication พร้อมใช้งาน"
    );

}


// ======================================================
// INITIALIZE CURRENT PAGE
// ======================================================

function initializeCurrentPage() {

    const activePage =
        document.querySelector(
            ".page.active"
        );


    if (!activePage) {

        console.warn(
            "ไม่พบ Active Page"
        );

        return;

    }


    const pageId =
        activePage.id;


    console.log(
        "หน้าปัจจุบัน:",
        pageId
    );


    initializePageById(
        pageId
    );

}


// ======================================================
// INITIALIZE PAGE BY ID
// ======================================================

function initializePageById(
    pageId
) {

    if (!pageId) {

        return;

    }


    console.log(
        "Initialize Page:",
        pageId
    );


    switch (
        pageId
    ) {


        // ==============================================
        // DASHBOARD
        // ==============================================

        case "page-dashboard":

            initializeDashboardPage();

            break;


        // ==============================================
        // DOCUMENTS
        // ==============================================

        case "page-documents":

            /*
             * setupDocuments()
             * ถูกเรียกตอน initializeApp()
             *
             * จึงไม่ต้อง setup Event ซ้ำ
             *
             * และไม่ต้อง loadDocuments() ซ้ำ
             * เพราะ setupDocuments() โหลดข้อมูล
             * ตั้งแต่เริ่มต้นระบบแล้ว
             */

            console.log(
                "หน้า Documents พร้อมใช้งาน"
            );

            break;


        // ==============================================
        // INSPECTIONS
        // ==============================================

        case "page-inspections":

            if (
                typeof initializeInspectionPage ===
                "function"
            ) {

                initializeInspectionPage();

            } else {

                console.warn(
                    "ไม่พบ initializeInspectionPage()"
                );

            }

            break;


        // ==============================================
        // FM-OP-11
        // ==============================================

        case "page-fmop11":

            if (
                typeof initializeFMOP11Page ===
                "function"
            ) {

                initializeFMOP11Page();

            } else {

                console.warn(
                    "ไม่พบ initializeFMOP11Page()"
                );

            }

            break;


        // ==============================================
        // SEARCH
        // ==============================================

        case "page-search":

            /*
             * setupDocumentSearch()
             * ถูกเรียกตอน initializeApp()
             *
             * จึงไม่ต้องผูก Event ซ้ำ
             */

            console.log(
                "หน้า Search พร้อมใช้งาน"
            );

            break;


        // ==============================================
        // SETTINGS
        // ==============================================

        case "page-settings":

            if (
                typeof initializeSettingsPage ===
                "function"
            ) {

                initializeSettingsPage();

            } else {

                console.warn(
                    "ไม่พบ initializeSettingsPage()"
                );

            }

            break;


        // ==============================================
        // DEFAULT
        // ==============================================

        default:

            console.log(
                "ไม่มี initializer สำหรับหน้า:",
                pageId
            );

            break;

    }

}


// ======================================================
// PAGE CHANGE HANDLER
// ======================================================

function handlePageInitialized(
    pageId
) {

    if (!pageId) {

        return;

    }


    console.log(
        "กำลัง initialize หน้า:",
        pageId
    );


    initializePageById(
        pageId
    );

}


// ======================================================
// DASHBOARD
// ======================================================

function initializeDashboardPage() {

    console.log(
        "กำลังเตรียมหน้า Dashboard..."
    );


    if (
        typeof updateDashboardCounts ===
        "function"
    ) {

        updateDashboardCounts();

    }

}


// ======================================================
// APP READY
// ======================================================

function appReady() {

    if (document.body) {

        document.body.classList.add(
            "app-ready"
        );

    }


    console.log(
        "GGN Docs พร้อมใช้งาน"
    );

}


// ======================================================
// END APP.JS
// ======================================================