/**
 * ======================================================
 * GGN Docs
 * Inspection System
 * ======================================================
 *
 * File: inspections.js
 * Version: v2.0.0
 * Updated: 2026-09-23
 *
 * Version History
 *
 * v2.0.0
 * - เปลี่ยนระบบ Inspection เป็น User → Zone → LocationMaster
 * - Zone มาจาก Google Account / Users
 * - Inspector มาจาก User ที่ Login
 * - Location มาจาก LocationMaster
 * - เพิ่มการรองรับ pointId
 * - Admin Zone = All สามารถเห็น Location ทุก Zone
 * - User ทั่วไปเห็นเฉพาะ Location ใน Zone ของตนเอง
 * - Backend เป็นผู้ตรวจสอบสิทธิ์และ Location ซ้ำอีกครั้ง
 * - รองรับการ Edit ข้อมูล Inspection เดิม
 * - รักษาโครงสร้าง Inspection เดิมเพื่อไม่กระทบ FM-OP-11 Version 1
 *
 * v1.0.0
 * - ระบบ Inspection เดิม
 *
 * ======================================================
 */


// ======================================================
// LOCAL STATE
// ======================================================

// Location จาก LocationMaster
let inspectionMasterLocations = [];


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
    // CURRENT USER
    // ----------------------------------------

    const user =
        getCurrentUser();


    if (!user) {

        console.warn(
            "ไม่พบ Current User ขณะเปิดหน้า Inspection"
        );

    } else {

        console.log(
            "Current Inspection User:",
            user
        );

    }


    // ----------------------------------------
    // LOAD SETTINGS
    // ----------------------------------------
    // ยังคงใช้ Settings สำหรับ Inspection Items
    // แต่ Zone / Location / Inspector
    // จะใช้ข้อมูลจากระบบใหม่ด้านล่าง
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

    }


    // ----------------------------------------
    // LOAD LOCATION MASTER
    // ----------------------------------------

    await loadInspectionMasterLocations();


    // ----------------------------------------
    // RENDER NEW INSPECTION FORM
    // ----------------------------------------

    renderInspectionUser();


    renderInspectionZones();


    renderInspectionLocations();


    renderInspectionInspectors();


    renderInspectionItems();


    // ----------------------------------------
    // UPDATE FORM MODE
    // ----------------------------------------

    updateInspectionFormMode();


    console.log(
        "เตรียมหน้าการตรวจเรียบร้อย"
    );

}


// ======================================================
// LOAD LOCATION MASTER
// ======================================================

async function loadInspectionMasterLocations() {

    const user =
        getCurrentUser();


    if (!user || !user.email) {

        inspectionMasterLocations =
            [];

        console.warn(
            "ไม่สามารถโหลด LocationMaster ได้ เพราะไม่พบ User Email"
        );

        return;

    }


    try {

        console.log(
            "กำลังโหลด LocationMaster สำหรับ:",
            user.email
        );


        const data =
            await apiGetInspectionLocations(
                user.email
            );


        console.log(
            "Inspection Locations response:",
            data
        );


        if (
            !data ||
            !data.success
        ) {

            inspectionMasterLocations =
                [];

            console.error(
                "ไม่สามารถโหลด LocationMaster:",
                data
                    ? data.message
                    : "ไม่พบข้อมูล"
            );

            return;

        }


        inspectionMasterLocations =
            Array.isArray(
                data.locations
            )
                ? data.locations
                : [];


        console.log(
            "โหลด LocationMaster สำเร็จ:",
            inspectionMasterLocations
        );


        console.log(
            "จำนวนจุดตรวจที่มีสิทธิ์:",
            inspectionMasterLocations.length
        );


    } catch (error) {

        console.error(
            "loadInspectionMasterLocations Error:",
            error
        );


        inspectionMasterLocations =
            [];

    }

}


// ======================================================
// RENDER CURRENT USER
// ======================================================

function renderInspectionUser() {

    const user =
        getCurrentUser();


    if (!user) {
        return;
    }


    // ----------------------------------------
    // ZONE
    // ----------------------------------------

    const zoneInput =
        document.getElementById(
            "inspection-zone"
        );


    if (zoneInput) {

        zoneInput.innerHTML = "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            user.zone ||
            "";


        option.textContent =
            user.zone ||
            "-";


        zoneInput.appendChild(
            option
        );


        zoneInput.value =
            user.zone ||
            "";


        zoneInput.disabled =
            true;

    }


    // ----------------------------------------
    // INSPECTOR
    // ----------------------------------------

    const inspectorInput =
        document.getElementById(
            "inspection-inspector"
        );


    if (inspectorInput) {

        inspectorInput.innerHTML = "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            user.name ||
            "";


        option.textContent =
            user.name ||
            "-";


        inspectorInput.appendChild(
            option
        );


        inspectorInput.value =
            user.name ||
            "";


        inspectorInput.disabled =
            true;

    }


    console.log(
        "กำหนด Zone / Inspector จาก User:",
        {
            zone: user.zone || "",
            inspector: user.name || ""
        }
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
// NORMALIZE DATE FOR HTML DATE INPUT
// ======================================================

function normalizeDateForInput(
    value
) {

    if (!value) {
        return "";
    }


    const str =
        String(
            value
        ).trim();


    // ----------------------------------------
    // ALREADY YYYY-MM-DD
    // ----------------------------------------

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            str
        )
    ) {

        return str;

    }


    // ----------------------------------------
    // DD/MM/YYYY
    // ----------------------------------------

    const match =
        str.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (match) {

        const day =
            String(
                match[1]
            ).padStart(
                2,
                "0"
            );


        const month =
            String(
                match[2]
            ).padStart(
                2,
                "0"
            );


        const year =
            match[3];


        return (
            `${year}-${month}-${day}`
        );

    }


    return "";

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
// Zone ไม่ได้มาจาก Settings แล้ว
// Zone มาจาก Current User
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


    const user =
        getCurrentUser();


    select.innerHTML =
        "";


    if (!user) {

        return;

    }


    const zone =
        user.zone ||
        "";


    if (!zone) {

        console.warn(
            "User ไม่มี Zone"
        );

        return;

    }


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


    select.value =
        zone;


    select.disabled =
        true;


    console.log(
        "กำหนด Zone จาก User:",
        zone
    );

}


// ======================================================
// RENDER INSPECTION LOCATIONS
// ======================================================
// Location มาจาก LocationMaster
//
// option.value = pointId
// option.textContent = location
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


    if (
        !Array.isArray(
            inspectionMasterLocations
        )
    ) {

        return;

    }


    inspectionMasterLocations.forEach(
        function (
            location
        ) {

            if (!location) {
                return;
            }


            const pointId =
                String(
                    location.pointId ||
                    ""
                ).trim();


            const locationName =
                String(
                    location.location ||
                    location.locationName ||
                    ""
                ).trim();


            if (
                !pointId ||
                !locationName
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pointId;


            option.textContent =
                locationName;


            option.dataset.pointId =
                pointId;


            option.dataset.zone =
                location.zone ||
                "";


            option.dataset.location =
                locationName;


            select.appendChild(
                option
            );

        }
    );


    console.log(
        "Render LocationMaster สำเร็จ:",
        inspectionMasterLocations
    );

}


// ======================================================
// RENDER INSPECTION INSPECTORS
// ======================================================
// Inspector มาจาก Current User
// ไม่ให้ User เลือกเอง
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


    const user =
        getCurrentUser();


    select.innerHTML =
        "";


    if (!user) {

        return;

    }


    const inspectorName =
        user.name ||
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


    select.value =
        inspectorName;


    select.disabled =
        true;


    console.log(
        "กำหนด Inspector จาก User:",
        inspectorName
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
// GET SELECTED LOCATION
// ======================================================

function getSelectedInspectionLocation() {

    const select =
        document.getElementById(
            "inspection-location"
        );


    if (
        !select ||
        !select.value
    ) {

        return null;

    }


    const option =
        select.options[
            select.selectedIndex
        ];


    if (!option) {

        return null;

    }


    return {

        pointId:
            option.dataset.pointId ||
            option.value ||
            "",

        location:
            option.dataset.location ||
            option.textContent.trim() ||
            "",

        zone:
            option.dataset.zone ||
            ""

    };

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


    const user =
        getCurrentUser();


    if (
        !user
    ) {

        alert(
            "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
        );


        return false;

    }


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


    const selectedLocation =
        getSelectedInspectionLocation();


    if (
        !selectedLocation ||
        !selectedLocation.pointId
    ) {

        alert(
            "ไม่พบ Point ID ของจุดตรวจ"
        );


        return false;

    }


    if (
        !selectedLocation.location
    ) {

        alert(
            "ไม่พบชื่อจุดตรวจ"
        );


        return false;

    }


    if (
        !user.name
    ) {

        alert(
            "ไม่พบชื่อผู้ตรวจจากบัญชีผู้ใช้งาน"
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
// UPDATE EDIT LOCK STATE
// ======================================================

function updateInspectionEditLockState() {

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


    const isEdit =
        inspectionMode ===
        "edit";


    // ----------------------------------------
    // IMMUTABLE FIELDS
    // ----------------------------------------

    [
        dateInput,
        timeInput,
        zoneInput,
        locationInput,
        inspectorInput
    ].forEach(
        function (
            input
        ) {

            if (!input) {
                return;
            }


            input.disabled =
                isEdit;

        }
    );


    console.log(
        "สถานะ Edit Lock:",
        isEdit
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


    updateInspectionEditLockState();


    // ----------------------------------------
    // CREATE MODE
    // ----------------------------------------
    // Zone / Inspector ยังคง disabled
    // เพราะเป็นข้อมูลจาก User
    // ----------------------------------------

    if (
        inspectionMode ===
        "create"
    ) {

        const user =
            getCurrentUser();


        const zoneInput =
            document.getElementById(
                "inspection-zone"
            );


        const inspectorInput =
            document.getElementById(
                "inspection-inspector"
            );


        if (zoneInput) {

            zoneInput.disabled =
                true;

        }


        if (inspectorInput) {

            inspectorInput.disabled =
                true;

        }

    }

}


// ======================================================
// SAVE / UPDATE INSPECTION
// ======================================================

async function saveInspection() {

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
    // VALIDATE
    // ----------------------------------------

    if (
        !validateInspectionForm()
    ) {

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

        recordId =
            editingInspectionRecordId;

    } else {

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
        editingInspectionData ||
        {};


    // ----------------------------------------
    // LOCATION MASTER DATA
    // ----------------------------------------

    let selectedLocation =
        null;


    if (
        inspectionMode ===
        "edit"
    ) {

        selectedLocation = {

            pointId:
                original.pointId ||
                "",

            location:
                original.locationName ||
                "",

            zone:
                original.zone ||
                ""

        };

    } else {

        selectedLocation =
            getSelectedInspectionLocation();

    }


    // ----------------------------------------
    // VALIDATE POINT ID
    // ----------------------------------------

    if (
        inspectionMode !== "edit" &&
        (
            !selectedLocation ||
            !selectedLocation.pointId
        )
    ) {

        alert(
            "ไม่พบ Point ID ของจุดตรวจ กรุณาเลือกจุดตรวจใหม่"
        );


        return;

    }


    // ----------------------------------------
    // IMMUTABLE DATA
    // ----------------------------------------

    const inspectionDate =
        inspectionMode === "edit"
            ? (
                normalizeDateForInput(
                    original.inspectionDate
                ) ||
                dateInput.value
            )
            : dateInput.value;


    const inspectionTime =
        inspectionMode === "edit"
            ? (
                original.inspectionTime ||
                timeInput.value
            )
            : timeInput.value;


    const zone =
        inspectionMode === "edit"
            ? (
                original.zone ||
                ""
            )
            : (
                user.zone ||
                selectedLocation.zone ||
                ""
            );


    const locationName =
        inspectionMode === "edit"
            ? (
                original.locationName ||
                ""
            )
            : (
                selectedLocation.location ||
                ""
            );


    const inspectorName =
        inspectionMode === "edit"
            ? (
                original.inspectorName ||
                ""
            )
            : (
                user.name ||
                ""
            );


    const pointId =
        inspectionMode === "edit"
            ? (
                original.pointId ||
                ""
            )
            : (
                selectedLocation.pointId ||
                ""
            );


    // ----------------------------------------
    // INSPECTION DATA
    // ----------------------------------------

    const inspectionData = {

        recordId:
            recordId,

        inspectionDate:
            inspectionDate,

        inspectionTime:
            inspectionTime,

        zone:
            zone,

        locationName:
            locationName,

        inspectorName:
            inspectorName,

        pointId:
            pointId,

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
        // CREATE DATA
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
        // UPDATE DATA
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

                console.log(
                    "แก้ไขรายการตรวจสำเร็จ"
                );


                showInspectionSuccessModal(
                    inspectionData,
                    "edit"
                );


                resetInspectionForm();

            }


            // ----------------------------------------
            // CREATE SUCCESS
            // ----------------------------------------

            else {

                console.log(
                    "บันทึกการตรวจสำเร็จ"
                );


                showInspectionSuccessModal(
                    inspectionData,
                    "create"
                );


                resetInspectionForm();

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
// ENSURE OLD LOCATION OPTION FOR EDIT
// ======================================================
// กรณี Inspection เก่าใช้ Location ที่ถูก inactive
// หรือไม่มีอยู่ใน LocationMaster ปัจจุบัน
//
// ระบบยังต้องสามารถเปิดดู / แก้ไขข้อมูลเดิมได้
// ======================================================

function ensureInspectionEditLocationOption(
    inspection
) {

    const select =
        document.getElementById(
            "inspection-location"
        );


    if (
        !select ||
        !inspection
    ) {

        return;

    }


    const pointId =
        String(
            inspection.pointId ||
            ""
        ).trim();


    const locationName =
        String(
            inspection.locationName ||
            ""
        ).trim();


    // ----------------------------------------
    // ถ้ามี Point ID
    // ----------------------------------------

    if (pointId) {

        const existing =
            Array.from(
                select.options
            ).find(
                function (
                    option
                ) {

                    return (
                        option.value ===
                        pointId
                    );

                }
            );


        if (!existing) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pointId;


            option.textContent =
                locationName ||
                pointId;


            option.dataset.pointId =
                pointId;


            option.dataset.zone =
                inspection.zone ||
                "";


            option.dataset.location =
                locationName ||
                "";


            select.appendChild(
                option
            );

        }


        return;

    }


    // ----------------------------------------
    // Legacy Inspection
    // ไม่มี Point ID
    // ----------------------------------------

    if (
        locationName
    ) {

        const existingLegacy =
            Array.from(
                select.options
            ).find(
                function (
                    option
                ) {

                    return (
                        option.textContent.trim() ===
                        locationName
                    );

                }
            );


        if (!existingLegacy) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                locationName;


            option.dataset.pointId =
                "";


            option.dataset.zone =
                inspection.zone ||
                "";


            option.dataset.location =
                locationName;


            select.appendChild(
                option
            );

        }

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
            normalizeDateForInput(
                inspection.inspectionDate
            );

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

    ensureInspectionEditLocationOption(
        inspection
    );


    const locationInput =
        document.getElementById(
            "inspection-location"
        );


    if (locationInput) {

        if (
            inspection.pointId
        ) {

            locationInput.value =
                inspection.pointId;

        } else {

            const legacyOption =
                Array.from(
                    locationInput.options
                ).find(
                    function (
                        option
                    ) {

                        return (
                            option.textContent.trim() ===
                            String(
                                inspection.locationName ||
                                ""
                            ).trim()
                        );

                    }
                );


            if (legacyOption) {

                locationInput.value =
                    legacyOption.value;

            }

        }

    }


    // ----------------------------------------
    // INSPECTOR
    // ----------------------------------------

    const inspectorInput =
        document.getElementById(
            "inspection-inspector"
        );


    if (inspectorInput) {

        inspectorInput.innerHTML =
            "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            inspection.inspectorName ||
            "";


        option.textContent =
            inspection.inspectorName ||
            "-";


        inspectorInput.appendChild(
            option
        );


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
    // UPDATE MODE
    // ----------------------------------------

    updateInspectionFormMode();


    console.log(
        "เติมข้อมูลรายการตรวจลงในฟอร์มเรียบร้อย"
    );

}


// ======================================================
// INSPECTION SUCCESS MODAL
// ======================================================

function showInspectionSuccessModal(
    inspection,
    mode = "create"
) {

    const modal =
        document.getElementById(
            "inspection-success-modal"
        );


    const title =
        document.getElementById(
            "inspection-success-title"
        );


    const message =
        document.getElementById(
            "inspection-success-message"
        );


    const summary =
        document.getElementById(
            "inspection-success-summary"
        );


    const viewButton =
        document.getElementById(
            "inspection-success-view-button"
        );


    const nextButton =
        document.getElementById(
            "inspection-success-next-button"
        );


    const homeButton =
        document.getElementById(
            "inspection-success-home-button"
        );


    if (!modal) {

        console.warn(
            "ไม่พบ #inspection-success-modal"
        );


        return;

    }


    // ----------------------------------------
    // TITLE / MESSAGE
    // ----------------------------------------

    if (
        mode === "edit"
    ) {

        if (title) {

            title.textContent =
                "แก้ไขรายการตรวจสำเร็จ";

        }


        if (message) {

            message.textContent =
                "ระบบบันทึกการแก้ไขรายการตรวจเรียบร้อยแล้ว";

        }

    } else {

        if (title) {

            title.textContent =
                "บันทึกการตรวจสำเร็จ";

        }


        if (message) {

            message.textContent =
                "ระบบบันทึกข้อมูลการตรวจเรียบร้อยแล้ว";

        }

    }


    // ----------------------------------------
    // SUMMARY
    // ----------------------------------------

    if (summary) {

        const items =
            inspection &&
            Array.isArray(
                inspection.items
            )
                ? inspection.items
                : [];


        const passCount =
            items.filter(
                function (
                    item
                ) {

                    return (
                        item.result ===
                        "ผ่าน"
                    );

                }
            ).length;


        const failCount =
            items.filter(
                function (
                    item
                ) {

                    return (
                        item.result ===
                        "ไม่ผ่าน"
                    );

                }
            ).length;


        summary.innerHTML = `
            <div class="inspection-success-summary-row">

                <span class="inspection-success-summary-label">
                    วันที่
                </span>

                <span class="inspection-success-summary-value">
                    ${escapeHTML(
                        inspection &&
                        inspection.inspectionDate
                            ? inspection.inspectionDate
                            : "-"
                    )}
                </span>

            </div>

            <div class="inspection-success-summary-row">

                <span class="inspection-success-summary-label">
                    เวลา
                </span>

                <span class="inspection-success-summary-value">
                    ${escapeHTML(
                        inspection &&
                        inspection.inspectionTime
                            ? inspection.inspectionTime
                            : "-"
                    )}
                </span>

            </div>

            <div class="inspection-success-summary-row">

                <span class="inspection-success-summary-label">
                    เขต
                </span>

                <span class="inspection-success-summary-value">
                    ${escapeHTML(
                        inspection &&
                        inspection.zone
                            ? inspection.zone
                            : "-"
                    )}
                </span>

            </div>

            <div class="inspection-success-summary-row">

                <span class="inspection-success-summary-label">
                    จุดตรวจ
                </span>

                <span class="inspection-success-summary-value">
                    ${escapeHTML(
                        inspection &&
                        inspection.locationName
                            ? inspection.locationName
                            : "-"
                    )}
                </span>

            </div>

            <div class="inspection-success-summary-row">

                <span class="inspection-success-summary-label">
                    ผู้ตรวจ
                </span>

                <span class="inspection-success-summary-value">
                    ${escapeHTML(
                        inspection &&
                        inspection.inspectorName
                            ? inspection.inspectorName
                            : "-"
                    )}
                </span>

            </div>

            <div class="inspection-success-result">

                <span class="inspection-success-pass">
                    ✓ ผ่าน ${passCount}
                </span>

                <span class="inspection-success-fail">
                    ✕ ไม่ผ่าน ${failCount}
                </span>

            </div>
        `;

    }


    // ----------------------------------------
    // BUTTON VISIBILITY
    // ----------------------------------------

    if (
        mode === "edit"
    ) {

        if (viewButton) {

            viewButton.textContent =
                "📋 กลับรายการตรวจ";

            viewButton.style.display =
                "block";

        }


        if (nextButton) {

            nextButton.style.display =
                "none";

        }


        if (homeButton) {

            homeButton.style.display =
                "block";

        }

    } else {

        if (viewButton) {

            viewButton.textContent =
                "📋 ดูรายการตรวจ";

            viewButton.style.display =
                "block";

        }


        if (nextButton) {

            nextButton.textContent =
                "➕ ตรวจรายการถัดไป";

            nextButton.style.display =
                "block";

        }


        if (homeButton) {

            homeButton.style.display =
                "block";

        }

    }


    // ----------------------------------------
    // BUTTON EVENTS
    // ----------------------------------------

    if (viewButton) {

        viewButton.onclick =
            function () {

                closeInspectionSuccessModal();


                showPage(
                    "inspection-records"
                );

            };

    }


    if (nextButton) {

        nextButton.onclick =
            function () {

                closeInspectionSuccessModal();


                showPage(
                    "inspection-record"
                );


                resetInspectionForm();

            };

    }


    if (homeButton) {

        homeButton.onclick =
            function () {

                closeInspectionSuccessModal();


                showPage(
                    "dashboard"
                );

            };

    }


    // ----------------------------------------
    // SHOW MODAL
    // ----------------------------------------

    modal.style.display =
        "flex";


    document.body.classList.add(
        "popup-open"
    );


    console.log(
        "เปิด Inspection Success Modal:",
        mode
    );

}


// ======================================================
// CLOSE INSPECTION SUCCESS MODAL
// ======================================================

function closeInspectionSuccessModal() {

    const modal =
        document.getElementById(
            "inspection-success-modal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "none";


    document.body.classList.remove(
        "popup-open"
    );

}


// ======================================================
// ESC CLOSE SUCCESS MODAL
// ======================================================

document.addEventListener(
    "keydown",
    function (
        event
    ) {

        if (
            event.key ===
            "Escape"
        ) {

            const modal =
                document.getElementById(
                    "inspection-success-modal"
                );


            if (
                modal &&
                modal.style.display ===
                "flex"
            ) {

                closeInspectionSuccessModal();

            }

        }

    }
);


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
    // ENABLE DATE / TIME
    // ----------------------------------------

    if (dateInput) {

        dateInput.disabled =
            false;

    }


    if (timeInput) {

        timeInput.disabled =
            false;

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
    // RESET LOCATION
    // ----------------------------------------

    if (locationInput) {

        locationInput.value =
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
    // SET DEFAULT DATE / TIME
    // ----------------------------------------

    setDefaultInspectionDateTime();


    // ----------------------------------------
    // RESTORE USER DATA
    // ----------------------------------------

    renderInspectionUser();


    renderInspectionZones();


    renderInspectionLocations();


    renderInspectionInspectors();


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