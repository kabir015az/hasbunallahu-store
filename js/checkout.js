// ==========================================
// Hasbunallahu Store - Checkout & Paystack
// ==========================================

// Display Order Summary
document.addEventListener("DOMContentLoaded", function () {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    const totalElement = document.getElementById("checkout-total");

    if (totalElement) {
        totalElement.textContent = "₦" + total.toLocaleString();
    }

});


// Place Order
document.getElementById("place-order").addEventListener("click", function (e) {

    e.preventDefault();

    let fullname = document.getElementById("fullname").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    if (fullname === "" || email === "" || phone === "") {
        alert("Please fill all customer details.");
        return;
    }

    if (total === 0) {
        alert("Your cart is empty.");
        return;
    }

    let handler = PaystackPop.setup({

        key: "pk_test_17d80f52a39fb05435d5898b29744b5b034d85a9",

        email: email,

        amount: total * 100,

        currency: "NGN",

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
                }
            ]
        },

        callback: function (response) {

            let orders = JSON.parse(localStorage.getItem("orders")) || [];

            orders.push({
                fullname: fullname,
                email: email,
                phone: phone,
                total: total,
                reference: response.reference
            });

            localStorage.setItem("orders", JSON.stringify(orders));

            localStorage.removeItem("cart");

            alert("Payment successful!\nReference: " + response.reference);

            window.location.href = "success.html";

        },

        onClose: function () {

            alert("Payment cancelled.");

        }

    });

    handler.openIframe();

});