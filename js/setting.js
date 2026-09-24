// ======================================================
// GGN DOCS - INSPECTION SETTINGS
// VERSION: 2.1.0
// DATE: 2026-09-24
//
// CHANGE:
// - แก้ปัญหา Promise.all() ทำให้ Inspection Items หาย
// - แยกการโหลด Zone / Location / Inspector / Item
// - ถ้า Setting ตัวใดตัวหนึ่งโหลดไม่สำเร็จ
//   จะไม่ล้างข้อมูลของ Setting ตัวอื่น
// - Inspection Items โหลดแยกเพื่อไม่ให้ได้รับผลกระทบ
//   จาก Legacy Settings ตัวอื่น
// - คง renderInspectionZones()
// - คง renderInspectionLocations()
// - คง renderInspectionInspectors()
// - คง renderInspectionItems()
// - ไม่กระทบ LocationMaster
// - ไม่กระทบ Permission
// - ไม่กระทบ FM-OP-11 V1
// ======================================================


// ======================================================
// GET SETTINGS
// ======================================================

async function getInspectionSetting(
    settingType
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
                    JSON.stringify({

                        action:
                            "getSettings",

                        settingType:
                            settingType

                    })

            }

        );


    // ----------------------------------------
    // ตรวจ HTTP Status
    // ----------------------------------------

    if (!response.ok) {

        throw new Error(
            "HTTP " +
            response.status +
            " - " +
            response.statusText
        );

    }


    // ----------------------------------------
    // อ่าน JSON
    // ----------------------------------------

    return await response.json();

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