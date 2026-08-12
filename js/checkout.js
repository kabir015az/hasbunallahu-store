// ==========================================
// Hasbunallahu Store - Checkout
// Paystack + EmailJS + Supabase
// Automatic Stock Reduction
// ==========================================

let couponDiscount = 0;

// ==========================================
// GET CART
// ==========================================

function getCheckoutCart() {

return JSON.parse(
    localStorage.getItem("cart")
) || [];

}

// ==========================================
// GET CART TOTAL
// ==========================================

function getCheckoutCartTotal() {

const cart =
    getCheckoutCart();

let total = 0;

cart.forEach(function (item) {

    const price =
        Number(item.price) || 0;

    const quantity =
        Number(item.quantity) || 1;

    total +=
        price * quantity;

});

return total;

}

// ==========================================
// UPDATE CHECKOUT TOTAL
// ==========================================

function updateCheckoutTotal() {

const originalTotal =
    getCheckoutCartTotal();

const discountAmount =
    originalTotal *
    (couponDiscount / 100);

const finalTotal =
    originalTotal -
    discountAmount;

const totalElement =
    document.getElementById(
        "checkout-total"
    );

if (totalElement) {

    totalElement.textContent =
        "₦" +
        finalTotal.toLocaleString();

}

return finalTotal;

}

// ==========================================
// COUPONS
// ==========================================

const coupons = {

SAVE10: 10,

SAVE20: 20,

WELCOME: 5

};

// ==========================================
// APPLY COUPON
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
// CREATE PRODUCTS HTML FOR EMAIL
// ==========================================

function createItemsHTML(items) {

let itemsHTML = "";


if (
    !items ||
    items.length === 0
) {

    return "No products.";

}


items.forEach(function (item) {

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
            ₦${Number(
                item.price
            ).toLocaleString()}

            <br>

            Subtotal:
            ₦${itemTotal.toLocaleString()}

        </div>

    `;

});


return itemsHTML;

}

// ==========================================
// CREATE EMAIL DATA
// ==========================================

function createEmailData(orderData) {

return {

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
        createItemsHTML(
            orderData.items
        ),

    subtotal:
        Number(
            orderData.subtotal
        ).toLocaleString(),

    discount:
        orderData.discount +
        "%",

    total:
        Number(
            orderData.total
        ).toLocaleString(),

    reference:
        orderData.reference,

    status:
        orderData.status ||
        "Paid"

};

}

// ==========================================
// SEND NEW ORDER EMAIL
// ==========================================

function sendNewOrderEmail(
orderData
) {

if (
    typeof emailjs ===
    "undefined"
) {

    console.error(
        "EmailJS is not loaded."
    );

    return Promise.reject(
        new Error(
            "EmailJS is not loaded."
        )
    );

}


return emailjs.send(

    "service_x0frozt",

    "template_3wqeitu",

    createEmailData(
        orderData
    )

);

}

// ==========================================
// SEND CUSTOMER CONFIRMATION EMAIL
// ==========================================

function sendCustomerConfirmationEmail(
orderData
) {

if (
    typeof emailjs ===
    "undefined"
) {

    console.error(
        "EmailJS is not loaded."
    );

    return Promise.reject(
        new Error(
            "EmailJS is not loaded."
        )
    );

}


return emailjs.send(

    "service_x0frozt",

    "template_mo5bvrd",

    createEmailData(
        orderData
    )

);

}

// ==========================================
// SAVE ORDER LOCALLY
// ==========================================

function saveOrder(
orderData
) {

let orders =
    JSON.parse(
        localStorage.getItem(
            "orders"
        )
    ) || [];


orders.push(
    orderData
);


localStorage.setItem(
    "orders",
    JSON.stringify(
        orders
    )
);

}

// ==========================================
// SAVE ORDER TO SUPABASE
// ==========================================

async function saveOrderToSupabase(
orderData
) {

if (
    typeof supabaseClient ===
    "undefined"
) {

    throw new Error(
        "Supabase is not connected."
    );

}


const {
    error
} =
    await supabaseClient
        .from("orders")
        .insert([{

            order_number:
                orderData.orderNumber,

            customer_name:
                orderData.fullname,

            customer_email:
                orderData.email,

            phone:
                orderData.phone,

            address:
                orderData.address,

            city:
                orderData.city,

            state:
                orderData.state,

            total:
                orderData.total,

            status:
                orderData.status,

            tracking_number:
                null,

            delivery_note:
                "Order received. Preparing for delivery."

        }]);


if (error) {

    console.error(
        "Supabase order error:",
        error
    );

    throw error;

}


console.log(
    "Order successfully saved to Supabase."
);

}

// ==========================================
// CHECK PRODUCT STOCK BEFORE PAYMENT
// ==========================================

async function checkProductStock(
cart
) {

if (
    typeof supabaseClient ===
    "undefined"
) {

    throw new Error(
        "Supabase is not connected."
    );

}


for (
    const item of cart
) {

    const {
        data: product,
        error
    } =
        await supabaseClient
            .from("products")
            .select(
                "id, name, quantity"
            )
            .eq(
                "id",
                item.id
            )
            .single();


    if (error) {

        console.error(
            "Stock check error:",
            error
        );

        throw new Error(
            "Could not check stock for " +
            item.name
        );

    }


    const available =
        Number(
            product.quantity
        ) || 0;


    const requested =
        Number(
            item.quantity
        ) || 0;


    if (
        requested <= 0
    ) {

        throw new Error(
            "Invalid quantity for " +
            item.name
        );

    }


    if (
        available <
        requested
    ) {

        throw new Error(
            product.name +
            " only has " +
            available +
            " item(s) available."
        );

    }

}


return true;

}

// ==========================================
// REDUCE PRODUCT STOCK
// ==========================================

async function reduceProductStock(
cart
) {

if (
    typeof supabaseClient ===
    "undefined"
) {

    throw new Error(
        "Supabase is not connected."
    );

}


for (
    const item of cart
) {

    // Get current stock

    const {
        data: product,
        error: fetchError
    } =
        await supabaseClient
            .from("products")
            .select(
                "id, name, quantity"
            )
            .eq(
                "id",
                item.id
            )
            .single();


    if (fetchError) {

        console.error(
            "Stock fetch error:",
            fetchError
        );

        throw new Error(
            "Could not update stock for " +
            item.name
        );

    }


    const currentStock =
        Number(
            product.quantity
        ) || 0;


    const purchasedQuantity =
        Number(
            item.quantity
        ) || 0;


    const newStock =
        currentStock -
        purchasedQuantity;


    if (
        newStock < 0
    ) {

        throw new Error(
            product.name +
            " does not have enough stock."
        );

    }


    // Update Supabase

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
            "Stock update error:",
            updateError
        );

        throw new Error(
            "Could not reduce stock for " +
            item.name
        );

    }


    console.log(
        product.name +
        " stock reduced from " +
        currentStock +
        " to " +
        newStock
    );

}


return true;

}

// ==========================================
// START CHECKOUT
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
        // CUSTOMER DETAILS
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
        // CART
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
        // VALIDATE CUSTOMER
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
        // VALIDATE CART
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
        // CHECK STOCK BEFORE PAYMENT
        // ==========================================

        placeOrder.disabled =
            true;

        placeOrder.textContent =
            "Checking stock...";


        try {

            await checkProductStock(
                cart
            );

        }

        catch (stockError) {

            console.error(
                "Stock check failed:",
                stockError
            );


            alert(
                "❌ " +
                stockError.message
            );


            placeOrder.disabled =
                false;

            placeOrder.textContent =
                "Place Order";

            return;

        }


        // ==========================================
        // CHECK PAYSTACK
        // ==========================================

        if (
            typeof PaystackPop ===
            "undefined"
        ) {

            alert(
                "Paystack could not load. Please refresh the page and check your Internet connection."
            );


            placeOrder.disabled =
                false;

            placeOrder.textContent =
                "Place Order";

            return;

        }


        placeOrder.textContent =
            "Opening Payment...";


        try {

            // ==========================================
            // PAYSTACK
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
                // PAYMENT SUCCESS
                // ==========================================

                onSuccess:
                    async function (
                        response
                    ) {

                        console.log(
                            "Payment successful:",
                            response
                        );


                        // ==========================================
                        // ORDER NUMBER
                        // ==========================================

                        const orderNumber =
                            "HSB-" +
                            Date.now();


                        const orderDate =
                            new Date()
                                .toLocaleString();


                        // ==========================================
                        // REDUCE STOCK
                        // ==========================================

                        let stockUpdated =
                            false;


                        try {

                            await reduceProductStock(
                                cart
                            );


                            stockUpdated =
                                true;


                            console.log(
                                "Product stock updated successfully."
                            );

                        }

                        catch (
                            stockError
                        ) {

                            console.error(
                                "Stock update failed:",
                                stockError
                            );


                            alert(
                                "⚠️ Payment was successful, but stock could not be updated automatically.\n\n" +
                                stockError.message +
                                "\n\nPlease contact the store administrator."
                            );

                        }


                        // ==========================================
                        // CREATE ORDER
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

                            stockUpdated:
                                stockUpdated,

                            items:
                                cart.map(
                                    function (
                                        item
                                    ) {

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
                        // SAVE LOCAL ORDER
                        // ==========================================

                        saveOrder(
                            newOrder
                        );


                        // ==========================================
                        // SAVE TO SUPABASE
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


                            alert(
                                "⚠️ Order was paid, but there was a problem saving the online order record.\n\n" +
                                supabaseError.message
                            );

                        }


                        // ==========================================
                        // EMAIL DATA
                        // ==========================================

                        const emailOrderData = {

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
                                response.reference,

                            status:
                                "Paid"

                        };


                        // ==========================================
                        // ADMIN EMAIL
                        // ==========================================

                        let adminEmailSent =
                            false;


                        try {

                            await sendNewOrderEmail(
                                emailOrderData
                            );


                            adminEmailSent =
                                true;


                            console.log(
                                "New order email sent successfully."
                            );

                        }

                        catch (
                            emailError
                        ) {

                            console.error(
                                "New order EmailJS error:",
                                emailError
                            );

                        }


                        // ==========================================
                        // CUSTOMER EMAIL
                        // ==========================================

                        let customerEmailSent =
                            false;


                        try {

                            await sendCustomerConfirmationEmail(
                                emailOrderData
                            );


                            customerEmailSent =
                                true;


                            console.log(
                                "Customer confirmation email sent successfully."
                            );

                        }

                        catch (
                            emailError
                        ) {

                            console.error(
                                "Customer confirmation EmailJS error:",
                                emailError
                            );

                        }


                        // ==========================================
                        // FINAL MESSAGE
                        // ==========================================

                        let message =
                            "Payment successful!\n\n" +

                            "Order: " +
                            orderNumber +

                            "\nReference: " +
                            response.reference +

                            "\n\nYour order has been received.";


                        if (
                            customerEmailSent
                        ) {

                            message +=
                                "\n\n📧 A confirmation email has been sent to " +
                                email +
                                ".";

                        }

                        else {

                            message +=
                                "\n\n⚠️ We could not send the confirmation email, but your order was received.";

                        }


                        if (
                            !supabaseSaved
                        ) {

                            message +=
                                "\n\n⚠️ Online order tracking could not be activated.";

                        }


                        if (
                            stockUpdated
                        ) {

                            message +=
                                "\n\n📦 Product stock has been updated.";

                        }


                        alert(
                            message
                        );


                        // ==========================================
                        // CLEAR CART
                        // ==========================================

                        localStorage.removeItem(
                            "cart"
                        );


                        // ==========================================
                        // GO TO SUCCESS PAGE
                        // ==========================================

                        window.location.href =
                            "success.html";

                    },


                // ==========================================
                // PAYMENT CANCELLED
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
// PAGE READY
// ==========================================

document.addEventListener(
"DOMContentLoaded",
function () {

    updateCheckoutTotal();

    setupCoupon();

    setupCheckout();

}

);