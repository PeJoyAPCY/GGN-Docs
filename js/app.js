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

    waitForGoogle();

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

        document.getElementById(
            "api-status"
        ).textContent = data.message;

    } catch (error) {

        console.error(
            "เชื่อมต่อ API ไม่สำเร็จ:",
            error
        );

        document.getElementById(
            "api-status"
        ).textContent =
            "ไม่สามารถเชื่อมต่อ Google Apps Script ได้";

    }

}


// ========================================
// เริ่ม Google Login
// ========================================

function initGoogleLogin() {

    console.log(
        "Google Identity Services พร้อมใช้งาน"
    );

    google.accounts.id.initialize({

        client_id: GOOGLE_CLIENT_ID,

        callback: handleGoogleLogin

    });


    google.accounts.id.renderButton(

        document.getElementById(
            "google-login"
        ),

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

        showUserMessage(
            "ไม่พบข้อมูลจาก Google"
        );

        return;
    }

    await loginToGGN(
        credential
    );

}


// ========================================
// ส่งข้อมูลไป Apps Script
// ========================================

async function loginToGGN(
    credential
) {

    try {

        showUserMessage(
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

            showUserMessage(
                data.message ||
                "ไม่พบผู้ใช้งานในระบบ"
            );

        }

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        showUserMessage(
            "เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้งาน"
        );

    }

}


// ========================================
// แสดงข้อมูลผู้ใช้
// ========================================

function showUserInfo(user) {

    // บันทึกข้อมูลผู้ใช้ไว้ใน Session ของเบราว์เซอร์
    localStorage.setItem(
        "ggnDocsUser",
        JSON.stringify(user)
    );

    const userInfo =
        document.getElementById(
            "user-info"
        );


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


// ========================================
// แสดงข้อความ
// ========================================

function showUserMessage(message) {

    document.getElementById(
        "user-info"
    ).textContent = message;

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
