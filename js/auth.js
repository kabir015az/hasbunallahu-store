// ==========================================
// Hasbunallahu Store
// auth.js
// Customer Authentication
// ==========================================

const SUPABASE_URL =
    "https://qreliegujlmmsnyewtaq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jg8JAA8WZfYAEsy7VY6DIQ_xyI_vtg5";


// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

const authSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// GET CURRENT USER
// ==========================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await authSupabase
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


// ==========================================
// UPDATE LOGIN STATUS
// ==========================================

async function updateAuthUI() {

    const user =
        await getCurrentUser();


    // Login links

    const loginLinks =
        document.querySelectorAll(
            ".login-link"
        );


    // Register links

    const registerLinks =
        document.querySelectorAll(
            ".register-link"
        );


    // Logout buttons

    const logoutButtons =
        document.querySelectorAll(
            ".logout-btn"
        );


    // Account elements

    const accountElements =
        document.querySelectorAll(
            ".account-user"
        );


    if (user) {

        // ==========================================
        // CUSTOMER IS LOGGED IN
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

                const name =
                    user.user_metadata &&
                    user.user_metadata.full_name;

                element.textContent =
                    name ||
                    user.email ||
                    "Customer";

            }
        );

    }

    else {

        // ==========================================
        // CUSTOMER IS LOGGED OUT
        // ==========================================

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

    const {
        error
    } =
        await authSupabase
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


// ==========================================
// PROTECT CUSTOMER PAGE
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