// ======================================================
// GGN DOCS - DOCUMENT SYSTEM
// VERSION: 2.6.0
// DATE: 2026-10-03
//
// CHANGE
// - ใช้ API wrapper กลางสำหรับ Document System
// - apiGetDocuments() เป็นผู้ส่ง requesterEmail
// - apiAddDocument() เป็นผู้ส่ง requesterEmail
// - ไม่ส่ง createdByName / createdByEmail จาก Frontend
// - Backend เป็น Source of Truth สำหรับผู้สร้างเอกสาร
// - Backend เป็นผู้ตรวจสอบ Document Permission
// - User ปกติเห็นเฉพาะเอกสารของตัวเอง
// - Admin เห็นเอกสารทั้งหมด
// - ใช้ Current User จาก Session สำหรับตรวจสถานะการใช้งาน
// ======================================================


// ======================================================
// SETUP DOCUMENTS
// ======================================================

function setupDocuments() {

    const addButton =
        document.getElementById(
            "add-document-button"
        );


    const closeButton =
        document.getElementById(
            "close-document-form"
        );


    const cancelButton =
        document.getElementById(
            "cancel-document-button"
        );


    const documentForm =
        document.getElementById(
            "document-form"
        );


    // ------------------------------------
    // ADD BUTTON
    // ------------------------------------

    if (addButton) {

        addButton.addEventListener(
            "click",
            openDocumentForm
        );

    }


    // ------------------------------------
    // CLOSE BUTTON
    // ------------------------------------

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDocumentForm
        );

    }


    // ------------------------------------
    // CANCEL BUTTON
    // ------------------------------------

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeDocumentForm
        );

    }


    // ------------------------------------
    // FORM SUBMIT
    // ------------------------------------

    if (documentForm) {

        documentForm.addEventListener(
            "submit",
            handleDocumentSubmit
        );

    }


    // ------------------------------------
    // LOAD DOCUMENTS
    // ------------------------------------

    loadDocuments();

}


// ======================================================
// LOAD DOCUMENTS
// ======================================================

async function loadDocuments() {

    try {

        console.log(
            "กำลังโหลดเอกสาร..."
        );


        // --------------------------------
        // ตรวจสอบ Current User
        // --------------------------------

        const user =
            getCurrentGGNUser();


        if (
            !user ||
            !user.email
        ) {

            console.warn(
                "ไม่พบ Current User สำหรับโหลดเอกสาร"
            );

            return;

        }


        console.log(
            "Document requester:",
            user.email
        );


        // --------------------------------
        // เรียก API กลาง
        //
        // apiGetDocuments()
        // จะส่ง requesterEmail
        // จาก Current User ไป Backend
        // --------------------------------

        const data =
            await apiGetDocuments();


        console.log(
            "ข้อมูลเอกสารจาก API:",
            data
        );


        // --------------------------------
        // ตรวจสอบผลลัพธ์
        // --------------------------------

        if (
            !data ||
            !data.success ||
            !Array.isArray(
                data.documents
            )
        ) {

            console.error(
                "ไม่สามารถโหลดเอกสารได้:",
                data
            );

            return;

        }


        // --------------------------------
        // เก็บข้อมูล
        // --------------------------------

        documents =
            data.documents;


        // --------------------------------
        // Render
        // --------------------------------

        renderDocuments();

        updateDashboardCounts();


    } catch (error) {

        console.error(
            "โหลดเอกสารไม่สำเร็จ:",
            error
        );

    }

}


// ======================================================
// OPEN DOCUMENT FORM
// ======================================================

function openDocumentForm() {

    const formContainer =
        document.getElementById(
            "document-form-container"
        );


    if (!formContainer) {

        return;

    }


    // --------------------------------
    // เปิด Form
    // --------------------------------

    formContainer.style.display =
        "block";


    // --------------------------------
    // Scroll ไปยัง Form
    // --------------------------------

    formContainer.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });


    // --------------------------------
    // Focus Document Code
    // --------------------------------

    const documentCode =
        document.getElementById(
            "document-code"
        );


    if (documentCode) {

        documentCode.focus();

    }

}


// ======================================================
// CLOSE DOCUMENT FORM
// ======================================================

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


// ======================================================
// ADD DOCUMENT
// ======================================================

async function handleDocumentSubmit(
    event
) {

    event.preventDefault();


    // ------------------------------------
    // อ่านข้อมูลจาก Form
    // ------------------------------------

    const documentCodeElement =
        document.getElementById(
            "document-code"
        );


    const documentNameElement =
        document.getElementById(
            "document-name"
        );


    const operatorElement =
        document.getElementById(
            "document-operator"
        );


    const departmentElement =
        document.getElementById(
            "document-department"
        );


    const documentCode =
        documentCodeElement
            ? documentCodeElement.value.trim()
            : "";


    const documentName =
        documentNameElement
            ? documentNameElement.value.trim()
            : "";


    const operator =
        operatorElement
            ? operatorElement.value.trim()
            : "";


    const department =
        departmentElement
            ? departmentElement.value.trim()
            : "";


    // ------------------------------------
    // Validate Form
    // ------------------------------------

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


    // ------------------------------------
    // Current User
    //
    // ใช้สำหรับตรวจว่ามี Session อยู่หรือไม่
    //
    // ไม่ใช้ข้อมูลนี้เพื่อกำหนด
    // createdBy ใน Backend
    // ------------------------------------

    const user =
        getCurrentGGNUser();


    if (
        !user ||
        !user.email
    ) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


    console.log(
        "Current Document User:",
        user
    );


    // ------------------------------------
    // Submit Button
    // ------------------------------------

    const submitButton =
        event.target.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "กำลังบันทึก...";

    }


    try {

        // --------------------------------
        // Document Data
        //
        // สำคัญ:
        //
        // ไม่ส่ง
        // createdByName
        // createdByEmail
        //
        // เพราะ Backend จะใช้
        // requesterEmail
        // เป็นตัวตรวจสอบ User
        // และสร้างข้อมูลผู้สร้างเอง
        // --------------------------------

        const documentData = {

            documentCode:
                documentCode,

            documentName:
                documentName,

            operator:
                operator,

            department:
                department

        };


        console.log(
            "กำลังส่งข้อมูลเอกสาร:",
            documentData
        );


        // --------------------------------
        // เรียก API กลาง
        //
        // apiAddDocument()
        // จะเพิ่ม requesterEmail
        // จาก Current User ให้อัตโนมัติ
        // --------------------------------

        const data =
            await apiAddDocument(
                documentData
            );


        console.log(
            "ผลการบันทึกเอกสาร:",
            data
        );


        // --------------------------------
        // Success
        // --------------------------------

        if (
            data &&
            data.success
        ) {

            alert(
                "เพิ่มเอกสารสำเร็จ"
            );


            // ----------------------------
            // โหลดรายการใหม่
            // ----------------------------

            await loadDocuments();


            // ----------------------------
            // Reset Form
            // ----------------------------

            const form =
                document.getElementById(
                    "document-form"
                );


            if (form) {

                form.reset();

            }


            // ----------------------------
            // Close Form
            // ----------------------------

            closeDocumentForm();


        } else {

            alert(

                (
                    data &&
                    data.message
                )
                ||
                "ไม่สามารถเพิ่มเอกสารได้"

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

        // --------------------------------
        // Enable Submit Button
        // --------------------------------

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "บันทึกเอกสาร";

        }

    }

}


// ======================================================
// RENDER DOCUMENTS
// ======================================================

function renderDocuments() {

    const tableBody =
        document.getElementById(
            "document-table-body"
        );


    const documentCount =
        document.getElementById(
            "document-count"
        );


    if (!tableBody) {

        return;

    }


    // ------------------------------------
    // Document Count
    // ------------------------------------

    if (documentCount) {

        documentCount.textContent =
            documents.length;

    }


    // ------------------------------------
    // Empty
    // ------------------------------------

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


    // ------------------------------------
    // Render Rows
    // ------------------------------------

    tableBody.innerHTML =

        documents
            .map(
                function (
                    documentItem
                ) {

                    return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    documentItem.documentCode || ""
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    documentItem.documentName || ""
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    documentItem.operator || ""
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    documentItem.department || ""
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


// ======================================================
// DASHBOARD COUNTS
// ======================================================

function updateDashboardCounts() {

    const cards =
        document.querySelectorAll(
            ".dashboard-card"
        );


    if (
        cards.length < 2
    ) {

        return;

    }


    // ------------------------------------
    // Current User
    // ------------------------------------

    const user =
        getCurrentGGNUser();


    // ------------------------------------
    // Total
    //
    // สำคัญ:
    //
    // documents ที่ได้รับจาก Backend
    // ถูกกรองตามสิทธิ์มาแล้ว
    //
    // User  = เอกสารของตัวเอง
    // Admin = เอกสารทั้งหมด
    // ------------------------------------

    const total =
        documents.length;


    // ------------------------------------
    // My Documents
    // ------------------------------------

    let myDocuments =
        0;


    if (
        user &&
        user.email
    ) {

        myDocuments =

            documents.filter(
                function (
                    item
                ) {

                    return (

                        String(
                            item.createdByEmail ||
                            ""
                        )
                        .trim()
                        .toLowerCase()

                        ===

                        String(
                            user.email ||
                            ""
                        )
                        .trim()
                        .toLowerCase()

                    );

                }
            ).length;

    }


    // ------------------------------------
    // Dashboard Elements
    // ------------------------------------

    const totalStrong =
        cards[0].querySelector(
            "strong"
        );


    const myStrong =
        cards[1].querySelector(
            "strong"
        );


    // ------------------------------------
    // Update Total
    // ------------------------------------

    if (totalStrong) {

        totalStrong.textContent =
            total;

    }


    // ------------------------------------
    // Update My Documents
    // ------------------------------------

    if (myStrong) {

        myStrong.textContent =
            myDocuments;

    }

}


// ======================================================
// INSPECTION SYSTEM
// ======================================================