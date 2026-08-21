// ========================================
// GGN Docs
// SETTINGS.JS
// ========================================
// หน้าที่:
// - หน้า Settings
// - โหลดข้อมูล Settings จาก Backend
// - แสดงสถานที่ตรวจ
// - แสดงรายชื่อผู้ตรวจ
// - แสดงรายการหัวข้อการตรวจ
// - รองรับข้อมูลจาก Settings API
// ========================================


// ======================================================
// SETTINGS CONFIG
// ======================================================

const SETTINGS_TYPES = {

    LOCATION:
        "location",

    INSPECTOR:
        "inspector",

    INSPECTION_ITEM:
        "inspectionItem"

};


// ======================================================
// INITIALIZE SETTINGS PAGE
// ======================================================

async function initializeSettingsPage() {

    console.log(
        "กำลังเตรียมหน้า Settings..."
    );


    try {

        await loadSettingsPage();


        console.log(
            "หน้า Settings พร้อมใช้งาน"
        );


    } catch (error) {

        console.error(
            "เตรียมหน้า Settings ไม่สำเร็จ:",
            error
        );

    }

}


// ======================================================
// LOAD SETTINGS PAGE
// ======================================================

async function loadSettingsPage() {

    console.log(
        "กำลังโหลดข้อมูล Settings..."
    );


    // ==================================================
    // LOCATION
    // ==================================================

    const locationData =
        await getSettingsForPage(
            SETTINGS_TYPES.LOCATION
        );


    // ==================================================
    // INSPECTOR
    // ==================================================

    const inspectorData =
        await getSettingsForPage(
            SETTINGS_TYPES.INSPECTOR
        );


    // ==================================================
    // INSPECTION ITEM
    // ==================================================

    const itemData =
        await getSettingsForPage(
            SETTINGS_TYPES.INSPECTION_ITEM
        );


    // ==================================================
    // RENDER
    // ==================================================

    renderSettingsSection(
        SETTINGS_TYPES.LOCATION,
        locationData
    );


    renderSettingsSection(
        SETTINGS_TYPES.INSPECTOR,
        inspectorData
    );


    renderSettingsSection(
        SETTINGS_TYPES.INSPECTION_ITEM,
        itemData
    );


    console.log(
        "โหลด Settings สำเร็จ:",
        {
            locations:
                locationData.length,

            inspectors:
                inspectorData.length,

            inspectionItems:
                itemData.length
        }
    );

}


// ======================================================
// GET SETTINGS
// ======================================================

async function getSettingsForPage(
    settingType
) {

    if (!settingType) {

        return [];

    }


    try {

        const data =
            await apiGetSettings(
                settingType
            );


        console.log(
            `Settings [${settingType}]:`,
            data
        );


        if (
            !data ||
            !data.success ||
            !Array.isArray(
                data.settings
            )
        ) {

            console.warn(
                `ไม่พบ Settings: ${settingType}`
            );


            return [];

        }


        return data.settings;


    } catch (error) {

        console.error(
            `โหลด Settings [${settingType}] ไม่สำเร็จ:`,
            error
        );


        return [];

    }

}


// ======================================================
// RENDER SETTINGS SECTION
// ======================================================

function renderSettingsSection(
    settingType,
    settings
) {

    const container =
        findSettingsContainer(
            settingType
        );


    if (!container) {

        console.warn(
            "ไม่พบ Container สำหรับ Settings:",
            settingType
        );

        return;

    }


    // ==================================================
    // LOADING / EMPTY
    // ==================================================

    if (
        !Array.isArray(settings) ||
        settings.length === 0
    ) {

        container.innerHTML =
            createSettingsEmptyState(
                settingType
            );


        return;

    }


    // ==================================================
    // FILTER ACTIVE
    // ==================================================

    const activeSettings =
        settings.filter(
            function (
                item
            ) {

                if (!item) {

                    return false;

                }


                if (
                    !item.status
                ) {

                    return true;

                }


                return (
                    String(
                        item.status
                    ).toLowerCase()
                    ===
                    "active"
                );

            }
        );


    // ==================================================
    // EMPTY AFTER FILTER
    // ==================================================

    if (
        activeSettings.length === 0
    ) {

        container.innerHTML =
            createSettingsEmptyState(
                settingType
            );


        return;

    }


    // ==================================================
    // SORT
    // ==================================================

    const sortedSettings =
        sortSettings(
            settingType,
            activeSettings
        );


    // ==================================================
    // RENDER
    // ==================================================

    container.innerHTML = "";


    sortedSettings.forEach(
        function (
            item,
            index
        ) {

            const element =
                createSettingsItem(
                    settingType,
                    item,
                    index
                );


            if (element) {

                container.appendChild(
                    element
                );

            }

        }
    );

}


// ======================================================
// FIND SETTINGS CONTAINER
// ======================================================

function findSettingsContainer(
    settingType
) {

    const containerIds = {

        location: [
            "settings-locations",
            "setting-locations",
            "settings-location",
            "setting-location"
        ],

        inspector: [
            "settings-inspectors",
            "setting-inspectors",
            "settings-inspector",
            "setting-inspector"
        ],

        inspectionItem: [
            "settings-inspection-items",
            "setting-inspection-items",
            "settings-inspectionItem",
            "setting-inspectionItem"
        ]

    };


    const ids =
        containerIds[
            settingType
        ] || [];


    for (
        let i = 0;
        i < ids.length;
        i++
    ) {

        const element =
            document.getElementById(
                ids[i]
            );


        if (element) {

            return element;

        }

    }


    return null;

}


// ======================================================
// CREATE SETTINGS ITEM
// ======================================================

function createSettingsItem(
    settingType,
    item,
    index
) {

    if (!item) {

        return null;

    }


    const name =
        getSettingDisplayName(
            settingType,
            item
        );


    if (!name) {

        return null;

    }


    const zone =
        item.zone ||
        item.settingZone ||
        "";


    const sortOrder =
        item.sortOrder ||
        item.itemNo ||
        item.no ||
        "";


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "settings-item";


    // ==================================================
    // LOCATION
    // ==================================================

    if (
        settingType ===
        SETTINGS_TYPES.LOCATION
    ) {

        element.innerHTML = `

            <div class="settings-item-main">

                <strong>
                    ${escapeHTML(
                        name
                    )}
                </strong>

                ${
                    zone
                        ? `
                            <span>
                                ${escapeHTML(
                                    zone
                                )}
                            </span>
                        `
                        : ""
                }

            </div>

            <div class="settings-item-status">

                <span>
                    ใช้งาน
                </span>

            </div>

        `;

        return element;

    }


    // ==================================================
    // INSPECTOR
    // ==================================================

    if (
        settingType ===
        SETTINGS_TYPES.INSPECTOR
    ) {

        element.innerHTML = `

            <div class="settings-item-main">

                <strong>
                    ${escapeHTML(
                        name
                    )}
                </strong>

            </div>

            <div class="settings-item-status">

                <span>
                    ใช้งาน
                </span>

            </div>

        `;

        return element;

    }


    // ==================================================
    // INSPECTION ITEM
    // ==================================================

    if (
        settingType ===
        SETTINGS_TYPES.INSPECTION_ITEM
    ) {

        element.innerHTML = `

            <div class="settings-item-number">

                ${escapeHTML(
                    sortOrder ||
                    index + 1
                )}

            </div>

            <div class="settings-item-main">

                <strong>
                    ${escapeHTML(
                        name
                    )}
                </strong>

            </div>

            <div class="settings-item-status">

                <span>
                    ใช้งาน
                </span>

            </div>

        `;

        return element;

    }


    return element;

}


// ======================================================
// GET SETTING DISPLAY NAME
// ======================================================

function getSettingDisplayName(
    settingType,
    item
) {

    if (!item) {

        return "";

    }


    // ==================================================
    // LOCATION
    // ==================================================

    if (
        settingType ===
        SETTINGS_TYPES.LOCATION
    ) {

        return (
            item.settingName ||
            item.name ||
            item.settingValue ||
            item.locationName ||
            ""
        );

    }


    // ==================================================
    // INSPECTOR
    // ==================================================

    if (
        settingType ===
        SETTINGS_TYPES.INSPECTOR
    ) {

        return (
            item.settingName ||
            item.name ||
            item.settingValue ||
            item.inspectorName ||
            ""
        );

    }


    // ==================================================
    // INSPECTION ITEM
    // ==================================================

    if (
        settingType ===
        SETTINGS_TYPES.INSPECTION_ITEM
    ) {

        return (
            item.settingName ||
            item.name ||
            item.item ||
            item.description ||
            item.settingValue ||
            ""
        );

    }


    return (
        item.settingName ||
        item.name ||
        item.settingValue ||
        ""
    );

}


// ======================================================
// SORT SETTINGS
// ======================================================

function sortSettings(
    settingType,
    settings
) {

    if (
        !Array.isArray(settings)
    ) {

        return [];

    }


    const result =
        [...settings];


    // ==================================================
    // INSPECTION ITEMS
    // ==================================================

    if (
        settingType ===
        SETTINGS_TYPES.INSPECTION_ITEM
    ) {

        result.sort(
            function (
                a,
                b
            ) {

                const aNo =
                    Number(
                        a.sortOrder ||
                        a.itemNo ||
                        a.no ||
                        999
                    );


                const bNo =
                    Number(
                        b.sortOrder ||
                        b.itemNo ||
                        b.no ||
                        999
                    );


                return (
                    aNo -
                    bNo
                );

            }
        );


        return result;

    }


    // ==================================================
    // OTHER SETTINGS
    // ==================================================

    result.sort(
        function (
            a,
            b
        ) {

            const aName =
                getSettingDisplayName(
                    settingType,
                    a
                ).toLowerCase();


            const bName =
                getSettingDisplayName(
                    settingType,
                    b
                ).toLowerCase();


            return aName.localeCompare(
                bName,
                "th"
            );

        }
    );


    return result;

}


// ======================================================
// CREATE EMPTY STATE
// ======================================================

function createSettingsEmptyState(
    settingType
) {

    let message =
        "ยังไม่มีข้อมูล";


    let description =
        "ไม่พบข้อมูลในระบบ";


    if (
        settingType ===
        SETTINGS_TYPES.LOCATION
    ) {

        message =
            "ยังไม่มีจุดตรวจ";


        description =
            "ไม่พบข้อมูลสถานที่ตรวจ";

    }


    if (
        settingType ===
        SETTINGS_TYPES.INSPECTOR
    ) {

        message =
            "ยังไม่มีผู้ตรวจ";


        description =
            "ไม่พบข้อมูลผู้ตรวจ";

    }


    if (
        settingType ===
        SETTINGS_TYPES.INSPECTION_ITEM
    ) {

        message =
            "ยังไม่มีรายการตรวจ";


        description =
            "ไม่พบหัวข้อการตรวจในระบบ";

    }


    return `

        <div class="settings-empty">

            <div>
                ⚙️
            </div>

            <strong>
                ${escapeHTML(
                    message
                )}
            </strong>

            <span>
                ${escapeHTML(
                    description
                )}
            </span>

        </div>

    `;

}


// ======================================================
// REFRESH SETTINGS
// ======================================================

async function refreshSettingsPage() {

    console.log(
        "กำลัง Refresh Settings..."
    );


    await loadSettingsPage();

}


// ======================================================
// END SETTINGS.JS
// ======================================================