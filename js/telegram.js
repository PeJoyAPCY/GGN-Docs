// ======================================================
// GGN DOCS - TELEGRAM FRONTEND
// VERSION: 1.1.0
// DATE: 2026-10-10
//
// PURPOSE:
// - เตรียมรูปภาพรวมท้ายรายงานสำหรับ Telegram
// - อ่านรูปจาก #inspection-photos
// - Resize / Compress รูปเป็น JPEG
// - แปลงรูปเป็น Base64 เพื่อส่งผ่าน API
// - ไม่เก็บรูปใน Google Drive
// - ไม่ให้ Frontend ติดต่อ Telegram โดยตรง
//
// LIMIT:
// - สูงสุด 10 รูปต่อรายงาน
//
// DATA CONTRACT:
// {
//   data: "...Base64...",
//   mimeType: "image/jpeg",
//   fileName: "inspection-1.jpg"
// }
//
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const TELEGRAM_MAX_PHOTOS_PER_REPORT = 10;

const TELEGRAM_IMAGE_MAX_WIDTH = 1600;

const TELEGRAM_IMAGE_MAX_HEIGHT = 1600;

const TELEGRAM_IMAGE_QUALITY = 0.80;


// ใช้ชื่อเดิมชั่วคราวเพื่อไม่ให้โค้ดเดิม
// ที่อาจยังอ้างถึงชื่อนี้เกิด ReferenceError
const TELEGRAM_MAX_PHOTOS_PER_ITEM =
    TELEGRAM_MAX_PHOTOS_PER_REPORT;


// ======================================================
// FILE / BLOB -> BASE64
// ======================================================

function fileToBase64(file) {

    return new Promise(function(resolve, reject) {

        if (!file) {

            reject(
                new Error("ไม่พบไฟล์รูปภาพ")
            );

            return;

        }

        const reader = new FileReader();

        reader.onload = function() {

            const result = String(
                reader.result || ""
            );

            const commaIndex = result.indexOf(",");

            if (commaIndex === -1) {

                reject(
                    new Error(
                        "ไม่สามารถแปลงรูปภาพเป็น Base64 ได้"
                    )
                );

                return;

            }

            resolve(
                result.substring(commaIndex + 1)
            );

        };

        reader.onerror = function() {

            reject(
                new Error(
                    "เกิดข้อผิดพลาดขณะอ่านรูปภาพ"
                )
            );

        };

        reader.readAsDataURL(file);

    });

}


// ======================================================
// LOAD IMAGE FROM FILE
// ======================================================

function loadImageFromFile(file) {

    return new Promise(function(resolve, reject) {

        const objectUrl = URL.createObjectURL(file);

        const image = new Image();

        image.onload = function() {

            URL.revokeObjectURL(objectUrl);

            if (
                !image.naturalWidth ||
                !image.naturalHeight
            ) {

                reject(
                    new Error(
                        "รูปภาพไม่มีขนาดที่ถูกต้อง"
                    )
                );

                return;

            }

            resolve(image);

        };

        image.onerror = function() {

            URL.revokeObjectURL(objectUrl);

            reject(
                new Error(
                    "ไม่สามารถเปิดรูปภาพได้"
                )
            );

        };

        image.src = objectUrl;

    });

}


// ======================================================
// RESIZE / COMPRESS IMAGE
// ======================================================

async function resizeTelegramImage(file) {

    const image = await loadImageFromFile(file);

    const originalWidth = image.naturalWidth;

    const originalHeight = image.naturalHeight;

    const ratio = Math.min(
        TELEGRAM_IMAGE_MAX_WIDTH / originalWidth,
        TELEGRAM_IMAGE_MAX_HEIGHT / originalHeight,
        1
    );

    const width = Math.max(
        1,
        Math.round(originalWidth * ratio)
    );

    const height = Math.max(
        1,
        Math.round(originalHeight * ratio)
    );

    const canvas = document.createElement("canvas");

    canvas.width = width;

    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {

        throw new Error(
            "ไม่สามารถเตรียมพื้นที่ประมวลผลรูปภาพได้"
        );

    }

    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );

    const blob = await new Promise(function(resolve) {

        canvas.toBlob(
            resolve,
            "image/jpeg",
            TELEGRAM_IMAGE_QUALITY
        );

    });

    if (!blob) {

        throw new Error(
            "ไม่สามารถบีบอัดรูปภาพได้"
        );

    }

    return blob;

}


// ======================================================
// PREPARE ONE PHOTO
// ======================================================

async function prepareTelegramPhoto(file, index) {

    if (!file) {

        throw new Error(
            "ไม่พบไฟล์รูปภาพ"
        );

    }

    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        throw new Error(
            "ไฟล์ที่เลือกไม่ใช่รูปภาพที่รองรับ"
        );

    }

    const resizedBlob = await resizeTelegramImage(file);

    const base64 = await fileToBase64(resizedBlob);

    return {

        data: base64,

        mimeType: "image/jpeg",

        fileName:
            "inspection-" +
            String(index + 1) +
            ".jpg"

    };

}


// ======================================================
// VALIDATE PHOTO COUNT
// ======================================================

function validateTelegramPhotoCount(files) {

    const count = files
        ? files.length
        : 0;

    if (count > TELEGRAM_MAX_PHOTOS_PER_REPORT) {

        return {

            valid: false,

            message:
                "แนบรูปภาพรวมท้ายรายงานได้สูงสุด " +
                TELEGRAM_MAX_PHOTOS_PER_REPORT +
                " รูป"

        };

    }

    return {

        valid: true,

        message: ""

    };

}


// ======================================================
// PREPARE MULTIPLE PHOTOS
// ======================================================
//
// Return:
// [
//   {
//     data: "...Base64...",
//     mimeType: "image/jpeg",
//     fileName: "inspection-1.jpg"
//   }
// ]
//
// ======================================================

async function prepareTelegramPhotos(files) {

    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) {

        return [];

    }

    const validation = validateTelegramPhotoCount(
        selectedFiles
    );

    if (!validation.valid) {

        throw new Error(validation.message);

    }

    const photos = [];

    for (
        let index = 0;
        index < selectedFiles.length;
        index++
    ) {

        const photo = await prepareTelegramPhoto(
            selectedFiles[index],
            index
        );

        photos.push(photo);

    }

    return photos;

}


// ======================================================
// GET PHOTOS FROM INPUT
// ======================================================
//
// ใช้กับ:
// <input
//   type="file"
//   id="inspection-photos"
//   accept="image/*"
//   multiple
// >
//
// ======================================================

async function getTelegramPhotosFromInput(input) {

    if (!input) {

        return [];

    }

    return await prepareTelegramPhotos(
        input.files || []
    );

}


// ======================================================
// PREVIEW PHOTOS
// ======================================================
//
// ใช้แสดงตัวอย่างรูปก่อนบันทึก
// รองรับทั้ง FileList และ Array ของ File
//
// ======================================================

function createTelegramPhotoPreview(files, container) {

    if (!container) {

        return;

    }

    // คืนหน่วยความจำของ Preview URL เดิม
    container
        .querySelectorAll("[data-preview-url]")
        .forEach(function(image) {

            const oldUrl = image.dataset.previewUrl;

            if (oldUrl) {

                URL.revokeObjectURL(oldUrl);

            }

        });

    container.innerHTML = "";

    const selectedFiles = Array.from(files || []);

    selectedFiles.forEach(function(file) {

        if (
            !file ||
            !file.type ||
            !file.type.startsWith("image/")
        ) {

            return;

        }

        const objectUrl = URL.createObjectURL(file);

        const image = document.createElement("img");

        image.src = objectUrl;

        image.alt = file.name || "Inspection photo";

        image.className = "inspection-photo-preview";

        image.dataset.previewUrl = objectUrl;

        container.appendChild(image);

    });

}


// ======================================================
// LEGACY COMPATIBILITY
// ======================================================
//
// เก็บฟังก์ชันนี้ไว้ชั่วคราวเพื่อไม่ให้โค้ดเดิม
// ที่อาจเรียกใช้อยู่เกิด ReferenceError
//
// Workflow ใหม่จะใช้ #inspection-photos
// ไม่ใช้การรวบรวมรูปแยกตามรายการตรวจ
//
// ======================================================

function createTelegramPhotoInput(itemNo) {

    const input = document.createElement("input");

    input.type = "file";

    input.accept = "image/*";

    input.multiple = true;

    input.className = "inspection-photo-input";

    input.dataset.itemNo = String(itemNo);

    return input;

}


// ======================================================
// LEGACY COMPATIBILITY
// ======================================================
//
// คงชื่อฟังก์ชันเดิมระหว่างปรับ inspections.js
// ไม่ควรนำผลลัพธ์นี้ไปใช้กับ Workflow รูปภาพรวมท้ายรายงาน
//
// ======================================================

async function collectTelegramPhotos(itemInputs) {

    const items = [];

    for (const input of Array.from(itemInputs || [])) {

        const itemNo = Number(
            input.dataset.itemNo
        );

        const photos = await getTelegramPhotosFromInput(
            input
        );

        items.push({

            itemNo: itemNo,

            photos: photos

        });

    }

    return items;

}