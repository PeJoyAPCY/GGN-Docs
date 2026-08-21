// SEARCH DOCUMENTS
// ======================================================


// ========================================
// SEARCH
// ========================================

function searchDocuments(
    keyword
) {

    const searchKeyword =
        String(
            keyword || ""
        )
        .trim()
        .toLowerCase();


    if (!searchKeyword) {

        return documents;

    }


    return documents.filter(
        function (
            item
        ) {

            const code =
                String(
                    item.documentCode ||
                    ""
                )
                .toLowerCase();


            const name =
                String(
                    item.documentName ||
                    ""
                )
                .toLowerCase();


            const operator =
                String(
                    item.operator ||
                    ""
                )
                .toLowerCase();


            const department =
                String(
                    item.department ||
                    ""
                )
                .toLowerCase();


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


// ========================================
// SEARCH PAGE SETUP
// ========================================

function setupDocumentSearch() {

    const input =
        document.getElementById(
            "document-search"
        );


    const button =
        document.querySelector(
            "#page-search .search-box button"
        );


    if (!input) {

        return;

    }


    function executeSearch() {

        const results =
            searchDocuments(
                input.value
            );


        console.log(
            "ผลการค้นหา:",
            results
        );


        if (
            results.length === 0
        ) {

            alert(
                "ไม่พบเอกสารที่ค้นหา"
            );

            return;

        }


        alert(
            `พบเอกสาร ${results.length} รายการ`
        );

    }


    if (button) {

        button.addEventListener(
            "click",
            executeSearch
        );

    }


    input.addEventListener(
        "keydown",
        function (
            event
        ) {

            if (
                event.key ===
                "Enter"
            ) {

                executeSearch();

            }

        }
    );

}


// ========================================
// END APP.JS
// ========================================
