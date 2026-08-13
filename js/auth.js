// ==========================================
// HASBUNALLAHU STORE
// AUTH.JS
// CUSTOMER AUTHENTICATION
// ==========================================


// ==========================================
// GET CURRENT USER
// ==========================================

async function getCurrentUser() {

    try {

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "Supabase client is not available."
            );

            return null;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error) {

            console.error(
                "Get user error:",
                error
            );

            return null;

        }


        return data.user || null;

    }

    catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        return null;

    }

}


// ==========================================
// UPDATE LOGIN UI
// ==========================================

async function updateAuthUI() {

    const user =
        await getCurrentUser();


    const loginLinks =
        document.querySelectorAll(
            ".login-link"
        );


    const registerLinks =
        document.querySelectorAll(
            ".register-link"
        );


    const logoutButtons =
        document.querySelectorAll(
            ".logout-btn"
        );


    const accountElements =
        document.querySelectorAll(
            ".account-user"
        );


    if (user) {

        // ==========================================
        // LOGGED IN
        // ==========================================

        loginLinks.forEach(
            function (element) {

                element.style.display =
                    "none";

            }
        );


        registerLinks.forEach(
            function (element) {

                element.style.display =
                    "none";

            }
        );


        logoutButtons.forEach(
            function (element) {

                element.style.display =
                    "inline-block";

            }
        );


        accountElements.forEach(
            function (element) {

                const fullName =
                    user.user_metadata &&
                    user.user_metadata.full_name;


                element.textContent =
                    fullName ||
                    user.email ||
                    "Customer";

            }
        );

    }

    else {

        // ==========================================
        // LOGGED OUT
        // ==========================================

        loginLinks.forEach(
            function (element) {

                element.style.display =
                    "";

            }
        );


        registerLinks.forEach(
            function (element) {

                element.style.display =
                    "";

            }
        );


        logoutButtons.forEach(
            function (element) {

                element.style.display =
                    "none";

            }
        );


        accountElements.forEach(
            function (element) {

                element.textContent =
                    "";

            }
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

async function logoutCustomer() {

    try {

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            alert(
                "Supabase is not connected."
            );

            return;

        }


        const {
            error
        } =
            await supabaseClient
                .auth
                .signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "❌ Unable to logout."
            );

            return;

        }


        alert(
            "✅ You have been logged out."
        );


        window.location.href =
            "index.html";

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "❌ Unable to logout."
        );

    }

}


// ==========================================
// REQUIRE LOGIN
// ==========================================

async function requireLogin() {

    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "🔐 Please login to access this page."
        );


        window.location.href =
            "login.html";


        return false;

    }


    return true;

}


// ==========================================
// PAGE READY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateAuthUI();

    }
);