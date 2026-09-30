
// ========================================
// GLOBAL DATA
// ========================================

let documents = [];


// ========================================
// INSPECTION DATA
// ========================================

// จุดตรวจทั้งหมด
let inspectionLocations = [];

let inspectionRecords = [];

// เขตทั้งหมด
let inspectionZones = [];

// ผู้ตรวจ / สายตรวจทั้งหมด
let inspectionInspectors = [];

// รายการตรวจทั้งหมด
let inspectionItems = [];


// ========================================
// INSPECTION STATE
// ========================================

// ป้องกันการโหลด Settings ซ้ำโดยไม่จำเป็น
let inspectionSettingsLoaded = false;

// ป้องกันการโหลด LocationMaster ซ้ำโดยไม่จำเป็น
let inspectionLocationsLoaded = false;

// ป้องกันการ initialize หน้า Inspection ซ้ำ
let inspectionPageInitialized = false;

// ป้องกันการ initialize Inspection ซ้อนกัน
let inspectionInitializationPromise = null;

// ========================================
// INSPECTION EDIT STATE
// ========================================

let editingInspectionRecordId = null;

// เก็บข้อมูลรายการเดิมขณะกำลังแก้ไข
let editingInspectionData = null;

// create = สร้างรายการใหม่
// edit   = แก้ไขรายการเดิม
let inspectionMode = "create";