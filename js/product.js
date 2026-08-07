// ==========================================
// Hasbunallahu Store
// product.js
// ==========================================

// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

alert("Product ID = " + productId);

// Find the selected product
const product = products.find(item => item.id === productId);

// If product doesn't exist
if (!product) {

    document.getElementById("product-name").textContent = "Product Not Found";

} else {

    // Display product details
    document.getElementById("product-image").src = product.image;

    document.getElementById("product-image").alt = product.name;

    document.getElementById("product-name").textContent = product.name;

    document.getElementById("product-price").textContent =
        "₦" + product.price.toLocaleString();

    document.getElementById("product-category").textContent =
        product.category;

    document.getElementById("product-description").textContent =
        product.description;

}
// ==========================================
// Add Selected Product To Cart
// ==========================================

const addToCartBtn = document.getElementById("add-to-cart-btn");

if (addToCartBtn) {

    addToCartBtn.addEventListener("click", function () {

        if (!product) {
            alert("Product not found!");
            return;
        }

        let quantity = parseInt(document.getElementById("quantity").value) || 1;

        let cart = getCart();

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {

            existingItem.quantity += quantity;

        } else {

            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });

        }

        saveCart(cart);

        updateCartCount();

        alert(product.name + " added to cart!");

    });

}0