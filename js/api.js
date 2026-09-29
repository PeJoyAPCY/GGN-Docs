// ======================================================
// GGN DOCS - API
// VERSION: 2.4.0
// DATE: 2026-09-29
//
// CHANGE:
// - ปรับการเรียก Google Apps Script Web App ให้เรียบง่าย
// - ยกเลิก cache-busting query parameter
// - ยกเลิก cache: no-store
// - คง redirect: follow
// - ใช้ response.text() ก่อน JSON.parse()
//   เพื่อรองรับ Content Service redirect ของ Apps Script
// - คง Google Login
// - คง Inspection Permission
// - คง LocationMaster / pointId Flow
// - คง Settings API
// - คง FM-OP-11 API
// - ไม่เปลี่ยน Backend API Contract
// ======================================================


// ========================================
// API POST HELPER
// ========================================
//
// Backend:
//   doPost(e)
//
// Payload:
//   {
//      action: "...",
//      ...
//   }
//
// Content-Type:
//   text/plain
//
// เหตุผล:
//   หลีกเลี่ยง CORS preflight
//   และให้ทำงานกับ Google Apps Script Web App
//
// Google Apps Script Content Service
// สามารถ redirect response ไปยัง
// script.googleusercontent.com
//
// จึงใช้ redirect: "follow"
// ========================================

async function postGGNAPI(
    payload
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
                        JSON.stringify(
                            payload
                        ),

                    redirect:
                        "follow"
                }
            );


        const responseText =
            await response.text();


        console.log(
            "GGN API HTTP Status:",
            response.status
        );


        console.log(
            "GGN API Response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                "GGN API HTTP Error: " +
                response.status +
                " " +
                response.statusText
            );

        }


        if (!responseText) {

            throw new Error(
                "GGN API ไม่ส่งข้อมูลกลับมา"
            );

        }


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            console.error(
                "GGN API Response ไม่ใช่ JSON:",
                responseText
            );


            throw new Error(
                "ข้อมูลตอบกลับจาก GGN API ไม่ใช่ JSON"
            );

        }


        return data;

    } catch (error) {

        console.error(
            "postGGNAPI Error:",
            error
        );


        throw error;

    }

}


// ========================================
// GET CURRENT GGN USER
// ========================================
//
// อ่านข้อมูล User จาก localStorage
//
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
                API_URL,
                {
                    method: "GET",

                    redirect:
                        "follow"
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Test API HTTP Status:",
            response.status
        );


        console.log(
            "Test API Response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                " " +
                response.statusText
            );

        }


        if (!responseText) {

            throw new Error(
                "Google Apps Script ไม่ส่งข้อมูลกลับมา"
            );

        }


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            console.error(
                "Test API Response ไม่ใช่ JSON:",
                responseText
            );


            throw new Error(
                "ข้อมูลจาก Google Apps Script ไม่ใช่ JSON"
            );

        }


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


        const data =
            await postGGNAPI({

                action:
                    "googleLogin",

                credential:
                    credential

            });


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


        const data =
            await postGGNAPI({

                action:
                    "getInspections",

                ...filters,

                email:
                    email

            });


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


        const data =
            await postGGNAPI({

                action:
                    "getInspectionUsers",

                email:
                    email

            });


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
            API_URL +
            "?action=getInspectionLocations" +
            "&email=" +
            encodeURIComponent(
                requesterEmail
            );


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    redirect:
                        "follow"
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Inspection Locations HTTP Status:",
            response.status
        );


        console.log(
            "Inspection Locations Response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                " " +
                response.statusText
            );

        }


        if (!responseText) {

            throw new Error(
                "ไม่พบข้อมูล Inspection Locations"
            );

        }


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            console.error(
                "Inspection Locations Response ไม่ใช่ JSON:",
                responseText
            );


            throw new Error(
                "ข้อมูล Inspection Locations ไม่ใช่ JSON"
            );

        }


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
// SAVE INSPECTION
// ========================================
//
// ส่ง Inspection พร้อม Email ของ User ที่ Login
// ไปให้ Backend ตรวจ Permission
//
// Backend จะใช้ requesterEmail เป็นตัวตัดสินสิทธิ์
// ไม่ใช้ createdByEmail จาก inspection เป็นหลัก
//
// ========================================

async function apiSaveInspection(
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
                    "ไม่พบข้อมูลการตรวจ"

            };

        }


        const requesterEmail =
            getCurrentGGNUserEmail();


        if (!requesterEmail) {

            return {

                success: false,

                message:
                    "ไม่พบ Email ผู้ใช้งาน"

            };

        }


        const data =
            await postGGNAPI({

                action:
                    "saveInspection",

                inspection:
                    inspection,

                requesterEmail:
                    requesterEmail

            });


        console.log(
            "ผลการบันทึก Inspection:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiSaveInspection Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถบันทึกข้อมูลการตรวจได้"

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


        const data =
            await postGGNAPI({

                action:
                    "getInspection",

                recordId:
                    recordId,

                email:
                    email

            });


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


        const data =
            await postGGNAPI({

                action:
                    "updateInspection",

                inspection: {

                    ...inspection,

                    updatedByEmail:
                        email

                }

            });


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


        const data =
            await postGGNAPI({

                action:
                    "deleteInspection",

                recordId:
                    recordId,

                deletedByEmail:
                    email

            });


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

        const data =
            await postGGNAPI({

                action:
                    "getSettings",

                settingType:
                    settingType

            });


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


        const data =
            await postGGNAPI({

                action:
                    "generateFMOP11",

                records:
                    records,

                createdBy:
                    createdBy,

                createdByEmail:
                    createdByEmail

            });


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