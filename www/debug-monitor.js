// ============================================================
// MK CHAT - DEBUG MONITOR
// Temporary on-screen console
// ============================================================

(function () {

    function createMonitor() {

        let box =
            document.getElementById("mk-debug-monitor");

        if (box) return box;

        box = document.createElement("div");

        box.id = "mk-debug-monitor";

        box.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            background: #111;
            color: #00ff66;
            padding: 12px;
            border: 2px solid #00ff66;
            border-radius: 10px;
            z-index: 9999999;
            font-family: monospace;
            font-size: 13px;
            overflow-y: auto;
            white-space: pre-wrap;
            box-sizing: border-box;
        `;

        const title =
            document.createElement("div");

        title.textContent =
            "🛠️ MK CHAT DEBUG MONITOR";

        title.style.cssText = `
            font-weight: bold;
            color: #00ffff;
            margin-bottom: 10px;
        `;

        box.appendChild(title);

        const close =
            document.createElement("button");

        close.textContent = "✕ CLOSE";

        close.style.cssText = `
            position: fixed;
            top: 18px;
            right: 20px;
            z-index: 10000000;
            padding: 6px 10px;
            background: #333;
            color: white;
            border: 1px solid #aaa;
            border-radius: 6px;
        `;

        close.onclick = function () {
            box.remove();
            close.remove();
        };

        document.body.appendChild(box);
        document.body.appendChild(close);

        return box;
    }


    function debugLog(...args) {

        const box = createMonitor();

        const line =
            document.createElement("div");

        line.style.marginBottom = "8px";

        line.textContent =
            args.map(function (item) {

                if (
                    typeof item === "object"
                ) {

                    try {
                        return JSON.stringify(
                            item,
                            null,
                            2
                        );
                    }

                    catch {
                        return String(item);
                    }

                }

                return String(item);

            }).join(" ");

        box.appendChild(line);

        box.scrollTop =
            box.scrollHeight;
    }


    // Original console.log save karo
    const originalLog =
        console.log;

    console.log =
        function (...args) {

            originalLog.apply(
                console,
                args
            );

            debugLog(...args);

        };


    // Errors bhi screen par
    const originalError =
        console.error;

    console.error =
        function (...args) {

            originalError.apply(
                console,
                args
            );

            debugLog(
                "❌ ERROR:",
                ...args
            );

        };


    window.MKDebug = {

        log: debugLog,

        clear: function () {

            const box =
                document.getElementById(
                    "mk-debug-monitor"
                );

            if (box) {
                box.innerHTML = "";
            }

        }

    };


})();
