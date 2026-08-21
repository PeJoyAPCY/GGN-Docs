// LOAD INSPECTIONS
// ========================================

async function loadInspections() {

    try {

        console.log(
            "กำลังโหลดข้อมูล Inspections..."
        );


        const response =
            await apiFetch(
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        action: "getInspections"
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "getInspections response:",
            data
        );


        if (
            !data.success
        ) {

            console.error(
                "ไม่สามารถโหลด Inspections:",
                data.message
            );

            inspectionRecords = [];

            return;

        }


        // ------------------------------------
        // เก็บข้อมูล Inspections
        // ------------------------------------

        inspectionRecords =
            Array.isArray(data.data)
                ? data.data
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


        inspectionRecords = [];

    }

}

// ========================================
// SETUP INSPECTIONS
// ========================================

function setupInspections() {

    console.log(
        "กำลังเริ่มต้นระบบ Inspections..."
    );


    const saveButton =
        document.getElementById(
            "save-inspection-button"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveInspection
        );

    }


    loadInspections();

}

// ========================================
// RENDER ZONE
// ========================================

function renderInspectionZones() {

    const select =
        document.getElementById(
            "inspection-zone"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            -- เลือกเขต --
        </option>

    `;


    const zones = [];


    inspectionLocations.forEach(
        function (
            location
        ) {

            if (!location) {

                return;

            }


            const zone =
                location.zone ||
                location.settingZone ||
                "";


            if (
                zone &&
                !zones.includes(
                    zone
                )
            ) {

                zones.push(
                    zone
                );

            }

        }
    );


    zones.sort();


    zones.forEach(
        function (
            zone
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                zone;


            option.textContent =
                zone;


            select.appendChild(
                option
            );

        }
    );

}


// ========================================
// RENDER LOCATIONS
// ========================================

function renderInspectionLocations() {

    const select =
        document.getElementById(
            "inspection-location"
        );


    if (!select) {

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


    renderInspectionZones();

}


// ========================================
// RENDER INSPECTORS
// ========================================

function renderInspectionInspectors() {

    const select =
        document.getElementById(
            "inspection-inspector"
        );


    if (!select) {

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


// ========================================
// RENDER INSPECTION ITEMS
// ========================================

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


                    return aNo - bNo;

                }
            );


    container.innerHTML = "";


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


// ========================================
// COLLECT INSPECTION ITEMS
// ========================================

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


// ========================================
// COLLECT REMARK
// ========================================

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


// ========================================
// COLLECT SOLUTION
// ========================================

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


// ========================================
// VALIDATE INSPECTION FORM
// ========================================

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


// ========================================
// GENERATE RECORD ID
// ========================================

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


// ========================================
// SAVE INSPECTION
// ========================================

async function saveInspection() {

    if (
        !validateInspectionForm()
    ) {

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


    const recordId =
        generateRecordId();


    const items =
        collectInspectionItems();


    const remark =
        collectInspectionRemark();


    const solution =
        collectInspectionSolution();


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
            "FM-OP-11",

        documentName:
            "รายงานการตรวจจุดพนักงานรักษาความปลอดภัย",

        items:
            items,

        createdBy:
            user.name ||
            "",

        createdByEmail:
            user.email ||
            ""

    };


    console.log(
        "ข้อมูลการตรวจที่จะบันทึก:",
        inspectionData
    );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "กำลังบันทึก...";

    }


    try {

        const response =
            await apiFetch(
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


        const data =
            await response.json();


        console.log(
            "ผลการบันทึกการตรวจ:",
            data
        );


        if (data.success) {

            alert(
                "บันทึกการตรวจสำเร็จ"
            );


            resetInspectionForm();

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

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "บันทึกการตรวจ";

        }

    }

}


// ========================================
// RESET INSPECTION FORM
// ========================================

function resetInspectionForm() {

    const dateInput =
        document.getElementById(
            "inspection-date"
        );


    const timeInput =
        document.getElementById(
            "inspection-time"
        );


    const locationInput =
        document.getElementById(
            "inspection-location"
        );


    const inspectorInput =
        document.getElementById(
            "inspection-inspector"
        );


    if (locationInput) {

        locationInput.value =
            "";

    }


    if (inspectorInput) {

        inspectorInput.value =
            "";

    }


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


    const remark =
        document.getElementById(
            "inspection-remark"
        );


    if (remark) {

        remark.value =
            "";

    }


    const solution =
        document.getElementById(
            "inspection-solution"
        );


    if (solution) {

        solution.value =
            "";

    }


    if (dateInput) {

        dateInput.value =
            "";

    }


    if (timeInput) {

        timeInput.value =
            "";

    }


    setDefaultInspectionDateTime();


    console.log(
        "ล้างข้อมูลการตรวจแล้ว"
    );

}


// ======================================================
