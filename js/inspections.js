/**
 * ======================================================
 * GGN Docs
 * Inspection System
 * ======================================================
 *
 * File: inspections.js
 * Version: v2.1.0
 * Updated: 2026-09-24
 *
 * Version History
 *
 * v2.1.0
 * - เพิ่มการทำงานให้สอดคล้องกับ Inspection Permission
 * - ใช้ Session User เป็น Current User
 * - loadInspections() ใช้ apiGetInspections()
 * - ส่ง Email ผู้ใช้งานผ่าน api.js เพื่อให้ Backend ตรวจสอบสิทธิ์
 * - Inspector ของ Inspection ใหม่มาจาก User ที่ Login
 * - pointId และ Zone ของ Inspection ใหม่มาจาก LocationMaster
 * - Admin ที่มี Zone = All จะไม่ถูกบันทึก Zone เป็น All
 * - Admin สามารถเลือก Location ได้ทุก Zone
 * - User เห็นเฉพาะ Location ใน Zone ของตนเอง
 * - คงการ Edit Inspection เดิม
 * - คงการรองรับ Inspection เก่าที่ไม่มี pointId
 * - คงโครงสร้าง Inspections เดิม A:R
 * - ไม่กระทบ FM-OP-11 Version 1
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
// GGN DOCS - INSPECTION PAGE INITIALIZATION
// VERSION: 2.4.0
//
// CHANGE:
// - ป้องกัน initialize ซ้อนกัน
// - ไม่ mark page ready ถ้าข้อมูลไม่ครบ
// - Retry ได้เมื่อ Location / Settings โหลดไม่สำเร็จ
// - ใช้ Memory Cache เมื่อข้อมูลโหลดสำเร็จแล้ว
// ======================================================

async function initializeInspectionPage() {

    // ----------------------------------------
    // PREVENT DUPLICATE INITIALIZATION
    // ----------------------------------------

    if (inspectionInitializationPromise) {

        console.log(
            "Inspection กำลัง Initialize อยู่แล้ว → รอ Request เดิม"
        );

        return inspectionInitializationPromise;

    }


    inspectionInitializationPromise =
        (async function () {

            console.log(
                "เตรียมหน้า การตรวจ ISO..."
            );


            // ----------------------------------------
            // CURRENT USER
            // ----------------------------------------

            const user =
                getCurrentUser();


            if (
                !user ||
                !user.email
            ) {

                console.warn(
                    "ไม่พบ Current User ขณะเปิดหน้า Inspection"
                );

                inspectionPageInitialized =
                    false;

                return false;

            }


            console.log(
                "Current Inspection User:",
                user
            );


            // ----------------------------------------
            // DEFAULT DATE / TIME
            // ----------------------------------------

            setDefaultInspectionDateTime();


            // ----------------------------------------
            // CACHE READY
            // ----------------------------------------

            if (
                inspectionSettingsLoaded &&
                inspectionLocationsLoaded &&
                Array.isArray(inspectionItems) &&
                inspectionItems.length > 0 &&
                Array.isArray(inspectionMasterLocations)
            ) {

                console.log(
                    "Inspection ใช้ข้อมูลจาก Memory Cache"
                );


                inspectionPageInitialized =
                    true;


                renderInspectionUser();

                renderInspectionZones();

                renderInspectionInspectors();

                renderInspectionLocations();

                renderInspectionItems();

                updateInspectionFormMode();


                console.log(
                    "เปิดหน้า Inspection จาก Cache สำเร็จ"
                );


                return true;

            }


            // ----------------------------------------
            // CACHE NOT READY
            // ----------------------------------------

            inspectionPageInitialized =
                false;


            console.log(
                "Inspection Cache ยังไม่พร้อม → ตรวจสอบข้อมูลพื้นฐาน"
            );


            const loadTasks = [];


            // ----------------------------------------
            // LOAD INSPECTION SETTINGS
            // ----------------------------------------

            if (
                !inspectionSettingsLoaded ||
                !Array.isArray(inspectionItems) ||
                inspectionItems.length === 0
            ) {

                console.log(
                    "กำลังโหลด Inspection Items..."
                );


                loadTasks.push(

                    loadInspectionSettings()

                        .then(
                            function () {

                                const success =
                                    Array.isArray(
                                        inspectionItems
                                    ) &&
                                    inspectionItems.length > 0;


                                inspectionSettingsLoaded =
                                    success;


                                if (success) {

                                    console.log(
                                        "Inspection Items พร้อม:",
                                        inspectionItems.length,
                                        "รายการ"
                                    );

                                } else {

                                    console.error(
                                        "Inspection Items โหลดแล้วแต่ไม่มีข้อมูล"
                                    );

                                }


                                return success;

                            }
                        )

                        .catch(
                            function (error) {

                                inspectionSettingsLoaded =
                                    false;


                                console.error(
                                    "โหลด Inspection Items ไม่สำเร็จ:",
                                    error
                                );


                                return false;

                            }
                        )

                );

            }


            // ----------------------------------------
            // LOAD LOCATION MASTER
            // ----------------------------------------

            if (
                !inspectionLocationsLoaded ||
                !Array.isArray(
                    inspectionMasterLocations
                )
            ) {

                console.log(
                    "กำลังโหลด LocationMaster..."
                );


                loadTasks.push(

                    loadInspectionMasterLocations()

                        .then(
                            function () {

                                return (
                                    inspectionLocationsLoaded &&
                                    Array.isArray(
                                        inspectionMasterLocations
                                    )
                                );

                            }
                        )

                        .catch(
                            function (error) {

                                inspectionLocationsLoaded =
                                    false;


                                console.error(
                                    "โหลด LocationMaster ไม่สำเร็จ:",
                                    error
                                );


                                return false;

                            }
                        )

                );

            }


            // ----------------------------------------
            // WAIT FOR ALL REQUIRED DATA
            // ----------------------------------------

            const results =
                await Promise.all(
                    loadTasks
                );


            console.log(
                "ผลการโหลดข้อมูลพื้นฐาน Inspection:",
                results
            );


            // ----------------------------------------
            // FINAL VALIDATION
            // ----------------------------------------

            const settingsReady =
                inspectionSettingsLoaded &&
                Array.isArray(
                    inspectionItems
                ) &&
                inspectionItems.length > 0;


            const locationsReady =
                inspectionLocationsLoaded &&
                Array.isArray(
                    inspectionMasterLocations
                );


            // ----------------------------------------
            // NOT READY
            // ----------------------------------------

            if (
                !settingsReady ||
                !locationsReady
            ) {

                inspectionPageInitialized =
                    false;


                console.error(
                    "Inspection ยังไม่พร้อม:",
                    {
                        settingsReady:
                            settingsReady,

                        settingsCount:
                            Array.isArray(
                                inspectionItems
                            )
                                ? inspectionItems.length
                                : 0,

                        locationsReady:
                            locationsReady,

                        locationsCount:
                            Array.isArray(
                                inspectionMasterLocations
                            )
                                ? inspectionMasterLocations.length
                                : 0
                    }
                );


                // ----------------------------------------
                // USER MESSAGE
                // ----------------------------------------

                const missing = [];


                if (!settingsReady) {

                    missing.push(
                        "รายการตรวจ 7 รายการ"
                    );

                }


                if (!locationsReady) {

                    missing.push(
                        "จุดตรวจ"
                    );

                }


                alert(
                    "ไม่สามารถเตรียมหน้าบันทึกตรวจได้\n\n" +
                    "ข้อมูลที่ยังโหลดไม่สำเร็จ:\n" +
                    missing.join("\n") +
                    "\n\nกรุณาลองเปิดหน้านี้อีกครั้ง"
                );


                return false;

            }


            // ----------------------------------------
            // PAGE READY
            // ----------------------------------------

            inspectionPageInitialized =
                true;


            // ----------------------------------------
            // RENDER
            // ----------------------------------------

            renderInspectionUser();

            renderInspectionZones();

            renderInspectionInspectors();

            renderInspectionLocations();

            renderInspectionItems();

            updateInspectionFormMode();


            console.log(
                "เตรียมหน้า Inspection สำเร็จ:",
                {
                    items:
                        inspectionItems.length,

                    locations:
                        inspectionMasterLocations.length
                }
            );


            return true;

        })();


    try {

        return await inspectionInitializationPromise;

    } finally {

        inspectionInitializationPromise =
            null;

    }

}

// ======================================================
// LOAD LOCATION MASTER
// ======================================================

async function loadInspectionMasterLocations() {

    const user =
        getCurrentUser();


    if (
        !user ||
        !user.email
    ) {

        inspectionMasterLocations =
            [];

        inspectionLocationsLoaded =
            false;


        console.warn(
            "ไม่สามารถโหลด LocationMaster ได้ เพราะไม่พบ User Email"
        );


        return false;

    }


    // ----------------------------------------
    // CACHE CHECK
    // ----------------------------------------

    if (
        inspectionLocationsLoaded &&
        Array.isArray(
            inspectionMasterLocations
        )
    ) {

        console.log(
            "LocationMaster ใช้ข้อมูลจาก Memory Cache:",
            inspectionMasterLocations.length,
            "จุด"
        );


        return true;

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

            inspectionLocationsLoaded =
                false;


            console.error(
                "ไม่สามารถโหลด LocationMaster:",
                data
                    ? data.message
                    : "ไม่พบข้อมูล"
            );


            return false;

        }


        const locations =
            Array.isArray(
                data.locations
            )
                ? data.locations
                : [];


        // ----------------------------------------
        // IMPORTANT
        // ----------------------------------------
        // success แต่ไม่มี locations
        // ถือว่ายังไม่พร้อม
        // ----------------------------------------

        if (
            locations.length === 0
        ) {

            inspectionMasterLocations =
                [];

            inspectionLocationsLoaded =
                false;


            console.error(
                "LocationMaster API สำเร็จ แต่ไม่พบจุดตรวจ"
            );


            return false;

        }


        inspectionMasterLocations =
            locations;


        inspectionLocationsLoaded =
            true;


        console.log(
            "โหลด LocationMaster สำเร็จ:",
            inspectionMasterLocations.length,
            "จุด"
        );


        return true;


    } catch (error) {

        console.error(
            "loadInspectionMasterLocations Error:",
            error
        );


        inspectionMasterLocations =
            [];

        inspectionLocationsLoaded =
            false;


        return false;

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

        zoneInput.innerHTML =
            "";


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

        inspectorInput.innerHTML =
            "";


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
// Permission ถูกตรวจสอบที่ Backend
//
// apiGetInspections()
// จะดึง Email จาก ggnDocsUser
// แล้วส่งไป Backend ให้ตรวจสอบ User / Admin
// ======================================================

async function loadInspections() {

    try {

        console.log(
            "กำลังโหลดข้อมูล Inspections..."
        );


        // ----------------------------------------
        // CURRENT USER
        // ----------------------------------------

        const user =
            getCurrentUser();


        if (
            !user ||
            !user.email
        ) {

            console.warn(
                "ไม่พบ Current User สำหรับโหลด Inspections"
            );


            inspectionRecords =
                [];


            return;

        }


        // ----------------------------------------
        // USE API LAYER
        // ----------------------------------------
        // api.js v2.2.0
        // จะส่ง email ของ Session User
        // ไป Backend อัตโนมัติ
        // ----------------------------------------

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
                    : "ไม่พบข้อมูล"
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
// Zone ที่แสดงบนฟอร์ม
// ใช้เป็นข้อมูลประกอบจาก Current User
//
// IMPORTANT:
// สำหรับ Admin ค่า Zone อาจเป็น "All"
// แต่ "All" เป็น Access Scope เท่านั้น
// ไม่ใช่ Zone ที่จะบันทึกลง Inspection
//
// Zone ที่บันทึกจริงจะมาจาก LocationMaster
// ของ pointId ที่เลือก
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
        "กำหนด Zone Scope จาก User:",
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
//
// User:
//   ได้เฉพาะ Location ใน Zone ของตนเอง
//
// Admin:
//   ได้ Location ทุก Zone
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


            const locationZone =
                String(
                    location.zone ||
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
                locationZone;


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
// ไม่ให้ User / Admin เลือกเองในหน้า New Inspection
//
// FM-OP-11 จะมี Logic แยกต่างหากสำหรับ
// Admin ที่ต้องการเลือก Inspector
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
            String(
                option.dataset.pointId ||
                option.value ||
                ""
            ).trim(),

        location:
            String(
                option.dataset.location ||
                option.textContent.trim() ||
                ""
            ).trim(),

        zone:
            String(
                option.dataset.zone ||
                ""
            ).trim()

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

        // ------------------------------------------------
        // CREATE / EDIT
        // ------------------------------------------------
        // ทั้งสองโหมดต้องมี Location
        //
        // แต่ Legacy Inspection ที่ไม่มี pointId
        // ยังสามารถแก้ไขได้
        // ดังนั้นห้ามใช้ location.value
        // เป็นตัวตัดสิน pointId ใน EDIT
        // ------------------------------------------------

        if (
            inspectionMode === "edit" &&
            editingInspectionData &&
            editingInspectionData.locationName
        ) {

            // Legacy Inspection
            // สามารถใช้ Location เดิมได้

        } else {

            alert(
                "กรุณาเลือกจุดตรวจ"
            );


            return false;

        }

    }


    const selectedLocation =
        getSelectedInspectionLocation();


    // ------------------------------------------------
    // CREATE MODE
    // ------------------------------------------------
    //
    // Inspection ใหม่ต้องใช้ Point ID
    // และ Zone จาก LocationMaster
    // ------------------------------------------------

    if (
        inspectionMode === "create"
    ) {

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
            !selectedLocation.zone
        ) {

            alert(
                "ไม่พบ Zone ของจุดตรวจจาก LocationMaster"
            );


            return false;

        }


        // --------------------------------------------
        // ADMIN SAFETY CHECK
        // --------------------------------------------
        // Admin มี Zone = All เป็น Access Scope
        // แต่ห้ามบันทึก Inspection ด้วย Zone = All
        // --------------------------------------------

        if (
            String(
                selectedLocation.zone ||
                ""
            ).trim().toLowerCase() === "all"
        ) {

            console.error(
                "ไม่อนุญาตให้สร้าง Inspection ด้วย Zone = All:",
                selectedLocation
            );


            alert(
                "ไม่สามารถบันทึก Inspection ด้วย Zone = All ได้ กรุณาเลือกจุดตรวจใหม่"
            );


            return false;

        }

    }


    // ------------------------------------------------
    // EDIT MODE
    // ------------------------------------------------
    //
    // Inspection เดิมสามารถไม่มี pointId ได้
    // เช่นข้อมูลก่อนเพิ่ม LocationMaster
    //
    // Backend จะเป็นผู้ตรวจสอบ Permission
    // จาก recordId + Current User
    // ------------------------------------------------

    if (
        inspectionMode === "edit"
    ) {

        const original =
            editingInspectionData ||
            {};


        if (
            !original.recordId
        ) {

            alert(
                "ไม่พบรหัสรายการตรวจเดิม"
            );


            return false;

        }


        if (
            !original.locationName
        ) {

            alert(
                "ไม่พบข้อมูลจุดตรวจเดิม"
            );


            return false;

        }

    }


    // ------------------------------------------------
    // CURRENT USER
    // ------------------------------------------------

    if (
        !user.name
    ) {

        alert(
            "ไม่พบชื่อผู้ตรวจจากบัญชีผู้ใช้งาน"
        );


        return false;

    }


    if (
        !user.email
    ) {

        alert(
            "ไม่พบ Email ของผู้ใช้งาน"
        );


        return false;

    }


    // ------------------------------------------------
    // INSPECTION ITEMS
    // ------------------------------------------------

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
// SAVE INSPECTION
// ======================================================

async function saveInspection() {

    console.log("========== SAVE INSPECTION ==========");

    try {

        // --------------------------------------------------
        // 1. Current User
        // --------------------------------------------------

        const user = getCurrentGGNUser();

        if (!user || !user.email) {

            showInspectionMessage(
                "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่",
                "error"
            );

            return;
        }

        console.log("Current User:", user);


        // --------------------------------------------------
        // 2. Validate Form
        // --------------------------------------------------

        const validation = validateInspectionForm();

        if (!validation.valid) {

            showInspectionMessage(
                validation.message || "กรุณากรอกข้อมูลให้ครบถ้วน",
                "warning"
            );

            return;
        }


        // --------------------------------------------------
        // 3. Collect Form Data
        // --------------------------------------------------

        const selectedLocation =
            getSelectedInspectionLocation();

        if (!selectedLocation) {

            showInspectionMessage(
                "ไม่พบข้อมูลจุดตรวจที่เลือก",
                "warning"
            );

            return;
        }


        // --------------------------------------------------
        // 4. Inspection Items
        // --------------------------------------------------

        const items =
            collectInspectionItems();

        if (!Array.isArray(items) || items.length === 0) {

            showInspectionMessage(
                "ไม่พบรายการตรวจสอบ",
                "warning"
            );

            return;
        }


        // ตรวจสอบว่าครบทุกข้อ
        const incompleteItem =
            items.find(item =>
                !item.result ||
                String(item.result).trim() === ""
            );

        if (incompleteItem) {

            showInspectionMessage(
                "กรุณาระบุผลการตรวจสอบให้ครบทุกข้อ",
                "warning"
            );

            return;
        }


        // --------------------------------------------------
        // 5. Record ID
        // --------------------------------------------------

        let recordId =
            editingInspectionRecordId;

        if (!recordId) {
            recordId = generateRecordId();
        }


        // --------------------------------------------------
        // 6. Date / Time
        // --------------------------------------------------

        const date =
            document.getElementById("inspection-date")?.value || "";

        const time =
            document.getElementById("inspection-time")?.value || "";


        // --------------------------------------------------
        // 7. Remark / Solution
        // --------------------------------------------------

        const remark =
            getInspectionRemark();

        const solution =
            getInspectionSolution();


        // --------------------------------------------------
        // 8. Zone
        // --------------------------------------------------
        //
        // สำคัญ:
        // ตอน Create ให้ใช้ Zone จาก LocationMaster
        // ไม่ใช้ user.zone โดยตรง
        //
        // ตอน Edit ให้รักษาข้อมูลเดิม
        //

        let zone = "";

        if (inspectionMode === "edit" && editingInspectionData) {

            zone =
                editingInspectionData.zone ||
                selectedLocation.zone ||
                "";

        } else {

            zone =
                selectedLocation.zone ||
                "";

        }


        // --------------------------------------------------
        // 9. Location
        // --------------------------------------------------

        const location =
            selectedLocation.location ||
            selectedLocation.name ||
            "";

        const pointId =
            selectedLocation.pointId ||
            "";


        // --------------------------------------------------
        // 10. Inspector
        // --------------------------------------------------

        let inspector =
            user.name || "";

        if (
            inspectionMode === "edit" &&
            editingInspectionData &&
            editingInspectionData.inspector
        ) {

            inspector =
                editingInspectionData.inspector;

        }


        // --------------------------------------------------
        // 11. Document Information
        // --------------------------------------------------

        const documentCode =
            editingInspectionData?.documentCode ||
            "FM-OP-11";

        const documentName =
            editingInspectionData?.documentName ||
            "รายงานการตรวจจุดพนักงานรักษาความปลอดภัย";

        const documentNo =
            editingInspectionData?.documentNo ||
            "";


        // --------------------------------------------------
        // 12. Build Inspection Data
        // --------------------------------------------------

        const inspectionData = {

            recordId: recordId,

            date: date,

            time: time,

            zone: zone,

            location: location,

            pointId: pointId,

            inspector: inspector,

            remark: remark,

            solution: solution,

            documentCode: documentCode,

            documentName: documentName,

            documentNo: documentNo,

            createdBy: user.email,

            createdByEmail: user.email,

            documentStatus:
                editingInspectionData?.documentStatus ||
                "Draft",

            items: items

        };


        console.log(
            "Inspection Data:",
            inspectionData
        );


        // --------------------------------------------------
        // 13. Double Check Create Zone
        // --------------------------------------------------

        if (
            inspectionMode !== "edit" &&
            (!zone || zone === "All")
        ) {

            showInspectionMessage(
                "ไม่สามารถบันทึกได้ เนื่องจากไม่พบ Zone ของจุดตรวจ",
                "error"
            );

            return;
        }


        // --------------------------------------------------
        // 14. Disable Save Button
        // --------------------------------------------------

        const saveButton =
            document.getElementById(
                "btn-save-inspection"
            );

        const originalText =
            saveButton?.textContent || "บันทึก";

        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                inspectionMode === "edit"
                    ? "กำลังบันทึกการแก้ไข..."
                    : "กำลังบันทึก...";

        }


        // --------------------------------------------------
        // 15. Call Backend
        // --------------------------------------------------

        let result;

        if (inspectionMode === "edit") {

            console.log(
                "Updating Inspection:",
                recordId
            );

            result =
                await apiUpdateInspection(
                    inspectionData
                );

        } else {

            console.log(
                "Creating Inspection:",
                recordId
            );


            // ใช้ API wrapper กลาง
            // แทน fetch() ตรงจากหน้านี้

            if (typeof apiSaveInspection === "function") {

                result =
                    await apiSaveInspection(
                        inspectionData
                    );

            } else {

                // fallback กรณี apiSaveInspection
                // ยังไม่มีใน api.js

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "text/plain;charset=utf-8"
                            },

                            body: JSON.stringify({

                                action:
                                    "saveInspection",

                                email:
                                    user.email,

                                requesterEmail:
                                    user.email,

                                inspection:
                                    inspectionData

                            })
                        }
                    );


                result =
                    await response.json();

            }

        }


        console.log(
            "Save Inspection Result:",
            result
        );


        // --------------------------------------------------
        // 16. Check Result
        // --------------------------------------------------

        if (!result || !result.success) {

            throw new Error(
                result?.message ||
                "ไม่สามารถบันทึกข้อมูลได้"
            );

        }


        // --------------------------------------------------
        // 17. Success
        // --------------------------------------------------

        console.log(
            "Inspection saved successfully:",
            recordId
        );


        const successMessage =
            inspectionMode === "edit"
                ? "แก้ไขบันทึกการตรวจเรียบร้อยแล้ว"
                : "บันทึกการตรวจเรียบร้อยแล้ว";


        showInspectionMessage(
            successMessage,
            "success"
        );


        // --------------------------------------------------
        // 18. Reset Form
        // --------------------------------------------------

        resetInspectionForm();


        // --------------------------------------------------
        // 19. Refresh Inspection Records
        // --------------------------------------------------

        try {

            if (
                typeof loadInspections === "function"
            ) {

                await loadInspections();

            }

        } catch (refreshError) {

            console.warn(
                "Refresh inspection records failed:",
                refreshError
            );

        }


    } catch (error) {

        console.error(
            "saveInspection Error:",
            error
        );


        // --------------------------------------------------
        // Error Message
        // --------------------------------------------------

        showInspectionMessage(
            error.message ||
            "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
            "error"
        );


    } finally {

        // --------------------------------------------------
        // 20. Restore Save Button
        // --------------------------------------------------

        const saveButton =
            document.getElementById(
                "btn-save-inspection"
            );

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                inspectionMode === "edit"
                    ? "บันทึกการแก้ไข"
                    : "บันทึก";

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


        // ----------------------------------------
        // LOAD INSPECTION DATA
        // ----------------------------------------

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
        // WAIT FOR INSPECTION PAGE
        // ----------------------------------------
        //
        // showPage() เรียก initializeInspectionPage()
        // อยู่แล้ว
        //
        // เราเรียกซ้ำได้อย่างปลอดภัยเพราะ
        // initializeInspectionPage() มี Promise Lock
        // ----------------------------------------

        const pageReady =
            await initializeInspectionPage();


        if (!pageReady) {

            console.error(
                "ไม่สามารถเตรียมหน้า Inspection สำหรับ Edit ได้"
            );


            return false;

        }


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

        zoneInput.innerHTML =
            "";


        const zoneOption =
            document.createElement(
                "option"
            );


        zoneOption.value =
            inspection.zone ||
            "";


        zoneOption.textContent =
            inspection.zone ||
            "-";


        zoneInput.appendChild(
            zoneOption
        );


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