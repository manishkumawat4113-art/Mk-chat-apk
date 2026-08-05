// ============================================================
// MK CHAT - COMPLETE FRONTEND JS
// BACKEND + MONGODB + JWT + SOCKET.IO
// ============================================================
const BACKEND_URL ="https://mk-web-backend.onrender.com";

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
            
