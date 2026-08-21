// ========================================
// GGN Docs
// DOCUMENTS.JS
// ========================================
// หน้าที่:
// - ระบบจัดการเอกสาร
// - โหลดรายการเอกสาร
// - แสดงรายการเอกสาร
// - เปิด / ปิดฟอร์ม
// - เพิ่มเอกสาร
// - อัปเดตจำนวนเอกสารบน Dashboard
// ========================================


// ========================================
// SETUP DOCUMENTS
// ========================================

function setupDocuments() {

    // ====================================
    // ADD BUTTON
    // ====================================

    const addButton =
        document.getElementById(
            "add-document-button"
        );


    if (
        addButton &&
        !addButton.dataset.bound
    ) {

        addButton.addEventListener(
            "click",
            openDocumentForm
        );


        addButton.dataset.bound =
            "true";

    }


    // ====================================
    // CLOSE BUTTON
    // ====================================

    const closeButton =
        document.getElementById(
            "close-document-form"
        );


    if (
        closeButton &&
        !closeButton.dataset.bound
    ) {

        closeButton.addEventListener(
            "click",
            closeDocumentForm
        );


        closeButton.dataset.bound =
            "true";

    }


    // ====================================
    // CANCEL BUTTON
    // ====================================

    const cancelButton =
        document.getElementById(
            "cancel-document-button"
        );


    if (
        cancelButton &&
        !cancelButton.dataset.bound
    ) {

        cancelButton.addEventListener(
            "click",
            closeDocumentForm
        );


        cancelButton.dataset.bound =
            "true";

    }


    // ====================================
    // FORM SUBMIT
    // ====================================

    const documentForm =
        document.getElementById(
            "document-form"
        );


    if (
        documentForm &&
        !documentForm.dataset.bound
    ) {

        documentForm.addEventListener(
            "submit",
            handleDocumentSubmit
        );


        documentForm.dataset.bound =
            "true";

    }


    console.log(
        "Documents events พร้อมใช้งาน"
    );

}


// ========================================
// LOAD DOCUMENTS
// ========================================

async function loadDocuments() {

    try {

        console.log(
            "กำลังโหลดเอกสาร..."
        );


        // ====================================
        // API
        // ====================================

        const data =
            await apiGetDocuments();


        console.log(
            "ข้อมูลเอกสารจาก API:",
            data
        );


        // ====================================
        // VALIDATE RESPONSE
        // ====================================

        if (
            !data ||
            !data.success
        ) {

            console.error(
                "ไม่สามารถโหลดเอกสารได้:",
                data
            );


            documents = [];


            renderDocuments();


            updateDashboardCounts();


            return;

        }


        // ====================================
        // GET DOCUMENTS
        // ====================================

        if (
            Array.isArray(
                data.documents
            )
        ) {

            documents =
                data.documents;

        } else if (
            Array.isArray(
                data.data
            )
        ) {

            /*
             * รองรับ Backend
             * ที่อาจส่งข้อมูลใน data
             */

            documents =
                data.data;

        } else {

            documents = [];

        }


        console.log(
            "โหลดเอกสารสำเร็จ:",
            documents
        );


        console.log(
            "จำนวนเอกสาร:",
            documents.length
        );


        // ====================================
        // RENDER
        // ====================================

        renderDocuments();


        // ====================================
        // DASHBOARD
        // ====================================

        updateDashboardCounts();


    } catch (error) {

        console.error(
            "โหลดเอกสารไม่สำเร็จ:",
            error
        );


        documents = [];


        renderDocuments();


        updateDashboardCounts();

    }

}


// ========================================
// OPEN DOCUMENT FORM
// ========================================

function openDocumentForm() {

    const formContainer =
        document.getElementById(
            "document-form-container"
        );


    if (!formContainer) {

        console.warn(
            "ไม่พบ #document-form-container"
        );

        return;

    }


    formContainer.style.display =
        "block";


    formContainer.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });


    const documentCode =
        document.getElementById(
            "document-code"
        );


    if (documentCode) {

        documentCode.focus();

    }

}


// ========================================
// CLOSE DOCUMENT FORM
// ========================================

function closeDocumentForm() {

    const formContainer =
        document.getElementById(
            "document-form-container"
        );


    if (formContainer) {

        formContainer.style.display =
            "none";

    }

}


// ========================================
// HANDLE DOCUMENT SUBMIT
// ========================================

async function handleDocumentSubmit(
    event
) {

    event.preventDefault();


    // ====================================
    // FORM
    // ====================================

    const form =
        event.target;


    if (!form) {

        return;

    }


    // ====================================
    // GET FORM VALUES
    // ====================================

    const documentCodeInput =
        document.getElementById(
            "document-code"
        );


    const documentNameInput =
        document.getElementById(
            "document-name"
        );


    const operatorInput =
        document.getElementById(
            "document-operator"
        );


    const departmentInput =
        document.getElementById(
            "document-department"
        );


    const documentCode =
        documentCodeInput
            ? documentCodeInput.value.trim()
            : "";


    const documentName =
        documentNameInput
            ? documentNameInput.value.trim()
            : "";


    const operator =
        operatorInput
            ? operatorInput.value.trim()
            : "";


    const department =
        departmentInput
            ? departmentInput.value.trim()
            : "";


    // ====================================
    // VALIDATE
    // ====================================

    if (
        !documentCode ||
        !documentName ||
        !operator ||
        !department
    ) {

        alert(
            "กรุณากรอกข้อมูลให้ครบทุกช่อง"
        );

        return;

    }


    // ====================================
    // CURRENT USER
    // ====================================

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


    // ====================================
    // SUBMIT BUTTON
    // ====================================

    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "กำลังบันทึก...";

    }


    try {

        // ==================================
        // DOCUMENT DATA
        // ==================================

        const documentData = {

            documentCode:
                documentCode,

            documentName:
                documentName,

            operator:
                operator,

            department:
                department,

            createdByName:
                user.name ||
                "",

            createdByEmail:
                user.email ||
                ""

        };


        console.log(
            "กำลังส่งข้อมูลเอกสาร:",
            documentData
        );


        // ==================================
        // API
        // ==================================

        const data =
            await apiAddDocument(
                documentData
            );


        console.log(
            "ผลการเพิ่มเอกสาร:",
            data
        );


        // ==================================
        // SUCCESS
        // ==================================

        if (
            data &&
            data.success
        ) {

            alert(
                "เพิ่มเอกสารสำเร็จ"
            );


            // ==================================
            // RESET FORM
            // ==================================

            form.reset();


            // ==================================
            // CLOSE FORM
            // ==================================

            closeDocumentForm();


            // ==================================
            // RELOAD DOCUMENTS
            // ==================================

            await loadDocuments();


        } else {

            alert(

                data &&
                data.message

                    ? data.message

                    : "ไม่สามารถเพิ่มเอกสารได้"

            );

        }


    } catch (error) {

        console.error(
            "บันทึกเอกสารไม่สำเร็จ:",
            error
        );


        alert(
            "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
        );


    } finally {

        // ==================================
        // RESTORE BUTTON
        // ==================================

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "บันทึกเอกสาร";

        }

    }

}


// ========================================
// RENDER DOCUMENTS
// ========================================

function renderDocuments() {

    const tableBody =
        document.getElementById(
            "document-table-body"
        );


    const documentCount =
        document.getElementById(
            "document-count"
        );


    // ====================================
    // STATE SAFETY
    // ====================================

    if (
        !Array.isArray(
            documents
        )
    ) {

        documents = [];

    }


    // ====================================
    // TABLE NOT FOUND
    // ====================================

    if (!tableBody) {

        return;

    }


    // ====================================
    // DOCUMENT COUNT
    // ====================================

    if (documentCount) {

        documentCount.textContent =
            documents.length;

    }


    // ====================================
    // EMPTY STATE
    // ====================================

    if (
        documents.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="document-empty"
                >

                    <div>
                        📄
                    </div>

                    <strong>
                        ยังไม่มีเอกสาร
                    </strong>

                    <span>
                        กดปุ่ม “เพิ่มเอกสาร”
                        เพื่อเพิ่มเอกสารรายการแรก
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    // ====================================
    // DOCUMENT LIST
    // ====================================

    tableBody.innerHTML =

        documents

            .map(
                function (
                    documentItem
                ) {

                    if (!documentItem) {

                        return "";

                    }


                    const code =
                        documentItem.documentCode ||
                        "";


                    const name =
                        documentItem.documentName ||
                        "";


                    const operator =
                        documentItem.operator ||
                        "";


                    const department =
                        documentItem.department ||
                        "";


                    return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    code
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    name
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    operator
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    department
                                )}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="document-action-button"
                                    disabled
                                >
                                    จัดการ
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )

            .join("");

}


// ========================================
// DASHBOARD COUNTS
// ========================================

function updateDashboardCounts() {

    // ====================================
    // STATE SAFETY
    // ====================================

    if (
        !Array.isArray(
            documents
        )
    ) {

        documents = [];

    }


    // ====================================
    // TOTAL DOCUMENTS
    // ====================================

    const total =
        documents.length;


    // ====================================
    // CURRENT USER
    // ====================================

    const user =
        getCurrentUser();


    let myDocuments =
        0;


    // ====================================
    // COUNT MY DOCUMENTS
    // ====================================

    if (user) {

        const currentEmail =
            String(
                user.email ||
                ""
            )
            .trim()
            .toLowerCase();


        if (currentEmail) {

            myDocuments =
                documents.filter(

                    function (
                        documentItem
                    ) {

                        if (
                            !documentItem
                        ) {

                            return false;

                        }


                        const createdByEmail =
                            String(

                                documentItem.createdByEmail ||
                                documentItem.createdBy ||
                                ""

                            )
                            .trim()
                            .toLowerCase();


                        return (
                            createdByEmail ===
                            currentEmail
                        );

                    }

                ).length;

        }

    }


    // ====================================
    // UPDATE TOTAL
    // ====================================

    const totalElement =
        document.getElementById(
            "dashboard-total-documents"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    // ====================================
    // UPDATE MY DOCUMENTS
    // ====================================

    const myDocumentsElement =
        document.getElementById(
            "dashboard-my-documents"
        );


    if (myDocumentsElement) {

        myDocumentsElement.textContent =
            myDocuments;

    }

}


// ========================================
// END DOCUMENTS.JS
// ========================================