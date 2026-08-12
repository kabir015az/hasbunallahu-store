// ==========================================
// Hasbunallahu Store
// products.js
// Supabase Product System
// ==========================================

let products = [];

let filteredProducts = [];

// ==========================================
// SUPABASE CHECK
// ==========================================

if (typeof supabaseClient === "undefined") {

console.error("Supabase client is not available.");

}

// ==========================================
// PRODUCT CONTAINER
// ==========================================

const productsContainer =
document.getElementById(
"products-container"
);

// ==========================================
// LOAD PRODUCTS FROM SUPABASE
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

    productsContainer.innerHTML = `
        <p style="text-align:center; color:red;">
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
            "Supabase product error:",
            error
        );


        productsContainer.innerHTML = `
            <p style="text-align:center; color:red;">
                ❌ Failed to load products.
                <br><br>
                ${error.message}
            </p>
        `;

        return;

    }


    products =
        data || [];


    filteredProducts =
        [...products];


    if (
        products.length === 0
    ) {

        productsContainer.innerHTML = `
            <p style="text-align:center;">
                No products available.
            </p>
        `;

        return;

    }


    displayProducts(
        products
    );

}

catch (error) {

    console.error(
        "Product loading error:",
        error
    );


    productsContainer.innerHTML = `
        <p style="text-align:center; color:red;">
            ❌ Unable to load products.
            <br><br>
            ${error.message}
        </p>
    `;

}

}

// ==========================================
// DISPLAY PRODUCTS
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
            No products found.
        </p>
    `;

    return;

}


productList.forEach(
    function (product) {


        const quantity =
            Number(
                product.quantity
            ) || 0;


        const isOutOfStock =
            quantity <= 0;


        const ratingHTML =
            createRatingHTML(
                product.id
            );


        productsContainer.innerHTML += `

            <div class="product-card">


                <a
                    href="product.html?id=${product.id}"
                >

                    <img
                        src="${product.image || ""}"
                        alt="${product.name || "Product"}"
                        onerror="
                            this.style.display='none'
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


                    ${ratingHTML}


                    ${
                        isOutOfStock

                        ?

                        `
                        <p
                            style="
                                color:red;
                                font-weight:bold;
                            "
                        >
                            ❌ Out of Stock
                        </p>

                        <button
                            type="button"
                            disabled
                        >
                            Out of Stock
                        </button>
                        `

                        :

                        `
                        <p>
                            📦 ${quantity} available
                        </p>

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
                        `
                    }


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
);

}

// ==========================================
// SEARCH PRODUCTS
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


        const filtered =
            products.filter(
                function (product) {

                    return (

                        product.name
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                        ||

                        (
                            product.category ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                    );

                }
            );


        filteredProducts =
            filtered;


        displayProducts(
            filteredProducts
        );

    }
);

}

// ==========================================
// CATEGORY FILTER
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


        const keyword =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        let result =
            [...products];


        if (
            category !== "all"
        ) {

            result =
                result.filter(
                    function (product) {

                        return (
                            product.category ===
                            category
                        );

                    }
                );

        }


        if (keyword !== "") {

            result =
                result.filter(
                    function (product) {

                        return (

                            product.name
                                .toLowerCase()
                                .includes(
                                    keyword
                                )

                            ||

                            (
                                product.category ||
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    keyword
                                )

                        );

                    }
                );

        }


        filteredProducts =
            result;


        displayProducts(
            filteredProducts
        );

    }
);

}

// ==========================================
// ADD TO CART
// ==========================================

function addToCart(
productId
) {

const product =
    products.find(
        function (item) {

            return (
                Number(item.id) ===
                Number(productId)
            );

        }
    );


if (!product) {

    alert(
        "❌ Product not found."
    );

    return;

}


const stock =
    Number(
        product.quantity
    ) || 0;


if (stock <= 0) {

    alert(
        "❌ This product is out of stock."
    );

    return;

}


let cart =
    typeof getCart === "function"
        ? getCart()
        : [];


const existingItem =
    cart.find(
        function (item) {

            return (
                Number(item.id) ===
                Number(productId)
            );

        }
    );


if (existingItem) {


    if (
        existingItem.quantity >=
        stock
    ) {

        alert(
            "❌ You cannot add more than the available stock."
        );

        return;

    }


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
            product.image || "",

        quantity:
            1

    });

}


if (
    typeof saveCart === "function"
) {

    saveCart(cart);

}


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
// WISHLIST
// ==========================================

function addToWishlist(
productId
) {

if (
    typeof addToWishlistItem ===
    "function"
) {

    addToWishlistItem(
        productId
    );

    return;

}


alert(
    "❤️ Wishlist feature is not available yet."
);

}

// ==========================================
// PRODUCT RATINGS
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
    allReviews[productId] ||
    [];


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
// DISPLAY PRODUCT RATINGS
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
// START
// ==========================================

document.addEventListener(
"DOMContentLoaded",
function () {

    loadProducts();

}

);