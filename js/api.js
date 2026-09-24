/**
 * ========================================
 * GGN Docs - API
 * ========================================
 *
 * File: api.js
 * Version: v2.2.0
 * Updated: 2026-09-24
 *
 * Version History
 *
 * v2.2.0
 * - เพิ่มการส่ง Email ผู้ใช้งานสำหรับ Inspection Permission
 * - apiGetInspections() ส่ง email ไป Backend
 * - apiGetInspection() ส่ง email ไป Backend
 * - apiUpdateInspection() ส่ง updatedByEmail ไป Backend
 * - apiDeleteInspection() ส่ง deletedByEmail ไป Backend
 * - ใช้ ggnDocsUser เป็นแหล่งข้อมูล Session
 * - คง LocationMaster / pointId API เดิม
 * - คง FM-OP-11 V1 เดิม
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
// GET CURRENT LOGIN USER
// ========================================
//
// ใช้ Session จาก localStorage
// key: ggnDocsUser
//
// ตัวอย่าง:
// {
//   email: "opggn1@gmail.com",
//   name: "สายตรวจ A",
//   zone: "เชียงใหม่ เขต 1",
//   department: "Operations",
//   role: "User",
//   status: "Active"
// }
//
// ========================================

function getCurrentGGNUser() {

    try {

        const session =
            localStorage.getItem(
                "ggnDocsUser"
            );


        if (!session) {

            return null;

        }


        const user =
            JSON.parse(
                session
            );


        if (
            !user ||
            !user.email
        ) {

            return null;

        }


        return user;


    } catch (error) {

        console.error(
            "getCurrentGGNUser Error:",
            error
        );


        return null;

    }

}


// ========================================
// GET CURRENT USER EMAIL
// ========================================

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
    ).trim();

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
//
// Permission:
//
// User:
//   Backend จะบังคับดูเฉพาะรายการของตัวเอง
//
// Admin:
//   เห็นทั้งหมด
//   หรือกรอง inspectorName ได้
//
// ========================================

async function apiGetInspections(
    filters = {}
) {

    try {

        const user =
            getCurrentGGNUser();


        if (
            !user ||
            !user.email
        ) {

            return {

                success: false,

                message:
                    "ไม่พบ Session ผู้ใช้งาน"

            };

        }


        const requestData = {

            ...filters,

            email:
                user.email

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
                                "getInspections",

                            ...requestData

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
                "ไม่สามารถดึงรายการตรวจได้",

            inspections:
                []

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
//
// Backend Permission:
//
// Admin → เปิดได้ทุก Inspection
// User  → เปิดได้เฉพาะของตัวเอง
//
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


        const email =
            getCurrentGGNUserEmail();


        if (!email) {

            return {

                success: false,

                message:
                    "ไม่พบ Session ผู้ใช้งาน"

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
                                recordId,

                            email:
                                email

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
//
// Backend Permission:
//
// Admin → แก้ได้ทั้งหมด
// User  → แก้เฉพาะของตัวเอง
//
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


        const email =
            getCurrentGGNUserEmail();


        if (!email) {

            return {

                success: false,

                message:
                    "ไม่พบ Session ผู้ใช้งาน"

            };

        }


        const requestInspection = {

            ...inspection,

            updatedByEmail:
                email

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
                                "updateInspection",

                            inspection:
                                requestInspection

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
//
// Backend Permission:
//
// Admin → ลบได้ทั้งหมด
// User  → ลบเฉพาะของตัวเอง
//
// Business Rule:
//
// ถ้ามี fileId หรือ fileUrl
// → ไม่สามารถลบได้
//
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


        const email =
            getCurrentGGNUserEmail();


        if (!email) {

            return {

                success: false,

                message:
                    "ไม่พบ Session ผู้ใช้งาน"

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

                            deletedByEmail:
                                email

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
//
// FM-OP-11 V1
// คงโครงสร้างเดิมไว้
//
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