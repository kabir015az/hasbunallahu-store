// ==========================================
// Hasbunallahu Store
// products.js
// Supabase Products
// ==========================================

let products = [];


// ==========================================
// Products Container
// ==========================================

const productsContainer =
    document.getElementById("products-container");


// ==========================================
// Get Product Images
// Handles JSON string, array, or old image
// ==========================================

function getProductImages(product) {

    // New admin system stores multiple images
    // inside the "image" column as a JSON string

    if (typeof product.image === "string") {

        try {

            const parsed =
                JSON.parse(product.image);

            if (Array.isArray(parsed)) {

                return parsed.filter(function (url) {

                    return (
                        typeof url === "string" &&
                        url.trim() !== ""
                    );

                });

            }

        }

        catch (error) {

            // Not JSON, continue below

        }


        // Old single image format
        if (product.image.trim() !== "") {

            return [
                product.image
            ];

        }

    }


    // Support array just in case
    if (Array.isArray(product.image)) {

        return product.image;

    }


    // Support future "images" column
    if (Array.isArray(product.images)) {

        return product.images;

    }


    return [];

}



// ==========================================
// Get Main Product Image
// ==========================================

function getProductImage(product) {

    const images =
        getProductImages(product);


    if (
        images.length > 0 &&
        images[0]
    ) {

        return images[0];

    }


    return "images/logo.png";

}



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


            // Get first real uploaded image

            const productImage =
                getProductImage(
                    product
                );


            productsContainer.innerHTML += `

                <div class="product-card">

                    <a
                        href="product.html?id=${product.id}"
                    >

                        <img
                            src="${productImage}"
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

                                ${
                                    product.name ||
                                    "Unnamed Product"
                                }

                            </a>

                        </h3>


                        <p class="product-price">

                            ₦${price.toLocaleString(
                                "en-NG",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}

                        </p>


                        <p class="product-stock">

                            ${
                                Number(product.quantity) > 0
                                    ? "In stock: " +
                                      Number(product.quantity)
                                    : "❌ Out of stock"
                            }

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
// Add To Cart - Stock Protected
// ==========================================

async function addToCart(productId) {

    let cart = getCart();


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


    if (
        typeof supabaseClient !==
        "undefined"
    ) {

        try {

            const {
                data: stockProduct,
                error
            } =
                await supabaseClient
                    .from("products")
                    .select(
                        "id, name, quantity"
                    )
                    .eq(
                        "id",
                        productId
                    )
                    .single();


            if (error) {

                console.error(
                    "Stock check error:",
                    error
                );

                alert(
                    "❌ Unable to check product stock. Please try again."
                );

                return;

            }


            const stock =
                Number(
                    stockProduct.quantity
                ) || 0;


            if (stock <= 0) {

                alert(
                    "❌ " +
                    stockProduct.name +
                    " is currently out of stock."
                );

                return;

            }


            const existingItem =
                cart.find(
                    function (item) {

                        return String(item.id) ===
                            String(productId);

                    }
                );


            const currentQuantity =
                existingItem
                    ? Number(
                        existingItem.quantity
                    ) || 0
                    : 0;


            if (
                currentQuantity >=
                stock
            ) {

                alert(
                    "❌ Only " +
                    stock +
                    " unit" +
                    (stock === 1
                        ? ""
                        : "s") +
                    " of " +
                    stockProduct.name +
                    " available."
                );

                return;

            }


            if (existingItem) {

                existingItem.quantity =
                    currentQuantity + 1;

            }

            else {

                cart.push({

                    id:
                        product.id,

                    name:
                        product.name,

                    price:
                        product.price,

                    image:
                        getProductImage(
                            product
                        ),

                    images:
                        getProductImages(
                            product
                        ),

                    quantity:
                        1

                });

            }


            saveCart(
                cart
            );

            updateCartCount();


            alert(
                product.name +
                " added to cart!"
            );

        }

        catch (error) {

            console.error(
                "Stock verification error:",
                error
            );

            alert(
                "❌ Unable to verify product stock. Please try again."
            );

        }

        return;

    }


    // ==========================================
    // Fallback
    // ==========================================

    const existingItem =
        cart.find(
            function (item) {

                return String(item.id) ===
                    String(productId);

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
                product.price,

            image:
                getProductImage(
                    product
                ),

            images:
                getProductImages(
                    product
                ),

            quantity:
                1

        });

    }


    saveCart(
        cart
    );

    updateCartCount();


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
            getProductImage(
                product
            ),

        images:
            getProductImages(
                product
            ),

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
        " added to wishlist."
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

            average:
                0,

            count:
                0

        };

    }


    let total =
        0;


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
// Start
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

    }
);