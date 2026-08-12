// ==========================================
// Hasbunallahu Store
// products.js
// Supabase Product System
// ==========================================

let products = [];


// ==========================================
// Load Products From Supabase
// ==========================================

async function loadProducts() {

    const productsContainer =
        document.getElementById("products-container");

    const featuredContainer =
        document.getElementById("featured-products");


    if (
        !productsContainer &&
        !featuredContainer
    ) {
        return;
    }


    if (productsContainer) {

        productsContainer.innerHTML = `
            <p style="text-align:center;">
                Loading products...
            </p>
        `;

    }


    if (featuredContainer) {

        featuredContainer.innerHTML = `
            <p style="text-align:center;">
                Loading products...
            </p>
        `;

    }


    if (
        typeof supabaseClient === "undefined"
    ) {

        console.error(
            "Supabase client is not available."
        );

        showProductError(
            "Supabase is not connected."
        );

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
                .order("id", {
                    ascending: true
                });


        if (error) {

            console.error(
                "Supabase products error:",
                error
            );

            showProductError(
                error.message
            );

            return;

        }


        products = data || [];


        console.log(
            "Products loaded:",
            products
        );


        // Products page
        if (productsContainer) {

            displayProducts(
                products
            );

        }


        // Homepage
        if (featuredContainer) {

            displayFeaturedProducts(
                products
            );

        }

    }

    catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        showProductError(
            "Unable to load products."
        );

    }

}


// ==========================================
// Product Error
// ==========================================

function showProductError(message) {

    const productsContainer =
        document.getElementById(
            "products-container"
        );

    const featuredContainer =
        document.getElementById(
            "featured-products"
        );


    if (productsContainer) {

        productsContainer.innerHTML = `
            <p style="text-align:center;">
                ❌ Failed to load products.
                <br><br>
                ${message}
            </p>
        `;

    }


    if (featuredContainer) {

        featuredContainer.innerHTML = `
            <p style="text-align:center;">
                ❌ Failed to load products.
                <br><br>
                ${message}
            </p>
        `;

    }

}


// ==========================================
// Display Products Page
// ==========================================

function displayProducts(
    productList
) {

    const container =
        document.getElementById(
            "products-container"
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !productList ||
        productList.length === 0
    ) {

        container.innerHTML = `
            <p style="text-align:center;">
                No products available.
            </p>
        `;

        return;

    }


    productList.forEach(
        function (product) {

            container.innerHTML +=
                createProductCard(
                    product
                );

        }
    );

}


// ==========================================
// Display Featured Products
// ==========================================

function displayFeaturedProducts(
    productList
) {

    const container =
        document.getElementById(
            "featured-products"
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !productList ||
        productList.length === 0
    ) {

        container.innerHTML = `
            <p style="text-align:center;">
                No products available.
            </p>
        `;

        return;

    }


    // Show first 6 products on homepage
    const featured =
        productList.slice(
            0,
            6
        );


    featured.forEach(
        function (product) {

            container.innerHTML +=
                createProductCard(
                    product
                );

        }
    );

}


// ==========================================
// Create Product Card
// ==========================================

function createProductCard(
    product
) {

    const image =
        product.image || "";


    return `

        <div class="product-card">

            <a href="product.html?id=${product.id}">

                <img
                    src="${image}"
                    alt="${product.name || "Product"}"
                    onerror="
                        this.onerror=null;
                        this.src='images/logo.png';
                    "
                >

            </a>


            <div class="product-info">

                <h3>

                    <a
                        href="product.html?id=${product.id}"
                    >
                        ${product.name || ""}
                    </a>

                </h3>


                <p class="price">

                    ₦${Number(
                        product.price || 0
                    ).toLocaleString()}

                </p>


                ${createRatingHTML(
                    product.id
                )}


                <button
                    type="button"
                    onclick="
                        addToCart(
                            ${product.id}
                        )
                    "
                >
                    Add to Cart
                </button>


                <button
                    type="button"
                    onclick="
                        addToWishlist(
                            ${product.id}
                        )
                    "
                >
                    ❤️ Wishlist
                </button>

            </div>

        </div>

    `;

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

                return Number(item.id) ===
                    Number(productId);

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

                return Number(item.id) ===
                    Number(productId);

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
        JSON.stringify(cart)
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

                return Number(item.id) ===
                    Number(productId);

            }
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    alert(
        product.name +
        " added to wishlist!"
    );

}


// ==========================================
// Search
// ==========================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
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
// Product Rating
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
// Rating HTML
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

            ${"★".repeat(
                rounded
            )}

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
// PAGE READY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

    }
);