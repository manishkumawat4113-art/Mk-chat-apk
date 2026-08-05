// ============================================================
// MK CHAT - OFFLINE DATABASE
// Local browser/Android storage using IndexedDB
// ============================================================
alert("offline-db.js LOADED");
(function () {

    const DB_NAME = "MKChatOfflineDB";
    const DB_VERSION = 1;

    let db = null;

    // --------------------------------------------------------
    // OPEN DATABASE
    // --------------------------------------------------------

    function openDB() {

        return new Promise((resolve, reject) => {

            const request =
                indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = function (event) {

                const database = event.target.result;

                // -----------------------------
                // USERS
                // -----------------------------

                if (!database.objectStoreNames.contains("users")) {

                    const users =
                        database.createObjectStore(
                            "users",
                            { keyPath: "userId" }
                        );

                    users.createIndex(
                        "username",
                        "username",
                        { unique: false }
                    );
                }

                // -----------------------------
                // CHATS
                // -----------------------------

                if (!database.objectStoreNames.contains("chats")) {

                    const chats =
                        database.createObjectStore(
                            "chats",
                            { keyPath: "userId" }
                        );

                    chats.createIndex(
                        "lastMessageTime",
                        "lastMessageTime",
                        { unique: false }
                    );
                }

                // -----------------------------
                // MESSAGES
                // -----------------------------

                if (!database.objectStoreNames.contains("messages")) {

                    const messages =
                        database.createObjectStore(
                            "messages",
                            { keyPath: "localId" }
                        );

                    messages.createIndex(
                        "chatId",
                        "chatId",
                        { unique: false }
                    );

                    messages.createIndex(
                        "serverMessageId",
                        "serverMessageId",
                        { unique: false }
                    );

                    messages.createIndex(
                        "clientMessageId",
                        "clientMessageId",
                        { unique: false }
                    );

                    messages.createIndex(
                        "createdAt",
                        "createdAt",
                        { unique: false }
                    );

                    messages.createIndex(
                        "syncStatus",
                        "syncStatus",
                        { unique: false }
                    );
                }

                // -----------------------------
                // PENDING MESSAGES
                // -----------------------------

                if (!database.objectStoreNames.contains("pending")) {

                    const pending =
                        database.createObjectStore(
                            "pending",
                            { keyPath: "clientMessageId" }
                        );

                    pending.createIndex(
                        "createdAt",
                        "createdAt",
                        { unique: false }
                    );
                }

                // -----------------------------
                // APP SETTINGS
                // -----------------------------

                if (!database.objectStoreNames.contains("settings")) {

                    database.createObjectStore(
                        "settings",
                        { keyPath: "key" }
                    );
                }

            };

            request.onsuccess = function () {

                db = request.result;

                console.log(
                    "✅ MK Chat Offline Database Ready"
                );

                resolve(db);
            };

            request.onerror = function () {

                console.error(
                    "❌ Offline DB Error:",
                    request.error
                );

                reject(request.error);
            };

        });

    }


    // --------------------------------------------------------
    // DATABASE READY
    // --------------------------------------------------------

    async function ready() {

        if (db) {
            return db;
        }

        return await openDB();

    }


    // ========================================================
    // USERS
    // ========================================================

    async function saveUser(user) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const transaction =
                database.transaction(
                    ["users"],
                    "readwrite"
                );

            transaction.objectStore("users").put(user);

            transaction.oncomplete =
                () => resolve(true);

            transaction.onerror =
                () => reject(transaction.error);

        });

    }


    async function getUser(userId) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const request =
                database
                    .transaction("users", "readonly")
                    .objectStore("users")
                    .get(String(userId));

            request.onsuccess =
                () => resolve(request.result || null);

            request.onerror =
                () => reject(request.error);

        });

    }


    // ========================================================
    // CHAT LIST
    // ========================================================

    async function saveChat(chat) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const transaction =
                database.transaction(
                    ["chats"],
                    "readwrite"
                );

            transaction.objectStore("chats").put(chat);

            transaction.oncomplete =
                () => resolve(true);

            transaction.onerror =
                () => reject(transaction.error);

        });

    }


    async function getAllChats() {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const request =
                database
                    .transaction("chats", "readonly")
                    .objectStore("chats")
                    .getAll();

            request.onsuccess = function () {

                const chats = request.result || [];

                chats.sort(
                    (a, b) =>
                        new Date(b.lastMessageTime || 0) -
                        new Date(a.lastMessageTime || 0)
                );

                resolve(chats);

            };

            request.onerror =
                () => reject(request.error);

        });

    }


    // ========================================================
    // MESSAGES
    // ========================================================

    async function saveMessage(message) {

        const database = await ready();

        const localId =
            message.localId ||
            (
                message._id
                    ? String(message._id)
                    : "local_" +
                      Date.now() +
                      "_" +
                      Math.random()
                        .toString(36)
                        .substring(2)
            );

        const messageData = {

            ...message,

            localId: localId,

            serverMessageId:
                message.serverMessageId ||
                message._id ||
                null,

            clientMessageId:
                message.clientMessageId ||
                null,

            syncStatus:
                message.syncStatus ||
                (
                    message._id
                        ? "synced"
                        : "pending"
                )

        };

        return new Promise((resolve, reject) => {

            const transaction =
                database.transaction(
                    ["messages"],
                    "readwrite"
                );

            transaction
                .objectStore("messages")
                .put(messageData);

            transaction.oncomplete =
                () => resolve(messageData);

            transaction.onerror =
                () => reject(transaction.error);

        });

    }


    // ========================================================
    // GET CHAT MESSAGES
    // ========================================================

    async function getMessages(chatId) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const transaction =
                database.transaction(
                    ["messages"],
                    "readonly"
                );

            const index =
                transaction
                    .objectStore("messages")
                    .index("chatId");

            const request =
                index.getAll(String(chatId));

            request.onsuccess = function () {

                const messages =
                    request.result || [];

                messages.sort(
                    (a, b) =>
                        new Date(a.createdAt || 0) -
                        new Date(b.createdAt || 0)
                );

                resolve(messages);

            };

            request.onerror =
                () => reject(request.error);

        });

    }


    // ========================================================
    // UPDATE MESSAGE
    // ========================================================

    async function updateMessage(localId, updates) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const transaction =
                database.transaction(
                    ["messages"],
                    "readwrite"
                );

            const store =
                transaction.objectStore("messages");

            const request =
                store.get(localId);

            request.onsuccess = function () {

                const message = request.result;

                if (!message) {
                    resolve(false);
                    return;
                }

                Object.assign(message, updates);

                store.put(message);

            };

            transaction.oncomplete =
                () => resolve(true);

            transaction.onerror =
                () => reject(transaction.error);

        });

    }


    // ========================================================
    // PENDING MESSAGE
    // ========================================================

    async function savePendingMessage(message) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const transaction =
                database.transaction(
                    ["pending"],
                    "readwrite"
                );

            transaction
                .objectStore("pending")
                .put(message);

            transaction.oncomplete =
                () => resolve(true);

            transaction.onerror =
                () => reject(transaction.error);

        });

    }


    async function getPendingMessages() {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const request =
                database
                    .transaction("pending", "readonly")
                    .objectStore("pending")
                    .getAll();

            request.onsuccess =
                () => resolve(request.result || []);

            request.onerror =
                () => reject(request.error);

        });

    }


    async function removePendingMessage(clientMessageId) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const transaction =
                database.transaction(
                    ["pending"],
                    "readwrite"
                );

            transaction
                .objectStore("pending")
                .delete(clientMessageId);

            transaction.oncomplete =
                () => resolve(true);

            transaction.onerror =
                () => reject(transaction.error);

        });

    }


    // ========================================================
    // SETTINGS
    // ========================================================

    async function setSetting(key, value) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const transaction =
                database.transaction(
                    ["settings"],
                    "readwrite"
                );

            transaction
                .objectStore("settings")
                .put({
                    key: key,
                    value: value
                });

            transaction.oncomplete =
                () => resolve(true);

            transaction.onerror =
                () => reject(transaction.error);

        });

    }


    async function getSetting(key) {

        const database = await ready();

        return new Promise((resolve, reject) => {

            const request =
                database
                    .transaction("settings", "readonly")
                    .objectStore("settings")
                    .get(key);

            request.onsuccess = function () {

                resolve(
                    request.result
                        ? request.result.value
                        : null
                );

            };

            request.onerror =
                () => reject(request.error);

        });

    }


    // ========================================================
    // INTERNET STATUS
    // ========================================================

    function isOnline() {

        return navigator.onLine;

    }


    window.addEventListener(
        "online",
        function () {

            console.log(
                "🟢 MK Chat Internet Connected"
            );

            window.dispatchEvent(
                new CustomEvent("mk-online")
            );

        }
    );


    window.addEventListener(
        "offline",
        function () {

            console.log(
                "🔴 MK Chat Internet Disconnected"
            );

            window.dispatchEvent(
                new CustomEvent("mk-offline")
            );

        }
    );


    // ========================================================
    // EXPORT
    // ========================================================

    window.MKOfflineDB = {

        ready,

        saveUser,
        getUser,

        saveChat,
        getAllChats,

        saveMessage,
        getMessages,
        updateMessage,

        savePendingMessage,
        getPendingMessages,
        removePendingMessage,

        setSetting,
        getSetting,

        isOnline

    };


    // Start database immediately
    ready().catch(function (error) {

        console.error(
            "❌ MK Offline DB initialization failed:",
            error
        );

    });


})();
