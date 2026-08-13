// ==========================================
// HASBUNALLAHU STORE
// SUCCESS PAGE
// ==========================================


// ==========================================
// FORMAT MONEY
// ==========================================

function formatSuccessMoney(amount) {

    return "₦" +
        Number(amount || 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ==========================================
// LOAD SUCCESS DATA
// ==========================================

function loadSuccessData() {

    const saved =
        localStorage.getItem(
            "lastOrder"
        );


    if (!saved) {

        document.getElementById(
            "success-order-number"
        ).textContent =
            "Not available";

        document.getElementById(
            "success-name"
        ).textContent =
            "Not available";

        document.getElementById(
            "success-email"
        ).textContent =
            "Not available";

        document.getElementById(
            "success-total"
        ).textContent =
            "₦0.00";

        document.getElementById(
            "success-payment"
        ).textContent =
            "Not available";

        document.getElementById(
            "success-status"
        ).textContent =
            "Not available";

        document.getElementById(
            "success-date"
        ).textContent =
            "Not available";

        return;

    }


    try {

        const order =
            JSON.parse(saved);


        document.getElementById(
            "success-order-number"
        ).textContent =
            order.orderNumber ||
            "Not available";


        document.getElementById(
            "success-name"
        ).textContent =
            order.fullname ||
            "Customer";


        document.getElementById(
            "success-email"
        ).textContent =
            order.email ||
            "Not available";


        document.getElementById(
            "success-total"
        ).textContent =
            formatSuccessMoney(
                order.total
            );


        document.getElementById(
            "success-payment"
        ).textContent =
            order.paymentMethod ||
            "Not available";


        document.getElementById(
            "success-status"
        ).textContent =
            order.paymentStatus ||
            "Pending";


        document.getElementById(
            "success-date"
        ).textContent =
            order.date ||
            "Not available";


    } catch (error) {

        console.error(
            "Success page error:",
            error
        );

    }

}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadSuccessData();

    }
);