// ==========================================
// Hasbunallahu Store
// cart.js - Part 1
// ==========================================

// Get table body
const cartItems = document.getElementById("cart-items");

// Load cart
function loadCart() {

    if (!cartItems) return;

    const cart = getCart();

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <tr>
                <td colspan="5">
                    Your shopping cart is empty.
                </td>
            </tr>
        `;

        document.getElementById("total-items").textContent = "0";
        document.getElementById("total-price").textContent = "₦0";

        return;
    }

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {

        const subtotal = item.price * item.quantity;

        totalItems += item.quantity;
        totalPrice += subtotal;

        cartItems.innerHTML += `

        <tr>

            <td>
                <img src="${item.image}" width="70">
                <br>
                ${item.name}
            </td>

            <td>₦${item.price.toLocaleString()}</td>

            <td>

                <input
                    type="number"
                    min="1"
                    value="${item.quantity}"
                    onchange="updateQuantity(${item.id}, this.value)">

            </td>

            <td>

                ₦${subtotal.toLocaleString()}

            </td>

            <td>

                <button
                    class="remove-btn"
                    onclick="removeItem(${item.id})">

                    Remove

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("total-items").textContent = totalItems;

    document.getElementById("total-price").textContent =
        "₦" + totalPrice.toLocaleString();

}

// Load cart when page opens
document.addEventListener("DOMContentLoaded", loadCart);
// ==========================================
// Update Quantity
// ==========================================

function updateQuantity(productId, quantity) {

    quantity = parseInt(quantity);

    let cart = getCart();

    const item = cart.find(product => product.id === productId);

    if (!item) return;

    if (quantity < 1) {
        quantity = 1;
    }

    item.quantity = quantity;

    saveCart(cart);

    updateCartCount();

    loadCart();

}

// ==========================================
// Remove Item
// ==========================================

function removeItem(productId) {

    let cart = getCart();

    cart = cart.filter(product => product.id !== productId);

    saveCart(cart);

    updateCartCount();

    loadCart();

}
// ==========================================
// Clear Cart
// ==========================================

const clearCartBtn = document.getElementById("clear-cart");

if (clearCartBtn) {

    clearCartBtn.addEventListener("click", () => {

        if (confirm("Are you sure you want to clear your cart?")) {

            localStorage.removeItem("cart");

            updateCartCount();

            loadCart();

        }

    });

}

// ==========================================
// Checkout Button
// ==========================================

const checkoutBtn = document.getElementById("checkout-btn");

if (checkoutBtn) {

    checkoutBtn.addEventListener("click", () => {

        const cart = getCart();

        if (cart.length === 0) {

            alert("Your cart is empty.");

            return;

        }

        window.location.href = "checkout.html";

    });

}