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


        if (!button || !input) {
            return;
        }


        button.addEventListener(
            "click",
            trackOrder
        );


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


        async function trackOrder() {

            const trackingNumber =
                input.value
                    .trim()
                    .toUpperCase();


            result.style.display =
                "none";


            if (!trackingNumber) {

                message.textContent =
                    "Please enter your tracking number.";

                return;

            }


            button.disabled =
                true;

            button.textContent =
                "Searching...";

            message.textContent =
                "";


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("orders")
                        .select(`
                            order_number,
                            customer_name,
                            total,
                            status,
                            tracking_number,
                            delivery_note,
                            created_at
                        `)
                        .eq(
                            "tracking_number",
                            trackingNumber
                        )
                        .maybeSingle();


                if (error) {

                    console.error(
                        "Tracking error:",
                        error
                    );

                    throw error;

                }


                if (!data) {

                    message.textContent =
                        "❌ Tracking number not found. Please check the number and try again.";

                    return;

                }


                // ==========================================
                // DISPLAY RESULT
                // ==========================================

                document.getElementById(
                    "result-order-number"
                ).textContent =
                    data.order_number || "-";


                document.getElementById(
                    "result-tracking-number"
                ).textContent =
                    data.tracking_number || "-";


                document.getElementById(
                    "result-customer"
                ).textContent =
                    data.customer_name || "-";


                document.getElementById(
                    "result-status"
                ).textContent =
                    data.status || "Order received";


                document.getElementById(
                    "result-delivery-note"
                ).textContent =
                    data.delivery_note ||
                    "Preparing for delivery";


                document.getElementById(
                    "result-total"
                ).textContent =
                    "₦" +
                    Number(
                        data.total || 0
                    ).toLocaleString(
                        "en-NG",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );


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


                result.style.display =
                    "block";


                message.textContent =
                    "✅ Order found successfully.";

            }

            catch (error) {

                console.error(
                    "Tracking error:",
                    error
                );

                message.textContent =
                    "❌ Unable to check your order right now. Please try again.";

            }

            finally {

                button.disabled =
                    false;

                button.textContent =
                    "Track Order";

            }

        }

    }
);