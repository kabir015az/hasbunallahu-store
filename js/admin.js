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
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    if (orders.length === 0) {

        ordersTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No orders yet.
                </td>
            </tr>
        `;

        return;
    }


    ordersTable.innerHTML = "";


    orders.slice().reverse().forEach(order => {

        const currentStatus =
            order.status || "Paid";


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
                    ₦${Number(
                        order.total || 0
                    ).toLocaleString()}
                </td>

                <td>
                    ${order.reference || "N/A"}
                </td>

                <td>

                    <select
                        onchange="updateOrderStatus(
                            '${order.orderNumber}',
                            this.value
                        )"
                    >

                        <option value="Paid"
                            ${currentStatus === "Paid" ? "selected" : ""}>
                            Paid
                        </option>

                        <option value="Processing"
                            ${currentStatus === "Processing" ? "selected" : ""}>
                            Processing
                        </option>

                        <option value="Shipped"
                            ${currentStatus === "Shipped" ? "selected" : ""}>
                            Shipped
                        </option>

                        <option value="Out for Delivery"
                            ${currentStatus === "Out for Delivery" ? "selected" : ""}>
                            Out for Delivery
                        </option>

                        <option value="Delivered"
                            ${currentStatus === "Delivered" ? "selected" : ""}>
                            Delivered
                        </option>

                    </select>

                </td>

                <td>

                    <button
                        type="button"
                        onclick="viewOrderDetails(
                            '${order.orderNumber}'
                        )"
                    >
                        View Details
                    </button>

                </td>

            </tr>

        `;

    });

}


// ==========================================
// Update Order Status
// ==========================================

function updateOrderStatus(
    orderNumber,
    newStatus
) {

    const orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    const order =
        orders.find(
            item =>
                item.orderNumber === orderNumber
        );


    if (!order) {

        alert("Order not found.");

        return;

    }


    order.status = newStatus;


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    alert(
        "Order " +
        orderNumber +
        " status updated to " +
        newStatus
    );

}


// ==========================================
// View Full Order Details
// ==========================================

function viewOrderDetails(orderNumber) {

    const orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    const order =
        orders.find(
            item =>
                item.orderNumber === orderNumber
        );


    if (!order) {

        alert("Order not found.");

        return;

    }


    let itemsText = "";


    if (
        order.items &&
        order.items.length > 0
    ) {

        order.items.forEach(item => {

            itemsText +=
                "\n• " +
                item.name +
                " × " +
                item.quantity +
                " — ₦" +
                (
                    Number(item.price) *
                    Number(item.quantity)
                ).toLocaleString();

        });

    } else {

        itemsText =
            "\nNo product information available.";

    }


    alert(

        "📦 ORDER DETAILS\n\n" +

        "Order Number: " +
        (order.orderNumber || "N/A") +

        "\n\n👤 CUSTOMER\n" +

        "Name: " +
        (order.fullname || "N/A") +

        "\nEmail: " +
        (order.email || "N/A") +

        "\nPhone: " +
        (order.phone || "N/A") +

        "\n\n🏠 DELIVERY ADDRESS\n" +

        "Address: " +
        (order.address || "N/A") +

        "\nState: " +
        (order.state || "N/A") +

        "\nCity: " +
        (order.city || "N/A") +

        "\n\n🛍️ PRODUCTS" +

        itemsText +

        "\n\n💰 TOTAL: ₦" +
        Number(
            order.total || 0
        ).toLocaleString() +

        "\n\n💳 PAYMENT REFERENCE: " +
        (order.reference || "N/A") +

        "\n\n🚚 STATUS: " +
        (order.status || "Paid")

    );

}


// ==========================================
// Admin Statistics
// ==========================================

function updateAdminStatistics() {

    const orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    // Total Orders
    const totalOrders =
        document.getElementById(
            "total-orders"
        );

    if (totalOrders) {

        totalOrders.textContent =
            orders.length;

    }


    // Total Sales
    let totalSales = 0;


    orders.forEach(order => {

        totalSales +=
            Number(order.total) || 0;

    });


    const totalSalesElement =
        document.getElementById(
            "total-sales"
        );


    if (totalSalesElement) {

        totalSalesElement.textContent =
            "₦" +
            totalSales.toLocaleString();

    }


    // Total Customers
    const customers = [];


    orders.forEach(order => {

        if (
            order.email &&
            !customers.includes(order.email)
        ) {

            customers.push(
                order.email
            );

        }

    });


    const totalCustomers =
        document.getElementById(
            "total-customers"
        );


    if (totalCustomers) {

        totalCustomers.textContent =
            customers.length;

    }


    // Total Products
    const totalProducts =
        document.getElementById(
            "total-products"
        );


    if (totalProducts) {

        if (
            typeof products !== "undefined"
        ) {

            totalProducts.textContent =
                products.length;

        } else {

            totalProducts.textContent =
                "0";

        }

    }

}


// ==========================================
// Check Existing Login
// ==========================================

if (
    localStorage.getItem(
        "adminLoggedIn"
    ) === "true"
) {

    if (loginSection) {

        loginSection.style.display =
            "none";

    }


    if (dashboard) {

        dashboard.style.display =
            "block";

    }


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
                    .getElementById(
                        "admin-username"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "admin-password"
                    )
                    .value;


            if (
                username ===
                    ADMIN_USERNAME &&
                password ===
                    ADMIN_PASSWORD
            ) {

                localStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );


                if (loginSection) {

                    loginSection.style.display =
                        "none";

                }


                if (dashboard) {

                    dashboard.style.display =
                        "block";

                }


                displayAdminOrders();

                updateAdminStatistics();


            } else {

                if (loginMessage) {

                    loginMessage.textContent =
                        "❌ Incorrect username or password.";

                }

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


            if (dashboard) {

                dashboard.style.display =
                    "none";

            }


            if (loginSection) {

                loginSection.style.display =
                    "block";

            }


            if (loginMessage) {

                loginMessage.textContent =
                    "";

            }

        }
    );

}