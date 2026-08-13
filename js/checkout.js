// ==========================================
// HASBUNALLAHU STORE
// CHECKOUT JAVASCRIPT
// SUPABASE + PAYSTACK + EMAILJS
// WHATSAPP REMOVED
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

        if (!savedCart) {
            return [];
        }

        const parsed =
            JSON.parse(savedCart);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error("Cart error:", error);

        return [];

    }

}


// ==========================================
// MONEY
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

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

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
// GENERATE TRACKING NUMBER
// ==========================================

function generateTrackingNumber() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

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
// MESSAGE
// ==========================================

function getCheckoutMessage() {

    let message =
        document.getElementById(
            "checkout-message"
        );

    if (!message) {

        message =
            document.createElement("div");

        message.id =
            "checkout-message";

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


// ==========================================
// CALCULATE TOTAL
// ==========================================

function calculateCheckoutTotal() {

    cart =
        getCheckoutCart();

    originalTotal = 0;

    cart.forEach(function(item) {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        originalTotal +=
            price * quantity;

    });

    finalTotal =
        Math.max(
            0,
            originalTotal - discountAmount
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
// ORDER SUMMARY
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

        summary.innerHTML =
            "<p>Your cart is empty.</p>";

        return;

    }

    let html = "";

    cart.forEach(function(item) {

        const name =
            item.name || "Product";

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        const itemTotal =
            price * quantity;

        html += `

            <div class="checkout-product">

                <span>
                    ${escapeHtml(name)}
                    × ${quantity}
                </span>

                <strong>
                    ${formatMoney(itemTotal)}
                </strong>

            </div>

        `;

    });

    html += `

        <hr>

        <p class="total-row">

            <span>Total:</span>

            <strong>
                ${formatMoney(finalTotal)}
            </strong>

        </p>

    `;

    summary.innerHTML =
        html;

}


// ==========================================
// GET CUSTOMER
// ==========================================

async function getLoggedInCustomer() {

    try {

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "Supabase client unavailable."
            );

            return null;

        }

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();

        if (error) {

            console.error(
                "Auth error:",
                error
            );

            return null;

        }

        return data.user || null;

    } catch (error) {

        console.error(
            "Login error:",
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
// SAVE ORDER
// ==========================================

async function saveOrderToSupabase(
    customer,
    orderNumber,
    paymentStatus,
    paymentMethod
) {

    const fullname =
        document.getElementById("fullname")?.value.trim() || "";

    const phone =
        document.getElementById("phone")?.value.trim() || "";

    const email =
        document.getElementById("email")?.value.trim() || "";

    const address =
        document.getElementById("address")?.value.trim() || "";

    const state =
        document.getElementById("state")?.value.trim() || "";

    const city =
        document.getElementById("city")?.value.trim() || "";


    let deliveryNote = "";

    if (paymentMethod === "cod") {

        deliveryNote =
            "Cash on Delivery";

    } else if (paymentMethod === "bank") {

        deliveryNote =
            "Bank Transfer - Payment Pending";

    } else if (paymentMethod === "paystack") {

        deliveryNote =
            "Paid with Paystack";

    }


    const orderData = {

        order_number:
            orderNumber,

        customer_name:
            fullname,

        customer_email:
            customer?.email || email,

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

        tracking_number: generateTrackingNumber(),

        delivery_note:
            deliveryNote

    };


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
            "ORDER SAVE ERROR:",
            orderError
        );

        throw orderError;

    }


    const orderItems =
        cart.map(function(item) {

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

        });


    if (orderItems.length > 0) {

        const {
            error: itemsError
        } =
            await supabaseClient
                .from("order_items")
                .insert(orderItems);

        if (itemsError) {

            await supabaseClient
                .from("orders")
                .delete()
                .eq("id", order.id);

            throw itemsError;

        }

    }


    // Reduce stock

    for (const item of cart) {

        const quantity =
            Number(item.quantity) || 1;

        const {
            data: product,
            error: productError
        } =
            await supabaseClient
                .from("products")
                .select("id, quantity")
                .eq("id", item.id)
                .single();

        if (productError) {
            continue;
        }

        const currentStock =
            Number(product.quantity) || 0;

        await supabaseClient
            .from("products")
            .update({
                quantity:
                    Math.max(
                        0,
                        currentStock - quantity
                    )
            })
            .eq("id", item.id);

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

    if (
        typeof emailjs ===
        "undefined"
    ) {

        throw new Error(
            "EmailJS is not loaded."
        );

    }


    const fullname =
        document.getElementById("fullname")?.value.trim() || "";

    const phone =
        document.getElementById("phone")?.value.trim() || "";

    const email =
        document.getElementById("email")?.value.trim() || "";

    const address =
        document.getElementById("address")?.value.trim() || "";

    const state =
        document.getElementById("state")?.value.trim() || "";

    const city =
        document.getElementById("city")?.value.trim() || "";


    const orderItems =
        cart.map(function(item) {

            const quantity =
                Number(item.quantity) || 1;

            const price =
                Number(item.price) || 0;

            return (
                item.name +
                " × " +
                quantity +
                " = " +
                formatMoney(
                    price * quantity
                )
            );

        }).join("\n");


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
            new Date().toLocaleString("en-NG"),

        subtotal:
            formatMoney(originalTotal),

        total:
            formatMoney(finalTotal),

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


    console.log(
        "EmailJS parameters:",
        params
    );


    // Customer email

    const customerEmail =
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_CUSTOMER_TEMPLATE,
            params
        );


    console.log(
        "Customer email sent:",
        customerEmail
    );


    // Admin email

    const adminEmail =
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_ADMIN_TEMPLATE,
            params
        );


    console.log(
        "Admin email sent:",
        adminEmail
    );

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
        document.getElementById("fullname")?.value.trim() || "";

    const email =
        document.getElementById("email")?.value.trim() || "";


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
            new Date().toLocaleString("en-NG")

    };


    localStorage.setItem(
        "lastOrder",
        JSON.stringify(successData)
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
// SETUP PAYMENT METHODS
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


    inputs.forEach(function(input) {

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

    });

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
                    originalTotal * 0.10;

                message.textContent =
                    "✅ 10% discount applied.";

            } else {

                discountAmount = 0;

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
// PAYSTACK
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
        document.getElementById(
            "email"
        )?.value.trim() || "";


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
                orderNumber,

            customer_name:
                document.getElementById(
                    "fullname"
                )?.value.trim() || "",

            customer_phone:
                document.getElementById(
                    "phone"
                )?.value.trim() || ""

        },


        onSuccess:
            async function(transaction) {

                console.log(
                    "Payment successful:",
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
                        "Sending email notifications...";


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

                } catch (error) {

                    console.error(
                        "Payment/order error:",
                        error
                    );

                    message.innerHTML =
                        "⚠️ Payment was successful, " +
                        "but the order could not be completed.<br><br>" +
                        "<strong>Order Number:</strong> " +
                        escapeHtml(orderNumber) +
                        "<br><br>" +
                        "Please contact the store.";

                    button.disabled = false;

                    button.textContent =
                        "Place Order";

                }

            },


        onCancel:
            function() {

                message.textContent =
                    "Payment was cancelled.";

                button.disabled = false;

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

                button.disabled = false;

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


    message.textContent =
        "Sending email notifications...";


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


            button.disabled = true;


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

            } catch (error) {

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

                button.disabled = false;

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
    async function() {

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

        } else {

            if (loginRequired) {
                loginRequired.style.display =
                    "none";
            }


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


            const fullnameInput =
                document.getElementById(
                    "fullname"
                );


            const fullName =
                customer.user_metadata?.full_name ||
                "";


            if (
                fullnameInput &&
                fullName
            ) {

                fullnameInput.value =
                    fullName;

            }

        }


        setupPlaceOrder();


        console.log(
            "Hasbunallahu Store checkout loaded successfully."
        );

    }
);