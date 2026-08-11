// ==========================================
// Hasbunallahu Store - Admin Dashboard
// Supabase Order Management
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

async function displayAdminOrders() {

    const ordersTable =
        document.getElementById("orders-table");

    if (!ordersTable) return;


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        ordersTable.innerHTML = `
            <tr>
                <td colspan="9">
                    ❌ Supabase connection not available.
                </td>
            </tr>
        `;

        return;

    }


    ordersTable.innerHTML = `
        <tr>
            <td colspan="9">
                Loading orders...
            </td>
        </tr>
    `;


    try {

        const { data: orders, error } =
            await supabaseClient
                .from("orders")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Supabase orders error:",
                error
            );

            ordersTable.innerHTML = `
                <tr>
                    <td colspan="9">
                        ❌ Failed to load orders.
                    </td>
                </tr>
            `;

            return;

        }


        if (
            !orders ||
            orders.length === 0
        ) {

            ordersTable.innerHTML = `
                <tr>
                    <td colspan="9">
                        No orders yet.
                    </td>
                </tr>
            `;

            updateAdminStatistics([]);

            return;

        }


        ordersTable.innerHTML = "";


        orders.forEach(order => {

            const currentStatus =
                order.status || "Paid";


            ordersTable.innerHTML += `

                <tr>

                    <td>
                        <strong>
                            ${order.order_number || "N/A"}
                        </strong>
                    </td>

                    <td>
                        ${order.customer_name || "N/A"}
                    </td>

                    <td>
                        ${order.customer_email || "N/A"}
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

                        <select
                            id="status-${order.order_number}"
                        >

                            <option value="Paid"
                                ${currentStatus === "Paid"
                                    ? "selected"
                                    : ""}>
                                Paid
                            </option>

                            <option value="Processing"
                                ${currentStatus === "Processing"
                                    ? "selected"
                                    : ""}>
                                Processing
                            </option>

                            <option value="Shipped"
                                ${currentStatus === "Shipped"
                                    ? "selected"
                                    : ""}>
                                Shipped
                            </option>

                            <option value="Out for Delivery"
                                ${currentStatus === "Out for Delivery"
                                    ? "selected"
                                    : ""}>
                                Out for Delivery
                            </option>

                            <option value="Delivered"
                                ${currentStatus === "Delivered"
                                    ? "selected"
                                    : ""}>
                                Delivered
                            </option>

                        </select>

                    </td>


                    <td>

                        <input
                            type="text"
                            id="tracking-${order.order_number}"
                            value="${order.tracking_number || ""}"
                            placeholder="Tracking number"
                        >

                    </td>


                    <td>

                        <textarea
                            id="note-${order.order_number}"
                            placeholder="Delivery note"
                            rows="2"
                        >${order.delivery_note || ""}</textarea>

                    </td>


                    <td>

                        <button
                            type="button"
                            onclick="saveOrderUpdate(
                                '${order.order_number}'
                            )"
                        >
                            💾 Save
                        </button>

                    </td>

                </tr>

            `;

        });


        updateAdminStatistics(orders);

    }

    catch (error) {

        console.error(
            "Admin orders error:",
            error
        );

        ordersTable.innerHTML = `
            <tr>
                <td colspan="9">
                    ❌ Unable to load orders.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// Save Order Update
// ==========================================

async function saveOrderUpdate(orderNumber) {

    const statusElement =
        document.getElementById(
            "status-" + orderNumber
        );

    const trackingElement =
        document.getElementById(
            "tracking-" + orderNumber
        );

    const noteElement =
        document.getElementById(
            "note-" + orderNumber
        );


    if (!statusElement) return;


    const newStatus =
        statusElement.value;

    const trackingNumber =
        trackingElement
            ? trackingElement.value.trim()
            : "";

    const deliveryNote =
        noteElement
            ? noteElement.value.trim()
            : "";


    try {

        const { error } =
            await supabaseClient
                .from("orders")
                .update({

                    status:
                        newStatus,

                    tracking_number:
                        trackingNumber || null,

                    delivery_note:
                        deliveryNote ||
                        "Order received. Preparing for delivery."

                })
                .eq(
                    "order_number",
                    orderNumber
                );


        if (error) {

            console.error(
                "Update error:",
                error
            );

            alert(
                "❌ Failed to update order."
            );

            return;

        }


        alert(
            "✅ Order " +
            orderNumber +
            " updated successfully."
        );


        displayAdminOrders();

    }

    catch (error) {

        console.error(
            "Save order error:",
            error
        );

        alert(
            "❌ Something went wrong while updating the order."
        );

    }

}


// ==========================================
// Admin Statistics
// ==========================================

function updateAdminStatistics(orders) {

    if (!orders) {
        orders = [];
    }


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
            order.customer_email &&
            !customers.includes(
                order.customer_email
            )
        ) {

            customers.push(
                order.customer_email
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
            typeof products !==
            "undefined"
        ) {

            totalProducts.textContent =
                products.length;

        }

        else {

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

            }

            else {

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