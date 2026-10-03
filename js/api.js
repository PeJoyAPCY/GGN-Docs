// ======================================================
// GGN DOCS - API
// VERSION: 2.5.0
// DATE: 2026-10-03
//
// CHANGE:
// - เพิ่ม Document API
// - เพิ่ม apiGetDocuments()
// - เพิ่ม apiAddDocument()
// - Document ใช้ requesterEmail จาก Current User
// - ไม่ส่ง createdByEmail / createdByName จาก Frontend
// - ปรับ FM-OP-11 ให้ใช้ requesterEmail จาก Current User
// - คง Google Login
// - คง Inspection Permission
// - คง LocationMaster / pointId Flow
// - คง Settings API
// - คง API POST Helper เดิม
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


// ======================================================
// DOCUMENT SYSTEM API
// ======================================================


// ========================================
// GET DOCUMENTS
// ========================================
//
// Backend Permission:
//
// Admin:
//   เห็นเอกสารทั้งหมด
//
// User:
//   เห็นเฉพาะเอกสารของตัวเอง
//
// Current User:
//   อ่านจาก ggnDocsUser
//
// Backend:
//   ตรวจ Role / Status อีกครั้ง
//
// ========================================

async function apiGetDocuments() {

    try {

        const requesterEmail =
            getCurrentGGNUserEmail();


        if (!requesterEmail) {

            return {

                success: false,

                message:
                    "ไม่พบ Email ผู้ใช้งาน",

                documents:
                    []

            };

        }


        const data =
            await postGGNAPI({

                action:
                    "getDocuments",

                requesterEmail:
                    requesterEmail

            });


        console.log(
            "ผลการดึง Documents:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiGetDocuments Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถดึงรายการเอกสารได้",

            documents:
                []

        };

    }

}


// ========================================
// ADD DOCUMENT
// ========================================
//
// ส่งเฉพาะข้อมูลเอกสาร
//
// ไม่ส่ง:
//   createdByName
//   createdByEmail
//
// Backend จะใช้:
//   requesterEmail
//
// แล้วอ่านตัวจริงจาก Users Sheet
//
// ========================================

async function apiAddDocument(
    documentData
) {

    try {

        if (!documentData) {

            return {

                success: false,

                message:
                    "ไม่พบข้อมูลเอกสาร"

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
                    "addDocument",

                document:
                    documentData,

                requesterEmail:
                    requesterEmail

            });


        console.log(
            "ผลการเพิ่มเอกสาร:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "apiAddDocument Error:",
            error
        );


        return {

            success: false,

            message:
                "ไม่สามารถเพิ่มเอกสารได้"

        };

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
// ใช้ POST ผ่าน postGGNAPI()
// เพื่อหลีกเลี่ยงปัญหา GET Redirect
// ไปยัง script.googleusercontent.com
//
// ========================================

async function apiGetInspectionLocations(
    email = ""
) {

    try {

        const requesterEmail =
            email ||
            getCurrentGGNUserEmail();


        // ========================================
        // CHECK EMAIL
        // ========================================

        if (!requesterEmail) {

            console.error(
                "apiGetInspectionLocations: ไม่พบ Email ผู้ใช้งาน"
            );


            return {

                success: false,

                message:
                    "ไม่พบ Email ผู้ใช้งาน",

                locations:
                    []

            };

        }


        console.log(
            "กำลังดึง Inspection Locations สำหรับ:",
            requesterEmail
        );


        // ========================================
        // CALL GGN API
        // ========================================

        const data =
            await postGGNAPI({

                action:
                    "getInspectionLocations",

                email:
                    requesterEmail

            });


        // ========================================
        // LOG RESPONSE
        // ========================================

        console.log(
            "ผลการดึง Inspection Locations:",
            data
        );


        // ========================================
        // CHECK RESPONSE
        // ========================================

        if (!data) {

            console.error(
                "Inspection Locations API ไม่ส่งข้อมูลกลับมา"
            );


            return {

                success: false,

                message:
                    "ไม่พบข้อมูลจุดตรวจ",

                locations:
                    []

            };

        }


        if (!data.success) {

            console.error(
                "Inspection Locations API Error:",
                data.message
            );


            return {

                success: false,

                message:
                    data.message ||
                    "ไม่สามารถดึงรายการจุดตรวจได้",

                locations:
                    Array.isArray(
                        data.locations
                    )
                        ? data.locations
                        : []

            };

        }


        // ========================================
        // NORMALIZE LOCATIONS
        // ========================================

        const locations =
            Array.isArray(
                data.locations
            )
                ? data.locations
                : [];


        console.log(
            "Inspection Locations สำเร็จ:",
            locations.length,
            "จุด"
        );


        // ========================================
        // RETURN
        // ========================================

        return {

            success: true,

            locations:
                locations

        };

    } catch (error) {

        console.error(
            "apiGetInspectionLocations Error:",
            error
        );


        return {

            success: false,

            message:
                error.message ||
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
// ใช้ Current User จาก ggnDocsUser
//
// ไม่ส่ง:
//   createdBy
//   createdByEmail
//
// Backend จะตรวจสอบ:
//   requesterEmail
//   Role
//   Status
//
// ========================================

async function apiGenerateFMOP11(
    records
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
                    "generateFMOP11",

                records:
                    records,

                requesterEmail:
                    requesterEmail

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