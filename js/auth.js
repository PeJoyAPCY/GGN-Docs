// ========================================
// GGN Docs
// AUTH.JS
// ========================================
// หน้าที่:
// - Google Identity Services
// - Google Login
// - ตรวจสอบผู้ใช้งานกับ Backend
// - บันทึก / กู้คืน Session
// - แสดงข้อมูลผู้ใช้งาน
// - แสดง / ซ่อน Login และ Application
// - Logout
// ========================================


// ========================================
// CONFIG
// ========================================

const AUTH_SESSION_KEY =
    "ggnDocsUser";


// ========================================
// GOOGLE IDENTITY SERVICES
// ========================================

function waitForGoogle() {

    // ----------------------------------------
    // GOOGLE พร้อมใช้งานแล้ว
    // ----------------------------------------

    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        initGoogleLogin();

        return;

    }


    // ----------------------------------------
    // รอ Google โหลด
    // ----------------------------------------

    let retryCount =
        Number(
            window.ggnGoogleRetryCount ||
            0
        );


    retryCount++;


    window.ggnGoogleRetryCount =
        retryCount;


    // ----------------------------------------
    // ป้องกันการรอไม่สิ้นสุด
    // ----------------------------------------

    if (
        retryCount > 50
    ) {

        console.error(
            "ไม่สามารถโหลด Google Identity Services ได้"
        );


        showLoginMessage(
            "ไม่สามารถโหลดระบบ Google Login ได้"
        );


        return;

    }


    setTimeout(
        waitForGoogle,
        300
    );

}


// ========================================
// INITIALIZE GOOGLE LOGIN
// ========================================

function initGoogleLogin() {

    if (
        !window.google ||
        !google.accounts ||
        !google.accounts.id
    ) {

        console.error(
            "Google Identity Services ยังไม่พร้อม"
        );

        return;

    }


    if (
        typeof GOOGLE_CLIENT_ID ===
        "undefined" ||
        !GOOGLE_CLIENT_ID
    ) {

        console.error(
            "ไม่พบ GOOGLE_CLIENT_ID"
        );


        showLoginMessage(
            "ไม่พบการตั้งค่า Google Login"
        );


        return;

    }


    console.log(
        "Google Identity Services พร้อมใช้งาน"
    );


    // ----------------------------------------
    // INITIALIZE
    // ----------------------------------------

    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleLogin,

        auto_select:
            false

    });


    // ----------------------------------------
    // LOGIN BUTTON
    // ----------------------------------------

    const loginButton =
        document.getElementById(
            "google-login"
        );


    if (!loginButton) {

        console.warn(
            "ไม่พบ #google-login"
        );

        return;

    }


    // ----------------------------------------
    // ป้องกัน Render ซ้ำ
    // ----------------------------------------

    if (
        loginButton.dataset.googleInitialized ===
        "true"
    ) {

        return;

    }


    google.accounts.id.renderButton(

        loginButton,

        {

            theme:
                "outline",

            size:
                "large",

            text:
                "signin_with",

            shape:
                "rectangular"

        }

    );


    loginButton.dataset.googleInitialized =
        "true";


    console.log(
        "Google Login Button พร้อมใช้งาน"
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


    if (
        !response
    ) {

        showLoginMessage(
            "ไม่พบข้อมูลจาก Google"
        );

        return;

    }


    const credential =
        response.credential;


    if (
        !credential
    ) {

        showLoginMessage(
            "ไม่พบข้อมูลยืนยันตัวตนจาก Google"
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


        // ----------------------------------------
        // API LOGIN
        // ----------------------------------------

        const data =
            await apiGoogleLogin(
                credential
            );


        console.log(
            "ผลการตรวจสอบผู้ใช้งาน:",
            data
        );


        // ----------------------------------------
        // LOGIN SUCCESS
        // ----------------------------------------

        if (
            data &&
            data.success &&
            data.found &&
            data.user
        ) {

            // บันทึก Session
            const sessionSaved =
                saveSession(
                    data.user
                );


            if (!sessionSaved) {

                showLoginMessage(
                    "ไม่สามารถบันทึก Session ได้"
                );

                return;

            }


            // แสดงข้อมูลผู้ใช้
            showUserInfo(
                data.user
            );


            // ------------------------------------
            // เปิด Application
            // ------------------------------------

            showApplication();


            // ------------------------------------
            // STATUS
            // ------------------------------------

            showLoginMessage(
                "เชื่อมต่อ Google Apps Script สำเร็จ"
            );


            console.log(
                "เข้าสู่ระบบ GGN Docs สำเร็จ:",
                data.user
            );


            return;

        }


        // ----------------------------------------
        // LOGIN FAILED
        // ----------------------------------------

        clearSession();


        showLoginMessage(

            data &&
            data.message

                ? data.message

                : "ไม่พบผู้ใช้งานในระบบ"

        );


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
// SHOW APPLICATION
// ========================================
// เปลี่ยนจาก Login Page
// ไปเป็น Application Page
// ========================================

function showApplication() {

    const loginPage =
        document.getElementById(
            "login-page"
        );


    const appPage =
        document.getElementById(
            "app-page"
        );


    // ----------------------------------------
    // HIDE LOGIN
    // ----------------------------------------

    if (loginPage) {

        loginPage.style.display =
            "none";

    }


    // ----------------------------------------
    // SHOW APPLICATION
    // ----------------------------------------

    if (appPage) {

        appPage.style.display =
            "block";

    }


    // ----------------------------------------
    // BODY STATE
    // ----------------------------------------

    if (document.body) {

        document.body.classList.add(
            "authenticated"
        );

    }


    console.log(
        "แสดงหน้า Application"
    );

}


// ========================================
// SHOW LOGIN PAGE
// ========================================

function showLoginPage() {

    const loginPage =
        document.getElementById(
            "login-page"
        );


    const appPage =
        document.getElementById(
            "app-page"
        );


    // ----------------------------------------
    // SHOW LOGIN
    // ----------------------------------------

    if (loginPage) {

        loginPage.style.display =
            "block";

    }


    // ----------------------------------------
    // HIDE APPLICATION
    // ----------------------------------------

    if (appPage) {

        appPage.style.display =
            "none";

    }


    // ----------------------------------------
    // BODY STATE
    // ----------------------------------------

    if (document.body) {

        document.body.classList.remove(
            "authenticated"
        );

    }


    console.log(
        "แสดงหน้า Login"
    );

}


// ========================================
// SAVE SESSION
// ========================================

function saveSession(
    user
) {

    if (
        !user ||
        typeof user !== "object"
    ) {

        console.error(
            "ไม่สามารถบันทึก Session: ข้อมูลผู้ใช้ไม่ถูกต้อง"
        );


        return false;

    }


    try {

        localStorage.setItem(

            AUTH_SESSION_KEY,

            JSON.stringify(
                user
            )

        );


        console.log(
            "บันทึก Session สำเร็จ"
        );


        return true;


    } catch (error) {

        console.error(
            "ไม่สามารถบันทึก Session:",
            error
        );


        return false;

    }

}


// ========================================
// RESTORE SESSION
// ========================================

function restoreSession() {

    try {

        const savedUser =
            localStorage.getItem(
                AUTH_SESSION_KEY
            );


        if (!savedUser) {

            showLoginPage();

            return null;

        }


        const user =
            JSON.parse(
                savedUser
            );


        // ----------------------------------------
        // ตรวจสอบข้อมูลพื้นฐาน
        // ----------------------------------------

        if (
            !user ||
            typeof user !== "object"
        ) {

            clearSession();

            showLoginPage();

            return null;

        }


        if (
            !user.email
        ) {

            console.warn(
                "Session ไม่มี Email"
            );


            clearSession();

            showLoginPage();

            return null;

        }


        console.log(
            "กู้คืน Session:",
            user
        );


        // ----------------------------------------
        // แสดงข้อมูลผู้ใช้
        // ----------------------------------------

        showUserInfo(
            user
        );


        // ----------------------------------------
        // เปิด Application
        // ----------------------------------------

        showApplication();


        return user;


    } catch (error) {

        console.error(
            "ไม่สามารถกู้คืน Session:",
            error
        );


        clearSession();

        showLoginPage();


        return null;

    }

}


// ========================================
// GET CURRENT USER
// ========================================

function getCurrentUser() {

    try {

        const savedUser =
            localStorage.getItem(
                AUTH_SESSION_KEY
            );


        if (!savedUser) {

            return null;

        }


        const user =
            JSON.parse(
                savedUser
            );


        if (
            !user ||
            typeof user !== "object"
        ) {

            return null;

        }


        return user;


    } catch (error) {

        console.error(
            "ไม่สามารถอ่านข้อมูลผู้ใช้งาน:",
            error
        );


        return null;

    }

}


// ========================================
// CLEAR SESSION
// ========================================

function clearSession() {

    try {

        localStorage.removeItem(
            AUTH_SESSION_KEY
        );


    } catch (error) {

        console.error(
            "ไม่สามารถล้าง Session:",
            error
        );

    }

}


// ========================================
// SHOW USER INFO
// ========================================

function showUserInfo(
    user
) {

    if (
        !user
    ) {

        return;

    }


    console.log(
        "ผู้ใช้งานปัจจุบัน:",
        user
    );


    // ----------------------------------------
    // HEADER NAME
    // ----------------------------------------

    const userName =
        document.getElementById(
            "header-user-name"
        );


    // ----------------------------------------
    // HEADER ROLE
    // ----------------------------------------

    const userRole =
        document.getElementById(
            "header-user-role"
        );


    if (userName) {

        userName.textContent =
            user.name ||
            "-";

    }


    if (userRole) {

        userRole.textContent =
            user.role ||
            user.department ||
            "-";

    }


    // ----------------------------------------
    // OPTIONAL OLD ELEMENTS
    // ----------------------------------------
    // รองรับกรณี HTML มี element เหล่านี้ในอนาคต

    const oldUserName =
        document.getElementById(
            "user-name"
        );


    const oldUserEmail =
        document.getElementById(
            "user-email"
        );


    const oldUserDepartment =
        document.getElementById(
            "user-department"
        );


    if (oldUserName) {

        oldUserName.textContent =
            user.name ||
            "";

    }


    if (oldUserEmail) {

        oldUserEmail.textContent =
            user.email ||
            "";

    }


    if (oldUserDepartment) {

        oldUserDepartment.textContent =
            user.department ||
            "";

    }

}


// ========================================
// LOGIN MESSAGE
// ========================================

function showLoginMessage(
    message
) {

    // ----------------------------------------
    // HTML ปัจจุบันใช้ #api-status
    // ----------------------------------------

    let element =
        document.getElementById(
            "api-status"
        );


    // ----------------------------------------
    // รองรับ #login-message เดิม
    // ----------------------------------------

    if (!element) {

        element =
            document.getElementById(
                "login-message"
            );

    }


    if (!element) {

        console.warn(
            "ไม่พบ element สำหรับแสดง Login Message"
        );

        return;

    }


    element.textContent =
        message ||
        "";


    element.style.display =
        "block";

}


// ========================================
// LOGOUT SETUP
// ========================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    if (!logoutButton) {

        console.warn(
            "ไม่พบ #logout-button"
        );

        return;

    }


    // ----------------------------------------
    // ป้องกัน Event ซ้ำ
    // ----------------------------------------

    if (
        logoutButton.dataset.logoutBound ===
        "true"
    ) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        logout
    );


    logoutButton.dataset.logoutBound =
        "true";


    console.log(
        "Logout พร้อมใช้งาน"
    );

}


// ========================================
// LOGOUT
// ========================================

function logout() {

    console.log(
        "กำลังออกจากระบบ..."
    );


    // ----------------------------------------
    // CLEAR LOCAL SESSION
    // ----------------------------------------

    clearSession();


    // ----------------------------------------
    // GOOGLE LOGOUT
    // ----------------------------------------

    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        try {

            google.accounts.id.disableAutoSelect();

        } catch (error) {

            console.warn(
                "ไม่สามารถ reset Google Auto Select:",
                error
            );

        }

    }


    // ----------------------------------------
    // SHOW LOGIN PAGE
    // ----------------------------------------

    showLoginPage();


    // ----------------------------------------
    // RELOAD
    // ----------------------------------------

    location.reload();

}


// ========================================
// END AUTH.JS
// ========================================