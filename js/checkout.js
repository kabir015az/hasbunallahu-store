// ==========================================
// HASBUNALLAHU STORE
// CHECKOUT JAVASCRIPT
// ==========================================


// ==========================================
// PAYSTACK
// ==========================================

const PAYSTACK_PUBLIC_KEY =
    "pk_test_17d80f52a39fb05435d5898b29744b5b034d85a9";


// ==========================================
// EMAILJS
// ==========================================

const EMAILJS_SERVICE_ID =
    "service_xffozrot";

const EMAILJS_CUSTOMER_TEMPLATE =
    "template_mo5bvrd";

const EMAILJS_ADMIN_TEMPLATE =
    "template_3wqeitu";


// ==========================================
// VARIABLES
// ==========================================

let cart = [];

let originalTotal = 0;

let discountAmount = 0;

let finalTotal = 0;


// ==========================================
// GET CART
// ==========================================

function getCheckoutCart() {

    try {

        const savedCart =
            localStorage.getItem("cart");

        console.log(
            "Checkout localStorage cart:",
            savedCart
        );


        if (!savedCart) {

            console.log(
                "❌ No cart found in localStorage."
            );

            return [];

        }


        const parsedCart =
            JSON.parse(savedCart);


        if (!Array.isArray(parsedCart)) {

            console.error(
                "❌ Cart data is not an array:",
                parsedCart
            );

            return [];

        }


        console.log(
            "✅ Cart loaded:",
            parsedCart
        );


        return parsedCart;

    }

    catch (error) {

        console.error(
            "❌ Error reading cart:",
            error
        );

        return [];

    }

}


// ==========================================
// MONEY FORMAT
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

    return String(value)
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

    const now =
        new Date();


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
// TRACKING NUMBER
// ==========================================

function generateTrackingNumber() {

    const now =
        new Date();


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
        "HST-" +
        year +
        month +
        day +
        "-" +
        random
    );

}


// ==========================================
// CHECKOUT MESSAGE
// ==========================================

function getCheckoutMessage() {

    const message =
        document.getElementById(
            "checkout-message"
        );


    if (message) {

        return message;

    }


    return {

        textContent: "",

        innerHTML: ""

    };

}


// ==========================================
// CALCULATE TOTAL
// ==========================================

function calculateCheckoutTotal() {

    cart =
        getCheckoutCart();


    originalTotal =
        0;


    cart.forEach(
        function(item) {

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


    const totalElement =
        document.getElementById(
            "checkout-total"
        );


    if (totalElement) {

        totalElement.textContent =
            formatMoney(finalTotal);

    }


    console.log(
        "Original total:",
        originalTotal
    );


    console.log(
        "Discount:",
        discountAmount
    );


    console.log(
        "Final total:",
        finalTotal
    );

}


// ==========================================
// DISPLAY CHECKOUT SUMMARY
// ==========================================

function displayCheckoutSummary() {

    const summary =
        document.getElementById(
            "checkout-summary"
        );


    if (!summary) {

        console.error(
            "❌ checkout-summary element not found."
        );

        return;

    }


    cart =
        getCheckoutCart();


    if (cart.length === 0) {

        summary.innerHTML = `

            <p style="
                color:#c00;
                font-weight:bold;
            ">
                Your cart is empty.
            </p>

            <p>
                <a href="products.html">
                    Continue shopping
                </a>
            </p>

        `;


        const totalElement =
            document.getElementById(
                "checkout-total"
            );


        if (totalElement) {

            totalElement.textContent =
                "₦0.00";

        }


        return;

    }


    let html =
        "";


    cart.forEach(
        function(item) {

            const name =
                item.name ||
                item.title ||
                "Product";


            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            const itemTotal =
                price * quantity;


            html += `

                <div
                    class="checkout-product"
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        padding:12px 0;
                        border-bottom:1px solid #ddd;
                    "
                >

                    <span>

                        ${escapeHtml(name)}

                        ×

                        ${quantity}

                    </span>


                    <strong>

                        ${formatMoney(itemTotal)}

                    </strong>

                </div>

            `;

        }
    );


    html += `

        <div
            style="
                display:flex;
                justify-content:space-between;
                margin-top:15px;
                font-weight:bold;
            "
        >

            <span>
                Total:
            </span>

            <strong>
                ${formatMoney(finalTotal)}
            </strong>

        </div>

    `;


    summary.innerHTML =
        html;


    console.log(
        "✅ Checkout summary displayed."
    );

}


// ==========================================
// GET LOGGED-IN CUSTOMER
// ==========================================

async function getLoggedInCustomer() {

    try {

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "❌ Supabase client not available."
            );

            return null;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return null;

        }


        if (
            !data ||
            !data.session
        ) {

            console.log(
                "No active Supabase session."
            );

            return null;

        }


        console.log(
            "✅ Logged-in user:",
            data.session.user.email
        );


        return data.session.user;

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
// PAYMENT METHOD NAME
// ==========================================

function getPaymentMethodName(method) {

    if (method === "paystack") {

        return "Paystack";

    }


    if (method === "cod") {

        return "Cash on Delivery";

    }


    if (method === "bank") {

        return "Bank Transfer";

    }


    return method || "";

}


// ==========================================
// SAVE ORDER TO SUPABASE
// ==========================================

async function saveOrderToSupabase(
    customer,
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    const fullname =
        document
            .getElementById("fullname")
            ?.value
            .trim() || "";


    const phone =
        document
            .getElementById("phone")
            ?.value
            .trim() || "";


    const email =
        document
            .getElementById("email")
            ?.value
            .trim() || "";


    const address =
        document
            .getElementById("address")
            ?.value
            .trim() || "";


    const state =
        document
            .getElementById("state")
            ?.value
            .trim() || "";


    const city =
        document
            .getElementById("city")
            ?.value
            .trim() || "";


    let deliveryNote =
        "";


    if (paymentMethod === "cod") {

        deliveryNote =
            "Cash on Delivery";

    }


    else if (paymentMethod === "bank") {

        deliveryNote =
            "Bank Transfer - Payment Pending";

    }


    else if (paymentMethod === "paystack") {

        deliveryNote =
            "Paid with Paystack";

    }


    const orderData = {

        order_number:
            orderNumber,

        customer_name:
            fullname,

        customer_email:
            customer?.email ||
            email,

        phone:
            phone,

        address:
            address,

        city:
            city,

        state:
            state,

        total:
            Number(finalTotal),

        status:
            paymentStatus,

        tracking_number:
            generateTrackingNumber(),

        delivery_note:
            deliveryNote

    };


    console.log(
        "Saving order:",
        orderData
    );


    const {
        data: order,
        error: orderError
    } =
        await supabaseClient
            .from("orders")
            .insert([orderData])
            .select()
            .single();


    if (orderError) {

        console.error(
            "❌ ORDER SAVE ERROR:",
            orderError
        );

        throw orderError;

    }


    console.log(
        "✅ Order saved:",
        order
    );


    // ======================================
    // SAVE ORDER ITEMS
    // ======================================

    const orderItems =
        cart.map(
            function(item) {

                const quantity =
                    Number(
                        item.quantity
                    ) || 1;


                const price =
                    Number(
                        item.price
                    ) || 0;


                return {

                    order_id:
                        order.id,

                    product_id:
                        item.id,

                    product_name:
                        item.name ||
                        item.title ||
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


    if (orderItems.length > 0) {

        const {
            error:
                itemsError
        } =
            await supabaseClient
                .from("order_items")
                .insert(
                    orderItems
                );


        if (itemsError) {

            console.error(
                "Order items error:",
                itemsError
            );


            await supabaseClient
                .from("orders")
                .delete()
                .eq(
                    "id",
                    order.id
                );


            throw itemsError;

        }

    }


    return order;

}


// ==========================================
// SEND EMAILS
// ==========================================

async function sendOrderEmails(
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    try {

        if (
            typeof emailjs ===
            "undefined"
        ) {

            console.warn(
                "EmailJS is not loaded."
            );

            return;

        }


        const fullname =
            document
                .getElementById("fullname")
                ?.value
                .trim() || "";


        const phone =
            document
                .getElementById("phone")
                ?.value
                .trim() || "";


        const email =
            document
                .getElementById("email")
                ?.value
                .trim() || "";


        const address =
            document
                .getElementById("address")
                ?.value
                .trim() || "";


        const state =
            document
                .getElementById("state")
                ?.value
                .trim() || "";


        const city =
            document
                .getElementById("city")
                ?.value
                .trim() || "";


        const orderItems =
            cart.map(
                function(item) {

                    const quantity =
                        Number(
                            item.quantity
                        ) || 1;


                    const price =
                        Number(
                            item.price
                        ) || 0;


                    return (

                        (item.name ||
                            item.title ||
                            "Product")

                        +

                        " × " +

                        quantity +

                        " = " +

                        formatMoney(
                            price *
                            quantity
                        )

                    );

                }
            ).join("\n");


        const params = {

            fullname:
                fullname,

            email:
                email,

            phone:
                phone,

            address:
                address,

            state:
                state,

            city:
                city,

            orderNumber:
                orderNumber,

            orderDate:
                new Date()
                    .toLocaleString(
                        "en-NG"
                    ),

            subtotal:
                formatMoney(
                    originalTotal
                ),

            total:
                formatMoney(
                    finalTotal
                ),

            reference:
                orderNumber,

            status:
                paymentStatus,

            paymentMethod:
                getPaymentMethodName(
                    paymentMethod
                ),

            orderItems:
                orderItems

        };


        // Customer email

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_CUSTOMER_TEMPLATE,
            params
        );


        console.log(
            "✅ Customer email sent."
        );


        // Admin email

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_ADMIN_TEMPLATE,
            params
        );


        console.log(
            "✅ Admin email sent."
        );

    }

    catch (error) {

        console.warn(
            "⚠️ Email notification failed:",
            error
        );

        // IMPORTANT:
        // Email failure does NOT cancel the order.

    }

}


// ==========================================
// SAVE SUCCESS DATA
// ==========================================

function saveSuccessData(
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    const fullname =
        document
            .getElementById("fullname")
            ?.value
            .trim() || "";


    const email =
        document
            .getElementById("email")
            ?.value
            .trim() || "";


    const successData = {

        orderNumber:
            orderNumber,

        fullname:
            fullname,

        email:
            email,

        total:
            finalTotal,

        paymentStatus:
            paymentStatus,

        paymentMethod:
            getPaymentMethodName(
                paymentMethod
            ),

        date:
            new Date()
                .toLocaleString(
                    "en-NG"
                )

    };


    localStorage.setItem(
        "lastOrder",
        JSON.stringify(
            successData
        )
    );

}


// ==========================================
// GO TO SUCCESS PAGE
// ==========================================

function goToSuccessPage(
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    saveSuccessData(
        orderNumber,
        paymentStatus,
        paymentMethod
    );


    window.location.href =
        "success.html";

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
        function(input) {

            input.addEventListener(
                "change",
                function() {

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
        function() {

            const input =
                document.getElementById(
                    "coupon-code"
                );


            const message =
                document.getElementById(
                    "coupon-message"
                );


            if (!input || !message) {

                return;

            }


            const code =
                input.value
                    .trim()
                    .toUpperCase();


            if (code === "SAVE10") {

                discountAmount =
                    originalTotal *
                    0.10;


                message.textContent =
                    "✅ 10% discount applied.";

            }

            else {

                discountAmount =
                    0;


                message.textContent =
                    code
                        ? "❌ Invalid coupon code."
                        : "Please enter a coupon code.";

            }


            calculateCheckoutTotal();

            displayCheckoutSummary();

        }
    );

}


// ==========================================
// PAYSTACK PAYMENT
// ==========================================

function startPaystackPayment(
    customer,
    orderNumber
) {

    const button =
        document.getElementById(
            "place-order"
        );


    const message =
        getCheckoutMessage();


    if (
        typeof PaystackPop ===
        "undefined"
    ) {

        throw new Error(
            "Paystack could not be loaded."
        );

    }


    const email =
        document
            .getElementById("email")
            ?.value
            .trim() || "";


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
                finalTotal *
                100
            ),

        currency:
            "NGN",

        reference:
            orderNumber,

        firstName:
            document
                .getElementById(
                    "fullname"
                )
                ?.value
                .trim()
                .split(" ")[0] || "",

        phone:
            document
                .getElementById(
                    "phone"
                )
                ?.value
                .trim() || "",


        channels: [

            "card",

            "bank",

            "ussd",

            "qr",

            "bank_transfer"

        ],


        metadata: {

            order_number:
                orderNumber,

            customer_name:
                document
                    .getElementById(
                        "fullname"
                    )
                    ?.value
                    .trim() || "",

            customer_phone:
                document
                    .getElementById(
                        "phone"
                    )
                    ?.value
                    .trim() || ""

        },


        onSuccess:
            async function(transaction) {

                console.log(
                    "✅ Payment successful:",
                    transaction
                );


                try {

                    button.textContent =
                        "Saving Order...";


                    message.textContent =
                        "Payment successful. Saving your order...";


                    await saveOrderToSupabase(
                        customer,
                        orderNumber,
                        "Paid",
                        "paystack"
                    );


                    message.textContent =
                        "Order saved. Sending notifications...";


                    await sendOrderEmails(
                        orderNumber,
                        "Paid",
                        "paystack"
                    );


                    localStorage.removeItem(
                        "cart"
                    );


                    goToSuccessPage(
                        orderNumber,
                        "Paid",
                        "Paystack"
                    );

                }

                catch (error) {

                    console.error(
                        "Payment/order error:",
                        error
                    );


                    message.innerHTML =

                        "⚠️ Payment was successful, " +
                        "but the order could not be saved." +

                        "<br><br>" +

                        "<strong>Order Number:</strong> " +

                        escapeHtml(
                            orderNumber
                        ) +

                        "<br><br>" +

                        "Please contact the store.";


                    button.disabled =
                        false;


                    button.textContent =
                        "Place Order";

                }

            },


        onCancel:
            function() {

                message.textContent =
                    "Payment was cancelled.";


                button.disabled =
                    false;


                button.textContent =
                    "Place Order";

            },


        onError:
            function(error) {

                console.error(
                    "Paystack error:",
                    error
                );


                message.textContent =
                    "❌ Paystack error: " +
                    (
                        error?.message ||
                        "Unable to start payment."
                    );


                button.disabled =
                    false;


                button.textContent =
                    "Place Order";

            },


        onLoad:
            function() {

                message.textContent =
                    "Please complete your payment.";

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

    const message =
        getCheckoutMessage();


    const status =
        "Pending Payment";


    await saveOrderToSupabase(
        customer,
        orderNumber,
        status,
        paymentMethod
    );


    message.textContent =
        "Order saved. Sending notifications...";


    await sendOrderEmails(
        orderNumber,
        status,
        paymentMethod
    );


    localStorage.removeItem(
        "cart"
    );


    goToSuccessPage(
        orderNumber,
        status,
        paymentMethod
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
        async function() {

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


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            const customer =
                await getLoggedInCustomer();


            if (!customer) {

                alert(
                    "Please login or create an account before placing your order."
                );


                window.location.href =
                    "login.html?redirect=checkout.html";


                return;

            }


            calculateCheckoutTotal();


            if (finalTotal <= 0) {

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
// INITIALIZE CHECKOUT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "================================"
        );


        console.log(
            "HASBUNALLAHU CHECKOUT LOADED"
        );


        console.log(
            "================================"
        );


        // Load cart FIRST

        cart =
            getCheckoutCart();


        console.log(
            "Cart on checkout:",
            cart
        );


        // Calculate total

        calculateCheckoutTotal();


        // Display products

        displayCheckoutSummary();


        // Payment methods

        setupPaymentMethods();


        // Coupon

        setupCoupon();


        // Check login

        const customer =
            await getLoggedInCustomer();


        const loginRequired =
            document.getElementById(
                "login-required"
            );


        if (!customer) {

            console.log(
                "⚠️ Customer is not logged in."
            );


            if (loginRequired) {

                loginRequired.style.display =
                    "block";

            }

        }

        else {

            console.log(
                "✅ Customer is logged in:",
                customer.email
            );


            if (loginRequired) {

                loginRequired.style.display =
                    "none";

            }


            // Fill email

            const emailInput =
                document.getElementById(
                    "email"
                );


            if (
                emailInput &&
                customer.email
            ) {

                emailInput.value =
                    customer.email;

            }


            // Fill full name

            const fullnameInput =
                document.getElementById(
                    "fullname"
                );


            const fullName =
                customer
                    .user_metadata
                    ?.full_name ||
                "";


            if (
                fullnameInput &&
                fullName
            ) {

                fullnameInput.value =
                    fullName;

            }

        }


        // Place order

        setupPlaceOrder();


        console.log(
            "✅ Checkout initialization complete."
        );

    }
);