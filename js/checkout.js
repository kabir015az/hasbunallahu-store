// ==========================================
// HASBUNALLAHU STORE
// checkout.js
// Supabase Orders + Order Items
// Paystack + COD + Bank Transfer
// ==========================================


// ==========================================
// PAYSTACK PUBLIC KEY
// ==========================================

const PAYSTACK_PUBLIC_KEY =
    "pk_test_17d80f52a39fb05435d5898b29744b5b034d85a9";


// ==========================================
// STORE WHATSAPP
// ==========================================

const STORE_WHATSAPP_NUMBER =
    "2347019154961";


// ==========================================
// VARIABLES
// ==========================================

let cart = [];

let originalTotal = 0;

let discountAmount = 0;

let finalTotal = 0;


// ==========================================
// GET SUPABASE
// ==========================================

function getSupabase() {

    if (
        typeof authSupabase !== "undefined"
    ) {

        return authSupabase;

    }

    if (
        typeof supabaseClient !== "undefined"
    ) {

        return supabaseClient;

    }

    return null;

}


// ==========================================
// GET CART
// ==========================================

function getCheckoutCart() {

    try {

        const saved =
            localStorage.getItem("cart");

        if (!saved) {

            return [];

        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch (error) {

        console.error(
            "Cart error:",
            error
        );

        return [];

    }

}


// ==========================================
// SAVE CART
// ==========================================

function saveCheckoutCart(cartData) {

    localStorage.setItem(
        "cart",
        JSON.stringify(cartData)
    );

}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return "₦" +
        Number(amount || 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// ORDER NUMBER
// ==========================================

function generateOrderNumber() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return (
        "HS-" +
        year +
        month +
        day +
        "-" +
        random
    );

}


// ==========================================
// MESSAGE
// ==========================================

function getCheckoutMessage() {

    let element =
        document.getElementById(
            "checkout-message"
        );

    if (!element) {

        element =
            document.createElement("div");

        element.id =
            "checkout-message";

        element.style.marginTop =
            "15px";

        element.style.padding =
            "12px";

        element.style.fontWeight =
            "bold";

        const button =
            document.getElementById(
                "place-order"
            );

        if (
            button &&
            button.parentNode
        ) {

            button.parentNode.insertBefore(
                element,
                button.nextSibling
            );

        }

    }

    return element;

}


// ==========================================
// CALCULATE TOTAL
// ==========================================

function calculateCheckoutTotal() {

    cart =
        getCheckoutCart();

    originalTotal = 0;

    cart.forEach(
        function (item) {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;

            originalTotal +=
                price * quantity;

        }
    );

    finalTotal =
        Math.max(
            0,
            originalTotal -
            discountAmount
        );

    const total =
        document.getElementById(
            "checkout-total"
        );

    if (total) {

        total.textContent =
            formatMoney(finalTotal);

    }

}


// ==========================================
// DISPLAY SUMMARY
// ==========================================

function displayCheckoutSummary() {

    const summary =
        document.getElementById(
            "checkout-summary"
        );

    if (!summary) {

        return;

    }

    if (cart.length === 0) {

        summary.innerHTML = `
            <p>Your cart is empty.</p>

            <p>
                <strong>Total: ₦0.00</strong>
            </p>
        `;

        return;

    }

    let html = "";

    cart.forEach(
        function (item) {

            const name =
                item.name ||
                "Product";

            const quantity =
                Number(item.quantity) || 1;

            const price =
                Number(item.price) || 0;

            const subtotal =
                price * quantity;

            html += `

                <div
                    class="checkout-product"
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:15px;
                        margin-bottom:12px;
                    "
                >

                    <span>
                        ${escapeHtml(name)}
                        × ${quantity}
                    </span>

                    <strong>
                        ${formatMoney(subtotal)}
                    </strong>

                </div>

            `;

        }
    );

    html += `

        <hr>

        <p class="total-row">

            <span>
                Total:
            </span>

            <strong id="checkout-total">
                ${formatMoney(finalTotal)}
            </strong>

        </p>

    `;

    summary.innerHTML =
        html;

}


// ==========================================
// GET CURRENT USER
// ==========================================

async function getLoggedInCustomer() {

    const supabase =
        getSupabase();

    if (!supabase) {

        console.error(
            "Supabase client not found."
        );

        return null;

    }

    try {

        const {
            data,
            error
        } =
            await supabase.auth.getUser();

        if (error) {

            console.error(
                "User error:",
                error
            );

            return null;

        }

        return data.user || null;

    }

    catch (error) {

        console.error(
            "Login check error:",
            error
        );

        return null;

    }

}


// ==========================================
// PAYMENT METHOD
// ==========================================

function getPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="payment-method"]:checked'
        );

    return selected
        ? selected.value
        : null;

}


// ==========================================
// PAYMENT NAME
// ==========================================

function getPaymentMethodName(
    method
) {

    if (method === "paystack") {

        return "Paystack";

    }

    if (method === "cod") {

        return "Cash on Delivery";

    }

    if (method === "bank") {

        return "Bank Transfer";

    }

    return method || "Unknown";

}


// ==========================================
// GET FORM DATA
// ==========================================

function getCustomerFormData() {

    return {

        fullname:
            document.getElementById(
                "fullname"
            )?.value.trim() || "",

        phone:
            document.getElementById(
                "phone"
            )?.value.trim() || "",

        email:
            document.getElementById(
                "email"
            )?.value.trim() || "",

        address:
            document.getElementById(
                "address"
            )?.value.trim() || "",

        state:
            document.getElementById(
                "state"
            )?.value.trim() || "",

        city:
            document.getElementById(
                "city"
            )?.value.trim() || ""

    };

}


// ==========================================
// CHECK STOCK
// ==========================================

async function checkStockBeforeOrder() {

    const supabase =
        getSupabase();

    if (!supabase) {

        throw new Error(
            "Supabase is not connected."
        );

    }

    for (
        const item of cart
    ) {

        const {
            data,
            error
        } =
            await supabase
                .from("products")
                .select(
                    "id, name, quantity, price"
                )
                .eq(
                    "id",
                    item.id
                )
                .single();

        if (error) {

            throw new Error(
                "Unable to check stock for " +
                (item.name || "product") +
                "."
            );

        }

        const available =
            Number(data.quantity) || 0;

        const requested =
            Number(item.quantity) || 1;

        if (
            available <
            requested
        ) {

            throw new Error(
                data.name +
                " only has " +
                available +
                " item(s) left in stock."
            );

        }

    }

}


// ==========================================
// CREATE ORDER
// ==========================================

async function createOrder(
    customer,
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    const supabase =
        getSupabase();

    if (!supabase) {

        throw new Error(
            "Supabase is not connected."
        );

    }

    const formData =
        getCustomerFormData();

    let deliveryNote = "";

    if (
        paymentMethod === "paystack"
    ) {

        deliveryNote =
            "Paid with Paystack";

    }

    else if (
        paymentMethod === "cod"
    ) {

        deliveryNote =
            "Cash on Delivery";

    }

    else if (
        paymentMethod === "bank"
    ) {

        deliveryNote =
            "Bank Transfer - Payment Pending";

    }


    const orderData = {

        order_number:
            orderNumber,

        customer_name:
            formData.fullname,

        customer_email:
            customer.email ||
            formData.email,

        phone:
            formData.phone,

        address:
            formData.address,

        city:
            formData.city,

        state:
            formData.state,

        total:
            Number(finalTotal),

        status:
            paymentStatus,

        tracking_number:
            "",

        delivery_note:
            deliveryNote

    };


    console.log(
        "Creating order:",
        orderData
    );


    const {
        data: order,
        error: orderError
    } =
        await supabase
            .from("orders")
            .insert(
                [orderData]
            )
            .select()
            .single();


    if (orderError) {

        console.error(
            "Order creation error:",
            orderError
        );

        throw orderError;

    }


    if (!order) {

        throw new Error(
            "Order was not created."
        );

    }


    // ==========================================
    // CREATE ORDER ITEMS
    // ==========================================

    const orderItems =
        cart.map(
            function (item) {

                const quantity =
                    Number(item.quantity) || 1;

                const price =
                    Number(item.price) || 0;

                return {

                    order_id:
                        order.id,

                    product_id:
                        Number(item.id),

                    product_name:
                        item.name ||
                        "Product",

                    quantity:
                        quantity,

                    price:
                        price,

                    subtotal:
                        price * quantity

                };

            }
        );


    const {
        error: itemsError
    } =
        await supabase
            .from("order_items")
            .insert(
                orderItems
            );


    if (itemsError) {

        console.error(
            "Order items error:",
            itemsError
        );

        /*
         * Remove the order if its
         * items could not be saved.
         */

        await supabase
            .from("orders")
            .delete()
            .eq(
                "id",
                order.id
            );

        throw itemsError;

    }


    // ==========================================
    // REDUCE STOCK
    // ==========================================

    for (
        const item of cart
    ) {

        const {
            data: product,
            error: productError
        } =
            await supabase
                .from("products")
                .select(
                    "id, quantity"
                )
                .eq(
                    "id",
                    item.id
                )
                .single();


        if (productError) {

            throw productError;

        }


        const currentStock =
            Number(product.quantity) || 0;

        const orderedQuantity =
            Number(item.quantity) || 1;

        const newStock =
            currentStock -
            orderedQuantity;


        if (
            newStock < 0
        ) {

            throw new Error(
                "Not enough stock available."
            );

        }


        const {
            error: stockError
        } =
            await supabase
                .from("products")
                .update({

                    quantity:
                        newStock

                })
                .eq(
                    "id",
                    item.id
                );


        if (stockError) {

            console.error(
                "Stock update error:",
                stockError
            );

            throw stockError;

        }

    }


    console.log(
        "Order successfully created:",
        order
    );


    return order;

}


// ==========================================
// WHATSAPP MESSAGE
// ==========================================

function createWhatsAppMessage(
    orderNumber,
    status,
    paymentMethod
) {

    const data =
        getCustomerFormData();

    let productsText = "";

    cart.forEach(
        function (item) {

            const quantity =
                Number(item.quantity) || 1;

            const price =
                Number(item.price) || 0;

            productsText +=
                "• " +
                item.name +
                " × " +
                quantity +
                " — " +
                formatMoney(
                    price * quantity
                ) +
                "\n";

        }
    );


    return (

        "🛍️ *NEW HASBUNALLAHU STORE ORDER*\n\n" +

        "📦 Order Number: " +
        orderNumber +
        "\n\n" +

        "👤 Customer: " +
        data.fullname +
        "\n" +

        "📧 Email: " +
        data.email +
        "\n" +

        "📱 Phone: " +
        data.phone +
        "\n\n" +

        "📍 Delivery Address:\n" +
        data.address +
        "\n" +
        data.city +
        ", " +
        data.state +
        "\n\n" +

        "🛒 *Products:*\n" +
        productsText +
        "\n" +

        "💰 *Total: " +
        formatMoney(finalTotal) +
        "*\n\n" +

        "💳 Payment Method: " +
        getPaymentMethodName(
            paymentMethod
        ) +
        "\n" +

        "📌 Payment Status: " +
        status +
        "\n\n" +

        "Hasbunallahu Store"

    );

}


// ==========================================
// OPEN WHATSAPP WEB
// ==========================================

function openWhatsApp(
    orderNumber,
    status,
    paymentMethod
) {

    const message =
        createWhatsAppMessage(
            orderNumber,
            status,
            paymentMethod
        );

    const url =
        "https://web.whatsapp.com/send?phone=" +
        STORE_WHATSAPP_NUMBER +
        "&text=" +
        encodeURIComponent(message);

    window.open(
        url,
        "_blank"
    );

}


// ==========================================
// PAYMENT METHODS
// ==========================================

function setupPaymentMethods() {

    const inputs =
        document.querySelectorAll(
            'input[name="payment-method"]'
        );

    const bankDetails =
        document.getElementById(
            "bank-details"
        );


    inputs.forEach(
        function (input) {

            input.addEventListener(
                "change",
                function () {

                    if (!bankDetails) {

                        return;

                    }

                    bankDetails.style.display =
                        this.value === "bank"
                            ? "block"
                            : "none";

                }
            );

        }
    );

}


// ==========================================
// COUPON
// ==========================================

function setupCoupon() {

    const button =
        document.getElementById(
            "apply-coupon"
        );

    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            const input =
                document.getElementById(
                    "coupon-code"
                );

            const message =
                document.getElementById(
                    "coupon-message"
                );

            if (
                !input ||
                !message
            ) {

                return;

            }


            const code =
                input.value
                    .trim()
                    .toUpperCase();


            if (
                code === "SAVE10"
            ) {

                discountAmount =
                    originalTotal * 0.10;

                message.textContent =
                    "✅ 10% discount applied.";

            }

            else {

                discountAmount =
                    0;

                message.textContent =
                    "❌ Invalid coupon code.";

            }


            calculateCheckoutTotal();

            displayCheckoutSummary();

        }
    );

}


// ==========================================
// PAYSTACK
// ==========================================

function startPaystackPayment(
    customer,
    orderNumber
) {

    const message =
        getCheckoutMessage();

    const button =
        document.getElementById(
            "place-order"
        );

    const email =
        document.getElementById(
            "email"
        )?.value.trim();


    if (
        typeof PaystackPop ===
        "undefined"
    ) {

        throw new Error(
            "Paystack is not loaded. Check the Paystack script in checkout.html."
        );

    }


    if (!email) {

        throw new Error(
            "Please enter your email address."
        );

    }


    const paystack =
        new PaystackPop();


    paystack.newTransaction({

        key:
            PAYSTACK_PUBLIC_KEY,

        email:
            email,

        amount:
            Math.round(
                finalTotal * 100
            ),

        currency:
            "NGN",

        reference:
            orderNumber,

        firstName:
            document.getElementById(
                "fullname"
            )?.value
                .trim()
                .split(" ")[0] || "",

        phone:
            document.getElementById(
                "phone"
            )?.value.trim() || "",

        channels: [
            "card",
            "bank",
            "ussd",
            "qr",
            "bank_transfer"
        ],

        metadata: {

            order_number:
                orderNumber

        },

        onSuccess:
            async function (transaction) {

                console.log(
                    "Paystack success:",
                    transaction
                );

                try {

                    message.textContent =
                        "Payment successful. Saving your order...";

                    button.textContent =
                        "Saving Order...";


                    await checkStockBeforeOrder();


                    await createOrder(
                        customer,
                        orderNumber,
                        "Paid",
                        "paystack"
                    );


                    localStorage.removeItem(
                        "cart"
                    );


                    message.textContent =
                        "✅ Payment successful! Your order has been saved.";


                    button.disabled =
                        true;

                    button.textContent =
                        "Order Placed";


                    setTimeout(
                        function () {

                            openWhatsApp(
                                orderNumber,
                                "Paid",
                                "paystack"
                            );

                        },
                        800
                    );

                }

                catch (error) {

                    console.error(
                        "Saving order failed:",
                        error
                    );


                    message.innerHTML =
                        "⚠️ Payment was successful, but the order could not be saved.<br><br>" +
                        "<strong>Order Number:</strong> " +
                        escapeHtml(
                            orderNumber
                        );


                    button.disabled =
                        false;

                    button.textContent =
                        "Place Order";

                }

            },

        onCancel:
            function () {

                message.textContent =
                    "Payment was cancelled.";

                button.disabled =
                    false;

                button.textContent =
                    "Place Order";

            },

        onError:
            function (error) {

                console.error(
                    "Paystack error:",
                    error
                );

                message.textContent =
                    "❌ Paystack payment failed.";

                button.disabled =
                    false;

                button.textContent =
                    "Place Order";

            }

    });

}


// ==========================================
// OFFLINE ORDER
// ==========================================

async function placeOfflineOrder(
    customer,
    orderNumber,
    paymentMethod
) {

    const button =
        document.getElementById(
            "place-order"
        );

    const message =
        getCheckoutMessage();


    await checkStockBeforeOrder();


    const order =
        await createOrder(
            customer,
            orderNumber,
            "Pending Payment",
            paymentMethod
        );


    if (!order) {

        throw new Error(
            "Order could not be created."
        );

    }


    localStorage.removeItem(
        "cart"
    );


    message.textContent =
        "✅ Your order has been placed successfully!";


    button.textContent =
        "Order Placed";

    button.disabled =
        true;


    setTimeout(
        function () {

            openWhatsApp(
                orderNumber,
                "Pending Payment",
                paymentMethod
            );

        },
        800
    );

}


// ==========================================
// PLACE ORDER
// ==========================================

function setupPlaceOrder() {

    const button =
        document.getElementById(
            "place-order"
        );

    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        async function () {

            const form =
                document.getElementById(
                    "checkout-form"
                );

            const message =
                getCheckoutMessage();


            if (
                form &&
                !form.checkValidity()
            ) {

                form.reportValidity();

                return;

            }


            cart =
                getCheckoutCart();


            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            const customer =
                await getLoggedInCustomer();


            if (!customer) {

                alert(
                    "Please login before placing an order."
                );

                window.location.href =
                    "login.html?redirect=checkout.html";

                return;

            }


            calculateCheckoutTotal();


            if (
                finalTotal <= 0
            ) {

                alert(
                    "Invalid order total."
                );

                return;

            }


            const paymentMethod =
                getPaymentMethod();


            if (!paymentMethod) {

                alert(
                    "Please select a payment method."
                );

                return;

            }


            const orderNumber =
                generateOrderNumber();


            button.disabled =
                true;


            try {

                if (
                    paymentMethod ===
                    "paystack"
                ) {

                    button.textContent =
                        "Opening Payment...";

                    startPaystackPayment(
                        customer,
                        orderNumber
                    );

                    return;

                }


                if (
                    paymentMethod ===
                    "cod"
                ) {

                    button.textContent =
                        "Placing Order...";

                    await placeOfflineOrder(
                        customer,
                        orderNumber,
                        "cod"
                    );

                    return;

                }


                if (
                    paymentMethod ===
                    "bank"
                ) {

                    button.textContent =
                        "Placing Order...";

                    await placeOfflineOrder(
                        customer,
                        orderNumber,
                        "bank"
                    );

                    return;

                }


                throw new Error(
                    "Invalid payment method."
                );

            }

            catch (error) {

                console.error(
                    "Checkout error:",
                    error
                );


                message.innerHTML =
                    "❌ " +
                    escapeHtml(
                        error.message ||
                        "Unable to place order."
                    );


                button.disabled =
                    false;

                button.textContent =
                    "Place Order";

            }

        }
    );

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        cart =
            getCheckoutCart();


        calculateCheckoutTotal();

        displayCheckoutSummary();

        setupPaymentMethods();

        setupCoupon();


        const customer =
            await getLoggedInCustomer();


        const loginRequired =
            document.getElementById(
                "login-required"
            );


        if (!customer) {

            if (loginRequired) {

                loginRequired.style.display =
                    "block";

            }

        }

        else {

            if (loginRequired) {

                loginRequired.style.display =
                    "none";

            }


            const email =
                document.getElementById(
                    "email"
                );


            if (
                email &&
                customer.email
            ) {

                email.value =
                    customer.email;

            }


            const fullname =
                document.getElementById(
                    "fullname"
                );


            const fullName =
                customer.user_metadata
                    ?.full_name || "";


            if (
                fullname &&
                fullName
            ) {

                fullname.value =
                    fullName;

            }

        }


        setupPlaceOrder();


        console.log(
            "Hasbunallahu Store checkout ready."
        );

    }
);