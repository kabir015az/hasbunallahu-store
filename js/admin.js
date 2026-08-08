// ==========================================
// Hasbunallahu Store - Admin Dashboard
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
// Display Orders
// ==========================================

function displayAdminOrders() {

    const ordersTable =
        document.getElementById("orders-table");

    if (!ordersTable) return;

    const orders =
        JSON.parse(localStorage.getItem("orders")) || [];

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

                <td>${order.fullname || "N/A"}</td>

                <td>${order.email || "N/A"}</td>

                <td>${order.phone || "N/A"}</td>

                <td>
                    ₦${Number(order.total || 0).toLocaleString()}
                </td>

                <td>${order.reference || "N/A"}</td>

            </tr>

        `;

    });

}


// ==========================================
// Admin Statistics
// ==========================================

function updateAdminStatistics() {

    const orders =
        JSON.parse(localStorage.getItem("orders")) || [];


    // Total Orders
    const totalOrders =
        document.getElementById("total-orders");

    if (totalOrders) {
        totalOrders.textContent = orders.length;
    }


    // Total Sales
    let totalSales = 0;

    orders.forEach(order => {

        totalSales += Number(order.total) || 0;

    });

    const totalSalesElement =
        document.getElementById("total-sales");

    if (totalSalesElement) {

        totalSalesElement.textContent =
            "₦" + totalSales.toLocaleString();

    }


    // Total Customers
    const customers = [];

    orders.forEach(order => {

        if (
            order.email &&
            !customers.includes(order.email)
        ) {
            customers.push(order.email);
        }

    });

    const totalCustomers =
        document.getElementById("total-customers");

    if (totalCustomers) {

        totalCustomers.textContent =
            customers.length;

    }


    // Total Products
    const totalProducts =
        document.getElementById("total-products");

    if (totalProducts) {

        if (typeof products !== "undefined") {

            totalProducts.textContent =
                products.length;

        } else {

            totalProducts.textContent = "0";

        }

    }

}


// ==========================================
// Check Existing Login
// ==========================================

if (
    localStorage.getItem("adminLoggedIn") === "true"
) {

    loginSection.style.display = "none";

    dashboard.style.display = "block";

    displayAdminOrders();

    updateAdminStatistics();

}


// ==========================================
// Login
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            const username =
                document
                    .getElementById("admin-username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("admin-password")
                    .value;


            if (
                username === ADMIN_USERNAME &&
                password === ADMIN_PASSWORD
            ) {

                localStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );

                loginSection.style.display =
                    "none";

                dashboard.style.display =
                    "block";

                displayAdminOrders();

                updateAdminStatistics();

            } else {

                loginMessage.textContent =
                    "❌ Incorrect username or password.";

            }

        }
    );

}


// ==========================================
// Logout
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "adminLoggedIn"
            );

            dashboard.style.display =
                "none";

            loginSection.style.display =
                "block";

            loginMessage.textContent = "";

        }
    );

}