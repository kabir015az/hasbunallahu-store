// ==========================================
// Hasbunallahu Store
// products.js
// ==========================================

// Product Database

const products = [

{
    id: 1,
    name: "Luxury Gift Box",
    price: 12000,
    category: "Gift Items",
    image: "images/gift-box.jpg",
    description: "Beautiful luxury gift box suitable for birthdays, weddings and special occasions."
},

{
    id: 2,
    name: "Prayer Rug",
    price: 18000,
    category: "Rugs",
    image: "images/prayer-rug.jpg",
    description: "Soft premium Islamic prayer rug with comfortable fabric."
},

{
    id: 3,
    name: "Coffee Mug",
    price: 4500,
    category: "Mugs",
    image: "images/coffee-mug.jpg",
    description: "High-quality ceramic coffee mug for everyday use."
},

{
    id: 4,
    name: "Stainless Spoon Set",
    price: 7000,
    category: "Kitchen",
    image: "images/spoon-set.jpg",
    description: "Durable stainless steel spoon set for your kitchen."
},

{
    id: 5,
    name: "Baby Clothes Set",
    price: 13500,
    category: "Baby",
    image: "images/baby-clothes.jpg",
    description: "Comfortable baby clothing set made from soft cotton."
},

{
    id: 6,
    name: "School Bag",
    price: 16000,
    category: "School",
    image: "images/school-bag.jpg",
    description: "Strong and spacious backpack for students."
},

{
    id: 7,
    name: "Lunch Box",
    price: 6500,
    category: "School",
    image: "images/lunch-box.jpg",
    description: "Portable lunch box that keeps food fresh."
},

{
    id: 8,
    name: "Toy Teddy Bear",
    price: 8500,
    category: "Toys",
    image: "images/teddy.jpg",
    description: "Soft teddy bear suitable for children and gifts."
},

{
    id: 9,
    name: "Wall Clock",
    price: 9500,
    category: "Home",
    image: "images/wall-clock.jpg",
    description: "Modern decorative wall clock for home and office."
},

{
    id: 10,
    name: "Water Bottle",
    price: 4000,
    category: "School",
    image: "images/water-bottle.jpg",
    description: "Reusable BPA-free water bottle for daily use."
}

];
// ==========================================
// Display Products
// ==========================================

const productsContainer = document.getElementById("products-container");

function displayProducts(productList) {

    if (!productsContainer) return;

    productsContainer.innerHTML = "";

    productList.forEach(product => {

        productsContainer.innerHTML += `

        <div class="product-card">

            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
            </a>

            <div class="product-info">

                <h3>
                    <a href="product.html?id=${product.id}">
                        ${product.name}
                    </a>
                </h3>

                <p class="price">₦${product.price.toLocaleString()}</p>
${createRatingHTML(product.id)}
                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

                <button onclick="addToWishlist(${product.id})">
                    ❤️ Wishlist
                </button>

            </div>

        </div>

        `;

    });

}

// Load products only if products-container exists
if (productsContainer) {
    displayProducts(products);
}


// ==========================================
// Search Products
// ==========================================

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const keyword = searchInput.value.toLowerCase();

        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(keyword)
        );

        displayProducts(filteredProducts);

    });

}


// ==========================================
// Category Filter
// ==========================================

const categoryFilter = document.getElementById("categoryFilter");

if (categoryFilter) {

    categoryFilter.addEventListener("change", function () {

        const category = categoryFilter.value;

        if (category === "all") {
            displayProducts(products);
            return;
        }

        const filteredProducts = products.filter(product =>
            product.category === category
        );

        displayProducts(filteredProducts);

    });

}
// ==========================================
// Add To Cart
// ==========================================

function addToCart(productId) {

    let cart = getCart();

    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);

    updateCartCount();

    alert(product.name + " added to cart!");

}


// ==========================================
// Wishlist (Temporary)
// ==========================================

function addToWishlist(productId) {

    alert("Wishlist feature coming soon!");

}
// ==========================================
// Product Ratings on Product Cards
// ==========================================

function getProductRating(productId) {

    const allReviews =
        JSON.parse(
            localStorage.getItem("productReviews")
        ) || {};

    const reviews =
        allReviews[productId] || [];

    if (reviews.length === 0) {

        return {
            average: 0,
            count: 0
        };

    }

    let total = 0;

    reviews.forEach(review => {

        total += Number(review.rating) || 0;

    });

    return {
        average: total / reviews.length,
        count: reviews.length
    };

}


// ==========================================
// Display Product Ratings
// ==========================================

function createRatingHTML(productId) {

    const rating =
        getProductRating(productId);

    if (rating.count === 0) {

        return `
            <p class="product-rating">
                ☆☆☆☆☆
                <span>(0 reviews)</span>
            </p>
        `;

    }

    const rounded =
        Math.round(rating.average);

    return `
        <p class="product-rating">

            ${"★".repeat(rounded)}
            ${"☆".repeat(5 - rounded)}

            <span>
                (${rating.count}
                ${rating.count === 1 ? "review" : "reviews"})
            </span>

        </p>
    `;

}