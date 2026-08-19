// ==========================================
// HASBUNALLAHU STORE
// PRODUCT DETAILS
// MULTIPLE PRODUCT IMAGE GALLERY
// ==========================================


// ==========================================
// GET PRODUCT ID FROM URL
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );


const productId =
    params.get("id");


// ==========================================
// VARIABLES
// ==========================================

let productImages = [];

let currentImageIndex = 0;

let currentProduct = null;


// ==========================================
// ELEMENT HELPER
// ==========================================

function getElement(id) {

    return document.getElementById(id);

}


// ==========================================
// GET PRODUCT IMAGES
// ==========================================

function getProductImages(imageValue) {

    if (!imageValue) {

        return [];

    }


    // ==========================================
    // MULTIPLE IMAGE FORMAT
    // ==========================================

    if (
        Array.isArray(
            imageValue
        )
    ) {

        return imageValue.filter(
            function(url) {

                return (
                    typeof url === "string" &&
                    url.trim() !== ""
                );

            }
        );

    }


    // ==========================================
    // JSON ARRAY STORED AS TEXT
    // ==========================================

    if (
        typeof imageValue ===
        "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    imageValue
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                return parsed.filter(
                    function(url) {

                        return (
                            typeof url === "string" &&
                            url.trim() !== ""
                        );

                    }
                );

            }

        }

        catch (error) {

            // Not JSON.
            // Treat as single image.

        }


        // ==========================================
        // OLD SINGLE IMAGE FORMAT
        // ==========================================

        return [
            imageValue
        ];

    }


    return [];

}


// ==========================================
// DISPLAY MAIN IMAGE
// ==========================================

function displayImage(
    index
) {

    const imageElement =
        getElement(
            "product-image"
        );


    const counter =
        getElement(
            "image-counter"
        );


    if (
        !imageElement ||
        productImages.length === 0
    ) {

        return;

    }


    // ==========================================
    // KEEP INDEX VALID
    // ==========================================

    if (
        index < 0
    ) {

        index =
            productImages.length - 1;

    }


    if (
        index >=
        productImages.length
    ) {

        index = 0;

    }


    currentImageIndex =
        index;


    const imageURL =
        productImages[
            currentImageIndex
        ];


    // ==========================================
    // MAIN IMAGE
    // ==========================================

    imageElement.src =
        imageURL;


    imageElement.alt =
        currentProduct?.name ||
        "Product";


    // ==========================================
    // COUNTER
    // ==========================================

    if (counter) {

        counter.textContent =
            `${
                currentImageIndex + 1
            } / ${
                productImages.length
            }`;

    }


    // ==========================================
    // UPDATE THUMBNAILS
    // ==========================================

    updateThumbnailSelection();


    // ==========================================
    // UPDATE ZOOM IMAGE
    // ==========================================

    const zoomedImage =
        getElement(
            "zoomed-image"
        );


    if (zoomedImage) {

        zoomedImage.src =
            imageURL;

        zoomedImage.alt =
            currentProduct?.name ||
            "Product";

    }

}


// ==========================================
// CREATE THUMBNAILS
// ==========================================

function createThumbnails() {

    const container =
        getElement(
            "product-thumbnails"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    productImages.forEach(
        function(
            imageURL,
            index
        ) {

            const thumbnail =
                document.createElement(
                    "img"
                );


            thumbnail.src =
                imageURL;


            thumbnail.alt =
                `${
                    currentProduct?.name ||
                    "Product"
                } image ${
                    index + 1
                }`;


            thumbnail.className =
                "product-thumbnail";


            if (
                index ===
                currentImageIndex
            ) {

                thumbnail.classList.add(
                    "active"
                );

            }


            thumbnail.addEventListener(
                "click",
                function() {

                    displayImage(
                        index
                    );

                }
            );


            thumbnail.onerror =
                function() {

                    this.style.display =
                        "none";

                };


            container.appendChild(
                thumbnail
            );

        }
    );

}


// ==========================================
// UPDATE THUMBNAIL SELECTION
// ==========================================

function updateThumbnailSelection() {

    const thumbnails =
        document.querySelectorAll(
            ".product-thumbnail"
        );


    thumbnails.forEach(
        function(
            thumbnail,
            index
        ) {

            if (
                index ===
                currentImageIndex
            ) {

                thumbnail.classList.add(
                    "active"
                );

            }

            else {

                thumbnail.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ==========================================
// IMAGE NAVIGATION
// ==========================================

function setupImageNavigation() {

    const previousButton =
        getElement(
            "previous-image"
        );


    const nextButton =
        getElement(
            "next-image"
        );


    const navigation =
        getElement(
            "image-navigation"
        );


    // ==========================================
    // ONLY SHOW NAVIGATION IF MULTIPLE IMAGES
    // ==========================================

    if (
        productImages.length <= 1
    ) {

        if (navigation) {

            navigation.style.display =
                "none";

        }

        return;

    }


    if (navigation) {

        navigation.style.display =
            "flex";

    }


    if (previousButton) {

        previousButton.onclick =
            function() {

                displayImage(
                    currentImageIndex - 1
                );

            };

    }


    if (nextButton) {

        nextButton.onclick =
            function() {

                displayImage(
                    currentImageIndex + 1
                );

            };

    }

}


// ==========================================
// IMAGE ZOOM
// ==========================================

function setupImageZoom() {

    const productImage =
        getElement(
            "product-image"
        );


    const zoom =
        getElement(
            "image-zoom"
        );


    const zoomedImage =
        getElement(
            "zoomed-image"
        );


    const closeZoom =
        getElement(
            "close-zoom"
        );


    if (
        !productImage ||
        !zoom ||
        !zoomedImage
    ) {

        return;

    }


    // ==========================================
    // OPEN ZOOM
    // ==========================================

    productImage.onclick =
        function() {

            if (
                productImages.length === 0
            ) {

                return;

            }


            zoomedImage.src =
                productImages[
                    currentImageIndex
                ];


            zoomedImage.alt =
                currentProduct?.name ||
                "Product";


            zoom.style.display =
                "flex";

        };


    // ==========================================
    // CLOSE BUTTON
    // ==========================================

    if (closeZoom) {

        closeZoom.onclick =
            function() {

                zoom.style.display =
                    "none";

            };

    }


    // ==========================================
    // CLICK OUTSIDE IMAGE
    // ==========================================

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


    // ==========================================
    // ESC KEY
    // ==========================================

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Escape"
            ) {

                zoom.style.display =
                    "none";

            }

        }
    );

}


// ==========================================
// DISPLAY PRODUCT
// ==========================================

async function loadProduct() {

    const nameElement =
        getElement(
            "product-name"
        );


    const imageElement =
        getElement(
            "product-image"
        );


    const priceElement =
        getElement(
            "product-price"
        );


    const categoryElement =
        getElement(
            "product-category"
        );


    const descriptionElement =
        getElement(
            "product-description"
        );


    if (!productId) {

        if (nameElement) {

            nameElement.textContent =
                "Product Not Found";

        }

        return;

    }


    try {

        console.log(
            "Loading product ID:",
            productId
        );


        // ==========================================
        // GET PRODUCT
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
        // ERROR
        // ==========================================

        if (error) {

            console.error(
                "Product loading error:",
                error
            );


            if (nameElement) {

                nameElement.textContent =
                    "Product Not Found";

            }


            if (priceElement) {

                priceElement.textContent =
                    "₦0.00";

            }


            if (categoryElement) {

                categoryElement.textContent =
                    "";

            }


            if (descriptionElement) {

                descriptionElement.textContent =
                    "Unable to load this product.";

            }


            return;

        }


        if (!product) {

            if (nameElement) {

                nameElement.textContent =
                    "Product Not Found";

            }

            return;

        }


        // ==========================================
        // SAVE CURRENT PRODUCT
        // ==========================================

        currentProduct =
            product;


        // ==========================================
        // GET ALL IMAGES
        // ==========================================

        productImages =
            getProductImages(
                product.image
            );


        currentImageIndex =
            0;


        // ==========================================
        // DISPLAY IMAGES
        // ==========================================

        if (
            productImages.length > 0
        ) {

            displayImage(
                0
            );

            createThumbnails();

            setupImageNavigation();

            setupImageZoom();

        }

        else {

            if (imageElement) {

                imageElement.src =
                    "";

                imageElement.alt =
                    "No product image";

            }

        }


        // ==========================================
        // PRODUCT NAME
        // ==========================================

        if (nameElement) {

            nameElement.textContent =
                product.name ||
                "Unnamed Product";

        }


        // ==========================================
        // PRODUCT PRICE
        // ==========================================

        if (priceElement) {

            priceElement.textContent =
                "₦" +
                Number(
                    product.price || 0
                ).toLocaleString(
                    "en-NG"
                );

        }


        // ==========================================
        // CATEGORY
        // ==========================================

        if (categoryElement) {

            categoryElement.textContent =
                product.category ||
                "Uncategorized";

        }


        // ==========================================
        // DESCRIPTION
        // ==========================================

        if (descriptionElement) {

            descriptionElement.textContent =
                product.description ||
                "No description available.";

        }


        // ==========================================
        // ADD TO CART
        // ==========================================

        const addToCartButton =
            getElement(
                "add-to-cart-btn"
            );


        if (addToCartButton) {

            addToCartButton.onclick =
                function() {

                    const quantityInput =
                        getElement(
                            "quantity"
                        );


                    let quantity =
                        Number(
                            quantityInput?.value
                        ) || 1;


                    if (
                        quantity < 1
                    ) {

                        quantity = 1;

                    }


                    // ==========================================
                    // GET CART
                    // ==========================================

                    let cart =
                        JSON.parse(
                            localStorage.getItem(
                                "cart"
                            )
                        ) || [];


                    // ==========================================
                    // FIND EXISTING PRODUCT
                    // ==========================================

                    const existingProduct =
                        cart.find(
                            function(item) {

                                return (
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        product.id
                                    )
                                );

                            }
                        );


                    if (
                        existingProduct
                    ) {

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

                            // Save first image
                            // as cart image

                            image:
                                productImages[0] ||
                                "",

                            quantity:
                                quantity

                        });

                    }


                    // ==========================================
                    // SAVE CART
                    // ==========================================

                    localStorage.setItem(
                        "cart",
                        JSON.stringify(
                            cart
                        )
                    );


                    // ==========================================
                    // UPDATE CART COUNT
                    // ==========================================

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
        // REVIEWS
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


        if (nameElement) {

            nameElement.textContent =
                "Product Not Found";

        }

    }

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
// LOAD REVIEWS
// ==========================================

function loadReviews(
    productId
) {

    const reviews =
        getReviews(
            productId
        );


    const reviewsContainer =
        getElement(
            "reviews-container"
        );


    const averageRating =
        getElement(
            "average-rating"
        );


    const ratingStars =
        getElement(
            "rating-stars"
        );


    const reviewCount =
        getElement(
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


    let totalRating =
        0;


    reviews.forEach(
        function(review) {

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
        function(review) {

            const reviewElement =
                document.createElement(
                    "div"
                );


            reviewElement.className =
                "review";


            const rating =
                Number(
                    review.rating
                ) || 0;


            reviewElement.innerHTML = `

                <strong>
                    ${
                        escapeReviewText(
                            review.name ||
                            "Customer"
                        )
                    }
                </strong>

                <p>
                    ${
                        "★".repeat(
                            rating
                        )
                    }
                </p>

                <p>
                    ${
                        escapeReviewText(
                            review.text ||
                            ""
                        )
                    }
                </p>

            `;


            reviewsContainer.appendChild(
                reviewElement
            );

        }
    );

}


// ==========================================
// ESCAPE REVIEW TEXT
// ==========================================

function escapeReviewText(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// SUBMIT REVIEW
// ==========================================

function setupReviewForm(
    productId
) {

    const submitButton =
        getElement(
            "submit-review"
        );


    if (!submitButton) {

        return;

    }


    submitButton.onclick =
        function() {

            const nameInput =
                getElement(
                    "review-name"
                );


            const ratingInput =
                getElement(
                    "review-rating"
                );


            const textInput =
                getElement(
                    "review-text"
                );


            const name =
                nameInput?.value.trim();


            const rating =
                Number(
                    ratingInput?.value
                );


            const text =
                textInput?.value.trim();


            if (
                !name ||
                !text
            ) {

                alert(
                    "Please enter your name and review."
                );

                return;

            }


            if (
                rating < 1 ||
                rating > 5
            ) {

                alert(
                    "Please select a rating from 1 to 5."
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


            if (nameInput) {

                nameInput.value =
                    "";

            }


            if (textInput) {

                textInput.value =
                    "";

            }


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
            "PRODUCT JS MULTIPLE IMAGE GALLERY LOADED"
        );


        loadProduct();


        setupReviewForm(
            productId
        );

    }
);