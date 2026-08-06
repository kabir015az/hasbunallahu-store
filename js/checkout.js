// Hasbunallahu Store - Checkout & Paystack

document.getElementById("place-order").addEventListener("click", function(e){

    e.preventDefault();

    let fullname = document.getElementById("fullname").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;

    // Get cart total
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
    });


    if(fullname === "" || email === "" || phone === ""){
        alert("Please fill all customer details");
        return;
    }


    if(total === 0){
        alert("Your cart is empty");
        return;
    }


    let handler = PaystackPop.setup({

        key: "pk_test_1234567890abcdef,

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

        callback: function(response){

            alert("Payment successful! Reference: " + response.reference);

            localStorage.removeItem("cart");

            window.location.href = "success.html";
        },


        onClose: function(){
            alert("Payment cancelled");
        }

    });


    handler.openIframe();

});