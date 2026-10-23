
/**
 * ======================================================
 * GGN DOCS - DOCUMENT SEARCH
 * VERSION: 2.0.0
 * DATE: 2026-10-23
 *
 * PURPOSE
 * - ค้นหาเอกสารจากข้อมูลที่โหลดแล้วใน documents
 * - ค้นหาจากรหัสเอกสาร ชื่อเอกสาร ผู้รับผิดชอบ และแผนก
 * - แสดงผลการค้นหาบนหน้า page-search
 * - รองรับปุ่มค้นหาและปุ่ม Enter
 * - รองรับการล้างการค้นหา
 *
 * IMPORTANT
 * - ไม่แก้ไขข้อมูลใน documents
 * - ไม่เรียก API สำหรับเพิ่ม แก้ไข หรือลบเอกสาร
 * - ไม่เปลี่ยนแปลงระบบตรวจสอบสิทธิ์
 * - ใช้ข้อมูล documents ที่ Backend ส่งมาแล้วเท่านั้น
 * ======================================================
 */


// ======================================================
// SEARCH DOCUMENTS
// ======================================================

function searchDocuments(keyword) {

    const searchKeyword =
        String(keyword || "")
            .trim()
            .toLowerCase();


    // ------------------------------------
    // ตรวจสอบข้อมูลเอกสาร
    // ------------------------------------

    if (
        typeof documents === "undefined" ||
        !Array.isArray(documents)
    ) {

        return [];

    }


    // ------------------------------------
    // ค้นหาว่าง = แสดงเอกสารทั้งหมด
    // ตามข้อมูลที่ผู้ใช้มีสิทธิ์เข้าถึง
    // ------------------------------------

    if (!searchKeyword) {

        return documents.slice();

    }


    // ------------------------------------
    // Search
    // ------------------------------------

    return documents.filter(
        function (item) {

            const code =
                String(
                    item.documentCode || ""
                ).toLowerCase();

            const name =
                String(
                    item.documentName || ""
                ).toLowerCase();

            const operator =
                String(
                    item.operator || ""
                ).toLowerCase();

            const department =
                String(
                    item.department || ""
                ).toLowerCase();


            return (

                code.includes(searchKeyword) ||

                name.includes(searchKeyword) ||

                operator.includes(searchKeyword) ||

                department.includes(searchKeyword)

            );

        }
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeDocumentSearchHTML(value) {

    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


// ======================================================
// SETUP DOCUMENT SEARCH
// ======================================================

function setupDocumentSearch() {

    const searchPage =
        document.getElementById(
            "page-search"
        );


    const searchBox =
        searchPage
            ? searchPage.querySelector(
                ".search-box"
            )
            : null;


    const input =
        document.getElementById(
            "document-search"
        );


    const button =
        searchPage
            ? searchPage.querySelector(
                ".search-box button"
            )
            : null;


    // ------------------------------------
    // ตรวจสอบองค์ประกอบ
    // ------------------------------------

    if (
        !searchPage ||
        !searchBox ||
        !input
    ) {

        console.warn(
            "Document Search: ไม่พบองค์ประกอบหน้าค้นหา"
        );

        return;

    }


    // ------------------------------------
    // ป้องกันการผูก Event ซ้ำ
    // ------------------------------------

    if (
        input.dataset.documentSearchInitialized === "true"
    ) {

        return;

    }


    input.dataset.documentSearchInitialized =
        "true";


    // ------------------------------------
    // สร้างพื้นที่แสดงผล
    // หากยังไม่มี
    // ------------------------------------

    let resultsContainer =
        document.getElementById(
            "document-search-results"
        );


    if (!resultsContainer) {

        resultsContainer =
            document.createElement("div");

        resultsContainer.id =
            "document-search-results";

        resultsContainer.className =
            "document-search-results";


        searchBox.insertAdjacentElement(
            "afterend",
            resultsContainer
        );

    }


    // ------------------------------------
    // สร้างพื้นที่แสดงผล
    // ------------------------------------

    function renderSearchResults(
        results,
        keyword
    ) {

        if (!resultsContainer) {

            return;

        }


        const total =
            results.length;


        const safeKeyword =
            escapeDocumentSearchHTML(
                keyword
            );


        // ----------------------------
        // ไม่พบข้อมูล
        // ----------------------------

        if (total === 0) {

            resultsContainer.innerHTML = `

                <div class="document-search-summary">

                    <strong>ผลการค้นหา: 0 รายการ</strong>

                    <p>
                        ไม่พบเอกสารที่ตรงกับ
                        "${safeKeyword}"
                    </p>

                </div>

                <div class="document-search-empty">

                    <div>📄</div>

                    <strong>ไม่พบเอกสาร</strong>

                    <p>
                        ลองตรวจสอบคำค้นหา
                        หรือใช้คำค้นหาอื่น
                    </p>

                </div>

            `;

            return;

        }


        // ----------------------------
        // สร้างแถวผลการค้นหา
        // ----------------------------

        const rows =
            results.map(
                function (item) {

                    return `

                        <tr>

                            <td>
                                ${escapeDocumentSearchHTML(
                                    item.documentCode || ""
                                )}
                            </td>

                            <td>
                                ${escapeDocumentSearchHTML(
                                    item.documentName || ""
                                )}
                            </td>

                            <td>
                                ${escapeDocumentSearchHTML(
                                    item.operator || ""
                                )}
                            </td>

                            <td>
                                ${escapeDocumentSearchHTML(
                                    item.department || ""
                                )}
                            </td>

                        </tr>

                    `;

                }
            ).join("");


        // ----------------------------
        // แสดงผลการค้นหา
        // ----------------------------

        resultsContainer.innerHTML = `

            <div class="document-search-summary">

                <strong>
                    ผลการค้นหา: ${total} รายการ
                </strong>

                ${
                    keyword
                        ? `<p>คำค้นหา: "${safeKeyword}"</p>`
                        : `<p>แสดงเอกสารทั้งหมดที่คุณมีสิทธิ์เข้าถึง</p>`
                }

            </div>

            <div class="document-search-table-wrapper">

                <table class="document-search-table">

                    <thead>

                        <tr>

                            <th>รหัสเอกสาร</th>

                            <th>ชื่อเอกสาร</th>

                            <th>ผู้รับผิดชอบ</th>

                            <th>แผนก</th>

                        </tr>

                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>

        `;

    }


    // ------------------------------------
    // EXECUTE SEARCH
    // ------------------------------------

    function executeSearch() {

        const keyword =
            input.value.trim();


        const results =
            searchDocuments(keyword);


        console.log(
            "ผลการค้นหาเอกสาร:",
            {
                keyword: keyword,
                total: results.length,
                results: results
            }
        );


        renderSearchResults(
            results,
            keyword
        );

    }


    // ------------------------------------
    // CLEAR SEARCH
    // ------------------------------------

    function clearSearch() {

        input.value = "";

        input.focus();

        executeSearch();

    }


    // ------------------------------------
    // SEARCH BUTTON
    // ------------------------------------

    if (button) {

        button.addEventListener(
            "click",
            executeSearch
        );

    }


    // ------------------------------------
    // ENTER KEY
    // ------------------------------------

    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                executeSearch();

            }

        }
    );


    // ------------------------------------
    // CLEAR BUTTON
    // สร้างเพิ่มโดยไม่แก้ HTML เดิม
    // ------------------------------------

    let clearButton =
        searchBox.querySelector(
            "#clear-document-search"
        );


    if (!clearButton) {

        clearButton =
            document.createElement("button");

        clearButton.type =
            "button";

        clearButton.id =
            "clear-document-search";

        clearButton.textContent =
            "ล้างการค้นหา";

        clearButton.className =
            "document-search-clear-button";


        searchBox.appendChild(
            clearButton
        );

    }


    clearButton.addEventListener(
        "click",
        clearSearch
    );


    console.log(
        "Document Search พร้อมใช้งาน"
    );

}
