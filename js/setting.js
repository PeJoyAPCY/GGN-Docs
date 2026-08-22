// ========================================
// GET SETTINGS
// ========================================

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


    return await response.json();

}


// ========================================
// LOAD INSPECTION SETTINGS
// ========================================

async function loadInspectionSettings() {

    try {

        console.log(
            "กำลังโหลดข้อมูล Inspection Settings พร้อมกัน..."
        );


        // ========================================
        // LOAD ALL SETTINGS IN PARALLEL
        // ========================================

        const [
            zoneData,
            locationData,
            inspectorData,
            itemData
        ] = await Promise.all([

            getInspectionSetting("zone"),

            getInspectionSetting("location"),

            getInspectionSetting("inspector"),

            getInspectionSetting("inspectionItem")

        ]);


        // ========================================
        // ZONE
        // ========================================

        if (
            zoneData &&
            zoneData.success &&
            Array.isArray(
                zoneData.settings
            )
        ) {

            inspectionZones =
                zoneData.settings;

        } else {

            inspectionZones =
                [];

        }


        // ========================================
        // LOCATION
        // ========================================

        if (
            locationData &&
            locationData.success &&
            Array.isArray(
                locationData.settings
            )
        ) {

            inspectionLocations =
                locationData.settings;

        } else {

            inspectionLocations =
                [];

        }


        // ========================================
        // INSPECTOR
        // ========================================

        if (
            inspectorData &&
            inspectorData.success &&
            Array.isArray(
                inspectorData.settings
            )
        ) {

            inspectionInspectors =
                inspectorData.settings;

        } else {

            inspectionInspectors =
                [];

        }


        // ========================================
        // INSPECTION ITEMS
        // ========================================

        if (
            itemData &&
            itemData.success &&
            Array.isArray(
                itemData.settings
            )
        ) {

            inspectionItems =
                itemData.settings;

        } else {

            inspectionItems =
                [];

        }


        // ========================================
        // RENDER
        // ========================================

        renderInspectionZones();

        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();


        // ========================================
        // DEBUG
        // ========================================

        console.log(
            "Inspection Settings โหลดสำเร็จ"
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


    } catch (error) {

        console.error(
            "โหลด Inspection Settings ไม่สำเร็จ:",
            error
        );


        inspectionZones = [];

        inspectionLocations = [];

        inspectionInspectors = [];

        inspectionItems = [];


        renderInspectionZones();

        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();

    }

}
