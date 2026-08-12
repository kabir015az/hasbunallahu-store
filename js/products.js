// ==========================================
// Hasbunallahu Store
// products.js
// Supabase Products
// ==========================================


// ==========================================
// Product List
// ==========================================

let products = [];


// ==========================================
// Products Container
// ==========================================

const productsContainer =
    document.getElementById(
        "products-container"
    );


// ==========================================
// Load Products From Supabase
// ==========================================

async function loadProducts() {

    if (!productsContainer) return;


    productsContainer.innerHTML = `
        <p style="text-align:center;">
            Loading products...
        </p>
    `;


    // Check Supabase

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "Supabase client is not available."
        );

        productsContainer.innerHTML = `
            <p style="text-align:center;">
                ❌ Supabase is not connected.
            </p>
        `;

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Supabase products error:",
                error
            );


            productsContainer.innerHTML = `
                <p style="text-align:center;">
                    ❌ Failed to load products.
                    <br><br>
                    ${error.message}
                </p>
            `;

            return;

        }


        products =
            data || [];


        console.log(
            "Products loaded:",
            products
        );


        displayProducts(
            products
        );


    }

    catch (error) {

        console.error(
            "Products loading error:",
            error
        );


        productsContainer.innerHTML = `
            <p style="text-align:center;">
                ❌ Failed to load products.
            </p>
        `;

    }

}



// ==========================================
// Display Products
// ==========================================

function displayProducts(
    productList
) {

    if (!productsContainer) return;


    productsContainer.innerHTML = "";


    if (
        !productList ||
        productList.length === 0
    ) {

        productsContainer.innerHTML = `
            <p style="text-align:center;">
                No products available.
            </p>
        `;

        return;

    }


    productList.forEach(
        function (product) {

            const price =
                Number(
                    product.price
                ) || 0;


            productsContainer.innerHTML += `

                <div class="product-card">

                    <a
                        href="product.html?id=${product.id}"
                    >

                        <img
                            src="${product.image || "images/logo.png"}"
                            alt="${product.name || "Product"}"
                            onerror="
                                this.src='images/logo.png'
                            "
                        >

                    </a>


                    <div class="product-info">


                        <h3>

                            <a
                                href="product.html?id=${product.id}"
                            >
                                ${product.name || "Unnamed Product"}
                            </a>

                        </h3>


                        <p class="price">

                            ₦${price.toLocaleString()}

                        </p>


                        ${createRatingHTML(product.id)}


                        <button
                            type="button"
                            onclick="
                                addToCart(${product.id})
                            "
                        >
                            Add to Cart
                        </button>


                        <button
                            type="button"
                            onclick="
                                addToWishlist(${product.id})
                            "
                        >
                            ❤️ Wishlist
                        </button>


                    </div>

                </div>

            `;

        }
    );

}



// ==========================================
// Search Products
// ==========================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        function () {

            const keyword =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filteredProducts =
                products.filter(
                    function (product) {

                        return (
                            product.name &&
                            product.name
                                .toLowerCase()
                                .includes(
                                    keyword
                                )
                        );

                    }
                );


            displayProducts(
                filteredProducts
            );

        }
    );

}



// ==========================================
// Category Filter
// ==========================================

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        function () {

            const category =
                categoryFilter.value;


            if (
                category === "all"
            ) {

                displayProducts(
                    products
                );

                return;

            }


            const filteredProducts =
                products.filter(
                    function (product) {

                        return (
                            product.category ===
                            category
                        );

                    }
                );


            displayProducts(
                filteredProducts
            );

        }
    );

}



// ==========================================
// Add To Cart
// ==========================================

function addToCart(
    productId
) {

    const product =
        products.find(
            function (item) {

                return String(item.id) ===
                    String(productId);

            }
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    let cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];


    const existingItem =
        cart.find(
            function (item) {

                return String(item.id) ===
                    String(product.id);

            }
        );


    if (existingItem) {

        existingItem.quantity++;

    }

    else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            price:
                Number(
                    product.price
                ) || 0,

            image:
                product.image,

            quantity:
                1

        });

    }


    localStorage.setItem(
        "cart",
        JSON.stringify(
            cart
        )
    );


    if (
        typeof updateCartCount ===
        "function"
    ) {

        updateCartCount();

    }


    alert(
        product.name +
        " added to cart!"
    );

}



// ==========================================
// Wishlist
// ==========================================

function addToWishlist(
    productId
) {

    const product =
        products.find(
            function (item) {

                return String(item.id) ===
                    String(productId);

            }
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    let wishlist =
        JSON.parse(
            localStorage.getItem(
                "wishlist"
            )
        ) || [];


    const exists =
        wishlist.some(
            function (item) {

                return String(item.id) ===
                    String(product.id);

            }
        );


    if (exists) {

        alert(
            product.name +
            " is already in your wishlist."
        );

        return;

    }


    wishlist.push({

        id:
            product.id,

        name:
            product.name,

        price:
            Number(
                product.price
            ) || 0,

        image:
            product.image,

        category:
            product.category

    });


    localStorage.setItem(
        "wishlist",
        JSON.stringify(
            wishlist
        )
    );


    if (
        typeof updateWishlistCount ===
        "function"
    ) {

        updateWishlistCount();

    }


    alert(
        product.name +
        " added to wishlist!"
    );

}



// ==========================================
// Product Ratings
// ==========================================

function getProductRating(
    productId
) {

    const allReviews =
        JSON.parse(
            localStorage.getItem(
                "productReviews"
            )
        ) || {};


    const reviews =
        allReviews[productId] || [];


    if (
        reviews.length === 0
    ) {

        return {

            average: 0,

            count: 0

        };

    }


    let total = 0;


    reviews.forEach(
        function (review) {

            total +=
                Number(
                    review.rating
                ) || 0;

        }
    );


    return {

        average:
            total /
            reviews.length,

        count:
            reviews.length

    };

}



// ==========================================
// Display Product Ratings
// ==========================================

function createRatingHTML(
    productId
) {

    const rating =
        getProductRating(
            productId
        );


    if (
        rating.count === 0
    ) {

        return `

            <p class="product-rating">

                ☆☆☆☆☆

                <span>
                    (0 reviews)
                </span>

            </p>

        `;

    }


    const rounded =
        Math.round(
            rating.average
        );


    return `

        <p class="product-rating">

            ${"★".repeat(rounded)}

            ${"☆".repeat(
                5 - rounded
            )}

            <span>

                (${rating.count}

                ${
                    rating.count === 1
                        ? "review"
                        : "reviews"
                })

            </span>

        </p>

    `;

}



// ==========================================
// Start
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

    }
);