// ==========================================
// Hasbunallahu Store - Checkout & Paystack
// ==========================================

let couponDiscount = 0;


// ==========================================
// Get Cart Total
// ==========================================

function getCheckoutCartTotal() {

    const cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item => {

        total +=
            Number(item.price) *
            Number(item.quantity);

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
        originalTotal *
        (couponDiscount / 100);

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
// Display Order Total
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCheckoutTotal();

    }
);


// ==========================================
// Discount Coupons
// ==========================================

const coupons = {

    SAVE10: 10,
    SAVE20: 20,
    WELCOME: 5

};


// ==========================================
// Apply Coupon
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

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
);


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


    // Product list
    let itemsHTML = "";


    orderData.items.forEach(
        function (item) {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            itemsHTML += `
                <div style="
                    padding: 8px 0;
                    border-bottom: 1px solid #ddd;
                ">
                    <strong>${item.name}</strong><br>
                    Quantity: ${item.quantity}<br>
                    Price: ₦${Number(item.price).toLocaleString()}<br>
                    Subtotal: ₦${itemTotal.toLocaleString()}
                </div>
            `;

        }
    );


    // ==========================================
    // EmailJS
    // ==========================================

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
                orderData.reference

        }

    );

}


// ==========================================
// Place Order
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const placeOrder =
            document.getElementById(
                "place-order"
            );


        if (!placeOrder) return;


        placeOrder.addEventListener(
            "click",
            function (e) {

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
                // Get Cart
                // ==========================================

                const cart =
                    JSON.parse(
                        localStorage.getItem("cart")
                    ) || [];


                // ==========================================
                // Calculate Totals
                // ==========================================

                const originalTotal =
                    getCheckoutCartTotal();


                const discountAmount =
                    originalTotal *
                    (couponDiscount / 100);


                const total =
                    originalTotal -
                    discountAmount;


                // ==========================================
                // Validate Customer Details
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
                // Check Cart
                // ==========================================

                if (
                    cart.length === 0 ||
                    originalTotal <= 0
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
                        "Paystack could not load. Please check your Internet connection and refresh the page."
                    );

                    return;

                }


                // ==========================================
                // Open Paystack
                // ==========================================

                const handler =
                    PaystackPop.setup({

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
                        // Successful Payment
                        // ==========================================

                        callback:
                            function (response) {

                                // ==========================================
                                // Create Order
                                // ==========================================

                                const orderNumber =
                                    "HSB-" +
                                    Date.now();


                                const orderDate =
                                    new Date()
                                        .toLocaleString();


                                const newOrder = {

                                    orderNumber:
                                        orderNumber,

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
                                        originalTotal,

                                    total:
                                        total,

                                    discount:
                                        couponDiscount,

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
                                // Save Order
                                // ==========================================

                                let orders =
                                    JSON.parse(
                                        localStorage.getItem(
                                            "orders"
                                        )
                                    ) || [];


                                orders.push(
                                    newOrder
                                );


                                localStorage.setItem(
                                    "orders",
                                    JSON.stringify(
                                        orders
                                    )
                                );


                                // ==========================================
                                // Send Email
                                // ==========================================

                                sendOrderEmail({

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
                                        originalTotal,

                                    discount:
                                        couponDiscount,

                                    total:
                                        total,

                                    reference:
                                        response.reference

                                })

                                .then(
                                    function () {

                                        console.log(
                                            "Order email sent successfully."
                                        );


                                        alert(

                                            "Payment successful!\n\n" +

                                            "Order: " +
                                            orderNumber +

                                            "\nReference: " +
                                            response.reference +

                                            "\n\nOrder confirmation sent."

                                        );


                                        // Clear cart
                                        localStorage.removeItem(
                                            "cart"
                                        );


                                        // Go to success page
                                        window.location.href =
                                            "success.html";

                                    }
                                )

                                .catch(
                                    function (error) {

                                        console.error(
                                            "EmailJS error:",
                                            error
                                        );


                                        alert(

                                            "Payment was successful, but the order email could not be sent.\n\n" +

                                            "Order: " +
                                            orderNumber +

                                            "\nReference: " +
                                            response.reference +

                                            "\n\nPlease contact the store."

                                        );


                                        // Clear cart
                                        localStorage.removeItem(
                                            "cart"
                                        );


                                        // Go to success page
                                        window.location.href =
                                            "success.html";

                                    }
                                );

                            },


                        // ==========================================
                        // Payment Cancelled
                        // ==========================================

                        onClose:
                            function () {

                                alert(
                                    "Payment cancelled."
                                );

                            }

                    });


                handler.openIframe();

            }
        );

    }
);