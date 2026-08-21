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

            saveSession(
                data.user
            );


            showUserInfo(
                data.user
            );


            showLoginMessage(
                "เข้าสู่ระบบสำเร็จ"
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

            return null;

        }


        if (
            !user.email
        ) {

            console.warn(
                "Session ไม่มี Email"
            );


            clearSession();

            return null;

        }


        console.log(
            "กู้คืน Session:",
            user
        );


        showUserInfo(
            user
        );


        return user;


    } catch (error) {

        console.error(
            "ไม่สามารถกู้คืน Session:",
            error
        );


        clearSession();


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


    const userName =
        document.getElementById(
            "user-name"
        );


    const userEmail =
        document.getElementById(
            "user-email"
        );


    const userDepartment =
        document.getElementById(
            "user-department"
        );


    // ----------------------------------------
    // NAME
    // ----------------------------------------

    if (userName) {

        userName.textContent =
            user.name ||
            "";

    }


    // ----------------------------------------
    // EMAIL
    // ----------------------------------------

    if (userEmail) {

        userEmail.textContent =
            user.email ||
            "";

    }


    // ----------------------------------------
    // DEPARTMENT
    // ----------------------------------------

    if (userDepartment) {

        userDepartment.textContent =
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

    const element =
        document.getElementById(
            "login-message"
        );


    if (!element) {

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
    // RELOAD
    // ----------------------------------------

    location.reload();

}


// ========================================
// END AUTH.JS
// ========================================