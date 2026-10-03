//
// ======================================================
// GGN DOCS - API
// VERSION: 2.5.1
// DATE: 2026-10-03
//
// CHANGE
// - ลบการประกาศ API_URL ซ้ำออกจาก api.js
// - ใช้ API_URL จาก app.js
// - คง Document API Contract
// - คง Inspection API Contract
// - คง FM-OP-11 API Contract
// ======================================================


// ======================================================
// COMMON API REQUEST
// ======================================================

async function postGGNAPI(payload) {

    console.log(
        "GGN API Request:",
        payload
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

                redirect:
                    "follow",

                body:
                    JSON.stringify(
                        payload
                    )

            }

        );


    const text =
        await response.text();


    console.log(
        "GGN API Raw Response:",
        text
    );


    let data;


    try {

        data =
            JSON.parse(text);

    } catch (error) {

        console.error(
            "GGN API JSON Parse Error:",
            error
        );

        throw new Error(
            "API ไม่ได้ส่งข้อมูล JSON ที่ถูกต้อง"
        );

    }


    return data;

}


// ======================================================
// CURRENT USER
// ======================================================

function getCurrentGGNUser() {

    try {

        const raw =
            localStorage.getItem(
                "ggnDocsUser"
            );


        if (!raw) {

            return null;

        }


        const user =
            JSON.parse(raw);


        return user || null;


    } catch (error) {

        console.error(
            "อ่าน Current User ไม่สำเร็จ:",
            error
        );


        return null;

    }

}


// ======================================================
// CURRENT USER EMAIL
// ======================================================

function getCurrentGGNUserEmail() {

    const user =
        getCurrentGGNUser();


    if (
        !user ||
        !user.email
    ) {

        return "";

    }


    return String(
        user.email
    )
        .trim()
        .toLowerCase();

}


// ======================================================
// TEST API
// ======================================================

async function testAPI() {

    try {

        console.log(
            "กำลังทดสอบ GGN API..."
        );


        const data =
            await postGGNAPI({

                action:
                    "test"

            });


        console.log(
            "GGN API Test Result:",
            data
        );


        return data;


    } catch (error) {

        console.error(
            "GGN API Test Failed:",
            error
        );


        return {

            success:
                false,

            message:
                error.message

        };

    }

}


// ======================================================
// GOOGLE LOGIN
// ======================================================

async function loginToGGN(
    idToken
) {

    if (!idToken) {

        return {

            success:
                false,

            message:
                "ไม่พบ Google ID Token"

        };

    }


    try {

        const data =
            await postGGNAPI({

                action:
                    "googleLogin",

                idToken:
                    idToken

            });


        return data;


    } catch (error) {

        console.error(
            "Google Login API Error:",
            error
        );


        return {

            success:
                false,

            message:
                error.message

        };

    }

}


// ======================================================
// USER INFO
// ======================================================

async function apiGetUserInfo(
    email
) {

    const requesterEmail =
        String(
            email ||
            getCurrentGGNUserEmail() ||
            ""
        )
            .trim()
            .toLowerCase();


    if (!requesterEmail) {

        return {

            success:
                false,

            message:
                "ไม่พบ Email ผู้ใช้งาน"

        };

    }


    return await postGGNAPI({

        action:
            "getUserInfo",

        email:
            requesterEmail

    });

}


// ======================================================
// DOCUMENT SYSTEM
// ======================================================


// ========================================
// GET DOCUMENTS
// ========================================
//
// Backend เป็นผู้ตรวจสอบสิทธิ์
//
// User  -> เอกสารของตัวเอง
// Admin -> เอกสารทั้งหมด
//
// Frontend ไม่เป็นผู้ตัดสินสิทธิ์
// ========================================

async function apiGetDocuments() {

    const requesterEmail =
        getCurrentGGNUserEmail();


    if (!requesterEmail) {

        return {

            success:
                false,

            documents:
                [],

            message:
                "ไม่พบ Email ผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"

        };

    }


    console.log(
        "apiGetDocuments requester:",
        requesterEmail
    );


    return await postGGNAPI({

        action:
            "getDocuments",

        requesterEmail:
            requesterEmail

    });

}


// ========================================
// ADD DOCUMENT
// ========================================
//
// requesterEmail = ผู้ใช้งานจาก Session
//
// Backend จะตรวจสอบกับ Users Sheet
// และใช้ข้อมูล User ฝั่ง Backend
// เป็น Source of Truth
// ========================================

async function apiAddDocument(
    documentData
) {

    const requesterEmail =
        getCurrentGGNUserEmail();


    if (!requesterEmail) {

        return {

            success:
                false,

            message:
                "ไม่พบ Email ผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"

        };

    }


    if (
        !documentData ||
        typeof documentData !== "object"
    ) {

        return {

            success:
                false,

            message:
                "ไม่พบข้อมูลเอกสาร"

        };

    }


    console.log(
        "apiAddDocument requester:",
        requesterEmail
    );


    return await postGGNAPI({

        action:
            "addDocument",

        document:
            documentData,

        requesterEmail:
            requesterEmail

    });

}


// ======================================================
// INSPECTION SYSTEM
// ======================================================


// ========================================
// GET INSPECTIONS
// ========================================

async function apiGetInspections(
    filters = {}
) {

    const email =
        getCurrentGGNUserEmail();


    const payload = {

        action:
            "getInspections",

        ...filters,

        email:
            email

    };


    console.log(
        "apiGetInspections:",
        payload
    );


    return await postGGNAPI(
        payload
    );

}


// ========================================
// GET INSPECTION USERS
// ========================================

async function apiGetInspectionUsers() {

    const email =
        getCurrentGGNUserEmail();


    if (!email) {

        return {

            success:
                false,

            users:
                [],

            message:
                "ไม่พบ Email ผู้ใช้งาน"

        };

    }


    return await postGGNAPI({

        action:
            "getInspectionUsers",

        email:
            email

    });

}


// ========================================
// GET INSPECTION LOCATIONS
// ========================================

async function apiGetInspectionLocations(
    email = ""
) {

    const requesterEmail =
        String(
            email ||
            getCurrentGGNUserEmail() ||
            ""
        )
            .trim()
            .toLowerCase();


    if (!requesterEmail) {

        return {

            success:
                false,

            locations:
                [],

            message:
                "ไม่พบ Email ผู้ใช้งาน"

        };

    }


    return await postGGNAPI({

        action:
            "getInspectionLocations",

        email:
            requesterEmail

    });

}


// ========================================
// SAVE INSPECTION
// ========================================

async function apiSaveInspection(
    inspection
) {

    const email =
        getCurrentGGNUserEmail();


    if (!email) {

        return {

            success:
                false,

            message:
                "ไม่พบ Email ผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"

        };

    }


    if (
        !inspection ||
        typeof inspection !== "object"
    ) {

        return {

            success:
                false,

            message:
                "ไม่พบข้อมูล Inspection"

        };

    }


    return await postGGNAPI({

        action:
            "saveInspection",

        inspection:
            inspection,

        requesterEmail:
            email

    });

}


// ========================================
// GET SINGLE INSPECTION
// ========================================

async function apiGetInspection(
    recordId
) {

    const email =
        getCurrentGGNUserEmail();


    if (!email) {

        return {

            success:
                false,

            message:
                "ไม่พบ Email ผู้ใช้งาน"

        };

    }


    if (!recordId) {

        return {

            success:
                false,

            message:
                "ไม่พบ Record ID"

        };

    }


    return await postGGNAPI({

        action:
            "getInspection",

        recordId:
            recordId,

        email:
            email

    });

}


// ========================================
// UPDATE INSPECTION
// ========================================

async function apiUpdateInspection(
    inspection
) {

    const email =
        getCurrentGGNUserEmail();


    if (!email) {

        return {

            success:
                false,

            message:
                "ไม่พบ Email ผู้ใช้งาน"

        };

    }


    if (
        !inspection ||
        typeof inspection !== "object"
    ) {

        return {

            success:
                false,

            message:
                "ไม่พบข้อมูล Inspection"

        };

    }


    const updatedInspection = {

        ...inspection,

        updatedByEmail:
            email

    };


    return await postGGNAPI({

        action:
            "updateInspection",

        inspection:
            updatedInspection

    });

}


// ========================================
// DELETE INSPECTION
// ========================================

async function apiDeleteInspection(
    recordId,
    deletedBy = ""
) {

    const email =
        getCurrentGGNUserEmail();


    if (!email) {

        return {

            success:
                false,

            message:
                "ไม่พบ Email ผู้ใช้งาน"

        };

    }


    if (!recordId) {

        return {

            success:
                false,

            message:
                "ไม่พบ Record ID"

        };

    }


    return await postGGNAPI({

        action:
            "deleteInspection",

        recordId:
            recordId,

        deletedByEmail:
            email

    });

}


// ======================================================
// SETTINGS SYSTEM
// ======================================================


// ========================================
// GET SETTINGS
// ========================================

async function apiGetSettings(
    settingType = ""
) {

    return await postGGNAPI({

        action:
            "getSettings",

        settingType:
            settingType

    });

}


// ======================================================
// FM-OP-11
// ======================================================


// ========================================
// GENERATE FM-OP-11
// ========================================
//
// ใช้ Current User จาก Session
//
// Backend จะเป็นผู้ตรวจสอบว่า
// requester มีสิทธิ์เข้าถึง Inspection
// ที่เลือกหรือไม่
// ========================================

async function apiGenerateFMOP11(
    records
) {

    const requesterEmail =
        getCurrentGGNUserEmail();


    if (!requesterEmail) {

        return {

            success:
                false,

            message:
                "ไม่พบ Email ผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"

        };

    }


    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {

        return {

            success:
                false,

            message:
                "ไม่พบรายการ Inspection ที่เลือก"

        };

    }


    console.log(
        "apiGenerateFMOP11 requester:",
        requesterEmail
    );


    return await postGGNAPI({

        action:
            "generateFMOP11",

        records:
            records,

        requesterEmail:
            requesterEmail

    });

}


// ======================================================
// END OF API
// ======================================================