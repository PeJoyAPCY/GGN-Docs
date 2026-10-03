
// ======================================================
// GGN Docs
// FM-OP-11 GENERATOR
// VERSION: 2.3.1
// DATE: 2026-10-03
//
// หน้าที่:
// - ค้นหารายการตรวจสำหรับ FM-OP-11
// - เลือกรายการตรวจ
// - จำกัดจำนวนสูงสุด 14 จุดต่อเอกสาร
// - ส่งเฉพาะ recordId ไป Backend
// - Backend เป็นผู้ดึงข้อมูล Inspection + 7 Items
// - Backend เป็นผู้ตรวจสอบสิทธิ์
// - สร้างเอกสาร FM-OP-11
// - รับ PDF จาก Backend
// - ดาวน์โหลด PDF ลงเครื่องอัตโนมัติ
// - แสดงข้อความผิดพลาดแยกตามสาเหตุ
//
// CHANGE v2.3.1
// - แก้ fmop11SelectedRecords is not defined
// - Initialize FM-OP-11 state อย่างปลอดภัย
// - User ใช้ชื่อ Current User เป็น Inspector
// - Admin จึงเรียก API เพื่อโหลด Inspector ทั้งหมด
// - ไม่เปิดสิทธิ์ Backend ให้ User ดู Inspector ทั้งหมด
// ======================================================


// ======================================================
// FM-OP-11 STATE
// ======================================================
//
// ใช้ window เพื่อป้องกันปัญหา ReferenceError
// และป้องกันการชนกับ state.js หากมีตัวแปรนี้อยู่แล้ว
//
// เก็บเฉพาะ recordId สำหรับรายการที่เลือก
// ======================================================

if (
    !Array.isArray(
        window.fmop11SelectedRecords
    )
) {

    window.fmop11SelectedRecords = [];

}


if (
    !Array.isArray(
        window.fmop11Records
    )
) {

    window.fmop11Records = [];

}


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
//
// Permission:
//
// Admin
// - โหลดรายชื่อ Inspector ทั้งหมดจาก Backend
//
// User
// - ใช้ชื่อของ Current User โดยตรง
// - ไม่เรียก getInspectionUsers()
// - ไม่ต้องมีสิทธิ์ดูรายชื่อผู้ตรวจทั้งหมด
//
// Inspector ไม่ใช้ Settings แล้ว
//
// Settings ปัจจุบันใช้สำหรับ:
// inspectionItem
//
// Inspector ใช้ Users Sheet ผ่าน:
// Current User / Inspection User API
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
    // CURRENT USER
    // ==================================================

    const currentUser =
        typeof getCurrentGGNUser === "function"
            ? getCurrentGGNUser()
            : null;


    if (
        !currentUser ||
        !currentUser.email
    ) {

        select.innerHTML = `

            <option value="">
                -- ไม่พบข้อมูลผู้ใช้งาน --
            </option>

        `;

        return;

    }


    // ==================================================
    // CHECK ROLE
    // ==================================================

    const role =
        String(
            currentUser.role ||
            ""
        )
            .trim()
            .toLowerCase();


    const isAdmin =
        role === "admin";


    // ==================================================
    // USER
    // ==================================================
    //
    // User ไม่สามารถดูรายชื่อ Inspector ทั้งหมด
    // ดังนั้นใช้ชื่อของตัวเอง
    // ==================================================

    if (
        !isAdmin
    ) {

        const currentName =
            currentUser.name ||
            "";


        if (!currentName) {

            select.innerHTML = `

                <option value="">
                    -- ไม่พบชื่อผู้ตรวจ --
                </option>

            `;

            return;

        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            currentName;


        option.textContent =
            currentName;


        select.appendChild(
            option
        );


        // ------------------------------------------------
        // เลือกตัวเองอัตโนมัติ
        // ------------------------------------------------

        select.value =
            currentName;


        console.log(
            "FM-OP-11 User ใช้ Current User เป็น Inspector:",
            currentName
        );


        return;

    }


    // ==================================================
    // ADMIN
    // ==================================================
    //
    // Admin สามารถดู Inspector ทั้งหมด
    // ==================================================

    try {

        // ------------------------------------------------
        // ถ้ามีข้อมูล Inspector อยู่แล้ว
        // ให้ใช้ข้อมูลเดิม
        // ------------------------------------------------

        if (
            !Array.isArray(
                inspectionInspectors
            ) ||
            inspectionInspectors.length === 0
        ) {

            const data =
                await apiGetInspectionUsers();


            if (
                data &&
                data.success &&
                Array.isArray(
                    data.users
                )
            ) {

                inspectionInspectors =
                    data.users;

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
                    )
                        .trim()
                        .toLowerCase()
                    !==
                    "active"
                ) {

                    return;

                }


                // ------------------------------------------
                // NAME
                // ------------------------------------------

                const name =
                    inspector.name ||
                    inspector.inspectorName ||
                    inspector.settingName ||
                    inspector.settingValue ||
                    "";


                if (!name) {

                    return;

                }


                // ------------------------------------------
                // DUPLICATE
                // ------------------------------------------

                const existing =
                    Array.from(
                        select.options
                    ).some(
                        function (
                            option
                        ) {

                            return (
                                option.value ===
                                name
                            );

                        }
                    );


                if (
                    existing
                ) {

                    return;

                }


                // ------------------------------------------
                // OPTION
                // ------------------------------------------

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


        // ==================================================
        // NO INSPECTOR
        // ==================================================

        if (
            select.options.length === 1
        ) {

            select.innerHTML = `

                <option value="">
                    -- ไม่พบรายชื่อผู้ตรวจ --
                </option>

            `;

        }


    } catch (error) {

        console.error(
            "โหลดผู้ตรวจสำหรับ FM-OP-11 ไม่สำเร็จ:",
            error
        );


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

    window.fmop11SelectedRecords = [];


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

            window.fmop11Records = [];


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

            window.fmop11Records = [];


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

        if (
            Array.isArray(
                data.inspections
            )
        ) {

            window.fmop11Records =
                data.inspections;

        } else if (
            Array.isArray(
                data.data
            )
        ) {

            window.fmop11Records =
                data.data;

        } else {

            window.fmop11Records = [];

        }


        console.log(
            "จำนวนรายการตรวจ:",
            window.fmop11Records.length
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


        window.fmop11Records = [];


        window.fmop11SelectedRecords = [];


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
            window.fmop11Records
        ) ||
        window.fmop11Records.length === 0
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

    window.fmop11Records.forEach(
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
                record.location ||
                "-";


            const time =
                record.inspectionTime ||
                record.time ||
                "-";


            const inspector =
                record.inspectorName ||
                record.inspector ||
                "";


            // ==================================================
            // FM-OP-11 มีรายการตรวจมาตรฐาน 7 ข้อ
            //
            // ไม่ดึง Items ในรายการค้นหา
            // Backend จะดึง Items ตอน Generate
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
        window.fmop11Records[index];


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
            window.fmop11SelectedRecords.length >=
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
            window.fmop11SelectedRecords.some(
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
        //
        // เก็บเฉพาะ recordId
        // ----------------------------------------------

        window.fmop11SelectedRecords.push({

            recordId:
                recordId

        });

    }


    // ==================================================
    // UNCHECK
    // ==================================================

    else {

        window.fmop11SelectedRecords =
            window.fmop11SelectedRecords.filter(
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
            window.fmop11SelectedRecords
        )
            ? window.fmop11SelectedRecords.length
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

    window.fmop11SelectedRecords = [];


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
// DOWNLOAD PDF FROM BASE64
// ======================================================
//
// Backend จะส่ง PDF กลับมาเป็น Base64
// Frontend แปลง Base64 เป็น Blob
// แล้วสั่ง Browser ดาวน์โหลดไฟล์
// ======================================================

function downloadFMOP11PDF(
    pdfBase64,
    fileName
) {

    // ==================================================
    // VALIDATE
    // ==================================================

    if (!pdfBase64) {

        throw new Error(
            "Backend ไม่ได้ส่งข้อมูล PDF กลับมา"
        );

    }


    // ==================================================
    // SUPPORT DATA URL
    // ==================================================

    let base64Data =
        String(
            pdfBase64
        );


    if (
        base64Data.indexOf(
            "base64,"
        ) !== -1
    ) {

        base64Data =
            base64Data.split(
                "base64,"
            )[1];

    }


    // ==================================================
    // REMOVE WHITESPACE
    // ==================================================

    base64Data =
        base64Data.replace(
            (/\s/g),
            ""
        );


    // ==================================================
    // DECODE BASE64
    // ==================================================

    let binaryString;


    try {

        binaryString =
            atob(
                base64Data
            );

    } catch (error) {

        console.error(
            "ไม่สามารถแปลง PDF Base64:",
            error
        );


        throw new Error(
            "ข้อมูล PDF จาก Backend ไม่ถูกต้อง"
        );

    }


    // ==================================================
    // CONVERT TO BYTE ARRAY
    // ==================================================

    const length =
        binaryString.length;


    const bytes =
        new Uint8Array(
            length
        );


    for (
        let index = 0;
        index < length;
        index++
    ) {

        bytes[index] =
            binaryString.charCodeAt(
                index
            );

    }


    // ==================================================
    // CREATE PDF BLOB
    // ==================================================

    const blob =
        new Blob(
            [
                bytes
            ],
            {
                type:
                    "application/pdf"
            }
        );


    // ==================================================
    // FILE NAME
    // ==================================================

    let downloadName =
        fileName ||
        "FM-OP-11.pdf";


    if (
        !String(
            downloadName
        )
            .toLowerCase()
            .endsWith(
                ".pdf"
            )
    ) {

        downloadName +=
            ".pdf";

    }


    // ==================================================
    // CREATE DOWNLOAD URL
    // ==================================================

    const url =
        URL.createObjectURL(
            blob
        );


    // ==================================================
    // CREATE DOWNLOAD LINK
    // ==================================================

    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        downloadName;


    link.style.display =
        "none";


    document.body.appendChild(
        link
    );


    // ==================================================
    // START DOWNLOAD
    // ==================================================

    link.click();


    // ==================================================
    // CLEANUP
    // ==================================================

    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );


            if (
                link.parentNode
            ) {

                link.parentNode.removeChild(
                    link
                );

            }

        },
        1000
    );


    console.log(
        "ดาวน์โหลด PDF FM-OP-11 แล้ว:",
        downloadName
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
            window.fmop11SelectedRecords
        ) ||
        window.fmop11SelectedRecords.length === 0
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
        window.fmop11SelectedRecords.length > 14
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
    //
    // ตรวจเฉพาะว่ามี Session อยู่หรือไม่
    //
    // ไม่ส่งชื่อหรือ Email เข้า Generate API
    //
    // apiGenerateFMOP11()
    // จะอ่าน Current User จาก api.js
    // และส่ง requesterEmail ให้ Backend
    // ==================================================

    const user =
        getCurrentGGNUser();


    if (
        !user ||
        !user.email
    ) {

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
        window.fmop11SelectedRecords.find(
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
            window.fmop11SelectedRecords
        );


        // ==================================================
        // API
        // ==================================================
        //
        // สำคัญ:
        //
        // ส่งเฉพาะ records
        //
        // requesterEmail จะถูกเติมใน api.js
        // จาก Current User
        //
        // Backend จะเป็นผู้ตรวจสอบสิทธิ์
        // ==================================================

        const data =
            await apiGenerateFMOP11(
                window.fmop11SelectedRecords
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
        // CHECK PDF
        // ==================================================

        if (
            !data.pdfBase64
        ) {

            if (status) {

                status.textContent =
                    "สร้างเอกสารสำเร็จ แต่ไม่พบไฟล์ PDF";

            }


            console.error(
                "Backend แจ้งว่าสร้างสำเร็จ แต่ไม่มี pdfBase64:",
                data
            );


            alert(
                "สร้างเอกสาร FM-OP-11 สำเร็จ\n\n" +
                "แต่ระบบไม่ได้รับไฟล์ PDF กลับมา\n\n" +
                "กรุณาตรวจสอบ Backend"
            );


            return;

        }


        // ==================================================
        // DOWNLOAD PDF
        // ==================================================

        if (status) {

            status.textContent =
                "กำลังเตรียมไฟล์ PDF สำหรับดาวน์โหลด...";

        }


        const pdfFileName =
            data.pdfFileName ||
            data.fileName ||
            "FM-OP-11.pdf";


        downloadFMOP11PDF(
            data.pdfBase64,
            pdfFileName
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        if (status) {

            status.textContent =
                "สร้าง FM-OP-11 และดาวน์โหลด PDF สำเร็จ";

        }


        console.log(
            "สร้าง FM-OP-11 และดาวน์โหลด PDF สำเร็จ:",
            {
                documentNo:
                    data.documentNo,

                fileId:
                    data.fileId,

                fileUrl:
                    data.fileUrl,

                fileName:
                    data.fileName,

                pdfFileName:
                    data.pdfFileName,

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
                      " จุด\n"
                    : ""
            ) +
            "\n" +
            "ระบบดาวน์โหลด PDF ลงเครื่องแล้ว"
        );


        // ==================================================
        // CLEAR SELECTION
        // ==================================================

        clearFMOP11Selection();


    } catch (error) {

        console.error(
            "สร้าง FM-OP-11 ไม่สำเร็จ:",
            error
        );


        if (status) {

            status.textContent =
                "สร้าง FM-OP-11 ไม่สำเร็จ";

        }


        alert(
            "สร้างเอกสาร FM-OP-11 ไม่สำเร็จ\n\n" +
            "สาเหตุ: " +
            (
                error &&
                error.message
                    ? error.message
                    : "ไม่สามารถสร้างหรือดาวน์โหลดไฟล์ PDF ได้"
            ) +
            "\n\nกรุณาตรวจสอบการเชื่อมต่อ แล้วลองใหม่อีกครั้ง"
        );


    } finally {

        // ==================================================
        // RESTORE BUTTON
        // ==================================================

        if (generateButton) {

            generateButton.disabled =
                !Array.isArray(
                    window.fmop11SelectedRecords
                ) ||
                window.fmop11SelectedRecords.length ===
                    0;


            generateButton.textContent =
                "📄 สร้าง FM-OP-11";

        }

    }

}


// ======================================================
// END FM-OP-11
// ======================================================