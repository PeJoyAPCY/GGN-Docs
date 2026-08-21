// ======================================================
// INSPECTION SYSTEM
// ======================================================


// ========================================
// SETUP INSPECTION
// ========================================

function setupInspections() {

    const saveButton =
        document.getElementById(
            "save-inspection-button"
        );


    const resetButton =
        document.getElementById(
            "reset-inspection-button"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveInspection
        );

    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetInspectionForm
        );

    }


    /*
     * ฟังก์ชันนี้เป็นของระบบ popup / event
     * เดิมของหน้า Inspection
     */
    if (
        typeof setupInspectionPageEvents ===
        "function"
    ) {

        setupInspectionPageEvents();

    }

}


// ========================================
// INITIALIZE INSPECTION PAGE
// ========================================

async function initializeInspectionPage() {

    console.log(
        "กำลังเตรียมหน้า การตรวจ ISO..."
    );


    setDefaultInspectionDateTime();


    if (
        !inspectionSettingsLoaded
    ) {

        await loadInspectionSettings();

        inspectionSettingsLoaded =
            true;

    } else {

        renderInspectionLocations();

        renderInspectionInspectors();

        renderInspectionItems();

    }


    /*
     * โหลดข้อมูลการตรวจจริง
     */
    await loadInspections();

}


// ========================================
// DEFAULT DATE / TIME
// ========================================

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


// ========================================
// LOAD INSPECTIONS
// ========================================

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
                            "application/json"
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


        // ------------------------------------
        // เก็บข้อมูล Inspections
        // ------------------------------------

        inspectionRecords =
            Array.isArray(
                data.data
            )
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


        inspectionRecords =
            [];

    }

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


    const zones =
        [];


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


    // ====================================
    // REMARK + SOLUTION
    // ====================================

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


        const data =
            await response.json();


        console.log(
            "ผลการบันทึกการตรวจ:",
            data
        );


        if (data.success) {

            // ====================================
            // สำคัญ
            // ไม่ reset form ตรงนี้แล้ว
            // ====================================

            const savedRecord = {

                ...inspectionData,

                recordId:
                    data.recordId ||
                    inspectionData.recordId

            };


            // ------------------------------------
            // เพิ่มรายการใหม่เข้า memory
            // ------------------------------------

            if (
                !Array.isArray(
                    inspectionRecords
                )
            ) {

                inspectionRecords =
                    [];

            }


            inspectionRecords.unshift(
                savedRecord
            );


            console.log(
                "เพิ่มรายการตรวจใหม่เข้า inspectionRecords:",
                savedRecord
            );


            // ------------------------------------
            // แสดง Popup หลังบันทึก
            // ------------------------------------

            showInspectionSavedPopup(
                savedRecord
            );

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
// SHOW INSPECTION SAVED POPUP
// ========================================

function showInspectionSavedPopup(
    record
) {

    // ------------------------------------
    // ลบ popup เดิมก่อน
    // ------------------------------------

    const oldPopup =
        document.getElementById(
            "inspection-saved-popup"
        );


    if (oldPopup) {

        oldPopup.remove();

    }


    const popup =
        document.createElement(
            "div"
        );


    popup.id =
        "inspection-saved-popup";


    popup.className =
        "inspection-saved-popup";


    popup.innerHTML = `

        <div class="inspection-saved-popup-overlay">

            <div
                class="inspection-saved-popup-card"
                role="dialog"
                aria-modal="true"
            >

                <button
                    type="button"
                    class="inspection-saved-popup-close"
                    id="inspection-saved-popup-close"
                    aria-label="ปิด"
                >
                    ×
                </button>


                <div class="inspection-saved-popup-icon">
                    ✓
                </div>


                <h3>
                    บันทึกการตรวจสำเร็จ
                </h3>


                <p class="inspection-saved-popup-message">
                    ระบบบันทึกข้อมูลการตรวจเรียบร้อยแล้ว
                </p>


                <div class="inspection-saved-popup-summary">

                    <div class="inspection-saved-popup-row">

                        <span>
                            วันที่ตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.inspectionDate ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="inspection-saved-popup-row">

                        <span>
                            เวลา
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.inspectionTime ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="inspection-saved-popup-row">

                        <span>
                            เขต
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.zone ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="inspection-saved-popup-row">

                        <span>
                            จุดตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.locationName ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="inspection-saved-popup-row">

                        <span>
                            ผู้ตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.inspectorName ||
                                "-"
                            )}
                        </strong>

                    </div>

                </div>


                <div class="inspection-saved-popup-actions">

                    <button
                        type="button"
                        class="inspection-popup-btn inspection-popup-btn-primary"
                        id="inspection-popup-detail"
                    >
                        ดูรายละเอียด
                    </button>


                    <button
                        type="button"
                        class="inspection-popup-btn inspection-popup-btn-secondary"
                        id="inspection-popup-edit"
                    >
                        แก้ไข
                    </button>


                    <button
                        type="button"
                        class="inspection-popup-btn inspection-popup-btn-danger"
                        id="inspection-popup-delete"
                    >
                        ลบ
                    </button>

                </div>


                <button
                    type="button"
                    class="inspection-popup-btn inspection-popup-btn-light"
                    id="inspection-popup-close-bottom"
                >
                    ปิด
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        popup
    );


    // ====================================
    // CLOSE
    // ====================================

    const closePopup =
        function () {

            popup.remove();

        };


    const closeButton =
        document.getElementById(
            "inspection-saved-popup-close"
        );


    const closeBottomButton =
        document.getElementById(
            "inspection-popup-close-bottom"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePopup
        );

    }


    if (closeBottomButton) {

        closeBottomButton.addEventListener(
            "click",
            closePopup
        );

    }


    // ====================================
    // CLICK OVERLAY
    // ====================================

    const overlay =
        popup.querySelector(
            ".inspection-saved-popup-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            function (
                event
            ) {

                if (
                    event.target ===
                    overlay
                ) {

                    closePopup();

                }

            }
        );

    }


    // ====================================
    // ESC
    // ====================================

    const escapeHandler =
        function (
            event
        ) {

            if (
                event.key ===
                "Escape"
            ) {

                closePopup();

                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );

            }

        };


    document.addEventListener(
        "keydown",
        escapeHandler
    );


    // ====================================
    // DETAIL
    // ====================================

    const detailButton =
        document.getElementById(
            "inspection-popup-detail"
        );


    if (detailButton) {

        detailButton.addEventListener(
            "click",
            function () {

                closePopup();


                if (
                    typeof showInspectionDetail ===
                    "function"
                ) {

                    showInspectionDetail(
                        record
                    );

                } else {

                    showInspectionRecordDetail(
                        record
                    );

                }

            }
        );

    }


    // ====================================
    // EDIT
    // ====================================

    const editButton =
        document.getElementById(
            "inspection-popup-edit"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            function () {

                closePopup();


                if (
                    typeof editInspection ===
                    "function"
                ) {

                    editInspection(
                        record
                    );

                } else {

                    editInspectionRecord(
                        record
                    );

                }

            }
        );

    }


    // ====================================
    // DELETE
    // ====================================

    const deleteButton =
        document.getElementById(
            "inspection-popup-delete"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            async function () {

                await deleteInspectionRecord(
                    record
                );

            }
        );

    }

}


// ========================================
// SHOW INSPECTION DETAIL
// ========================================

function showInspectionRecordDetail(
    record
) {

    const oldPopup =
        document.getElementById(
            "inspection-detail-popup"
        );


    if (oldPopup) {

        oldPopup.remove();

    }


    const popup =
        document.createElement(
            "div"
        );


    popup.id =
        "inspection-detail-popup";


    popup.className =
        "inspection-saved-popup";


    const items =
        Array.isArray(
            record.items
        )
            ? record.items
            : [];


    let itemHTML =
        "";


    items.forEach(
        function (
            item,
            index
        ) {

            const resultClass =
                item.result ===
                "ผ่าน"
                    ? "inspection-detail-pass"
                    : "inspection-detail-fail";


            itemHTML += `

                <div class="inspection-detail-item">

                    <div class="inspection-detail-item-number">
                        ${escapeHTML(
                            item.itemNo ||
                            index + 1
                        )}
                    </div>

                    <div class="inspection-detail-item-text">
                        ${escapeHTML(
                            item.item ||
                            "-"
                        )}
                    </div>

                    <div
                        class="inspection-detail-item-result ${resultClass}"
                    >
                        ${escapeHTML(
                            item.result ||
                            "-"
                        )}
                    </div>

                </div>

            `;

        }
    );


    popup.innerHTML = `

        <div class="inspection-saved-popup-overlay">

            <div
                class="inspection-saved-popup-card inspection-detail-card"
                role="dialog"
                aria-modal="true"
            >

                <button
                    type="button"
                    class="inspection-saved-popup-close"
                    id="inspection-detail-close"
                >
                    ×
                </button>


                <div class="inspection-saved-popup-icon">
                    📋
                </div>


                <h3>
                    รายละเอียดการตรวจ
                </h3>


                <div class="inspection-saved-popup-summary">

                    <div class="inspection-saved-popup-row">

                        <span>
                            วันที่ตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.inspectionDate ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="inspection-saved-popup-row">

                        <span>
                            เวลา
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.inspectionTime ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="inspection-saved-popup-row">

                        <span>
                            เขต
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.zone ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="inspection-saved-popup-row">

                        <span>
                            จุดตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.locationName ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="inspection-saved-popup-row">

                        <span>
                            ผู้ตรวจ
                        </span>

                        <strong>
                            ${escapeHTML(
                                record.inspectorName ||
                                "-"
                            )}
                        </strong>

                    </div>

                </div>


                <div class="inspection-detail-items">

                    ${itemHTML}

                </div>


                <div class="inspection-detail-text-section">

                    <strong>
                        หมายเหตุ
                    </strong>

                    <div>
                        ${escapeHTML(
                            record.remark ||
                            "-"
                        )}
                    </div>

                </div>


                <div class="inspection-detail-text-section">

                    <strong>
                        แนวทางแก้ไข
                    </strong>

                    <div>
                        ${escapeHTML(
                            record.solution ||
                            "-"
                        )}
                    </div>

                </div>


                <button
                    type="button"
                    class="inspection-popup-btn inspection-popup-btn-light"
                    id="inspection-detail-close-bottom"
                >
                    ปิด
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        popup
    );


    const close =
        function () {

            popup.remove();

        };


    const closeTop =
        document.getElementById(
            "inspection-detail-close"
        );


    const closeBottom =
        document.getElementById(
            "inspection-detail-close-bottom"
        );


    if (closeTop) {

        closeTop.addEventListener(
            "click",
            close
        );

    }


    if (closeBottom) {

        closeBottom.addEventListener(
            "click",
            close
        );

    }

}


// ========================================
// EDIT INSPECTION RECORD
// ========================================

function editInspectionRecord(
    record
) {

    /*
     * ถ้าในระบบมีฟังก์ชันแก้ไขเดิม
     * ให้เรียกใช้งานต่อ
     */

    if (
        typeof openInspectionEditForm ===
        "function"
    ) {

        openInspectionEditForm(
            record
        );

        return;

    }


    /*
     * ถ้ายังไม่มีระบบ Edit ตัวเดิม
     * จะนำข้อมูลกลับเข้า form ก่อน
     */

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


    if (dateInput) {

        dateInput.value =
            record.inspectionDate ||
            "";

    }


    if (timeInput) {

        timeInput.value =
            record.inspectionTime ||
            "";

    }


    if (zoneInput) {

        zoneInput.value =
            record.zone ||
            "";

    }


    if (locationInput) {

        locationInput.value =
            record.locationName ||
            "";

    }


    if (inspectorInput) {

        inspectorInput.value =
            record.inspectorName ||
            "";

    }


    const remark =
        document.getElementById(
            "inspection-remark"
        );


    const solution =
        document.getElementById(
            "inspection-solution"
        );


    if (remark) {

        remark.value =
            record.remark ||
            "";

    }


    if (solution) {

        solution.value =
            record.solution ||
            "";

    }


    /*
     * เติมผลตรวจกลับเข้า radio
     */

    const items =
        Array.isArray(
            record.items
        )
            ? record.items
            : [];


    items.forEach(
        function (
            item
        ) {

            const row =
                document.querySelector(
                    `.inspection-item[data-item-no="${CSS.escape(
                        String(
                            item.itemNo
                        )
                    )}"]`
                );


            if (!row) {

                return;

            }


            const radio =
                row.querySelector(
                    `input[type="radio"][value="${CSS.escape(
                        String(
                            item.result
                        )
                    )}"]`
                );


            if (radio) {

                radio.checked =
                    true;

            }

        }
    );


    /*
     * เก็บ recordId ที่กำลังแก้ไข
     * เผื่อระบบ Edit เดิมนำไปใช้
     */

    window.currentEditingInspectionId =
        record.recordId;


    console.log(
        "โหลดข้อมูลการตรวจเพื่อแก้ไข:",
        record
    );


    /*
     * เลื่อนกลับไปบริเวณ form
     */

    const form =
        document.getElementById(
            "inspection-form"
        );


    if (form) {

        form.scrollIntoView({
            behavior:
                "smooth",
            block:
                "start"
        });

    }

}


// ========================================
// DELETE INSPECTION RECORD
// ========================================

async function deleteInspectionRecord(
    record
) {

    const confirmed =
        confirm(

            "ต้องการลบรายการตรวจนี้ใช่หรือไม่?\n\n" +
            "จุดตรวจ: " +
            (
                record.locationName ||
                "-"
            ) +
            "\n" +
            "วันที่: " +
            (
                record.inspectionDate ||
                "-"
            ) +
            "\n" +
            "เวลา: " +
            (
                record.inspectionTime ||
                "-"
            )

        );


    if (!confirmed) {

        return;

    }


    try {

        console.log(
            "กำลังลบรายการตรวจ:",
            record.recordId
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
                                "deleteInspection",

                            recordId:
                                record.recordId

                        })

                }

            );


        const data =
            await response.json();


        console.log(
            "ผลการลบรายการตรวจ:",
            data
        );


        if (
            data.success
        ) {

            /*
             * ลบออกจาก memory
             */

            inspectionRecords =
                inspectionRecords.filter(
                    function (
                        item
                    ) {

                        return (
                            item.recordId !==
                            record.recordId
                        );

                    }
                );


            /*
             * ปิด popup เดิม
             */

            const popup =
                document.getElementById(
                    "inspection-saved-popup"
                );


            if (popup) {

                popup.remove();

            }


            /*
             * ถ้ามีฟังก์ชัน render รายการตรวจ
             * ให้ refresh ต่อ
             */

            if (
                typeof renderInspectionRecords ===
                "function"
            ) {

                renderInspectionRecords();

            }


            alert(
                "ลบรายการตรวจสำเร็จ"
            );

        } else {

            alert(

                data.message ||
                "ไม่สามารถลบรายการตรวจได้"

            );

        }

    } catch (error) {

        console.error(
            "ลบรายการตรวจไม่สำเร็จ:",
            error
        );


        alert(
            "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
        );

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


    if (zoneInput) {

        zoneInput.value =
            "";

    }


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


    /*
     * ยกเลิกสถานะกำลังแก้ไข
     */

    window.currentEditingInspectionId =
        null;


    console.log(
        "ล้างข้อมูลการตรวจแล้ว"
    );

}


// ======================================================
// END INSPECTION SYSTEM
// ======================================================