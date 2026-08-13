// ==========================================
// HASBUNALLAHU STORE
// CHECKOUT JAVASCRIPT
// SUPABASE + PAYSTACK
// WHATSAPP REMOVED
// ==========================================


// ==========================================
// PAYSTACK PUBLIC KEY
// ==========================================

const PAYSTACK_PUBLIC_KEY =
    "pk_test_17d80f52a39fb05435d5898b29744b5b034d85a9";


// ==========================================
// VARIABLES
// ==========================================

let cart = [];

let originalTotal = 0;

let discountAmount = 0;

let finalTotal = 0;

let appliedCoupon = "";


// ==========================================
// GET CART
// ==========================================

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

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// GENERATE ORDER NUMBER
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
// GET CHECKOUT MESSAGE
// ==========================================

function getCheckoutMessage() {

    let message =
        document.getElementById(
            "checkout-message"
        );

    if (!message) {

        message =
            document.createElement(
                "div"
            );

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

        if (
            button &&
            button.parentNode
        ) {

            button.parentNode.insertBefore(
                message,
                button.nextSibling
            );

        }

    }

    return message;

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

    const totalElement =
        document.getElementById(
            "checkout-total"
        );

    if (totalElement) {

        totalElement.textContent =
            formatMoney(finalTotal);

    }

}


// ==========================================
// DISPLAY ORDER SUMMARY
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

            <p>
                Your cart is empty.
            </p>

            <p class="total-row">

                <span>
                    Total:
                </span>

                <strong>
                    ₦0.00
                </strong>

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
// GET PAYMENT METHOD
// ==========================================

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


// ==========================================
// PAYMENT METHOD NAME
// ==========================================

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


    let deliveryNote = "";


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


    // ==========================================
    // CREATE ORDER
    // ==========================================

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
        data: order,
        error: orderError
    } =
        await supabaseClient
            .from("orders")
            .insert(
                [orderData]
            )
            .select()
            .single();


    if (orderError) {

        console.error(
            "ORDER SAVE ERROR:",
            orderError
        );

        throw orderError;

    }


    console.log(
        "Order saved:",
        order
    );


    // ==========================================
    // SAVE ORDER ITEMS
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
                        item.id,

                    product_name:
                        item.name,

                    quantity:
                        quantity,

                    price:
                        price,

                    subtotal:
                        price * quantity

                };

            }
        );


    if (
        orderItems.length > 0
    ) {

        const {
            error: itemsError
        } =
            await supabaseClient
                .from("order_items")
                .insert(
                    orderItems
                );


        if (itemsError) {

            console.error(
                "ORDER ITEMS ERROR:",
                itemsError
            );

            /*
             * Delete the order if
             * order items failed.
             */

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


    // ==========================================
    // REDUCE PRODUCT STOCK
    // ==========================================

    for (
        const item of cart
    ) {

        const quantity =
            Number(item.quantity) || 1;


        const {
            data: product,
            error: productError
        } =
            await supabaseClient
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

            console.error(
                "PRODUCT STOCK ERROR:",
                productError
            );

            continue;

        }


        const currentStock =
            Number(
                product.quantity
            ) || 0;


        const newStock =
            Math.max(
                0,
                currentStock -
                quantity
            );


        const {
            error: updateError
        } =
            await supabaseClient
                .from("products")
                .update({
                    quantity:
                        newStock
                })
                .eq(
                    "id",
                    item.id
                );


        if (updateError) {

            console.error(
                "STOCK UPDATE ERROR:",
                updateError
            );

        }

    }


    return order;

}


// ==========================================
// SETUP PAYMENT METHODS
// ==========================================

function setupPaymentMethods() {

    const paymentInputs =
        document.querySelectorAll(
            'input[name="payment-method"]'
        );


    const bankDetails =
        document.getElementById(
            "bank-details"
        );


    if (
        !paymentInputs.length
    ) {

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
                    originalTotal *
                    0.10;


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


// ==========================================
// PAYSTACK PAYMENT
// ==========================================

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


    // ==========================================
    // CHECK PAYSTACK
    // ==========================================

    if (
        typeof PaystackPop ===
        "undefined"
    ) {

        throw new Error(
            "Paystack could not be loaded. Please make sure the Paystack script is loaded in checkout.html."
        );

    }


    // ==========================================
    // CHECK PUBLIC KEY
    // ==========================================

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


    if (!email) {

        throw new Error(
            "Please enter your email address."
        );

    }


    // ==========================================
    // PAYSTACK V2
    // ==========================================

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


        // ==========================================
        // PAYMENT SUCCESS
        // ==========================================

        onSuccess:
            async function (
                transaction
            ) {

                console.log(
                    "Paystack successful:",
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


                    localStorage.removeItem(
                        "cart"
                    );


                    message.textContent =
                        "✅ Payment successful! Your order has been saved.";


                    button.disabled =
                        true;


                    button.textContent =
                        "Order Placed";


                    /*
                     * Go to My Orders
                     * after a short delay.
                     */

                    setTimeout(
                        function () {

                            window.location.href =
                                "order.html";

                        },
                        1500
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


        // ==========================================
        // PAYMENT CANCELLED
        // ==========================================

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


        // ==========================================
        // PAYSTACK ERROR
        // ==========================================

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


        // ==========================================
        // PAYSTACK LOADED
        // ==========================================

        onLoad:
            function () {

                console.log(
                    "Paystack checkout loaded."
                );


                message.textContent =
                    "Please complete your payment.";

            }

    });

}


// ==========================================
// PLACE OFFLINE ORDER
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


    const status =
        "Pending Payment";


    await saveOrderToSupabase(

        customer,

        orderNumber,

        status,

        paymentMethod

    );


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


    button.disabled =
        true;


    /*
     * Go to My Orders.
     */

    setTimeout(
        function () {

            window.location.href =
                "order.html";

        },
        1500
    );

}


// ==========================================
// PLACE ORDER BUTTON
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


            // ==========================================
            // VALIDATE FORM
            // ==========================================

            if (
                form &&
                !form.checkValidity()
            ) {

                form.reportValidity();

                return;

            }


            // ==========================================
            // GET CART
            // ==========================================

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


            // ==========================================
            // CHECK LOGIN
            // ==========================================

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


            // ==========================================
            // CALCULATE TOTAL
            // ==========================================

            calculateCheckoutTotal();


            if (
                finalTotal <= 0
            ) {

                alert(
                    "Invalid order total."
                );

                return;

            }


            // ==========================================
            // PAYMENT METHOD
            // ==========================================

            const paymentMethod =
                getPaymentMethod();


            if (!paymentMethod) {

                alert(
                    "Please select a payment method."
                );

                return;

            }


            // ==========================================
            // ORDER NUMBER
            // ==========================================

            const orderNumber =
                generateOrderNumber();


            button.disabled =
                true;


            message.textContent =
                "";


            try {

                // ==========================================
                // PAYSTACK
                // ==========================================

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


                // ==========================================
                // CASH ON DELIVERY
                // ==========================================

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


                // ==========================================
                // BANK TRANSFER
                // ==========================================

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


// ==========================================
// INITIALIZE CHECKOUT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // ==========================================
        // LOAD CART
        // ==========================================

        cart =
            getCheckoutCart();


        // ==========================================
        // CALCULATE TOTAL
        // ==========================================

        calculateCheckoutTotal();


        // ==========================================
        // DISPLAY SUMMARY
        // ==========================================

        displayCheckoutSummary();


        // ==========================================
        // PAYMENT METHODS
        // ==========================================

        setupPaymentMethods();


        // ==========================================
        // COUPON
        // ==========================================

        setupCoupon();


        // ==========================================
        // CHECK LOGIN
        // ==========================================

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


            // ==========================================
            // FILL EMAIL
            // ==========================================

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


            // ==========================================
            // FILL NAME
            // ==========================================

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


        // ==========================================
        // PLACE ORDER
        // ==========================================

        setupPlaceOrder();


        console.log(
            "Hasbunallahu Store checkout loaded successfully."
        );

    }
);