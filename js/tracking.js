// ==========================================
// Hasbunallahu Store - Order Tracking
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const trackButton =
        document.getElementById("track-order");

    const orderInput =
        document.getElementById(
            "tracking-order-number"
        );

    const message =
        document.getElementById(
            "tracking-message"
        );

    const result =
        document.getElementById(
            "tracking-result"
        );


    if (!trackButton) return;


    // ==========================================
    // Track Order
    // ==========================================

    trackButton.addEventListener(
        "click",
        function () {

            const orderNumber =
                orderInput.value
                    .trim()
                    .toUpperCase();


            message.textContent = "";

            result.style.display = "none";


            // Check empty input
            if (orderNumber === "") {

                message.textContent =
                    "Please enter your order number.";

                return;

            }


            // Get orders
            const orders =
                JSON.parse(
                    localStorage.getItem("orders")
                ) || [];


            // Find order
            const order =
                orders.find(
                    item =>
                        String(
                            item.orderNumber
                        ).toUpperCase() ===
                        orderNumber
                );


            // Order not found
            if (!order) {

                message.textContent =
                    "❌ Order not found. Please check your order number.";

                return;

            }


            // ==========================================
            // Display Order Information
            // ==========================================

            document.getElementById(
                "track-order-number"
            ).textContent =
                order.orderNumber;


            document.getElementById(
                "track-customer"
            ).textContent =
                order.fullname || "N/A";


            document.getElementById(
                "track-total"
            ).textContent =
                Number(
                    order.total || 0
                ).toLocaleString();


            const status =
                order.status || "Paid";


            document.getElementById(
                "track-status"
            ).textContent =
                status;


            // ==========================================
            // Show Result
            // ==========================================

            result.style.display = "block";


            // ==========================================
            // Update Progress Tracker
            // ==========================================

            updateTrackingProgress(status);


            message.textContent =
                "✅ Order found!";

        }
    );


});


// ==========================================
// Update Tracking Progress
// ==========================================

function updateTrackingProgress(status) {

    const steps = [

        {
            id: "step-paid",
            statuses: [
                "Paid",
                "Processing",
                "Shipped",
                "Out for Delivery",
                "Delivered"
            ]
        },

        {
            id: "step-processing",
            statuses: [
                "Processing",
                "Shipped",
                "Out for Delivery",
                "Delivered"
            ]
        },

        {
            id: "step-shipped",
            statuses: [
                "Shipped",
                "Out for Delivery",
                "Delivered"
            ]
        },

        {
            id: "step-delivery",
            statuses: [
                "Out for Delivery",
                "Delivered"
            ]
        },

        {
            id: "step-delivered",
            statuses: [
                "Delivered"
            ]
        }

    ];


    steps.forEach(step => {

        const element =
            document.getElementById(
                step.id
            );


        if (!element) return;


        element.classList.remove(
            "completed"
        );


        if (
            step.statuses.includes(status)
        ) {

            element.classList.add(
                "completed"
            );

        }

    });

}