// ======================================================
// GGN DOCS - INSPECTIONS
// VERSION: 2.1.2
// DATE: 2026-09-28
//
// CHANGE:
// - ปรับ Performance ของ saveInspection()
// - เปลี่ยน Inspections จาก appendRow() เป็น setValues()
// - เปลี่ยน InspectionItems จาก appendRow() ทีละรายการ
//   เป็น setValues() แบบ Batch
// - ลดจำนวน Spreadsheet Write Operations
//
// SECURITY / BUSINESS RULE:
// - คง Permission สำหรับ Inspection เดิม
// - Admin เห็น / เปิด / แก้ / ลบ Inspection ได้ทั้งหมด
// - User เห็น / เปิด / แก้ / ลบ เฉพาะรายการของตัวเอง
// - ตรวจ User จาก Email ผ่าน Users Sheet
// - User ไม่สามารถส่ง inspectorName ของผู้อื่นเพื่อข้ามสิทธิ์ได้
// - คง LocationMaster + pointId เป็น Source of Truth
// - คง Zone ของ Inspection จาก LocationMaster ตาม pointId
// - Admin ใช้ All เป็น Access Scope เท่านั้น
// - Zone ที่บันทึกจริงมาจาก LocationMaster
// - คงกฎห้ามลบรายการที่สร้างเอกสารแล้ว
// - ไม่เปลี่ยนโครงสร้าง Inspections A:R
// - ไม่กระทบ FM-OP-11 V1
// ======================================================


// ======================================================
// GET INSPECTIONS RESPONSE HELPER
// ======================================================

function getInspectionsResponse(filters) {

  try {

    const result =
      getInspections(filters || {});

    return ContentService
      .createTextOutput(
        JSON.stringify(result)
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  } catch (error) {

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: false,
          message: error.message,
          inspections: []
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  }

}


// ======================================================
// LOCATION MASTER
// ======================================================

function isLocationActive(value) {

  if (value === true) {
    return true;
  }

  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  return (
    normalized === "true" ||
    normalized === "active" ||
    normalized === "yes" ||
    normalized === "1"
  );

}


function getLocationMasterData() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName("LocationMaster");

  if (!sheet) {

    throw new Error(
      "ไม่พบ Sheet LocationMaster"
    );

  }

  const data =
    sheet
      .getDataRange()
      .getValues();

  if (data.length < 2) {
    return [];
  }

  const headers =
    data[0].map(function(header) {

      return String(
        header || ""
      ).trim();

    });


  const pointIdIndex =
    headers.indexOf("pointId");

  const zoneIndex =
    headers.indexOf("zone");

  const locationIndex =
    headers.indexOf("location");

  const activeIndex =
    headers.indexOf("active");


  if (pointIdIndex === -1) {

    throw new Error(
      "ไม่พบ column pointId ใน LocationMaster"
    );

  }

  if (zoneIndex === -1) {

    throw new Error(
      "ไม่พบ column zone ใน LocationMaster"
    );

  }

  if (locationIndex === -1) {

    throw new Error(
      "ไม่พบ column location ใน LocationMaster"
    );

  }

  if (activeIndex === -1) {

    throw new Error(
      "ไม่พบ column active ใน LocationMaster"
    );

  }


  const locations = [];


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    const row =
      data[i];

    const pointId =
      String(
        row[pointIdIndex] || ""
      ).trim();

    const zone =
      String(
        row[zoneIndex] || ""
      ).trim();

    const location =
      String(
        row[locationIndex] || ""
      ).trim();

    const active =
      row[activeIndex];


    if (!pointId) {
      continue;
    }


    locations.push({

      pointId:
        pointId,

      zone:
        zone,

      location:
        location,

      active:
        isLocationActive(active)

    });

  }


  return locations;

}


function getLocationByPointId(pointId) {

  const normalizedPointId =
    String(
      pointId || ""
    ).trim();

  if (!normalizedPointId) {
    return null;
  }


  const locations =
    getLocationMasterData();


  for (
    let i = 0;
    i < locations.length;
    i++
  ) {

    if (
      String(
        locations[i].pointId
      ).trim()
      ===
      normalizedPointId
    ) {

      return locations[i];

    }

  }


  return null;

}


// ======================================================
// USER / PERMISSION HELPERS
// ======================================================

function getInspectionUserByEmail(email) {

  const normalizedEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();


  if (!normalizedEmail) {

    return {

      success: false,

      message:
        "ไม่พบ Email ผู้ใช้งาน"

    };

  }


  const userResult =
    getUserInfo(normalizedEmail);


  if (
    !userResult ||
    !userResult.success ||
    !userResult.found ||
    !userResult.user
  ) {

    return {

      success: false,

      message:
        "ไม่พบข้อมูลผู้ใช้งานใน Sheet Users"

    };

  }


  const user =
    userResult.user;


  const status =
    String(
      user.status || ""
    )
      .trim()
      .toLowerCase();


  if (
    status !== "active"
  ) {

    return {

      success: false,

      message:
        "บัญชีผู้ใช้งานไม่ได้อยู่ในสถานะ Active"

    };

  }


  const role =
    String(
      user.role || ""
    ).trim();


  const isAdmin =
    role.toLowerCase()
    ===
    "admin";


  let zone =
    String(
      user.zone || ""
    ).trim();


  // Admin = All
  // ใช้สำหรับ Access Scope เท่านั้น
  // ไม่ใช่ Zone ที่จะบันทึกลง Inspection
  if (isAdmin) {

    zone = "All";

  }


  if (
    !isAdmin &&
    !zone
  ) {

    return {

      success: false,

      message:
        "ผู้ใช้งานยังไม่ได้กำหนดเขต"

    };

  }


  return {

    success: true,

    user: {

      email:
        user.email,

      name:
        user.name,

      zone:
        zone,

      department:
        user.department,

      role:
        role,

      status:
        user.status,

      isAdmin:
        isAdmin

    }

  };

}


// ------------------------------------------------------
// ตรวจสอบสิทธิ์เข้าถึง Inspection
//
// Admin:
//   เข้าถึงได้ทุกคน
//
// User:
//   ต้องเป็น Inspector คนเดียวกับ User
//
// หมายเหตุ:
//   Inspection ปัจจุบันยังไม่มี inspectorEmail
//   จึงใช้ inspectorName เป็น ownership ของรายการ
// ------------------------------------------------------

function authorizeInspectionAccess(
  inspection,
  user
) {

  if (!inspection) {

    return {

      success: false,

      message:
        "ไม่พบข้อมูลการตรวจ"

    };

  }


  if (!user) {

    return {

      success: false,

      message:
        "ไม่พบข้อมูลผู้ใช้งาน"

    };

  }


  // --------------------------------------------
  // Admin เห็นและจัดการได้ทั้งหมด
  // --------------------------------------------

  if (user.isAdmin) {

    return {

      success: true

    };

  }


  const inspectionInspector =
    String(
      inspection.inspectorName || ""
    ).trim();

  const currentUserName =
    String(
      user.name || ""
    ).trim();


  if (
    !inspectionInspector ||
    !currentUserName
  ) {

    return {

      success: false,

      message:
        "ไม่สามารถตรวจสอบเจ้าของรายการได้"

    };

  }


  if (
    inspectionInspector !==
    currentUserName
  ) {

    return {

      success: false,

      message:
        "ไม่มีสิทธิ์เข้าถึงรายการตรวจของผู้ใช้งานอื่น"

    };

  }


  return {

    success: true

  };

}


// ======================================================
// VALIDATE LOCATION
// ======================================================

function validateInspectionLocation(
  pointId,
  user
) {

  const location =
    getLocationByPointId(pointId);


  if (!location) {

    return {

      success: false,

      message:
        "ไม่พบจุดตรวจใน LocationMaster"

    };

  }


  if (!location.active) {

    return {

      success: false,

      message:
        "จุดตรวจนี้ถูกปิดใช้งานแล้ว"

    };

  }


  // --------------------------------------------
  // Admin ใช้ได้ทุก Zone
  //
  // แต่ Zone ที่บันทึกจริง
  // ยังคงเป็น Zone ของ LocationMaster
  // --------------------------------------------

  if (
    user.isAdmin ||
    String(user.zone)
      .trim()
      .toLowerCase()
    === "all"
  ) {

    return {

      success: true,

      location:
        location

    };

  }


  const userZone =
    String(
      user.zone || ""
    ).trim()
    .toLowerCase();

  const locationZone =
    String(
      location.zone || ""
    ).trim()
    .toLowerCase();


  if (
    !userZone ||
    !locationZone ||
    userZone !== locationZone
  ) {

    return {

      success: false,

      message:
        "ไม่มีสิทธิ์บันทึกจุดตรวจนอกเขตของตนเอง"

    };

  }


  return {

    success: true,

    location:
      location

  };

}


// ======================================================
// GET INSPECTION LOCATIONS
// ======================================================

function getInspectionLocations(email) {

  try {

    const userResult =
      getInspectionUserByEmail(email);


    if (!userResult.success) {
      return userResult;
    }


    const user =
      userResult.user;


    const locations =
      getLocationMasterData();


    const filtered =
      locations.filter(
        function(location) {

          // เฉพาะจุดที่ Active
          if (!location.active) {
            return false;
          }


          // --------------------------------------
          // Admin เห็นทุก Zone
          // --------------------------------------

          if (
            user.isAdmin ||
            String(user.zone)
              .trim()
              .toLowerCase()
            === "all"
          ) {

            return true;

          }


          // --------------------------------------
          // User เห็นเฉพาะ Zone ตัวเอง
          // --------------------------------------

          return (

            String(location.zone)
              .trim()
              .toLowerCase()

            ===

            String(user.zone)
              .trim()
              .toLowerCase()

          );

        }
      );


    Logger.log(
      "Inspection User: "
      + JSON.stringify(user)
    );

    Logger.log(
      "All LocationMaster Data: "
      + JSON.stringify(locations)
    );

    Logger.log(
      "Filtered Locations: "
      + JSON.stringify(filtered)
    );


    return {

      success: true,

      locations:
        filtered,

      user: {

        name:
          user.name,

        zone:
          user.zone,

        role:
          user.role

      }

    };


  } catch (error) {

    Logger.log(
      "getInspectionLocations Error: "
      + error.message
    );


    return {

      success: false,

      message:
        error.message,

      locations: []

    };

  }

}


// ======================================================
// SAVE INSPECTION
// ======================================================
// VERSION 2.1.2
//
// PERFORMANCE:
// - Inspections ใช้ setValues() 1 ครั้ง
// - InspectionItems ใช้ setValues() แบบ Batch 1 ครั้ง
// - ไม่ใช้ appendRow() ทีละ Item
//
// DATA / SECURITY:
// - คง Permission เดิม
// - คง LocationMaster เป็น Source of Truth
// - คง Zone จาก LocationMaster
// - คง Inspector จาก User
// - คงโครงสร้าง Inspections A:R
// ======================================================

function saveInspection(inspectionData) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const inspectionSheet =
    ss.getSheetByName("Inspections");

  const itemSheet =
    ss.getSheetByName("InspectionItems");


  if (
    !inspectionSheet ||
    !itemSheet
  ) {

    return {

      success: false,

      message:
        "ไม่พบ Sheet Inspections หรือ InspectionItems"

    };

  }


  if (
    !inspectionData ||
    !inspectionData.recordId ||
    !inspectionData.inspectionDate ||
    !inspectionData.inspectionTime ||
    !inspectionData.pointId
  ) {

    return {

      success: false,

      message:
        "ข้อมูลการตรวจไม่ครบ โดยต้องมี pointId"

    };

  }


  try {

    // --------------------------------------------
    // ตรวจสอบ User จาก Email
    // --------------------------------------------

    const createdByEmail =
      String(
        inspectionData.createdByEmail ||
        ""
      ).trim();


    const userResult =
      getInspectionUserByEmail(
        createdByEmail
      );


    if (!userResult.success) {

      return {

        success: false,

        message:
          userResult.message

      };

    }


    const user =
      userResult.user;


    // --------------------------------------------
    // ตรวจสอบ Point / Zone
    // --------------------------------------------

    const locationResult =
      validateInspectionLocation(
        inspectionData.pointId,
        user
      );


    if (!locationResult.success) {

      return {

        success: false,

        message:
          locationResult.message

      };

    }


    const location =
      locationResult.location;


    // --------------------------------------------
    // Backend Source of Truth
    // --------------------------------------------

    const verifiedZone =
      location.zone;

    const verifiedLocationName =
      location.location;

    const verifiedInspectorName =
      user.name;


    const now =
      new Date();


    // --------------------------------------------
    // เตรียมข้อมูล Inspections A:R
    // --------------------------------------------

    const inspectionRow = [[

      // A recordId
      inspectionData.recordId,

      // B inspectionDate
      inspectionData.inspectionDate,

      // C inspectionTime
      inspectionData.inspectionTime || "",

      // D zone
      verifiedZone || "",

      // E locationName
      verifiedLocationName || "",

      // F inspectorName
      verifiedInspectorName || "",

      // G remark
      inspectionData.remark || "",

      // H solution
      inspectionData.solution || "",

      // I documentCode
      inspectionData.documentCode ||
        "FM-OP-11",

      // J documentName
      inspectionData.documentName ||
        "รายงานการตรวจจุดพนักงานรักษาความปลอดภัย",

      // K documentNo
      inspectionData.documentNo || "",

      // L createdAt
      now,

      // M createdBy
      user.name ||
        "",

      // N documentStatus
      inspectionData.documentStatus ||
        "completed",

      // O fileId
      inspectionData.fileId || "",

      // P fileUrl
      inspectionData.fileUrl || "",

      // Q fileName
      inspectionData.fileName || "",

      // R pointId
      location.pointId

    ]];


    // --------------------------------------------
    // เขียน Inspections 1 ครั้ง
    // --------------------------------------------

    const inspectionStartRow =
      inspectionSheet.getLastRow() + 1;


    inspectionSheet
      .getRange(
        inspectionStartRow,
        1,
        1,
        18
      )
      .setValues(
        inspectionRow
      );


    // --------------------------------------------
    // เตรียม InspectionItems
    // --------------------------------------------

    const items =
      Array.isArray(
        inspectionData.items
      )
        ? inspectionData.items
        : [];


    const itemRows =
      items.map(
        function(item) {

          return [

            inspectionData.recordId,

            item.itemNo || "",

            item.item || "",

            item.result || ""

          ];

        }
      );


    // --------------------------------------------
    // เขียน InspectionItems แบบ Batch
    // --------------------------------------------

    if (
      itemRows.length > 0
    ) {

      const itemStartRow =
        itemSheet.getLastRow() + 1;


      itemSheet
        .getRange(
          itemStartRow,
          1,
          itemRows.length,
          4
        )
        .setValues(
          itemRows
        );

    }


    // --------------------------------------------
    // Log
    // --------------------------------------------

    addLog(

      user.email ||
      createdByEmail ||
      "",

      "CREATE_INSPECTION",

      inspectionData.recordId

    );


    // --------------------------------------------
    // Response
    // --------------------------------------------

    return {

      success: true,

      message:
        "บันทึกข้อมูลการตรวจสำเร็จ",

      recordId:
        inspectionData.recordId,

      pointId:
        location.pointId,

      zone:
        verifiedZone,

      locationName:
        verifiedLocationName,

      inspectorName:
        verifiedInspectorName,

      itemCount:
        itemRows.length

    };


  } catch (error) {

    console.error(
      "saveInspection Error:",
      error
    );


    return {

      success: false,

      message:
        error.message

    };

  }

}


// ======================================================
// GET SINGLE INSPECTION
// ======================================================
// VERSION 2.1.1
//
// เพิ่ม email สำหรับตรวจ Permission
// User เปิดได้เฉพาะรายการของตัวเอง
// Admin เปิดได้ทุกรายการ
// ======================================================

function getInspection(
  recordId,
  requesterEmail
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const inspectionSheet =
    ss.getSheetByName("Inspections");

  const itemSheet =
    ss.getSheetByName("InspectionItems");


  if (
    !inspectionSheet ||
    !itemSheet
  ) {

    return {

      success: false,

      message:
        "ไม่พบ Sheet Inspections หรือ InspectionItems"

    };

  }


  if (!recordId) {

    return {

      success: false,

      message:
        "ไม่พบ recordId"

    };

  }


  try {

    // --------------------------------------------
    // ตรวจสอบ User
    // --------------------------------------------

    const userResult =
      getInspectionUserByEmail(
        requesterEmail
      );


    if (!userResult.success) {

      return {

        success: false,

        message:
          userResult.message

      };

    }


    const user =
      userResult.user;


    // --------------------------------------------
    // อ่าน Inspections
    // --------------------------------------------

    const inspectionData =
      inspectionSheet
        .getDataRange()
        .getValues();


    let inspection =
      null;


    for (
      let i = 1;
      i < inspectionData.length;
      i++
    ) {

      if (
        String(
          inspectionData[i][0]
        ).trim()
        ===
        String(recordId).trim()
      ) {

        inspection = {

          recordId:
            inspectionData[i][0],

          inspectionDate:
            formatDateValue(
              inspectionData[i][1]
            ),

          inspectionTime:
            formatTimeValue(
              inspectionData[i][2]
            ),

          zone:
            inspectionData[i][3],

          locationName:
            inspectionData[i][4],

          inspectorName:
            inspectionData[i][5],

          remark:
            inspectionData[i][6],

          solution:
            inspectionData[i][7],

          documentCode:
            inspectionData[i][8],

          documentName:
            inspectionData[i][9],

          documentNo:
            inspectionData[i][10],

          createdAt:
            formatDateTimeValue(
              inspectionData[i][11]
            ),

          createdBy:
            inspectionData[i][12],

          documentStatus:
            inspectionData[i][13],

          fileId:
            inspectionData[i][14],

          fileUrl:
            inspectionData[i][15],

          fileName:
            inspectionData[i][16],

          pointId:
            inspectionData[i][17] || ""

        };


        break;

      }

    }


    if (!inspection) {

      return {

        success: false,

        message:
          "ไม่พบข้อมูลการตรวจ"

      };

    }


    // --------------------------------------------
    // Permission
    // --------------------------------------------

    const permission =
      authorizeInspectionAccess(
        inspection,
        user
      );


    if (!permission.success) {

      return permission;

    }


    // --------------------------------------------
    // InspectionItems
    // --------------------------------------------

    const itemData =
      itemSheet
        .getDataRange()
        .getValues();


    const items = [];


    for (
      let i = 1;
      i < itemData.length;
      i++
    ) {

      if (
        String(
          itemData[i][0]
        ).trim()
        ===
        String(recordId).trim()
      ) {

        items.push({

          itemNo:
            itemData[i][1],

          item:
            itemData[i][2],

          result:
            itemData[i][3]

        });

      }

    }


    inspection.items =
      items;


    return {

      success: true,

      inspection:
        inspection

    };


  } catch (error) {

    return {

      success: false,

      message:
        error.message

    };

  }

}


// ======================================================
// GET INSPECTIONS
// ======================================================
// VERSION 2.1.1
//
// User:
//   Backend บังคับ inspectorName = User ของตัวเอง
//
// Admin:
//   ถ้ามี inspectorName filter → ใช้ filter
//   ถ้าไม่มี → เห็นทั้งหมด
//
// ======================================================

function getInspections(filters) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName("Inspections");


  if (!sheet) {

    return {

      success: false,

      message:
        "ไม่พบ Sheet Inspections",

      inspections: []

    };

  }


  try {

    filters =
      filters || {};


    // --------------------------------------------
    // ตรวจสอบ User
    // --------------------------------------------

    const requesterEmail =
      String(
        filters.email ||
        filters.requesterEmail ||
        ""
      ).trim();


    const userResult =
      getInspectionUserByEmail(
        requesterEmail
      );


    if (!userResult.success) {

      return {

        success: false,

        message:
          userResult.message,

        inspections: []

      };

    }


    const user =
      userResult.user;


    // --------------------------------------------
    // วันที่
    // --------------------------------------------

    const filterDate =
      String(
        filters.inspectionDate || ""
      ).trim();


    // --------------------------------------------
    // Inspector ที่ Frontend ขอ
    // --------------------------------------------

    const requestedInspector =
      String(
        filters.inspectorName || ""
      ).trim();


    // --------------------------------------------
    // Permission Filter
    // --------------------------------------------

    let filterInspector =
      "";


    if (user.isAdmin) {

      // Admin:
      // ไม่มี Inspector filter = เห็นทั้งหมด
      // มี Inspector filter = กรองตามที่เลือก

      filterInspector =
        requestedInspector;

    } else {

      // User:
      // ห้ามใช้ inspectorName ที่ Frontend ส่งมา
      // บังคับเป็นชื่อของ User ที่ Login

      filterInspector =
        String(
          user.name || ""
        ).trim();

    }


    // --------------------------------------------
    // อ่านข้อมูล
    // --------------------------------------------

    const data =
      sheet
        .getDataRange()
        .getValues();


    if (data.length <= 1) {

      return {

        success: true,

        inspections: []

      };

    }


    // --------------------------------------------
    // Filter
    // --------------------------------------------

    const inspections =
      data
        .slice(1)
        .filter(function(row) {

          // --------------------------------------
          // Date
          // --------------------------------------

          if (filterDate) {

            const normalizedFilterDate =
              normalizeDateForFilter(
                filterDate
              );


            const rowDate =
              normalizeDateForFilter(
                row[1]
              );


            if (
              rowDate !==
              normalizedFilterDate
            ) {

              return false;

            }

          }


          // --------------------------------------
          // Inspector / Ownership
          // --------------------------------------

          if (filterInspector) {

            const rowInspector =
              String(
                row[5] || ""
              ).trim();


            if (
              rowInspector !==
              filterInspector
            ) {

              return false;

            }

          }


          return true;

        })
        .map(function(row) {

          return {

            recordId:
              row[0],

            inspectionDate:
              formatDateValue(row[1]),

            inspectionTime:
              formatTimeValue(row[2]),

            zone:
              row[3],

            locationName:
              row[4],

            inspectorName:
              row[5],

            remark:
              row[6],

            solution:
              row[7],

            documentCode:
              row[8],

            documentName:
              row[9],

            documentNo:
              row[10],

            createdAt:
              formatDateTimeValue(row[11]),

            createdBy:
              row[12],

            documentStatus:
              row[13],

            fileId:
              row[14],

            fileUrl:
              row[15],

            fileName:
              row[16],

            pointId:
              row[17] || ""

          };

        });


    return {

      success: true,

      inspections:
        inspections,

      permission: {

        isAdmin:
          user.isAdmin,

        inspectorName:
          user.isAdmin
            ? requestedInspector
            : user.name

      }

    };


  } catch (error) {

    return {

      success: false,

      message:
        error.message,

      inspections: []

    };

  }

}


// ======================================================
// UPDATE INSPECTION
// ======================================================
// VERSION 2.1.1
//
// Permission:
// - Admin แก้ได้ทั้งหมด
// - User แก้ได้เฉพาะรายการของตัวเอง
//
// ข้อมูลที่ล็อก:
// - recordId เดิม
// - วันที่เดิม
// - เวลาเดิม
// - Zone เดิม
// - Location เดิม
// - Inspector เดิม
// - pointId เดิม
//
// แก้ได้เฉพาะ:
// - remark
// - solution
// - inspection results
// ======================================================

function updateInspection(inspectionData) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const inspectionSheet =
    ss.getSheetByName("Inspections");

  const itemSheet =
    ss.getSheetByName("InspectionItems");


  if (
    !inspectionSheet ||
    !itemSheet
  ) {

    return {

      success: false,

      message:
        "ไม่พบ Sheet Inspections หรือ InspectionItems"

    };

  }


  if (
    !inspectionData ||
    !inspectionData.recordId
  ) {

    return {

      success: false,

      message:
        "ไม่พบ recordId"

    };

  }


  try {

    // --------------------------------------------
    // ตรวจสอบ User
    // --------------------------------------------

    const requesterEmail =
      String(
        inspectionData.updatedByEmail ||
        ""
      ).trim();


    const userResult =
      getInspectionUserByEmail(
        requesterEmail
      );


    if (!userResult.success) {

      return {

        success: false,

        message:
          userResult.message

      };

    }


    const user =
      userResult.user;


    // --------------------------------------------
    // อ่าน Inspections
    // --------------------------------------------

    const data =
      inspectionSheet
        .getDataRange()
        .getValues();


    let targetRow =
      -1;


    for (
      let i = 1;
      i < data.length;
      i++
    ) {

      if (
        String(data[i][0]).trim()
        ===
        String(
          inspectionData.recordId
        ).trim()
      ) {

        targetRow =
          i + 1;

        break;

      }

    }


    if (targetRow === -1) {

      return {

        success: false,

        message:
          "ไม่พบข้อมูลการตรวจที่ต้องการแก้ไข"

      };

    }


    const existingRow =
      data[targetRow - 1];


    // --------------------------------------------
    // สร้าง Object สำหรับตรวจ Permission
    // --------------------------------------------

    const existingInspection = {

      recordId:
        existingRow[0],

      inspectionDate:
        existingRow[1],

      inspectionTime:
        existingRow[2],

      zone:
        existingRow[3],

      locationName:
        existingRow[4],

      inspectorName:
        existingRow[5],

      pointId:
        existingRow[17] || ""

    };


    // --------------------------------------------
    // Permission
    // --------------------------------------------

    const permission =
      authorizeInspectionAccess(
        existingInspection,
        user
      );


    if (!permission.success) {

      return permission;

    }


    // --------------------------------------------
    // ข้อมูลเดิม
    // --------------------------------------------

    const recordId =
      existingRow[0];


    const existingFileId =
      existingRow[14] || "";


    const existingFileUrl =
      existingRow[15] || "";


    const existingFileName =
      existingRow[16] || "";


    // --------------------------------------------
    // ข้อมูลที่อนุญาตให้แก้
    // --------------------------------------------

    const newRemark =
      inspectionData.remark !== undefined
        ? inspectionData.remark
        : existingRow[6];


    const newSolution =
      inspectionData.solution !== undefined
        ? inspectionData.solution
        : existingRow[7];


    const existingPointId =
      existingRow[17] || "";


    // --------------------------------------------
    // เขียนข้อมูลหลัก A:R
    // --------------------------------------------

    inspectionSheet
      .getRange(
        targetRow,
        1,
        1,
        18
      )
      .setValues([[

        existingRow[0],
        existingRow[1],
        existingRow[2],
        existingRow[3],
        existingRow[4],
        existingRow[5],

        newRemark,
        newSolution,

        existingRow[8],
        existingRow[9],
        existingRow[10],
        existingRow[11],
        existingRow[12],
        existingRow[13],

        existingFileId,
        existingFileUrl,
        existingFileName,

        existingPointId

      ]]);


    // --------------------------------------------
    // อ่าน InspectionItems
    // --------------------------------------------

    const itemData =
      itemSheet
        .getDataRange()
        .getValues();


    const existingItems = [];


    for (
      let i = 1;
      i < itemData.length;
      i++
    ) {

      if (
        String(itemData[i][0]).trim()
        ===
        String(recordId).trim()
      ) {

        existingItems.push({

          rowNumber:
            i + 1,

          itemNo:
            itemData[i][1],

          item:
            itemData[i][2],

          result:
            itemData[i][3]

        });

      }

    }


    const incomingItems =
      Array.isArray(
        inspectionData.items
      )
        ? inspectionData.items
        : [];


    const incomingResults = {};


    incomingItems.forEach(
      function(item) {

        if (!item) {
          return;
        }


        const itemNo =
          String(
            item.itemNo || ""
          ).trim();


        if (!itemNo) {
          return;
        }


        incomingResults[itemNo] =
          item.result || "";

      }
    );


    const updatedItemRows =
      existingItems.map(
        function(existingItem) {

          const itemNo =
            String(
              existingItem.itemNo || ""
            ).trim();


          const newResult =
            Object.prototype.hasOwnProperty.call(
              incomingResults,
              itemNo
            )
              ? incomingResults[itemNo]
              : existingItem.result;


          return [

            recordId,

            existingItem.itemNo,

            existingItem.item,

            newResult

          ];

        }
      );


    if (
      existingItems.length === 0 &&
      incomingItems.length > 0
    ) {

      return {

        success: false,

        message:
          "ไม่พบรายการตรวจเดิม ไม่สามารถแก้ไขผลตรวจได้"

      };

    }


    // --------------------------------------------
    // ลบ Items เดิม
    // --------------------------------------------

    const rowsToDelete = [];


    for (
      let i = itemData.length - 1;
      i >= 1;
      i--
    ) {

      if (
        String(itemData[i][0]).trim()
        ===
        String(recordId).trim()
      ) {

        rowsToDelete.push(
          i + 1
        );

      }

    }


    rowsToDelete.forEach(
      function(rowNumber) {

        itemSheet.deleteRow(
          rowNumber
        );

      }
    );


    // --------------------------------------------
    // เพิ่ม Items ใหม่
    // --------------------------------------------

    if (
      updatedItemRows.length > 0
    ) {

      itemSheet
        .getRange(
          itemSheet.getLastRow() + 1,
          1,
          updatedItemRows.length,
          4
        )
        .setValues(
          updatedItemRows
        );

    }


    // --------------------------------------------
    // Log
    // --------------------------------------------

    addLog(

      user.email,

      "UPDATE_INSPECTION",

      recordId

    );


    return {

      success: true,

      message:
        "แก้ไขข้อมูลการตรวจสำเร็จ",

      recordId:
        recordId,

      pointId:
        existingPointId,

      itemCount:
        updatedItemRows.length

    };


  } catch (error) {

    console.error(
      "updateInspection Error:",
      error
    );


    return {

      success: false,

      message:
        error.message

    };

  }

}


// ======================================================
// GET INSPECTION ITEMS
// ======================================================
//
// NOTE:
// ฟังก์ชันนี้ยังคง Signature เดิม:
//
//   getInspectionItems(recordId)
//
// เนื่องจาก code.gs / Frontend ปัจจุบัน
// ยังเรียกด้วย recordId เท่านั้น
//
// Permission ของ getInspectionItems จะถูก harden
// ในรอบที่แก้ code.gs + api.js พร้อมกัน
// เพื่อไม่ให้เกิด API mismatch
// ======================================================

function getInspectionItems(recordId) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName("InspectionItems");


  if (!sheet) {

    return {

      success: false,

      message:
        "ไม่พบ Sheet InspectionItems"

    };

  }


  if (!recordId) {

    return {

      success: false,

      message:
        "ไม่พบ recordId"

    };

  }


  try {

    const data =
      sheet
        .getDataRange()
        .getValues();


    if (data.length <= 1) {

      return {

        success: true,

        items: []

      };

    }


    const items =
      data
        .slice(1)
        .filter(function(row) {

          return String(row[0])
            ===
            String(recordId);

        })
        .map(function(row) {

          return {

            recordId:
              row[0],

            itemNo:
              row[1],

            item:
              row[2],

            result:
              row[3]

          };

        });


    return {

      success: true,

      items:
        items

    };


  } catch (error) {

    return {

      success: false,

      message:
        error.message

    };

  }

}


// ======================================================
// DELETE INSPECTION
// ======================================================
// VERSION 2.1.1
//
// Permission:
// - Admin ลบได้ทุกคน
// - User ลบได้เฉพาะของตัวเอง
//
// Business Rule เดิม:
// - ถ้ามีเอกสารแล้ว → ลบไม่ได้
//
// IMPORTANT:
// - requesterEmail ต้องมาจาก Session / API
// - ไม่ใช้ deletedBy จาก Frontend เป็นตัวตัดสินสิทธิ์
// ======================================================

function deleteInspection(
  recordId,
  requesterEmail
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const inspectionSheet =
    ss.getSheetByName("Inspections");

  const itemSheet =
    ss.getSheetByName("InspectionItems");


  if (
    !inspectionSheet ||
    !itemSheet
  ) {

    return {

      success: false,

      message:
        "ไม่พบ Sheet Inspections หรือ InspectionItems"

    };

  }


  if (!recordId) {

    return {

      success: false,

      message:
        "ไม่พบ recordId"

    };

  }


  try {

    // --------------------------------------------
    // ตรวจสอบ User
    // --------------------------------------------

    const userResult =
      getInspectionUserByEmail(
        requesterEmail
      );


    if (!userResult.success) {

      return {

        success: false,

        message:
          userResult.message

      };

    }


    const user =
      userResult.user;


    // --------------------------------------------
    // อ่าน Inspection
    // --------------------------------------------

    const data =
      inspectionSheet
        .getDataRange()
        .getValues();


    let targetRow =
      -1;


    let existingInspection =
      null;


    for (
      let i = 1;
      i < data.length;
      i++
    ) {

      if (
        String(data[i][0]).trim()
        ===
        String(recordId).trim()
      ) {

        targetRow =
          i + 1;


        existingInspection = {

          recordId:
            data[i][0],

          inspectionDate:
            data[i][1],

          inspectionTime:
            data[i][2],

          zone:
            data[i][3],

          locationName:
            data[i][4],

          inspectorName:
            data[i][5],

          documentNo:
            data[i][10],

          documentStatus:
            data[i][13],

          fileId:
            data[i][14],

          fileUrl:
            data[i][15],

          fileName:
            data[i][16],

          pointId:
            data[i][17] || ""

        };


        break;

      }

    }


    if (targetRow === -1) {

      return {

        success: false,

        message:
          "ไม่พบข้อมูลการตรวจที่ต้องการลบ"

      };

    }


    // --------------------------------------------
    // Permission
    // --------------------------------------------

    const permission =
      authorizeInspectionAccess(
        existingInspection,
        user
      );


    if (!permission.success) {

      return permission;

    }


    // --------------------------------------------
    // ห้ามลบถ้าสร้างเอกสารแล้ว
    // --------------------------------------------

    if (
      existingInspection.fileId ||
      existingInspection.fileUrl
    ) {

      return {

        success: false,

        message:
          "รายการตรวจนี้ถูกสร้างเป็นเอกสารแล้ว ไม่สามารถลบได้"

      };

    }


    // --------------------------------------------
    // ลบ InspectionItems
    // --------------------------------------------

    const itemData =
      itemSheet
        .getDataRange()
        .getValues();


    const rowsToDelete = [];


    for (
      let i = itemData.length - 1;
      i >= 1;
      i--
    ) {

      if (
        String(itemData[i][0]).trim()
        ===
        String(recordId).trim()
      ) {

        rowsToDelete.push(
          i + 1
        );

      }

    }


    rowsToDelete.forEach(
      function(rowNumber) {

        itemSheet.deleteRow(
          rowNumber
        );

      }
    );


    // --------------------------------------------
    // ลบ Inspection หลัก
    // --------------------------------------------

    inspectionSheet.deleteRow(
      targetRow
    );


    // --------------------------------------------
    // Log
    // --------------------------------------------

    addLog(

      user.email,

      "DELETE_INSPECTION",

      recordId

    );


    return {

      success: true,

      message:
        "ลบข้อมูลการตรวจสำเร็จ",

      recordId:
        recordId,

      deletedItems:
        rowsToDelete.length

    };


  } catch (error) {

    return {

      success: false,

      message:
        error.message

    };

  }

}


// ======================================================
// GENERATE INSPECTION DOCUMENT NO
// ======================================================

function generateInspectionDocumentNo() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName("Inspections");


  if (!sheet) {

    throw new Error(
      "ไม่พบ Sheet Inspections"
    );

  }


  const year =
    new Date().getFullYear();


  const prefix =
    "OP-" + year + "-";


  const lastRow =
    sheet.getLastRow();


  if (lastRow <= 1) {

    return prefix + "00001";

  }


  const documentNoValues =
    sheet
      .getRange(
        2,
        11,
        lastRow - 1,
        1
      )
      .getValues();


  let maxNumber = 0;


  documentNoValues.forEach(
    function(row) {

      const documentNo =
        String(
          row[0] || ""
        ).trim();


      if (
        documentNo.startsWith(prefix)
      ) {

        const numberPart =
          documentNo.substring(
            prefix.length
          );


        const number =
          parseInt(
            numberPart,
            10
          );


        if (
          !isNaN(number) &&
          number > maxNumber
        ) {

          maxNumber =
            number;

        }

      }

    }
  );


  const nextNumber =
    maxNumber + 1;


  return (

    prefix +

    String(
      nextNumber
    ).padStart(
      5,
      "0"
    )

  );

}


// ======================================================
// GET INSPECTION ITEMS BY RECORD ID
// ======================================================
//
// ใช้สำหรับ Internal / Existing Flow
// ไม่เปลี่ยน behavior เดิม
// ======================================================

function getInspectionItemsByRecordId(recordId) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName("InspectionItems");


  if (!sheet) {

    throw new Error(
      "ไม่พบ Sheet: InspectionItems"
    );

  }


  const data =
    sheet
      .getDataRange()
      .getValues();


  if (data.length < 2) {
    return [];
  }


  const headers =
    data[0];


  const recordIdIndex =
    headers.indexOf("recordId");

  const itemNoIndex =
    headers.indexOf("itemNo");

  const itemIndex =
    headers.indexOf("item");

  const resultIndex =
    headers.indexOf("result");


  if (recordIdIndex === -1) {

    throw new Error(
      "ไม่พบ column: recordId"
    );

  }


  const items = [];


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    const row =
      data[i];


    if (
      String(
        row[recordIdIndex]
      ).trim()
      ===
      String(recordId).trim()
    ) {

      items.push({

        itemNo:
          itemNoIndex !== -1
            ? row[itemNoIndex]
            : "",

        item:
          itemIndex !== -1
            ? row[itemIndex]
            : "",

        result:
          resultIndex !== -1
            ? row[resultIndex]
            : ""

      });

    }

  }


  return items;

}