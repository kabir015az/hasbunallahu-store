// ==========================================
// Hasbunallahu Store
// Product Details
// ==========================================

// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

// Find the product
const product = products.find(item => item.id === productId);

if (product) {

    document.getElementById("product-image").src = product.image;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-price").textContent =
        "₦" + product.price.toLocaleString();
    document.getElementById("product-description").textContent =
        product.description;

}
// ==========================================
// Add Product To Cart
// ==========================================

const addToCartBtn = document.getElementById("add-to-cart-btn");

if (addToCartBtn && product) {

    addToCartBtn.addEventListener("click", function () {

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

}