// ==========================================
// Hasbunallahu Store - Checkout & Paystack
// ==========================================


// ==========================================
// Variables
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


                // Customer details
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


                // Get cart
                const cart =
                    JSON.parse(
                        localStorage.getItem("cart")
                    ) || [];


                // Original total
                const originalTotal =
                    getCheckoutCartTotal();


                // Final total after discount
                const discountAmount =
                    originalTotal *
                    (couponDiscount / 100);


                const total =
                    originalTotal -
                    discountAmount;


                // Validate customer details
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


                // Check cart
                if (
                    cart.length === 0 ||
                    originalTotal <= 0
                ) {

                    alert(
                        "Your cart is empty."
                    );

                    return;

                }


                // Check Paystack
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
                // Paystack
                // ==========================================

                const handler =
                    PaystackPop.setup({

                        key:
                            "pk_test_17d80f52a39fb05435d5898b29744b5b034d85a9",


                        email:
                            email,


                        amount:
                            Math.round(total * 100),


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

                                let orders =
                                    JSON.parse(
                                        localStorage.getItem(
                                            "orders"
                                        )
                                    ) || [];


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
                                            item => ({

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

                                            })
                                        )

                                };


                                // Save order
                                orders.push(
                                    newOrder
                                );


                                localStorage.setItem(
                                    "orders",
                                    JSON.stringify(
                                        orders
                                    )
                                );


                                // Clear cart
                                localStorage.removeItem(
                                    "cart"
                                );


                                alert(
                                    "Payment successful!\n\n" +
                                    "Order: " +
                                    orderNumber +
                                    "\nReference: " +
                                    response.reference
                                );


                                window.location.href =
                                    "success.html";

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