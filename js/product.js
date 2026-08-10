// ==========================================
// Hasbunallahu Store
// product.js
// ==========================================

// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

// Find selected product
const product = products.find(item => item.id === productId);

// ==========================================
// Display Product
// ==========================================

if (!product) {

    document.getElementById("product-name").textContent =
        "Product Not Found";

} else {

    document.getElementById("product-image").src =
        product.image;

    document.getElementById("product-image").alt =
        product.name;

    document.getElementById("product-name").textContent =
        product.name;

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

const addToCartBtn =
    document.getElementById("add-to-cart-btn");

if (addToCartBtn) {

    addToCartBtn.addEventListener("click", function () {

        if (!product) {

            alert("Product not found!");

            return;
        }

        const quantity =
            parseInt(
                document.getElementById("quantity").value
            ) || 1;

        let cart = getCart();

        const existingItem =
            cart.find(item => item.id === product.id);

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

        alert(
            product.name + " added to cart!"
        );

    });

}


// ==========================================
// Product Ratings & Reviews
// ==========================================

// Get reviews
function getProductReviews(productId) {

    const allReviews =
        JSON.parse(
            localStorage.getItem("productReviews")
        ) || {};

    return allReviews[productId] || [];
}


// Save review
function saveProductReview(productId, review) {

    const allReviews =
        JSON.parse(
            localStorage.getItem("productReviews")
        ) || {};

    if (!allReviews[productId]) {

        allReviews[productId] = [];

    }

    allReviews[productId].push(review);

    localStorage.setItem(
        "productReviews",
        JSON.stringify(allReviews)
    );

}


// ==========================================
// Display Reviews
// ==========================================

function displayProductReviews(productId) {

    const reviews =
        getProductReviews(productId);

    const container =
        document.getElementById(
            "reviews-container"
        );

    const averageElement =
        document.getElementById(
            "average-rating"
        );

    const starsElement =
        document.getElementById(
            "rating-stars"
        );

    const countElement =
        document.getElementById(
            "review-count"
        );


    if (!container) return;


    // No reviews
    if (reviews.length === 0) {

        container.innerHTML = `
            <p>
                No reviews yet.
                Be the first to review this product!
            </p>
        `;

        if (averageElement) {

            averageElement.textContent = "0.0";

        }

        if (starsElement) {

            starsElement.textContent =
                "☆☆☆☆☆";

        }

        if (countElement) {

            countElement.textContent = "0";

        }

        return;
    }


    // Calculate average rating
    let totalRating = 0;

    reviews.forEach(review => {

        totalRating +=
            Number(review.rating) || 0;

    });

    const average =
        totalRating / reviews.length;


    // Average rating
    if (averageElement) {

        averageElement.textContent =
            average.toFixed(1);

    }


    // Stars
    if (starsElement) {

        const rounded =
            Math.round(average);

        starsElement.textContent =
            "★".repeat(rounded) +
            "☆".repeat(5 - rounded);

    }


    // Review count
    if (countElement) {

        countElement.textContent =
            reviews.length;

    }


    // Display reviews
    container.innerHTML = "";

    reviews
        .slice()
        .reverse()
        .forEach(review => {

            const reviewElement =
                document.createElement("div");

            reviewElement.className =
                "review-item";

            const rating =
                Number(review.rating) || 0;

            reviewElement.innerHTML = `

                <h4>
                    ${review.name}
                </h4>

                <p>
                    ${"★".repeat(rating)}
                    ${"☆".repeat(5 - rating)}
                </p>

                <p>
                    ${review.text}
                </p>

                <small>
                    ${review.date}
                </small>

            `;

            container.appendChild(
                reviewElement
            );

        });

}


// ==========================================
// Submit Review
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const submitButton =
            document.getElementById(
                "submit-review"
            );


        if (!submitButton) return;


        submitButton.addEventListener(
            "click",
            function () {

                // Get name
                const name =
                    document
                        .getElementById(
                            "review-name"
                        )
                        .value
                        .trim();


                // Get rating
                const rating =
                    document
                        .getElementById(
                            "review-rating"
                        )
                        .value;


                // Convert rating to number
                const ratingNumber =
                    Number(rating);


                // Get review text
                const text =
                    document
                        .getElementById(
                            "review-text"
                        )
                        .value
                        .trim();


                // ==========================================
                // Validation
                // ==========================================

                if (name === "") {

                    alert(
                        "Please enter your name."
                    );

                    return;
                }


                if (name.length < 2) {

                    alert(
                        "Your name must contain at least 2 characters."
                    );

                    return;
                }


                if (name.length > 50) {

                    alert(
                        "Your name is too long."
                    );

                    return;
                }


                if (
                    ratingNumber < 1 ||
                    ratingNumber > 5
                ) {

                    alert(
                        "Please select a rating between 1 and 5."
                    );

                    return;
                }


                if (text === "") {

                    alert(
                        "Please write a review."
                    );

                    return;
                }


                if (text.length < 5) {

                    alert(
                        "Your review must contain at least 5 characters."
                    );

                    return;
                }


                if (text.length > 500) {

                    alert(
                        "Your review cannot exceed 500 characters."
                    );

                    return;
                }


                // ==========================================
                // Check Product ID
                // ==========================================

                if (
                    !productId ||
                    isNaN(productId)
                ) {

                    alert(
                        "Product could not be identified."
                    );

                    return;
                }


                // ==========================================
                // Create Review
                // ==========================================

                const review = {

                    name: name,

                    rating: ratingNumber,

                    text: text,

                    date:
                        new Date()
                            .toLocaleDateString()

                };


                // Save review
                saveProductReview(
                    productId,
                    review
                );


                // Clear form
                document.getElementById(
                    "review-name"
                ).value = "";

                document.getElementById(
                    "review-text"
                ).value = "";


                // Refresh reviews
                displayProductReviews(
                    productId
                );


                alert(
                    "Thank you! Your review has been submitted."
                );

            }
        );


        // Display existing reviews
        displayProductReviews(
            productId
        );

    }
);
// ==========================================
// Product Image Zoom
// ==========================================

function openImageZoom() {

    const image =
        document.getElementById("product-image");

    const zoom =
        document.getElementById("image-zoom");

    const zoomedImage =
        document.getElementById("zoomed-image");

    if (!image || !zoom || !zoomedImage) {
        return;
    }

    zoomedImage.src = image.src;

    zoom.style.display = "flex";
}


// Close zoom
const closeZoom =
    document.getElementById("close-zoom");

if (closeZoom) {

    closeZoom.addEventListener("click", function () {

        document.getElementById(
            "image-zoom"
        ).style.display = "none";

    });

}


// Close when clicking outside the image
const imageZoom =
    document.getElementById("image-zoom");

if (imageZoom) {

    imageZoom.addEventListener("click", function (e) {

        if (e.target === imageZoom) {

            imageZoom.style.display = "none";

        }

    });

}