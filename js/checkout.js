// ==========================================
// Hasbunallahu Store - Checkout
// Paystack v2 + EmailJS + Supabase
// ==========================================

let couponDiscount = 0;


// ==========================================
// Get Cart
// ==========================================

function getCheckoutCart() {

    return JSON.parse(
        localStorage.getItem("cart")
    ) || [];

}


// ==========================================
// Get Cart Total
// ==========================================

function getCheckoutCartTotal() {

    const cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(function (item) {

        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        total += price * quantity;

    });

    return total;
}


// ==========================================
// Update Checkout Total
// ==========================================

function updateCheckoutTotal() {

    const originalTotal =
        getCheckoutCartTotal();

    const discountAmount =
        originalTotal * (couponDiscount / 100);

    const finalTotal =
        originalTotal - discountAmount;

    const totalElement =
        document.getElementById("checkout-total");

    if (totalElement) {

        totalElement.textContent =
            "₦" +
            finalTotal.toLocaleString();

    }

    return finalTotal;
}


// ==========================================
// Coupons
// ==========================================

const coupons = {

    SAVE10: 10,
    SAVE20: 20,
    WELCOME: 5

};


// ==========================================
// Apply Coupon
// ==========================================

function setupCoupon() {

    const applyCoupon =
        document.getElementById(
            "apply-coupon"
        );

    if (!applyCoupon) return;


    applyCoupon.addEventListener(
        "click",
        function () {

            const couponInput =
                document.getElementById(
                    "coupon-code"
                );

            const couponMessage =
                document.getElementById(
                    "coupon-message"
                );

            const code =
                couponInput.value
                    .trim()
                    .toUpperCase();


            if (code === "") {

                couponMessage.textContent =
                    "Please enter a coupon code.";

                return;

            }


            if (!coupons[code]) {

                couponDiscount = 0;

                couponMessage.textContent =
                    "❌ Invalid coupon code.";

                updateCheckoutTotal();

                return;

            }


            couponDiscount =
                coupons[code];


            couponMessage.textContent =
                "✅ Coupon applied! " +
                couponDiscount +
                "% discount.";

            updateCheckoutTotal();

        }
    );

}


// ==========================================
// Send Order Email
// ==========================================

function sendOrderEmail(orderData) {

    if (
        typeof emailjs === "undefined"
    ) {

        console.error(
            "EmailJS is not loaded."
        );

        return Promise.reject(
            "EmailJS is not loaded."
        );

    }


    let itemsHTML = "";


    orderData.items.forEach(
        function (item) {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            itemsHTML += `
                <div style="
                    padding:10px 0;
                    border-bottom:1px solid #ddd;
                ">

                    <strong>
                        ${item.name}
                    </strong>

                    <br>

                    Quantity:
                    ${item.quantity}

                    <br>

                    Price:
                    ₦${Number(item.price).toLocaleString()}

                    <br>

                    Subtotal:
                    ₦${itemTotal.toLocaleString()}

                </div>
            `;

        }
    );


    return emailjs.send(

        "service_x0frozt",

        "template_3wqeitu",

        {

            orderNumber:
                orderData.orderNumber,

            orderDate:
                orderData.orderDate,

            fullname:
                orderData.fullname,

            email:
                orderData.email,

            phone:
                orderData.phone,

            address:
                orderData.address,

            state:
                orderData.state,

            city:
                orderData.city,

            items:
                itemsHTML,

            subtotal:
                Number(
                    orderData.subtotal
                ).toLocaleString(),

            discount:
                orderData.discount,

            total:
                Number(
                    orderData.total
                ).toLocaleString(),

            reference:
                orderData.reference,

            status:
                "Paid"

        }

    );

}


// ==========================================
// Save Order Locally
// ==========================================

function saveOrder(orderData) {

    let orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    orders.push(orderData);


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

}


/ ORDER TO SUPABASE
// ==========================================
// Save Order To Supabase
// ==========================================

async function saveOrderToSupabase(orderData) {

    const { error } = await supabaseClient
        .from("orders")
        .insert([{

            order_number: orderData.orderNumber,

            customer_name: orderData.fullname,

            customer_email: orderData.email,

            phone: orderData.phone,

            address: orderData.address,

            city: orderData.city,

            state: orderData.state,

            total: orderData.total,

            status: orderData.status,

            tracking_number: null,

            delivery_note:
                "Order received. Preparing for delivery."

        }]);

    if (error) {

        console.error(
            "Supabase error:",
            error
        );

        throw error;

    }

    console.log(
        "Order successfully saved to Supabase."
    );
}

// ==========================================
// Start Checkout
// ==========================================

function setupCheckout() {

    const placeOrder =
        document.getElementById(
            "place-order"
        );

    if (!placeOrder) return;


    placeOrder.addEventListener(
        "click",
        async function (e) {

            e.preventDefault();


            // ==========================================
            // Customer Details
            // ==========================================

            const fullname =
                document.getElementById(
                    "fullname"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
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


            // ==========================================
            // Cart
            // ==========================================

            const cart =
                getCheckoutCart();


            const subtotal =
                getCheckoutCartTotal();


            const discountAmount =
                subtotal *
                (couponDiscount / 100);


            const total =
                subtotal -
                discountAmount;


            // ==========================================
            // Validate Customer
            // ==========================================

            if (
                fullname === "" ||
                email === "" ||
                phone === "" ||
                address === "" ||
                state === "" ||
                city === ""
            ) {

                alert(
                    "Please fill all customer details."
                );

                return;

            }


            // ==========================================
            // Validate Cart
            // ==========================================

            if (
                cart.length === 0 ||
                subtotal <= 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            // ==========================================
            // Check Paystack
            // ==========================================

            if (
                typeof PaystackPop ===
                "undefined"
            ) {

                alert(
                    "Paystack could not load. Please refresh the page and check your Internet connection."
                );

                console.error(
                    "PaystackPop is not available."
                );

                return;

            }


            // ==========================================
            // Disable Button
            // ==========================================

            placeOrder.disabled = true;

            placeOrder.textContent =
                "Opening Payment...";


            try {

                // ==========================================
                // Paystack
                // ==========================================

                const paystack =
                    new PaystackPop();


                paystack.newTransaction({

                    key:
                        "pk_test_17d80f52a39fb05435d5898b29744b5b034d85a9",

                    email:
                        email,

                    amount:
                        Math.round(
                            total * 100
                        ),

                    currency:
                        "NGN",


                    metadata: {

                        custom_fields: [

                            {
                                display_name:
                                    "Customer Name",

                                variable_name:
                                    "name",

                                value:
                                    fullname
                            },

                            {
                                display_name:
                                    "Phone Number",

                                variable_name:
                                    "phone",

                                value:
                                    phone
                            },

                            {
                                display_name:
                                    "Delivery Address",

                                variable_name:
                                    "address",

                                value:
                                    address
                            },

                            {
                                display_name:
                                    "State",

                                variable_name:
                                    "state",

                                value:
                                    state
                            },

                            {
                                display_name:
                                    "City",

                                variable_name:
                                    "city",

                                value:
                                    city
                            },

                            {
                                display_name:
                                    "Discount",

                                variable_name:
                                    "discount",

                                value:
                                    couponDiscount +
                                    "%"
                            }

                        ]

                    },


                    // ==========================================
                    // Payment Successful
                    // ==========================================

                    onSuccess:
                        async function (response) {

                            console.log(
                                "Payment successful:",
                                response
                            );


                            // ==========================================
                            // Order Number
                            // ==========================================

                            const orderNumber =
                                "HSB-" +
                                Date.now();


                            const orderDate =
                                new Date()
                                    .toLocaleString();


                            // ==========================================
                            // Create Order
                            // ==========================================

                            const newOrder = {

                                orderNumber:
                                    orderNumber,

                                orderDate:
                                    orderDate,

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

                                subtotal:
                                    subtotal,

                                discount:
                                    couponDiscount,

                                total:
                                    total,

                                reference:
                                    response.reference,

                                date:
                                    orderDate,

                                status:
                                    "Paid",

                                items:
                                    cart.map(
                                        function (item) {

                                            return {

                                                id:
                                                    item.id,

                                                name:
                                                    item.name,

                                                price:
                                                    item.price,

                                                image:
                                                    item.image,

                                                quantity:
                                                    item.quantity

                                            };

                                        }
                                    )

                            };


                            // ==========================================
                            // Save Local Order
                            // ==========================================

                            saveOrder(
                                newOrder
                            );


                            // ==========================================
                            // Save To Supabase
                            // ==========================================

                            let supabaseSaved =
                                false;


                            try {

                                await saveOrderToSupabase(
                                    newOrder
                                );


                                supabaseSaved =
                                    true;


                                console.log(
                                    "Order saved to Supabase successfully."
                                );

                            }

                            catch (
                                supabaseError
                            ) {

                                console.error(
                                    "Supabase save failed:",
                                    supabaseError
                                );

                            }


                            // ==========================================
                            // Send Email
                            // ==========================================

                            try {

                                await sendOrderEmail({

                                    orderNumber:
                                        orderNumber,

                                    orderDate:
                                        orderDate,

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

                                    items:
                                        cart,

                                    subtotal:
                                        subtotal,

                                    discount:
                                        couponDiscount,

                                    total:
                                        total,

                                    reference:
                                        response.reference

                                });


                                console.log(
                                    "Order email sent successfully."
                                );

                            }

                            catch (emailError) {

                                console.error(
                                    "EmailJS error:",
                                    emailError
                                );

                            }


                            // ==========================================
                            // Final Message
                            // ==========================================

                            if (
                                supabaseSaved
                            ) {

                                alert(

                                    "Payment successful!\n\n" +

                                    "Order: " +
                                    orderNumber +

                                    "\nReference: " +
                                    response.reference +

                                    "\n\nYour order has been received."

                                );

                            }

                            else {

                                alert(

                                    "Payment successful!\n\n" +

                                    "Order: " +
                                    orderNumber +

                                    "\nReference: " +
                                    response.reference +

                                    "\n\nYour order was saved locally, but online tracking could not be activated."

                                );

                            }


                            // ==========================================
                            // Clear Cart
                            // ==========================================

                            localStorage.removeItem(
                                "cart"
                            );


                            // ==========================================
                            // Go To Success Page
                            // ==========================================

                            window.location.href =
                                "success.html";

                        },


                    // ==========================================
                    // Payment Cancelled
                    // ==========================================

                    onCancel:
                        function () {

                            console.log(
                                "Payment cancelled."
                            );


                            alert(
                                "Payment cancelled."
                            );


                            placeOrder.disabled =
                                false;

                            placeOrder.textContent =
                                "Place Order";

                        }

                });

            }

            catch (error) {

                console.error(
                    "Paystack error:",
                    error
                );


                alert(
                    "Unable to open Paystack. Please refresh the page and try again."
                );


                placeOrder.disabled =
                    false;

                placeOrder.textContent =
                    "Place Order";

            }

        }
    );

}


// ==========================================
// Page Ready
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCheckoutTotal();

        setupCoupon();

        setupCheckout();

    }
);