// ==========================================
// Hasbunallahu Store
// Supabase Customer Order History
// ==========================================


// ==========================================
// SUPABASE CONNECTION
// ==========================================

const ORDER_SUPABASE_URL =
    "https://qreliegujlmmsnyewtaq.supabase.co";

const ORDER_SUPABASE_KEY =
    "sb_publishable_jg8JAA8WZfYAEsy7VY6DIQ_xyI_vtg5";


// Use existing Supabase client if available
const orderSupabase =
    window.supabaseClient ||
    window.supabase.createClient(
        ORDER_SUPABASE_URL,
        ORDER_SUPABASE_KEY
    );


// ==========================================
// FORMAT NAIRA
// ==========================================

function formatNaira(amount) {

    return "₦" + Number(amount || 0).toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatOrderDate(date) {

    if (!date) {
        return "Unknown";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "Unknown";
    }

    return parsedDate.toLocaleString(
        "en-NG",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ==========================================
// GET ORDERS
// ==========================================

async function getSupabaseOrders() {

    const {
        data,
        error
    } = await orderSupabase
        .from("orders")
        .select(`
            id,
            order_number,
            customer_name,
            customer_email,
            phone,
            address,
            city,
            state,
            total,
            status,
            tracking_number,
            delivery_note,
            created_at
        `)
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Orders loading error:",
            error
        );

        throw error;
    }


    return data || [];

}


// ==========================================
// GET ORDER ITEMS
// ==========================================

async function getOrderItems(orderId) {

    const {
        data,
        error
    } = await orderSupabase
        .from("order_items")
        .select(`
            id,
            order_id,
            product_id,
            product_name,
            quantity,
            price,
            subtotal,
            created_at
        `)
        .eq(
            "order_id",
            orderId
        )
        .order(
            "id",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Order items loading error:",
            error
        );

        return [];
    }


    return data || [];

}


// ==========================================
// PAYMENT TEXT
// ==========================================

function getPaymentText(order) {

    const note =
        order.delivery_note || "";


    if (
        note.toLowerCase().includes(
            "bank transfer"
        )
    ) {

        return "Bank Transfer";

    }


    if (
        note.toLowerCase().includes(
            "cash on delivery"
        )
    ) {

        return "Cash on Delivery";

    }


    if (
        note.toLowerCase().includes(
            "paystack"
        )
    ) {

        return "Paystack";

    }


    return "Payment Pending";

}


// ==========================================
// ORDER STATUS
// ==========================================

function getStatusText(order) {

    const status =
        String(
            order.status || "pending"
        ).toLowerCase();


    if (
        status === "paid" ||
        status === "payment_successful"
    ) {

        return "Paid";

    }


    if (
        status === "shipped"
    ) {

        return "Shipped";

    }


    if (
        status === "delivered"
    ) {

        return "Delivered";

    }


    if (
        status === "cancelled"
    ) {

        return "Cancelled";

    }


    return "Pending Payment";

}


// ==========================================
// DISPLAY ORDER ITEMS
// ==========================================

function displayOrderItems(items) {

    if (
        !items ||
        items.length === 0
    ) {

        return `
            <p class="no-order-items">
                No order items found.
            </p>
        `;

    }


    return `
        <div class="order-items">

            ${items.map(item => `

                <div class="order-item">

                    <div class="order-item-info">

                        <strong>
                            ${item.product_name || "Product"}
                        </strong>

                        <p>
                            Quantity:
                            ${item.quantity || 0}
                        </p>

                    </div>


                    <div class="order-item-price">

                        ${formatNaira(
                            item.subtotal ||
                            (
                                Number(item.price || 0) *
                                Number(item.quantity || 0)
                            )
                        )}

                    </div>

                </div>

            `).join("")}

        </div>
    `;

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

async function displayOrders() {

    const container =
        document.getElementById(
            "orders-container"
        );


    if (!container) {

        console.error(
            "orders-container was not found."
        );

        return;
    }


    container.innerHTML = `
        <p>
            Loading your orders...
        </p>
    `;


    try {

        const orders =
            await getSupabaseOrders();


        // ==================================
        // NO ORDERS
        // ==================================

        if (
            !orders ||
            orders.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-orders">

                    <h2>
                        No Orders Yet 📦
                    </h2>

                    <p>
                        You have not placed any orders yet.
                    </p>

                    <a href="products.html">
                        Start Shopping
                    </a>

                </div>

            `;

            return;
        }


        // ==================================
        // LOAD EACH ORDER
        // ==================================

        const orderCards =
            await Promise.all(

                orders.map(
                    async order => {

                        const items =
                            await getOrderItems(
                                order.id
                            );


                        const status =
                            getStatusText(
                                order
                            );


                        const payment =
                            getPaymentText(
                                order
                            );


                        return `

                            <div class="order-card">

                                <!-- ORDER HEADER -->

                                <div class="order-header">

                                    <h2>
                                        Order #
                                        ${order.order_number || order.id}
                                    </h2>

                                    <span
                                        class="order-status"
                                    >
                                        ${status}
                                    </span>

                                </div>


                                <!-- DATE -->

                                <p>

                                    <strong>
                                        Date:
                                    </strong>

                                    ${formatOrderDate(
                                        order.created_at
                                    )}

                                </p>


                                <!-- TOTAL -->

                                <p>

                                    <strong>
                                        Total:
                                    </strong>

                                    ${formatNaira(
                                        order.total
                                    )}

                                </p>


                                <!-- PAYMENT -->

                                <p>

                                    <strong>
                                        Payment:
                                    </strong>

                                    ${payment}

                                </p>


                                <!-- ORDER ITEMS -->

                                ${displayOrderItems(
                                    items
                                )}


                                <!-- DELIVERY -->

                                ${
                                    order.delivery_note
                                    ? `
                                        <p>

                                            <strong>
                                                Delivery:
                                            </strong>

                                            ${order.delivery_note}

                                        </p>
                                    `
                                    : ""
                                }


                                <!-- TRACKING -->

                                ${
                                    order.tracking_number
                                    ? `
                                        <p>

                                            <strong>
                                                Tracking:
                                            </strong>

                                            ${order.tracking_number}

                                        </p>
                                    `
                                    : ""
                                }


                            </div>

                        `;

                    }
                )

            );


        // ==================================
        // SHOW ORDERS
        // ==================================

        container.innerHTML =
            orderCards.join("");


    }

    catch (error) {

        console.error(
            "Failed to display orders:",
            error
        );


        container.innerHTML = `

            <div class="empty-orders">

                <h2>
                    Unable to load orders
                </h2>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayOrders();

    }
);