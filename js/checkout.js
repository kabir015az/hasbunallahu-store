// ==========================================
// Hasbunallahu Store - Checkout & Paystack v2
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    const totalElement =
        document.getElementById("checkout-total");

    if (totalElement) {
        totalElement.textContent =
            "₦" + total.toLocaleString();
    }


    // ==========================================
    // Place Order Button
    // ==========================================

    const placeOrderButton =
        document.getElementById("place-order");

    if (!placeOrderButton) {
        return;
    }


    placeOrderButton.addEventListener("click", function (e) {

        e.preventDefault();


        // Customer details
        const fullname =
            document.getElementById("fullname").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const address =
            document.getElementById("address").value.trim();

        const state =
            document.getElementById("state").value.trim();

        const city =
            document.getElementById("city").value.trim();


        // Get cart
        cart = JSON.parse(localStorage.getItem("cart")) || [];


        // Calculate total
        total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
        });


        // Validate details
        if (
            fullname === "" ||
            email === "" ||
            phone === "" ||
            address === "" ||
            state === "" ||
            city === ""
        ) {
            alert("Please fill all customer details.");
            return;
        }


        // Check cart
        if (cart.length === 0 || total === 0) {
            alert("Your cart is empty.");
            return;
        }


        // Check Paystack
        if (typeof PaystackPop === "undefined") {

            alert(
                "Paystack is still loading. Please refresh the page and try again."
            );

            return;
        }


        // ==========================================
        // Paystack v2
        // ==========================================

        const popup = new PaystackPop();

        popup.newTransaction({

            key:
                "pk_test_17d80f52a39fb05435d5898b29744b5b034d85a9",

            email:
                email,

            amount:
                total * 100,

            currency:
                "NGN",

            metadata: {

                custom_fields: [

                    {
                        display_name: "Customer Name",
                        variable_name: "name",
                        value: fullname
                    },

                    {
                        display_name: "Phone Number",
                        variable_name: "phone",
                        value: phone
                    },

                    {
                        display_name: "Address",
                        variable_name: "address",
                        value: address
                    },

                    {
                        display_name: "State",
                        variable_name: "state",
                        value: state
                    },

                    {
                        display_name: "City",
                        variable_name: "city",
                        value: city
                    }

                ]

            },


            // ==========================================
            // Successful Payment
            // ==========================================

            onSuccess: function (transaction) {

                let orders =
                    JSON.parse(
                        localStorage.getItem("orders")
                    ) || [];


                const orderNumber =
                    "HSB-" + Date.now();


                const orderDate =
                    new Date().toLocaleString();


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

                    reference:
                        transaction.reference,

                    date:
                        orderDate,

                    status:
                        "Paid",

                    items:
                        cart.map(item => ({

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

                        }))

                };


                // Save order
                orders.push(newOrder);

                localStorage.setItem(
                    "orders",
                    JSON.stringify(orders)
                );


                // Clear cart
                localStorage.removeItem("cart");


                alert(
                    "Payment successful!\n\n" +
                    "Order: " +
                    orderNumber +
                    "\nReference: " +
                    transaction.reference
                );


                // Go to success page
                window.location.href =
                    "success.html";

            },


            // ==========================================
            // Payment Cancelled
            // ==========================================

            onCancel: function () {

                alert("Payment cancelled.");

            }

        });

    });

});