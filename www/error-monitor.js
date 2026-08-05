(function () {

    function showError(title, message) {

        let box = document.getElementById("mk-error-monitor");

        if (!box) {

            box = document.createElement("div");

            box.id = "mk-error-monitor";

            box.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                right: 10px;
                max-height: 85vh;
                overflow-y: auto;
                background: #111;
                color: #ff4444;
                padding: 15px;
                border: 2px solid #ff4444;
                border-radius: 10px;
                z-index: 999999;
                font-family: monospace;
                font-size: 14px;
                white-space: pre-wrap;
                box-sizing: border-box;
            `;

            document.body.appendChild(box);
        }

        const error = document.createElement("div");

        error.style.cssText = `
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #555;
        `;

        error.textContent =
            title + "\n\n" + message;

        box.appendChild(error);
    }


    // Normal JavaScript errors
    window.addEventListener("error", function (event) {

        showError(
            "❌ JAVASCRIPT ERROR",

            "Message: " +
            event.message +

            "\n\nFile: " +
            event.filename +

            "\n\nLine: " +
            event.lineno +

            "\nColumn: " +
            event.colno
        );

    });


    // Async / Promise errors
    window.addEventListener(
        "unhandledrejection",
        function (event) {

            let message;

            if (event.reason) {

                message =
                    event.reason.stack ||
                    event.reason.message ||
                    String(event.reason);

            } else {

                message = "Unknown Promise Error";

            }

            showError(
                "❌ PROMISE ERROR",
                message
            );

        }
    );

})();
