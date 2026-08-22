// ========================================
// APPLICATION START
// ========================================

window.addEventListener(
    "load",
    function () {

        testAPI();

        restoreSession();

        waitForGoogle();

        setupNavigation();

        setupLogout();

        setupDocuments();

        setupInspections();
        
        setupPopup();

        setupISOMenu();

        setupDocumentSearch();

    }
);



// ========================================
// END APP.JS
// ========================================