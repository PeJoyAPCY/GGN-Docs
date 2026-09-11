
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


    // ----------------------------------------
    // SETUP EVENTS
    // ----------------------------------------

    setupInspectionList();


    // ----------------------------------------
    // LOAD FILTER OPTIONS
    // ----------------------------------------

    await loadInspectionListFilters();


    // ----------------------------------------
    // LOAD RECORDS
    // ----------------------------------------

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


    // ----------------------------------------
    // LOADING
    // ----------------------------------------

    list.innerHTML = `

        <div class="inspection-empty">

            <div>
                ⏳
            </div>

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


        // ----------------------------------------
        // CHECK RESPONSE
        // ----------------------------------------

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


            inspectionListRecords =
                [];


            renderInspectionList();


            return;

        }


        // ----------------------------------------
        // STORE DATA
        // ----------------------------------------

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


        // ----------------------------------------
        // RENDER
        // ----------------------------------------

        renderInspectionList();


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการโหลดรายการตรวจ:",
            error
        );


        inspectionListRecords =
            [];


        list.innerHTML = `

            <div class="inspection-empty">

                <div>
                    ⚠️
                </div>

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
// ======================================================

function renderInspectionList(
    records =
        inspectionListRecords
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


    // ----------------------------------------
    // NORMALIZE
    // ----------------------------------------

    const items =
        Array.isArray(records)
            ? records
            : [];


    // ----------------------------------------
    // COUNT
    // ----------------------------------------

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

                <div>
                    📋
                </div>

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
            function (
                a,
                b
            ) {

                const aDate =
                    String(
                        a.inspectionDate ||
                        ""
                    );


                const bDate =
                    String(
                        b.inspectionDate ||
                        ""
                    );


                if (
                    aDate !==
                    bDate
                ) {

                    return bDate.localeCompare(
                        aDate
                    );

                }


                const aTime =
                    String(
                        a.inspectionTime ||
                        ""
                    );


                const bTime =
                    String(
                        b.inspectionTime ||
                        ""
                    );


                return bTime.localeCompare(
                    aTime
                );

            }
        );


    // ----------------------------------------
    // CLEAR
    // ----------------------------------------

    list.innerHTML =
        "";


    // ----------------------------------------
    // RENDER
    // ----------------------------------------

    sortedRecords.forEach(
        function (
            record
        ) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "fmop11-record-card";


            const recordId =
                record.recordId ||
                "";


            const inspectionDate =
                record.inspectionDate ||
                "-";


            const inspectionTime =
                record.inspectionTime ||
                "-";


            const zone =
                record.zone ||
                "-";


            const locationName =
                record.locationName ||
                "-";


            const inspectorName =
                record.inspectorName ||
                "-";


            const remark =
                record.remark ||
                "";


            card.innerHTML = `

                <div class="fmop11-record-header">

                    <div>

                        <div class="fmop11-record-date">
                            ${escapeHTML(
                                inspectionDate
                            )}
                        </div>

                        <div class="fmop11-record-time">
                            เวลา
                            ${escapeHTML(
                                inspectionTime
                            )}
                        </div>

                    </div>

                </div>


                <div class="fmop11-record-body">

                    <div class="fmop11-record-info">

                        <strong>
                            เขต
                        </strong>

                        <span>
                            ${escapeHTML(
                                zone
                            )}
                        </span>

                    </div>


                    <div class="fmop11-record-info">

                        <strong>
                            จุดตรวจ
                        </strong>

                        <span>
                            ${escapeHTML(
                                locationName
                            )}
                        </span>

                    </div>


                    <div class="fmop11-record-info">

                        <strong>
                            ผู้ตรวจ
                        </strong>

                        <span>
                            ${escapeHTML(
                                inspectorName
                            )}
                        </span>

                    </div>

                    ${
                        remark
                            ? `

                                <div class="fmop11-record-info">

                                    <strong>
                                        หมายเหตุ
                                    </strong>

                                    <span>
                                        ${escapeHTML(
                                            remark
                                        )}
                                    </span>

                                </div>

                            `
                            : ""
                    }

                </div>


                <div class="fmop11-record-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        data-action="view"
                        data-record-id="${escapeHTML(
                            recordId
                        )}"
                    >
                        👁 ดูรายละเอียด
                    </button>


                    <button
                        type="button"
                        class="secondary-button"
                        data-action="edit"
                        data-record-id="${escapeHTML(
                            recordId
                        )}"
                    >
                        ✏️ แก้ไข
                    </button>


                    <button
                        type="button"
                        class="secondary-button"
                        data-action="delete"
                        data-record-id="${escapeHTML(
                            recordId
                        )}"
                    >
                        🗑 ลบ
                    </button>

                </div>

            `;


            list.appendChild(
                card
            );

        }
    );


    // ----------------------------------------
    // ACTION EVENTS
    // ----------------------------------------

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
        function (
            event
        ) {

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


            // --------------------------------
            // VIEW
            // --------------------------------

            if (
                action ===
                "view"
            ) {

                viewInspectionRecord(
                    recordId
                );

                return;

            }


            // --------------------------------
            // EDIT
            // --------------------------------

            if (
                action ===
                "edit"
            ) {

                editInspectionRecord(
                    recordId
                );

                return;

            }


            // --------------------------------
            // DELETE
            // --------------------------------

            if (
                action ===
                "delete"
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

    if (
        inspectorSelect
    ) {

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
                function (
                    inspector
                ) {

                    if (!inspector) {

                        return;

                    }


                    if (
                        inspector.status &&
                        String(
                            inspector.status
                        ).toLowerCase()
                        !==
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


                    option.value =
                        name;


                    option.textContent =
                        name;


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

    if (
        zoneSelect
    ) {

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
                function (
                    zone
                ) {

                    if (!zone) {

                        return;

                    }


                    if (
                        zone.status &&
                        String(
                            zone.status
                        ).toLowerCase()
                        !==
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


                    option.value =
                        name;


                    option.textContent =
                        name;


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
            function (
                record
            ) {

                if (
                    date &&
                    record.inspectionDate !==
                    date
                ) {

                    return false;

                }


                if (
                    inspector &&
                    record.inspectorName !==
                    inspector
                ) {

                    return false;

                }


                if (
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


    // ----------------------------------------
    // OPEN LOADING POPUP
    // ----------------------------------------

    openPopup(

        `

            <div class="inspection-empty">

                <div>
                    ⏳
                </div>

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

                        <div>
                            ⚠️
                        </div>

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

                    <div>
                        ⚠️
                    </div>

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
        function (
            result
        ) {

            const value =
                String(
                    result ||
                    ""
                ).trim();


            if (
                value ===
                "ผ่าน"
            ) {

                return "ผ่าน";

            }


            if (
                value ===
                "ไม่ผ่าน"
            ) {

                return "ไม่ผ่าน";

            }


            return "";

        };


    const resultLabel =
        function (
            result
        ) {

            const value =
                String(
                    result ||
                    ""
                ).trim();


            if (
                value ===
                "ผ่าน"
            ) {

                return "✓ ผ่าน";

            }


            if (
                value ===
                "ไม่ผ่าน"
            ) {

                return "✕ ไม่ผ่าน";

            }


            return "-";

        };


    let itemsHTML =
        "";


    if (
        items.length === 0
    ) {

        itemsHTML = `

            <div class="inspection-empty">

                <div>
                    📋
                </div>

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
                                    class="inspection-detail-item-result ${resultClass(
                                        item.result
                                    )}"
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
                .join(
                    ""
                );

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

function editInspectionRecord(
    recordId
) {

    console.log(
        "แก้ไขรายการตรวจ:",
        recordId
    );


    alert(
        "ฟังก์ชันแก้ไขจะทำในขั้นตอนถัดไป"
    );

}



// ======================================================
// DELETE RECORD
// ======================================================

function deleteInspectionRecord(
    recordId
) {

    console.log(
        "ลบรายการตรวจ:",
        recordId
    );


    alert(
        "ฟังก์ชันลบจะทำในขั้นตอนถัดไป"
    );

}



// ======================================================
// END INSPECTION LIST SYSTEM
// ======================================================