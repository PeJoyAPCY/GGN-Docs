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
        "กำลังโหลดข้อมูล Inspection Settings..."
    );


    // ==================================================
    // LOAD SETTINGS
    // ==================================================
    //
    // ไม่ใช้ Promise.all()
    //
    // เพราะถ้า Setting ตัวใดตัวหนึ่ง 404
    // จะไม่ทำให้ Inspection Items หาย
    //
    // ==================================================


    const zoneData =
        await loadSingleInspectionSetting(
            "zone"
        );


    const locationData =
        await loadSingleInspectionSetting(
            "location"
        );


    const inspectorData =
        await loadSingleInspectionSetting(
            "inspector"
        );


    const itemData =
        await loadSingleInspectionSetting(
            "inspectionItem"
        );


    // ==================================================
    // ZONE
    // ==================================================

    inspectionZones =
        Array.isArray(
            zoneData
        )
            ? zoneData
            : [];


    // ==================================================
    // LOCATION
    // ==================================================

    inspectionLocations =
        Array.isArray(
            locationData
        )
            ? locationData
            : [];


    // ==================================================
    // INSPECTOR
    // ==================================================

    inspectionInspectors =
        Array.isArray(
            inspectorData
        )
            ? inspectorData
            : [];


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
    // RENDER
    // ==================================================

    renderInspectionZones();

    renderInspectionLocations();

    renderInspectionInspectors();

    renderInspectionItems();


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "Inspection Settings โหลดเสร็จแล้ว"
    );


    console.log(
        "Zones:",
        inspectionZones.length
    );


    console.log(
        "Locations:",
        inspectionLocations.length
    );


    console.log(
        "Inspectors:",
        inspectionInspectors.length
    );


    console.log(
        "Items:",
        inspectionItems.length
    );

}