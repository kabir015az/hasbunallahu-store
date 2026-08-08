// ==========================================
// Hasbunallahu Store - Admin Login
// ==========================================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";

const loginForm =
    document.getElementById("admin-login-form");

const loginSection =
    document.getElementById("admin-login");

const dashboard =
    document.getElementById("admin-dashboard");

const loginMessage =
    document.getElementById("login-message");

const logoutButton =
    document.getElementById("admin-logout");


// ==========================================
// Check Login
// ==========================================

if (localStorage.getItem("adminLoggedIn") === "true") {

    loginSection.style.display = "none";

    dashboard.style.display = "block";

    displayAdminOrders();

}


// ==========================================
// Login
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const username =
            document.getElementById("admin-username").value.trim();

        const password =
            document.getElementById("admin-password").value;


        if (
            username === ADMIN_USERNAME &&
            password === ADMIN_PASSWORD
        ) {

            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );

            loginSection.style.display = "none";

            dashboard.style.display = "block";

            displayAdminOrders();

        } else {

            loginMessage.textContent =
                "❌ Incorrect username or password.";

        }

    });

}


// ==========================================
// Logout
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        localStorage.removeItem("adminLoggedIn");

        dashboard.style.display = "none";

        loginSection.style.display = "block";

        loginMessage.textContent = "";

    });

}


// ==========================================
// Display Orders
// ==========================================

function displayAdminOrders() {

    const ordersTable =
        document.getElementById("orders-table");

    if (!ordersTable) return;

    const orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    if (orders.length === 0) {

        ordersTable.innerHTML = `
            <tr>
                <td colspan="5">
                    No orders yet.
                </td>
            </tr>
        `;

        return;

    }


    ordersTable.innerHTML = "";


    orders.slice().reverse().forEach(order => {

        ordersTable.innerHTML += `

            <tr>

                <td>
                    ${order.fullname || "N/A"}
                </td>

                <td>
                    ${order.email || "N/A"}
                </td>

                <td>
                    ${order.phone || "N/A"}
                </td>

                <td>
                    ₦${Number(order.total).toLocaleString()}
                </td>

                <td>
                    ${order.reference || "N/A"}
                </td>

            </tr>

        `;

    });

}