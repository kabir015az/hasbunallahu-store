// ==========================================
// Hasbunallahu Store
// Customer Order History
// ==========================================

// Get saved orders
function getOrders() {

    return JSON.parse(localStorage.getItem("orders")) || [];

}


// Save orders
function saveOrders(orders) {

    localStorage.setItem("orders", JSON.stringify(orders));

}


// Display orders
function displayOrders() {

    const container =
        document.getElementById("orders-container");

    if (!container) return;

    const orders = getOrders();

    // No orders
    if (orders.length === 0) {

        container.innerHTML = `
            <div class="empty-orders">
                <h2>No Orders Yet 📦</h2>

                <p>
                    You have not placed any orders yet.
                </p>

                <a href="products.html">
                    Start Shopping
                </a>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    // Display newest order first
    orders.slice().reverse().forEach(order => {

        let itemsHTML = "";


        order.items.forEach(item => {

            itemsHTML += `
                <div class="order-item">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                    <div>

                        <h3>${item.name}</h3>

                        <p>
                            Quantity:
                            ${item.quantity}
                        </p>

                        <p>
                            ₦${(
                                item.price * item.quantity
                            ).toLocaleString()}
                        </p>

                    </div>

                </div>
            `;

        });


        container.innerHTML += `

            <div class="order-card">

                <div class="order-header">

                    <h2>
                        Order #${order.orderNumber}
                    </h2>

                    <span>
                        ${order.status || "Pending"}
                    </span>

                </div>


                <p>
                    <strong>Date:</strong>
                    ${order.date}
                </p>


                <p>
                    <strong>Total:</strong>
                    ₦${Number(order.total).toLocaleString()}
                </p>


                <div class="order-items">

                    ${itemsHTML}

                </div>

            </div>

        `;

    });

}


// Load orders
document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayOrders();

    }
);