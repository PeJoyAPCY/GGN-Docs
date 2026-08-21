
// ========================================
// GGN Docs
// API.JS
// ========================================
// หน้าที่:
// - ติดต่อ Google Apps Script API
// - รวม function สำหรับ GET / POST API
// - ไม่เก็บ state
// - ไม่จัดการ UI
// ========================================


// ========================================
// GENERIC API REQUEST
// ========================================

async function apiRequest(
    action,
    payload = {}
) {

    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({
                            action,
                            ...payload
                        })
                }
            );


        const data =
            await response.json();


        console.log(
            `API [${action}] :`,
            data
        );


        return data;

    } catch (error) {

        console.error(
            `API [${action}] ERROR:`,
            error
        );


        return {
            success: false,

            message:
                "ไม่สามารถเชื่อมต่อ API ได้",

            error:
                error.message
        };

    }

}


// ========================================
// TEST API
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

async function apiGoogleLogin(
    credential
) {

    return await apiRequest(
        "googleLogin",
        {
            credential
        }
    );

}


// ========================================
// GET USER INFO
// ========================================

async function apiGetUserInfo(
    email
) {

    return await apiRequest(
        "getUserInfo",
        {
            email
        }
    );

}


// ========================================
// DOCUMENTS
// ========================================


// GET DOCUMENTS

async function apiGetDocuments() {

    return await apiRequest(
        "getDocuments"
    );

}


// ADD DOCUMENT

async function apiAddDocument(
    documentData
) {

    return await apiRequest(
        "addDocument",
        {
            document:
                documentData
        }
    );

}


// ========================================
// INSPECTIONS
// ========================================


// SAVE INSPECTION

async function apiSaveInspection(
    inspection
) {

    return await apiRequest(
        "saveInspection",
        {
            inspection
        }
    );

}


// GET INSPECTION

async function apiGetInspection(
    recordId
) {

    return await apiRequest(
        "getInspection",
        {
            recordId
        }
    );

}


// GET INSPECTIONS

async function apiGetInspections() {

    return await apiRequest(
        "getInspections"
    );

}


// GET INSPECTION ITEMS

async function apiGetInspectionItems(
    recordId
) {

    return await apiRequest(
        "getInspectionItems",
        {
            recordId
        }
    );

}


// ========================================
// SETTINGS
// ========================================

async function apiGetSettings(
    settingType = ""
) {

    return await apiRequest(
        "getSettings",
        {
            settingType
        }
    );

}


// ========================================
// FM-OP-11
// ========================================

async function apiGenerateFMOP11(
    records,
    createdBy,
    createdByEmail
) {

    return await apiRequest(
        "generateFMOP11",
        {
            records,
            createdBy,
            createdByEmail
        }
    );

}


// ========================================
// END API.JS
// ========================================