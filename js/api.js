// ========================================
// GGN DOCS
// API
// ========================================


// ======================================================
// API REQUEST
// ======================================================

async function apiRequest(
    payload
) {

    try {

        // ==============================================
        // CHECK API URL
        // ==============================================

        if (
            !API_URL
        ) {

            throw new Error(
                "ไม่พบ API_URL"
            );

        }


        // ==============================================
        // REQUEST
        // ==============================================

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
                        JSON.stringify(
                            payload
                        )

                }

            );


        // ==============================================
        // HTTP ERROR
        // ==============================================

        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP Error ${response.status}`
            );

        }


        // ==============================================
        // READ RESPONSE
        // ==============================================

        const text =
            await response.text();


        if (
            !text
        ) {

            throw new Error(
                "API ไม่ส่งข้อมูลกลับมา"
            );

        }


        // ==============================================
        // PARSE JSON
        // ==============================================

        let data;


        try {

            data =
                JSON.parse(
                    text
                );

        } catch (parseError) {

            console.error(
                "API ส่งข้อมูลที่ไม่ใช่ JSON:",
                text
            );


            throw new Error(
                "API ส่งข้อมูลกลับมาไม่ถูกต้อง"
            );

        }


        // ==============================================
        // LOG
        // ==============================================

        console.log(
            "API Request:",
            payload
        );


        console.log(
            "API Response:",
            data
        );


        // ==============================================
        // RETURN
        // ==============================================

        return data;


    } catch (error) {

        console.error(
            "API Request Error:",
            error
        );


        throw error;

    }

}

// ========================================
// GGN Docs
// API
// ========================================


// ======================================================
// API REQUEST
// ======================================================

async function apiRequest(
    payload
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
                    JSON.stringify(
                        payload
                    )

            }

        );


    return await response.json();

}


// ======================================================
// AUTH API
// ======================================================


// ========================================
// GOOGLE LOGIN
// ========================================

async function apiGoogleLogin(
    credential
) {

    return await apiRequest({

        action:
            "googleLogin",

        credential:
            credential

    });

}


// ======================================================
// DOCUMENT API
// ======================================================


// ========================================
// GET DOCUMENTS
// ========================================

async function apiGetDocuments() {

    return await apiRequest({

        action:
            "getDocuments"

    });

}


// ========================================
// ADD DOCUMENT
// ========================================

async function apiAddDocument(
    documentData
) {

    return await apiRequest({

        action:
            "addDocument",

        document:
            documentData

    });

}


// ======================================================
// INSPECTION API
// ======================================================


// ========================================
// GET SETTINGS
// ========================================

async function apiGetSettings(
    settingType
) {

    return await apiRequest({

        action:
            "getSettings",

        settingType:
            settingType

    });

}


// ========================================
// GET INSPECTIONS
// ========================================

async function apiGetInspections(
    options = {}
) {

    const payload = {

        action:
            "getInspections"

    };


    if (
        options.inspectionDate
    ) {

        payload.inspectionDate =
            options.inspectionDate;

    }


    if (
        options.inspectorName
    ) {

        payload.inspectorName =
            options.inspectorName;

    }


    return await apiRequest(
        payload
    );

}


// ========================================
// SAVE INSPECTION
// ========================================

async function apiSaveInspection(
    inspectionData
) {

    return await apiRequest({

        action:
            "saveInspection",

        inspection:
            inspectionData

    });

}


// ======================================================
// FM-OP-11 API
// ======================================================


// ========================================
// GENERATE FM-OP-11
// ========================================

async function apiGenerateFMOP11(
    records,
    createdBy,
    createdByEmail
) {

    return await apiRequest({

        action:
            "generateFMOP11",

        records:
            records,

        createdBy:
            createdBy,

        createdByEmail:
            createdByEmail

    });

}

// ======================================================
// DOCUMENT API
// ======================================================


// ========================================
// GET DOCUMENTS
// ========================================

async function apiGetDocuments() {

    return await apiRequest({

        action:
            "getDocuments"

    });

}


// ========================================
// ADD DOCUMENT
// ========================================

async function apiAddDocument(
    documentData
) {

    return await apiRequest({

        action:
            "addDocument",

        document:
            documentData

    });

}


// ======================================================
// INSPECTION API
// ======================================================


// ========================================
// GET SETTINGS
// ========================================

async function apiGetSettings(
    settingType
) {

    return await apiRequest({

        action:
            "getSettings",

        settingType:
            settingType

    });

}


// ========================================
// GET INSPECTIONS
// ========================================

async function apiGetInspections(
    options = {}
) {

    const payload = {

        action:
            "getInspections"

    };


    // ==============================================
    // INSPECTION DATE
    // ==============================================

    if (
        options &&
        options.inspectionDate
    ) {

        payload.inspectionDate =
            options.inspectionDate;

    }


    // ==============================================
    // INSPECTOR NAME
    // ==============================================

    if (
        options &&
        options.inspectorName
    ) {

        payload.inspectorName =
            options.inspectorName;

    }


    return await apiRequest(
        payload
    );

}


// ========================================
// SAVE INSPECTION
// ========================================

async function apiSaveInspection(
    inspectionData
) {

    return await apiRequest({

        action:
            "saveInspection",

        inspection:
            inspectionData

    });

}


// ======================================================
// FM-OP-11 API
// ======================================================


// ========================================
// GENERATE FM-OP-11
// ========================================
//
// records:
// รายการตรวจที่ผู้ใช้เลือก
// สูงสุด 14 จุด
//
// createdBy:
// ชื่อผู้สร้างเอกสาร
//
// createdByEmail:
// Email ผู้สร้างเอกสาร
// ========================================

async function apiGenerateFMOP11(
    records,
    createdBy,
    createdByEmail
) {

    return await apiRequest({

        action:
            "generateFMOP11",

        records:
            records,

        createdBy:
            createdBy,

        createdByEmail:
            createdByEmail

    });

}


// ======================================================
// END API.JS
// ======================================================