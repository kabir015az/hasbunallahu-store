// ==========================================
// Hasbunallahu Store
// main.js
// ==========================================

// Get cart from LocalStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Save cart to LocalStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Get total number of items in the cart
function getCartCount() {
    const cart = getCart();

    let total = 0;

    cart.forEach(item => {
        total += item.quantity;
    });

    return total;
}

// Update the cart count in the navigation
function updateCartCount() {

    const countElement = document.getElementById("cart-count");

    if (countElement) {
        countElement.textContent = getCartCount();
    }

}

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {

    updateCartCount();

});
// ==========================================
// Mobile Menu
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle =
        document.getElementById("menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            navLinks.classList.toggle("active");

        });

    }

});