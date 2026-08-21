// ======================================================
// GGN Docs
// DOCUMENT SEARCH
// ======================================================
// หน้าที่:
// - ค้นหาเอกสารจากข้อมูลใน State
// - ค้นหาจากรหัสเอกสาร
// - ค้นหาจากชื่อเอกสาร
// - ค้นหาจากผู้ปฏิบัติงาน
// - ค้นหาจากหน่วยงาน
// - รองรับปุ่มค้นหา
// - รองรับ Enter
// ======================================================


// ======================================================
// SEARCH DOCUMENTS
// ======================================================

function searchDocuments(
    keyword
) {

    const searchKeyword =
        String(
            keyword || ""
        )
        .trim()
        .toLowerCase();


    // ==================================================
    // ตรวจสอบ State
    // ==================================================

    if (
        !Array.isArray(
            documents
        )
    ) {

        return [];

    }


    // ==================================================
    // ไม่มี Keyword
    // ==================================================

    if (!searchKeyword) {

        return documents;

    }


    // ==================================================
    // SEARCH
    // ==================================================

    return documents.filter(
        function (
            item
        ) {

            if (!item) {

                return false;

            }


            // ------------------------------------------
            // DOCUMENT CODE
            // ------------------------------------------

            const code =
                String(
                    item.documentCode ||
                    ""
                )
                .toLowerCase();


            // ------------------------------------------
            // DOCUMENT NAME
            // ------------------------------------------

            const name =
                String(
                    item.documentName ||
                    ""
                )
                .toLowerCase();


            // ------------------------------------------
            // OPERATOR
            // ------------------------------------------

            const operator =
                String(
                    item.operator ||
                    ""
                )
                .toLowerCase();


            // ------------------------------------------
            // DEPARTMENT
            // ------------------------------------------

            const department =
                String(
                    item.department ||
                    ""
                )
                .toLowerCase();


            // ------------------------------------------
            // SEARCH MATCH
            // ------------------------------------------

            return (

                code.includes(
                    searchKeyword
                ) ||

                name.includes(
                    searchKeyword
                ) ||

                operator.includes(
                    searchKeyword
                ) ||

                department.includes(
                    searchKeyword
                )

            );

        }
    );

}


// ======================================================
// SEARCH PAGE SETUP
// ======================================================

function setupDocumentSearch() {

    const input =
        document.getElementById(
            "document-search"
        );


    const button =
        document.querySelector(
            "#page-search .search-box button"
        );


    // ==================================================
    // INPUT NOT FOUND
    // ==================================================

    if (!input) {

        console.warn(
            "ไม่พบ #document-search"
        );

        return;

    }


    // ==================================================
    // ป้องกัน Event ซ้ำ
    // ==================================================

    if (
        input.dataset.searchBound
    ) {

        return;

    }


    // ==================================================
    // EXECUTE SEARCH
    // ==================================================

    function executeSearch() {

        const keyword =
            input.value;


        const results =
            searchDocuments(
                keyword
            );


        console.log(
            "คำค้นหา:",
            keyword
        );


        console.log(
            "ผลการค้นหา:",
            results
        );


        // ----------------------------------------------
        // EMPTY KEYWORD
        // ----------------------------------------------

        if (
            !String(
                keyword || ""
            ).trim()
        ) {

            alert(
                "กรุณาระบุคำค้นหา"
            );

            return;

        }


        // ----------------------------------------------
        // NO RESULTS
        // ----------------------------------------------

        if (
            results.length === 0
        ) {

            alert(
                "ไม่พบเอกสารที่ค้นหา"
            );

            return;

        }


        // ----------------------------------------------
        // RESULTS
        // ----------------------------------------------

        alert(
            `พบเอกสาร ${results.length} รายการ`
        );

    }


    // ==================================================
    // SEARCH BUTTON
    // ==================================================

    if (button) {

        if (
            !button.dataset.searchBound
        ) {

            button.addEventListener(
                "click",
                executeSearch
            );


            button.dataset.searchBound =
                "true";

        }

    }


    // ==================================================
    // ENTER KEY
    // ==================================================

    input.addEventListener(
        "keydown",
        function (
            event
        ) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                executeSearch();

            }

        }
    );


    // ==================================================
    // MARK AS BOUND
    // ==================================================

    input.dataset.searchBound =
        "true";

}


// ======================================================
// END SEARCH
// ======================================================