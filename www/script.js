// ============================================================
// MK CHAT - COMPLETE FRONTEND JS
// BACKEND + MONGODB + JWT + SOCKET.IO
// ============================================================
const BACKEND_URL ="https://mk-web-backend.onrender.com";

// ============================================================
// MK CHAT - OFFLINE DATABASE CORE
// PART 1
// IndexedDB based local database
// ============================================================

const MK_OFFLINE_DB_NAME = "MKChatOfflineDB";
const MK_OFFLINE_DB_VERSION = 1;

let mkOfflineDB = null;

// ------------------------------------------------------------
// DATABASE READY PROMISE
// ------------------------------------------------------------

const mkOfflineDBReady = new Promise(function (resolve, reject) {

    if (!window.indexedDB) {

        console.error(
            "❌ IndexedDB is not supported in this browser."
        );

        reject(
            new Error("IndexedDB not supported")
        );

        return;
    }

    const request = indexedDB.open(
        MK_OFFLINE_DB_NAME,
        MK_OFFLINE_DB_VERSION
    );

    // --------------------------------------------------------
    // CREATE / UPDATE DATABASE
    // --------------------------------------------------------

    request.onupgradeneeded = function (event) {

        const db = event.target.result;

        console.log(
            "🗄️ Creating / updating MK Offline Database..."
        );


        // ====================================================
        // USERS
        // ====================================================

        if (!db.objectStoreNames.contains("users")) {

            const usersStore =
                db.createObjectStore(
                    "users",
                    {
                        keyPath: "id"
                    }
                );

            usersStore.createIndex(
                "username",
                "username",
                {
                    unique: false
                }
            );

            usersStore.createIndex(
                "email",
                "email",
                {
                    unique: false
                }
            );

        }


        // ====================================================
        // CHATS
        // ====================================================

        if (!db.objectStoreNames.contains("chats")) {

            const chatsStore =
                db.createObjectStore(
                    "chats",
                    {
                        keyPath: "id"
                    }
                );

            chatsStore.createIndex(
                "updatedAt",
                "updatedAt",
                {
                    unique: false
                }
            );

            chatsStore.createIndex(
                "userId",
                "userId",
                {
                    unique: false
                }
            );

        }


        // ====================================================
        // MESSAGES
        // ====================================================

        if (!db.objectStoreNames.contains("messages")) {

            const messagesStore =
                db.createObjectStore(
                    "messages",
                    {
                        keyPath: "localId"
                    }
                );

            messagesStore.createIndex(
                "messageId",
                "messageId",
                {
                    unique: false
                }
            );

            messagesStore.createIndex(
                "clientMessageId",
                "clientMessageId",
                {
                    unique: false
                }
            );

            messagesStore.createIndex(
                "chatId",
                "chatId",
                {
                    unique: false
                }
            );

            messagesStore.createIndex(
                "createdAt",
                "createdAt",
                {
                    unique: false
                }
            );

        }


        // ====================================================
        // PENDING MESSAGES
        // ====================================================

        if (!db.objectStoreNames.contains("pendingMessages")) {

            const pendingStore =
                db.createObjectStore(
                    "pendingMessages",
                    {
                        keyPath: "clientMessageId"
                    }
                );

            pendingStore.createIndex(
                "chatId",
                "chatId",
                {
                    unique: false
                }
            );

            pendingStore.createIndex(
                "createdAt",
                "createdAt",
                {
                    unique: false
                }
            );

            pendingStore.createIndex(
                "status",
                "status",
                {
                    unique: false
                }
            );

        }


        // ====================================================
        // PROFILE UPDATES
        // ====================================================

        if (!db.objectStoreNames.contains("pendingProfileUpdates")) {

            const profileStore =
                db.createObjectStore(
                    "pendingProfileUpdates",
                    {
                        keyPath: "id"
                    }
                );

            profileStore.createIndex(
                "createdAt",
                "createdAt",
                {
                    unique: false
                }
            );

        }


        // ====================================================
        // SETTINGS
        // ====================================================

        if (!db.objectStoreNames.contains("settings")) {

            db.createObjectStore(
                "settings",
                {
                    keyPath: "key"
                }
            );

        }


        // ====================================================
        // SYNC STATE
        // ====================================================

        if (!db.objectStoreNames.contains("syncState")) {

            db.createObjectStore(
                "syncState",
                {
                    keyPath: "key"
                }
            );

        }


        // ====================================================
        // APP SESSION
        // ====================================================

        if (!db.objectStoreNames.contains("session")) {

            db.createObjectStore(
                "session",
                {
                    keyPath: "key"
                }
            );

        }

    };


    // --------------------------------------------------------
    // DATABASE OPEN SUCCESS
    // --------------------------------------------------------

    request.onsuccess = function (event) {

        mkOfflineDB =
            event.target.result;

        console.log(
            "✅ MK Offline Database ready"
        );

        resolve(
            mkOfflineDB
        );

    };


    // --------------------------------------------------------
    // DATABASE ERROR
    // --------------------------------------------------------

    request.onerror = function (event) {

        console.error(
            "❌ MK Offline Database error:",
            event.target.error
        );

        reject(
            event.target.error
        );

    };


});


// ============================================================
// GENERIC STORE HELPERS
// ============================================================

async function mkDBPut(
    storeName,
    data
) {

    const db =
        await mkOfflineDBReady;

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    storeName
                );

            const request =
                store.put(data);

            request.onsuccess =
                function () {

                    resolve(
                        request.result
                    );

                };

            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );
}


// ============================================================
// GET ONE ITEM
// ============================================================

async function mkDBGet(
    storeName,
    key
) {

    const db =
        await mkOfflineDBReady;

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    storeName,
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    storeName
                );

            const request =
                store.get(key);

            request.onsuccess =
                function () {

                    resolve(
                        request.result
                    );

                };

            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ============================================================
// GET ALL ITEMS
// ============================================================

async function mkDBGetAll(
    storeName
) {

    const db =
        await mkOfflineDBReady;

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    storeName,
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    storeName
                );

            const request =
                store.getAll();

            request.onsuccess =
                function () {

                    resolve(
                        request.result || []
                    );

                };

            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ============================================================
// DELETE ONE ITEM
// ============================================================

async function mkDBDelete(
    storeName,
    key
) {

    const db =
        await mkOfflineDBReady;

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    storeName
                );

            const request =
                store.delete(key);

            request.onsuccess =
                function () {

                    resolve(true);

                };

            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ============================================================
// CLEAR STORE
// ============================================================

async function mkDBClear(
    storeName
) {

    const db =
        await mkOfflineDBReady;

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    storeName,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    storeName
                );

            const request =
                store.clear();

            request.onsuccess =
                function () {

                    resolve(true);

                };

            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ============================================================
// SAVE USER
// ============================================================

async function mkSaveOfflineUser(user) {

    if (!user) {
        return;
    }

    const userId =
        String(
            user._id ||
            user.id
        );

    if (!userId) {
        return;
    }

    const data = {

        ...user,

        id: userId,

        cachedAt:
            Date.now()

    };

    await mkDBPut(
        "users",
        data
    );

}


// ============================================================
// GET USER
// ============================================================

async function mkGetOfflineUser(userId) {

    if (!userId) {
        return null;
    }

    return await mkDBGet(
        "users",
        String(userId)
    );

}


// ============================================================
// SAVE CHAT
// ============================================================

async function mkSaveOfflineChat(chat) {

    if (!chat) {
        return;
    }

    const chatId =
        String(
            chat._id ||
            chat.id ||
            chat.chatId
        );

    if (!chatId) {
        return;
    }

    await mkDBPut(
        "chats",
        {
            ...chat,

            id: chatId,

            cachedAt:
                Date.now(),

            updatedAt:
                chat.updatedAt ||
                Date.now()

        }
    );

}


// ============================================================
// GET ALL CHATS
// ============================================================

async function mkGetOfflineChats() {

    const chats =
        await mkDBGetAll(
            "chats"
        );

    chats.sort(
        function (a, b) {

            return (
                new Date(
                    b.updatedAt ||
                    b.cachedAt ||
                    0
                ) -
                new Date(
                    a.updatedAt ||
                    a.cachedAt ||
                    0
                )
            );

        }
    );

    return chats;

}


// ============================================================
// SAVE MESSAGE
// ============================================================

async function mkSaveOfflineMessage(message) {

    if (!message) {
        return;
    }

    const mongoId =
        message._id
            ? String(message._id)
            : null;

    const clientId =
        message.clientMessageId
            ? String(message.clientMessageId)
            : null;

    const localId =
        mongoId ||
        clientId ||
        (
            "local_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 10)
        );

    await mkDBPut(
        "messages",
        {

            ...message,

            localId:

                String(
                    localId
                ),

            messageId:
                mongoId,

            clientMessageId:
                clientId,

            cachedAt:
                Date.now()

        }
    );

}


// ============================================================
// GET CHAT MESSAGES
// ============================================================

async function mkGetOfflineMessages(
    chatId
) {

    if (!chatId) {
        return [];
    }

    const db =
        await mkOfflineDBReady;

    return new Promise(
        function (resolve, reject) {

            const transaction =
                db.transaction(
                    "messages",
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    "messages"
                );

            const index =
                store.index(
                    "chatId"
                );

            const request =
                index.getAll(
                    String(chatId)
                );

            request.onsuccess =
                function () {

                    const messages =
                        request.result || [];

                    messages.sort(
                        function (a, b) {

                            return (
                                new Date(
                                    a.createdAt ||
                                    a.cachedAt ||
                                    0
                                ) -
                                new Date(
                                    b.createdAt ||
                                    b.cachedAt ||
                                    0
                                )
                            );

                        }
                    );

                    resolve(
                        messages
                    );

                };

            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ============================================================
// SAVE PENDING MESSAGE
// ============================================================

async function mkSavePendingMessage(message) {

    if (!message) {
        return;
    }

    if (!message.clientMessageId) {

        console.error(
            "❌ Pending message needs clientMessageId"
        );

        return;

    }

    await mkDBPut(
        "pendingMessages",
        {

            ...message,

            clientMessageId:
                String(
                    message.clientMessageId
                ),

            status:
                message.status ||
                "pending",

            createdAt:
                message.createdAt ||
                Date.now(),

            queuedAt:
                Date.now()

        }
    );

}


// ============================================================
// GET PENDING MESSAGES
// ============================================================

async function mkGetPendingMessages() {

    return await mkDBGetAll(
        "pendingMessages"
    );

}


// ============================================================
// DELETE PENDING MESSAGE
// ============================================================

async function mkRemovePendingMessage(
    clientMessageId
) {

    if (!clientMessageId) {
        return;
    }

    await mkDBDelete(
        "pendingMessages",
        String(
            clientMessageId
        )
    );

}


// ============================================================
// SAVE PENDING PROFILE UPDATE
// ============================================================

async function mkSavePendingProfileUpdate(
    profileData
) {

    if (!profileData) {
        return;
    }

    await mkDBPut(
        "pendingProfileUpdates",
        {

            id:
                "profile_" +
                Date.now(),

            data:
                profileData,

            createdAt:
                Date.now(),

            status:
                "pending"

        }
    );

}


// ============================================================
// GET PENDING PROFILE UPDATES
// ============================================================

async function mkGetPendingProfileUpdates() {

    return await mkDBGetAll(
        "pendingProfileUpdates"
    );

}


// ============================================================
// SAVE SETTING
// ============================================================

async function mkSetOfflineSetting(
    key,
    value
) {

    if (!key) {
        return;
    }

    await mkDBPut(
        "settings",
        {

            key:
                String(key),

            value:
                value,

            updatedAt:
                Date.now()

        }
    );

}


// ============================================================
// GET SETTING
// ============================================================

async function mkGetOfflineSetting(
    key
) {

    if (!key) {
        return null;
    }

    const result =
        await mkDBGet(
            "settings",
            String(key)
        );

    return result
        ? result.value
        : null;

}


// ============================================================
// SAVE SYNC STATE
// ============================================================

async function mkSetSyncState(
    key,
    value
) {

    await mkDBPut(
        "syncState",
        {
            key:
                String(key),

            value:
                value,

            updatedAt:
                Date.now()
        }
    );

}


// ============================================================
// GET SYNC STATE
// ============================================================

async function mkGetSyncState(
    key
) {

    const result =
        await mkDBGet(
            "syncState",
            String(key)
        );

    return result
        ? result.value
        : null;

}
// ============================================================
// SAVE SESSION
// ============================================================

async function mkSaveOfflineSession(
    sessionData
) {

    if (!sessionData) {
        return;
    }

    await mkDBPut(
        "session",
        {

            key:
                "current",

            ...sessionData,

            savedAt:
                Date.now()

        }
    );

}


// ============================================================
// GET SESSION
// ============================================================

async function mkGetOfflineSession() {

    return await mkDBGet(
        "session",
        "current"
    );

}
    // ============================================================
// DELETE SESSION
// ============================================================

async function mkDeleteOfflineSession() {

    await mkDBDelete(
        "session",
        "current"
    );

}


// ============================================================
// NETWORK STATUS
// ============================================================

function mkIsOnline() {

    return (
        navigator.onLine === true
    );

}


// ============================================================
// NETWORK EVENTS
// ============================================================

window.addEventListener(
    "online",
    function () {

        console.log(
            "🌐 MK Chat: Internet connected"
        );

        window.dispatchEvent(
            new CustomEvent(
                "mk:online"
            )
        );

    }
);


window.addEventListener(
    "offline",
    function () {

        console.log(
            "📴 MK Chat: Internet disconnected"
        );

        window.dispatchEvent(
            new CustomEvent(
                "mk:offline"
            )
        );

    }
);
    // ============================================================
// EXPORT
// ============================================================

window.MKOfflineDB = {

    ready:
        mkOfflineDBReady,

    saveUser:
        mkSaveOfflineUser,

    getUser:
        mkGetOfflineUser,

    saveChat:
        mkSaveOfflineChat,

    getAllChats:
        mkGetOfflineChats,

    saveMessage:
        mkSaveOfflineMessage,

    getMessages:
        mkGetOfflineMessages,

    savePendingMessage:
        mkSavePendingMessage,

    getPendingMessages:
        mkGetPendingMessages,

    removePendingMessage:
        mkRemovePendingMessage,

    savePendingProfileUpdate:
        mkSavePendingProfileUpdate,

    getPendingProfileUpdates:
        mkGetPendingProfileUpdates,

    setSetting:
        mkSetOfflineSetting,

    getSetting:
        mkGetOfflineSetting,

    setSyncState:
        mkSetSyncState,

    getSyncState:
        mkGetSyncState,

    saveSession:
        mkSaveOfflineSession,

    getSession:
        mkGetOfflineSession,

    deleteSession:
        mkDeleteOfflineSession,

    isOnline:
        mkIsOnline

};


// ============================================================
// START DATABASE IMMEDIATELY
// ============================================================

mkOfflineDBReady
    .then(
        function () {

            console.log(
                "✅ MK Offline DB initialized successfully"
            );

        }
    )
    .catch(
        function (error) {

            console.error(
                "❌ MK Offline DB initialization failed:",
                error
            );

        }
    );
// ============================================================
// MK CHAT - OFFLINE SESSION CACHE
// PART 2A
// ============================================================

async function mkCacheCurrentSession(user, token) {

    try {

        if (!user) {
            console.warn(
                "⚠️ Cannot cache session: user missing"
            );
            return false;
        }

        const userId = String(
            user._id ||
            user.id ||
            user.userId ||
            ""
        );

        if (!userId) {
            console.warn(
                "⚠️ Cannot cache session: user ID missing"
            );
            return false;
        }

        const sessionData = {

            userId: userId,

            user: {
                ...user,
                _id: userId,
                id: userId
            },

            token:
                token ||
                null,

            lastOnlineLogin:
                Date.now(),

            lastSessionUpdate:
                Date.now()

        };

        await MKOfflineDB.saveSession(
            sessionData
        );

        // Also cache the user separately
        await MKOfflineDB.saveUser(
            {
                ...user,

                _id: userId,
                id: userId

            }
        );

        console.log(
            "💾 Offline session cached:",
            userId
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Failed to cache offline session:",
            error
        );

        return false;
    }

}


// ============================================================
// GET CACHED SESSION
// ============================================================

async function mkGetCachedSession() {

    try {

        const session =
            await MKOfflineDB.getSession();

        if (!session) {

            console.log(
                "ℹ️ No offline session found"
            );

            return null;
        }

        console.log(
            "📦 Offline session found:",
            session.userId
        );

        return session;

    } catch (error) {

        console.error(
            "❌ Failed to read offline session:",
            error
        );

        return null;
    }

}


// ============================================================
// CLEAR CACHED SESSION
// ============================================================

async function mkClearCachedSession() {

    try {

        await MKOfflineDB.deleteSession();

        console.log(
            "🗑️ Offline session removed"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Failed to clear offline session:",
            error
        );

        return false;
    }

}


// ============================================================
// CHECK OFFLINE SESSION
// ============================================================

async function mkHasCachedSession() {

    try {

        const session =
            await MKOfflineDB.getSession();

        return !!(
            session &&
            session.userId
        );

    } catch (error) {

        console.error(
            "❌ Session check failed:",
            error
        );

        return false;
    }

}


// ============================================================
// EXPORT SESSION HELPERS
// ============================================================

window.MKOfflineSession = {

    save:
        mkCacheCurrentSession,

    get:
        mkGetCachedSession,

    clear:
        mkClearCachedSession,

    exists:
        mkHasCachedSession

};
    
// ============================================================
// SOCKET.IO CONNECTION
// ============================================================
const socket =
    io(BACKEND_URL, {
        transports: ["polling", "websocket"]
    });
// ============================================================
// SOCKET CONNECTED
// ============================================================
socket.on("connect", function () {

    console.log(
        "✅ Socket connected:",
        socket.id
    );

    joinUserRoom();
        retryPendingMessages();
});

// ============================================================
// SOCKET ERROR
// ============================================================
socket.on("connect_error", function (error) {

    console.error(
        "❌ Socket connection error:",
        error
    );

});
// ============================================================
// USER STATUS
// ============================================================
socket.on("user_status", function (data) {
 console.log("USER STATUS:",data);
   });


// ============================================================
// MESSAGE DELIVERED
// ============================================================

socket.on("message_delivered", function (data) {

    console.log(
        "✅ Delivered:",
        data
    );


    let messageDiv =
    document.querySelector(
        `[data-message-id="${data.messageId}"]`
    );

if (
    !messageDiv &&
    data.clientMessageId
) {
    messageDiv =
        document.querySelector(
            `[data-client-message-id="${data.clientMessageId}"]`
        );
}
    if (messageDiv) {
        

    const status =
        messageDiv.querySelector(
            ".messageStatus"
        );


if (status) {

    // Agar already READ hai to blue hi rehne do
    if (
        status.textContent === "✓✓" &&
        status.style.color
    ) {
     return;
    }

    status.textContent = "✓✓";
    status.style.color = "";
}
}
loadChats();
        
});
// ============================================================
// MESSAGE SAVED
// ============================================================

socket.on("message_saved", function (data) {

    console.log(
        "💾 Message saved:",
        data.clientMessageId
    );

    if (data.clientMessageId) {

        removePendingMessage(
            data.clientMessageId
        );

    }

});


// ============================================================
// MESSAGE READ
// ============================================================

socket.on("messages_read", function (data) {

    console.log(
        "💙 Read:",
        data
    );


    document
        .querySelectorAll(
            ".myMessage .messageStatus"
        )
        .forEach(function (status) {

            status.textContent =
                "✓✓";

            status.style.color =
                "#2196F3";

     });
});

function getMongoMessageId(message) {
    if (
        message?._id &&
        message._id !== message.clientMessageId
    ) {
        return String(message._id);
    }

    return null;
}

function getClientMessageId(message) {
    return (
        message?.clientMessageId ||
        null
    );
}

// ============================================================
// HTML ELEMENTS
// ============================================================

let newaccount =
    document.querySelector("#newaccount");

let newAccountScreen =
    document.querySelector("#newAccountScreen");

let close =
    document.querySelector("#close");

let homeScreen =
    document.querySelector("#homeScreen");

let screen1 =
    document.querySelector("#screen1");

let createBtn =
    document.querySelector("#createAccount");

let loginBtn =
    document.querySelector("#loginBtn");

let logout =
    document.querySelector("#logout");


// ============================================================
// CREATE ACCOUNT SCREEN
// ============================================================

newaccount.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        newAccountScreen.style.display =
            "block";

    }
);


newAccountScreen.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

    }
);


document.addEventListener(
    "click",
    function () {

        newAccountScreen.style.display =
            "none";

    }
);


close.addEventListener(
    "click",
    function () {

        newAccountScreen.style.display =
            "none";

    }
);


// ============================================================
// CREATE ACCOUNT
// ============================================================

createBtn.addEventListener(
    "click",
    async function () {

        let username =
            document.querySelector(
                "#username"
            ).value.trim();


        let email =
            document.querySelector(
                "#email"
            ).value.trim();


        let password =
            document.querySelector(
                "#password"
            ).value;


        let confirmPassword =
            document.querySelector(
                "#confirmPassword"
            ).value;


        // Empty check
        if (
            !username ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            alert(
                "Please fill all fields"
            );

            return;

        }


        // Password check
        if (
            password !==
            confirmPassword
        ) {

            alert(
                "Passwords do not match"
            );

            return;

        }


        try {

            let response =
                await fetch(
                    `${BACKEND_URL}/api/auth/register`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username,
                                email,
                                password
                            })

                    }
                );


            let result =
                await response.json();


            if (
                result.success
            ) {

                alert(
                    "Account successfully ban gaya! Ab Login karein."
                );

                newAccountScreen.style.display =
                    "none";

            }

            else {

                alert(
                    result.error ||
                    "Account create nahi hua"
                );

            }


        }

        catch (error) {

            console.error(
                "Register Error:",
                error
            );

            alert(
                "Server se connect nahi ho paya!"
            );

        }

    }
);


// ============================================================
// LOGIN
// ============================================================

loginBtn.addEventListener(
    "click",
    async function () {

        let email =
            document.querySelector(
                "#loginEmail"
            ).value.trim();


        let password =
            document.querySelector(
                "#loginPassword"
            ).value;


        if (
            !email ||
            !password
        ) {

            alert(
                "Email aur Password enter karein"
            );

            return;

        }


        try {

            let response =
                await fetch(
                    `${BACKEND_URL}/api/auth/login`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email,
                                password
                            })

                    }
                );


            let result =
                await response.json();


            if (
                result.success
            ) {

                // User save
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        result.user
                    )
                );


                // JWT save
                localStorage.setItem(
                    "token",
                    result.token
                );
// ========================================================
// OFFLINE SESSION CACHE
// ========================================================

await MKOfflineSession.save(
    result.user,
    result.token
);

console.log(
    "💾 Login session saved for offline use"
);

                // Username show
                document.querySelector(
                    "#userName"
                ).textContent =
                    result.user.username;


                // Screen change
                screen1.style.display =
                    "none";

                homeScreen.style.display =
                    "block";


                // Socket room join
                joinUserRoom();
                
loadChats();

                

            }

            else {

                alert(
                    result.error ||
                    "Galat Email ya Password!"
                );

            }


        }

        catch (error) {

            console.error(
                "Login Error:",
                error
            );

            alert(
        "Login Error! Internet check karein."
            );

        }

    }
);


// ============================================================
// AUTO LOGIN
// ============================================================

window.addEventListener(
    "load",
    function () {

        let savedUser =
            localStorage.getItem(
                "currentUser"
            );


        let savedToken =
            localStorage.getItem(
                "token"
            );


        if (
            savedUser &&
            savedToken
        ) {

            try {

                let user =
                    JSON.parse(
                        savedUser
                    );


                document.querySelector(
                    "#userName"
                ).textContent =
                    user.username;


                screen1.style.display =
                    "none";


                homeScreen.style.display =
                    "block";


                // Socket room
                joinUserRoom();
                
                loadChats();

            }

            catch (error) {

                console.error(
                    error
                );

            }

        }

        else {

            screen1.style.display =
                "block";

            homeScreen.style.display =
                "none";

        }

    }
);


// ============================================================
// LOGOUT
// ============================================================

logout.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "currentUser"
        );


        localStorage.removeItem(
            "token"
        );


        localStorage.removeItem(
            "selectedUserId"
        );


        homeScreen.style.display =
            "none";


        screen1.style.display =
            "block";

    }
);

// SETTINGS
let setting=document.querySelector("#setting");
let h1 =document.querySelector("#h1");

h1.addEventListener("click",function (event) {
    event.stopPropagation();
 if (setting.style.display ==="block"){
  setting.style.display ="none";
  }else {
  setting.style.display ="block";
       }
   });

setting.addEventListener("click",function (event) {
   event.stopPropagation();
   });

document.addEventListener("click", function (){
  setting.style.display ="none";
});

// ChatSETTINGS
let chatsetting=document.querySelector("#chatsetting");
let chatMenuBtn=document.querySelector("#chatMenuBtn");

chatMenuBtn.addEventListener("click",function (event) {
    event.stopPropagation();
 if (chatsetting.style.display ==="block"){
  chatsetting.style.display ="none";
  }else {
  chatsetting.style.display ="block";
       }
   });

chatsetting.addEventListener("click",function (event) {
   event.stopPropagation();
   });

document.addEventListener("click", function (){
  chatsetting.style.display ="none";
});

// ============================================================
// DARK MODE
// ============================================================
let darkmode = document.querySelector("#darkmode");
darkmode.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    });

// ============================================================
// PROFILE ELEMENTS
// ============================================================

let profileScreen =
    document.querySelector("#profileScreen");

let profile =
    document.querySelector("#profile");

let profileScreenClose =
    document.querySelector("#profileScreenClose");

let editProfileBtn =
    document.querySelector("#editProfile");

let profileOpenedFrom = "";



// ============================================================
// CURRENT USER PROFILE
// ============================================================

profile.addEventListener(
    "click",
    async function (event) {

        event.stopPropagation();


        profileScreen.style.display =
            "block";


        try {

            let token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                alert(
                    "Token nahi mila"
                );

                return;

            }


            let response =
                await fetch(
                    `${BACKEND_URL}/api/auth/me`,
                    {

                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " +
                                token
                        }

                    }
                );


            let result =
                await response.json();


            if (
                !response.ok
            ) {

                alert(
                    result.error ||
                    "Profile load nahi hui"
                );

                return;

            }


            let user =
                result.user;


            document.querySelector(
    "#profileName"
).textContent =
    "👤 " +
    user.name;


document.querySelector(
    "#profileUsername"
).textContent =
    "@" +
    user.username;


document.querySelector(
    "#profileEmail"
).textContent =
    user.email;


document.querySelector(
    "#profileBio"
).textContent =
    user.about ||
    "Hello! I'm using MK Chat";

            const joinedDate =
    new Date(user.createdAt);

document.querySelector(
    "#profileJoined"
).textContent =
    "Joined " +
    joinedDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
          
            // Current user profile
            editProfileBtn.textContent =
                "Edit Profile";


            editProfileBtn.dataset.mode =
                "edit";


        }

        catch (error) {

            console.error(
                error
            );

            alert(
                "Profile load karne me error aaya"
            );

        }

    }
);

 // ============================================================
// CLOSE PROFILE
// ============================================================

profileScreenClose.addEventListener(
    "click",
    function () {

        profileScreen.style.display =
            "none";


        if (profileOpenedFrom === "chat") {


            chatScreen.style.display =
                "none";
            homeScreen.style.display =
                "block";

        }


        else if (profileOpenedFrom === "home") {

            chatScreen.style.display =
                "none";

            homeScreen.style.display =
                "block";

        }

    }
);
// ============================================================
// SEARCH USER
// ============================================================

let searchInput =
    document.querySelector(
        "#searchInput"
    );


let searchResult =
    document.querySelector(
        "#searchResult"
    );


searchInput.addEventListener(
    "input",
    async function () {

        let text =
            searchInput.value.trim();


        searchResult.innerHTML =
            "";


        if (!text) {

            return;

        }


        try {

            let token =
                localStorage.getItem(
                    "token"
                );


            let currentUser =
                JSON.parse(
                    localStorage.getItem(
                        "currentUser"
                    )
                );


            if (!token) {

                alert(
                    "Login token nahi mila"
                );

                return;

            }


            let response =
                await fetch(
                    `${BACKEND_URL}/api/users/search?q=${encodeURIComponent(text)}`,
                    {

                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " +
                                token
                        }

                    }
                );


            let result =
                await response.json();


            if (
                !response.ok
            ) {

                alert(
                    result.error ||
                    "Users search nahi ho paaye"
                );

                return;

            }


            let users =
                result.users || [];


            users.forEach(
                function (user) {


                    // Apna account hide
                    if (
                        currentUser &&
                        String(user._id) ===
                        String(currentUser.id)
                    ) {

                        return;

                    }


                    let div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        "user";


                    div.textContent =
                        "👤 " +
                        user.username;


                    searchResult.appendChild(
                        div
                    );


                    // User click
                    div.addEventListener(
                        "click",
                        function () {

                            profileOpenedFrom = "home";


                            // Selected user ID
                            localStorage.setItem(
                                "selectedUserId",
                                user._id
                            );

                    
                            
                            // Profile show

document.querySelector(
    "#profileName"
).textContent =
    "👤 " +
    user.name;


document.querySelector(
    "#profileUsername"
).textContent =
    "@" +
    user.username;


document.querySelector(
    "#profileEmail"
).textContent =
    user.email ||
    "";


document.querySelector(
    "#profileBio"
).textContent =
    user.about ||
    "Hello! I'm using MK Chat";
                            
                          const joinedDate =
    new Date(user.createdAt);

document.querySelector(
    "#profileJoined"
).textContent =
    joinedDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
                            // Message mode
                            editProfileBtn.textContent =
                                "Message";


                            editProfileBtn.dataset.mode =
                                "message";


                            // Profile open
                            profileScreen.style.display =
                                "block";


                            // Search clear
                            searchResult.innerHTML =
                                "";


                            searchInput.value =
                                "";

                        }
                    );

                }
            );


        }

        catch (error) {

            console.error(
                "Search Error:",
                error
            );

            alert(
                "Server se users search nahi ho paaye!"
            );

        }

    }
);


// ============================================================
// EDIT PROFILE / MESSAGE BUTTON
// ============================================================
 // Current user
        editProfileBtn.addEventListener(
    "click",
    function () {

        let mode =
            editProfileBtn.dataset.mode;


        console.log(
            "Button Mode:",
            mode
        );


        // ====================================================
        // CURRENT USER → EDIT PROFILE
        // ====================================================

        if (
            mode ===
            "edit"
        ) {

            let currentName =
    document.querySelector(
        "#profileName"
    ).textContent
    .replace("👤", "")
    .trim();


let currentUsername =
    document.querySelector(
        "#profileUsername"
    ).textContent
    .replace("@", "")
    .trim();


let currentBio =
    document.querySelector(
        "#profileBio"
    ).textContent
    .trim();

            let editBox =
                document.createElement(
                    "div"
                );


            editBox.id =
                "editProfileBox";


            editBox.innerHTML = `

                <div class="editProfileHeader">

                    <button id="cancelEditProfile">
                        ←
                    </button>

                    <h2>Edit Profile</h2>

                </div>


                <div class="editProfileForm">

                    <label>Name</label>

                    <input
                        id="editName"
                        type="text"
                        value="${currentName}"
                    >


                    <label>Username</label>

                    <input
    id="editUsername"
    type="text"
    value="${currentUsername}"
    placeholder="Username"
>


                    <label>Bio</label>

                    <textarea
                        id="editBio"
                    >${currentBio}</textarea>


                    <button
                        id="saveProfileBtn"
                    >
                        Save Changes
                    </button>

                </div>

            `;


            profileScreen.appendChild(
                editBox
            );
          

            // ====================================================
            // CLOSE EDIT PROFILE
            // ====================================================

            document.querySelector(
                "#cancelEditProfile"
            ).onclick =
                function () {

                    editBox.remove();

                };


            // ====================================================
            // SAVE PROFILE
            // ====================================================

            document.querySelector(
                "#saveProfileBtn"
            ).onclick =
                async function () {

                    let newName =
                        document.querySelector(
                            "#editName"
                        ).value.trim();


                    let newUsername =
                        document.querySelector(
                            "#editUsername"
                        ).value.trim();


                    let newBio =
                        document.querySelector(
                            "#editBio"
                        ).value.trim();


                    // Name check

                    if (!newName) {

                        alert(
                            "Name required hai"
                        );

                        return;

                    }


                    // Username check

                    if (!newUsername) {

                        alert(
                            "Username required hai"
                        );

                        return;

                    }


                    // ====================================================
                    // TOKEN
                    // ====================================================

                    let token =
                        localStorage.getItem(
                            "token"
                        );


                    if (!token) {

                        alert(
                            "Login token nahi mila"
                        );

                        return;

                    }


                    try {
                        
                      // ====================================================
                        // UPDATE PROFILE IN MONGODB
                        // ====================================================

                        let response =
                            await fetch(
                                `${BACKEND_URL}/api/auth/profile`,
                                {

                                    method:
                                        "PUT",

                                    headers: {

                                        "Content-Type":
                                            "application/json",

                                        "Authorization":
                                            "Bearer " +
                                            token

                                    },

                                    body:
                                        JSON.stringify({

                                            name:
                                                newName,

                                            username:
                                                newUsername,

                                            about:
                                                newBio

                                        })

                                }
                            );


                        let result =
                            await response.json();


                        // ====================================================
                        // BACKEND ERROR
                        // ====================================================

                        if (!response.ok) {

                            alert(
                                result.error ||
                                "Profile update nahi hui"
                            );

                            return;

                        }

                        
                  // ====================================================
                        // UPDATE PROFILE SCREEN
                        // ====================================================

                        document.querySelector(
    "#profileName"
).textContent =
    "👤 " +
    result.user.name;


document.querySelector(
    "#profileUsername"
).textContent =
    "@" +
    result.user.username;


document.querySelector(
    "#profileBio"
).textContent =
    result.user.about ||
    "Hello! I'm using MK Chat";

                        // ====================================================
                        // CLOSE EDIT SCREEN
                        // ====================================================

                        editBox.remove();


                        alert(
                            "Profile successfully updated ✅"
                        );

                    }


                    catch (error) {

                        console.error(
                            "Profile Update Error:",
                            error
                        );


                        alert(
                            "Profile update karne me error aaya"
                        );

                    }

                };


            return;

        }



        // Selected user
        if (
            mode ===
            "message"
        ) {

            let selectedUserId =
                localStorage.getItem(
                    "selectedUserId"
                );


            if (!selectedUserId) {

                alert(
                    "Please select a user first"
                );

                return;

            }


            let profileName =
                document.querySelector(
                    "#profileName"
                ).textContent;


            document.querySelector(
                "#chatUserName"
            ).textContent =
                profileName;


            profileScreen.style.display =
                "none";


            chatScreen.style.display =
                "block";
        

            // Chat load
            loadUserStatus();
            loadMessages();
            
        

        }
                          }
    
);

// ============================================================
// CHAT ELEMENTS
// ============================================================

let chatScreen =
    document.querySelector("#chatScreen");

let backBtn =
    document.querySelector("#backBtn");

let sendBtn =
    document.querySelector("#sendBtn");

let messageInput =
    document.querySelector("#messageInput");

let messages =
    document.querySelector("#messages");


// ============================================================
// MESSAGE MENU ELEMENTS
// ============================================================

let messageMenu =
    document.querySelector("#messageMenu");

let copyMessageBtn =
    document.querySelector("#copyMessage");

let replyMessageBtn =
    document.querySelector("#replyMessage");

let deleteMessageOption =
    document.querySelector("#deleteMessageOption");


// Currently selected message
let selectedMessage = null;

// Reply ke liye selected message
let selectedReply = null;

// Currently editing message
let editingMessageId = null;

// Long press timer
let longPressTimer = null;

// Long press time
const LONG_PRESS_TIME = 600;


// ============================================================
// CHAT BACK
// ============================================================

backBtn.addEventListener(
    "click",
    function () {

        chatScreen.style.display = "none";

        // Message menu bhi close
        messageMenu.style.display = "none";
        
        homeScreen.style.display = "block";

    }
);


// ============================================================
// SEND BUTTON
// ============================================================

sendBtn.addEventListener(
    "click",
    function () {

        console.log(
            "✅ Send button clicked"
        );

        sendMessage();

    }
);


// ============================================================
// ENTER KEY SEND
// ============================================================

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            console.log(
                "✅ Enter key pressed"
            );

            sendMessage();

        }

    }
);


// ============================================================
// JOIN USER ROOM
// ============================================================

function joinUserRoom() {

    let currentUser =
        JSON.parse(
            localStorage.getItem(
                "currentUser"
            )
        );


    if (
        currentUser &&
        socket.connected
    ) {

        socket.emit(
            "join_room",
            String(
                currentUser.id
            )
        );


        console.log(
            "👤 Joined personal room:",
            currentUser.id
        );

    }

}

function markMessagesAsRead() {

    const selectedUserId =
        localStorage.getItem("selectedUserId");

    if (!selectedUserId) return;

    if (!socket.connected) return;

    socket.emit("read_messages", {
        senderId: selectedUserId
    });

    setTimeout(function () {
        loadChats();
    }, 300);

}
// ============================================================
// OFFLINE MESSAGE QUEUE
// ============================================================

let pendingMessages =
    JSON.parse(
        localStorage.getItem("pendingMessages") || "[]"
    );

function savePendingMessages() {

    localStorage.setItem(
        "pendingMessages",
        JSON.stringify(pendingMessages)
    );
}

function queueMessage(message) {

    pendingMessages.push(message);

    savePendingMessages();
}

function removePendingMessage(clientMessageId) {

    pendingMessages =
        pendingMessages.filter(
            function (message) {

                return (
                    message.clientMessageId !==
                    clientMessageId
                );

            }
        );

    savePendingMessages();
}



// ============================================================
// RETRY PENDING MESSAGES
// ============================================================


async function retryPendingMessages() {

    if (!socket.connected) {
        return;
    }

    if (pendingMessages.length === 0) {
        return;
    }

    const messagesToSend =
        [...pendingMessages];

    for (
        const message of messagesToSend
    ) {

        socket.emit(
            "send_message",
            message
        );

    }
}
// ============================================================
// SEND OR EDIT MESSAGE
// ============================================================

async function sendMessage() {

    let text =
        messageInput.value.trim();


    if (!text) {
        return;
    }


    // ========================================================
    // EDIT MODE
    // ========================================================

    if (editingMessageId) {

        await editMessage(
            editingMessageId,
            text
        );

        return;
    }

    
    // ========================================================
    // NORMAL SEND MODE
    // ========================================================

    let currentUser =
        JSON.parse(
            localStorage.getItem(
                "currentUser"
            )
        );


    let selectedUserId =
        localStorage.getItem(
            "selectedUserId"
        );


    if (
        !currentUser ||
        !selectedUserId
    ) {

        alert(
            "User information missing"
        );

        return;

    }


    if (!socket.connected) {

    const clientMessageId =
        crypto.randomUUID();

    const pendingMessage = {

        senderId: currentUser.id,

        receiverId: selectedUserId,

        text: text,

        clientMessageId: clientMessageId,

        replyTo: selectedReply
            ? {
                messageId:
                    selectedReply._id,

                senderId:
                    selectedReply.senderId,

                text:
                    selectedReply.text
            }
            : null
    };

    queueMessage(
        pendingMessage
    );

    messageInput.value = "";

    selectedReply = null;

    console.log(
        "📦 Message queued:",
        clientMessageId
    );

    return;
    }

    // Send message through Socket.IO
const clientMessageId =
    crypto.randomUUID();

const outgoingMessage = {

    senderId: currentUser.id,

    receiverId: selectedUserId,

    text: text,

    clientMessageId:
        clientMessageId,
    
createdAt: new Date().toISOString(),
    
    replyTo: selectedReply
        ? {
            messageId:
                selectedReply._id,

            senderId:
                selectedReply.senderId,

            text:
                selectedReply.text
        }
        : null
};
    showOptimisticMessage(
    outgoingMessage
);

socket.emit(
    "send_message",
    outgoingMessage
);

// 👇 ISKE BAAD
loadChats();

    // Clear input
    messageInput.value = "";
    selectedReply = null;

document.querySelector("#replyPreview").style.display = "none";

}

// ============================================================
// EDIT MESSAGE FUNCTION
// ============================================================

async function editMessage(
    messageId,
    newText
) {

    let token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Login token nahi mila"
        );

        return;

    }


    try {

        let response =
            await fetch(
                `${BACKEND_URL}/api/messages/${messageId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token

                    },

                    body:
                        JSON.stringify({

                            text:
                                newText

                        })

                }
            );


        let result =
            await response.json();


        if (
            !response.ok
        ) {

            alert(
                result.error ||
                "Message edit nahi hua"
            );

            return;

        }


        console.log(
            "✅ Message edited:",
            result.updatedMessage
        );

        
  // ====================================================
        // UI UPDATE
        // ====================================================

        let messageElement =
            document.querySelector(
                `[data-message-id="${messageId}"]`
            );


        if (
            messageElement
        ) {

            let textSpan =
                messageElement.querySelector(
                    "span"
                );


            if (
                textSpan
            ) {

                textSpan.textContent =
                    result.updatedMessage.text;


                let editedSpan =
                    document.createElement(
                        "span"
                    );


                editedSpan.textContent =
                    " (edited)";


                editedSpan.style.fontSize =
                    "11px";


                editedSpan.style.opacity =
                    "0.7";


                textSpan.appendChild(
                    editedSpan
                );

            }

        }


        // ====================================================
        // RESET EDIT MODE
        // ====================================================

        messageInput.value =
            "";

        editingMessageId =
            null;


    }

    catch (error) {

        console.error(
            "Edit Message Error:",
            error
        );


        alert(
            "Message edit karne me error aaya"
        );

    }

}





// ============================================================
// RECEIVE REALTIME MESSAGE
// ============================================================

socket.on(
    "receive_message",
    function (message) {

        console.log(
            "📩 New Message:",
            message
        );


        let currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


        let selectedUserId =
            localStorage.getItem(
                "selectedUserId"
            );


        if (!currentUser) {
            return;
        }


        // ====================================================
        // CURRENT CHAT CHECK
        // ====================================================

        let isCurrentChat =

            (
                String(message.senderId) ===
                String(currentUser.id)
                &&
                String(message.receiverId) ===
                String(selectedUserId)
            )

            ||

            (
                String(message.senderId) ===
                String(selectedUserId)
                &&
                String(message.receiverId) ===
                String(currentUser.id)
            );


        // ====================================================
        // SHOW MESSAGE ONLY ONCE
        // ====================================================

        if (isCurrentChat) {

    // Optimistic message already screen par hai
    const existingMessage =
        message.clientMessageId &&
        document.querySelector(
            `[data-client-message-id="${message.clientMessageId}"]`
        );


    // Sirf tab show karo jab duplicate nahi hai
    if (existingMessage) {

    // Optimistic DOM message ko real MongoDB ID do
    existingMessage.dataset.messageId =
        String(message._id);


    // selectedMessage ko bhi real MongoDB ID do
    if (
        selectedMessage &&
        selectedMessage.clientMessageId ===
        message.clientMessageId
    ) {

        selectedMessage._id =
            message._id;

    }

}
else {

    showMessage(message);

}
    // 💙 Read status ALWAYS process hoga
    if (
    String(message.senderId) ===
    String(selectedUserId) &&
    chatScreen.style.display !== "none"
) {

    markMessagesAsRead();

    }

        }
              // ====================================================
        // DELIVERY CONFIRMATION
        // Only receiver sends this
        // ====================================================

        if (
            String(message.receiverId) ===
            String(currentUser.id)
        ) {

            socket.emit(
                "message_received",
                {
                    messageId: message._id
                }
            );

        }


        // ====================================================
        // UPDATE CHAT LIST
        // ====================================================

        loadChats();

    }
);

function showOptimisticMessage(message) {

    const optimisticMessage = {
        _id:null,
        id:null,
        clientMessageId: message.clientMessageId,

        senderId: message.senderId,
        receiverId: message.receiverId,

        text: message.text,
createdAt: message.createdAt,
        status: "sending",

        replyTo: message.replyTo || null
    };

    showMessage(
        optimisticMessage
    );
}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(message) {

    let currentUser =
        JSON.parse(
            localStorage.getItem(
                "currentUser"
            )
        );


    if (!currentUser) {

        return;

    }


    // ========================================================
    // MESSAGE ID
    // ========================================================

    let messageId =
    message._id ||
    message.id;
    // ========================================================
    // MESSAGE DIV
    // ========================================================

    let div =
        document.createElement(
            "div"
        );


    div.classList.add(
        "message"
    );


    // MongoDB message ID
    div.dataset.messageId =
        String(
            messageId
        );
    if (message.clientMessageId) {

    div.dataset.clientMessageId =
        message.clientMessageId;

    }
    let timeSpan =
    document.createElement("span");

timeSpan.className =
    "messageTime";

timeSpan.textContent =
    message.createdAt
    ? new Date(message.createdAt)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    : "";
    div.appendChild(
    timeSpan
);
    //6 ========================================================
    // MESSAGE TEXT
    // ========================================================

    // ========================================================
// REPLY PREVIEW
// ========================================================

if (
    message.replyTo &&
    message.replyTo.messageId
) {

    let repliedDiv =
        document.createElement(
            "div"
        );


    repliedDiv.className =
        "repliedMessage";


    repliedDiv.textContent =
        "↩️ " +
        message.replyTo.text;


    div.appendChild(
        repliedDiv
    );

}


// ========================================================
// CURRENT MESSAGE TEXT
// ========================================================

let textSpan =
    document.createElement(
        "span"
    );


textSpan.textContent =
    message.text;

if (message.edited === true) {

    let editedSpan =
        document.createElement("span");

    editedSpan.textContent =
        " (edited)";

    editedSpan.style.fontSize =
        "11px";

    editedSpan.style.opacity =
        "0.7";

    textSpan.appendChild(
        editedSpan
    );

}


div.appendChild(
    textSpan
);

    
      // ========================================================
    // USER ID CHECK
    // ========================================================

    let senderId =
        String(
            message.senderId
        );


    let currentUserId =
        String(
            currentUser.id
        );


    // ========================================================
    // MY MESSAGE
    // ========================================================

    if (
        senderId ===
        currentUserId
    ) {

        div.classList.add(
            "myMessage"
        );
        // ========================================================
// MESSAGE STATUS / TICKS
// ========================================================

let statusSpan =
    document.createElement("span");

statusSpan.className =
    "messageStatus";

let messageStatus =
    message.status || "sent";

if (messageStatus === "read") {

    statusSpan.textContent = "✓✓";
    statusSpan.style.color = "#2196F3";

}
else if (messageStatus === "delivered") {

    statusSpan.textContent = "✓✓";

}
else {

    statusSpan.textContent = "✓";

}

div.appendChild(statusSpan);


        // Delete button
        let deleteBtn =
            document.createElement(
                "button"
            );


        deleteBtn.textContent =
            "Delete";


        deleteBtn.className =
            "deleteBtn";


        deleteBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        let latestMessageId =
            div.dataset.messageId;

        // Optimistic message abhi server par save nahi hua
        if (
            !latestMessageId ||
            latestMessageId === "null" ||
            latestMessageId === "undefined"
        ) {

            alert(
                "Message abhi send ho raha hai, thodi der baad delete karo."
            );

            return;
        }

        deleteMessage(
            latestMessageId,
            div
        );

    }
);


        div.appendChild(
            deleteBtn
        );

    }

        
      // ========================================================
    // RECEIVED MESSAGE
    // ========================================================

    else {

        div.classList.add(
            "receivedMessage"
        );

    }


    // ========================================================
    // ADD MESSAGE TO SCREEN
    // ========================================================

    messages.appendChild(
        div
    );


    // ========================================================
    // ENABLE LONG PRESS
    // ========================================================

    addLongPressToMessage(
        div,
        message
    );


    // ========================================================
    // SCROLL TO BOTTOM
    // ========================================================

    messages.scrollTop =
        messages.scrollHeight;

}


// ============================================================
// LONG PRESS MESSAGE FUNCTION
// ============================================================

function addLongPressToMessage(
    messageElement,
    messageData
) {

    let timer = null;


    // ========================================================
    // MOBILE TOUCH START
    // ========================================================

    messageElement.addEventListener(
        "touchstart",
        function (event) {

            timer =
                setTimeout(
                    function () {

                        openMessageMenu(
                            messageData,
                            event
                        );

                    },
                    LONG_PRESS_TIME
                );

        },
        {
            passive: true
        }
    );

    
      // ========================================================
    // MOBILE TOUCH END
    // ========================================================

    messageElement.addEventListener(
        "touchend",
        function () {

            clearTimeout(
                timer
            );

        }
    );


    // ========================================================
    // MOBILE TOUCH MOVE
    // ========================================================

    messageElement.addEventListener(
        "touchmove",
        function () {

            clearTimeout(
                timer
            );

        }
    );


    // ========================================================
    // PC MOUSE DOWN
    // ========================================================

    messageElement.addEventListener(
        "mousedown",
        function (event) {

            timer =
                setTimeout(
                    function () {

                        openMessageMenu(
                            messageData,
                            event
                        );

                    },
                    LONG_PRESS_TIME
                );

        }
    );


    // ========================================================
    // PC MOUSE UP
    // ========================================================

    messageElement.addEventListener(
        "mouseup",
        function () {

            clearTimeout(
                timer
            );

        }
    );


    // ========================================================
    // PC MOUSE LEAVE
    // ========================================================

    messageElement.addEventListener(
        "mouseleave",
        function () {

            clearTimeout(
                timer
            );

        }
    );


    // ========================================================
    // RIGHT CLICK
    // ========================================================

    messageElement.addEventListener(
        "contextmenu",
        function (event) {

            event.preventDefault();


            openMessageMenu(
                messageData,
                event
            );

        }
    );

}


// ============================================================
// DELETE MESSAGE
// ============================================================

async function deleteMessage(
    messageId,
    messageElement
) {

    let token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Login token nahi mila"
        );

        return;

    }


    try {

        let response =
            await fetch(
                `${BACKEND_URL}/api/messages/${messageId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        let result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Message delete nahi hua"
            );

            return;

        }


        // Sirf selected message remove
        if (
            messageElement &&
            messageElement.parentNode
        ) {

            messageElement.remove();

        }


        console.log(
            "✅ Message deleted:",
            messageId
        );

    }


    catch (error) {

        console.error(
            "Delete Message Error:",
            error
        );


        alert(
            "Message delete karne me error aaya"
        );

    }

}


// ============================================================
// LOAD MESSAGES FROM BACKEND
// ============================================================

async function loadMessages() {

    let selectedUserId =
        localStorage.getItem(
            "selectedUserId"
        );


    let token =
        localStorage.getItem(
            "token"
        );


    if (
        !selectedUserId ||
        !token
    ) {

        console.log(
            "Chat information missing"
        );

        return;

    }


    try {

        let response =
            await fetch(
                `${BACKEND_URL}/api/messages/${selectedUserId}`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        let result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Messages load nahi hue"
            );

            return;

        }


        // Chat open hone par purane messages clear
        messages.innerHTML = "";


        let allMessages =
            result.messages ||
            [];


        allMessages.forEach(
            function (message) {

                showMessage(
                    message
                );

            }
        );
        // Chat open hote hi messages read mark karo
socket.emit("read_messages", {
    senderId: selectedUserId
});


        console.log(
            "✅ Chat loaded:",
            allMessages.length
        );

    }


    catch (error) {

        console.error(
            "Load Messages Error:",
            error
        );


        alert(
            "Server se messages load nahi ho paaye"
        );

    }

}


// ============================================================
// OPEN MESSAGE MENU
// ============================================================




function openMessageMenu(message, event) {

    // Selected message save
    selectedMessage = message;


    // ========================================================
    // CURRENT USER
    // ========================================================

    let currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    if (!currentUser) {
        console.log("Current user not found");
        return;
    }


    // ========================================================
    // EDIT & DELETE OPTIONS
    // ========================================================

    let editMessageOption =
        document.querySelector("#editMessage");

    let deleteMessageOption =
        document.querySelector("#deleteMessageOption");


    // ========================================================
    // CHECK MY MESSAGE OR RECEIVED MESSAGE
    // ========================================================

    let isMyMessage =
        String(message.senderId) ===
        String(currentUser.id);


    // ========================================================
    // MY MESSAGE
    // ========================================================

    if (isMyMessage) {

        if (editMessageOption) {
            editMessageOption.style.display =
                "block";
        }

        if (deleteMessageOption) {
            deleteMessageOption.style.display =
                "block";
        }

    }


    // ========================================================
    // RECEIVED MESSAGE
    // ========================================================

    else {

        if (editMessageOption) {
            editMessageOption.style.display =
                "none";
        }

        if (deleteMessageOption) {
            deleteMessageOption.style.display =
                "none";
        }

    }

/*document.addEventListener("click",function (event) {
if (messageMenu.style.display ==="block"
            &&
    !messageMenu.contains(event.target)
    ) {
    messageMenu.style.display ="none";
      }
    });*/

  // ========================================================
    // MENU SHOW
    // ========================================================

    messageMenu.style.display =
        "block";


    // ========================================================
    // MENU POSITION
    // ========================================================

    let x = 100;
    let y = 100;


    // Mobile Touch
    if (
        event &&
        event.touches &&
        event.touches.length > 0
    ) {

        x =
            event.touches[0].clientX;

        y =
            event.touches[0].clientY;

    }


    // PC Mouse
    else if (event) {

        x =
            event.clientX;

        y =
            event.clientY;

    }


    // ========================================================
    // MENU SIZE
    // ========================================================

    let menuWidth = 180;
    let menuHeight = 220;


    // Right side limit
    if (
        x + menuWidth >
        window.innerWidth
    ) {

        x =
            window.innerWidth -
            menuWidth -
            10;

    }


    // Bottom limit
    if (
        y + menuHeight >
        window.innerHeight
    ) {

        y =
            window.innerHeight -
            menuHeight -
            10;

    }


    // ========================================================
    // FINAL MENU POSITION
    // ========================================================

    messageMenu.style.left =
        x + "px";

    messageMenu.style.top =
        y + "px";


    console.log(
        "✅ Message menu opened:",
        message
    );

}


// ============================================================
// CLOSE MESSAGE MENU
// ============================================================
document.addEventListener("click",function (event) {
if (messageMenu.style.display ==="block"
            &&
    !messageMenu.contains(event.target)
    ) {
    messageMenu.style.display ="none";
      }
    });


// ============================================================
// COPY MESSAGE
// ============================================================
copyMessageBtn.addEventListener("click",async function () {
if (!selectedMessage) {
  return;
}

 try { await navigator.clipboard.writeText(selectedMessage.text); }

 catch (error) { console.log("Copy failed", error ); }

// Menu close
     messageMenu.style.display = "none";
 });


// ============================================================
// DELETE FROM MESSAGE MENU
// ============================================================

deleteMessageOption.addEventListener(
    "click",
    async function () {

        if (!selectedMessage) {

            return;

        }


        let currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


        if (!currentUser) {

            return;

        }


        // Sirf apna message delete
        if (
            String(
                selectedMessage.senderId
            )
            !==
            String(
                currentUser.id
            )
        ) {

            alert(
                "Aap sirf apne message delete kar sakte hain"
            );


            messageMenu.style.display =
                "none";


            return;

        }


        // Message ID
let messageId =
    selectedMessage._id ||
    selectedMessage.id;


// Agar selectedMessage me ID nahi hai,
// to DOM se actual MongoDB ID lo
if (
    !messageId ||
    messageId === "null" ||
    messageId === "undefined"
) {

    let messageElement =
        document.querySelector(
            `[data-client-message-id="${selectedMessage.clientMessageId}"]`
        );

    if (messageElement) {

        messageId =
            messageElement.dataset.messageId;

    }

}


// ID abhi bhi nahi mili
if (
    !messageId ||
    messageId === "null" ||
    messageId === "undefined"
) {

    alert(
        "Message ID nahi mili. Thodi der baad try karo."
    );

    messageMenu.style.display =
        "none";

    return;

}


// DOM message find
let messageElement =
    document.querySelector(
        `[data-message-id="${messageId}"]`
    );


        // Backend se delete
        await deleteMessage(
            messageId,
            messageElement
        );


        // Menu close
        messageMenu.style.display =
            "none";


        // Selected message clear
        selectedMessage =
            null;
 });


// ============================================================
// REPLY MESSAGE
// ============================================================
let replyPreview =document.querySelector("#replyPreview");
let replyText =document.querySelector("#replyText");
let cancelReply =document.querySelector("#cancelReply");
replyMessageBtn.addEventListener("click",function () {
  if (!selectedMessage) {
            return;
        }
        
  // Reply ke liye message save
    selectedReply = {
    ...selectedMessage,

    _id:
        selectedMessage._id ||
        selectedMessage.id ||
        selectedMessage.messageId ||
        document.querySelector(
            `[data-client-message-id="${selectedMessage.clientMessageId}"]`
        )?.dataset.messageId
};
// Reply message show karo
replyText.textContent =selectedMessage.text;

// Reply preview open
replyPreview.style.display ="flex";

// Message menu close
messageMenu.style.display ="none";

// Input par focus
messageInput.focus();
 });

cancelReply.addEventListener("click",function () {
  replyPreview.style.display ="none";
  selectedMessage = null;
  replyText.textContent = "";
  messageInput.focus();
  });
  
  // ============================================================
// EDIT MESSAGE
// ============================================================

let editMessageBtn =
    document.querySelector("#editMessage");
editMessageBtn.addEventListener(
    "click",
    function () {

        if (!selectedMessage) {
            return;
        }


        // Message input me old message show
        messageInput.value =
            selectedMessage.text;


        // Input focus
        messageInput.focus();


        // Editing mode ON
        editingMessageId =
    selectedMessage._id ||
    selectedMessage.id ||
    selectedMessage.messageId ||
    document.querySelector(
        `[data-client-message-id="${selectedMessage.clientMessageId}"]`
    )?.dataset.messageId;


        // Menu close
        messageMenu.style.display =
            "none";


        console.log(
            "✍️ Editing message:",
            editingMessageId
        );

    }
);

let forwardSelectedUsers = [];

let forwardMessageBtn =
    document.querySelector(
        "#forwardMessage"
    );

let forwardModal =
    document.querySelector(
        "#forwardModal"
    );

let closeForwardModal =
    document.querySelector(
        "#closeForwardModal"
    );

let forwardSearchInput =
    document.querySelector(
        "#forwardSearchInput"
    );

let forwardUsersList =
    document.querySelector(
        "#forwardUsersList"
    );

let forwardSelectedCount =
    document.querySelector(
        "#forwardSelectedCount"
    );

let confirmForwardBtn =
    document.querySelector(
        "#confirmForwardBtn"
    );
    
forwardMessageBtn.addEventListener(
    "click",
    function () {

        if (!selectedMessage) {
            return;
        }


        // Previous selection clear
        forwardSelectedUsers = [];


        // Modal open
        forwardModal.style.display =
            "block";


        // Search clear
        forwardSearchInput.value =
            "";


        updateForwardSelectedCount();


        // Users load
        loadForwardUsers();


        // Message menu close
        messageMenu.style.display =
            "none";

    }
); 
async function loadForwardUsers(
    searchText = ""
) {

    let token =
        localStorage.getItem(
            "token"
        );


    if (!token) {
        return;
    }


    try {

        let response =
            await fetch(
                `${BACKEND_URL}/api/users/search?q=${encodeURIComponent(searchText)}`,
                {

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        let result =
            await response.json();


        if (!response.ok) {

            console.log(
                result.error
            );

            return;

        }


        forwardUsersList.innerHTML =
            "";


        let currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


        result.users.forEach(
            function (user) {

                // Apna account hide
                if (
                    String(user._id) ===
                    String(currentUser.id)
                ) {

                    return;

                }


                let div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "forwardUser";


                let checkbox =
                    document.createElement(
                        "input"
                    );


                checkbox.type =
                    "checkbox";


                checkbox.value =
                    user._id;


                let name =
                    document.createElement(
                        "span"
                    );


                name.textContent =
                    user.username;


                div.appendChild(
                    checkbox
                );


                div.appendChild(
                    name
                );


                div.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target !==
                            checkbox
                        ) {

                            checkbox.checked =
                                !checkbox.checked;

                        }


                        toggleForwardUser(
                            user._id,
                            user
                        );

                    }
                );


                forwardUsersList.appendChild(
                    div
                );

            }
        );


    } catch (error) {

        console.error(
            "Forward Users Error:",
            error
        );

    }

                    }

  function toggleForwardUser(
    userId,
    user
) {

    let index =
        forwardSelectedUsers.findIndex(
            function (item) {

                return String(
                    item._id
                ) ===
                String(userId);

            }
        );


    // Already selected
    if (
        index !== -1
    ) {

        forwardSelectedUsers.splice(
            index,
            1
        );

    }

    // Select new user
    else {

        forwardSelectedUsers.push(
            user
        );

    }


    updateForwardSelectedCount();

  }
function updateForwardSelectedCount() {

    let count =
        forwardSelectedUsers.length;


    forwardSelectedCount.textContent =
        count +
        " selected";


    confirmForwardBtn.disabled =
        count === 0;

}

forwardSearchInput.addEventListener(
    "input",
    function () {

        let text =
            forwardSearchInput.value.trim();


        loadForwardUsers(
            text
        );

    }
);
confirmForwardBtn.addEventListener(
    "click",
    async function () {

        if (
            !selectedMessage ||
            forwardSelectedUsers.length === 0
        ) {

            return;

        }


        let token =
            localStorage.getItem(
                "token"
            );


        let receiverIds =
            forwardSelectedUsers.map(
                function (user) {

                    return String(
                        user._id
                    );

                }
            );


        confirmForwardBtn.disabled =
            true;


        try {

            let response =
                await fetch(
                    `${BACKEND_URL}/api/messages/forward`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " +
                                token

                        },

                        body:
                            JSON.stringify({

                                messageId:
                                    selectedMessage._id,

                                receiverIds:
                                    receiverIds

                            })

                    }
                );
let result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.error ||
                    "Message forward nahi hua"
                );

                return;

            }


            // Modal close
            forwardModal.style.display =
                "none";


            // Selection clear
            forwardSelectedUsers =
                [];


            updateForwardSelectedCount();


            console.log(
                "✅ Message forwarded",
                result.messages
            );


        } catch (error) {

            console.error(
                "Forward Error:",
                error
            );


            alert(
                "Message forward karne me error aaya"
            );

        }


        confirmForwardBtn.disabled =
            false;

    }
);
closeForwardModal.addEventListener(
    "click",
    function () {

        forwardModal.style.display =
            "none";

        forwardSelectedUsers =
            [];

        updateForwardSelectedCount();

    }
);

async function clearChat() {

    let selectedUserId =
        localStorage.getItem(
            "selectedUserId"
        );

    let token =
        localStorage.getItem(
            "token"
        );


    if (
        !selectedUserId ||
        !token
    ) {

        alert(
            "Chat information missing"
        );

        return;

    }


    let confirmClear =
        confirm(
            "Kya aap is chat ko clear karna chahte hain?"
        );


    if (!confirmClear) {

        return;

    }


    try {

        let response =
            await fetch(
                `${BACKEND_URL}/api/messages/clear-for-me/${selectedUserId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        let result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Chat clear nahi hui"
            );

            return;

        }
      
    // Sirf current screen clear
        messages.innerHTML = "";


        console.log(
            "✅ Chat cleared for current user"
        );


    } catch (error) {

        console.error(
            "Clear Chat Error:",
            error
        );

        alert(
            "Chat clear karne me error aaya"
        );

    }

}
// ============================================================
// CLEAR CHAT BUTTON
// ============================================================

let clearChatBtn =
    document.querySelector(
        "#clearChatBtn"
    );


clearChatBtn.addEventListener(
    "click",
    function () {

        clearChat();

    }
);

async function loadChats(){
let currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );
let token=
localStorage.getItem(
"token"
);

let response=
await fetch(

`${BACKEND_URL}/api/chats`,

{

headers:{

Authorization:
"Bearer "+token

}

}

);

let result=
await response.json();

if(!result.success){

return;

}

let chatList=
document.querySelector(
"#chatList"
);

chatList.innerHTML="";

result.chats.forEach(

function(chat){

let div=
document.createElement(
"div"
);

div.className=
"chatItem";

let time=
new Date(
chat.lastMessageTime
);

div.innerHTML=

`
<div>
<h3>${chat.username}

    ${
    chat.unreadCount > 0
    ? `<span class="unreadBadge">${chat.unreadCount}</span>`
    : ""
}</h3>

<p class="lastMessage">

${chat.lastMessage}

${
    String(chat.lastMessageSenderId) ===
    String(currentUser.id)
    ?
    (
        chat.lastMessageStatus === "read"
        ? " <span style='color:#2196F3'>✓✓</span>"
        :
        chat.lastMessageStatus === "delivered"
        ? " ✓✓"
        : " ✓"
    )
    : ""
}

</p>

</div>

<span class="lastTime">

${time.toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

})}

</span>

`;

div.addEventListener(
    "click",
    function () {

        localStorage.setItem(
            "selectedUserId",
            chat.userId
            
        );


        // Chat username element
        const chatUserName =
            document.querySelector(
                "#chatUserName"
            );


        chatUserName.textContent =
            chat.username;
// ==================================================
        // USERNAME CLICK → PROFILE
        // ==================================================

        chatUserName.onclick =
            function () {

                profileOpenedFrom = "chat";

                localStorage.setItem(
                    "selectedUserId",
                    chat.userId
                );

                

                document.querySelector(
    "#profileName"
).textContent =
    "👤 " +
    chat.name;


document.querySelector(
    "#profileUsername"
).textContent =
    "@" +
    chat.username;


document.querySelector(
    "#profileEmail"
).textContent =
    chat.email ||
    "";


document.querySelector(
    "#profileBio"
).textContent =
    chat.about ||
    "Hello! I'm using MK Chat";

           const joinedDate =
    new Date(chat.createdAt);

document.querySelector(
    "#profileJoined"
).textContent =
    joinedDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );     
                editProfileBtn.textContent =
                    "Message";


                editProfileBtn.dataset.mode =
                    "message";


               chatScreen.style.display =
                  "none";


                profileScreen.style.display =
                    "block";
                
                

            };


        // ==================================================
        // OPEN CHAT
        // ==================================================

        homeScreen.style.display =
           "none";


        chatScreen.style.display =
           "block";


       loadUserStatus();

       loadMessages();

    }
);

chatList.appendChild(
div
);

}

);

}

async function loadUserStatus(){

let selectedUserId =
localStorage.getItem("selectedUserId");

let token =
localStorage.getItem("token");


if(!selectedUserId || !token){
    return;
}


let response =
await fetch(
`${BACKEND_URL}/api/users/${selectedUserId}/status`,
{

headers:{
Authorization:
"Bearer "+token
}

});


let result =
await response.json();


if(result.success){

let status =
document.querySelector("#chatStatus");


if(result.isOnline){

status.textContent =
"Online";

}

else if(result.lastSeen){

let time =
new Date(result.lastSeen);


status.textContent =
"Last seen "+
time.toLocaleString();

}

else{

status.textContent =
"Offline";

}

}

}

socket.on("user_status", function(data) {

    let selectedUserId =
        localStorage.getItem("selectedUserId");

    if (String(data.userId) === String(selectedUserId)) {

        if (data.isOnline) {

            document.querySelector("#chatStatus").textContent =
                "🟢 Online";

        } else {

            if (data.lastSeen) {

                let time = new Date(data.lastSeen);

                document.querySelector("#chatStatus").textContent =
                    "Last seen " + time.toLocaleString();

            } else {

                document.querySelector("#chatStatus").textContent =
                    "Offline";

            }

        }
    }function scrollChatToBottom() {

    const messages =
        document.querySelector("#messages");

    if (!messages) return;

    requestAnimationFrame(() => {

        messages.scrollTop =
            messages.scrollHeight;

        setTimeout(() => {

            messages.scrollTop =
                messages.scrollHeight;

        }, 100);

    });

}


if (window.visualViewport) {

    window.visualViewport.addEventListener(
        "resize",
        function () {

            setTimeout(() => {

                const chatInput =
                    document.querySelector(
                        "#messageInput"
                    );

                if (
                    document.activeElement ===
                    chatInput
                ) {

                    scrollChatToBottom();

                }

            }, 100);

        }
    );

}
});

if (window.visualViewport) {

    const fixChromeKeyboard = () => {

        const chatScreen =
            document.querySelector("#chatScreen");

        const chatInput =
            document.querySelector("#chatInput");

        const messages =
            document.querySelector("#messages");

        if (
            !chatScreen ||
            !chatInput ||
            !messages
        ) {
            return;
        }

        if (
            chatScreen.style.display === "none"
        ) {
            return;
        }

        const viewport =
            window.visualViewport;

        const keyboardHeight =
            window.innerHeight -
            viewport.height;

        if (keyboardHeight > 100) {

            // Keyboard open

            chatInput.style.bottom =
                keyboardHeight + "px";

            messages.style.paddingBottom =
                (
                    chatInput.offsetHeight +
                    20
                ) + "px";

        } else {

            // Keyboard closed

            chatInput.style.bottom =
                "0px";

            messages.style.paddingBottom =
                "15px";

        }

    };


    window.visualViewport.addEventListener(
        "resize",
        fixChromeKeyboard
    );


    window.visualViewport.addEventListener(
        "scroll",
        fixChromeKeyboard
    );

}


  // ============================================================
// MK CHAT - OFFLINE AUTO LOGIN
// PART 2C
// ============================================================

async function mkRestoreOfflineSession() {

    try {

        // ----------------------------------------------------
        // If internet is available, let existing online
        // authentication system handle everything.
        // ----------------------------------------------------

        if (navigator.onLine) {

            console.log(
                "🌐 Internet available - normal login/session flow"
            );

            return false;
        }


        console.log(
            "📴 Internet OFF - checking cached MK session..."
        );


        // ----------------------------------------------------
        // Get cached session from IndexedDB
        // ----------------------------------------------------

        const session =
            await MKOfflineSession.get();


        if (
            !session ||
            !session.userId ||
            !session.user
        ) {

            console.log(
                "ℹ️ No cached offline session available"
            );

            return false;
        }


        // ----------------------------------------------------
        // Restore user
        // ----------------------------------------------------

        const cachedUser =
            session.user;


        const userId =
            String(
                session.userId
            );


        console.log(
            "👤 Restoring offline account:",
            userId
        );


        // ----------------------------------------------------
        // Restore localStorage as well
        //
        // Existing MK Chat code still uses localStorage.
        // We keep it synchronized for now.
        // ----------------------------------------------------

        localStorage.setItem(
            "currentUser",
            JSON.stringify(
                cachedUser
            )
        );


        if (session.token) {

            localStorage.setItem(
                "token",
                session.token
            );

        }


        // ----------------------------------------------------
        // Update username
        // ----------------------------------------------------

        const userNameElement =
            document.querySelector(
                "#userName"
            );


        if (
            userNameElement &&
            cachedUser.username
        ) {

            userNameElement.textContent =
                cachedUser.username;

        }


        // ----------------------------------------------------
        // Open Home Screen
        // ----------------------------------------------------

        if (typeof screen1 !== "undefined") {

            screen1.style.display =
                "none";

        }


        if (
            typeof homeScreen !== "undefined"
        ) {

            homeScreen.style.display =
                "block";

        }


        // ----------------------------------------------------
        // Mark application as offline session
        // ----------------------------------------------------

        window.MK_OFFLINE_SESSION_ACTIVE =
            true;


        window.MK_OFFLINE_USER =
            cachedUser;


        console.log(
            "✅ Offline account restored successfully"
        );


        // ----------------------------------------------------
        // IMPORTANT:
        //
        // Do NOT call loadChats() here yet.
        //
        // Part 3 will replace the current online-only
        // chat loading with IndexedDB first.
        // ----------------------------------------------------

        return true;


    } catch (error) {

        console.error(
            "❌ Offline session restore failed:",
            error
        );

        return false;

    }

}


// ============================================================
// RUN OFFLINE SESSION CHECK
// ============================================================

async function mkStartOfflineSessionCheck() {

    try {

        await MKOfflineDB.ready;

        await mkRestoreOfflineSession();

    } catch (error) {

        console.error(
            "❌ Offline startup check failed:",
            error
        );

    }

}


// ============================================================
// START AFTER PAGE LOAD
// ============================================================

window.addEventListener(
    "load",
    function () {

        mkStartOfflineSessionCheck();

    }
);


// ============================================================
// ALSO HANDLE INTERNET GOING OFFLINE
// ============================================================

window.addEventListener(
    "mk:offline",
    async function () {

        console.log(
            "📴 MK Chat switched to offline mode"
        );

    }
);
