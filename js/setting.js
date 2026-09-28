// ======================================================
// GGN DOCS - INSPECTION SETTINGS
// VERSION: 2.2.0
// DATE: 2026-09-24
//
// CHANGE:
// - เปลี่ยนการเรียก Settings ให้ใช้ apiGetSettings()
// - ไม่สร้าง fetch(API_URL) ซ้ำใน setting.js
// - แก้ปัญหา getSettings ไม่ถูกส่งไปยัง Backend
// - รองรับ Inspector / Zone สำหรับ Inspection List
// - คงการโหลด Zone / Location / Inspector / Item
// - คง renderInspectionZones()
// - คง renderInspectionLocations()
// - คง renderInspectionInspectors()
// - คง renderInspectionItems()
// - ไม่กระทบ LocationMaster
// - ไม่กระทบ Permission
// - ไม่กระทบ FM-OP-11 V1
// ======================================================

async function getInspectionSetting(
    settingType
) {

    try {

        // ----------------------------------------------
        // ตรวจว่ามี apiGetSettings หรือไม่
        // ----------------------------------------------

        if (
            typeof apiGetSettings !==
            "function"
        ) {

            throw new Error(
                "ไม่พบฟังก์ชัน apiGetSettings() จาก api.js"
            );

        }


        // ----------------------------------------------
        // เรียก API กลาง
        // ----------------------------------------------

        const data =
            await apiGetSettings(
                settingType
            );


        // ----------------------------------------------
        // DEBUG
        // ----------------------------------------------

        console.log(
            "Inspection Setting API:",
            settingType,
            data
        );


        return data;


    } catch (error) {

        console.error(
            "getInspectionSetting Error:",
            settingType,
            error
        );


        return {

            success: false,

            message:
                error.message ||
                "ไม่สามารถดึงข้อมูล Settings ได้",

            settings:
                []

        };

    }

}


// ======================================================
// LOAD ONE SETTING SAFELY
// ======================================================

async function loadSingleInspectionSetting(
    settingType
) {

    try {

        const data =
            await getInspectionSetting(
                settingType
            );


        if (
            data &&
            data.success &&
            Array.isArray(
                data.settings
            )
        ) {

            console.log(
                "โหลด Setting สำเร็จ:",
                settingType,
                data.settings
            );


            return data.settings;

        }


        console.warn(
            "Setting ไม่มีข้อมูล:",
            settingType,
            data
        );


        return [];


    } catch (error) {

        console.error(
            "โหลด Setting ไม่สำเร็จ:",
            settingType,
            error
        );


        return [];

    }

}

// ======================================================
// LOAD INSPECTION SETTINGS
// ======================================================

async function loadInspectionSettings() {

    console.log(
        "กำลังโหลด Inspection Item Settings..."
    );


    // ==================================================
    // LOAD ONLY INSPECTION ITEM
    // ==================================================
    //
    // Zone / Location / Inspector
    // ไม่โหลดจาก Settings เดิมอีกแล้ว
    //
    // Zone / Location
    // → ใช้ LocationMaster + Permission
    //
    // Inspector
    // → ไม่ดึงจาก Settings เก่าสำหรับ Inspection
    //
    // ==================================================

    const itemData =
        await loadSingleInspectionSetting(
            "inspectionItem"
        );


    // ==================================================
    // INSPECTION ITEMS
    // ==================================================

    inspectionItems =
        Array.isArray(
            itemData
        )
            ? itemData
            : [];


    // ==================================================
    // RENDER ONLY INSPECTION ITEMS
    // ==================================================

    renderInspectionItems();


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "Inspection Item Settings โหลดเสร็จแล้ว"
    );


    console.log(
        "Items:",
        inspectionItems.length
    );

}