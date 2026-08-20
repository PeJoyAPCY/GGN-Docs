// ========================================
// GGN Docs
// APP.JS
// ========================================


// ========================================
// CONFIGURATION
// ========================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbz9EhtzTMEMO2QvXKpiBr2oFbHvwz7w6jPfY9NsWEwRPZFnGyAbM9nxXdYcaWxKvdK0rQ/exec";


const GOOGLE_CLIENT_ID =
    "866764029472-jmjml5iij5f6l5kut85mtmj8efeegshu.apps.googleusercontent.com";


// ========================================
// GLOBAL DATA
// ========================================

let documents = [];


// ========================================
// INSPECTION DATA
// ========================================

// จุดตรวจทั้งหมด
let inspectionLocations = [];

let inspectionRecords = [];

// เขตทั้งหมด
let inspectionZones = [];


// ผู้ตรวจ / สายตรวจทั้งหมด
let inspectionInspectors = [];


// รายการตรวจทั้งหมด
let inspectionItems = [];


// ป้องกันการโหลด Settings ซ้ำโดยไม่จำเป็น
let inspectionSettingsLoaded = false;


// ป้องกันการ bind event ซ้ำ
let inspectionPageInitialized = false;


// ========================================
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


// ========================================
// GOOGLE IDENTITY SERVICES
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
// TEST GOOGLE APPS SCRIPT API
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

async function handleGoogleLogin(
    response
) {

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
// SHOW USER INFO
// ========================================

function showUserInfo(
    user
) {

    if (!user) {

        return;

    }


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
    // Welcome Message
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

function escapeHTML(
    value
) {

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


// ======================================================
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
// INSPECTION SYSTEM
// ======================================================


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


    setDefaultInspectionDateTime();


    if (
        !inspectionSettingsLoaded
    ) {

        await loadInspectionSettings();

        inspectionSettingsLoaded =
            true;

    } else {

        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();

    }


    // ------------------------------------
    // LOAD REAL INSPECTION DATA
    // ------------------------------------

    await loadInspections();

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
// GET SETTINGS
// ========================================

async function getInspectionSetting(
    settingType
) {

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
                            "getSettings",

                        settingType:
                            settingType

                    })

            }

        );


    return await response.json();

}


// ========================================
// LOAD INSPECTION SETTINGS
// ========================================

async function loadInspectionSettings() {

    console.log(
        ">>> ENTER loadInspectionSettings <<<"
    );

    try {

        console.log(
            "กำลังโหลดข้อมูล Inspection Settings..."
        );


        // ------------------------------------
        // LOCATION
        // ------------------------------------

        console.log(
            "กำลังโหลด Location Settings..."
        );

        const locationData =
            await getInspectionSetting(
                "location"
            );

        console.log(
            "Location Settings:",
            locationData
        );


        if (
            locationData.success &&
            Array.isArray(
                locationData.settings
            )
        ) {

            inspectionLocations =
                locationData.settings;

        } else {

            inspectionLocations =
                [];

        }


        // ------------------------------------
        // INSPECTOR
        // ------------------------------------

        console.log(
            "กำลังโหลด Inspector Settings..."
        );

        const inspectorData =
            await getInspectionSetting(
                "inspector"
            );

        console.log(
            "Inspector Settings:",
            inspectorData
        );


        if (
            inspectorData.success &&
            Array.isArray(
                inspectorData.settings
            )
        ) {

            inspectionInspectors =
                inspectorData.settings;

        } else {

            inspectionInspectors =
                [];

        }


        // ------------------------------------
        // INSPECTION ITEMS
        // ------------------------------------

        console.log(
            "กำลังโหลด Inspection Items..."
        );

        const itemData =
            await getInspectionSetting(
                "inspectionItem"
            );

        console.log(
            "Inspection Items:",
            itemData
        );


        if (
            itemData.success &&
            Array.isArray(
                itemData.settings
            )
        ) {

            inspectionItems =
                itemData.settings;

        } else {

            inspectionItems =
                [];

        }


        // ------------------------------------
        // RENDER
        // ------------------------------------

        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();


        console.log(
            "โหลด Inspection Settings สำเร็จ"
        );


    } catch (error) {

        console.error(
            "โหลด Inspection Settings ไม่สำเร็จ:",
            error
        );


        inspectionLocations = [];

        inspectionInspectors = [];

        inspectionItems = [];


        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();

    }

}


// ========================================
// RENDER ZONES
// ========================================

function renderInspectionZones() {

    const select =
        document.getElementById(
            "inspection-zone"
        );


    if (!select) {

        console.warn(
            "ไม่พบ #inspection-zone"
        );

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกเขต --
        </option>

    `;


    inspectionZones.forEach(
        function (
            zone
        ) {

            if (!zone) {

                return;

            }


            // --------------------------------
            // ตรวจ Status
            // --------------------------------

            if (
                zone.status &&
                String(
                    zone.status
                ).toLowerCase()
                !==
                "active"
            ) {

                return;

            }


            const zoneName =
                zone.settingName ||
                zone.name ||
                zone.settingValue ||
                zone.zoneName ||
                "";


            if (!zoneName) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                zoneName;


            option.textContent =
                zoneName;


            select.appendChild(
                option
            );

        }
    );

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

        console.warn(
            "ไม่พบ #inspection-location"
        );

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกจุดตรวจ --
        </option>

    `;


    inspectionLocations.forEach(
        function (
            location
        ) {

            if (!location) {

                return;

            }


            // --------------------------------
            // ตรวจ Status
            // --------------------------------

            if (
                location.status &&
                String(
                    location.status
                ).toLowerCase()
                !==
                "active"
            ) {

                return;

            }


            const locationName =
                location.settingName ||
                location.name ||
                location.settingValue ||
                location.locationName ||
                "";


            if (!locationName) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                locationName;


            option.textContent =
                locationName;


            select.appendChild(
                option
            );

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

        console.warn(
            "ไม่พบ #inspection-inspector"
        );

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกผู้ตรวจ --
        </option>

    `;


    inspectionInspectors.forEach(
        function (
            inspector
        ) {

            if (!inspector) {

                return;

            }


            // --------------------------------
            // ตรวจ Status
            // --------------------------------

            if (
                inspector.status &&
                String(
                    inspector.status
                ).toLowerCase()
                !==
                "active"
            ) {

                return;

            }


            const inspectorName =
                inspector.settingName ||
                inspector.name ||
                inspector.settingValue ||
                inspector.inspectorName ||
                "";


            if (!inspectorName) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                inspectorName;


            option.textContent =
                inspectorName;


            select.appendChild(
                option
            );

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
    // Sort รายการตรวจ
    // ------------------------------------

    const sortedItems =
        [...inspectionItems]
            .sort(
                function (
                    a,
                    b
                ) {

                    const aNo =
                        Number(
                            a.sortOrder ||
                            a.itemNo ||
                            a.no ||
                            999
                        );


                    const bNo =
                        Number(
                            b.sortOrder ||
                            b.itemNo ||
                            b.no ||
                            999
                        );


                    return aNo - bNo;

                }
            );


    container.innerHTML = "";


    sortedItems.forEach(
        function (
            item,
            index
        ) {

            const itemNumber =
                item.sortOrder ||
                item.itemNo ||
                item.no ||
                index + 1;


            const itemText =
                item.settingName ||
                item.name ||
                item.item ||
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

                    <label
                        class="inspection-result-option"
                    >

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


                    <label
                        class="inspection-result-option"
                    >

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

            `;


            container.appendChild(
                row
            );

        }
    );


    // ====================================
    // REMARK + SOLUTION
    // ====================================

    const additionalSection =
        document.createElement(
            "div"
        );


    additionalSection.className =
        "inspection-additional";


    additionalSection.innerHTML = `

        <div class="inspection-remark-group">

            <label
                for="inspection-remark"
            >
                หมายเหตุ
            </label>

            <textarea
                id="inspection-remark"
                class="inspection-remark"
                rows="3"
                placeholder="ระบุหมายเหตุ (ถ้ามี)"
            ></textarea>

        </div>


        <div class="inspection-solution-group">

            <label
                for="inspection-solution"
            >
                แนวทางแก้ไข
            </label>

            <textarea
                id="inspection-solution"
                class="inspection-solution"
                rows="3"
                placeholder="ระบุแนวทางแก้ไข (ถ้ามี)"
            ></textarea>

        </div>

    `;


    container.appendChild(
        additionalSection
    );

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

function escapeHTML(
    value
) {

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


// ======================================================
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
// INSPECTION SYSTEM
// ======================================================


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


    setupInspectionPageEvents();

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
// GET SETTINGS
// ========================================

async function getInspectionSetting(
    settingType
) {

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
                            "getSettings",

                        settingType:
                            settingType

                    })

            }

        );


    return await response.json();

}

// ========================================
// LOAD INSPECTIONS
// ========================================

// ========================================
// LOAD INSPECTIONS
// ========================================

async function loadInspections() {

    try {

        console.log(
            "กำลังโหลดข้อมูล Inspections..."
        );


        const response =
            await fetch(
                API_URL +
                "?action=getInspections"
            );


        const data =
            await response.json();


        console.log(
            "getInspections response:",
            data
        );


        if (
            !data.success
        ) {

            console.error(
                "ไม่สามารถโหลด Inspections:",
                data.message
            );

            inspectionRecords = [];

            return;

        }


        // ------------------------------------
        // เก็บข้อมูล Inspections
        // ------------------------------------

        inspectionRecords =
            Array.isArray(data.inspections)
                ? data.inspections
                : Array.isArray(data.data)
                    ? data.data
                    : [];


        console.log(
            "โหลด Inspections สำเร็จ:",
            inspectionRecords
        );


        console.log(
            "จำนวนรายการตรวจ:",
            inspectionRecords.length
        );


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการโหลด Inspections:",
            error
        );


        inspectionRecords = [];

    }

}

// ========================================
// LOAD INSPECTION ITEMS
// ========================================

async function loadInspectionItems(recordId) {

    try {

        console.log(
            "กำลังโหลด Inspection Items:",
            recordId
        );


        const response =
            await fetch(
                API_URL +
                "?action=getInspectionItems&recordId=" +
                encodeURIComponent(recordId)
            );


        const data =
            await response.json();


        console.log(
            "getInspectionItems response:",
            data
        );


        if (
            !data.success
        ) {

            console.error(
                "ไม่สามารถโหลด Inspection Items:",
                data.message
            );

            return [];

        }


        const items =
            Array.isArray(data.items)
                ? data.items
                : [];


        console.log(
            "โหลด Inspection Items สำเร็จ:",
            items
        );


        console.log(
            "จำนวน Inspection Items:",
            items.length
        );


        return items;


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการโหลด Inspection Items:",
            error
        );


        return [];

    }

}

// ========================================
// RENDER ZONE
// ========================================

function renderInspectionZones() {

    const select =
        document.getElementById(
            "inspection-zone"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกเขต --
        </option>

    `;


    const zones = [];


    inspectionLocations.forEach(
        function (
            location
        ) {

            if (!location) {

                return;

            }


            const zone =
                location.zone ||
                location.settingZone ||
                "";


            if (
                zone &&
                !zones.includes(
                    zone
                )
            ) {

                zones.push(
                    zone
                );

            }

        }
    );


    zones.sort();


    zones.forEach(
        function (
            zone
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                zone;


            option.textContent =
                zone;


            select.appendChild(
                option
            );

        }
    );

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
        function (
            location
        ) {

            if (!location) {

                return;

            }


            if (
                location.status &&
                String(
                    location.status
                ).toLowerCase()
                !==
                "active"
            ) {

                return;

            }


            const locationName =
                location.settingName ||
                location.name ||
                location.settingValue ||
                location.locationName ||
                "";


            if (!locationName) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                locationName;


            option.textContent =
                locationName;


            select.appendChild(
                option
            );

        }
    );


    renderInspectionZones();

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
        function (
            inspector
        ) {

            if (!inspector) {

                return;

            }


            if (
                inspector.status &&
                String(
                    inspector.status
                ).toLowerCase()
                !==
                "active"
            ) {

                return;

            }


            const inspectorName =
                inspector.settingName ||
                inspector.name ||
                inspector.settingValue ||
                inspector.inspectorName ||
                "";


            if (!inspectorName) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                inspectorName;


            option.textContent =
                inspectorName;


            select.appendChild(
                option
            );

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


    const sortedItems =
        [...inspectionItems]
            .sort(
                function (
                    a,
                    b
                ) {

                    const aNo =
                        Number(
                            a.sortOrder ||
                            a.itemNo ||
                            a.no ||
                            999
                        );


                    const bNo =
                        Number(
                            b.sortOrder ||
                            b.itemNo ||
                            b.no ||
                            999
                        );


                    return aNo - bNo;

                }
            );


    container.innerHTML = "";


    sortedItems.forEach(
        function (
            item,
            index
        ) {

            const itemNumber =
                item.sortOrder ||
                item.itemNo ||
                item.no ||
                index + 1;


            const itemText =
                item.settingName ||
                item.name ||
                item.item ||
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

                    <label
                        class="inspection-result-option"
                    >

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


                    <label
                        class="inspection-result-option"
                    >

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

            `;


            container.appendChild(
                row
            );

        }
    );


    const additionalSection =
        document.createElement(
            "div"
        );


    additionalSection.className =
        "inspection-additional";


    additionalSection.innerHTML = `

        <div class="inspection-remark-group">

            <label
                for="inspection-remark"
            >
                หมายเหตุ
            </label>

            <textarea
                id="inspection-remark"
                class="inspection-remark"
                rows="3"
                placeholder="ระบุหมายเหตุ (ถ้ามี)"
            ></textarea>

        </div>


        <div class="inspection-solution-group">

            <label
                for="inspection-solution"
            >
                แนวทางแก้ไข
            </label>

            <textarea
                id="inspection-solution"
                class="inspection-solution"
                rows="3"
                placeholder="ระบุแนวทางแก้ไข (ถ้ามี)"
            ></textarea>

        </div>

    `;


    container.appendChild(
        additionalSection
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
        function (
            row
        ) {

            const itemNo =
                row.dataset.itemNo;


            const resultInput =
                row.querySelector(
                    'input[type="radio"]:checked'
                );


            const itemText =
                row.querySelector(
                    ".inspection-item-text"
                );


            result.push({

                itemNo:
                    itemNo,

                item:
                    itemText
                        ? itemText.textContent.trim()
                        : "",

                result:
                    resultInput
                        ? resultInput.value
                        : ""

            });

        }
    );


    return result;

}


// ========================================
// COLLECT REMARK
// ========================================

function collectInspectionRemark() {

    const input =
        document.getElementById(
            "inspection-remark"
        );


    if (!input) {

        return "";

    }


    return input.value.trim();

}


// ========================================
// COLLECT SOLUTION
// ========================================

function collectInspectionSolution() {

    const input =
        document.getElementById(
            "inspection-solution"
        );


    if (!input) {

        return "";

    }


    return input.value.trim();

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


    const incomplete =
        items.find(
            function (
                item
            ) {

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
// GENERATE RECORD ID
// ========================================

function generateRecordId() {

    if (
        window.crypto &&
        typeof crypto.randomUUID ===
        "function"
    ) {

        return crypto.randomUUID();

    }


    return (

        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2)

    );

}


// ========================================
// SAVE INSPECTION
// ========================================

async function saveInspection() {

    if (
        !validateInspectionForm()
    ) {

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


    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    const zoneInput =
        document.getElementById(
            "inspection-zone"
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


    const recordId =
        generateRecordId();


    const items =
        collectInspectionItems();


    const remark =
        collectInspectionRemark();


    const solution =
        collectInspectionSolution();


    const inspectionData = {

        recordId:
            recordId,

        inspectionDate:
            dateInput.value,

        inspectionTime:
            timeInput.value,

        zone:
            zoneInput
                ? zoneInput.value
                : "",

        locationName:
            locationInput.value,

        inspectorName:
            inspectorInput.value,

        remark:
            remark,

        solution:
            solution,

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


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "กำลังบันทึก...";

    }


    try {

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


        if (data.success) {

            alert(
                "บันทึกการตรวจสำเร็จ"
            );


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


    if (locationInput) {

        locationInput.value =
            "";

    }


    if (inspectorInput) {

        inspectorInput.value =
            "";

    }


    const resultInputs =
        document.querySelectorAll(
            "#inspection-items input[type='radio']"
        );


    resultInputs.forEach(
        function (
            input
        ) {

            input.checked =
                false;

        }
    );


    const remark =
        document.getElementById(
            "inspection-remark"
        );


    if (remark) {

        remark.value =
            "";

    }


    const solution =
        document.getElementById(
            "inspection-solution"
        );


    if (solution) {

        solution.value =
            "";

    }


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


// ======================================================
// FM-OP-11 GENERATOR
// ======================================================


// รายการตรวจที่ค้นพบ
let fmop11Records = [];


// รายการที่ผู้ใช้เลือก
let fmop11SelectedRecords = [];


// ========================================
// INITIALIZE FM-OP-11
// ========================================

function initializeFMOP11Page() {

    setupFMOP11Events();

    loadFMOP11Inspectors();

    updateFMOP11SelectedCount();

}


// ========================================
// SETUP FM-OP-11 EVENTS
// ========================================

function setupFMOP11Events() {

    const searchButton =
        document.getElementById(
            "search-fmop11-button"
        );


    const clearButton =
        document.getElementById(
            "clear-fmop11-selection-button"
        );


    const generateButton =
        document.getElementById(
            "generate-fmop11-button"
        );


    if (
        searchButton &&
        !searchButton.dataset.bound
    ) {

        searchButton.addEventListener(
            "click",
            searchFMOP11Records
        );


        searchButton.dataset.bound =
            "true";

    }


    if (
        clearButton &&
        !clearButton.dataset.bound
    ) {

        clearButton.addEventListener(
            "click",
            clearFMOP11Selection
        );


        clearButton.dataset.bound =
            "true";

    }


    if (
        generateButton &&
        !generateButton.dataset.bound
    ) {

        generateButton.addEventListener(
            "click",
            generateFMOP11
        );


        generateButton.dataset.bound =
            "true";

    }

}


// ========================================
// LOAD FM-OP-11 INSPECTORS
// ========================================

async function loadFMOP11Inspectors() {

    const select =
        document.getElementById(
            "fmop11-inspector"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกผู้ตรวจ --
        </option>

    `;


    if (
        inspectionInspectors.length === 0
    ) {

        try {

            const data =
                await getInspectionSetting(
                    "inspector"
                );


            if (
                data.success &&
                Array.isArray(
                    data.settings
                )
            ) {

                inspectionInspectors =
                    data.settings;

            }

        } catch (error) {

            console.error(
                "โหลดผู้ตรวจสำหรับ FM-OP-11 ไม่สำเร็จ:",
                error
            );

        }

    }


    inspectionInspectors.forEach(
        function (
            inspector
        ) {

            if (!inspector) {

                return;

            }


            if (
                inspector.status &&
                String(
                    inspector.status
                ).toLowerCase()
                !==
                "active"
            ) {

                return;

            }


            const name =
                inspector.settingName ||
                inspector.name ||
                inspector.settingValue ||
                inspector.inspectorName ||
                "";


            if (!name) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                name;


            option.textContent =
                name;


            select.appendChild(
                option
            );

        }
    );

}


// ========================================
// SEARCH FM-OP-11 RECORDS
// ========================================

async function searchFMOP11Records() {

    const dateInput =
        document.getElementById(
            "fmop11-date"
        );


    const inspectorInput =
        document.getElementById(
            "fmop11-inspector"
        );


    const list =
        document.getElementById(
            "fmop11-record-list"
        );


    // ----------------------------------------
    // VALIDATE DATE
    // ----------------------------------------

    if (
        !dateInput ||
        !dateInput.value
    ) {

        alert(
            "กรุณาเลือกวันที่ตรวจ"
        );

        return;

    }


    // ----------------------------------------
    // VALIDATE INSPECTOR
    // ----------------------------------------

    if (
        !inspectorInput ||
        !inspectorInput.value
    ) {

        alert(
            "กรุณาเลือกผู้ตรวจ"
        );

        return;

    }


    // ----------------------------------------
    // SHOW LOADING
    // ----------------------------------------

    if (list) {

        list.innerHTML = `

            <div class="inspection-empty">

                <div>
                    ⏳
                </div>

                <strong>
                    กำลังค้นหารายการตรวจ...
                </strong>

            </div>

        `;

    }


    try {

        console.log(
            "กำลังค้นหา FM-OP-11..."
        );

        console.log(
            "วันที่:",
            dateInput.value
        );

        console.log(
            "ผู้ตรวจ:",
            inspectorInput.value
        );


        // ------------------------------------
        // LOAD INSPECTIONS FROM API
        // ------------------------------------

        const response =
            await fetch(
                API_URL +
                "?action=getInspections"
            );


        const data =
            await response.json();


        console.log(
            "ข้อมูล Inspections สำหรับ FM-OP-11:",
            data
        );


        if (
            !data.success ||
            !Array.isArray(
                data.inspections
            )
        ) {

            fmop11Records = [];

            renderFMOP11Records();

            updateFMOP11SelectedCount();

            return;

        }


        // ------------------------------------
        // CONVERT DATE
        //
        // input type="date"
        // จะได้ YYYY-MM-DD
        //
        // API inspectionDate
        // จะเป็น DD/MM/YYYY
        // ------------------------------------

        const dateParts =
            dateInput.value.split("-");


        const searchDate =
            dateParts.length === 3
                ? dateParts[2] +
                  "/" +
                  dateParts[1] +
                  "/" +
                  dateParts[0]
                : dateInput.value;


        console.log(
            "วันที่สำหรับค้นหา:",
            searchDate
        );


        // ------------------------------------
        // FILTER RECORDS
        // ------------------------------------

        fmop11Records =
            data.inspections.filter(
                function(record) {

                    const recordDate =
                        String(
                            record.inspectionDate || ""
                        ).trim();


                    const recordInspector =
                        String(
                            record.inspectorName || ""
                        ).trim();


                    const selectedInspector =
                        String(
                            inspectorInput.value || ""
                        ).trim();


                    return (
                        recordDate ===
                        searchDate
                    ) &&
                    (
                        recordInspector ===
                        selectedInspector
                    );

                }
            );


        console.log(
            "รายการ FM-OP-11 ที่ค้นพบ:",
            fmop11Records
        );


        console.log(
            "จำนวนรายการที่ค้นพบ:",
            fmop11Records.length
        );


        // ------------------------------------
        // RESET SELECTION
        // ------------------------------------

        fmop11SelectedRecords = [];


        // ------------------------------------
        // RENDER
        // ------------------------------------

        renderFMOP11Records();


        updateFMOP11SelectedCount();


    } catch (error) {

        console.error(
            "ค้นหารายการตรวจไม่สำเร็จ:",
            error
        );


        fmop11Records = [];

        fmop11SelectedRecords = [];


        renderFMOP11Records();

        updateFMOP11SelectedCount();

    }

}


// ========================================
// RENDER FM-OP-11 RECORD LIST
// ========================================

function renderFMOP11Records() {

    const list =
        document.getElementById(
            "fmop11-record-list"
        );


    if (!list) {

        return;

    }


    if (
        fmop11Records.length === 0
    ) {

        list.innerHTML = `

            <div class="inspection-empty">

                <div>
                    📋
                </div>

                <strong>
                    ไม่พบรายการตรวจ
                </strong>

                <span>
                    ไม่พบข้อมูลตามวันที่และผู้ตรวจที่เลือก
                </span>

            </div>

        `;

        return;

    }


    list.innerHTML = "";


    fmop11Records.forEach(
        function (
            record,
            index
        ) {

            const recordId =
                record.recordId ||
                record.id ||
                "";


            const location =
                record.locationName ||
                "-";


            const time =
                record.inspectionTime ||
                "-";


            const itemCount =
                Array.isArray(
                    record.items
                )
                    ? record.items.length
                    : 0;


            const wrapper =
                document.createElement(
                    "label"
                );


            wrapper.className =
                "fmop11-record-item";


            wrapper.innerHTML = `

                <input
                    type="checkbox"
                    class="fmop11-record-checkbox"
                    data-record-id="${escapeHTML(
                        recordId
                    )}"
                    data-index="${index}"
                >


                <div class="fmop11-record-content">

                    <div class="fmop11-record-main">

                        <strong>
                            ${escapeHTML(
                                location
                            )}
                        </strong>

                        <span>
                            เวลา ${escapeHTML(
                                time
                            )}
                        </span>

                    </div>


                    <div class="fmop11-record-meta">

                        <span>
                            ${escapeHTML(
                                record.inspectorName ||
                                ""
                            )}
                        </span>

                        <span>
                            ${itemCount} รายการตรวจ
                        </span>

                    </div>

                </div>

            `;


            const checkbox =
                wrapper.querySelector(
                    ".fmop11-record-checkbox"
                );


            if (checkbox) {

                checkbox.addEventListener(
                    "change",
                    handleFMOP11RecordSelection
                );

            }


            list.appendChild(
                wrapper
            );

        }
    );

}


// ========================================
// HANDLE FM-OP-11 SELECTION
// ========================================

function handleFMOP11RecordSelection(
    event
) {

    const checkbox =
        event.target;


    const index =
        Number(
            checkbox.dataset.index
        );


    const record =
        fmop11Records[index];


    if (!record) {

        return;

    }


    if (checkbox.checked) {

        if (
            fmop11SelectedRecords.length >=
            14
        ) {

            checkbox.checked =
                false;


            alert(
                "FM-OP-11 สามารถเลือกได้สูงสุด 14 จุด"
            );


            return;

        }


        fmop11SelectedRecords.push(
            record
        );

    } else {

        fmop11SelectedRecords =
            fmop11SelectedRecords.filter(
                function (
                    item
                ) {

                    return (
                        item.recordId !==
                        record.recordId
                    );

                }
            );

    }


    updateFMOP11SelectedCount();

}


// ========================================
// UPDATE SELECTED COUNT
// ========================================

function updateFMOP11SelectedCount() {

    const display =
        document.getElementById(
            "fmop11-selected-count"
        );


    const generateButton =
        document.getElementById(
            "generate-fmop11-button"
        );


    const count =
        fmop11SelectedRecords.length;


    if (display) {

        display.textContent =
            `${count} / 14 จุด`;

    }


    if (generateButton) {

        generateButton.disabled =
            count === 0;

    }

}


// ========================================
// CLEAR FM-OP-11 SELECTION
// ========================================

function clearFMOP11Selection() {

    fmop11SelectedRecords = [];


    const checkboxes =
        document.querySelectorAll(
            ".fmop11-record-checkbox"
        );


    checkboxes.forEach(
        function (
            checkbox
        ) {

            checkbox.checked =
                false;

        }
    );


    updateFMOP11SelectedCount();

}


// ========================================
// GENERATE FM-OP-11
// ========================================

async function generateFMOP11() {

    if (
        fmop11SelectedRecords.length === 0
    ) {

        alert(
            "กรุณาเลือกรายการตรวจอย่างน้อย 1 จุด"
        );

        return;

    }


    if (
        fmop11SelectedRecords.length > 14
    ) {

        alert(
            "สามารถเลือกได้สูงสุด 14 จุด"
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


    const generateButton =
        document.getElementById(
            "generate-fmop11-button"
        );


    const status =
        document.getElementById(
            "fmop11-generation-status"
        );


    if (generateButton) {

        generateButton.disabled =
            true;

        generateButton.textContent =
            "กำลังสร้าง...";

    }


    if (status) {

        status.style.display =
            "block";

        status.textContent =
            "กำลังสร้างเอกสาร FM-OP-11...";

    }


    try {

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
                                "generateFMOP11",

                            records:
                                fmop11SelectedRecords,

                            createdBy:
                                user.name ||
                                "",

                            createdByEmail:
                                user.email ||
                                ""

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการสร้าง FM-OP-11:",
            data
        );


        if (data.success) {

            if (status) {

                status.textContent =
                    "สร้าง FM-OP-11 สำเร็จ";

            }


            alert(
                "สร้างเอกสาร FM-OP-11 สำเร็จ"
            );


            if (data.fileUrl) {

                window.open(
                    data.fileUrl,
                    "_blank"
                );

            }


            clearFMOP11Selection();

        } else {

            if (status) {

                status.textContent =
                    "ไม่สามารถสร้างเอกสารได้";

            }


            alert(

                data.message ||
                "ไม่สามารถสร้างเอกสาร FM-OP-11 ได้"

            );

        }

    } catch (error) {

        console.error(
            "สร้าง FM-OP-11 ไม่สำเร็จ:",
            error
        );


        if (status) {

            status.textContent =
                "เกิดข้อผิดพลาดในการสร้างเอกสาร";

        }


        alert(
            "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
        );

    } finally {

        if (generateButton) {

            generateButton.disabled =
                fmop11SelectedRecords.length === 0;

            generateButton.textContent =
                "📄 สร้าง FM-OP-11";

        }

    }

}


// ======================================================
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