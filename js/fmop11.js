
// ======================================================
// GGN Docs
// FM-OP-11 GENERATOR
// ======================================================
// หน้าที่:
// - ค้นหารายการตรวจสำหรับ FM-OP-11
// - เลือกรายการตรวจ
// - จำกัดจำนวนสูงสุด 14 จุดต่อเอกสาร
// - ส่งเฉพาะ recordId ไป Backend
// - Backend เป็นผู้ดึงข้อมูล Inspection + 7 Items
// - สร้างเอกสาร FM-OP-11
// - แสดงข้อความผิดพลาดแยกตามสาเหตุ
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


    console.log(
        "หน้า FM-OP-11 พร้อมใช้งาน"
    );

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


    // ==================================================
    // SEARCH
    // ==================================================

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


    // ==================================================
    // CLEAR
    // ==================================================

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


    // ==================================================
    // GENERATE
    // ==================================================

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


    // ==================================================
    // RESET SELECT
    // ==================================================

    select.innerHTML = `

        <option value="">
            -- เลือกผู้ตรวจ --
        </option>

    `;


    // ==================================================
    // LOAD INSPECTORS
    // ==================================================

    try {

        if (
            !Array.isArray(
                inspectionInspectors
            ) ||
            inspectionInspectors.length === 0
        ) {

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

        }


        // ==================================================
        // RENDER INSPECTORS
        // ==================================================

        if (
            !Array.isArray(
                inspectionInspectors
            )
        ) {

            inspectionInspectors =
                [];

        }


        inspectionInspectors.forEach(
            function (
                inspector
            ) {

                if (!inspector) {

                    return;

                }


                // ------------------------------------------
                // STATUS
                // ------------------------------------------

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


                // ------------------------------------------
                // NAME
                // ------------------------------------------

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


    } catch (error) {

        console.error(
            "โหลดผู้ตรวจสำหรับ FM-OP-11 ไม่สำเร็จ:",
            error
        );


        // ----------------------------------------------
        // แสดงข้อความเฉพาะกรณีโหลดผู้ตรวจล้มเหลว
        // ----------------------------------------------

        select.innerHTML = `

            <option value="">
                -- โหลดรายชื่อผู้ตรวจไม่สำเร็จ --
            </option>

        `;

    }

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


    // ==================================================
    // VALIDATE DATE
    // ==================================================

    if (
        !dateInput ||
        !dateInput.value
    ) {

        alert(
            "ไม่สามารถค้นหาได้\n\nกรุณาเลือกวันที่ตรวจ"
        );

        return;

    }


    // ==================================================
    // VALIDATE INSPECTOR
    // ==================================================

    if (
        !inspectorInput ||
        !inspectorInput.value
    ) {

        alert(
            "ไม่สามารถค้นหาได้\n\nกรุณาเลือกผู้ตรวจ"
        );

        return;

    }


    // ==================================================
    // CLEAR PREVIOUS SELECTION
    // ==================================================

    fmop11SelectedRecords = [];


    updateFMOP11SelectedCount();


    // ==================================================
    // LOADING
    // ==================================================

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

        console.log(
            "กำลังค้นหา FM-OP-11:",
            {
                inspectionDate:
                    dateInput.value,

                inspectorName:
                    inspectorInput.value
            }
        );


        // ==================================================
        // API
        // ==================================================

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


        // ==================================================
        // CHECK RESPONSE
        // ==================================================

        if (
            !data
        ) {

            fmop11Records = [];


            renderFMOP11Records();


            updateFMOP11SelectedCount();


            console.error(
                "ค้นหา FM-OP-11 ไม่ได้รับข้อมูลจาก Backend:",
                data
            );


            alert(
                "ค้นหารายการตรวจไม่สำเร็จ\n\n" +
                "สาเหตุ: ไม่ได้รับข้อมูลตอบกลับจากระบบ"
            );


            return;

        }


        if (
            !data.success
        ) {

            fmop11Records = [];


            renderFMOP11Records();


            updateFMOP11SelectedCount();


            const message =
                data.message ||
                "Backend ไม่สามารถค้นหารายการตรวจได้";


            console.error(
                "Backend ค้นหา FM-OP-11 ไม่สำเร็จ:",
                data
            );


            alert(
                "ค้นหารายการตรวจไม่สำเร็จ\n\n" +
                "สาเหตุ: " +
                message
            );


            return;

        }


        // ==================================================
        // GET RECORDS
        // ==================================================

        /*
         * Backend อาจส่งข้อมูลมาในชื่อ
         * inspections หรือ data
         * เพื่อรองรับทั้งสองรูปแบบ
         *
         * getInspections() ตั้งใจส่งเฉพาะ
         * ข้อมูลหลักของ Inspections
         * ไม่โหลด InspectionItems มาพร้อมกัน
         */

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


        // ==================================================
        // RENDER
        // ==================================================

        renderFMOP11Records();


        updateFMOP11SelectedCount();


    } catch (error) {

        console.error(
            "ค้นหารายการตรวจ FM-OP-11 ไม่สำเร็จ:",
            error
        );


        fmop11Records = [];


        fmop11SelectedRecords = [];


        renderFMOP11Records();


        updateFMOP11SelectedCount();


        alert(
            "ค้นหารายการตรวจไม่สำเร็จ\n\n" +
            "สาเหตุ: ไม่สามารถเชื่อมต่อกับระบบ Backend ได้\n\n" +
            "กรุณาตรวจสอบการเชื่อมต่อ แล้วลองใหม่อีกครั้ง"
        );

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


    // ==================================================
    // EMPTY
    // ==================================================

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


    // ==================================================
    // CLEAR
    // ==================================================

    list.innerHTML = "";


    // ==================================================
    // RENDER
    // ==================================================

    fmop11Records.forEach(
        function (
            record,
            index
        ) {

            if (!record) {

                return;

            }


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


            const inspector =
                record.inspectorName ||
                "";


            // ==================================================
            // FM-OP-11 มีรายการตรวจมาตรฐาน 7 ข้อ
            //
            // ไม่ดึง items จาก Backend ในรายการค้นหา
            // เพราะ Items จะถูกดึงตาม recordId
            // ตอนสร้างเอกสาร
            // ==================================================

            const itemCount =
                7;


            // ==================================================
            // WRAPPER
            // ==================================================

            const wrapper =
                document.createElement(
                    "label"
                );


            wrapper.className =
                "fmop11-record-item";


            // ==================================================
            // CONTENT
            // ==================================================

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
                                inspector
                            )}
                        </span>

                        <span>
                            ${itemCount} รายการตรวจ
                        </span>

                    </div>

                </div>

            `;


            // ==================================================
            // CHECKBOX EVENT
            // ==================================================

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


            // ==================================================
            // APPEND
            // ==================================================

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

        checkbox.checked =
            false;

        alert(
            "ไม่สามารถเลือกรายการนี้ได้\n\n" +
            "สาเหตุ: ไม่พบข้อมูลรายการตรวจ"
        );

        return;

    }


    const recordId =
        record.recordId ||
        record.id ||
        "";


    // ==================================================
    // VALIDATE RECORD ID
    // ==================================================

    if (!recordId) {

        checkbox.checked =
            false;


        console.error(
            "รายการตรวจไม่มี recordId:",
            record
        );


        alert(
            "ไม่สามารถเลือกรายการนี้ได้\n\n" +
            "สาเหตุ: รายการตรวจไม่มีรหัส recordId"
        );


        return;

    }


    // ==================================================
    // CHECK
    // ==================================================

    if (
        checkbox.checked
    ) {

        // ----------------------------------------------
        // MAX 14
        // ----------------------------------------------

        if (
            fmop11SelectedRecords.length >=
            14
        ) {

            checkbox.checked =
                false;


            alert(
                "ไม่สามารถเลือกรายการเพิ่มได้\n\n" +
                "สาเหตุ: FM-OP-11 หนึ่งฉบับรองรับสูงสุด 14 จุด"
            );


            return;

        }


        // ----------------------------------------------
        // PREVENT DUPLICATE
        // ----------------------------------------------

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

            checkbox.checked =
                true;


            return;

        }


        // ----------------------------------------------
        // ADD
        // ----------------------------------------------
        // เก็บเฉพาะ recordId
        // เพื่อลดข้อมูลที่เก็บใน Frontend
        // และลดข้อมูลที่ส่งไป Backend

        fmop11SelectedRecords.push({

            recordId:
                recordId

        });

    }


    // ==================================================
    // UNCHECK
    // ==================================================

    else {

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


    // ==================================================
    // UPDATE COUNT
    // ==================================================

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


    // ==================================================
    // COUNT
    // ==================================================

    if (display) {

        display.textContent =
            `${count} / 14 จุด`;

    }


    // ==================================================
    // GENERATE BUTTON
    // ==================================================

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


    console.log(
        "ล้างรายการเลือก FM-OP-11 แล้ว"
    );

}


// ======================================================
// GENERATE FM-OP-11
// ======================================================

async function generateFMOP11() {

    // ==================================================
    // VALIDATE SELECTION
    // ==================================================

    if (
        !Array.isArray(
            fmop11SelectedRecords
        ) ||
        fmop11SelectedRecords.length === 0
    ) {

        alert(
            "ไม่สามารถสร้างเอกสารได้\n\n" +
            "สาเหตุ: ยังไม่ได้เลือกรายการตรวจ"
        );

        return;

    }


    // ==================================================
    // MAX 14
    // ==================================================

    if (
        fmop11SelectedRecords.length > 14
    ) {

        alert(
            "ไม่สามารถสร้างเอกสารได้\n\n" +
            "สาเหตุ: เลือกรายการตรวจเกิน 14 จุด"
        );

        return;

    }


    // ==================================================
    // CURRENT USER
    // ==================================================

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "ไม่สามารถสร้างเอกสารได้\n\n" +
            "สาเหตุ: ไม่พบข้อมูลผู้ใช้งาน\n\n" +
            "กรุณาเข้าสู่ระบบใหม่"
        );

        return;

    }


    // ==================================================
    // VALIDATE RECORD IDs
    // ==================================================

    const invalidRecord =
        fmop11SelectedRecords.find(
            function (
                item
            ) {

                return (
                    !item ||
                    !item.recordId
                );

            }
        );


    if (
        invalidRecord
    ) {

        console.error(
            "พบรายการที่ไม่มี recordId:",
            invalidRecord
        );


        alert(
            "ไม่สามารถสร้างเอกสารได้\n\n" +
            "สาเหตุ: มีรายการตรวจที่ไม่มีรหัส recordId\n\n" +
            "กรุณาล้างรายการที่เลือก แล้วเลือกใหม่"
        );


        return;

    }


    // ==================================================
    // ELEMENTS
    // ==================================================

    const generateButton =
        document.getElementById(
            "generate-fmop11-button"
        );


    const status =
        document.getElementById(
            "fmop11-generation-status"
        );


    // ==================================================
    // DISABLE BUTTON
    // ==================================================

    if (generateButton) {

        generateButton.disabled =
            true;

        generateButton.textContent =
            "กำลังสร้าง...";

    }


    // ==================================================
    // STATUS
    // ==================================================

    if (status) {

        status.style.display =
            "block";

        status.textContent =
            "กำลังสร้างเอกสาร FM-OP-11...";

    }


    try {

        console.log(
            "กำลังสร้าง FM-OP-11 จาก recordId:",
            fmop11SelectedRecords
        );


        // ==================================================
        // API
        // ==================================================

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


        // ==================================================
        // NO RESPONSE
        // ==================================================

        if (
            !data
        ) {

            if (status) {

                status.textContent =
                    "สร้างเอกสารไม่สำเร็จ";

            }


            alert(
                "สร้างเอกสาร FM-OP-11 ไม่สำเร็จ\n\n" +
                "สาเหตุ: ไม่ได้รับข้อมูลตอบกลับจาก Backend"
            );


            return;

        }


        // ==================================================
        // BACKEND FAILURE
        // ==================================================

        if (
            !data.success
        ) {

            if (status) {

                status.textContent =
                    "สร้างเอกสารไม่สำเร็จ";

            }


            const message =
                data.message ||
                "Backend ไม่สามารถสร้างเอกสารได้";


            console.error(
                "Backend สร้าง FM-OP-11 ไม่สำเร็จ:",
                data
            );


            alert(
                "สร้างเอกสาร FM-OP-11 ไม่สำเร็จ\n\n" +
                "สาเหตุ: " +
                message
            );


            return;

        }


        // ==================================================
        // SUCCESS BUT NO FILE URL
        // ==================================================

        if (
            !data.fileUrl
        ) {

            if (status) {

                status.textContent =
                    "สร้างเอกสารสำเร็จ แต่ไม่พบลิงก์ไฟล์";

            }


            console.error(
                "Backend แจ้งว่าสร้างสำเร็จ แต่ไม่มี fileUrl:",
                data
            );


            alert(
                "สร้างเอกสาร FM-OP-11 สำเร็จ\n\n" +
                "แต่ไม่พบลิงก์สำหรับเปิดไฟล์\n\n" +
                "กรุณาตรวจสอบข้อมูลการสร้างไฟล์ใน Backend"
            );


            clearFMOP11Selection();


            return;

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        if (status) {

            status.textContent =
                "สร้าง FM-OP-11 สำเร็จ";

        }


        console.log(
            "สร้าง FM-OP-11 สำเร็จ:",
            {
                documentNo:
                    data.documentNo,

                fileId:
                    data.fileId,

                fileUrl:
                    data.fileUrl,

                fileName:
                    data.fileName,

                recordCount:
                    data.recordCount
            }
        );


        alert(
            "สร้างเอกสาร FM-OP-11 สำเร็จ\n\n" +
            (
                data.documentNo
                    ? "เลขที่เอกสาร: " +
                      data.documentNo +
                      "\n"
                    : ""
            ) +
            (
                data.recordCount
                    ? "จำนวนจุดตรวจ: " +
                      data.recordCount +
                      " จุด"
                    : ""
            )
        );


        // ----------------------------------------------
        // OPEN FILE
        // ----------------------------------------------

        window.open(
            data.fileUrl,
            "_blank"
        );


        // ----------------------------------------------
        // CLEAR SELECTION
        // ----------------------------------------------

        clearFMOP11Selection();


    } catch (error) {

        console.error(
            "สร้าง FM-OP-11 ไม่สำเร็จ:",
            error
        );


        if (status) {

            status.textContent =
                "เชื่อมต่อ Backend ไม่สำเร็จ";

        }


        alert(
            "สร้างเอกสาร FM-OP-11 ไม่สำเร็จ\n\n" +
            "สาเหตุ: ไม่สามารถเชื่อมต่อกับ Backend ได้\n\n" +
            "กรุณาตรวจสอบการเชื่อมต่อ แล้วลองใหม่อีกครั้ง"
        );


    } finally {

        // ==================================================
        // RESTORE BUTTON
        // ==================================================

        if (generateButton) {

            generateButton.disabled =
                !Array.isArray(
                    fmop11SelectedRecords
                ) ||
                fmop11SelectedRecords.length ===
                    0;


            generateButton.textContent =
                "📄 สร้าง FM-OP-11";

        }

    }

}


// ======================================================
// END FM-OP-11
// ======================================================

//เวอร์ชันนี้ยังคงหลักการเดิมทั้งหมดค่ะ แต่เวลาทดสอบ ถ้าสร้างไม่สำเร็จ เราจะเห็นได้ชัดขึ้นว่าเป็น ข้อมูลไม่ครบ / Backend ปฏิเสธ / ไม่มี response / เชื่อมต่อไม่ได้ / สร้างไฟล์แล้วแต่ไม่มี URL ทำให้เวลาคุณส่ง error มาให้ฉัน เราจะไล่ต้นเหตุได้ง่ายขึ้นค่ะ