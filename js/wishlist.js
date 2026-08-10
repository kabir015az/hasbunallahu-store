// ==========================================
// Hasbunallahu Store
// Wishlist System
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

    const countElement = document.getElementById("wishlist-count");

    if (countElement) {
        countElement.textContent = wishlist.length;
    }
}

// Add product to wishlist
function addToWishlist(productId) {

    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    let wishlist = getWishlist();

    const exists = wishlist.find(item => item.id === productId);

    if (exists) {
        alert(product.name + " is already in your wishlist!");
        return;
    }

    wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
    });

    saveWishlist(wishlist);

    updateWishlistCount();

    alert(product.name + " added to wishlist!");
}

// Remove product from wishlist
function removeFromWishlist(productId) {

    let wishlist = getWishlist();

    wishlist = wishlist.filter(item => item.id !== productId);

    saveWishlist(wishlist);

    updateWishlistCount();

    displayWishlist();
}

// Display wishlist
function displayWishlist() {

    const container =
        document.getElementById("wishlist-container");

    if (!container) {
        return;
    }

    const wishlist = getWishlist();

    if (wishlist.length === 0) {

        container.innerHTML = `
            <p>Your wishlist is empty.</p>
        `;

        return;
    }

    container.innerHTML = "";

    wishlist.forEach(product => {

        container.innerHTML += `

            <div class="product-card">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <h3>${product.name}</h3>

                <p>
                    ₦${product.price.toLocaleString()}
                </p>

                <button onclick="removeFromWishlist(${product.id})">
                    Remove
                </button>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

            </div>

        `;
    });
}

// Load wishlist
document.addEventListener("DOMContentLoaded", function () {

    updateWishlistCount();

    displayWishlist();

});