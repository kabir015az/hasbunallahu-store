// ==========================================
// HASBUNALLAHU STORE
// ORDER TRACKING
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const button =
            document.getElementById(
                "track-order"
            );

        const input =
            document.getElementById(
                "tracking-number"
            );

        const message =
            document.getElementById(
                "tracking-message"
            );

        const result =
            document.getElementById(
                "tracking-result"
            );


        if (
            !button ||
            !input ||
            !message ||
            !result
        ) {

            console.error(
                "Tracking elements not found."
            );

            return;

        }


        // ==========================================
        // TRACK BUTTON
        // ==========================================

        button.addEventListener(
            "click",
            trackOrder
        );


        // ==========================================
        // ENTER KEY
        // ==========================================

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    trackOrder();

                }

            }
        );


        // ==========================================
        // TRACK ORDER
        // ==========================================

        async function trackOrder() {

            const trackingNumber =
                input.value
                    .trim()
                    .toUpperCase();


            result.style.display =
                "none";


            if (!trackingNumber) {

                message.textContent =
                    "❌ Please enter your tracking number.";

                return;

            }


            button.disabled =
                true;

            button.textContent =
                "Searching...";

            message.textContent =
                "Searching for your order...";


            try {

                // ==========================================
                // CHECK SUPABASE
                // ==========================================

                if (
                    typeof supabaseClient ===
                    "undefined"
                ) {

                    throw new Error(
                        "Supabase client is not loaded."
                    );

                }


                // ==========================================
                // FIND ORDER
                // ==========================================

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("orders")
                        .select(
                            "order_number,customer_name,total,status,tracking_number,delivery_note,created_at"
                        )
                        .eq(
                            "tracking_number",
                            trackingNumber
                        )
                        .maybeSingle();


                // ==========================================
                // SUPABASE ERROR
                // ==========================================

                if (error) {

                    console.error(
                        "SUPABASE TRACKING ERROR:",
                        error
                    );

                    throw new Error(
                        error.message ||
                        "Supabase could not find the order."
                    );

                }


                // ==========================================
                // ORDER NOT FOUND
                // ==========================================

                if (!data) {

                    message.innerHTML =
                        "❌ <strong>Tracking number not found.</strong>" +
                        "<br><br>" +
                        "Please check that you entered the tracking number correctly.";

                    return;

                }


                // ==========================================
                // DISPLAY ORDER NUMBER
                // ==========================================

                document.getElementById(
                    "result-order-number"
                ).textContent =
                    data.order_number ||
                    "-";


                // ==========================================
                // DISPLAY TRACKING NUMBER
                // ==========================================

                document.getElementById(
                    "result-tracking-number"
                ).textContent =
                    data.tracking_number ||
                    "-";


                // ==========================================
                // DISPLAY CUSTOMER
                // ==========================================

                document.getElementById(
                    "result-customer"
                ).textContent =
                    data.customer_name ||
                    "-";


                // ==========================================
                // DISPLAY STATUS
                // ==========================================

                document.getElementById(
                    "result-status"
                ).textContent =
                    data.status ||
                    "Order received";


                // ==========================================
                // DELIVERY NOTE
                // ==========================================

                document.getElementById(
                    "result-delivery-note"
                ).textContent =
                    data.delivery_note ||
                    "Preparing for delivery";


                // ==========================================
                // TOTAL
                // ==========================================

                const total =
                    Number(data.total) || 0;


                document.getElementById(
                    "result-total"
                ).textContent =
                    "₦" +
                    total.toLocaleString(
                        "en-NG",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );


                // ==========================================
                // DATE
                // ==========================================

                document.getElementById(
                    "result-date"
                ).textContent =
                    data.created_at
                        ? new Date(
                            data.created_at
                        ).toLocaleString(
                            "en-NG"
                        )
                        : "-";


                // ==========================================
                // SHOW RESULT
                // ==========================================

                result.style.display =
                    "block";


                message.textContent =
                    "✅ Order found successfully.";


            }

            catch (error) {

                console.error(
                    "TRACKING ERROR:",
                    error
                );


                message.innerHTML =
                    "❌ <strong>Unable to track order.</strong>" +
                    "<br><br>" +
                    escapeHtml(
                        error.message ||
                        "Please try again."
                    );

            }

            finally {

                button.disabled =
                    false;

                button.textContent =
                    "Track Order";

            }

        }


        // ==========================================
        // ESCAPE HTML
        // ==========================================

        function escapeHtml(value) {

            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        console.log(
            "Hasbunallahu Store tracking loaded successfully."
        );

    }
);