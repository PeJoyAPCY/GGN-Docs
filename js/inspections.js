// ======================================================
// GGN DOCS
// INSPECTIONS
// ======================================================
// หน้าที่:
// - แสดงฟอร์มการตรวจ ISO
// - โหลด Location / Zone / Inspector / Inspection Items
// - บันทึกข้อมูลการตรวจ
// - รองรับ FM-OP-11
// ======================================================


// ======================================================
// SETUP INSPECTION
// ======================================================

function setupInspections() {

    console.log(
        "กำลังเตรียมระบบ Inspections..."
    );


    // ==================================================
    // SAVE BUTTON
    // ==================================================

    const saveButton =
        document.getElementById(
            "save-inspection-button"
        );


    if (
        saveButton &&
        !saveButton.dataset.bound
    ) {

        saveButton.addEventListener(
            "click",
            saveInspection
        );


        saveButton.dataset.bound =
            "true";

    }


    // ==================================================
    // RESET BUTTON
    // ==================================================

    const resetButton =
        document.getElementById(
            "reset-inspection-button"
        );


    if (
        resetButton &&
        !resetButton.dataset.bound
    ) {

        resetButton.addEventListener(
            "click",
            resetInspectionForm
        );


        resetButton.dataset.bound =
            "true";

    }


    // ==================================================
    // PAGE EVENTS
    // ==================================================

    if (
        typeof setupInspectionPageEvents ===
        "function"
    ) {

        setupInspectionPageEvents();

    }


    console.log(
        "ระบบ Inspections พร้อมใช้งาน"
    );

}


// ======================================================
// INITIALIZE INSPECTION PAGE
// ======================================================

async function initializeInspectionPage() {

    console.log(
        "กำลังเตรียมหน้า การตรวจ ISO..."
    );


    // ==================================================
    // DEFAULT DATE / TIME
    // ==================================================

    setDefaultInspectionDateTime();


    // ==================================================
    // LOAD SETTINGS
    // ==================================================

    if (
        typeof inspectionSettingsLoaded ===
        "undefined"
    ) {

        console.warn(
            "ไม่พบตัวแปร inspectionSettingsLoaded"
        );

    }


    if (
        !inspectionSettingsLoaded
    ) {

        const loaded =
            await loadInspectionSettings();


        if (loaded) {

            inspectionSettingsLoaded =
                true;

        }

    } else {

        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();

    }


    console.log(
        "หน้า Inspections พร้อมใช้งาน"
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


    // ==================================================
    // DATE
    // ==================================================

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


    // ==================================================
    // TIME
    // ==================================================

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
// LOAD INSPECTION SETTINGS
// ======================================================

async function loadInspectionSettings() {

    console.log(
        "กำลังโหลดข้อมูล Inspection Settings..."
    );


    // ==================================================
    // CHECK API HELPER
    // ==================================================

    if (
        typeof apiGetSettings !==
        "function"
    ) {

        console.error(
            "ไม่พบฟังก์ชัน apiGetSettings()"
        );


        return false;

    }


    try {

        // ==================================================
        // LOCATION
        // ==================================================

        const locationData =
            await apiGetSettings(
                "location"
            );


        console.log(
            "Location Settings:",
            locationData
        );


        if (
            locationData &&
            locationData.success &&
            Array.isArray(
                locationData.settings
            )
        ) {

            inspectionLocations =
                locationData.settings;

        } else {

            inspectionLocations =
                [];

        }


        // ==================================================
        // INSPECTOR
        // ==================================================

        const inspectorData =
            await apiGetSettings(
                "inspector"
            );


        console.log(
            "Inspector Settings:",
            inspectorData
        );


        if (
            inspectorData &&
            inspectorData.success &&
            Array.isArray(
                inspectorData.settings
            )
        ) {

            inspectionInspectors =
                inspectorData.settings;

        } else {

            inspectionInspectors =
                [];

        }


        // ==================================================
        // INSPECTION ITEMS
        // ==================================================

        const itemData =
            await apiGetSettings(
                "inspectionItem"
            );


        console.log(
            "Inspection Item Settings:",
            itemData
        );


        if (
            itemData &&
            itemData.success &&
            Array.isArray(
                itemData.settings
            )
        ) {

            inspectionItems =
                itemData.settings;

        } else {

            inspectionItems =
                [];

        }


        // ==================================================
        // RENDER
        // ==================================================

        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();


        console.log(
            "โหลด Inspection Settings สำเร็จ"
        );


        return true;


    } catch (error) {

        console.error(
            "โหลด Inspection Settings ไม่สำเร็จ:",
            error
        );


        inspectionLocations =
            [];


        inspectionInspectors =
            [];


        inspectionItems =
            [];


        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();


        return false;

    }

}


// ======================================================
// LOAD INSPECTIONS
// ======================================================

async function loadInspections() {

    console.log(
        "กำลังโหลดข้อมูล Inspections..."
    );


    if (
        typeof apiGetInspections !==
        "function"
    ) {

        console.error(
            "ไม่พบฟังก์ชัน apiGetInspections()"
        );


        inspectionRecords =
            [];


        return [];

    }


    try {

        const data =
            await apiGetInspections();


        console.log(
            "getInspections response:",
            data
        );


        if (
            !data ||
            !data.success
        ) {

            console.error(
                "ไม่สามารถโหลด Inspections:",
                data
                    ? data.message
                    : "ไม่มี response"
            );


            inspectionRecords =
                [];


            return [];

        }


        // ==================================================
        // SUPPORT data
        // ==================================================

        if (
            Array.isArray(
                data.data
            )
        ) {

            inspectionRecords =
                data.data;

        }


        // ==================================================
        // SUPPORT inspections
        // ==================================================

        else if (
            Array.isArray(
                data.inspections
            )
        ) {

            inspectionRecords =
                data.inspections;

        }


        // ==================================================
        // EMPTY
        // ==================================================

        else {

            inspectionRecords =
                [];

        }


        console.log(
            "โหลด Inspections สำเร็จ:",
            inspectionRecords
        );


        console.log(
            "จำนวนรายการตรวจ:",
            inspectionRecords.length
        );


        return inspectionRecords;


    } catch (error) {

        console.error(
            "เกิดข้อผิดพลาดในการโหลด Inspections:",
            error
        );


        inspectionRecords =
            [];


        return [];

    }

}


// ======================================================
// RENDER ZONE
// ======================================================

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


    if (
        !Array.isArray(
            inspectionLocations
        )
    ) {

        return;

    }


    const zones =
        [];


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


            const zone =
                location.zone ||
                location.settingZone ||
                "";


            const zoneValue =
                String(
                    zone
                ).trim();


            if (
                zoneValue &&
                !zones.includes(
                    zoneValue
                )
            ) {

                zones.push(
                    zoneValue
                );

            }

        }
    );


    zones.sort(
        function (
            a,
            b
        ) {

            return a.localeCompare(
                b,
                "th"
            );

        }
    );


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


// ======================================================
// RENDER LOCATIONS
// ======================================================

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


    if (
        !Array.isArray(
            inspectionLocations
        )
    ) {

        renderInspectionZones();

        return;

    }


    inspectionLocations.forEach(
        function (
            location
        ) {

            if (!location) {

                return;

            }


            // ==================================================
            // STATUS
            // ==================================================

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


            // ==================================================
            // LOCATION NAME
            // ==================================================

            const locationName =
                location.settingName ||
                location.name ||
                location.settingValue ||
                location.locationName ||
                "";


            const name =
                String(
                    locationName
                ).trim();


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


            // ==================================================
            // STORE ZONE
            // ==================================================

            const zone =
                location.zone ||
                location.settingZone ||
                "";


            if (zone) {

                option.dataset.zone =
                    String(
                        zone
                    ).trim();

            }


            select.appendChild(
                option
            );

        }
    );


    // ==================================================
    // RENDER ZONE
    // ==================================================

    renderInspectionZones();

}


// ======================================================
// RENDER INSPECTORS
// ======================================================

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


    if (
        !Array.isArray(
            inspectionInspectors
        )
    ) {

        return;

    }


    inspectionInspectors.forEach(
        function (
            inspector
        ) {

            if (!inspector) {

                return;

            }


            // ==================================================
            // STATUS
            // ==================================================

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


            // ==================================================
            // NAME
            // ==================================================

            const inspectorName =
                inspector.settingName ||
                inspector.name ||
                inspector.settingValue ||
                inspector.inspectorName ||
                "";


            const name =
                String(
                    inspectorName
                ).trim();


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


    // ==================================================
    // CHECK DATA
    // ==================================================

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


    // ==================================================
    // SORT ITEMS
    // ==================================================

    const sortedItems =
        [...inspectionItems]
            .sort(
                function (
                    a,
                    b
                ) {

                    const aNo =
                        Number(
                            a &&
                            (
                                a.sortOrder ||
                                a.itemNo ||
                                a.no ||
                                999
                            )
                        );


                    const bNo =
                        Number(
                            b &&
                            (
                                b.sortOrder ||
                                b.itemNo ||
                                b.no ||
                                999
                            )
                        );


                    return (
                        aNo -
                        bNo
                    );

                }
            );


    // ==================================================
    // CLEAR
    // ==================================================

    container.innerHTML =
        "";


    // ==================================================
    // RENDER ITEMS
    // ==================================================

    sortedItems.forEach(
        function (
            item,
            index
        ) {

            if (!item) {

                return;

            }


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


            const safeItemNumber =
                String(
                    itemNumber
                );


            const safeItemText =
                String(
                    itemText
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "inspection-item";


            row.dataset.itemNo =
                safeItemNumber;


            row.innerHTML = `

                <div class="inspection-item-header">

                    <div class="inspection-item-number">

                        ${escapeHTML(
                            safeItemNumber
                        )}

                    </div>

                    <div class="inspection-item-text">

                        ${escapeHTML(
                            safeItemText
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
                                safeItemNumber
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
                                safeItemNumber
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


    // ==================================================
    // ADDITIONAL SECTION
    // ==================================================

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

            if (!row) {

                return;

            }


            const itemNo =
                row.dataset.itemNo ||
                "";


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


    return String(
        input.value || ""
    ).trim();

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


    return String(
        input.value || ""
    ).trim();

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


    const zone =
        document.getElementById(
            "inspection-zone"
        );


    const location =
        document.getElementById(
            "inspection-location"
        );


    const inspector =
        document.getElementById(
            "inspection-inspector"
        );


    // ==================================================
    // DATE
    // ==================================================

    if (
        !inspectionDate ||
        !inspectionDate.value
    ) {

        alert(
            "กรุณาเลือกวันที่ตรวจ"
        );


        return false;

    }


    // ==================================================
    // TIME
    // ==================================================

    if (
        !inspectionTime ||
        !inspectionTime.value
    ) {

        alert(
            "กรุณาเลือกเวลาตรวจ"
        );


        return false;

    }


    // ==================================================
    // ZONE
    // ==================================================

    if (
        zone &&
        !zone.value
    ) {

        alert(
            "กรุณาเลือกเขต"
        );


        return false;

    }


    // ==================================================
    // LOCATION
    // ==================================================

    if (
        !location ||
        !location.value
    ) {

        alert(
            "กรุณาเลือกจุดตรวจ"
        );


        return false;

    }


    // ==================================================
    // INSPECTOR
    // ==================================================

    if (
        !inspector ||
        !inspector.value
    ) {

        alert(
            "กรุณาเลือกผู้ตรวจ"
        );


        return false;

    }


    // ==================================================
    // ITEMS
    // ==================================================

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


    // ==================================================
    // INCOMPLETE
    // ==================================================

    const incomplete =
        items.find(
            function (
                item
            ) {

                return (
                    !item ||
                    !item.result
                );

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

    // ==================================================
    // CRYPTO UUID
    // ==================================================

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
        "function"
    ) {

        return window.crypto.randomUUID();

    }


    // ==================================================
    // FALLBACK
    // ==================================================

    return (

        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2)

    );

}


// ======================================================
// SAVE INSPECTION
// ======================================================

async function saveInspection() {

    // ==================================================
    // VALIDATE
    // ==================================================

    if (
        !validateInspectionForm()
    ) {

        return;

    }


    // ==================================================
    // CHECK API
    // ==================================================

    if (
        typeof apiSaveInspection !==
        "function"
    ) {

        console.error(
            "ไม่พบฟังก์ชัน apiSaveInspection()"
        );


        alert(
            "ระบบ API ยังไม่พร้อมใช้งาน"
        );


        return;

    }


    // ==================================================
    // CURRENT USER
    // ==================================================

    const user =
        typeof getCurrentUser ===
        "function"
            ? getCurrentUser()
            : null;


    if (!user) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );


        return;

    }


    // ==================================================
    // ELEMENTS
    // ==================================================

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


    // ==================================================
    // GENERATE ID
    // ==================================================

    const recordId =
        generateRecordId();


    // ==================================================
    // COLLECT DATA
    // ==================================================

    const items =
        collectInspectionItems();


    const remark =
        collectInspectionRemark();


    const solution =
        collectInspectionSolution();


    // ==================================================
    // INSPECTION DATA
    // ==================================================

    const inspectionData = {

        recordId:
            recordId,

        inspectionDate:
            dateInput
                ? dateInput.value
                : "",

        inspectionTime:
            timeInput
                ? timeInput.value
                : "",

        zone:
            zoneInput
                ? zoneInput.value
                : "",

        locationName:
            locationInput
                ? locationInput.value
                : "",

        inspectorName:
            inspectorInput
                ? inspectorInput.value
                : "",

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


    // ==================================================
    // DISABLE SAVE BUTTON
    // ==================================================

    if (saveButton) {

        saveButton.disabled =
            true;


        saveButton.textContent =
            "กำลังบันทึก...";

    }


    try {

        // ==================================================
        // API
        // ==================================================

        const data =
            await apiSaveInspection(
                inspectionData
            );


        console.log(
            "ผลการบันทึกการตรวจ:",
            data
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        if (
            data &&
            data.success
        ) {

            alert(
                "บันทึกการตรวจสำเร็จ"
            );


            // ----------------------------------------------
            // RESET FORM
            // ----------------------------------------------

            resetInspectionForm();


        } else {

            alert(

                data &&
                data.message

                    ? data.message

                    : "ไม่สามารถบันทึกการตรวจได้"

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

        // ==================================================
        // RESTORE BUTTON
        // ==================================================

        if (saveButton) {

            saveButton.disabled =
                false;


            saveButton.textContent =
                "บันทึกการตรวจ";

        }

    }

}


// ======================================================
// RESET INSPECTION FORM
// ======================================================

function resetInspectionForm() {

    // ==================================================
    // ELEMENTS
    // ==================================================

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


    // ==================================================
    // RESET ZONE
    // ==================================================

    if (zoneInput) {

        zoneInput.value =
            "";

    }


    // ==================================================
    // RESET LOCATION
    // ==================================================

    if (locationInput) {

        locationInput.value =
            "";

    }


    // ==================================================
    // RESET INSPECTOR
    // ==================================================

    if (inspectorInput) {

        inspectorInput.value =
            "";

    }


    // ==================================================
    // RESET RADIO
    // ==================================================

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


    // ==================================================
    // RESET REMARK
    // ==================================================

    const remark =
        document.getElementById(
            "inspection-remark"
        );


    if (remark) {

        remark.value =
            "";

    }


    // ==================================================
    // RESET SOLUTION
    // ==================================================

    const solution =
        document.getElementById(
            "inspection-solution"
        );


    if (solution) {

        solution.value =
            "";

    }


    // ==================================================
    // RESET DATE
    // ==================================================

    if (dateInput) {

        dateInput.value =
            "";

    }


    // ==================================================
    // RESET TIME
    // ==================================================

    if (timeInput) {

        timeInput.value =
            "";

    }


    // ==================================================
    // SET DEFAULT DATE / TIME
    // ==================================================

    setDefaultInspectionDateTime();


    console.log(
        "ล้างข้อมูลการตรวจแล้ว"
    );

}


// ======================================================
// END INSPECTIONS.JS
// ======================================================