// ======================================================
// GGN DOCS
// INSPECTION LIST SYSTEM
// ======================================================


// ======================================================
// STATE
// ======================================================

let inspectionListRecords = [];


// ======================================================
// SETUP INSPECTION LIST
// ======================================================

function setupInspectionList() {

    console.log("เตรียมระบบรายการตรวจ...");

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

        searchButton.dataset.bound = "true";

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

        clearButton.dataset.bound = "true";

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

                showPage("inspections");

            }
        );

        backButton.dataset.bound = "true";

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
            Array.isArray(data.inspections)
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

    if (items.length === 0) {

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


                if (aDate !== bDate) {

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


                return `

                    <tr>

                        <td class="inspection-table-number">
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(date)}
                            </strong>

                            <div class="inspection-table-time">
                                ${escapeHTML(time)}
                            </div>
                        </td>

                        <td>
                            ${escapeHTML(zone)}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(location)}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(inspector)}
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


    if (list.dataset.actionsBound) {

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


    // ----------------------------------------
    // INSPECTORS
    // ----------------------------------------

    if (inspectorSelect) {

        inspectorSelect.innerHTML = `

            <option value="">
                -- ทั้งหมด --
            </option>

        `;


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


                    if (
                        inspector.status &&
                        String(
                            inspector.status
                        ).toLowerCase() !==
                        "active"
                    ) {

                        return;

                    }


                    const name =
                        inspector.settingName ||
                        inspector.name ||
                        inspector.settingValue ||
                        inspector.inspectorName ||
                        "";


                    if (!name) {

                        return;

                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value = name;

                    option.textContent = name;


                    inspectorSelect.appendChild(
                        option
                    );

                }
            );

        }

    }


    // ----------------------------------------
    // ZONES
    // ----------------------------------------

    if (zoneSelect) {

        zoneSelect.innerHTML = `

            <option value="">
                -- ทั้งหมด --
            </option>

        `;


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


                    if (
                        zone.status &&
                        String(
                            zone.status
                        ).toLowerCase() !==
                        "active"
                    ) {

                        return;

                    }


                    const name =
                        zone.settingName ||
                        zone.name ||
                        zone.settingValue ||
                        zone.zone ||
                        "";


                    if (!name) {

                        return;

                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value = name;

                    option.textContent = name;


                    zoneSelect.appendChild(
                        option
                    );

                }
            );

        }

    }

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


    const date =
        dateInput
            ? dateInput.value
            : "";

    const inspector =
        inspectorInput
            ? inspectorInput.value
            : "";

    const zone =
        zoneInput
            ? zoneInput.value
            : "";


    console.log(
        "ค้นหารายการตรวจ:",
        {
            date,
            inspector,
            zone
        }
    );


    const filtered =
        inspectionListRecords.filter(
            function (record) {

                if (
                    date &&
                    record.inspectionDate !== date
                ) {

                    return false;

                }


                if (
                    inspector &&
                    record.inspectorName !== inspector
                ) {

                    return false;

                }


                if (
                    zone &&
                    record.zone !== zone
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

        dateInput.value = "";

    }


    if (inspectorInput) {

        inspectorInput.value = "";

    }


    if (zoneInput) {

        zoneInput.value = "";

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


            if (value === "ผ่าน") {

                return "ผ่าน";

            }


            if (value === "ไม่ผ่าน") {

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


            if (value === "ผ่าน") {

                return "✓ ผ่าน";

            }


            if (value === "ไม่ผ่าน") {

                return "✕ ไม่ผ่าน";

            }


            return "-";

        };


    let itemsHTML = "";


    if (items.length === 0) {

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
                    function (item, index) {

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
    // CONFIRM
    // ----------------------------------------

    const confirmed =
        confirm(
            "ต้องการลบรายการตรวจนี้หรือไม่?\n\n" +
            "การลบข้อมูลจะไม่สามารถย้อนกลับได้"
        );


    if (!confirmed) {

        console.log(
            "ยกเลิกการลบรายการตรวจ"
        );

        return;

    }


    try {

        // ----------------------------------------
        // CURRENT USER
        // ----------------------------------------

        const user =
            typeof getCurrentUser === "function"
                ? getCurrentUser()
                : null;


        const deletedBy =
            user &&
            user.email
                ? user.email
                : "";


        console.log(
            "กำลังส่งคำขอลบรายการตรวจ:",
            {
                recordId,
                deletedBy
            }
        );


        // ----------------------------------------
        // DELETE API
        // ----------------------------------------

        const data =
            await apiDeleteInspection(
                recordId,
                deletedBy
            );


        console.log(
            "ผลการลบรายการตรวจ:",
            data
        );


        if (
            !data ||
            !data.success
        ) {

            alert(
                data &&
                data.message
                    ? data.message
                    : "ไม่สามารถลบรายการตรวจได้"
            );

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
        // RENDER
        // ----------------------------------------

        renderInspectionList();


        alert(
            "ลบรายการตรวจเรียบร้อยแล้ว"
        );


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการลบรายการตรวจ:",
            error
        );


        alert(
            "เกิดข้อผิดพลาดในการลบรายการตรวจ"
        );

    }

}



// ======================================================
// END INSPECTION LIST SYSTEM
// ======================================================