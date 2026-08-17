// ========================================
// GGN Docs
// APP.JS
// PART 1 / 2
// ========================================


const API_URL =
    "https://script.google.com/macros/s/AKfycbz9EhtzTMEMO2QvXKpiBr2oFbHvwz7w6jPfY9NsWEwRPZFnGyAbM9nxXdYcaWxKvdK0rQ/exec";


const GOOGLE_CLIENT_ID =
    "866764029472-jmjml5iij5f6l5kut85mtmj8efeegshu.apps.googleusercontent.com";


// ========================================
// GLOBAL DATA
// ========================================

let documents = [];

let inspectionLocations = [];

let inspectionInspectors = [];

let inspectionItems = [];


// ========================================
// เริ่มต้นระบบ
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

    }
);


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


    setTimeout(
        waitForGoogle,
        300
    );

}


// ========================================
// ทดสอบ Google Apps Script
// ========================================

async function testAPI() {

    try {

        const response =
            await fetch(API_URL);


        const data =
            await response.json();


        console.log(
            "ข้อมูลจาก Google Apps Script:",
            data
        );


        const apiStatus =
            document.getElementById(
                "api-status"
            );


        if (apiStatus) {

            apiStatus.textContent =
                data.message ||
                "เชื่อมต่อระบบสำเร็จ";

        }


    } catch (error) {

        console.error(
            "เชื่อมต่อ API ไม่สำเร็จ:",
            error
        );


        const apiStatus =
            document.getElementById(
                "api-status"
            );


        if (apiStatus) {

            apiStatus.textContent =
                "ไม่สามารถเชื่อมต่อ Google Apps Script ได้";

        }

    }

}


// ========================================
// GOOGLE LOGIN
// ========================================

function initGoogleLogin() {

    console.log(
        "Google Identity Services พร้อมใช้งาน"
    );


    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleLogin

    });


    const loginButton =
        document.getElementById(
            "google-login"
        );


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
// GOOGLE LOGIN SUCCESS
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


    await loginToGGN(
        credential
    );

}


// ========================================
// LOGIN TO GGN
// ========================================

async function loginToGGN(
    credential
) {

    try {

        showLoginMessage(
            "กำลังตรวจสอบผู้ใช้งาน..."
        );


        const response =
            await fetch(

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
                                "googleLogin",

                            credential:
                                credential

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
// LOGIN MESSAGE
// ========================================

function showLoginMessage(
    message
) {

    const apiStatus =
        document.getElementById(
            "api-status"
        );


    if (apiStatus) {

        apiStatus.textContent =
            message;

    }

}


// ========================================
// LOGIN SUCCESS → APP
// ========================================

function showUserInfo(user) {

    // ------------------------------------
    // Save Session
    // ------------------------------------

    localStorage.setItem(

        "ggnDocsUser",

        JSON.stringify(user)

    );


    // ------------------------------------
    // Hide Login
    // ------------------------------------

    const loginPage =
        document.getElementById(
            "login-page"
        );


    if (loginPage) {

        loginPage.style.display =
            "none";

    }


    // ------------------------------------
    // Show Application
    // ------------------------------------

    const appPage =
        document.getElementById(
            "app-page"
        );


    if (appPage) {

        appPage.style.display =
            "block";

    }


    // ------------------------------------
    // Header Name
    // ------------------------------------

    const headerName =
        document.getElementById(
            "header-user-name"
        );


    if (headerName) {

        headerName.textContent =
            user.name ||
            user.email ||
            "";

    }


    // ------------------------------------
    // Header Role
    // ------------------------------------

    const headerRole =
        document.getElementById(
            "header-user-role"
        );


    if (headerRole) {

        headerRole.textContent =
            user.role ||
            "";

    }


    // ------------------------------------
    // Welcome
    // ------------------------------------

    const welcomeMessage =
        document.getElementById(
            "welcome-message"
        );


    if (welcomeMessage) {

        welcomeMessage.textContent =
            "ยินดีต้อนรับ คุณ " +
            (
                user.name ||
                ""
            );

    }


    // ------------------------------------
    // User Information
    // ------------------------------------

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
// RESTORE SESSION
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


    showUserInfo(
        user
    );

}


// ========================================
// GET CURRENT USER
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

        return JSON.parse(
            user
        );

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

function showPage(page) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        function (item) {

            item.style.display =
                "none";

        }
    );


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
    // เมื่อเปิดหน้า Inspection
    // ------------------------------------

    if (
        page === "inspections"
    ) {

        initializeInspectionPage();

    }

}


// ========================================
// LOGOUT
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


// ========================================
// LOGOUT
// ========================================

function logout() {

    localStorage.removeItem(
        "ggnDocsUser"
    );


    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        google.accounts.id
            .disableAutoSelect();

    }


    location.reload();

}


// ========================================
// ESCAPE HTML
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


// ========================================
// LOAD DOCUMENTS
// ========================================

async function loadDocuments() {

    try {

        console.log(
            "กำลังโหลดเอกสาร..."
        );


        const response =
            await fetch(

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
// DOCUMENT SETUP
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


        console.log(
            "กำลังส่งข้อมูลเอกสาร:",
            documentData
        );


        const response =
            await fetch(

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


        console.log(
            "ผลการบันทึกเอกสาร:",
            data
        );


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
        documents.length ===
        0
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
        cards.length <
        2
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

                        item.createdByEmail ===
                        user.email

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


// ========================================
// END PART 1
// ========================================
// ส่วน Inspection จะต่อใน PART 2
// ========================================
// ========================================
// GGN Docs
// INSPECTION SYSTEM
// PART 2 / 2
// ========================================


// ========================================
// SETUP INSPECTION
// ========================================

function setupInspections() {

    const saveButton =
        document.getElementById(
            "save-inspection-button"
        );


    const resetButton =
        document.getElementById(
            "reset-inspection-button"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveInspection
        );

    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetInspectionForm
        );

    }

}


// ========================================
// INITIALIZE INSPECTION PAGE
// ========================================

async function initializeInspectionPage() {

    console.log(
        "กำลังเตรียมหน้า การตรวจ ISO..."
    );


    // ------------------------------------
    // ตั้งค่าวันที่ / เวลาเริ่มต้น
    // ------------------------------------

    setDefaultInspectionDateTime();


    // ------------------------------------
    // โหลดข้อมูลจาก Settings
    // ------------------------------------

    await loadInspectionSettings();


    // ------------------------------------
    // สร้างรายการตรวจ
    // ------------------------------------

    renderInspectionItems();

}


// ========================================
// DEFAULT DATE / TIME
// ========================================

function setDefaultInspectionDateTime() {

    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    const now =
        new Date();


    // ------------------------------------
    // วันที่
    // ------------------------------------

    if (
        dateInput &&
        !dateInput.value
    ) {

        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        dateInput.value =
            `${year}-${month}-${day}`;

    }


    // ------------------------------------
    // เวลา
    // ------------------------------------

    if (
        timeInput &&
        !timeInput.value
    ) {

        const hours =
            String(
                now.getHours()
            ).padStart(
                2,
                "0"
            );


        const minutes =
            String(
                now.getMinutes()
            ).padStart(
                2,
                "0"
            );


        timeInput.value =
            `${hours}:${minutes}`;

    }

}


// ========================================
// LOAD INSPECTION SETTINGS
// ========================================

async function loadInspectionSettings() {

    try {

        console.log(
            "กำลังโหลดข้อมูลการตรวจจาก Settings..."
        );


        const response =
            await fetch(

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
                                "getInspectionSettings"

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ข้อมูล Settings การตรวจ:",
            data
        );


        if (!data.success) {

            console.warn(
                "ไม่สามารถโหลด Settings การตรวจได้"
            );

            return;

        }


        // ------------------------------------
        // จุดตรวจ
        // ------------------------------------

        if (
            Array.isArray(
                data.locations
            )
        ) {

            inspectionLocations =
                data.locations;

        }


        // ------------------------------------
        // ผู้ตรวจ
        // ------------------------------------

        if (
            Array.isArray(
                data.inspectors
            )
        ) {

            inspectionInspectors =
                data.inspectors;

        }


        // ------------------------------------
        // รายการตรวจ
        // ------------------------------------

        if (
            Array.isArray(
                data.items
            )
        ) {

            inspectionItems =
                data.items;

        }


        renderInspectionLocations();

        renderInspectionInspectors();


    } catch (error) {

        console.error(
            "โหลดข้อมูลการตรวจไม่สำเร็จ:",
            error
        );

    }

}


// ========================================
// RENDER LOCATIONS
// ========================================

function renderInspectionLocations() {

    const select =
        document.getElementById(
            "inspection-location"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกจุดตรวจ --
        </option>

    `;


    inspectionLocations.forEach(
        function (location) {

            const option =
                document.createElement(
                    "option"
                );


            // รองรับทั้ง String
            // และ Object

            if (
                typeof location ===
                "object"
            ) {

                option.value =
                    location.value ||
                    location.name ||
                    location.locationName ||
                    "";


                option.textContent =
                    location.label ||
                    location.name ||
                    location.locationName ||
                    option.value;

            } else {

                option.value =
                    location;


                option.textContent =
                    location;

            }


            if (option.value) {

                select.appendChild(
                    option
                );

            }

        }
    );

}


// ========================================
// RENDER INSPECTORS
// ========================================

function renderInspectionInspectors() {

    const select =
        document.getElementById(
            "inspection-inspector"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกผู้ตรวจ --
        </option>

    `;


    inspectionInspectors.forEach(
        function (inspector) {

            const option =
                document.createElement(
                    "option"
                );


            // รองรับทั้ง String
            // และ Object

            if (
                typeof inspector ===
                "object"
            ) {

                option.value =
                    inspector.value ||
                    inspector.name ||
                    inspector.inspectorName ||
                    "";


                option.textContent =
                    inspector.label ||
                    inspector.name ||
                    inspector.inspectorName ||
                    option.value;

            } else {

                option.value =
                    inspector;


                option.textContent =
                    inspector;

            }


            if (option.value) {

                select.appendChild(
                    option
                );

            }

        }
    );

}


// ========================================
// RENDER INSPECTION ITEMS
// ========================================

function renderInspectionItems() {

    const container =
        document.getElementById(
            "inspection-items"
        );


    if (!container) {

        return;

    }


    // ------------------------------------
    // ถ้ายังไม่มีรายการ
    // ------------------------------------

    if (
        !Array.isArray(
            inspectionItems
        ) ||
        inspectionItems.length === 0
    ) {

        container.innerHTML = `

            <div class="inspection-empty">

                <div>
                    📋
                </div>

                <strong>
                    ยังไม่มีรายการตรวจ
                </strong>

                <span>
                    ไม่พบรายการตรวจในระบบ
                </span>

            </div>

        `;

        return;

    }


    // ------------------------------------
    // สร้างรายการ
    // ------------------------------------

    container.innerHTML = "";


    inspectionItems.forEach(
        function (
            item,
            index
        ) {

            const itemNumber =
                item.itemNo ||
                item.no ||
                index + 1;


            const itemText =
                item.item ||
                item.name ||
                item.description ||
                "";


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "inspection-item";


            row.dataset.itemNo =
                itemNumber;


            row.innerHTML = `

                <div class="inspection-item-header">

                    <div class="inspection-item-number">
                        ${escapeHTML(
                            itemNumber
                        )}
                    </div>

                    <div class="inspection-item-text">
                        ${escapeHTML(
                            itemText
                        )}
                    </div>

                </div>


                <div class="inspection-result-group">

                    <label class="inspection-result-option">

                        <input
                            type="radio"
                            name="inspection-result-${escapeHTML(
                                itemNumber
                            )}"
                            value="ผ่าน"
                        >

                        <span>
                            ผ่าน
                        </span>

                    </label>


                    <label class="inspection-result-option">

                        <input
                            type="radio"
                            name="inspection-result-${escapeHTML(
                                itemNumber
                            )}"
                            value="ไม่ผ่าน"
                        >

                        <span>
                            ไม่ผ่าน
                        </span>

                    </label>

                </div>


                <div class="inspection-remark-group">

                    <label>
                        หมายเหตุ
                    </label>

                    <input
                        type="text"
                        class="inspection-remark"
                        data-item-no="${escapeHTML(
                            itemNumber
                        )}"
                        placeholder="ระบุหมายเหตุ (ถ้ามี)"
                    >

                </div>


                <div class="inspection-solution-group">

                    <label>
                        วิธีแก้ไข
                    </label>

                    <input
                        type="text"
                        class="inspection-solution"
                        data-item-no="${escapeHTML(
                            itemNumber
                        )}"
                        placeholder="ระบุวิธีแก้ไข (ถ้ามี)"
                    >

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ========================================
// COLLECT INSPECTION ITEMS
// ========================================

function collectInspectionItems() {

    const container =
        document.getElementById(
            "inspection-items"
        );


    if (!container) {

        return [];

    }


    const rows =
        container.querySelectorAll(
            ".inspection-item"
        );


    const result =
        [];


    rows.forEach(
        function (row) {

            const itemNo =
                row.dataset.itemNo;


            const resultInput =
                row.querySelector(
                    `input[name="inspection-result-${CSS.escape(
                        itemNo
                    )}"]:checked`
                );


            const remarkInput =
                row.querySelector(
                    ".inspection-remark"
                );


            const solutionInput =
                row.querySelector(
                    ".inspection-solution"
                );


            result.push({

                itemNo:
                    itemNo,

                result:
                    resultInput
                        ? resultInput.value
                        : "",

                remark:
                    remarkInput
                        ? remarkInput.value.trim()
                        : "",

                solution:
                    solutionInput
                        ? solutionInput.value.trim()
                        : ""

            });

        }
    );


    return result;

}


// ========================================
// VALIDATE INSPECTION FORM
// ========================================

function validateInspectionForm() {

    const inspectionDate =
        document.getElementById(
            "inspection-date"
        );


    const inspectionTime =
        document.getElementById(
            "inspection-time"
        );


    const location =
        document.getElementById(
            "inspection-location"
        );


    const inspector =
        document.getElementById(
            "inspection-inspector"
        );


    if (
        !inspectionDate ||
        !inspectionDate.value
    ) {

        alert(
            "กรุณาเลือกวันที่ตรวจ"
        );

        return false;

    }


    if (
        !inspectionTime ||
        !inspectionTime.value
    ) {

        alert(
            "กรุณาเลือกเวลาตรวจ"
        );

        return false;

    }


    if (
        !location ||
        !location.value
    ) {

        alert(
            "กรุณาเลือกจุดตรวจ"
        );

        return false;

    }


    if (
        !inspector ||
        !inspector.value
    ) {

        alert(
            "กรุณาเลือกผู้ตรวจ"
        );

        return false;

    }


    const items =
        collectInspectionItems();


    if (
        items.length === 0
    ) {

        alert(
            "ไม่พบรายการตรวจ"
        );

        return false;

    }


    // ------------------------------------
    // ต้องตอบทุกรายการ
    // ------------------------------------

    const incomplete =
        items.find(
            function (item) {

                return !item.result;

            }
        );


    if (incomplete) {

        alert(
            "กรุณาเลือกผลการตรวจให้ครบทุกข้อ"
        );

        return false;

    }


    return true;

}


// ========================================
// SAVE INSPECTION
// ========================================

async function saveInspection() {

    // ------------------------------------
    // ตรวจสอบข้อมูล
    // ------------------------------------

    if (
        !validateInspectionForm()
    ) {

        return;

    }


    // ------------------------------------
    // User
    // ------------------------------------

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


    // ------------------------------------
    // Elements
    // ------------------------------------

    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    const locationInput =
        document.getElementById(
            "inspection-location"
        );


    const inspectorInput =
        document.getElementById(
            "inspection-inspector"
        );


    const saveButton =
        document.getElementById(
            "save-inspection-button"
        );


    // ------------------------------------
    // Inspection Data
    // ------------------------------------

    const items =
        collectInspectionItems();


    const inspectionData = {

        inspectionDate:
            dateInput.value,

        inspectionTime:
            timeInput.value,

        locationName:
            locationInput.value,

        inspectorName:
            inspectorInput.value,

        documentCode:
            "FM-OP-11",

        documentName:
            "รายงานการตรวจจุดพนักงานรักษาความปลอดภัย",

        items:
            items,

        createdBy:
            user.name ||
            "",

        createdByEmail:
            user.email ||
            ""

    };


    console.log(
        "ข้อมูลการตรวจที่จะบันทึก:",
        inspectionData
    );


    // ------------------------------------
    // Disable Button
    // ------------------------------------

    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "กำลังบันทึก...";

    }


    try {

        // --------------------------------
        // ส่งข้อมูลไป Apps Script
        // --------------------------------

        const response =
            await fetch(

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
                                "saveInspection",

                            inspection:
                                inspectionData

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการบันทึกการตรวจ:",
            data
        );


        // --------------------------------
        // Success
        // --------------------------------

        if (data.success) {

            alert(
                "บันทึกการตรวจสำเร็จ"
            );


            // --------------------------------
            // ถ้ามี URL ของไฟล์ ISO
            // --------------------------------

            if (
                data.fileUrl
            ) {

                const openFile =
                    confirm(
                        "สร้างเอกสาร ISO สำเร็จ\n\nต้องการเปิดเอกสารหรือไม่?"
                    );


                if (openFile) {

                    window.open(
                        data.fileUrl,
                        "_blank"
                    );

                }

            }


            resetInspectionForm();


        } else {

            alert(

                data.message ||
                "ไม่สามารถบันทึกการตรวจได้"

            );

        }


    } catch (error) {

        console.error(
            "บันทึกการตรวจไม่สำเร็จ:",
            error
        );


        alert(
            "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "บันทึกการตรวจ";

        }

    }

}


// ========================================
// RESET INSPECTION FORM
// ========================================

function resetInspectionForm() {

    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    const locationInput =
        document.getElementById(
            "inspection-location"
        );


    const inspectorInput =
        document.getElementById(
            "inspection-inspector"
        );


    // ------------------------------------
    // Reset fields
    // ------------------------------------

    if (locationInput) {

        locationInput.value =
            "";

    }


    if (inspectorInput) {

        inspectorInput.value =
            "";

    }


    // ------------------------------------
    // ล้างรายการตรวจ
    // ------------------------------------

    const resultInputs =
        document.querySelectorAll(
            "#inspection-items input[type='radio']"
        );


    resultInputs.forEach(
        function (input) {

            input.checked =
                false;

        }
    );


    const remarks =
        document.querySelectorAll(
            "#inspection-items .inspection-remark"
        );


    remarks.forEach(
        function (input) {

            input.value =
                "";

        }
    );


    const solutions =
        document.querySelectorAll(
            "#inspection-items .inspection-solution"
        );


    solutions.forEach(
        function (input) {

            input.value =
                "";

        }
    );


    // ------------------------------------
    // ตั้งวันที่/เวลาใหม่
    // ------------------------------------

    if (dateInput) {

        dateInput.value =
            "";

    }


    if (timeInput) {

        timeInput.value =
            "";

    }


    setDefaultInspectionDateTime();


    console.log(
        "ล้างข้อมูลการตรวจแล้ว"
    );

}


// ========================================
// SEARCH DOCUMENTS
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
        function (item) {

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


        // --------------------------------
        // แสดงผลแบบง่ายใน Console
        // --------------------------------

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
        function (event) {

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
// INITIALIZE SEARCH
// ========================================

window.addEventListener(
    "load",
    function () {

        setupDocumentSearch();

    }
);


// ========================================
// END GGN DOCS APP.JS
// ========================================