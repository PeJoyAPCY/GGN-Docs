// ======================================================
// GGN DOCS - TELEGRAM FRONTEND
// VERSION: 1.0.0
//
// PURPOSE:
// - จัดการรูปภาพสำหรับ Telegram
// - รองรับหลายรูปต่อ Inspection Item
// - แปลง File -> Base64
// - Resize / Compress รูปก่อนส่ง Backend
//
// IMPORTANT:
// - ไม่มี Telegram Bot Token ในไฟล์นี้
// - Frontend ไม่ติดต่อ Telegram โดยตรง
// - รูปจะถูกส่งไป Apps Script ผ่าน API
// ======================================================


// ========================================
// CONFIG
// ========================================

const TELEGRAM_MAX_PHOTOS_PER_ITEM = 10;

const TELEGRAM_IMAGE_MAX_WIDTH = 1600;

const TELEGRAM_IMAGE_MAX_HEIGHT = 1600;

const TELEGRAM_IMAGE_QUALITY = 0.80;


// ========================================
// FILE -> BASE64
// ========================================

function fileToBase64(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const result =
            String(
              reader.result || ""
            );


          const commaIndex =
            result.indexOf(",");


          if (
            commaIndex === -1
          ) {

            reject(
              new Error(
                "ไม่สามารถอ่านรูปภาพได้"
              )
            );

            return;

          }


          resolve(
            result.substring(
              commaIndex + 1
            )
          );

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "เกิดข้อผิดพลาดขณะอ่านรูปภาพ"
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


// ========================================
// LOAD IMAGE
// ========================================

function loadImageFromFile(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const url =
        URL.createObjectURL(
          file
        );


      const image =
        new Image();


      image.onload =
        function () {

          URL.revokeObjectURL(
            url
          );

          resolve(
            image
          );

        };


      image.onerror =
        function () {

          URL.revokeObjectURL(
            url
          );

          reject(
            new Error(
              "ไม่สามารถเปิดรูปภาพได้"
            )
          );

        };


      image.src =
        url;

    }
  );

}


// ========================================
// RESIZE IMAGE
// ========================================

async function resizeTelegramImage(
  file
) {

  const image =
    await loadImageFromFile(
      file
    );


  let width =
    image.naturalWidth;

  let height =
    image.naturalHeight;


  const maxWidth =
    TELEGRAM_IMAGE_MAX_WIDTH;

  const maxHeight =
    TELEGRAM_IMAGE_MAX_HEIGHT;


  const ratio =
    Math.min(

      maxWidth /
        width,

      maxHeight /
        height,

      1

    );


  width =
    Math.round(
      width * ratio
    );


  height =
    Math.round(
      height * ratio
    );


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    width;

  canvas.height =
    height;


  const context =
    canvas.getContext(
      "2d"
    );


  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );


  const blob =
    await new Promise(
      resolve => {

        canvas.toBlob(
          resolve,
          "image/jpeg",
          TELEGRAM_IMAGE_QUALITY
        );

      }
    );


  if (!blob) {

    throw new Error(
      "ไม่สามารถประมวลผลรูปภาพได้"
    );

  }


  return blob;

}


// ========================================
// PREPARE ONE PHOTO
// ========================================

async function prepareTelegramPhoto(
  file,
  index
) {

  if (
    !file
  ) {

    throw new Error(
      "ไม่พบไฟล์รูปภาพ"
    );

  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    throw new Error(
      "ไฟล์ที่เลือกไม่ใช่รูปภาพ"
    );

  }


  const resizedBlob =
    await resizeTelegramImage(
      file
    );


  const base64 =
    await fileToBase64(
      resizedBlob
    );


  return {

    data:
      base64,

    mimeType:
      "image/jpeg",

    fileName:
      "inspection-" +
      String(
        index + 1
      ) +
      ".jpg"

  };

}


// ========================================
// PREPARE MULTIPLE PHOTOS
// ========================================

async function prepareTelegramPhotos(
  files
) {

  if (
    !files ||
    files.length === 0
  ) {

    return [];

  }


  if (
    files.length >
    TELEGRAM_MAX_PHOTOS_PER_ITEM
  ) {

    throw new Error(
      "เลือกรูปได้สูงสุด " +
      TELEGRAM_MAX_PHOTOS_PER_ITEM +
      " รูปต่อรายการตรวจ"
    );

  }


  const photos = [];


  for (
    let i = 0;
    i < files.length;
    i++
  ) {

    const photo =
      await prepareTelegramPhoto(
        files[i],
        i
      );


    photos.push(
      photo
    );

  }


  return photos;

}


// ========================================
// GET FILE INPUT FILES
// ========================================

async function getTelegramPhotosFromInput(
  input
) {

  if (
    !input
  ) {

    return [];

  }


  const files =
    Array.from(
      input.files || []
    );


  return prepareTelegramPhotos(
    files
  );

}


// ========================================
// CREATE PHOTO INPUT
// ========================================
//
// ใช้สำหรับสร้าง input
// แบบหลายรูปด้วย JavaScript
// ========================================

function createTelegramPhotoInput(
  itemNo
) {

  const input =
    document.createElement(
      "input"
    );


  input.type =
    "file";

  input.accept =
    "image/*";

  input.multiple =
    true;

  input.className =
    "inspection-photo-input";


  input.dataset.itemNo =
    String(
      itemNo
    );


  return input;

}


// ========================================
// CREATE PHOTO PREVIEW
// ========================================

function createTelegramPhotoPreview(
  files,
  container
) {

  if (
    !container
  ) {

    return;

  }


  container.innerHTML =
    "";


  Array.from(
    files || []
  ).forEach(
    file => {

      const url =
        URL.createObjectURL(
          file
        );


      const image =
        document.createElement(
          "img"
        );


      image.src =
        url;


      image.alt =
        file.name ||
        "Inspection photo";


      image.className =
        "inspection-photo-preview";


      container.appendChild(
        image
      );

    }
  );

}


// ========================================
// COLLECT PHOTOS FROM ITEM INPUTS
// ========================================
//
// Return:
//
// [
//   {
//     itemNo: 1,
//     photos: [...]
//   }
// ]
//
// ฟังก์ชันนี้จะถูกใช้โดย
// inspections.js
// ========================================

async function collectTelegramPhotos(
  itemInputs
) {

  const items = [];


  for (
    const input of itemInputs
  ) {

    const itemNo =
      Number(
        input.dataset.itemNo
      );


    const photos =
      await getTelegramPhotosFromInput(
        input
      );


    items.push({

      itemNo:
        itemNo,

      photos:
        photos

    });

  }


  return items;

}


// ========================================
// VALIDATE PHOTO COUNT
// ========================================

function validateTelegramPhotoCount(
  files
) {

  const count =
    files
      ? files.length
      : 0;


  if (
    count >
    TELEGRAM_MAX_PHOTOS_PER_ITEM
  ) {

    return {

      valid:
        false,

      message:
        "แต่ละรายการตรวจสามารถแนบรูปได้สูงสุด " +
        TELEGRAM_MAX_PHOTOS_PER_ITEM +
        " รูป"

    };

  }


  return {

    valid:
      true,

    message:
      ""

  };

}
