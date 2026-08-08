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