/* ==========================================
   HASBUNALLAHU STORE
   CHECKOUT JAVASCRIPT
   PAYSTACK INLINEJS V2
========================================== */


/* ==========================================
   PAYSTACK PUBLIC KEY
========================================== */

const PAYSTACK_PUBLIC_KEY =
    "pk_test_17d80f52a39fb05435d5898b29744b5b034d85a9";


/* ==========================================
   STORE WHATSAPP NUMBER
========================================== */

const STORE_WHATSAPP_NUMBER =
    "2347019154961";


/* ==========================================
   VARIABLES
========================================== */

let cart = [];

let originalTotal = 0;

let discountAmount = 0;

let finalTotal = 0;

let appliedCoupon = "";


/* ==========================================
   GET CART
========================================== */

function getCheckoutCart() {

    try {

        const savedCart =
            localStorage.getItem("cart");

        if (!savedCart) {
            return [];
        }

        const parsedCart =
            JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart;

    } catch (error) {

        console.error(
            "Cart error:",
            error
        );

        return [];

    }

}


/* ==========================================
   FORMAT MONEY
========================================== */

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


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================
   GENERATE ORDER NUMBER
========================================== */

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


/* ==========================================
   GET MESSAGE ELEMENT
========================================== */

function getCheckoutMessage() {

    let message =
        document.getElementById(
            "checkout-message"
        );

    /*
     * If checkout.html does not already
     * contain the message element, create it.
     */

    if (!message) {

        message =
            document.createElement("div");

        message.id =
            "checkout-message";

        message.style.marginTop =
            "15px";

        message.style.padding =
            "12px";

        message.style.fontWeight =
            "bold";

        const button =
            document.getElementById(
                "place-order"
            );

        if (button && button.parentNode) {

            button.parentNode.insertBefore(
                message,
                button.nextSibling
            );

        }

    }

    return message;

}


/* ==========================================
   CALCULATE TOTAL
========================================== */

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

    const totalElement =
        document.getElementById(
            "checkout-total"
        );

    if (totalElement) {

        totalElement.textContent =
            formatMoney(finalTotal);

    }

}


/* ==========================================
   DISPLAY ORDER SUMMARY
========================================== */

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
            <p>
                Your cart is empty.
            </p>

            <p class="total-row">
                <span>Total:</span>
                <strong>₦0.00</strong>
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

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;

            const itemTotal =
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
                        ${formatMoney(itemTotal)}
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


/* ==========================================
   GET LOGGED-IN CUSTOMER
========================================== */

async function getLoggedInCustomer() {

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
                "Authentication error:",
                error
            );

            return null;

        }

        return data.user || null;

    } catch (error) {

        console.error(
            "Login check error:",
            error
        );

        return null;

    }

}


/* ==========================================
   GET PAYMENT METHOD
========================================== */

function getPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="payment-method"]:checked'
        );

    if (!selected) {
        return null;
    }

    return selected.value;

}


/* ==========================================
   PAYMENT METHOD NAME
========================================== */

function getPaymentMethodName(
    paymentMethod
) {

    if (
        paymentMethod ===
        "paystack"
    ) {

        return "Paystack";

    }

    if (
        paymentMethod ===
        "cod"
    ) {

        return "Cash on Delivery";

    }

    if (
        paymentMethod ===
        "bank"
    ) {

        return "Bank Transfer";

    }

    return paymentMethod;

}


/* ==========================================
   SAVE ORDER TO SUPABASE
========================================== */

async function saveOrderToSupabase(
    customer,
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    const fullname =
        document.getElementById(
            "fullname"
        ).value.trim();

    const phone =
        document.getElementById(
            "phone"
        ).value.trim();

    const email =
        document.getElementById(
            "email"
        ).value.trim();

    const address =
        document.getElementById(
            "address"
        ).value.trim();

    const state =
        document.getElementById(
            "state"
        ).value.trim();

    const city =
        document.getElementById(
            "city"
        ).value.trim();


    let deliveryNote =
        "";


    if (
        paymentMethod ===
        "cod"
    ) {

        deliveryNote =
            "Cash on Delivery";

    }

    else if (
        paymentMethod ===
        "bank"
    ) {

        deliveryNote =
            "Bank Transfer - Payment Pending";

    }

    else if (
        paymentMethod ===
        "paystack"
    ) {

        deliveryNote =
            "Paid with Paystack";

    }


    const orderData = {

        order_number:
            orderNumber,

        customer_name:
            fullname,

        customer_email:
            customer.email ||
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
            "",

        delivery_note:
            deliveryNote

    };


    console.log(
        "Saving order:",
        orderData
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("orders")
            .insert(
                [orderData]
            )
            .select()
            .single();


    if (error) {

        console.error(
            "SUPABASE ORDER ERROR:",
            error
        );

        throw error;

    }


    console.log(
        "Order saved successfully:",
        data
    );


    return data;

}


/* ==========================================
   CREATE WHATSAPP MESSAGE
========================================== */

function createWhatsAppMessage(
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    const fullname =
        document.getElementById(
            "fullname"
        ).value.trim();

    const phone =
        document.getElementById(
            "phone"
        ).value.trim();

    const email =
        document.getElementById(
            "email"
        ).value.trim();

    const address =
        document.getElementById(
            "address"
        ).value.trim();

    const state =
        document.getElementById(
            "state"
        ).value.trim();

    const city =
        document.getElementById(
            "city"
        ).value.trim();


    let productsText =
        "";


    cart.forEach(
        function (item) {

            const name =
                item.name ||
                "Product";

            const quantity =
                Number(item.quantity) ||
                1;

            const price =
                Number(item.price) ||
                0;

            productsText +=
                "• " +
                name +
                " × " +
                quantity +
                " — " +
                formatMoney(
                    price * quantity
                ) +
                "\n";

        }
    );


    const paymentName =
        getPaymentMethodName(
            paymentMethod
        );


    return (

        "🛍️ *NEW HASBUNALLAHU STORE ORDER*\n\n" +

        "📦 Order Number: " +
        orderNumber +
        "\n\n" +

        "👤 Customer: " +
        fullname +
        "\n" +

        "📧 Email: " +
        email +
        "\n" +

        "📱 Phone: " +
        phone +
        "\n\n" +

        "📍 Delivery Address:\n" +
        address +
        "\n" +
        city +
        ", " +
        state +
        "\n\n" +

        "🛒 *Products:*\n" +
        productsText +
        "\n" +

        "💰 *Total: " +
        formatMoney(finalTotal) +
        "*\n\n" +

        "💳 Payment Method: " +
        paymentName +
        "\n" +

        "📌 Payment Status: " +
        paymentStatus +
        "\n\n" +

        "Hasbunallahu Store"

    );

}


/* ==========================================
   OPEN WHATSAPP
========================================== */

function openWhatsApp(
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    const message =
        createWhatsAppMessage(
            orderNumber,
            paymentStatus,
            paymentMethod
        );

    const encodedMessage =
        encodeURIComponent(message);

    /*
     * Open WhatsApp Web directly.
     * This avoids the whatsapp://
     * ERR_UNKNOWN_URL_SCHEME error.
     */

    const whatsappURL =
        "https://web.whatsapp.com/send?phone=" +
        STORE_WHATSAPP_NUMBER +
        "&text=" +
        encodedMessage;

    window.open(
        whatsappURL,
        "_blank"
    );

}


/* ==========================================
   SHOW BANK DETAILS
========================================== */

function setupPaymentMethods() {

    const paymentInputs =
        document.querySelectorAll(
            'input[name="payment-method"]'
        );


    const bankDetails =
        document.getElementById(
            "bank-details"
        );


    if (!paymentInputs.length) {

        return;

    }


    paymentInputs.forEach(
        function (input) {

            input.addEventListener(
                "change",
                function () {

                    if (!bankDetails) {
                        return;
                    }


                    if (
                        this.value ===
                        "bank"
                    ) {

                        bankDetails.style.display =
                            "block";

                    }

                    else {

                        bankDetails.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


/* ==========================================
   COUPON
========================================== */

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


            if (!input || !message) {
                return;
            }


            const code =
                input.value
                    .trim()
                    .toUpperCase();


            if (!code) {

                message.textContent =
                    "Please enter a coupon code.";

                return;

            }


            if (
                code ===
                "SAVE10"
            ) {

                discountAmount =
                    originalTotal * 0.10;


                appliedCoupon =
                    code;


                message.textContent =
                    "✅ 10% discount applied.";

            }

            else {

                discountAmount =
                    0;


                appliedCoupon =
                    "";


                message.textContent =
                    "❌ Invalid coupon code.";

            }


            calculateCheckoutTotal();

            displayCheckoutSummary();

        }
    );

}


/* ==========================================
   PAYSTACK V2 PAYMENT
========================================== */

function startPaystackPayment(
    customer,
    orderNumber
) {

    const email =
        document.getElementById(
            "email"
        ).value.trim();


    const button =
        document.getElementById(
            "place-order"
        );


    const message =
        getCheckoutMessage();


    /*
     * Check Paystack library.
     */

    if (
        typeof PaystackPop ===
        "undefined"
    ) {

        throw new Error(
            "Paystack library is not available. Please make sure the Paystack script is loaded in checkout.html."
        );

    }


    /*
     * Check public key.
     */

    if (
        !PAYSTACK_PUBLIC_KEY ||
        !PAYSTACK_PUBLIC_KEY.startsWith(
            "pk_"
        )
    ) {

        throw new Error(
            "Invalid Paystack public key."
        );

    }


    /*
     * Check email.
     */

    if (!email) {

        throw new Error(
            "Please enter your email address."
        );

    }


    /*
     * Create Paystack V2 popup.
     */

    const paystack =
        new PaystackPop();


    /*
     * Start transaction.
     *
     * Paystack V2 uses:
     *
     * onSuccess
     * onCancel
     * onError
     *
     * NOT callback/onClose.
     */

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
            ).value
                .trim()
                .split(" ")[0],

        phone:
            document.getElementById(
                "phone"
            ).value.trim(),

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
                document.getElementById(
                    "fullname"
                ).value.trim(),

            customer_phone:
                document.getElementById(
                    "phone"
                ).value.trim()

        },


        /* ==============================
           PAYMENT SUCCESS
        ============================== */

        onSuccess:
            async function (transaction) {

                console.log(
                    "Paystack successful:",
                    transaction
                );


                try {

                    button.textContent =
                        "Saving Order...";


                    message.textContent =
                        "Payment successful. Saving your order...";


                    /*
                     * Save order.
                     */

                    await saveOrderToSupabase(
                        customer,
                        orderNumber,
                        "Paid",
                        "paystack"
                    );


                    /*
                     * Clear cart.
                     */

                    localStorage.removeItem(
                        "cart"
                    );


                    /*
                     * Success message.
                     */

                    message.textContent =
                        "✅ Payment successful! Your order has been saved.";


                    button.disabled =
                        true;


                    button.textContent =
                        "Order Placed";


                    /*
                     * Send order to WhatsApp.
                     */

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
                        "Order save error:",
                        error
                    );


                    message.innerHTML =

                        "⚠️ Payment was successful, " +
                        "but there was a problem saving your order.<br><br>" +

                        "<strong>Order Number:</strong> " +

                        escapeHtml(
                            orderNumber
                        ) +

                        "<br><br>" +

                        "Please contact Hasbunallahu Store and provide this order number.";


                    button.disabled =
                        false;


                    button.textContent =
                        "Place Order";

                }

            },


        /* ==============================
           PAYMENT CANCELLED
        ============================== */

        onCancel:
            function () {

                console.log(
                    "Paystack transaction cancelled."
                );


                message.textContent =
                    "Payment was cancelled.";


                button.disabled =
                    false;


                button.textContent =
                    "Place Order";

            },


        /* ==============================
           PAYSTACK ERROR
        ============================== */

        onError:
            function (error) {

                console.error(
                    "Paystack error:",
                    error
                );


                message.textContent =

                    "❌ Paystack error: " +

                    (
                        error &&
                        error.message
                            ? error.message
                            : "Unable to start payment."
                    );


                button.disabled =
                    false;


                button.textContent =
                    "Place Order";

            },


        /* ==============================
           PAYSTACK LOADED
        ============================== */

        onLoad:
            function (response) {

                console.log(
                    "Paystack checkout loaded:",
                    response
                );


                message.textContent =
                    "Please complete your payment.";

            }

    });

}


/* ==========================================
   PLACE OFFLINE ORDER
========================================== */

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


    let status =
        "Pending Payment";


    await saveOrderToSupabase(
        customer,
        orderNumber,
        status,
        paymentMethod
    );


    /*
     * Clear cart.
     */

    localStorage.removeItem(
        "cart"
    );


    if (
        paymentMethod ===
        "cod"
    ) {

        message.textContent =
            "✅ Your Cash on Delivery order has been placed!";

    }

    else if (
        paymentMethod ===
        "bank"
    ) {

        message.textContent =
            "✅ Your Bank Transfer order has been placed!";

    }


    button.textContent =
        "Order Placed";


    /*
     * Send WhatsApp.
     */

    setTimeout(
        function () {

            openWhatsApp(
                orderNumber,
                status,
                paymentMethod
            );

        },
        800
    );

}


/* ==========================================
   PLACE ORDER BUTTON
========================================== */

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


            /*
             * Validate form.
             */

            if (
                form &&
                !form.checkValidity()
            ) {

                form.reportValidity();

                return;

            }


            /*
             * Get cart.
             */

            cart =
                getCheckoutCart();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            /*
             * Check customer login.
             */

            const customer =
                await getLoggedInCustomer();


            if (!customer) {

                alert(
                    "Please login or create an account before placing an order."
                );


                window.location.href =
                    "login.html?redirect=checkout.html";


                return;

            }


            /*
             * Calculate total.
             */

            calculateCheckoutTotal();


            if (finalTotal <= 0) {

                alert(
                    "Invalid order total."
                );

                return;

            }


            /*
             * Get payment method.
             */

            const paymentMethod =
                getPaymentMethod();


            if (!paymentMethod) {

                alert(
                    "Please select a payment method."
                );

                return;

            }


            /*
             * Generate order number.
             */

            const orderNumber =
                generateOrderNumber();


            /*
             * Disable button.
             */

            button.disabled =
                true;


            message.textContent =
                "";


            try {

                /*
                 * PAYSTACK
                 */

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


                /*
                 * CASH ON DELIVERY
                 */

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


                /*
                 * BANK TRANSFER
                 */

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
                    "Invalid payment method selected."
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
                        "Unable to place your order."
                    );


                button.disabled =
                    false;


                button.textContent =
                    "Place Order";

            }

        }
    );

}


/* ==========================================
   INITIALIZE CHECKOUT
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /*
         * Load cart.
         */

        cart =
            getCheckoutCart();


        /*
         * Calculate total.
         */

        calculateCheckoutTotal();


        /*
         * Display products.
         */

        displayCheckoutSummary();


        /*
         * Setup payment methods.
         */

        setupPaymentMethods();


        /*
         * Setup coupon.
         */

        setupCoupon();


        /*
         * Check login.
         */

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


            /*
             * Fill email.
             */

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


            /*
             * Fill full name.
             */

            const fullnameInput =
                document.getElementById(
                    "fullname"
                );


            const fullName =
                customer.user_metadata &&
                customer.user_metadata.full_name
                    ? customer.user_metadata.full_name
                    : "";


            if (
                fullnameInput &&
                fullName
            ) {

                fullnameInput.value =
                    fullName;

            }

        }


        /*
         * Setup Place Order button.
         */

        setupPlaceOrder();


        console.log(
            "Hasbunallahu Store checkout loaded successfully."
        );

    }
);