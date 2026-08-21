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

        setupISOMenu();

        setupDocumentSearch();

    }
);
