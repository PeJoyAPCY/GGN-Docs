// ======================================================
// GGN DOCS - API
// VERSION: 2.2.0
// DATE: 2026-09-24
//
// CHANGE:
// - เพิ่ม getCurrentGGNUser()
// - เพิ่ม getCurrentGGNUserEmail()
// - เพิ่ม apiGetInspectionUsers()
// - ใช้ Users Sheet เป็น Source of Truth สำหรับ Inspector / Zone
// - ส่ง Email ผู้ใช้งานไป Backend สำหรับ Inspection Permission
// - ปรับ apiGetInspections() ให้ส่ง email
// - ปรับ apiGetInspection() ให้ส่ง email
// - ปรับ apiUpdateInspection() ให้ส่ง updatedByEmail
// - ปรับ apiDeleteInspection() ให้ส่ง deletedByEmail
// - คง LocationMaster / pointId Flow
// - คง Settings API สำหรับ inspectionItem
// - คง FM-OP-11 API เดิม
// - ไม่กระทบ FM-OP-11 Version 1
// ======================================================


// ========================================
// GET CURRENT GGN USER
// ========================================
//
// อ่านข้อมูล User จาก localStorage
// Key:
//   ggnDocsUser
//
// ========================================

function getCurrentGGNUser() {

    try {

        const storedUser =
            localStorage.getItem(
                "ggnDocsUser"
            );


        if (!storedUser) {

            return null;

        }


        return JSON.parse(
            storedUser
        );

    } catch (error) {

        console.error(
            "getCurrentGGNUser Error:",
            error
        );


        return null;

    }

}


// ========================================
// GET CURRENT GGN USER EMAIL
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
    )
    .trim();

}


// ========================================
// TEST GOOGLE APPS SCRIPT API
// ========================================

async function testAPI() {

    try {

        const response =
            await fetch(
                API_URL
            );


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
// Backend Permission:
//
// Admin:
//   เห็นรายการทั้งหมด
//
// User:
//   เห็นเฉพาะรายการของตัวเอง
//
// ========================================

async function apiGetInspections(
    filters = {}
) {

    try {

        const email =
            getCurrentGGNUserEmail();


        if (!email) {

            return {

                success: false,

                message:
                    "ไม่พบ Email ผู้ใช้งาน",

                inspections:
                    []

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
                                "getInspections",

                            ...filters,

                            email:
                                email

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
// GET INSPECTION USERS
// ========================================
//
// ใช้สำหรับ Admin Filter
//
// Source:
//   Users Sheet
//
// Backend ตรวจสอบ:
//   Admin เท่านั้น
//
// Response:
//   users[]
//
// ========================================

async function apiGetInspectionUsers() {

    try {

        const email =
            getCurrentGGNUserEmail();


        if (!email) {

            return {

                success: false,

                message:
                    "ไม่พบ Email ผู้ใช้งาน",

                users:
                    []

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
                                "getInspectionUsers",

                            email:
                                email

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการดึง Inspection Users:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiGetInspectionUsers Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถดึงรายชื่อผู้ตรวจได้",

            users:
                []

        };

    }

}


// ========================================
// GET INSPECTION LOCATIONS
// ========================================
//
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
//
// ========================================

async function apiGetInspectionLocations(
    email = ""
) {

    try {

        const requesterEmail =
            email ||
            getCurrentGGNUserEmail();


        if (!requesterEmail) {

            return {

                success: false,

                message:
                    "ไม่พบ Email ผู้ใช้งาน",

                locations:
                    []

            };

        }


        const url =
            `${API_URL}?action=getInspectionLocations&email=${encodeURIComponent(requesterEmail)}`;


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
//   Admin → ได้ทั้งหมด
//   User  → ได้เฉพาะรายการของตัวเอง
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
                    "ไม่พบ Email ผู้ใช้งาน"

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
//   User  → แก้เฉพาะรายการตัวเอง
//   Admin → แก้ได้ทั้งหมด
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
                    "ไม่พบ Email ผู้ใช้งาน"

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

                            inspection: {

                                ...inspection,

                                updatedByEmail:
                                    email

                            }

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
//   User  → ลบเฉพาะรายการตัวเอง
//   Admin → ลบได้ทั้งหมด
//
// Business Rule:
//   ถ้ามี fileId หรือ fileUrl
//   จะไม่สามารถลบได้
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
                    "ไม่พบ Email ผู้ใช้งาน"

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
//
// ปัจจุบัน Settings ใช้สำหรับ:
//   inspectionItem
//
// Zone / Location / Inspector
// จะไม่ใช้จาก Settings แล้ว
//
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
// คง Flow เดิม
// ไม่เปลี่ยน PDF Generation
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