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
            "กำลังโหลดข้อมูล Inspection Settings..."
        );


        // ------------------------------------
        // LOCATION
        // ------------------------------------

        const locationData =
            await getInspectionSetting(
                "location"
            );


        if (
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


        // ------------------------------------
        // INSPECTOR
        // ------------------------------------

        const inspectorData =
            await getInspectionSetting(
                "inspector"
            );


        if (
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


        // ------------------------------------
        // INSPECTION ITEMS
        // ------------------------------------

        const itemData =
            await getInspectionSetting(
                "inspectionItem"
            );


        if (
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


        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();


    } catch (error) {

        console.error(
            "โหลด Inspection Settings ไม่สำเร็จ:",
            error
        );


        inspectionLocations = [];

        inspectionInspectors = [];

        inspectionItems = [];


        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();

    }

}

