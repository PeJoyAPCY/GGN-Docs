
/**
 * ======================================================
 * GGN DOCS
 * INSPECTION LIST SEARCH
 * ======================================================
 *
 * File: inspection-list-search.js
 * Version: 1.0.0
 *
 * PURPOSE:
 * - กรองรายการตรวจตามวันที่
 * - Admin กรองตามผู้ตรวจและเขตได้
 * - User ใช้รายการที่ Backend กรองสิทธิ์มาแล้ว
 * - ล้างตัวกรองและกลับมาแสดงรายการทั้งหมด
 *
 * IMPORTANT:
 * - ใช้ inspectionListRecords จาก inspection-list.js
 * - ใช้ isInspectionListAdmin() ตรวจสิทธิ์เดิม
 * - ใช้ renderInspectionList() แสดงผลเดิม
 * - ไม่เรียก API และไม่เปลี่ยนแปลงข้อมูลที่บันทึกไว้
 * ======================================================
 */


/**
 * ======================================================
 * APPLY INSPECTION RECORD FILTER
 * ======================================================
 */

function applyInspectionRecordsFilter() {

    const dateInput =
        document.getElementById(
            "inspection-records-date"
        );

    const inspectorInput =
        document.getElementById(
            "inspection-records-inspector"
        );

    const zoneInput =
        document.getElementById(
            "inspection-records-zone"
        );

    const isAdmin =
        isInspectionListAdmin();

    const date =
        dateInput
            ? dateInput.value
            : "";

    const inspector =
        inspectorInput &&
        isAdmin &&
        !inspectorInput.disabled
            ? inspectorInput.value
            : "";

    const zone =
        zoneInput &&
        isAdmin &&
        !zoneInput.disabled
            ? zoneInput.value
            : "";

    console.log(
        "ค้นหารายการตรวจ:",
        {
            date,
            inspector,
            zone:
                isAdmin
                    ? zone
                    : "(User - ใช้ Zone จากสิทธิ์ Backend)",
            role:
                getInspectionListCurrentRole()
        }
    );

    const filtered =
        inspectionListRecords.filter(
            function (record) {

                // วันที่ตรวจ
                if (
                    date &&
                    record.inspectionDate !== date
                ) {
                    return false;
                }

                // ผู้ตรวจ: เฉพาะ Admin
                if (
                    isAdmin &&
                    inspector &&
                    record.inspectorName !== inspector
                ) {
                    return false;
                }

                // เขต: เฉพาะ Admin
                if (
                    isAdmin &&
                    zone &&
                    record.zone !== zone
                ) {
                    return false;
                }

                return true;
            }
        );

    renderInspectionList(filtered);
}


/**
 * ======================================================
 * RESET INSPECTION RECORD FILTER
 * ======================================================
 */

function resetInspectionRecordsFilter() {

    const dateInput =
        document.getElementById(
            "inspection-records-date"
        );

    const inspectorInput =
        document.getElementById(
            "inspection-records-inspector"
        );

    const zoneInput =
        document.getElementById(
            "inspection-records-zone"
        );

    if (dateInput) {
        dateInput.value = "";
    }

    if (inspectorInput) {
        inspectorInput.value = "";
    }

    if (zoneInput) {
        zoneInput.value = "";
    }

    // กลับมาแสดงรายการทั้งหมดจากข้อมูลที่โหลดไว้
    renderInspectionList();
}
