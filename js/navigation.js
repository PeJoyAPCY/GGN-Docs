// NAVIGATION
// ========================================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    const page =
                        item.dataset.page;


                    if (!page) {

                        return;

                    }


                    showPage(
                        page
                    );

                }
            );

        }
    );

}


// ========================================
// SHOW PAGE
// ========================================

function showPage(
    page
) {

    // ------------------------------------
    // Hide all pages
    // ------------------------------------

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        function (item) {

            item.style.display =
                "none";

            item.classList.remove(
                "active"
            );

        }
    );


    // ------------------------------------
    // Show selected page
    // ------------------------------------

    const selectedPage =
        document.getElementById(
            "page-" + page
        );


    if (selectedPage) {

        selectedPage.style.display =
            "block";

        selectedPage.classList.add(
            "active"
        );

    }


    // ------------------------------------
    // Update sidebar active state
    // ------------------------------------

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function (item) {

            item.classList.remove(
                "active"
            );


            if (
                item.dataset.page ===
                page
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );


    // ------------------------------------
    // Documents
    // ------------------------------------

    if (
        page === "documents"
    ) {

        loadDocuments();

    }


    // ------------------------------------
    // Inspection Record
    // ------------------------------------

    if (
        page === "inspection-record"
    ) {

        initializeInspectionPage();

    }

}


// ========================================
// OPEN INSPECTION RECORD PAGE
// ========================================

function openInspectionRecordPage() {

    showPage(
        "inspection-record"
    );

}


// ========================================
// OPEN FM-OP-11 GENERATOR PAGE
// ========================================

function openFMOP11Page() {

    showPage(
        "fmop11"
    );

}


// ========================================
// SETUP ISO MENU
// ========================================

function setupISOMenu() {

    console.log(
        "กำลังเตรียมเมนู ISO..."
    );


    // ====================================
    // OPEN INSPECTION RECORD
    // ====================================

    const inspectionButton =
        document.getElementById(
            "open-inspection-record"
        );


    if (inspectionButton) {

        inspectionButton.addEventListener(
            "click",
            function () {

                console.log(
                    "เปิดหน้าบันทึกการตรวจ"
                );


                openInspectionRecordPage();

            }
        );

    } else {

        console.warn(
            "ไม่พบ #open-inspection-record"
        );

    }


    // ====================================
    // OPEN FM-OP-11 GENERATOR
    // ====================================

    const fmop11Button =
        document.getElementById(
            "open-fmop11-generator"
        );


    if (fmop11Button) {

        fmop11Button.addEventListener(
            "click",
            function () {

                console.log(
                    "เปิดหน้าสร้างรายงาน FM-OP-11"
                );


                openFMOP11Page();

            }
        );

    } else {

        console.warn(
            "ไม่พบ #open-fmop11-generator"
        );

    }


    // ====================================
    // BACK FROM INSPECTION RECORD
    // ====================================

    const backFromRecord =
        document.getElementById(
            "back-to-inspections-from-record"
        );


    if (backFromRecord) {

        backFromRecord.addEventListener(
            "click",
            function () {

                console.log(
                    "กลับไปหน้าเมนูการตรวจ ISO"
                );


                showPage(
                    "inspections"
                );

            }
        );

    }


    // ====================================
    // BACK FROM FM-OP-11
    // ====================================

    const backFromFMOP11 =
        document.getElementById(
            "back-to-inspections-from-fmop11"
        );


    if (backFromFMOP11) {

        backFromFMOP11.addEventListener(
            "click",
            function () {

                console.log(
                    "กลับไปหน้าเมนูการตรวจ ISO"
                );


                showPage(
                    "inspections"
                );

            }
        );

    }


    // ====================================
    // COMPLETE
    // ====================================

    console.log(
        "เตรียมเมนู ISO สำเร็จ"
    );

}


// ========================================
// ========================================
// OPEN INSPECTION RECORD PAGE
// ========================================

function openInspectionRecordPage() {

    showPage(
        "inspection-record"
    );

}


// ========================================
// OPEN FM-OP-11 GENERATOR PAGE
// ========================================

function openFMOP11Page() {

    showPage(
        "fmop11"
    );

    initializeFMOP11Page();

}


// ========================================
// SETUP ISO MENU
// ========================================

// ========================================
// SETUP ISO MENU
// ========================================

function setupISOMenu() {

    console.log(
        "กำลังเตรียมเมนู ISO..."
    );


    // ====================================
    // OPEN INSPECTION RECORD
    // ====================================

    const inspectionButton =
        document.getElementById(
            "open-inspection-record"
        );


    if (inspectionButton) {

        inspectionButton.addEventListener(
            "click",
            function () {

                console.log(
                    "เปิดหน้าบันทึกการตรวจ"
                );


                openInspectionRecordPage();

            }
        );

    } else {

        console.warn(
            "ไม่พบปุ่ม #open-inspection-record"
        );

    }


    // ====================================
    // OPEN FM-OP-11 GENERATOR
    // ====================================

    const fmop11Button =
        document.getElementById(
            "open-fmop11-generator"
        );


    if (fmop11Button) {

        fmop11Button.addEventListener(
            "click",
            function () {

                console.log(
                    "เปิดหน้าสร้างรายงาน FM-OP-11"
                );


                openFMOP11Page();

            }
        );

    } else {

        console.warn(
            "ไม่พบปุ่ม #open-fmop11-generator"
        );

    }


    // ====================================
    // BACK FROM INSPECTION RECORD
    // ====================================

    const backFromRecord =
        document.getElementById(
            "back-to-inspections-from-record"
        );


    if (backFromRecord) {

        backFromRecord.addEventListener(
            "click",
            function () {

                console.log(
                    "กลับไปหน้าเมนูการตรวจ ISO"
                );


                showPage(
                    "inspections"
                );

            }
        );

    }


    // ====================================
    // BACK FROM FM-OP-11
    // ====================================

    const backFromFMOP11 =
        document.getElementById(
            "back-to-inspections-from-fmop11"
        );


    if (backFromFMOP11) {

        backFromFMOP11.addEventListener(
            "click",
            function () {

                console.log(
                    "กลับไปหน้าเมนูการตรวจ ISO"
                );


                showPage(
                    "inspections"
                );

            }
        );

    }


    // ====================================
    // COMPLETE
    // ====================================

    console.log(
        "เตรียมเมนู ISO สำเร็จ"
    );

}


// ========================================
// SETUP INSPECTION PAGE EVENTS
// ========================================

function setupInspectionPageEvents() {

    if (
        inspectionPageInitialized
    ) {

        return;

    }


    const backButton =
        document.getElementById(
            "back-to-inspections-from-record"
        );


    const backFMOP11Button =
        document.getElementById(
            "back-to-inspections-from-fmop11"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                showPage(
                    "inspections"
                );

            }
        );

    }


    if (backFMOP11Button) {

        backFMOP11Button.addEventListener(
            "click",
            function () {

                showPage(
                    "inspections"
                );

            }
        );

    }


    inspectionPageInitialized =
        true;

}


// ========================================
