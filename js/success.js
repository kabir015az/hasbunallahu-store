// ==========================================
// Hasbunallahu Store - Success & Email
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Initialize EmailJS
    emailjs.init({
        publicKey: "zDU17Xd3CuZ3fJztk"
    });


    // Get saved orders
    const orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    // Check if there is an order
    if (orders.length === 0) {
        return;
    }


    // Get latest order
    const latestOrder =
        orders[orders.length - 1];


    // ==========================================
    // Display Order Number
    // ==========================================

    const orderNumberElement =
        document.getElementById(
            "success-order-number"
        );

    if (orderNumberElement) {

        orderNumberElement.textContent =
            latestOrder.orderNumber || "-";

    }


    // ==========================================
    // Display Payment Reference
    // ==========================================

    const referenceElement =
        document.getElementById(
            "success-reference"
        );

    if (referenceElement) {

        referenceElement.textContent =
            latestOrder.reference || "-";

    }


    // ==========================================
    // Display Total
    // ==========================================

    const totalElement =
        document.getElementById(
            "success-total"
        );

    if (totalElement) {

        totalElement.textContent =
            "₦" +
            Number(
                latestOrder.total || 0
            ).toLocaleString();

    }


    // ==========================================
    // Send Email Confirmation
    // ==========================================

    const templateParams = {

        fullname:
            latestOrder.fullname || "",

        email:
            latestOrder.email || "",

        phone:
            latestOrder.phone || "",

        address:
            latestOrder.address || "",

        state:
            latestOrder.state || "",

        city:
            latestOrder.city || "",

        orderNumber:
            latestOrder.orderNumber || "",

        total:
            Number(
                latestOrder.total || 0
            ).toLocaleString(),

        reference:
            latestOrder.reference || "",

        status:
            latestOrder.status || "Paid"

    };


    emailjs.send(
    "service_x0frozt",
    "template_3wqeitu",
    templateParams
)

    .then(function () {

        console.log(
            "Order confirmation email sent successfully."
        );

    })

    .catch(function (error) {

        console.error(
            "Email could not be sent:",
            error
        );

    });

});