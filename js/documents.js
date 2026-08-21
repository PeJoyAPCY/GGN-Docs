// DOCUMENT SYSTEM
// ======================================================


// ========================================
// SETUP DOCUMENTS
// ========================================

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


    if (addButton) {

        addButton.addEventListener(
            "click",
            openDocumentForm
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDocumentForm
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeDocumentForm
        );

    }


    if (documentForm) {

        documentForm.addEventListener(
            "submit",
            handleDocumentSubmit
        );

    }


    loadDocuments();

}


// ========================================
// LOAD DOCUMENTS
// ========================================

async function loadDocuments() {

    try {

        console.log(
            "กำลังโหลดเอกสาร..."
        );


        const response =
            await apiFetch(
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "getDocuments"

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ข้อมูลเอกสารจาก API:",
            data
        );


        if (
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


        documents =
            data.documents;


        renderDocuments();

        updateDashboardCounts();

    } catch (error) {

        console.error(
            "โหลดเอกสารไม่สำเร็จ:",
            error
        );

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
// ADD DOCUMENT
// ========================================

async function handleDocumentSubmit(
    event
) {

    event.preventDefault();


    const documentCode =
        document.getElementById(
            "document-code"
        ).value.trim();


    const documentName =
        document.getElementById(
            "document-name"
        ).value.trim();


    const operator =
        document.getElementById(
            "document-operator"
        ).value.trim();


    const department =
        document.getElementById(
            "document-department"
        ).value.trim();


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


    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


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
                user.name || "",

            createdByEmail:
                user.email || ""

        };


        const response =
            await apiFetch(

                API_URL,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "addDocument",

                            document:
                                documentData

                        })

                }

            );


        const data =
            await response.json();


        if (data.success) {

            alert(
                "เพิ่มเอกสารสำเร็จ"
            );


            await loadDocuments();


            const form =
                document.getElementById(
                    "document-form"
                );


            if (form) {

                form.reset();

            }


            closeDocumentForm();

        } else {

            alert(

                data.message ||
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


    if (!tableBody) {

        return;

    }


    if (documentCount) {

        documentCount.textContent =
            documents.length;

    }


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
                                    documentItem.documentCode
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    documentItem.documentName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    documentItem.operator
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    documentItem.department
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

    const cards =
        document.querySelectorAll(
            ".dashboard-card"
        );


    if (
        cards.length < 2
    ) {

        return;

    }


    const total =
        documents.length;


    const user =
        getCurrentUser();


    let myDocuments =
        0;


    if (user) {

        myDocuments =
            documents.filter(
                function (
                    item
                ) {

                    return (

                        String(
                            item.createdByEmail ||
                            ""
                        ).toLowerCase()
                        ===
                        String(
                            user.email ||
                            ""
                        ).toLowerCase()

                    );

                }
            ).length;

    }


    const totalStrong =
        cards[0].querySelector(
            "strong"
        );


    const myStrong =
        cards[1].querySelector(
            "strong"
        );


    if (totalStrong) {

        totalStrong.textContent =
            total;

    }


    if (myStrong) {

        myStrong.textContent =
            myDocuments;

    }

}


// ======================================================
