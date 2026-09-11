
// ======================================================
// GGN DOCS
// INSPECTION SYSTEM
// ======================================================



// ======================================================
// SETUP INSPECTION
// ======================================================

function setupInspections() {

    const saveButton =
        document.getElementById(
            "save-inspection-button"
        );


    const resetButton =
        document.getElementById(
            "reset-inspection-button"
        );


    // ----------------------------------------
    // SAVE BUTTON
    // ----------------------------------------

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveInspection
        );

    }


    // ----------------------------------------
    // RESET BUTTON
    // ----------------------------------------

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetInspectionForm
        );

    }


    // ----------------------------------------
    // OTHER INSPECTION PAGE EVENTS
    // ----------------------------------------

    if (
        typeof setupInspectionPageEvents ===
        "function"
    ) {

        setupInspectionPageEvents();

    }

}



// ======================================================
// INITIALIZE INSPECTION PAGE
// ======================================================

async function initializeInspectionPage() {

    console.log(
        "กำลังเตรียมหน้า การตรวจ ISO..."
    );


    // ----------------------------------------
    // DEFAULT DATE / TIME
    // ----------------------------------------

    setDefaultInspectionDateTime();


    // ----------------------------------------
    // LOAD SETTINGS
    // ----------------------------------------

    if (
        !inspectionSettingsLoaded
    ) {

        console.log(
            "กำลังโหลด Inspection Settings..."
        );


        await loadInspectionSettings();


        inspectionSettingsLoaded =
            true;


    } else {

        // ----------------------------------------
        // SETTINGS ALREADY LOADED
        // ----------------------------------------

        renderInspectionZones();

        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();

    }


    // ----------------------------------------
    // UPDATE FORM MODE
    // ----------------------------------------

    updateInspectionFormMode();


    console.log(
        "เตรียมหน้าการตรวจเรียบร้อย"
    );

}



// ======================================================
// DEFAULT DATE / TIME
// ======================================================

function setDefaultInspectionDateTime() {

    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    const now =
        new Date();


    // ----------------------------------------
    // DATE
    // ----------------------------------------

    if (
        dateInput &&
        !dateInput.value
    ) {

        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        dateInput.value =
            `${year}-${month}-${day}`;

    }


    // ----------------------------------------
    // TIME
    // ----------------------------------------

    if (
        timeInput &&
        !timeInput.value
    ) {

        const hours =
            String(
                now.getHours()
            ).padStart(
                2,
                "0"
            );


        const minutes =
            String(
                now.getMinutes()
            ).padStart(
                2,
                "0"
            );


        timeInput.value =
            `${hours}:${minutes}`;

    }

}



// ======================================================
// LOAD INSPECTIONS
// ======================================================

async function loadInspections() {

    try {

        console.log(
            "กำลังโหลดข้อมูล Inspections..."
        );


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
                                "getInspections"

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "getInspections response:",
            data
        );


        // ----------------------------------------
        // CHECK RESPONSE
        // ----------------------------------------

        if (
            !data.success
        ) {

            console.error(
                "ไม่สามารถโหลด Inspections:",
                data.message
            );


            inspectionRecords =
                [];


            return;

        }


        // ----------------------------------------
        // STORE INSPECTION RECORDS
        // ----------------------------------------

        inspectionRecords =
            Array.isArray(
                data.inspections
            )
                ? data.inspections
                : [];


        console.log(
            "โหลด Inspections สำเร็จ:",
            inspectionRecords
        );


        console.log(
            "จำนวนรายการตรวจ:",
            inspectionRecords.length
        );


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการโหลด Inspections:",
            error
        );


        inspectionRecords =
            [];

    }

}



// ======================================================
// RENDER INSPECTION ZONES
// ======================================================

function renderInspectionZones() {

    const select =
        document.getElementById(
            "inspection-zone"
        );


    if (!select) {

        console.warn(
            "ไม่พบ #inspection-zone"
        );

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกเขต --
        </option>

    `;


    if (
        !Array.isArray(
            inspectionZones
        )
    ) {

        console.warn(
            "inspectionZones ไม่ใช่ Array:",
            inspectionZones
        );

        return;

    }


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


            const zoneName =
                zone.settingName ||
                zone.name ||
                zone.settingValue ||
                zone.zone ||
                "";


            if (!zoneName) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                zoneName;


            option.textContent =
                zoneName;


            select.appendChild(
                option
            );

        }
    );


    console.log(
        "โหลดเขตตรวจสำเร็จ:",
        inspectionZones
    );

}



// ======================================================
// RENDER INSPECTION LOCATIONS
// ======================================================

function renderInspectionLocations() {

    const select =
        document.getElementById(
            "inspection-location"
        );


    if (!select) {

        console.warn(
            "ไม่พบ #inspection-location"
        );

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกจุดตรวจ --
        </option>

    `;


    inspectionLocations.forEach(
        function (
            location
        ) {

            if (!location) {

                return;

            }


            if (
                location.status &&
                String(
                    location.status
                ).toLowerCase()
                !==
                "active"
            ) {

                return;

            }


            const locationName =
                location.settingName ||
                location.name ||
                location.settingValue ||
                location.locationName ||
                "";


            if (!locationName) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                locationName;


            option.textContent =
                locationName;


            select.appendChild(
                option
            );

        }
    );

}



// ======================================================
// RENDER INSPECTION INSPECTORS
// ======================================================

function renderInspectionInspectors() {

    const select =
        document.getElementById(
            "inspection-inspector"
        );


    if (!select) {

        console.warn(
            "ไม่พบ #inspection-inspector"
        );

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกผู้ตรวจ --
        </option>

    `;


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


            const inspectorName =
                inspector.settingName ||
                inspector.name ||
                inspector.settingValue ||
                inspector.inspectorName ||
                "";


            if (!inspectorName) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                inspectorName;


            option.textContent =
                inspectorName;


            select.appendChild(
                option
            );

        }
    );

}



// ======================================================
// RENDER INSPECTION ITEMS
// ======================================================

function renderInspectionItems() {

    const container =
        document.getElementById(
            "inspection-items"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(
            inspectionItems
        ) ||
        inspectionItems.length === 0
    ) {

        container.innerHTML = `

            <div class="inspection-empty">

                <div>
                    📋
                </div>

                <strong>
                    ยังไม่มีรายการตรวจ
                </strong>

                <span>
                    ไม่พบรายการตรวจในระบบ
                </span>

            </div>

        `;


        return;

    }


    const sortedItems =
        [...inspectionItems]
            .sort(
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


    container.innerHTML =
        "";


    sortedItems.forEach(
        function (
            item,
            index
        ) {

            const itemNumber =
                item.sortOrder ||
                item.itemNo ||
                item.no ||
                index + 1;


            const itemText =
                item.settingName ||
                item.name ||
                item.item ||
                item.description ||
                "";


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "inspection-item";


            row.dataset.itemNo =
                itemNumber;


            row.innerHTML = `

                <div class="inspection-item-header">

                    <div class="inspection-item-number">

                        ${escapeHTML(
                            itemNumber
                        )}

                    </div>


                    <div class="inspection-item-text">

                        ${escapeHTML(
                            itemText
                        )}

                    </div>

                </div>


                <div class="inspection-result-group">

                    <label
                        class="inspection-result-option"
                    >

                        <input
                            type="radio"
                            name="inspection-result-${escapeHTML(
                                itemNumber
                            )}"
                            value="ผ่าน"
                        >

                        <span>
                            ผ่าน
                        </span>

                    </label>


                    <label
                        class="inspection-result-option"
                    >

                        <input
                            type="radio"
                            name="inspection-result-${escapeHTML(
                                itemNumber
                            )}"
                            value="ไม่ผ่าน"
                        >

                        <span>
                            ไม่ผ่าน
                        </span>

                    </label>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );


    // ----------------------------------------
    // REMARK + SOLUTION
    // ----------------------------------------

    const additionalSection =
        document.createElement(
            "div"
        );


    additionalSection.className =
        "inspection-additional";


    additionalSection.innerHTML = `

        <div class="inspection-remark-group">

            <label
                for="inspection-remark"
            >
                หมายเหตุ
            </label>


            <textarea
                id="inspection-remark"
                class="inspection-remark"
                rows="3"
                placeholder="ระบุหมายเหตุ (ถ้ามี)"
            ></textarea>

        </div>


        <div class="inspection-solution-group">

            <label
                for="inspection-solution"
            >
                แนวทางแก้ไข
            </label>


            <textarea
                id="inspection-solution"
                class="inspection-solution"
                rows="3"
                placeholder="ระบุแนวทางแก้ไข (ถ้ามี)"
            ></textarea>

        </div>

    `;


    container.appendChild(
        additionalSection
    );

}



// ======================================================
// COLLECT INSPECTION ITEMS
// ======================================================

function collectInspectionItems() {

    const container =
        document.getElementById(
            "inspection-items"
        );


    if (!container) {

        return [];

    }


    const rows =
        container.querySelectorAll(
            ".inspection-item"
        );


    const result =
        [];


    rows.forEach(
        function (
            row
        ) {

            const itemNo =
                row.dataset.itemNo;


            const resultInput =
                row.querySelector(
                    'input[type="radio"]:checked'
                );


            const itemText =
                row.querySelector(
                    ".inspection-item-text"
                );


            result.push({

                itemNo:
                    itemNo,

                item:
                    itemText
                        ? itemText.textContent.trim()
                        : "",

                result:
                    resultInput
                        ? resultInput.value
                        : ""

            });

        }
    );


    return result;

}



// ======================================================
// COLLECT REMARK
// ======================================================

function collectInspectionRemark() {

    const input =
        document.getElementById(
            "inspection-remark"
        );


    if (!input) {

        return "";

    }


    return input.value.trim();

}



// ======================================================
// COLLECT SOLUTION
// ======================================================

function collectInspectionSolution() {

    const input =
        document.getElementById(
            "inspection-solution"
        );


    if (!input) {

        return "";

    }


    return input.value.trim();

}



// ======================================================
// VALIDATE INSPECTION FORM
// ======================================================

function validateInspectionForm() {

    const inspectionDate =
        document.getElementById(
            "inspection-date"
        );


    const inspectionTime =
        document.getElementById(
            "inspection-time"
        );


    const location =
        document.getElementById(
            "inspection-location"
        );


    const inspector =
        document.getElementById(
            "inspection-inspector"
        );


    if (
        !inspectionDate ||
        !inspectionDate.value
    ) {

        alert(
            "กรุณาเลือกวันที่ตรวจ"
        );


        return false;

    }


    if (
        !inspectionTime ||
        !inspectionTime.value
    ) {

        alert(
            "กรุณาเลือกเวลาตรวจ"
        );


        return false;

    }


    if (
        !location ||
        !location.value
    ) {

        alert(
            "กรุณาเลือกจุดตรวจ"
        );


        return false;

    }


    if (
        !inspector ||
        !inspector.value
    ) {

        alert(
            "กรุณาเลือกผู้ตรวจ"
        );


        return false;

    }


    const items =
        collectInspectionItems();


    if (
        items.length === 0
    ) {

        alert(
            "ไม่พบรายการตรวจ"
        );


        return false;

    }


    const incomplete =
        items.find(
            function (
                item
            ) {

                return !item.result;

            }
        );


    if (incomplete) {

        alert(
            "กรุณาเลือกผลการตรวจให้ครบทุกข้อ"
        );


        return false;

    }


    return true;

}



// ======================================================
// GENERATE RECORD ID
// ======================================================

function generateRecordId() {

    if (
        window.crypto &&
        typeof crypto.randomUUID ===
        "function"
    ) {

        return crypto.randomUUID();

    }


    return (

        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2)

    );

}



// ======================================================
// UPDATE FORM MODE
// ======================================================

function updateInspectionFormMode() {

    const saveButton =
        document.getElementById(
            "save-inspection-button"
        );


    if (!saveButton) {

        return;

    }


    if (
        inspectionMode ===
        "edit"
    ) {

        saveButton.textContent =
            "บันทึกการแก้ไข";

    } else {

        saveButton.textContent =
            "บันทึกการตรวจ";

    }

}



// ======================================================
// SAVE / UPDATE INSPECTION
// ======================================================

async function saveInspection() {

    // ----------------------------------------
    // VALIDATE
    // ----------------------------------------

    if (
        !validateInspectionForm()
    ) {

        return;

    }


    // ----------------------------------------
    // CURRENT USER
    // ----------------------------------------

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );


        return;

    }


    // ----------------------------------------
    // FORM INPUTS
    // ----------------------------------------

    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    const zoneInput =
        document.getElementById(
            "inspection-zone"
        );


    const locationInput =
        document.getElementById(
            "inspection-location"
        );


    const inspectorInput =
        document.getElementById(
            "inspection-inspector"
        );


    const saveButton =
        document.getElementById(
            "save-inspection-button"
        );


    // ----------------------------------------
    // RECORD ID
    // ----------------------------------------

    let recordId;


    if (
        inspectionMode ===
        "edit" &&
        editingInspectionRecordId
    ) {

        // ใช้ ID เดิม
        recordId =
            editingInspectionRecordId;

    } else {

        // สร้าง ID ใหม่เฉพาะตอนสร้างรายการใหม่
        recordId =
            generateRecordId();

    }


    // ----------------------------------------
    // COLLECT DATA
    // ----------------------------------------

    const items =
        collectInspectionItems();


    const remark =
        collectInspectionRemark();


    const solution =
        collectInspectionSolution();


    // ----------------------------------------
    // PRESERVE ORIGINAL DATA
    // ----------------------------------------

    const original =
        editingInspectionData || {};


    // ----------------------------------------
    // INSPECTION DATA
    // ----------------------------------------

    const inspectionData = {

        recordId:
            recordId,

        inspectionDate:
            dateInput.value,

        inspectionTime:
            timeInput.value,

        zone:
            zoneInput
                ? zoneInput.value
                : "",

        locationName:
            locationInput.value,

        inspectorName:
            inspectorInput.value,

        remark:
            remark,

        solution:
            solution,

        documentCode:
            original.documentCode ||
            "FM-OP-11",

        documentName:
            original.documentName ||
            "รายงานการตรวจจุดพนักงานรักษาความปลอดภัย",

        documentNo:
            original.documentNo ||
            "",

        items:
            items,

        // ----------------------------------------
        // CREATE MODE
        // ----------------------------------------

        createdBy:
            original.createdBy ||
            user.name ||
            "",

        createdByEmail:
            original.createdByEmail ||
            user.email ||
            "",

        // ----------------------------------------
        // UPDATE MODE
        // ----------------------------------------

        updatedBy:
            user.name ||
            "",

        updatedByEmail:
            user.email ||
            ""

    };


    console.log(
        "ข้อมูลการตรวจที่จะบันทึก:",
        inspectionData
    );


    // ----------------------------------------
    // DISABLE SAVE BUTTON
    // ----------------------------------------

    if (saveButton) {

        saveButton.disabled =
            true;


        saveButton.textContent =
            inspectionMode === "edit"
                ? "กำลังบันทึกการแก้ไข..."
                : "กำลังบันทึก...";

    }


    // ----------------------------------------
    // SAVE TO DATABASE
    // ----------------------------------------

    try {

        let data;


        // ========================================
        // EDIT
        // ========================================

        if (
            inspectionMode ===
            "edit"
        ) {

            console.log(
                "กำลังอัปเดตรายการตรวจ:",
                recordId
            );


            data =
                await apiUpdateInspection(
                    inspectionData
                );

        }


        // ========================================
        // CREATE
        // ========================================

        else {

            console.log(
                "กำลังสร้างรายการตรวจใหม่:",
                recordId
            );


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
                                    "saveInspection",

                                inspection:
                                    inspectionData

                            })

                    }

                );


            data =
                await response.json();

        }


        console.log(
            "ผลการบันทึกการตรวจ:",
            data
        );


        // ----------------------------------------
        // SAVE SUCCESS
        // ----------------------------------------

        if (
            data.success
        ) {

            // ----------------------------------------
            // EDIT SUCCESS
            // ----------------------------------------

            if (
                inspectionMode ===
                "edit"
            ) {

                alert(
                    "แก้ไขรายการตรวจเรียบร้อยแล้ว"
                );


                // ----------------------------------------
                // CLEAR EDIT STATE
                // ----------------------------------------

                resetInspectionForm();


                // ----------------------------------------
                // OPEN LIST
                // ----------------------------------------

                showPage(
                    "inspection-records"
                );

            }


            // ----------------------------------------
            // CREATE SUCCESS
            // ----------------------------------------

            else {

                resetInspectionForm();

                showInspectionSuccessPopup();

            }


        } else {

            alert(

                data.message ||
                "ไม่สามารถบันทึกการตรวจได้"

            );

        }


    } catch (error) {

        console.error(
            "บันทึกการตรวจไม่สำเร็จ:",
            error
        );


        alert(
            "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
        );


    } finally {

        // ----------------------------------------
        // RESTORE SAVE BUTTON
        // ----------------------------------------

        if (saveButton) {

            saveButton.disabled =
                false;

            updateInspectionFormMode();

        }

    }

}



// ======================================================
// LOAD INSPECTION FOR EDIT
// ======================================================

async function loadInspectionForEdit(
    recordId
) {

    if (!recordId) {

        alert(
            "ไม่พบรหัสรายการตรวจ"
        );

        return false;

    }


    try {

        console.log(
            "กำลังโหลดรายการตรวจเพื่อแก้ไข:",
            recordId
        );


        const data =
            await apiGetInspection(
                recordId
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
                    : "ไม่พบข้อมูลรายการตรวจ"

            );


            return false;

        }


        const inspection =
            data.inspection;


        // ----------------------------------------
        // STORE EDIT STATE
        // ----------------------------------------

        editingInspectionRecordId =
            inspection.recordId;

        editingInspectionData =
            inspection;

        inspectionMode =
            "edit";


        console.log(
            "ข้อมูลรายการตรวจสำหรับแก้ไข:",
            inspection
        );


        // ----------------------------------------
        // OPEN INSPECTION PAGE
        // ----------------------------------------

        showPage(
            "inspection-record"
        );


        // ----------------------------------------
        // INITIALIZE FORM
        // ----------------------------------------

        await initializeInspectionPage();


        // ----------------------------------------
        // FILL FORM
        // ----------------------------------------

        populateInspectionForm(
            inspection
        );


        return true;

    } catch (error) {

        console.error(
            "โหลดรายการตรวจเพื่อแก้ไขไม่สำเร็จ:",
            error
        );


        alert(
            "ไม่สามารถโหลดข้อมูลรายการตรวจได้"
        );


        return false;

    }

}



// ======================================================
// POPULATE INSPECTION FORM
// ======================================================

function populateInspectionForm(
    inspection
) {

    if (!inspection) {

        return;

    }


    // ----------------------------------------
    // DATE
    // ----------------------------------------

    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    if (dateInput) {

        dateInput.value =
            inspection.inspectionDate ||
            "";

    }


    // ----------------------------------------
    // TIME
    // ----------------------------------------

    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    if (timeInput) {

        timeInput.value =
            inspection.inspectionTime ||
            "";

    }


    // ----------------------------------------
    // ZONE
    // ----------------------------------------

    const zoneInput =
        document.getElementById(
            "inspection-zone"
        );


    if (zoneInput) {

        zoneInput.value =
            inspection.zone ||
            "";

    }


    // ----------------------------------------
    // LOCATION
    // ----------------------------------------

    const locationInput =
        document.getElementById(
            "inspection-location"
        );


    if (locationInput) {

        locationInput.value =
            inspection.locationName ||
            "";

    }


    // ----------------------------------------
    // INSPECTOR
    // ----------------------------------------

    const inspectorInput =
        document.getElementById(
            "inspection-inspector"
        );


    if (inspectorInput) {

        inspectorInput.value =
            inspection.inspectorName ||
            "";

    }


    // ----------------------------------------
    // ITEMS
    // ----------------------------------------

    const savedItems =
        Array.isArray(
            inspection.items
        )
            ? inspection.items
            : [];


    const rows =
        document.querySelectorAll(
            "#inspection-items .inspection-item"
        );


    rows.forEach(
        function (
            row
        ) {

            const itemNo =
                String(
                    row.dataset.itemNo
                );


            const savedItem =
                savedItems.find(
                    function (
                        item
                    ) {

                        return (
                            String(
                                item.itemNo
                            ) ===
                            itemNo
                        );

                    }
                );


            if (!savedItem) {

                return;

            }


            const radios =
                row.querySelectorAll(
                    'input[type="radio"]'
                );


            radios.forEach(
                function (
                    radio
                ) {

                    radio.checked =
                        radio.value ===
                        savedItem.result;

                }
            );

        }
    );


    // ----------------------------------------
    // REMARK
    // ----------------------------------------

    const remark =
        document.getElementById(
            "inspection-remark"
        );


    if (remark) {

        remark.value =
            inspection.remark ||
            "";

    }


    // ----------------------------------------
    // SOLUTION
    // ----------------------------------------

    const solution =
        document.getElementById(
            "inspection-solution"
        );


    if (solution) {

        solution.value =
            inspection.solution ||
            "";

    }


    // ----------------------------------------
    // UPDATE BUTTON
    // ----------------------------------------

    updateInspectionFormMode();


    console.log(
        "เติมข้อมูลรายการตรวจลงในฟอร์มเรียบร้อย"
    );

}



// ======================================================
// INSPECTION SUCCESS POPUP
// ======================================================

function showInspectionSuccessPopup() {

    const content = `

        <div class="inspection-success-popup">

            <div class="inspection-success-icon">
                ✓
            </div>

            <div class="inspection-success-title">
                บันทึกสำเร็จ
            </div>

            <div class="inspection-success-message">
                บันทึกข้อมูลการตรวจเรียบร้อยแล้ว
            </div>


            <div class="inspection-success-actions">

                <button
                    type="button"
                    class="popup-button popup-button-secondary"
                    onclick="openInspectionListFromPopup()"
                >
                    ดูรายการตรวจ
                </button>


                <button
                    type="button"
                    class="popup-button popup-button-primary"
                    onclick="continueInspectionFromPopup()"
                >
                    ตรวจต่อ
                </button>

            </div>

        </div>

    `;


    openPopup(
        content,
        {
            title: "บันทึกการตรวจ",
            size: "small"
        }
    );

}



// ======================================================
// SUCCESS POPUP → INSPECTION LIST
// ======================================================

function openInspectionListFromPopup() {

    closePopup();


    console.log(
        "เปิดหน้ารายการตรวจ"
    );


    showPage(
        "inspection-records"
    );

}



// ======================================================
// SUCCESS POPUP → CONTINUE INSPECTION
// ======================================================

function continueInspectionFromPopup() {

    closePopup();


    console.log(
        "ตรวจรายการถัดไป"
    );


    showPage(
        "inspection-record"
    );


    resetInspectionForm();

}



// ======================================================
// RESET INSPECTION FORM
// ======================================================

function resetInspectionForm() {

    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    const zoneInput =
        document.getElementById(
            "inspection-zone"
        );


    const locationInput =
        document.getElementById(
            "inspection-location"
        );


    const inspectorInput =
        document.getElementById(
            "inspection-inspector"
        );


    // ----------------------------------------
    // CLEAR EDIT STATE
    // ----------------------------------------

    editingInspectionRecordId =
        null;

    editingInspectionData =
        null;

    inspectionMode =
        "create";


    // ----------------------------------------
    // RESET ZONE
    // ----------------------------------------

    if (zoneInput) {

        zoneInput.value =
            "";

    }


    // ----------------------------------------
    // RESET LOCATION
    // ----------------------------------------

    if (locationInput) {

        locationInput.value =
            "";

    }


    // ----------------------------------------
    // RESET INSPECTOR
    // ----------------------------------------

    if (inspectorInput) {

        inspectorInput.value =
            "";

    }


    // ----------------------------------------
    // RESET RADIO BUTTONS
    // ----------------------------------------

    const resultInputs =
        document.querySelectorAll(
            "#inspection-items input[type='radio']"
        );


    resultInputs.forEach(
        function (
            input
        ) {

            input.checked =
                false;

        }
    );


    // ----------------------------------------
    // RESET REMARK
    // ----------------------------------------

    const remark =
        document.getElementById(
            "inspection-remark"
        );


    if (remark) {

        remark.value =
            "";

    }


    // ----------------------------------------
    // RESET SOLUTION
    // ----------------------------------------

    const solution =
        document.getElementById(
            "inspection-solution"
        );


    if (solution) {

        solution.value =
            "";

    }


    // ----------------------------------------
    // RESET DATE
    // ----------------------------------------

    if (dateInput) {

        dateInput.value =
            "";

    }


    // ----------------------------------------
    // RESET TIME
    // ----------------------------------------

    if (timeInput) {

        timeInput.value =
            "";

    }


    // ----------------------------------------
    // SET DEFAULT DATE / TIME
    // ----------------------------------------

    setDefaultInspectionDateTime();


    // ----------------------------------------
    // UPDATE FORM MODE
    // ----------------------------------------

    updateInspectionFormMode();


    console.log(
        "ล้างข้อมูลการตรวจแล้ว"
    );

}



// ======================================================
// END INSPECTION SYSTEM
// ======================================================