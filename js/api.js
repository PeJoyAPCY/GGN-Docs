/**
 * ========================================
 * GGN Docs - API
 * ========================================
 *
 * File: api.js
 * Version: v2.1.0
 * Updated: 2026-09-23
 *
 * Version History
 *
 * v2.1.0
 * - เพิ่ม apiGetInspectionLocations()
 * - รองรับการดึง LocationMaster ตาม Email ผู้ใช้งาน
 * - ใช้ Backend ตรวจสอบ User / Zone / Active Location
 * - รองรับ pointId สำหรับระบบ Inspection ใหม่
 *
 * v1.0.0
 * - Version เริ่มต้น
 *
 * ========================================
 */


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
// GET INSPECTIONS
// ========================================

async function apiGetInspections(
    filters = {}
) {

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
                                "getInspections",

                            ...filters

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการดึงรายการ Inspection:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiGetInspections Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถดึงรายการตรวจได้"

        };

    }

}


// ========================================
// GET INSPECTION LOCATIONS
// ========================================
// ใช้สำหรับระบบบันทึก Inspection ใหม่
//
// Google Account
//      ↓
// User Email
//      ↓
// Backend ตรวจ User / Zone
//      ↓
// LocationMaster
//      ↓
// Active Locations
//
// Admin = เห็นทุก Zone
// User  = เห็นเฉพาะ Zone ของตนเอง
// ========================================

async function apiGetInspectionLocations(
    email = ""
) {

    try {

        if (!email) {

            return {

                success: false,

                message:
                    "ไม่พบ Email ผู้ใช้งาน",

                locations:
                    []

            };

        }


        const url =
            `${API_URL}?action=getInspectionLocations&email=${encodeURIComponent(email)}`;


        const response =
            await fetch(
                url
            );


        const data =
            await response.json();


        console.log(
            "ผลการดึง Inspection Locations:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiGetInspectionLocations Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถดึงรายการจุดตรวจได้",

            locations:
                []

        };

    }

}


// ========================================
// GET ONE INSPECTION
// ========================================

async function apiGetInspection(
    recordId
) {

    try {

        if (!recordId) {

            return {

                success: false,

                message:
                    "ไม่พบ Record ID"

            };

        }


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
                                "getInspection",

                            recordId:
                                recordId

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการดึง Inspection:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiGetInspection Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถดึงรายละเอียดรายการตรวจได้"

        };

    }

}


// ========================================
// UPDATE INSPECTION
// ========================================

async function apiUpdateInspection(
    inspection
) {

    try {

        if (
            !inspection ||
            !inspection.recordId
        ) {

            return {

                success: false,

                message:
                    "ไม่พบ Record ID สำหรับแก้ไข"

            };

        }


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
                                "updateInspection",

                            inspection:
                                inspection

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการแก้ไข Inspection:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiUpdateInspection Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถแก้ไขรายการตรวจได้"

        };

    }

}


// ========================================
// DELETE INSPECTION
// ========================================

async function apiDeleteInspection(
    recordId,
    deletedBy = ""
) {

    try {

        if (!recordId) {

            return {

                success: false,

                message:
                    "ไม่พบ Record ID สำหรับลบ"

            };

        }


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
                                "deleteInspection",

                            recordId:
                                recordId,

                            deletedBy:
                                deletedBy

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการลบ Inspection:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiDeleteInspection Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถลบรายการตรวจได้"

        };

    }

}


// ========================================
// GET SETTINGS
// ========================================

async function apiGetSettings(
    settingType = ""
) {

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
                                "getSettings",

                            settingType:
                                settingType

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการดึง Settings:",
            settingType,
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiGetSettings Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถดึงข้อมูล Settings ได้",

            settings:
                []

        };

    }

}


// ========================================
// GENERATE FM-OP-11
// ========================================

async function apiGenerateFMOP11(
    records,
    createdBy = "",
    createdByEmail = ""
) {

    try {

        if (
            !records ||
            !Array.isArray(records) ||
            records.length === 0
        ) {

            return {

                success: false,

                message:
                    "กรุณาเลือกรายการตรวจ"

            };

        }


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
                                records,

                            createdBy:
                                createdBy,

                            createdByEmail:
                                createdByEmail

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการสร้าง FM-OP-11:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiGenerateFMOP11 Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถสร้างเอกสาร FM-OP-11 ได้"

        };

    }

}