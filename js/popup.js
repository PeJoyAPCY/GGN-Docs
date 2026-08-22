// ======================================================
// GGN DOCS
// GLOBAL POPUP SYSTEM
// ======================================================


// ======================================================
// SETUP POPUP
// ======================================================

function setupPopup() {

    const popup =
        document.getElementById(
            "global-popup"
        );


    if (!popup) {

        console.warn(
            "ไม่พบ #global-popup"
        );

        return;

    }


    // ----------------------------------------
    // CLOSE BUTTON
    // ----------------------------------------

    const closeButton =
        popup.querySelector(
            ".popup-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePopup
        );

    }


    // ----------------------------------------
    // BACKDROP CLICK
    // ----------------------------------------

    popup.addEventListener(
        "click",
        function (event) {

            if (
                event.target === popup
            ) {

                closePopup();

            }

        }
    );


    // ----------------------------------------
    // ESC KEY
    // ----------------------------------------

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closePopup();

            }

        }
    );


    console.log(
        "เตรียมระบบ Popup สำเร็จ"
    );

}


// ======================================================
// OPEN POPUP
// ======================================================

function openPopup(
    content,
    options = {}
) {

    const popup =
        document.getElementById(
            "global-popup"
        );


    const popupBody =
        document.getElementById(
            "global-popup-body"
        );


    if (!popup) {

        console.warn(
            "ไม่พบ #global-popup"
        );

        return;

    }


    if (!popupBody) {

        console.warn(
            "ไม่พบ #global-popup-body"
        );

        return;

    }


    // ----------------------------------------
    // SET CONTENT
    // ----------------------------------------

    popupBody.innerHTML =
        content || "";


    // ----------------------------------------
    // POPUP TITLE
    // ----------------------------------------

    const titleElement =
        document.getElementById(
            "global-popup-title"
        );


    if (titleElement) {

        titleElement.textContent =
            options.title ||
            "";

    }


    // ----------------------------------------
    // SIZE
    // ----------------------------------------

    const popupContent =
        popup.querySelector(
            ".popup-content"
        );


    if (popupContent) {

        popupContent.classList.remove(
            "popup-small",
            "popup-medium",
            "popup-large",
            "popup-full"
        );


        const size =
            options.size ||
            "medium";


        popupContent.classList.add(
            `popup-${size}`
        );

    }


    // ----------------------------------------
    // SHOW
    // ----------------------------------------

    popup.classList.add(
        "show"
    );


    // ----------------------------------------
    // PREVENT BACKGROUND SCROLL
    // ----------------------------------------

    document.body.classList.add(
        "popup-open"
    );

}


// ======================================================
// CLOSE POPUP
// ======================================================

function closePopup() {

    const popup =
        document.getElementById(
            "global-popup"
        );


    if (!popup) {

        return;

    }


    popup.classList.remove(
        "show"
    );


    // ----------------------------------------
    // RESTORE BACKGROUND SCROLL
    // ----------------------------------------

    document.body.classList.remove(
        "popup-open"
    );


    // ----------------------------------------
    // CLEAR CONTENT
    // ----------------------------------------

    const popupBody =
        document.getElementById(
            "global-popup-body"
        );


    if (popupBody) {

        popupBody.innerHTML =
            "";

    }


    const titleElement =
        document.getElementById(
            "global-popup-title"
        );


    if (titleElement) {

        titleElement.textContent =
            "";

    }

}


// ======================================================
// END POPUP SYSTEM
// ======================================================