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
