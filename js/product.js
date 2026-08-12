// ==========================================
// Hasbunallahu Store
// product.js
// Supabase Product Details
// ==========================================


// ==========================================
// Get Product ID From URL
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id");


// ==========================================
// Display Product
// ==========================================

async function loadProduct() {

    const nameElement =
        document.getElementById(
            "product-name"
        );

    const imageElement =
        document.getElementById(
            "product-image"
        );

    const priceElement =
        document.getElementById(
            "product-price"
        );

    const categoryElement =
        document.getElementById(
            "product-category"
        );

    const descriptionElement =
        document.getElementById(
            "product-description"
        );


    if (!productId) {

        nameElement.textContent =
            "Product Not Found";

        return;

    }


    try {

        console.log(
            "Loading product ID:",
            productId
        );


        // ==========================================
        // Get Product From Supabase
        // ==========================================

        const {
            data: product,
            error
        } =
            await supabaseClient
                .from("products")
                .select("*")
                .eq(
                    "id",
                    productId
                )
                .single();


        // ==========================================
        // Supabase Error
        // ==========================================

        if (error) {

            console.error(
                "Product loading error:",
                error
            );


            nameElement.textContent =
                "Product Not Found";

            priceElement.textContent =
                "₦0.00";

            categoryElement.textContent =
                "";

            descriptionElement.textContent =
                "Unable to load this product.";

            return;

        }


        // ==========================================
        // Product Does Not Exist
        // ==========================================

        if (!product) {

            nameElement.textContent =
                "Product Not Found";

            return;

        }


        // ==========================================
        // Display Image
        // ==========================================

        if (product.image) {

            imageElement.src =
                product.image;

            imageElement.alt =
                product.name || "Product";

        }


        // ==========================================
        // Display Name
        // ==========================================

        nameElement.textContent =
            product.name || "Unnamed Product";


        // ==========================================
        // Display Price
        // ==========================================

        priceElement.textContent =
            "₦" +
            Number(
                product.price || 0
            ).toLocaleString();


        // ==========================================
        // Display Category
        // ==========================================

        categoryElement.textContent =
            product.category || "Uncategorized";


        // ==========================================
        // Display Description
        // ==========================================

        descriptionElement.textContent =
            product.description ||
            "No description available.";


        // ==========================================
        // Add To Cart Button
        // ==========================================

        const addToCartButton =
            document.getElementById(
                "add-to-cart-btn"
            );


        if (addToCartButton) {

            addToCartButton.onclick =
                function () {

                    const quantityInput =
                        document.getElementById(
                            "quantity"
                        );


                    let quantity =
                        Number(
                            quantityInput.value
                        ) || 1;


                    if (quantity < 1) {

                        quantity = 1;

                    }


                    // Get existing cart

                    let cart =
                        JSON.parse(
                            localStorage.getItem(
                                "cart"
                            )
                        ) || [];


                    // Check existing product

                    const existingProduct =
                        cart.find(
                            item =>
                                String(item.id) ===
                                String(product.id)
                        );


                    if (existingProduct) {

                        existingProduct.quantity +=
                            quantity;

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
                                quantity

                        });

                    }


                    // Save cart

                    localStorage.setItem(
                        "cart",
                        JSON.stringify(cart)
                    );


                    // Update cart count

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

                };

        }


        // ==========================================
        // Image Zoom
        // ==========================================

        setupImageZoom(
            product.image
        );


        // ==========================================
        // Load Reviews
        // ==========================================

        loadReviews(
            product.id
        );


    }

    catch (error) {

        console.error(
            "Product error:",
            error
        );


        nameElement.textContent =
            "Product Not Found";

    }

}



// ==========================================
// IMAGE ZOOM
// ==========================================

function setupImageZoom(
    imageUrl
) {

    const productImage =
        document.getElementById(
            "product-image"
        );

    const zoom =
        document.getElementById(
            "image-zoom"
        );

    const zoomedImage =
        document.getElementById(
            "zoomed-image"
        );

    const closeZoom =
        document.getElementById(
            "close-zoom"
        );


    if (
        !productImage ||
        !zoom ||
        !zoomedImage
    ) {

        return;

    }


    productImage.onclick =
        function () {

            zoomedImage.src =
                imageUrl;

            zoom.style.display =
                "flex";

        };


    if (closeZoom) {

        closeZoom.onclick =
            function () {

                zoom.style.display =
                    "none";

            };

    }


    zoom.onclick =
        function (event) {

            if (
                event.target ===
                zoom
            ) {

                zoom.style.display =
                    "none";

            }

        };

}



// ==========================================
// REVIEWS
// ==========================================

function getReviews(
    productId
) {

    const allReviews =
        JSON.parse(
            localStorage.getItem(
                "productReviews"
            )
        ) || {};


    return (
        allReviews[productId] ||
        []
    );

}



// ==========================================
// Load Reviews
// ==========================================

function loadReviews(
    productId
) {

    const reviews =
        getReviews(
            productId
        );


    const reviewsContainer =
        document.getElementById(
            "reviews-container"
        );


    const averageRating =
        document.getElementById(
            "average-rating"
        );


    const ratingStars =
        document.getElementById(
            "rating-stars"
        );


    const reviewCount =
        document.getElementById(
            "review-count"
        );


    if (!reviewsContainer) {

        return;

    }


    if (
        reviews.length === 0
    ) {

        reviewsContainer.innerHTML =
            `
            <p>
                No reviews yet.
                Be the first to review this product!
            </p>
            `;

        if (averageRating) {

            averageRating.textContent =
                "0.0";

        }

        if (ratingStars) {

            ratingStars.textContent =
                "☆☆☆☆☆";

        }

        if (reviewCount) {

            reviewCount.textContent =
                "0";

        }

        return;

    }


    let totalRating = 0;


    reviews.forEach(
        review => {

            totalRating +=
                Number(
                    review.rating
                ) || 0;

        }
    );


    const average =
        totalRating /
        reviews.length;


    if (averageRating) {

        averageRating.textContent =
            average.toFixed(1);

    }


    if (ratingStars) {

        const rounded =
            Math.round(
                average
            );


        ratingStars.textContent =
            "★".repeat(
                rounded
            ) +
            "☆".repeat(
                5 - rounded
            );

    }


    if (reviewCount) {

        reviewCount.textContent =
            reviews.length;

    }


    reviewsContainer.innerHTML =
        "";


    reviews.forEach(
        review => {

            reviewsContainer.innerHTML += `

                <div class="review">

                    <strong>
                        ${review.name || "Customer"}
                    </strong>

                    <p>
                        ${
                            "★".repeat(
                                Number(
                                    review.rating
                                ) || 0
                            )
                        }
                    </p>

                    <p>
                        ${review.text || ""}
                    </p>

                </div>

            `;

        }
    );

}



// ==========================================
// Submit Review
// ==========================================

function setupReviewForm(
    productId
) {

    const submitButton =
        document.getElementById(
            "submit-review"
        );


    if (!submitButton) {

        return;

    }


    submitButton.onclick =
        function () {

            const nameInput =
                document.getElementById(
                    "review-name"
                );


            const ratingInput =
                document.getElementById(
                    "review-rating"
                );


            const textInput =
                document.getElementById(
                    "review-text"
                );


            const name =
                nameInput.value.trim();


            const rating =
                Number(
                    ratingInput.value
                );


            const text =
                textInput.value.trim();


            if (
                name === "" ||
                text === ""
            ) {

                alert(
                    "Please enter your name and review."
                );

                return;

            }


            const allReviews =
                JSON.parse(
                    localStorage.getItem(
                        "productReviews"
                    )
                ) || {};


            if (
                !allReviews[productId]
            ) {

                allReviews[productId] =
                    [];

            }


            allReviews[productId].push({

                name:
                    name,

                rating:
                    rating,

                text:
                    text,

                date:
                    new Date().toLocaleString()

            });


            localStorage.setItem(
                "productReviews",
                JSON.stringify(
                    allReviews
                )
            );


            nameInput.value =
                "";

            textInput.value =
                "";


            loadReviews(
                productId
            );


            alert(
                "✅ Review submitted successfully!"
            );

        };

}



// ==========================================
// PAGE READY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProduct();

        setupReviewForm(
            productId
        );

    }
);