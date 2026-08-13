// ========================================
// GGN Docs
// ========================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbz9EhtzTMEMO2QvXKpiBr2oFbHvwz7w6jPfY9NsWEwRPZFnGyAbM9nxXdYcaWxKvdK0rQ/exec";

const GOOGLE_CLIENT_ID =
    "866764029472-jmjml5iij5f6l5kut85mtmj8efeegshu.apps.googleusercontent.com";


// ========================================
// เริ่มต้นระบบ
// ========================================

window.addEventListener("load", function () {

    testAPI();

    restoreSession();

    waitForGoogle();

    setupNavigation();

    setupLogout();

});


// ========================================
// รอ Google Identity Services
// ========================================

function waitForGoogle() {

    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        initGoogleLogin();

        return;
    }

    setTimeout(waitForGoogle, 300);

}


// ========================================
// ทดสอบ Google Apps Script
// ========================================

async function testAPI() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        console.log(
            "ข้อมูลจาก Google Apps Script:",
            data
        );

        const apiStatus =
            document.getElementById("api-status");

        if (apiStatus) {

            apiStatus.textContent =
                data.message;

        }

    } catch (error) {

        console.error(
            "เชื่อมต่อ API ไม่สำเร็จ:",
            error
        );

        const apiStatus =
            document.getElementById("api-status");

        if (apiStatus) {

            apiStatus.textContent =
                "ไม่สามารถเชื่อมต่อ Google Apps Script ได้";

        }

    }

}


// ========================================
// Google Login
// ========================================

function initGoogleLogin() {

    console.log(
        "Google Identity Services พร้อมใช้งาน"
    );

    google.accounts.id.initialize({

        client_id: GOOGLE_CLIENT_ID,

        callback: handleGoogleLogin

    });


    const loginButton =
        document.getElementById("google-login");

    if (!loginButton) {

        console.error(
            "ไม่พบ #google-login"
        );

        return;
    }


    google.accounts.id.renderButton(

        loginButton,

        {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular"
        }

    );

}


// ========================================
// Google Login สำเร็จ
// ========================================

async function handleGoogleLogin(response) {

    console.log(
        "Google Login สำเร็จ"
    );

    const credential =
        response.credential;

    if (!credential) {

        showLoginMessage(
            "ไม่พบข้อมูลจาก Google"
        );

        return;
    }

    await loginToGGN(credential);

}


// ========================================
// ส่งข้อมูลไป Apps Script
// ========================================

async function loginToGGN(credential) {

    try {

        showLoginMessage(
            "กำลังตรวจสอบผู้ใช้งาน..."
        );


        const response = await fetch(
            API_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    action: "googleLogin",

                    credential: credential

                })

            }
        );


        const data =
            await response.json();


        console.log(
            "ผลการตรวจสอบ:",
            data
        );


        if (
            data.success &&
            data.found
        ) {

            showUserInfo(
                data.user
            );

        } else {

            showLoginMessage(
                data.message ||
                "ไม่พบผู้ใช้งานในระบบ"
            );

        }

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        showLoginMessage(
            "เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้งาน"
        );

    }

}


// ========================================
// แสดงข้อความบนหน้า Login
// ========================================

function showLoginMessage(message) {

    const apiStatus =
        document.getElementById("api-status");

    if (apiStatus) {

        apiStatus.textContent =
            message;

    }

}


// ========================================
// Login สำเร็จ → เปิด Dashboard
// ========================================

function showUserInfo(user) {

    // บันทึก Session
    localStorage.setItem(
        "ggnDocsUser",
        JSON.stringify(user)
    );


    // ซ่อน Login
    const loginPage =
        document.getElementById("login-page");

    if (loginPage) {

        loginPage.style.display =
            "none";

    }


    // แสดง Application
    const appPage =
        document.getElementById("app-page");

    if (appPage) {

        appPage.style.display =
            "block";

    }


    // ชื่อผู้ใช้บน Header
    const headerName =
        document.getElementById(
            "header-user-name"
        );

    if (headerName) {

        headerName.textContent =
            user.name ||
            user.email;

    }


    // Role
    const headerRole =
        document.getElementById(
            "header-user-role"
        );

    if (headerRole) {

        headerRole.textContent =
            user.role || "";

    }


    // ข้อความต้อนรับ
    const welcomeMessage =
        document.getElementById(
            "welcome-message"
        );

    if (welcomeMessage) {

        welcomeMessage.textContent =
            "ยินดีต้อนรับ คุณ " +
            (user.name || "");

    }


    // ข้อมูลผู้ใช้ใน Settings
    const userInfo =
        document.getElementById(
            "user-info"
        );

    if (userInfo) {

        userInfo.innerHTML = `

            <div class="user-card">

                <h3>
                    เข้าสู่ระบบสำเร็จ
                </h3>

                <p>
                    <strong>ชื่อ:</strong>
                    ${escapeHTML(user.name)}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(user.email)}
                </p>

                <p>
                    <strong>แผนก:</strong>
                    ${escapeHTML(user.department)}
                </p>

                <p>
                    <strong>สิทธิ์:</strong>
                    ${escapeHTML(user.role)}
                </p>

                <p>
                    <strong>สถานะ:</strong>
                    ${escapeHTML(user.status)}
                </p>

            </div>

        `;

    }


    console.log(
        "เข้าสู่ระบบสำเร็จ:",
        user
    );

}


// ========================================
// Restore Session
// ========================================

function restoreSession() {

    const user =
        getCurrentUser();

    if (!user) {

        return;

    }


    console.log(
        "กู้คืน Session สำเร็จ:",
        user
    );


    showUserInfo(user);

}


// ========================================
// อ่าน User จาก Session
// ========================================

function getCurrentUser() {

    const user =
        localStorage.getItem(
            "ggnDocsUser"
        );


    if (!user) {

        return null;

    }


    try {

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "อ่านข้อมูลผู้ใช้ไม่สำเร็จ:",
            error
        );

        localStorage.removeItem(
            "ggnDocsUser"
        );

        return null;

    }

}


// ========================================
// Navigation
// ========================================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                const page =
                    item.dataset.page;

                if (!page) {

                    return;

                }

                showPage(page);

            }
        );

    });

}


// ========================================
// เปลี่ยนหน้า
// ========================================

function showPage(page) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(function (item) {

        item.style.display =
            "none";

    });


    const selectedPage =
        document.getElementById(
            "page-" + page
        );


    if (selectedPage) {

        selectedPage.style.display =
            "block";

    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(function (item) {

        item.classList.remove(
            "active"
        );


        if (
            item.dataset.page === page
        ) {

            item.classList.add(
                "active"
            );

        }

    });

}


// ========================================
// Logout
// ========================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        logout
    );

}


function logout() {

    localStorage.removeItem(
        "ggnDocsUser"
    );


    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        google.accounts.id.disableAutoSelect();

    }


    location.reload();

}


// ========================================
// ป้องกัน HTML Injection
// ========================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

// ========================================
// DOCUMENT SYSTEM
// ========================================

let documents = [];


// ========================================
// โหลดเอกสารจาก Google Sheets
// ========================================

async function loadDocuments() {

    try {

        console.log("กำลังโหลดเอกสาร...");

        const response = await fetch(
            API_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    action: "getDocuments"

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
            !Array.isArray(data.documents)
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


    } catch (error) {

        console.error(
            "โหลดเอกสารไม่สำเร็จ:",
            error
        );

    }

}


// ========================================
// เริ่มต้นระบบเอกสาร
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


    // -----------------------------
    // เปิดฟอร์ม
    // -----------------------------

    if (addButton) {

        addButton.addEventListener(
            "click",
            openDocumentForm
        );

    }


    // -----------------------------
    // ปิดฟอร์ม
    // -----------------------------

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


    // -----------------------------
    // บันทึกเอกสาร
    // -----------------------------

    if (documentForm) {

        documentForm.addEventListener(
            "submit",
            handleDocumentSubmit
        );

    }


    // -----------------------------
    // โหลดข้อมูลจากฐานข้อมูล
    // -----------------------------

    loadDocuments();

}


// ========================================
// เปิดฟอร์มเพิ่มเอกสาร
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
        behavior: "smooth",
        block: "start"
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
// ปิดฟอร์ม
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
// บันทึกเอกสาร
// ========================================

async function handleDocumentSubmit(event) {

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


    // -----------------------------
    // ตรวจสอบข้อมูล
    // -----------------------------

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


    // -----------------------------
    // ตรวจสอบ User
    // -----------------------------

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


    // -----------------------------
    // ปุ่มบันทึก
    // -----------------------------

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

        // -----------------------------
        // ข้อมูลที่จะส่งไป Apps Script
        // -----------------------------

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


        console.log(
            "กำลังส่งข้อมูลเอกสาร:",
            documentData
        );


        // -----------------------------
        // ส่งข้อมูลไป Google Apps Script
        // -----------------------------

        const response = await fetch(
            API_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    action: "addDocument",

                    document:
                        documentData

                })

            }
        );


        const data =
            await response.json();


        console.log(
            "ผลการบันทึกเอกสาร:",
            data
        );


        // -----------------------------
        // บันทึกสำเร็จ
        // -----------------------------

        if (data.success) {

            alert(
                "เพิ่มเอกสารสำเร็จ"
            );


            // โหลดข้อมูลจากฐานข้อมูลใหม่
            await loadDocuments();


            // ล้างฟอร์ม
            const form =
                document.getElementById(
                    "document-form"
                );


            if (form) {

                form.reset();

            }


            // ปิดฟอร์ม
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
// แสดงรายการเอกสาร
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


    // -----------------------------
    // จำนวนเอกสาร
    // -----------------------------

    if (documentCount) {

        documentCount.textContent =
            documents.length;

    }


    // -----------------------------
    // ไม่มีเอกสาร
    // -----------------------------

    if (documents.length === 0) {

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


    // -----------------------------
    // แสดงรายการ
    // -----------------------------

    tableBody.innerHTML =
        documents
            .map(function (documentItem) {

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

            })
            .join("");

}


// ========================================
// เริ่มต้น Document System
// ========================================

window.addEventListener(
    "load",
    function () {

        setupDocuments();

    }
);