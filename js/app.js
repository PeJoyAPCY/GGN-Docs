const API_URL = "https://script.google.com/macros/s/AKfycbz9EhtzTMEMO2QvXKpiBr2oFbHvwz7w6jPfY9NsWEwRPZFnGyAbM9nxXdYcaWxKvdK0rQ/exec";

async function testAPI() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        console.log("ข้อมูลจาก Google Apps Script:", data);

        document.getElementById("api-status").textContent =
            data.message;

    } catch (error) {
        console.error("เชื่อมต่อ API ไม่สำเร็จ:", error);

        document.getElementById("api-status").textContent =
            "ไม่สามารถเชื่อมต่อ Google Apps Script ได้";
    }
}

testAPI();