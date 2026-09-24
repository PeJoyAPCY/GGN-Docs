// ======================================================
// GGN DOCS
// INSPECTION LIST SYSTEM
//
// VERSION: 2.1.2
// DATE: 2026-09-24
//
// CHANGE:
// - แก้ปัญหา Admin Inspector / Zone Dropdown ว่าง
// - ตรวจสอบและโหลด Inspector Setting ก่อนแสดง Filter
// - ตรวจสอบและโหลด Zone Setting ก่อนแสดง Filter
// - Admin สามารถกรองด้วย Inspector ได้
// - Admin สามารถกรองด้วย Zone ได้
// - รองรับ Inspector + Zone พร้อมกัน
// - User ไม่แสดง Dropdown เขต
// - User ไม่สามารถกรองตามเขตจาก UI
// - คง Backend Permission เดิม
// - คง User เห็นเฉพาะรายการของตัวเอง
// - คง Admin เห็นรายการตรวจทั้งหมด
// - คง View / Edit / Delete Flow เดิม
// - คงกฎห้ามลบรายการที่สร้างเอกสาร ISO แล้ว
// - ไม่เปลี่ยนโครงสร้าง Inspection
// - ไม่กระทบ FM-OP-11 V1
// ======================================================


// ======================================================
// STATE
// ======================================================

let inspectionListRecords = [];


// ======================================================
// CURRENT USER / PERMISSION
// ======================================================

function getInspectionListCurrentUser() {

    try {

        if (
            typeof getCurrentGGNUser ===
            "function"
        ) {

            return getCurrentGGNUser();

        }


        if (
            typeof getCurrentUser ===
            "function"
        ) {

            return getCurrentUser();

        }


        return null;

    } catch (error) {

        console.error(
            "getInspectionListCurrentUser Error:",
            error
        );

        return null;

    }

}



function getInspectionListCurrentRole() {

    const user =
        getInspectionListCurrentUser();


    if (
        !user ||
        !user.role
    ) {

        return "";

    }


    return String(
        user.role
    ).trim().toLowerCase();

}



function isInspectionListAdmin() {

    return (
        getInspectionListCurrentRole() ===
        "admin"
    );

}



function canEditInspectionRecord(
    record
) {

    if (!record) {

        return false;

    }


    // ----------------------------------------
    // ADMIN
    // ----------------------------------------

    if (
        isInspectionListAdmin()
    ) {

        return true;

    }


    // ----------------------------------------
    // USER
    // ----------------------------------------

    const user =
        getInspectionListCurrentUser();


    if (
        !user ||
        !user.name
    ) {

        return false;

    }


    return (
        String(
            record.inspectorName || ""
        ).trim() ===
        String(
            user.name
        ).trim()
    );

}



function canDeleteInspectionRecord(
    record
) {

    if (!record) {

        return false;

    }


    // ----------------------------------------
    // DOCUMENT ALREADY GENERATED
    // ----------------------------------------
    // Business rule:
    // ไม่สามารถลบรายการที่สร้างเอกสารแล้ว
    // ไม่ว่า User หรือ Admin

    if (
        record.fileId ||
        record.fileUrl
    ) {

        return false;

    }


    // ----------------------------------------
    // ADMIN
    // ----------------------------------------

    if (
        isInspectionListAdmin()
    ) {

        return true;

    }


    // ----------------------------------------
    // USER
    // ----------------------------------------

    return canEditInspectionRecord(
        record
    );

}



// ======================================================
// FILTER UI HELPER
// ======================================================

function setInspectionListZoneFilterVisibility(
    visible
) {

    const zoneSelect =
        document.getElementById(
            "inspection-records-zone"
        );


    if (!zoneSelect) {

        return;

    }


    // ----------------------------------------
    // FIND FILTER WRAPPER
    // ----------------------------------------
    // รองรับโครงสร้าง HTML หลายรูปแบบ
    // โดยไม่บังคับให้ต้องแก้ HTML ตอนนี้

    const wrapper =
        zoneSelect.closest(
            ".filter-group, " +
            ".form-group, " +
            ".filter-item, " +
            ".inspection-filter-group, " +
            ".inspection-filter-item"
        );


    const label =
        document.querySelector(
            'label[for="inspection-records-zone"]'
        );


    if (visible) {

        // ----------------------------------------
        // ADMIN
        // ----------------------------------------

        if (wrapper) {

            wrapper.style.display = "";

        } else {

            zoneSelect.style.display = "";

        }


        if (label) {

            label.style.display = "";

        }


        zoneSelect.disabled =
            false;


    } else {

        // ----------------------------------------
        // USER
        // ----------------------------------------

        if (wrapper) {

            wrapper.style.display = "none";

        } else {

            zoneSelect.style.display = "none";

        }


        if (label) {

            label.style.display = "none";

        }


        zoneSelect.disabled =
            true;


        zoneSelect.value =
            "";

    }

}



// ======================================================
// SETUP INSPECTION LIST
// ======================================================

function setupInspectionList() {

    console.log(
        "เตรียมระบบรายการตรวจ..."
    );


    const searchButton =
        document.getElementById(
            "search-inspection-records-button"
        );


    const clearButton =
        document.getElementById(
            "clear-inspection-records-filter-button"
        );


    const backButton =
        document.getElementById(
            "back-to-inspections-from-records"
        );


    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    if (
        searchButton &&
        !searchButton.dataset.bound
    ) {

        searchButton.addEventListener(
            "click",
            filterInspectionRecords
        );

        searchButton.dataset.bound =
            "true";

    }


    // ----------------------------------------
    // CLEAR FILTER
    // ----------------------------------------

    if (
        clearButton &&
        !clearButton.dataset.bound
    ) {

        clearButton.addEventListener(
            "click",
            clearInspectionRecordsFilter
        );

        clearButton.dataset.bound =
            "true";

    }


    // ----------------------------------------
    // BACK
    // ----------------------------------------

    if (
        backButton &&
        !backButton.dataset.bound
    ) {

        backButton.addEventListener(
            "click",
            function () {

                showPage(
                    "inspections"
                );

            }
        );

        backButton.dataset.bound =
            "true";

    }


    // ----------------------------------------
    // RECORD ACTIONS
    // ----------------------------------------

    setupInspectionListActions();


    console.log(
        "เตรียมระบบรายการตรวจเรียบร้อย"
    );

}



// ======================================================
// INITIALIZE INSPECTION LIST PAGE
// ======================================================

async function initializeInspectionListPage() {

    console.log(
        "กำลังเตรียมหน้ารายการตรวจ..."
    );


    setupInspectionList();


    await loadInspectionListFilters();


    await loadInspectionListRecords();


    console.log(
        "เตรียมหน้ารายการตรวจเรียบร้อย"
    );

}



// ======================================================
// LOAD INSPECTION RECORDS
// ======================================================

async function loadInspectionListRecords() {

    const list =
        document.getElementById(
            "inspection-records-list"
        );


    if (!list) {

        console.warn(
            "ไม่พบ #inspection-records-list"
        );

        return;

    }


    list.innerHTML = `

        <div class="inspection-empty">

            <div>⏳</div>

            <strong>
                กำลังโหลดรายการตรวจ...
            </strong>

            <span>
                กรุณารอสักครู่
            </span>

        </div>

    `;


    try {

        console.log(
            "กำลังโหลดรายการตรวจจาก API..."
        );


        const user =
            getInspectionListCurrentUser();


        console.log(
            "Inspection List User:",
            user
        );


        const data =
            await apiGetInspections();


        console.log(
            "ข้อมูลรายการตรวจจาก API:",
            data
        );


        if (
            !data ||
            !data.success
        ) {

            console.error(
                "ไม่สามารถโหลดรายการตรวจ:",
                data
                    ? data.message
                    : "ไม่พบข้อมูลตอบกลับจาก API"
            );


            inspectionListRecords = [];


            renderInspectionList();


            return;

        }


        inspectionListRecords =
            Array.isArray(
                data.inspections
            )
                ? data.inspections
                : [];


        console.log(
            "โหลดรายการตรวจสำเร็จ:",
            inspectionListRecords
        );


        console.log(
            "จำนวนรายการ:",
            inspectionListRecords.length
        );


        renderInspectionList();


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการโหลดรายการตรวจ:",
            error
        );


        inspectionListRecords = [];


        list.innerHTML = `

            <div class="inspection-empty">

                <div>⚠️</div>

                <strong>
                    ไม่สามารถโหลดรายการตรวจได้
                </strong>

                <span>
                    กรุณาลองใหม่อีกครั้ง
                </span>

            </div>

        `;

    }

}



// ======================================================
// RENDER INSPECTION LIST
// TABLE VERSION
// ======================================================

function renderInspectionList(
    records = inspectionListRecords
) {

    const list =
        document.getElementById(
            "inspection-records-list"
        );


    const count =
        document.getElementById(
            "inspection-records-count"
        );


    if (!list) {

        console.warn(
            "ไม่พบ #inspection-records-list"
        );

        return;

    }


    const items =
        Array.isArray(records)
            ? records
            : [];


    if (count) {

        count.textContent =
            `${items.length} รายการ`;

    }


    // ----------------------------------------
    // EMPTY
    // ----------------------------------------

    if (
        items.length === 0
    ) {

        list.innerHTML = `

            <div class="inspection-empty">

                <div>📋</div>

                <strong>
                    ไม่พบรายการตรวจ
                </strong>

                <span>
                    ยังไม่มีข้อมูลการตรวจตามเงื่อนไขที่เลือก
                </span>

            </div>

        `;

        return;

    }


    // ----------------------------------------
    // SORT
    // ----------------------------------------

    const sortedRecords =
        [...items].sort(
            function (a, b) {

                const aDate =
                    String(
                        a.inspectionDate || ""
                    );


                const bDate =
                    String(
                        b.inspectionDate || ""
                    );


                if (
                    aDate !== bDate
                ) {

                    return bDate.localeCompare(
                        aDate
                    );

                }


                const aTime =
                    String(
                        a.inspectionTime || ""
                    );


                const bTime =
                    String(
                        b.inspectionTime || ""
                    );


                return bTime.localeCompare(
                    aTime
                );

            }
        );


    // ----------------------------------------
    // TABLE
    // ----------------------------------------

    const rows =
        sortedRecords.map(
            function (record, index) {

                const recordId =
                    record.recordId || "";


                const date =
                    record.inspectionDate || "-";


                const time =
                    record.inspectionTime || "-";


                const zone =
                    record.zone || "-";


                const location =
                    record.locationName || "-";


                const inspector =
                    record.inspectorName || "-";


                const documentStatus =
                    record.fileUrl
                        ? "สร้างเอกสารแล้ว"
                        : "ยังไม่มีเอกสาร";


                const canEdit =
                    canEditInspectionRecord(
                        record
                    );


                const canDelete =
                    canDeleteInspectionRecord(
                        record
                    );


                let actionButtons = `

                    <button
                        type="button"
                        class="inspection-action-button view"
                        data-action="view"
                        data-record-id="${escapeHTML(
                            recordId
                        )}"
                        title="ดูรายละเอียด"
                    >
                        👁
                    </button>

                `;


                if (canEdit) {

                    actionButtons += `

                        <button
                            type="button"
                            class="inspection-action-button edit"
                            data-action="edit"
                            data-record-id="${escapeHTML(
                                recordId
                            )}"
                            title="แก้ไข"
                        >
                            ✏️
                        </button>

                    `;

                }


                if (canDelete) {

                    actionButtons += `

                        <button
                            type="button"
                            class="inspection-action-button delete"
                            data-action="delete"
                            data-record-id="${escapeHTML(
                                recordId
                            )}"
                            title="ลบ"
                        >
                            🗑
                        </button>

                    `;

                }


                return `

                    <tr>

                        <td class="inspection-table-number">
                            ${index + 1}
                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    date
                                )}
                            </strong>

                            <div class="inspection-table-time">
                                ${escapeHTML(
                                    time
                                )}
                            </div>

                        </td>


                        <td>
                            ${escapeHTML(
                                zone
                            )}
                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    location
                                )}
                            </strong>

                        </td>


                        <td>
                            ${escapeHTML(
                                inspector
                            )}
                        </td>


                        <td>

                            <span
                                class="
                                    inspection-document-status
                                    ${
                                        record.fileUrl
                                            ? "is-complete"
                                            : "is-pending"
                                    }
                                "
                            >

                                ${
                                    record.fileUrl
                                        ? "✓ "
                                        : ""
                                }

                                ${escapeHTML(
                                    documentStatus
                                )}

                            </span>

                        </td>


                        <td>

                            <div class="inspection-table-actions">

                                ${actionButtons}

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    list.innerHTML = `

        <div class="inspection-table-wrapper">

            <table class="inspection-records-table">

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            วันที่ / เวลา
                        </th>

                        <th>
                            เขต
                        </th>

                        <th>
                            จุดตรวจ
                        </th>

                        <th>
                            ผู้ตรวจ
                        </th>

                        <th>
                            เอกสาร ISO
                        </th>

                        <th>
                            จัดการ
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>

        </div>

    `;


    setupInspectionListActions();

}



// ======================================================
// SETUP RECORD ACTIONS
// ======================================================

function setupInspectionListActions() {

    const list =
        document.getElementById(
            "inspection-records-list"
        );


    if (!list) {

        return;

    }


    if (
        list.dataset.actionsBound
    ) {

        return;

    }


    list.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const recordId =
                button.dataset.recordId;


            console.log(
                "เลือกการทำงานรายการตรวจ:",
                action,
                recordId
            );


            if (
                action === "view"
            ) {

                viewInspectionRecord(
                    recordId
                );

                return;

            }


            if (
                action === "edit"
            ) {

                editInspectionRecord(
                    recordId
                );

                return;

            }


            if (
                action === "delete"
            ) {

                deleteInspectionRecord(
                    recordId
                );

            }

        }
    );


    list.dataset.actionsBound =
        "true";

}

// ======================================================
// LOAD FILTERS
// ======================================================

async function loadInspectionListFilters() {

    const inspectorSelect =
        document.getElementById(
            "inspection-records-inspector"
        );


    const zoneSelect =
        document.getElementById(
            "inspection-records-zone"
        );


    const isAdmin =
        isInspectionListAdmin();


    console.log(
        "Inspection List Filter Permission:",
        {
            isAdmin,
            role:
                getInspectionListCurrentRole()
        }
    );


    // ==================================================
    // USER
    // ==================================================

    if (!isAdmin) {

        // ----------------------------------------------
        // INSPECTOR
        // ----------------------------------------------

        if (inspectorSelect) {

            inspectorSelect.innerHTML = `

                <option value="">
                    ผู้ตรวจ: รายการของฉัน
                </option>

            `;


            inspectorSelect.disabled =
                true;

        }


        // ----------------------------------------------
        // ZONE
        // ----------------------------------------------

        if (zoneSelect) {

            setInspectionListZoneFilterVisibility(
                false
            );


            zoneSelect.innerHTML = "";


            zoneSelect.disabled =
                true;


            zoneSelect.value =
                "";

        }


        console.log(
            "Inspection List Filters: USER MODE"
        );


        return;

    }


    // ==================================================
    // ADMIN
    // ==================================================
    //
    // Admin ต้องใช้ Inspector และ Zone เป็น Dropdown
    // สำหรับกรองข้อมูล
    //
    // ==================================================


    // ==================================================
    // ENSURE INSPECTOR DATA
    // ==================================================

    if (
        !Array.isArray(
            inspectionInspectors
        ) ||
        inspectionInspectors.length === 0
    ) {

        console.log(
            "Inspector Setting ยังไม่มีข้อมูล กำลังโหลด..."
        );


        if (
            typeof loadSingleInspectionSetting ===
            "function"
        ) {

            inspectionInspectors =
                await loadSingleInspectionSetting(
                    "inspector"
                );

        }

    }


    // ==================================================
    // ENSURE ZONE DATA
    // ==================================================

    if (
        !Array.isArray(
            inspectionZones
        ) ||
        inspectionZones.length === 0
    ) {

        console.log(
            "Zone Setting ยังไม่มีข้อมูล กำลังโหลด..."
        );


        if (
            typeof loadSingleInspectionSetting ===
            "function"
        ) {

            inspectionZones =
                await loadSingleInspectionSetting(
                    "zone"
                );

        }

    }


    // ==================================================
    // DEBUG SETTINGS
    // ==================================================

    console.log(
        "Admin Filter Settings:",
        {
            inspectors:
                Array.isArray(
                    inspectionInspectors
                )
                    ? inspectionInspectors.length
                    : 0,

            zones:
                Array.isArray(
                    inspectionZones
                )
                    ? inspectionZones.length
                    : 0
        }
    );


    // ==================================================
    // INSPECTOR DROPDOWN
    // ==================================================

    if (inspectorSelect) {

        inspectorSelect.innerHTML = "";


        inspectorSelect.disabled =
            false;


        // ----------------------------------------------
        // DEFAULT
        // ----------------------------------------------

        inspectorSelect.innerHTML = `

            <option value="">
                -- ผู้ตรวจทั้งหมด --
            </option>

        `;


        // ----------------------------------------------
        // COLLECT UNIQUE INSPECTORS
        // ----------------------------------------------

        const inspectorNames = [];


        if (
            Array.isArray(
                inspectionInspectors
            )
        ) {

            inspectionInspectors.forEach(
                function (inspector) {

                    if (!inspector) {

                        return;

                    }


                    // ----------------------------------
                    // ACTIVE ONLY
                    // ----------------------------------

                    if (
                        inspector.status &&
                        String(
                            inspector.status
                        ).trim().toLowerCase() !==
                        "active"
                    ) {

                        return;

                    }


                    // ----------------------------------
                    // FIND NAME
                    // ----------------------------------

                    const name =
                        inspector.settingName ||
                        inspector.name ||
                        inspector.settingValue ||
                        inspector.inspectorName ||
                        "";


                    const normalizedName =
                        String(
                            name
                        ).trim();


                    if (!normalizedName) {

                        return;

                    }


                    // ----------------------------------
                    // PREVENT DUPLICATE
                    // ----------------------------------

                    if (
                        inspectorNames.includes(
                            normalizedName
                        )
                    ) {

                        return;

                    }


                    inspectorNames.push(
                        normalizedName
                    );

                }
            );

        }


        // ----------------------------------------------
        // SORT
        // ----------------------------------------------

        inspectorNames.sort(
            function (a, b) {

                return a.localeCompare(
                    b,
                    "th"
                );

            }
        );


        // ----------------------------------------------
        // CREATE OPTIONS
        // ----------------------------------------------

        inspectorNames.forEach(
            function (name) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    name;


                option.textContent =
                    name;


                inspectorSelect.appendChild(
                    option
                );

            }
        );


        console.log(
            "Admin Inspector Filter:",
            inspectorNames
        );

    }


    // ==================================================
    // ZONE DROPDOWN
    // ==================================================

    if (zoneSelect) {

        // ----------------------------------------------
        // SHOW ZONE FILTER
        // ----------------------------------------------

        setInspectionListZoneFilterVisibility(
            true
        );


        zoneSelect.disabled =
            false;


        zoneSelect.innerHTML = `

            <option value="">
                -- เขตทั้งหมด --
            </option>

        `;


        // ----------------------------------------------
        // COLLECT UNIQUE ZONES
        // ----------------------------------------------

        const zoneNames = [];


        if (
            Array.isArray(
                inspectionZones
            )
        ) {

            inspectionZones.forEach(
                function (zone) {

                    if (!zone) {

                        return;

                    }


                    // ----------------------------------
                    // ACTIVE ONLY
                    // ----------------------------------

                    if (
                        zone.status &&
                        String(
                            zone.status
                        ).trim().toLowerCase() !==
                        "active"
                    ) {

                        return;

                    }


                    // ----------------------------------
                    // FIND ZONE NAME
                    // ----------------------------------

                    const name =
                        zone.settingName ||
                        zone.name ||
                        zone.settingValue ||
                        zone.zone ||
                        "";


                    const normalizedName =
                        String(
                            name
                        ).trim();


                    if (!normalizedName) {

                        return;

                    }


                    // ----------------------------------
                    // PREVENT DUPLICATE
                    // ----------------------------------

                    if (
                        zoneNames.includes(
                            normalizedName
                        )
                    ) {

                        return;

                    }


                    zoneNames.push(
                        normalizedName
                    );

                }
            );

        }


        // ----------------------------------------------
        // SORT
        // ----------------------------------------------

        zoneNames.sort(
            function (a, b) {

                return a.localeCompare(
                    b,
                    "th"
                );

            }
        );


        // ----------------------------------------------
        // CREATE OPTIONS
        // ----------------------------------------------

        zoneNames.forEach(
            function (name) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    name;


                option.textContent =
                    name;


                zoneSelect.appendChild(
                    option
                );

            }
        );


        console.log(
            "Admin Zone Filter:",
            zoneNames
        );

    }


    // ==================================================
    // COMPLETE
    // ==================================================

    console.log(
        "Inspection List Filters โหลดเสร็จแล้ว:",
        {
            isAdmin:
                true,

            inspectors:
                Array.isArray(
                    inspectionInspectors
                )
                    ? inspectionInspectors.length
                    : 0,

            zones:
                Array.isArray(
                    inspectionZones
                )
                    ? inspectionZones.length
                    : 0
        }
    );

}


// ======================================================
// FILTER INSPECTION RECORDS
// ======================================================

function filterInspectionRecords() {

    const dateInput =
        document.getElementById(
            "inspection-records-date"
        );


    const inspectorInput =
        document.getElementById(
            "inspection-records-inspector"
        );


    const zoneInput =
        document.getElementById(
            "inspection-records-zone"
        );


    const isAdmin =
        isInspectionListAdmin();


    const date =
        dateInput
            ? dateInput.value
            : "";


    const inspector =
        inspectorInput &&
        isAdmin &&
        !inspectorInput.disabled
            ? inspectorInput.value
            : "";


    const zone =
        zoneInput &&
        isAdmin &&
        !zoneInput.disabled
            ? zoneInput.value
            : "";


    console.log(
        "ค้นหารายการตรวจ:",
        {
            date,
            inspector,
            zone:
                isAdmin
                    ? zone
                    : "(User - ใช้ Zone จากสิทธิ์ Backend)",
            role:
                getInspectionListCurrentRole()
        }
    );


    const filtered =
        inspectionListRecords.filter(
            function (record) {

                // ----------------------------------------
                // DATE
                // ----------------------------------------

                if (
                    date &&
                    record.inspectionDate !==
                    date
                ) {

                    return false;

                }


                // ----------------------------------------
                // INSPECTOR
                // ----------------------------------------
                // เฉพาะ Admin เท่านั้น
                // User ใช้ข้อมูลที่ Backend กรองมาแล้ว

                if (
                    isAdmin &&
                    inspector &&
                    record.inspectorName !==
                    inspector
                ) {

                    return false;

                }


                // ----------------------------------------
                // ZONE
                // ----------------------------------------
                // เฉพาะ Admin เท่านั้น
                // User ไม่มีสิทธิ์เลือก Zone

                if (
                    isAdmin &&
                    zone &&
                    record.zone !==
                    zone
                ) {

                    return false;

                }


                return true;

            }
        );


    renderInspectionList(
        filtered
    );

}



// ======================================================
// CLEAR FILTER
// ======================================================

function clearInspectionRecordsFilter() {

    const dateInput =
        document.getElementById(
            "inspection-records-date"
        );


    const inspectorInput =
        document.getElementById(
            "inspection-records-inspector"
        );


    const zoneInput =
        document.getElementById(
            "inspection-records-zone"
        );


    if (dateInput) {

        dateInput.value =
            "";

    }


    if (inspectorInput) {

        inspectorInput.value =
            "";

    }


    if (zoneInput) {

        zoneInput.value =
            "";

    }


    renderInspectionList();

}



// ======================================================
// VIEW RECORD
// ======================================================

async function viewInspectionRecord(
    recordId
) {

    console.log(
        "ดูรายละเอียดรายการตรวจ:",
        recordId
    );


    if (!recordId) {

        alert(
            "ไม่พบรหัสรายการตรวจ"
        );

        return;

    }


    openPopup(

        `

            <div class="inspection-empty">

                <div>⏳</div>

                <strong>
                    กำลังโหลดรายละเอียด...
                </strong>

                <span>
                    กรุณารอสักครู่
                </span>

            </div>

        `,

        {
            title:
                "รายละเอียดรายการตรวจ",

            size:
                "large"
        }

    );


    try {

        const data =
            await apiGetInspection(
                recordId
            );


        console.log(
            "รายละเอียด Inspection:",
            data
        );


        if (
            !data ||
            !data.success ||
            !data.inspection
        ) {

            openPopup(

                `

                    <div class="inspection-empty">

                        <div>⚠️</div>

                        <strong>
                            ไม่สามารถโหลดรายละเอียดได้
                        </strong>

                        <span>
                            ${
                                escapeHTML(
                                    data &&
                                    data.message
                                        ? data.message
                                        : "ไม่พบข้อมูลรายการตรวจ"
                                )
                            }
                        </span>

                    </div>

                `,

                {
                    title:
                        "รายละเอียดรายการตรวจ",

                    size:
                        "large"
                }

            );

            return;

        }


        renderInspectionDetailPopup(
            data.inspection
        );


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการดูรายละเอียด:",
            error
        );


        openPopup(

            `

                <div class="inspection-empty">

                    <div>⚠️</div>

                    <strong>
                        เกิดข้อผิดพลาด
                    </strong>

                    <span>
                        ไม่สามารถโหลดรายละเอียดรายการตรวจได้
                    </span>

                </div>

            `,

            {
                title:
                    "รายละเอียดรายการตรวจ",

                size:
                    "large"
            }

        );

    }

}



// ======================================================
// RENDER INSPECTION DETAIL POPUP
// ======================================================

function renderInspectionDetailPopup(
    inspection
) {

    const items =
        Array.isArray(
            inspection.items
        )
            ? inspection.items
            : [];


    const resultClass =
        function (result) {

            const value =
                String(
                    result || ""
                ).trim();


            if (
                value === "ผ่าน"
            ) {

                return "ผ่าน";

            }


            if (
                value === "ไม่ผ่าน"
            ) {

                return "ไม่ผ่าน";

            }


            return "";

        };


    const resultLabel =
        function (result) {

            const value =
                String(
                    result || ""
                ).trim();


            if (
                value === "ผ่าน"
            ) {

                return "✓ ผ่าน";

            }


            if (
                value === "ไม่ผ่าน"
            ) {

                return "✕ ไม่ผ่าน";

            }


            return "-";

        };


    let itemsHTML = "";


    if (
        items.length === 0
    ) {

        itemsHTML = `

            <div class="inspection-empty">

                <div>📋</div>

                <strong>
                    ไม่พบรายการตรวจย่อย
                </strong>

            </div>

        `;

    } else {

        itemsHTML =
            items
                .map(
                    function (
                        item,
                        index
                    ) {

                        const itemNo =
                            item.itemNo ||
                            index + 1;


                        return `

                            <div
                                class="inspection-detail-item"
                            >

                                <div
                                    class="inspection-detail-item-no"
                                >
                                    ${escapeHTML(
                                        itemNo
                                    )}
                                </div>


                                <div
                                    class="inspection-detail-item-name"
                                >
                                    ${escapeHTML(
                                        item.item ||
                                        "-"
                                    )}
                                </div>


                                <div
                                    class="
                                        inspection-detail-item-result
                                        ${resultClass(
                                            item.result
                                        )}
                                    "
                                >
                                    ${escapeHTML(
                                        resultLabel(
                                            item.result
                                        )
                                    )}
                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    const documentInfo =
        inspection.documentNo
            ? `

                <div class="inspection-detail-row">

                    <strong>
                        เลขที่เอกสาร
                    </strong>

                    <span>
                        ${escapeHTML(
                            inspection.documentNo
                        )}
                    </span>

                </div>

            `
            : "";


    const fileInfo =
        inspection.fileUrl
            ? `

                <div class="inspection-detail-row">

                    <strong>
                        เอกสาร ISO
                    </strong>

                    <span>

                        <a
                            href="${escapeHTML(
                                inspection.fileUrl
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            เปิดเอกสาร ISO
                        </a>

                    </span>

                </div>

            `
            : "";


    openPopup(

        `

            <div class="inspection-detail">

                <div class="inspection-detail-section">

                    <div class="inspection-detail-grid">

                        <div class="inspection-detail-row">

                            <strong>
                                วันที่ตรวจ
                            </strong>

                            <span>
                                ${escapeHTML(
                                    inspection.inspectionDate ||
                                    "-"
                                )}
                            </span>

                        </div>


                        <div class="inspection-detail-row">

                            <strong>
                                เวลา
                            </strong>

                            <span>
                                ${escapeHTML(
                                    inspection.inspectionTime ||
                                    "-"
                                )}
                            </span>

                        </div>


                        <div class="inspection-detail-row">

                            <strong>
                                เขต
                            </strong>

                            <span>
                                ${escapeHTML(
                                    inspection.zone ||
                                    "-"
                                )}
                            </span>

                        </div>


                        <div class="inspection-detail-row">

                            <strong>
                                จุดตรวจ
                            </strong>

                            <span>
                                ${escapeHTML(
                                    inspection.locationName ||
                                    "-"
                                )}
                            </span>

                        </div>


                        <div class="inspection-detail-row">

                            <strong>
                                ผู้ตรวจ
                            </strong>

                            <span>
                                ${escapeHTML(
                                    inspection.inspectorName ||
                                    "-"
                                )}
                            </span>

                        </div>


                        ${documentInfo}

                        ${fileInfo}

                    </div>

                </div>


                <div class="inspection-detail-section">

                    <div class="inspection-detail-title">
                        ผลการตรวจ
                    </div>


                    <div class="inspection-detail-items">

                        ${itemsHTML}

                    </div>

                </div>


                <div class="inspection-detail-section">

                    <div class="inspection-detail-title">
                        หมายเหตุ
                    </div>


                    <div class="inspection-detail-text">

                        ${
                            inspection.remark
                                ? escapeHTML(
                                    inspection.remark
                                )
                                : "-"
                        }

                    </div>

                </div>


                <div class="inspection-detail-section">

                    <div class="inspection-detail-title">
                        แนวทางแก้ไข
                    </div>


                    <div class="inspection-detail-text">

                        ${
                            inspection.solution
                                ? escapeHTML(
                                    inspection.solution
                                )
                                : "-"
                        }

                    </div>

                </div>

            </div>

        `,

        {
            title:
                "รายละเอียดรายการตรวจ",

            size:
                "large"
        }

    );

}



// ======================================================
// EDIT RECORD
// ======================================================

async function editInspectionRecord(
    recordId
) {

    console.log(
        "เริ่มแก้ไขรายการตรวจ:",
        recordId
    );


    if (!recordId) {

        alert(
            "ไม่พบรหัสรายการตรวจ"
        );

        return;

    }


    // ----------------------------------------
    // UI PERMISSION CHECK
    // ----------------------------------------

    const localRecord =
        inspectionListRecords.find(
            function (record) {

                return (
                    record.recordId ===
                    recordId
                );

            }
        );


    if (
        localRecord &&
        !canEditInspectionRecord(
            localRecord
        )
    ) {

        alert(
            "คุณไม่มีสิทธิ์แก้ไขรายการตรวจนี้"
        );

        return;

    }


    try {

        // ----------------------------------------
        // LOAD RECORD
        // ----------------------------------------

        console.log(
            "กำลังโหลดข้อมูลสำหรับแก้ไข:",
            recordId
        );


        const data =
            await apiGetInspection(
                recordId
            );


        console.log(
            "ข้อมูลสำหรับแก้ไข:",
            data
        );


        if (
            !data ||
            !data.success ||
            !data.inspection
        ) {

            alert(
                data &&
                data.message
                    ? data.message
                    : "ไม่สามารถโหลดข้อมูลรายการตรวจได้"
            );

            return;

        }


        const inspection =
            data.inspection;


        // ----------------------------------------
        // BACKEND RESULT CHECK
        // ----------------------------------------

        if (
            !canEditInspectionRecord(
                inspection
            )
        ) {

            alert(
                "คุณไม่มีสิทธิ์แก้ไขรายการตรวจนี้"
            );

            return;

        }


        // ----------------------------------------
        // SET EDIT STATE
        // ----------------------------------------

        editingInspectionRecordId =
            inspection.recordId;


        editingInspectionData =
            inspection;


        inspectionMode =
            "edit";


        console.log(
            "ตั้งค่า Edit Mode:",
            {
                recordId:
                    editingInspectionRecordId,

                inspectionMode:
                    inspectionMode
            }
        );


        // ----------------------------------------
        // OPEN INSPECTION FORM
        // ----------------------------------------

        showPage(
            "inspection-record"
        );


        // ----------------------------------------
        // INITIALIZE FORM
        // ----------------------------------------

        await initializeInspectionPage();


        // ----------------------------------------
        // POPULATE DATA
        // ----------------------------------------

        populateInspectionForm(
            inspection
        );


        console.log(
            "เปิดข้อมูลสำหรับแก้ไขเรียบร้อย:",
            inspection.recordId
        );


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการเปิดแก้ไขรายการตรวจ:",
            error
        );


        alert(
            "ไม่สามารถเปิดรายการสำหรับแก้ไขได้"
        );

    }

}



// ======================================================
// DELETE RECORD
// ======================================================

async function deleteInspectionRecord(
    recordId
) {

    console.log(
        "ลบรายการตรวจ:",
        recordId
    );


    if (!recordId) {

        alert(
            "ไม่พบรหัสรายการตรวจ"
        );

        return;

    }


    // ----------------------------------------
    // FIND RECORD
    // ----------------------------------------

    const record =
        inspectionListRecords.find(
            function (item) {

                return (
                    item.recordId ===
                    recordId
                );

            }
        );


    if (!record) {

        console.warn(
            "ไม่พบข้อมูลรายการตรวจ:",
            recordId
        );


        alert(
            "ไม่พบข้อมูลรายการตรวจ"
        );

        return;

    }


    // ----------------------------------------
    // UI PERMISSION CHECK
    // ----------------------------------------

    if (
        !canDeleteInspectionRecord(
            record
        )
    ) {

        if (
            record.fileId ||
            record.fileUrl
        ) {

            alert(
                "รายการตรวจนี้สร้างเอกสาร ISO แล้ว จึงไม่สามารถลบได้"
            );

        } else {

            alert(
                "คุณไม่มีสิทธิ์ลบรายการตรวจนี้"
            );

        }

        return;

    }


    // ----------------------------------------
    // SHOW DELETE CONFIRMATION
    // ----------------------------------------

    showDeleteInspectionConfirm(
        record
    );

}



// ======================================================
// SHOW DELETE CONFIRMATION POPUP
// ======================================================

function showDeleteInspectionConfirm(
    record
) {

    const date =
        record.inspectionDate || "-";


    const time =
        record.inspectionTime || "-";


    const location =
        record.locationName || "-";


    const zone =
        record.zone || "-";


    const inspector =
        record.inspectorName || "-";


    openPopup(

        `

            <div class="inspection-delete-confirm">

                <div class="inspection-delete-icon">
                    !
                </div>


                <div class="inspection-delete-message">

                    <strong>
                        คุณต้องการลบรายการตรวจนี้หรือไม่?
                    </strong>

                    <span>
                        กรุณาตรวจสอบข้อมูลก่อนยืนยันการลบ
                    </span>

                </div>


                <div class="inspection-delete-summary">

                    <div
                        class="inspection-delete-summary-row"
                    >

                        <span>
                            วันที่ตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                date
                            )}
                        </strong>

                    </div>


                    <div
                        class="inspection-delete-summary-row"
                    >

                        <span>
                            เวลา
                        </span>

                        <strong>
                            ${escapeHTML(
                                time
                            )}
                        </strong>

                    </div>


                    <div
                        class="inspection-delete-summary-row"
                    >

                        <span>
                            เขต
                        </span>

                        <strong>
                            ${escapeHTML(
                                zone
                            )}
                        </strong>

                    </div>


                    <div
                        class="inspection-delete-summary-row"
                    >

                        <span>
                            จุดตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                location
                            )}
                        </strong>

                    </div>


                    <div
                        class="inspection-delete-summary-row"
                    >

                        <span>
                            ผู้ตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                inspector
                            )}
                        </strong>

                    </div>

                </div>


                <div class="inspection-delete-warning">

                    <span
                        class="inspection-delete-warning-icon"
                    >
                        ⚠
                    </span>

                    <span>
                        เมื่อลบรายการตรวจแล้ว
                        จะไม่สามารถกู้คืนข้อมูลได้
                    </span>

                </div>


                <div class="inspection-delete-actions">

                    <button
                        id="cancel-delete-inspection-button"
                        type="button"
                        class="secondary-button"
                    >
                        ยกเลิก
                    </button>


                    <button
                        id="confirm-delete-inspection-button"
                        type="button"
                        class="danger-button"
                    >
                        🗑 ลบรายการตรวจ
                    </button>

                </div>

            </div>

        `,

        {
            title:
                "ยืนยันการลบรายการตรวจ",

            size:
                "small"
        }

    );


    // ----------------------------------------
    // CANCEL
    // ----------------------------------------

    const cancelButton =
        document.getElementById(
            "cancel-delete-inspection-button"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                console.log(
                    "ยกเลิกการลบรายการตรวจ"
                );


                closePopup();

            }
        );

    }


    // ----------------------------------------
    // CONFIRM DELETE
    // ----------------------------------------

    const confirmButton =
        document.getElementById(
            "confirm-delete-inspection-button"
        );


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            async function () {

                await confirmDeleteInspection(
                    record.recordId,
                    confirmButton
                );

            }
        );

    }

}



// ======================================================
// CONFIRM DELETE INSPECTION
// ======================================================

async function confirmDeleteInspection(
    recordId,
    button
) {

    console.log(
        "ยืนยันลบรายการตรวจ:",
        recordId
    );


    if (!recordId) {

        return;

    }


    // ----------------------------------------
    // PREVENT DOUBLE CLICK
    // ----------------------------------------

    if (button) {

        button.disabled =
            true;


        button.textContent =
            "กำลังลบ...";

    }


    try {

        // ----------------------------------------
        // CURRENT USER
        // ----------------------------------------
        // api.js v2.2.0 จะอ่าน Email
        // จาก ggnDocsUser และส่งให้ Backend เอง

        const user =
            getInspectionListCurrentUser();


        console.log(
            "ผู้ใช้งานที่กำลังลบ:",
            user
                ? {
                    email:
                        user.email,

                    name:
                        user.name,

                    role:
                        user.role
                }
                : null
        );


        // ----------------------------------------
        // DELETE API
        // ----------------------------------------

        const data =
            await apiDeleteInspection(
                recordId
            );


        console.log(
            "ผลการลบรายการตรวจ:",
            data
        );


        // ----------------------------------------
        // DELETE FAILED
        // ----------------------------------------

        if (
            !data ||
            !data.success
        ) {

            if (button) {

                button.disabled =
                    false;


                button.textContent =
                    "🗑 ลบรายการตรวจ";

            }


            openPopup(

                `

                    <div class="inspection-delete-result">

                        <div class="inspection-delete-result-icon error">
                            !
                        </div>


                        <strong>
                            ไม่สามารถลบรายการตรวจได้
                        </strong>


                        <span>
                            ${
                                escapeHTML(
                                    data &&
                                    data.message
                                        ? data.message
                                        : "เกิดข้อผิดพลาดในการลบข้อมูล"
                                )
                            }
                        </span>


                        <button
                            type="button"
                            class="secondary-button"
                            id="close-delete-error-button"
                        >
                            ปิด
                        </button>

                    </div>

                `,

                {
                    title:
                        "ลบรายการตรวจ",

                    size:
                        "small"
                }

            );


            const closeButton =
                document.getElementById(
                    "close-delete-error-button"
                );


            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    closePopup
                );

            }


            return;

        }


        // ----------------------------------------
        // REMOVE FROM LOCAL STATE
        // ----------------------------------------

        inspectionListRecords =
            inspectionListRecords.filter(
                function (record) {

                    return (
                        record.recordId !==
                        recordId
                    );

                }
            );


        // ----------------------------------------
        // CLOSE CONFIRMATION
        // ----------------------------------------

        closePopup();


        // ----------------------------------------
        // RENDER LIST
        // ----------------------------------------

        renderInspectionList();


        // ----------------------------------------
        // SUCCESS POPUP
        // ----------------------------------------

        openPopup(

            `

                <div class="inspection-delete-result">

                    <div class="inspection-delete-result-icon success">
                        ✓
                    </div>


                    <strong>
                        ลบรายการตรวจสำเร็จ
                    </strong>


                    <span>
                        ระบบลบข้อมูลการตรวจ
                        และรายการตรวจย่อยเรียบร้อยแล้ว
                    </span>


                    <button
                        type="button"
                        class="primary-button"
                        id="close-delete-success-button"
                    >
                        ตกลง
                    </button>

                </div>

            `,

            {
                title:
                    "ดำเนินการสำเร็จ",

                size:
                    "small"
            }

        );


        const closeButton =
            document.getElementById(
                "close-delete-success-button"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closePopup
            );

        }


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการลบรายการตรวจ:",
            error
        );


        openPopup(

            `

                <div class="inspection-delete-result">

                    <div class="inspection-delete-result-icon error">
                        !
                    </div>


                    <strong>
                        เกิดข้อผิดพลาด
                    </strong>


                    <span>
                        ไม่สามารถลบรายการตรวจได้
                        กรุณาลองใหม่อีกครั้ง
                    </span>


                    <button
                        type="button"
                        class="secondary-button"
                        id="close-delete-error-button"
                    >
                        ปิด
                    </button>

                </div>

            `,

            {
                title:
                    "ลบรายการตรวจ",

                size:
                    "small"
            }

        );


        const closeButton =
            document.getElementById(
                "close-delete-error-button"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closePopup
            );

        }

    }

}



// ======================================================
// END INSPECTION LIST SYSTEM
// ======================================================