// ==========================================
// Hasbunallahu Store - Online Order Tracking
// Supabase
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
        async function () {

            const orderNumber =
                orderInput.value
                    .trim()
                    .toUpperCase();


            message.textContent = "";

            result.style.display = "none";


            // ==========================================
            // Empty Input
            // ==========================================

            if (orderNumber === "") {

                message.textContent =
                    "Please enter your order number.";

                return;

            }


            // ==========================================
            // Check Supabase
            // ==========================================

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                message.textContent =
                    "❌ Unable to connect to the tracking system.";

                console.error(
                    "supabaseClient is not defined."
                );

                return;

            }


            trackButton.disabled = true;

            trackButton.textContent =
                "Checking...";


            try {

                // ==========================================
                // Find Order In Supabase
                // ==========================================

                const { data, error } =
                    await supabaseClient
                        .from("orders")
                        .select("*")
                        .eq(
                            "order_number",
                            orderNumber
                        )
                        .maybeSingle();


                // ==========================================
                // Supabase Error
                // ==========================================

                if (error) {

                    console.error(
                        "Tracking error:",
                        error
                    );

                    message.textContent =
                        "❌ Unable to check your order. Please try again.";

                    return;

                }


                // ==========================================
                // Order Not Found
                // ==========================================

                if (!data) {

                    message.textContent =
                        "❌ Order not found. Please check your order number.";

                    return;

                }


                // ==========================================
                // Display Order
                // ==========================================

                document.getElementById(
                    "track-order-number"
                ).textContent =
                    data.order_number || "N/A";


                document.getElementById(
                    "track-customer"
                ).textContent =
                    data.customer_name || "N/A";


                document.getElementById(
                    "track-total"
                ).textContent =
                    Number(
                        data.total || 0
                    ).toLocaleString();


                const status =
                    data.status || "Paid";


                document.getElementById(
                    "track-status"
                ).textContent =
                    status;


                // ==========================================
                // Show Result
                // ==========================================

                result.style.display =
                    "block";


                // ==========================================
                // Update Progress
                // ==========================================

                updateTrackingProgress(
                    status
                );


                message.textContent =
                    "✅ Order found!";


            }

            catch (error) {

                console.error(
                    "Tracking error:",
                    error
                );

                message.textContent =
                    "❌ Something went wrong. Please try again.";

            }

            finally {

                trackButton.disabled =
                    false;

                trackButton.textContent =
                    "Track Order";

            }

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


    steps.forEach(function (step) {

        const element =
            document.getElementById(
                step.id
            );


        if (!element) return;


        element.classList.remove(
            "completed"
        );


        if (
            step.statuses.includes(
                status
            )
        ) {

            element.classList.add(
                "completed"
            );

        }

    });

}