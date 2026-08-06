// ==========================================
// Hasbunallahu Store
// wishlist.js - Part 1
// ==========================================

// Get wishlist
function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

// Save wishlist
function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// Update wishlist count
function updateWishlistCount() {

    const wishlist = getWishlist();

    const count = wishlist.length;

    const countElement = document.getElementById("wishlist-count");

    if (countElement) {
        countElement.textContent = count;
    }

}

// Run when page loads
document.addEventListener("DOMContentLoaded", updateWishlistCount);
// ==========================================
// Add To Wishlist
// ==========================================

function addToWishlist(productId) {

    let wishlist = getWishlist();

    const product = products.find(item => item.id === productId);

    if (!product) return;

    const exists = wishlist.find(item => item.id === productId);

    if (exists) {

        alert("This product is already in your wishlist.");
        return;

    }

    wishlist.push(product);

    saveWishlist(wishlist);

    updateWishlistCount();

    alert(product.name + " added to your wishlist ❤️");

}
// ==========================================
// Display Wishlist
// ==========================================

function loadWishlist() {

    const container = document.getElementById("wishlist-container");

    if (!container) return;

    const wishlist = getWishlist();

    container.innerHTML = "";

    if (wishlist.length === 0) {

        container.innerHTML = `
            <p>Your wishlist is empty.</p>
        `;

        return;
    }

    wishlist.forEach(product => {

        container.innerHTML += `

        <div class="product-card">

            <img src="${product.image}" alt="${product.name}">

            <div class="product-info">

                <h3>${product.name}</h3>

                <p>₦${product.price.toLocaleString()}</p>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

                <button onclick="removeFromWishlist(${product.id})">
                    Remove
                </button>

            </div>

        </div>

        `;

    });

}

document.addEventListener("DOMContentLoaded", loadWishlist);
// ==========================================
// Remove From Wishlist
// ==========================================

function removeFromWishlist(productId) {

    let wishlist = getWishlist();

    wishlist = wishlist.filter(item => item.id !== productId);

    saveWishlist(wishlist);

    updateWishlistCount();

    loadWishlist();

}