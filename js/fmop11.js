// FM-OP-11 GENERATOR
// ======================================================


// ========================================
// INITIALIZE FM-OP-11
// ========================================

function initializeFMOP11Page() {

    setupFMOP11Events();

    loadFMOP11Inspectors();

    updateFMOP11SelectedCount();

}


// ========================================
// SETUP FM-OP-11 EVENTS
// ========================================

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


// ========================================
// LOAD FM-OP-11 INSPECTORS
// ========================================

async function loadFMOP11Inspectors() {

    const select =
        document.getElementById(
            "fmop11-inspector"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกผู้ตรวจ --
        </option>

    `;


    if (
        inspectionInspectors.length === 0
    ) {

        try {

            const data =
                await getInspectionSetting(
                    "inspector"
                );


            if (
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

        }

    }


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


            select.appendChild(
                option
            );

        }
    );

}


// ========================================
// SEARCH FM-OP-11 RECORDS
// ========================================

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


    if (!dateInput || !dateInput.value) {

        alert(
            "กรุณาเลือกวันที่ตรวจ"
        );

        return;

    }


    if (
        !inspectorInput ||
        !inspectorInput.value
    ) {

        alert(
            "กรุณาเลือกผู้ตรวจ"
        );

        return;

    }


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


    try {

        const response =
            await apiFetch(

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
                                "getInspections",

                            inspectionDate:
                                dateInput.value,

                            inspectorName:
                                inspectorInput.value

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการค้นหา FM-OP-11:",
            data
        );


        if (
            !data.success ||
            !Array.isArray(
                data.inspections
            )
        ) {

            fmop11Records = [];

        } else {

            fmop11Records =
                data.inspections;

        }


        fmop11SelectedRecords = [];


        renderFMOP11Records();

        updateFMOP11SelectedCount();

    } catch (error) {

        console.error(
            "ค้นหารายการตรวจไม่สำเร็จ:",
            error
        );


        fmop11Records = [];

        renderFMOP11Records();

    }

}


// ========================================
// RENDER FM-OP-11 RECORD LIST
// ========================================

function renderFMOP11Records() {

    const list =
        document.getElementById(
            "fmop11-record-list"
        );


    if (!list) {

        return;

    }


    if (
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


    list.innerHTML = "";


    fmop11Records.forEach(
        function (
            record,
            index
        ) {

            const recordId =
                record.recordId ||
                record.id ||
                "";


            const location =
                record.locationName ||
                "-";


            const time =
                record.inspectionTime ||
                "-";


            const itemCount =
                Array.isArray(
                    record.items
                )
                    ? record.items.length
                    : 0;


            const wrapper =
                document.createElement(
                    "label"
                );


            wrapper.className =
                "fmop11-record-item";


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
                            เวลา ${escapeHTML(
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
                            ${itemCount} รายการตรวจ
                        </span>

                    </div>

                </div>

            `;


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


// ========================================
// HANDLE FM-OP-11 SELECTION
// ========================================

function handleFMOP11RecordSelection(
    event
) {

    const checkbox =
        event.target;


    const index =
        Number(
            checkbox.dataset.index
        );


    const record =
        fmop11Records[index];


    if (!record) {

        return;

    }


    if (checkbox.checked) {

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


        fmop11SelectedRecords.push(
            record
        );

    } else {

        fmop11SelectedRecords =
            fmop11SelectedRecords.filter(
                function (
                    item
                ) {

                    return (
                        item.recordId !==
                        record.recordId
                    );

                }
            );

    }


    updateFMOP11SelectedCount();

}


// ========================================
// UPDATE SELECTED COUNT
// ========================================

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
        fmop11SelectedRecords.length;


    if (display) {

        display.textContent =
            `${count} / 14 จุด`;

    }


    if (generateButton) {

        generateButton.disabled =
            count === 0;

    }

}


// ========================================
// CLEAR FM-OP-11 SELECTION
// ========================================

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


// ========================================
// GENERATE FM-OP-11
// ========================================

async function generateFMOP11() {

    if (
        fmop11SelectedRecords.length === 0
    ) {

        alert(
            "กรุณาเลือกรายการตรวจอย่างน้อย 1 จุด"
        );

        return;

    }


    if (
        fmop11SelectedRecords.length > 14
    ) {

        alert(
            "สามารถเลือกได้สูงสุด 14 จุด"
        );

        return;

    }


    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


    const generateButton =
        document.getElementById(
            "generate-fmop11-button"
        );


    const status =
        document.getElementById(
            "fmop11-generation-status"
        );


    if (generateButton) {

        generateButton.disabled =
            true;

        generateButton.textContent =
            "กำลังสร้าง...";

    }


    if (status) {

        status.style.display =
            "block";

        status.textContent =
            "กำลังสร้างเอกสาร FM-OP-11...";

    }


    try {

        const response =
            await apiFetch(

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
                                "generateFMOP11",

                            records:
                                fmop11SelectedRecords,

                            createdBy:
                                user.name ||
                                "",

                            createdByEmail:
                                user.email ||
                                ""

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการสร้าง FM-OP-11:",
            data
        );


        if (data.success) {

            if (status) {

                status.textContent =
                    "สร้าง FM-OP-11 สำเร็จ";

            }


            alert(
                "สร้างเอกสาร FM-OP-11 สำเร็จ"
            );


            if (data.fileUrl) {

                window.open(
                    data.fileUrl,
                    "_blank"
                );

            }


            clearFMOP11Selection();

        } else {

            if (status) {

                status.textContent =
                    "ไม่สามารถสร้างเอกสารได้";

            }


            alert(

                data.message ||
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

        if (generateButton) {

            generateButton.disabled =
                fmop11SelectedRecords.length === 0;

            generateButton.textContent =
                "📄 สร้าง FM-OP-11";

        }

    }

}


// ======================================================
