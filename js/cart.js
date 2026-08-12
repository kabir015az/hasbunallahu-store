// ==========================================
// Hasbunallahu Store
// cart.js - FULL STOCK PROTECTED VERSION
// ==========================================


// ==========================================
// Get Cart Table
// ==========================================

const cartItems =
    document.getElementById("cart-items");


// ==========================================
// Load Cart
// ==========================================

async function loadCart() {

    if (!cartItems) return;

    let cart = getCart();

    cartItems.innerHTML = "";


    // ==========================================
    // Empty Cart
    // ==========================================

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <tr>
                <td colspan="5">
                    Your shopping cart is empty.
                </td>
            </tr>
        `;

        setCartTotals(0, 0);

        return;
    }


    // ==========================================
    // Check Stock From Supabase
    // ==========================================

    if (
        typeof supabaseClient !== "undefined"
    ) {

        try {

            const productIds =
                cart.map(function (item) {
                    return item.id;
                });


            const {
                data: products,
                error
            } = await supabaseClient
                .from("products")
                .select("id, name, quantity")
                .in("id", productIds);


            if (error) {

                console.error(
                    "Supabase stock error:",
                    error
                );

                alert(
                    "⚠️ Unable to verify product stock."
                );

                return;
            }


            let cartChanged = false;


            // ==========================================
            // Correct Cart Quantities
            // ==========================================

            cart.forEach(function (item) {

                const product =
                    products.find(function (p) {

                        return String(p.id) ===
                            String(item.id);

                    });


                // Product no longer exists
                if (!product) {

                    item.quantity = 0;

                    cartChanged = true;

                    return;
                }


                const stock =
                    Number(product.quantity) || 0;


                const cartQuantity =
                    Number(item.quantity) || 0;


                // ==========================================
                // Product Out Of Stock
                // ==========================================

                if (stock <= 0) {

                    item.quantity = 0;

                    cartChanged = true;

                    return;
                }


                // ==========================================
                // Cart Quantity Greater Than Stock
                // ==========================================

                if (cartQuantity > stock) {

                    item.quantity = stock;

                    cartChanged = true;

                    alert(
                        "⚠️ " +
                        product.name +
                        " has only " +
                        stock +
                        " available. " +
                        "Your cart has been adjusted."
                    );

                }


                // Prevent invalid quantity
                if (cartQuantity < 1) {

                    item.quantity = 1;

                    cartChanged = true;

                }

            });


            // ==========================================
            // Remove Out Of Stock Products
            // ==========================================

            cart = cart.filter(function (item) {

                return Number(item.quantity) > 0;

            });


            // ==========================================
            // Save Corrected Cart
            // ==========================================

            if (cartChanged) {

                saveCart(cart);

                updateCartCount();

            }

        }

        catch (error) {

            console.error(
                "Stock verification error:",
                error
            );

            alert(
                "⚠️ Unable to verify product stock."
            );

            return;
        }

    }


    // ==========================================
    // Cart Became Empty
    // ==========================================

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <tr>
                <td colspan="5">
                    Your cart is empty because the products
                    are out of stock.
                </td>
            </tr>
        `;

        setCartTotals(0, 0);

        return;
    }


    // ==========================================
    // Display Cart
    // ==========================================

    let totalItems = 0;

    let totalPrice = 0;


    cart.forEach(function (item) {

        const price =
            Number(item.price) || 0;


        const quantity =
            Number(item.quantity) || 1;


        const subtotal =
            price * quantity;


        totalItems += quantity;

        totalPrice += subtotal;


        cartItems.innerHTML += `

        <tr>

            <td>

                <img
                    src="${item.image || ""}"
                    width="70"
                    alt="${item.name || "Product"}"
                >

                <br>

                ${item.name || "Product"}

            </td>


            <td>
                ₦${price.toLocaleString()}
            </td>


            <td>

                <input
                    type="number"
                    min="1"
                    value="${quantity}"
                    onchange="
                        updateQuantity(
                            '${item.id}',
                            this.value
                        )
                    "
                >

            </td>


            <td>

                ₦${subtotal.toLocaleString()}

            </td>


            <td>

                <button
                    class="remove-btn"
                    onclick="
                        removeItem(
                            '${item.id}'
                        )
                    "
                >

                    Remove

                </button>

            </td>

        </tr>

        `;

    });


    // ==========================================
    // Update Totals
    // ==========================================

    setCartTotals(
        totalItems,
        totalPrice
    );

}



// ==========================================
// Set Cart Totals
// ==========================================

function setCartTotals(
    totalItems,
    totalPrice
) {

    const totalItemsElement =
        document.getElementById(
            "total-items"
        );


    const totalPriceElement =
        document.getElementById(
            "total-price"
        );


    if (totalItemsElement) {

        totalItemsElement.textContent =
            totalItems;

    }


    if (totalPriceElement) {

        totalPriceElement.textContent =
            "₦" +
            Number(totalPrice).toLocaleString();

    }

}



// ==========================================
// Update Quantity
// ==========================================

async function updateQuantity(
    productId,
    requestedQuantity
) {

    let cart = getCart();


    const item =
        cart.find(function (product) {

            return String(product.id) ===
                String(productId);

        });


    if (!item) return;


    let quantity =
        parseInt(requestedQuantity);


    // ==========================================
    // Basic Validation
    // ==========================================

    if (
        isNaN(quantity) ||
        quantity < 1
    ) {

        quantity = 1;

    }


    // ==========================================
    // Get Real Stock
    // ==========================================

    if (
        typeof supabaseClient !==
        "undefined"
    ) {

        try {

            const {
                data: product,
                error
            } = await supabaseClient
                .from("products")
                .select(
                    "id, name, quantity"
                )
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
                    "Stock check error:",
                    error
                );

                alert(
                    "❌ Unable to check product stock."
                );

                loadCart();

                return;
            }


            const stock =
                Number(product.quantity) || 0;


            // ==========================================
            // Out Of Stock
            // ==========================================

            if (stock <= 0) {

                alert(
                    "❌ " +
                    product.name +
                    " is out of stock."
                );


                cart =
                    cart.filter(
                        function (cartItem) {

                            return String(
                                cartItem.id
                            ) !==
                                String(
                                    productId
                                );

                        }
                    );


                saveCart(cart);

                updateCartCount();

                loadCart();

                return;
            }


            // ==========================================
            // Requested Quantity > Stock
            // ==========================================

            if (quantity > stock) {

                alert(
                    "❌ Only " +
                    stock +
                    " unit" +
                    (
                        stock === 1
                            ? ""
                            : "s"
                    ) +
                    " of " +
                    product.name +
                    " available."
                );


                quantity = stock;

            }


            // ==========================================
            // Save Correct Quantity
            // ==========================================

            item.quantity =
                quantity;


            saveCart(cart);

            updateCartCount();

            await loadCart();

            return;

        }

        catch (error) {

            console.error(
                "Stock verification error:",
                error
            );

            alert(
                "❌ Unable to verify product stock."
            );

            loadCart();

            return;
        }

    }


    // ==========================================
    // Fallback
    // ==========================================

    item.quantity =
        quantity;


    saveCart(cart);

    updateCartCount();

    loadCart();

}



// ==========================================
// Remove Item
// ==========================================

function removeItem(productId) {

    let cart =
        getCart();


    cart =
        cart.filter(
            function (product) {

                return String(product.id) !==
                    String(productId);

            }
        );


    saveCart(cart);

    updateCartCount();

    loadCart();

}



// ==========================================
// Clear Cart
// ==========================================

const clearCartBtn =
    document.getElementById(
        "clear-cart"
    );


if (clearCartBtn) {

    clearCartBtn.addEventListener(
        "click",
        function () {

            if (
                confirm(
                    "Are you sure you want to clear your cart?"
                )
            ) {

                localStorage.removeItem(
                    "cart"
                );


                updateCartCount();

                loadCart();

            }

        }
    );

}



// ==========================================
// Checkout Button
// ==========================================

const checkoutBtn =
    document.getElementById(
        "checkout-btn"
    );


if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        async function () {

            const cart =
                getCart();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;
            }


            // ==========================================
            // Final Stock Check
            // ==========================================

            if (
                typeof supabaseClient !==
                "undefined"
            ) {

                try {

                    const productIds =
                        cart.map(
                            function (item) {

                                return item.id;

                            }
                        );


                    const {
                        data: products,
                        error
                    } = await supabaseClient
                        .from("products")
                        .select(
                            "id, name, quantity"
                        )
                        .in(
                            "id",
                            productIds
                        );


                    if (error) {

                        console.error(
                            "Checkout stock error:",
                            error
                        );

                        alert(
                            "❌ Unable to verify stock. Please try again."
                        );

                        return;
                    }


                    for (
                        const item of cart
                    ) {

                        const product =
                            products.find(
                                function (p) {

                                    return String(
                                        p.id
                                    ) ===
                                        String(
                                            item.id
                                        );

                                }
                            );


                        // Product missing
                        if (!product) {

                            alert(
                                "❌ " +
                                item.name +
                                " is no longer available."
                            );

                            await loadCart();

                            return;
                        }


                        const stock =
                            Number(
                                product.quantity
                            ) || 0;


                        const requested =
                            Number(
                                item.quantity
                            ) || 0;


                        // Out of stock
                        if (stock <= 0) {

                            alert(
                                "❌ " +
                                product.name +
                                " is out of stock."
                            );

                            await loadCart();

                            return;
                        }


                        // Quantity greater than stock
                        if (
                            requested > stock
                        ) {

                            alert(
                                "❌ " +
                                product.name +
                                " only has " +
                                stock +
                                " available."
                            );

                            await loadCart();

                            return;
                        }

                    }

                }

                catch (error) {

                    console.error(
                        "Checkout stock verification error:",
                        error
                    );

                    alert(
                        "❌ Unable to verify stock."
                    );

                    return;
                }

            }


            // ==========================================
            // Go To Checkout
            // ==========================================

            window.location.href =
                "checkout.html";

        }
    );

}



// ==========================================
// Load Cart When Page Opens
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();

    }
);