// ======================================================
// GGN DOCS
// FM-OP-11 GENERATOR
// ======================================================
// หน้าที่:
// - ค้นหารายการตรวจสำหรับ FM-OP-11
// - แสดงรายการตรวจ
// - เลือกรายการตรวจ
// - จำกัดสูงสุด 14 จุดต่อเอกสาร
// - สร้างเอกสาร FM-OP-11
//
// หมายเหตุ:
// State ของ FM-OP-11 อยู่ใน state.js
// API ของ FM-OP-11 อยู่ใน api.js
// ======================================================


// ======================================================
// INITIALIZE FM-OP-11
// ======================================================

function initializeFMOP11Page() {

    console.log(
        "กำลังเตรียมหน้า FM-OP-11..."
    );


    setupFMOP11Events();


    loadFMOP11Inspectors();


    updateFMOP11SelectedCount();

}


// ======================================================
// SETUP FM-OP-11 EVENTS
// ======================================================

function setupFMOP11Events() {

    const searchButton =
        document.getElementById(
            "search-fmop11-button"
        );


    const clearButton =
        document.getElementById(
            "clear-fmop11-selection-button"
        );


    const generateButton =
        document.getElementById(
            "generate-fmop11-button"
        );


    // ==============================================
    // SEARCH
    // ==============================================

    if (
        searchButton &&
        !searchButton.dataset.bound
    ) {

        searchButton.addEventListener(
            "click",
            searchFMOP11Records
        );


        searchButton.dataset.bound =
            "true";

    }


    // ==============================================
    // CLEAR
    // ==============================================

    if (
        clearButton &&
        !clearButton.dataset.bound
    ) {

        clearButton.addEventListener(
            "click",
            clearFMOP11Selection
        );


        clearButton.dataset.bound =
            "true";

    }


    // ==============================================
    // GENERATE
    // ==============================================

    if (
        generateButton &&
        !generateButton.dataset.bound
    ) {

        generateButton.addEventListener(
            "click",
            generateFMOP11
        );


        generateButton.dataset.bound =
            "true";

    }

}


// ======================================================
// LOAD FM-OP-11 INSPECTORS
// ======================================================

async function loadFMOP11Inspectors() {

    const select =
        document.getElementById(
            "fmop11-inspector"
        );


    if (!select) {

        return;

    }


    // ==============================================
    // DEFAULT OPTION
    // ==============================================

    select.innerHTML = `

        <option value="">
            -- เลือกผู้ตรวจ --
        </option>

    `;


    // ==============================================
    // LOAD SETTINGS IF NOT AVAILABLE
    // ==============================================

    if (
        !Array.isArray(
            inspectionInspectors
        ) ||
        inspectionInspectors.length === 0
    ) {

        try {

            const data =
                await apiGetSettings(
                    "inspector"
                );


            if (
                data &&
                data.success &&
                Array.isArray(
                    data.settings
                )
            ) {

                inspectionInspectors =
                    data.settings;

            }

        } catch (error) {

            console.error(
                "โหลดผู้ตรวจสำหรับ FM-OP-11 ไม่สำเร็จ:",
                error
            );


            return;

        }

    }


    // ==============================================
    // RENDER INSPECTORS
    // ==============================================

    inspectionInspectors.forEach(
        function (
            inspector
        ) {

            if (!inspector) {

                return;

            }


            // ----------------------------------------
            // STATUS
            // ----------------------------------------

            if (
                inspector.status &&
                String(
                    inspector.status
                ).toLowerCase() !==
                "active"
            ) {

                return;

            }


            // ----------------------------------------
            // NAME
            // ----------------------------------------

            const name =
                inspector.settingName ||
                inspector.name ||
                inspector.settingValue ||
                inspector.inspectorName ||
                "";


            if (!name) {

                return;

            }


            // ----------------------------------------
            // OPTION
            // ----------------------------------------

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                name;


            option.textContent =
                name;


            select.appendChild(
                option
            );

        }
    );

}


// ======================================================
// SEARCH FM-OP-11 RECORDS
// ======================================================

async function searchFMOP11Records() {

    const dateInput =
        document.getElementById(
            "fmop11-date"
        );


    const inspectorInput =
        document.getElementById(
            "fmop11-inspector"
        );


    const list =
        document.getElementById(
            "fmop11-record-list"
        );


    // ==============================================
    // VALIDATE DATE
    // ==============================================

    if (
        !dateInput ||
        !dateInput.value
    ) {

        alert(
            "กรุณาเลือกวันที่ตรวจ"
        );

        return;

    }


    // ==============================================
    // VALIDATE INSPECTOR
    // ==============================================

    if (
        !inspectorInput ||
        !inspectorInput.value
    ) {

        alert(
            "กรุณาเลือกผู้ตรวจ"
        );

        return;

    }


    // ==============================================
    // LOADING
    // ==============================================

    if (list) {

        list.innerHTML = `

            <div class="inspection-empty">

                <div>
                    ⏳
                </div>

                <strong>
                    กำลังค้นหารายการตรวจ...
                </strong>

            </div>

        `;

    }


    // ==============================================
    // CLEAR OLD SELECTION
    // ==============================================

    fmop11SelectedRecords = [];


    updateFMOP11SelectedCount();


    try {

        console.log(
            "กำลังค้นหา FM-OP-11:",
            {
                inspectionDate:
                    dateInput.value,

                inspectorName:
                    inspectorInput.value
            }
        );


        // ==========================================
        // API
        // ==========================================

        const data =
            await apiGetInspections({

                inspectionDate:
                    dateInput.value,

                inspectorName:
                    inspectorInput.value

            });


        console.log(
            "ผลการค้นหา FM-OP-11:",
            data
        );


        // ==========================================
        // CHECK RESPONSE
        // ==========================================

        if (
            !data ||
            !data.success
        ) {

            fmop11Records = [];


            renderFMOP11Records();


            if (data && data.message) {

                console.warn(
                    "API:",
                    data.message
                );

            }


            return;

        }


        // ==========================================
        // SUPPORT MULTIPLE RESPONSE FORMATS
        // ==========================================

        if (
            Array.isArray(
                data.inspections
            )
        ) {

            fmop11Records =
                data.inspections;

        } else if (
            Array.isArray(
                data.data
            )
        ) {

            fmop11Records =
                data.data;

        } else {

            fmop11Records = [];

        }


        console.log(
            "จำนวนรายการตรวจ:",
            fmop11Records.length
        );


        // ==========================================
        // RENDER
        // ==========================================

        renderFMOP11Records();


        updateFMOP11SelectedCount();


    } catch (error) {

        console.error(
            "ค้นหารายการตรวจไม่สำเร็จ:",
            error
        );


        fmop11Records = [];


        renderFMOP11Records();


        updateFMOP11SelectedCount();

    }

}


// ======================================================
// RENDER FM-OP-11 RECORD LIST
// ======================================================

function renderFMOP11Records() {

    const list =
        document.getElementById(
            "fmop11-record-list"
        );


    if (!list) {

        return;

    }


    // ==============================================
    // EMPTY
    // ==============================================

    if (
        !Array.isArray(
            fmop11Records
        ) ||
        fmop11Records.length === 0
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
                    ไม่พบข้อมูลตามวันที่และผู้ตรวจที่เลือก
                </span>

            </div>

        `;

        return;

    }


    // ==============================================
    // CLEAR
    // ==============================================

    list.innerHTML = "";


    // ==============================================
    // RENDER
    // ==============================================

    fmop11Records.forEach(
        function (
            record,
            index
        ) {

            if (!record) {

                return;

            }


            // ----------------------------------------
            // RECORD ID
            // ----------------------------------------

            const recordId =
                record.recordId ||
                record.id ||
                "";


            // ----------------------------------------
            // LOCATION
            // ----------------------------------------

            const location =
                record.locationName ||
                record.location ||
                "-";


            // ----------------------------------------
            // TIME
            // ----------------------------------------

            const time =
                record.inspectionTime ||
                "-";


            // ----------------------------------------
            // ITEM COUNT
            // ----------------------------------------

            const itemCount =
                Array.isArray(
                    record.items
                )
                    ? record.items.length
                    : 0;


            // ----------------------------------------
            // WRAPPER
            // ----------------------------------------

            const wrapper =
                document.createElement(
                    "label"
                );


            wrapper.className =
                "fmop11-record-item";


            // ----------------------------------------
            // HTML
            // ----------------------------------------

            wrapper.innerHTML = `

                <input
                    type="checkbox"
                    class="fmop11-record-checkbox"
                    data-record-id="${escapeHTML(
                        recordId
                    )}"
                    data-index="${index}"
                >


                <div class="fmop11-record-content">

                    <div class="fmop11-record-main">

                        <strong>
                            ${escapeHTML(
                                location
                            )}
                        </strong>

                        <span>
                            เวลา
                            ${escapeHTML(
                                time
                            )}
                        </span>

                    </div>


                    <div class="fmop11-record-meta">

                        <span>
                            ${escapeHTML(
                                record.inspectorName ||
                                ""
                            )}
                        </span>

                        <span>
                            ${itemCount}
                            รายการตรวจ
                        </span>

                    </div>

                </div>

            `;


            // ----------------------------------------
            // CHECKBOX EVENT
            // ----------------------------------------

            const checkbox =
                wrapper.querySelector(
                    ".fmop11-record-checkbox"
                );


            if (checkbox) {

                checkbox.addEventListener(
                    "change",
                    handleFMOP11RecordSelection
                );

            }


            list.appendChild(
                wrapper
            );

        }
    );

}


// ======================================================
// HANDLE FM-OP-11 SELECTION
// ======================================================

function handleFMOP11RecordSelection(
    event
) {

    const checkbox =
        event.target;


    if (!checkbox) {

        return;

    }


    const index =
        Number(
            checkbox.dataset.index
        );


    const record =
        fmop11Records[index];


    if (!record) {

        return;

    }


    // ==============================================
    // CHECK
    // ==============================================

    if (
        checkbox.checked
    ) {

        // ------------------------------------------
        // LIMIT 14
        // ------------------------------------------

        if (
            fmop11SelectedRecords.length >=
            14
        ) {

            checkbox.checked =
                false;


            alert(
                "FM-OP-11 สามารถเลือกได้สูงสุด 14 จุด"
            );


            return;

        }


        // ------------------------------------------
        // PREVENT DUPLICATE
        // ------------------------------------------

        const recordId =
            record.recordId ||
            record.id ||
            "";


        const alreadySelected =
            fmop11SelectedRecords.some(
                function (
                    item
                ) {

                    const itemId =
                        item.recordId ||
                        item.id ||
                        "";


                    return (
                        itemId ===
                        recordId
                    );

                }
            );


        if (
            alreadySelected
        ) {

            return;

        }


        // ------------------------------------------
        // ADD
        // ------------------------------------------

        fmop11SelectedRecords.push(
            record
        );


    } else {

        // ------------------------------------------
        // REMOVE
        // ------------------------------------------

        const recordId =
            record.recordId ||
            record.id ||
            "";


        fmop11SelectedRecords =
            fmop11SelectedRecords.filter(
                function (
                    item
                ) {

                    const itemId =
                        item.recordId ||
                        item.id ||
                        "";


                    return (
                        itemId !==
                        recordId
                    );

                }
            );

    }


    updateFMOP11SelectedCount();

}


// ======================================================
// UPDATE SELECTED COUNT
// ======================================================

function updateFMOP11SelectedCount() {

    const display =
        document.getElementById(
            "fmop11-selected-count"
        );


    const generateButton =
        document.getElementById(
            "generate-fmop11-button"
        );


    const count =
        Array.isArray(
            fmop11SelectedRecords
        )
            ? fmop11SelectedRecords.length
            : 0;


    // ==============================================
    // COUNT DISPLAY
    // ==============================================

    if (display) {

        display.textContent =
            `${count} / 14 จุด`;

    }


    // ==============================================
    // GENERATE BUTTON
    // ==============================================

    if (generateButton) {

        generateButton.disabled =
            count === 0;

    }

}


// ======================================================
// CLEAR FM-OP-11 SELECTION
// ======================================================

function clearFMOP11Selection() {

    fmop11SelectedRecords = [];


    const checkboxes =
        document.querySelectorAll(
            ".fmop11-record-checkbox"
        );


    checkboxes.forEach(
        function (
            checkbox
        ) {

            checkbox.checked =
                false;

        }
    );


    updateFMOP11SelectedCount();

}


// ======================================================
// GENERATE FM-OP-11
// ======================================================

async function generateFMOP11() {

    // ==============================================
    // VALIDATE SELECTION
    // ==============================================

    if (
        !Array.isArray(
            fmop11SelectedRecords
        ) ||
        fmop11SelectedRecords.length === 0
    ) {

        alert(
            "กรุณาเลือกรายการตรวจอย่างน้อย 1 จุด"
        );

        return;

    }


    // ==============================================
    // LIMIT 14
    // ==============================================

    if (
        fmop11SelectedRecords.length > 14
    ) {

        alert(
            "สามารถเลือกได้สูงสุด 14 จุด"
        );

        return;

    }


    // ==============================================
    // CURRENT USER
    // ==============================================

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


    // ==============================================
    // ELEMENTS
    // ==============================================

    const generateButton =
        document.getElementById(
            "generate-fmop11-button"
        );


    const status =
        document.getElementById(
            "fmop11-generation-status"
        );


    // ==============================================
    // DISABLE BUTTON
    // ==============================================

    if (generateButton) {

        generateButton.disabled =
            true;

        generateButton.textContent =
            "กำลังสร้าง...";

    }


    // ==============================================
    // STATUS
    // ==============================================

    if (status) {

        status.style.display =
            "block";

        status.textContent =
            "กำลังสร้างเอกสาร FM-OP-11...";

    }


    try {

        console.log(
            "กำลังสร้าง FM-OP-11:",
            fmop11SelectedRecords
        );


        // ==========================================
        // API
        // ==========================================

        const data =
            await apiGenerateFMOP11(

                fmop11SelectedRecords,

                user.name ||
                    "",

                user.email ||
                    ""

            );


        console.log(
            "ผลการสร้าง FM-OP-11:",
            data
        );


        // ==========================================
        // SUCCESS
        // ==========================================

        if (
            data &&
            data.success
        ) {

            if (status) {

                status.textContent =
                    "สร้าง FM-OP-11 สำเร็จ";

            }


            alert(
                "สร้างเอกสาร FM-OP-11 สำเร็จ"
            );


            // ----------------------------------------
            // OPEN FILE
            // ----------------------------------------

            const fileUrl =
                data.fileUrl ||
                data.url ||
                "";


            if (fileUrl) {

                window.open(
                    fileUrl,
                    "_blank"
                );

            }


            // ----------------------------------------
            // CLEAR SELECTION
            // ----------------------------------------

            clearFMOP11Selection();


        } else {

            if (status) {

                status.textContent =
                    "ไม่สามารถสร้างเอกสารได้";

            }


            alert(

                (
                    data &&
                    data.message
                ) ||
                "ไม่สามารถสร้างเอกสาร FM-OP-11 ได้"

            );

        }


    } catch (error) {

        console.error(
            "สร้าง FM-OP-11 ไม่สำเร็จ:",
            error
        );


        if (status) {

            status.textContent =
                "เกิดข้อผิดพลาดในการสร้างเอกสาร";

        }


        alert(
            "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
        );


    } finally {

        // ==========================================
        // RESTORE BUTTON
        // ==========================================

        if (generateButton) {

            const count =
                Array.isArray(
                    fmop11SelectedRecords
                )
                    ? fmop11SelectedRecords.length
                    : 0;


            generateButton.disabled =
                count === 0;


            generateButton.textContent =
                "📄 สร้าง FM-OP-11";

        }

    }

}


// ======================================================
// END FM-OP-11 GENERATOR
// ======================================================