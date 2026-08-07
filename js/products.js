// ==========================================
// Hasbunallahu Store
// products.js - Part 1
// ==========================================

// Product Database

const products = [

{
    id:1,
    name:"Luxury Gift Box",
    price:12000,
    category:"Gift Items",
    image:"images/gift-box.jpg"
},

{
    id:2,
    name:"Prayer Rug",
    price:18000,
    category:"Rugs",
    image:"images/prayer-rug.jpg"
},

{
    id:3,
    name:"Coffee Mug",
    price:4500,
    category:"Mugs",
    image:"images/coffee-mug.jpg"
},

{
    id:4,
    name:"Stainless Spoon Set",
    price:7000,
    category:"Kitchen",
    image:"images/spoon-set.jpg"
},

{
    id:5,
    name:"Baby Clothes Set",
    price:13500,
    category:"Baby",
    image:"images/baby-clothes.jpg"
},

{
    id:6,
    name:"School Bag",
    price:16000,
    category:"School",
    image:"images/school-bag.jpg"
},

{
    id:7,
    name:"Lunch Box",
    price:6500,
    category:"School",
    image:"images/lunch-box.jpg"
},

{
    id:8,
    name:"Toy Teddy Bear",
    price:8500,
    category:"Toys",
    image:"images/teddy.jpg"
},

{
    id:9,
    name:"Wall Clock",
    price:9500,
    category:"Home",
    image:"images/wall-clock.jpg"
},

{
    id:10,
    name:"Water Bottle",
    price:4000,
    category:"School",
    image:"images/water-bottle.jpg"
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

            <img src="${product.image}" alt="${product.name}">

            <div class="product-info">

                <h3>${product.name}</h3>

                <p>₦${product.price.toLocaleString()}</p>

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

// Load products automatically
displayProducts(products);
// ==========================================
// Search Products
// ==========================================

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

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

    categoryFilter.addEventListener("change", () => {

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