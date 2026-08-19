// ==========================================
// HASBUNALLAHU STORE
// PRODUCT DETAILS
// MULTIPLE IMAGES + MULTIPLE VIDEOS
// ==========================================


// ==========================================
// PRODUCT ID
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id");



// ==========================================
// PARSE MEDIA
// ==========================================

function parseMedia(value) {

    if (!value) {
        return [];
    }


    try {

        const parsed =
            JSON.parse(value);

        if (Array.isArray(parsed)) {

            return parsed.filter(
                item =>
                    typeof item === "string" &&
                    item.trim() !== ""
            );

        }

    }

    catch (error) {

        // Old single URL format

    }


    return [
        String(value)
    ];

}



// ==========================================
// LOAD PRODUCT
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


        if (error) {
            throw error;
        }


        if (!product) {

            nameElement.textContent =
                "Product Not Found";

            return;

        }


        // ==========================================
        // PRODUCT IMAGES
        // ==========================================

        const images =
            parseMedia(
                product.image
            );


        // ==========================================
        // MAIN IMAGE
        // ==========================================

        if (images.length > 0) {

            imageElement.src =
                images[0];

            imageElement.alt =
                product.name ||
                "Product";

            setupImageZoom(
                images[0]
            );

        }


        // ==========================================
        // THUMBNAILS
        // ==========================================

        displayImageThumbnails(
            images
        );


        // ==========================================
        // PRODUCT VIDEOS
        // ==========================================

        const videos =
            parseMedia(
                product.videos
            );


        displayProductVideos(
            videos
        );


        // ==========================================
        // NAME
        // ==========================================

        nameElement.textContent =
            product.name ||
            "Unnamed Product";


        // ==========================================
        // PRICE
        // ==========================================

        priceElement.textContent =
            "₦" +
            Number(
                product.price || 0
            ).toLocaleString(
                "en-NG",
                {
                    minimumFractionDigits:
                        2
                }
            );


        // ==========================================
        // CATEGORY
        // ==========================================

        categoryElement.textContent =
            product.category ||
            "Uncategorized";


        // ==========================================
        // DESCRIPTION
        // ==========================================

        descriptionElement.textContent =
            product.description ||
            "No description available.";


        // ==========================================
        // ADD TO CART
        // ==========================================

        setupAddToCart(
            product
        );


        // ==========================================
        // REVIEWS
        // ==========================================

        loadReviews(
            product.id
        );

    }

    catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        nameElement.textContent =
            "Product Not Found";


        priceElement.textContent =
            "₦0.00";


        descriptionElement.textContent =
            "Unable to load this product.";

    }

}



// ==========================================
// DISPLAY IMAGE THUMBNAILS
// ==========================================

function displayImageThumbnails(
    images
) {

    const container =
        document.getElementById(
            "product-thumbnails"
        );


    const mainImage =
        document.getElementById(
            "product-image"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        !images ||
        images.length <= 1
    ) {
        return;
    }


    images.forEach(
        function(imageUrl, index) {

            const thumbnail =
                document.createElement(
                    "img"
                );


            thumbnail.src =
                imageUrl;

            thumbnail.alt =
                "Product image " +
                (index + 1);

            thumbnail.className =
                "product-thumbnail";


            if (index === 0) {

                thumbnail.classList.add(
                    "active"
                );

            }


            thumbnail.onclick =
                function() {

                    mainImage.src =
                        imageUrl;


                    document
                        .querySelectorAll(
                            ".product-thumbnail"
                        )
                        .forEach(
                            img =>
                                img.classList.remove(
                                    "active"
                                )
                        );


                    thumbnail.classList.add(
                        "active"
                    );


                    setupImageZoom(
                        imageUrl
                    );

                };


            container.appendChild(
                thumbnail
            );

        }
    );

}



// ==========================================
// DISPLAY PRODUCT VIDEOS
// ==========================================

function displayProductVideos(
    videos
) {

    const section =
        document.getElementById(
            "product-videos-section"
        );


    const container =
        document.getElementById(
            "product-videos-container"
        );


    if (
        !section ||
        !container
    ) {
        return;
    }


    container.innerHTML =
        "";


    if (
        !videos ||
        videos.length === 0
    ) {

        section.style.display =
            "none";

        return;

    }


    section.style.display =
        "block";


    videos.forEach(
        function(videoUrl, index) {

            const video =
                document.createElement(
                    "video"
                );


            video.className =
                "product-video";


            video.controls =
                true;


            video.playsInline =
                true;


            video.preload =
                "metadata";


            video.src =
                videoUrl;


            video.setAttribute(
                "aria-label",
                "Product video " +
                (index + 1)
            );


            container.appendChild(
                video
            );

        }
    );

}



// ==========================================
// ADD TO CART
// ==========================================

function setupAddToCart(
    product
) {

    const button =
        document.getElementById(
            "add-to-cart-btn"
        );


    if (!button) {
        return;
    }


    button.onclick =
        function() {

            const quantityInput =
                document.getElementById(
                    "quantity"
                );


            let quantity =
                Number(
                    quantityInput?.value
                ) || 1;


            if (quantity < 1) {
                quantity = 1;
            }


            let cart =
                JSON.parse(
                    localStorage.getItem(
                        "cart"
                    )
                ) || [];


            const existing =
                cart.find(
                    item =>
                        String(item.id) ===
                        String(product.id)
                );


            if (existing) {

                existing.quantity +=
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

        };

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
        function() {

            zoomedImage.src =
                imageUrl;

            zoom.style.display =
                "flex";

        };


    if (closeZoom) {

        closeZoom.onclick =
            function() {

                zoom.style.display =
                    "none";

            };

    }


    zoom.onclick =
        function(event) {

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


    if (reviews.length === 0) {

        reviewsContainer.innerHTML = `

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


    let totalRating =
        0;


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
// REVIEW FORM
// ==========================================

function setupReviewForm(
    productId
) {

    const button =
        document.getElementById(
            "submit-review"
        );


    if (!button) {
        return;
    }


    button.onclick =
        function() {

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
                !name ||
                !text
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
                    new Date()
                        .toLocaleString()

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
    function() {

        console.log(
            "PRODUCT JS VERSION 2 - IMAGES + VIDEOS LOADED"
        );


        loadProduct();

        setupReviewForm(
            productId
        );

    }
);