// ==========================================
// Hasbunallahu Store - Admin Dashboard
// ==========================================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";
// ==========================================
// EmailJS Status Notification
// ==========================================

async function sendStatusUpdateEmail(order, newStatus, trackingNumber, deliveryNote) {

    if (typeof emailjs === "undefined") {

        console.error("EmailJS is not loaded.");

        return false;

    }

    if (!order.customer_email) {

        console.error("Customer email is missing.");

        return false;

    }


    try {

        await emailjs.send(

            "service_x0frozt",

            "template_mo5bvrd",

            {

                fullname:
                    order.customer_name || "Customer",

                email:
                    order.customer_email,

                orderNumber:
                    order.order_number,

                status:
                    newStatus,

                trackingNumber:
                    trackingNumber || "Not assigned",

                deliveryNote:
                    deliveryNote ||
                    "Order received. Preparing for delivery."

            }

        );


        console.log(
            "Status update email sent successfully."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Status email error:",
            error
        );


        return false;

    }

}

// ==========================================
// Start when page is ready
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

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


    console.log("Admin JS loaded");


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
            async function (e) {

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


                console.log(
                    "Login attempted:",
                    username
                );


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


                    loginMessage.textContent =
                        "";


                    console.log(
                        "Admin login successful"
                    );


                    displayAdminOrders();

                    updateAdminStatistics();

                }

                else {

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


                loginMessage.textContent =
                    "";

            }
        );

    }

});


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
                    ❌ Supabase is not connected.
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

        const {
            data: orders,
            error
        } =
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
                "Supabase error:",
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


        orders.forEach(function (order) {

            const status =
                order.status || "Paid";


            ordersTable.innerHTML += `

                <tr>

                    <td>
                        ${order.order_number || "N/A"}
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
                                ${status === "Paid" ? "selected" : ""}>
                                Paid
                            </option>

                            <option value="Processing"
                                ${status === "Processing" ? "selected" : ""}>
                                Processing
                            </option>

                            <option value="Shipped"
                                ${status === "Shipped" ? "selected" : ""}>
                                Shipped
                            </option>

                            <option value="Out for Delivery"
                                ${status === "Out for Delivery" ? "selected" : ""}>
                                Out for Delivery
                            </option>

                            <option value="Delivered"
                                ${status === "Delivered" ? "selected" : ""}>
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
                            rows="2"
                            placeholder="Delivery note"
                        >${order.delivery_note || ""}</textarea>

                    </td>

                    <td>

                        <button
                            type="button"
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


    if (!statusElement) {

        alert("Order information not found.");

        return;

    }


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

        // Get customer information
        const {
            data: order,
            error: fetchError
        } =
            await supabaseClient
                .from("orders")
                .select(
                    "order_number, customer_name, customer_email"
                )
                .eq(
                    "order_number",
                    orderNumber
                )
                .single();


        if (fetchError) {

            console.error(
                "Order fetch error:",
                fetchError
            );

            alert(
                "❌ Could not find order."
            );

            return;

        }


        // Update Supabase
        const {
            error
        } =
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
                "❌ Failed to update order.\n\n" +
                error.message
            );

            return;

        }


        // Send email
        const emailSent =
            await sendStatusUpdateEmail(
                order,
                newStatus,
                trackingNumber,
                deliveryNote
            );


        if (emailSent) {

            alert(
                "✅ Order updated successfully.\n\n" +
                "📧 Customer notification email sent."
            );

        }

        else {

            alert(
                "✅ Order updated successfully.\n\n" +
                "⚠️ Customer email could not be sent."
            );

        }


        // Reload orders
        displayAdminOrders();

    }

    catch (error) {

        console.error(
            "Save error:",
            error
        );

        alert(
            "❌ Failed to update order.\n\n" +
            error.message
        );

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


    if (!statusElement) {

        alert("Order information not found.");

        return;

    }


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

        const {
            error
        } =
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
                "❌ Failed to update order.\n\n" +
                error.message
            );

            return;

        }


        // ==========================================
// Send Status Update Email
// ==========================================

const emailSent =
    await sendStatusUpdateEmail(
        {
            customer_name:
                order.customer_name,

            customer_email:
                order.customer_email,

            order_number:
                order.order_number
        },
        newStatus,
        trackingNumber,
        deliveryNote
    );


if (emailSent) {

    alert(
        "✅ Order updated successfully.\n\n" +
        "📧 Customer notification email sent."
    );

}

else {

    alert(
        "✅ Order updated successfully.\n\n" +
        "⚠️ Customer email could not be sent."
    );

}


displayAdminOrders();

    }

    catch (error) {

        console.error(
            "Save error:",
            error
        );


        alert(
            "❌ Failed to update order.\n\n" +
            error.message
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


    const totalOrders =
        document.getElementById(
            "total-orders"
        );


    if (totalOrders) {

        totalOrders.textContent =
            orders.length;

    }


    let totalSales = 0;


    orders.forEach(function (order) {

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


    const customers = [];


    orders.forEach(function (order) {

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