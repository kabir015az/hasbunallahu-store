// ==========================================
// Hasbunallahu Store
// Admin Dashboard
// ==========================================


const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";


// ==========================================
// EmailJS
// ==========================================

const EMAIL_SERVICE_ID =
    "service_x0frozt";

const STATUS_EMAIL_TEMPLATE =
    "template_mo5bvrd";


// ==========================================
// Send Status Update Email
// ==========================================

async function sendStatusUpdateEmail(
    order,
    newStatus,
    trackingNumber,
    deliveryNote
) {

    if (
        typeof emailjs === "undefined"
    ) {

        console.error(
            "EmailJS is not loaded."
        );

        return false;

    }


    if (
        !order ||
        !order.customer_email
    ) {

        console.error(
            "Customer email is missing."
        );

        return false;

    }


    try {

        await emailjs.send(

            EMAIL_SERVICE_ID,

            STATUS_EMAIL_TEMPLATE,

            {

                fullname:
                    order.customer_name ||
                    "Customer",

                email:
                    order.customer_email,

                orderNumber:
                    order.order_number,

                status:
                    newStatus,

                trackingNumber:
                    trackingNumber ||
                    "Not assigned",

                deliveryNote:
                    deliveryNote ||
                    "Order received. Preparing for delivery."

            }

        );


        console.log(
            "Status update email sent."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Status email error:",
            error
        );

        return false;

    }

}



// ==========================================
// PAGE READY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        console.log(
            "Admin JS loaded."
        );


        const loginForm =
            document.getElementById(
                "admin-login-form"
            );


        const loginSection =
            document.getElementById(
                "admin-login"
            );


        const dashboard =
            document.getElementById(
                "admin-dashboard"
            );


        const loginMessage =
            document.getElementById(
                "login-message"
            );


        const logoutButton =
            document.getElementById(
                "admin-logout"
            );


        // ==========================================
        // Existing Login
        // ==========================================

        if (
            localStorage.getItem(
                "adminLoggedIn"
            ) === "true"
        ) {

            if (loginSection) {

                loginSection.style.display =
                    "none";

            }


            if (dashboard) {

                dashboard.style.display =
                    "block";

            }


            displayAdminOrders();

            displayAdminProducts();

        }


        // ==========================================
        // Login
        // ==========================================

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                function (e) {

                    e.preventDefault();


                    const username =
                        document
                            .getElementById(
                                "admin-username"
                            )
                            .value
                            .trim();


                    const password =
                        document
                            .getElementById(
                                "admin-password"
                            )
                            .value;


                    if (
                        username ===
                            ADMIN_USERNAME &&
                        password ===
                            ADMIN_PASSWORD
                    ) {


                        localStorage.setItem(
                            "adminLoggedIn",
                            "true"
                        );


                        loginSection.style.display =
                            "none";


                        dashboard.style.display =
                            "block";


                        loginMessage.textContent =
                            "";


                        displayAdminOrders();

                        displayAdminProducts();

                    }

                    else {

                        loginMessage.textContent =
                            "❌ Incorrect username or password.";

                    }

                }
            );

        }


        // ==========================================
        // Logout
        // ==========================================

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                function () {

                    localStorage.removeItem(
                        "adminLoggedIn"
                    );


                    dashboard.style.display =
                        "none";


                    loginSection.style.display =
                        "block";


                    loginMessage.textContent =
                        "";

                }
            );

        }


        // ==========================================
        // Add Product Form
        // ==========================================

        const addProductForm =
            document.getElementById(
                "add-product-form"
            );


        if (addProductForm) {

            addProductForm.addEventListener(
                "submit",
                addProduct
            );

        }

    }
);



// ==========================================
// ADD PRODUCT
// ==========================================

async function addProduct(e) {

    e.preventDefault();


    const message =
        document.getElementById(
            "product-message"
        );


    const button =
        document.getElementById(
            "add-product-button"
        );


    const name =
        document.getElementById(
            "product-name"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "product-price"
            ).value
        );


    const category =
        document.getElementById(
            "product-category"
        ).value.trim();


    const image =
        document.getElementById(
            "product-image"
        ).value.trim();


    const description =
        document.getElementById(
            "product-description"
        ).value.trim();


    const quantity =
        Number(
            document.getElementById(
                "product-quantity"
            ).value
        );


    if (
        name === "" ||
        price < 0 ||
        category === "" ||
        image === "" ||
        description === "" ||
        quantity < 0
    ) {

        message.textContent =
            "❌ Please fill all product information correctly.";

        return;

    }


    button.disabled = true;

    button.textContent =
        "Adding Product...";


    try {


        // IMPORTANT:
        // We DO NOT send "id".
        //
        // Supabase generates it automatically.
        //
        // This prevents:
        // duplicate key value violates
        // unique constraint "products_pkey"

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .insert([
                    {

                        name:
                            name,

                        price:
                            price,

                        category:
                            category,

                        image:
                            image,

                        description:
                            description,

                        quantity:
                            quantity

                    }
                ])
                .select()
                .single();


        if (error) {

            console.error(
                "Add product error:",
                error
            );


            message.textContent =
                "❌ Failed to add product: " +
                error.message;


            return;

        }


        console.log(
            "Product added:",
            data
        );


        message.textContent =
            "✅ Product added successfully!";


        document
            .getElementById(
                "add-product-form"
            )
            .reset();


        document
            .getElementById(
                "product-quantity"
            )
            .value = 30;


        displayAdminProducts();


        updateProductStatistics();


    }

    catch (error) {

        console.error(
            "Add product error:",
            error
        );


        message.textContent =
            "❌ Failed to add product.";

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "➕ Add Product";

    }

}



// ==========================================
// DISPLAY PRODUCTS
// ==========================================

async function displayAdminProducts() {

    const table =
        document.getElementById(
            "products-table"
        );


    if (!table) return;


    table.innerHTML = `
        <tr>
            <td colspan="8">
                Loading products...
            </td>
        </tr>
    `;


    try {

        const {
            data: productList,
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
                "Products loading error:",
                error
            );


            table.innerHTML = `
                <tr>
                    <td colspan="8">
                        ❌ Failed to load products.
                        <br><br>
                        ${error.message}
                    </td>
                </tr>
            `;

            return;

        }


        if (
            !productList ||
            productList.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="8">
                        No products found.
                    </td>
                </tr>
            `;

            updateProductStatistics();

            return;

        }


        table.innerHTML = "";


        productList.forEach(
            function (product) {


                const quantity =
                    Number(
                        product.quantity
                    ) || 0;


                let stockText;


                if (
                    quantity === 0
                ) {

                    stockText =
                        "❌ Out of stock";

                }

                else if (
                    quantity <= 5
                ) {

                    stockText =
                        "⚠️ " +
                        quantity;

                }

                else {

                    stockText =
                        quantity;

                }


                table.innerHTML += `

                    <tr>

                        <td>
                            ${product.id}
                        </td>


                        <td>

                            <img
                                src="${product.image || ""}"
                                alt="${product.name || "Product"}"
                                width="70"
                                height="70"
                                style="
                                    object-fit:cover;
                                    border-radius:8px;
                                "
                                onerror="
                                    this.style.display='none'
                                "
                            >

                        </td>


                        <td>
                            <strong>
                                ${product.name || ""}
                            </strong>
                        </td>


                        <td>
                            ₦${Number(
                                product.price || 0
                            ).toLocaleString()}
                        </td>


                        <td>
                            ${product.category || ""}
                        </td>


                        <td>

                            <strong>
                                ${stockText}
                            </strong>

                            <br><br>

                            <input
                                type="number"
                                min="0"
                                value="${quantity}"
                                id="quantity-${product.id}"
                                style="width:90px;"
                            >

                            <br><br>

                            <button
                                type="button"
                                onclick="
                                    updateProductQuantity(
                                        ${product.id}
                                    )
                                "
                            >
                                💾 Stock
                            </button>

                        </td>


                        <td>
                            ${product.description || ""}
                        </td>


                        <td>

                            <button
                                type="button"
                                onclick="
                                    editProduct(
                                        ${product.id}
                                    )
                                "
                            >
                                ✏️ Edit
                            </button>


                            <br><br>


                            <button
                                type="button"
                                onclick="
                                    deleteProduct(
                                        ${product.id}
                                    )
                                "
                            >
                                🗑️ Delete
                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        updateProductStatistics();


    }

    catch (error) {

        console.error(
            "Display products error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="8">
                    ❌ Unable to load products.
                </td>
            </tr>
        `;

    }

}



// ==========================================
// UPDATE PRODUCT QUANTITY
// ==========================================

async function updateProductQuantity(
    productId
) {

    const input =
        document.getElementById(
            "quantity-" + productId
        );


    if (!input) return;


    const quantity =
        Number(
            input.value
        );


    if (
        quantity < 0 ||
        !Number.isInteger(quantity)
    ) {

        alert(
            "Please enter a valid quantity."
        );

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("products")
                .update({

                    quantity:
                        quantity

                })
                .eq(
                    "id",
                    productId
                );


        if (error) {

            console.error(
                "Quantity update error:",
                error
            );


            alert(
                "❌ Failed to update quantity.\n\n" +
                error.message
            );

            return;

        }


        alert(
            "✅ Product quantity updated."
        );


        displayAdminProducts();

        updateProductStatistics();

    }

    catch (error) {

        console.error(
            "Quantity error:",
            error
        );


        alert(
            "❌ Failed to update quantity."
        );

    }

}



// ==========================================
// EDIT PRODUCT
// ==========================================

async function editProduct(
    productId
) {

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

            alert(
                "❌ Could not find product."
            );

            return;

        }


        const name =
            prompt(
                "Product name:",
                product.name
            );


        if (
            name === null
        ) return;


        const priceInput =
            prompt(
                "Price:",
                product.price
            );


        if (
            priceInput === null
        ) return;


        const category =
            prompt(
                "Category:",
                product.category
            );


        if (
            category === null
        ) return;


        const image =
            prompt(
                "Image path:",
                product.image
            );


        if (
            image === null
        ) return;


        const description =
            prompt(
                "Description:",
                product.description
            );


        if (
            description === null
        ) return;


        const quantityInput =
            prompt(
                "Quantity:",
                product.quantity
            );


        if (
            quantityInput === null
        ) return;


        const price =
            Number(
                priceInput
            );


        const quantity =
            Number(
                quantityInput
            );


        if (
            price < 0 ||
            quantity < 0
        ) {

            alert(
                "❌ Price and quantity cannot be negative."
            );

            return;

        }


        const {
            error: updateError
        } =
            await supabaseClient
                .from("products")
                .update({

                    name:
                        name.trim(),

                    price:
                        price,

                    category:
                        category.trim(),

                    image:
                        image.trim(),

                    description:
                        description.trim(),

                    quantity:
                        quantity

                })
                .eq(
                    "id",
                    productId
                );


        if (updateError) {

            console.error(
                "Edit product error:",
                updateError
            );


            alert(
                "❌ Failed to edit product.\n\n" +
                updateError.message
            );

            return;

        }


        alert(
            "✅ Product updated successfully."
        );


        displayAdminProducts();

        updateProductStatistics();

    }

    catch (error) {

        console.error(
            "Edit error:",
            error
        );


        alert(
            "❌ Failed to edit product."
        );

    }

}



// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(
    productId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) return;


    try {

        const {
            error
        } =
            await supabaseClient
                .from("products")
                .delete()
                .eq(
                    "id",
                    productId
                );


        if (error) {

            console.error(
                "Delete product error:",
                error
            );


            alert(
                "❌ Failed to delete product.\n\n" +
                error.message
            );

            return;

        }


        alert(
            "✅ Product deleted successfully."
        );


        displayAdminProducts();

        updateProductStatistics();

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "❌ Failed to delete product."
        );

    }

}



// ==========================================
// PRODUCT STATISTICS
// ==========================================

async function updateProductStatistics() {

    const totalProducts =
        document.getElementById(
            "total-products"
        );


    if (!totalProducts) return;


    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from("products")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            console.error(
                "Product count error:",
                error
            );

            return;

        }


        totalProducts.textContent =
            count || 0;

    }

    catch (error) {

        console.error(
            "Statistics error:",
            error
        );

    }

}



// ==========================================
// DISPLAY ORDERS
// ==========================================

async function displayAdminOrders() {

    const ordersTable =
        document.getElementById(
            "orders-table"
        );


    if (!ordersTable) return;


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        ordersTable.innerHTML = `
            <tr>
                <td colspan="9">
                    ❌ Supabase is not connected.
                </td>
            </tr>
        `;

        return;

    }


    ordersTable.innerHTML = `
        <tr>
            <td colspan="9">
                Loading orders...
            </td>
        </tr>
    `;


    try {

        const {
            data: orders,
            error
        } =
            await supabaseClient
                .from("orders")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Supabase orders error:",
                error
            );


            ordersTable.innerHTML = `
                <tr>
                    <td colspan="9">
                        ❌ Failed to load orders.
                        <br><br>
                        ${error.message}
                    </td>
                </tr>
            `;

            return;

        }


        if (
            !orders ||
            orders.length === 0
        ) {

            ordersTable.innerHTML = `
                <tr>
                    <td colspan="9">
                        No orders yet.
                    </td>
                </tr>
            `;


            updateAdminStatistics(
                []
            );


            return;

        }


        ordersTable.innerHTML = "";


        orders.forEach(
            function (order) {


                const status =
                    order.status ||
                    "Paid";


                ordersTable.innerHTML += `

                    <tr>

                        <td>
                            <strong>
                                ${order.order_number || "N/A"}
                            </strong>
                        </td>


                        <td>
                            ${order.customer_name || "N/A"}
                        </td>


                        <td>
                            ${order.customer_email || "N/A"}
                        </td>


                        <td>
                            ${order.phone || "N/A"}
                        </td>


                        <td>
                            ₦${Number(
                                order.total || 0
                            ).toLocaleString()}
                        </td>


                        <td>

                            <select
                                id="status-${order.order_number}"
                            >

                                <option
                                    value="Paid"
                                    ${status === "Paid"
                                        ? "selected"
                                        : ""}
                                >
                                    Paid
                                </option>


                                <option
                                    value="Processing"
                                    ${status === "Processing"
                                        ? "selected"
                                        : ""}
                                >
                                    Processing
                                </option>


                                <option
                                    value="Shipped"
                                    ${status === "Shipped"
                                        ? "selected"
                                        : ""}
                                >
                                    Shipped
                                </option>


                                <option
                                    value="Out for Delivery"
                                    ${status === "Out for Delivery"
                                        ? "selected"
                                        : ""}
                                >
                                    Out for Delivery
                                </option>


                                <option
                                    value="Delivered"
                                    ${status === "Delivered"
                                        ? "selected"
                                        : ""}
                                >
                                    Delivered
                                </option>

                            </select>

                        </td>


                        <td>

                            <input
                                type="text"
                                id="tracking-${order.order_number}"
                                value="${order.tracking_number || ""}"
                                placeholder="Tracking number"
                            >

                        </td>


                        <td>

                            <textarea
                                id="note-${order.order_number}"
                                rows="2"
                                placeholder="Delivery note"
                            >${order.delivery_note || ""}</textarea>

                        </td>


                        <td>

                            <button
                                type="button"
                                onclick="
                                    saveOrderUpdate(
                                        '${order.order_number}'
                                    )
                                "
                            >
                                💾 Save
                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        updateAdminStatistics(
            orders
        );

    }

    catch (error) {

        console.error(
            "Order loading error:",
            error
        );


        ordersTable.innerHTML = `
            <tr>
                <td colspan="9">
                    ❌ Unable to load orders.
                </td>
            </tr>
        `;

    }

}



// ==========================================
// SAVE ORDER UPDATE
// ==========================================

async function saveOrderUpdate(
    orderNumber
) {

    const statusElement =
        document.getElementById(
            "status-" + orderNumber
        );


    const trackingElement =
        document.getElementById(
            "tracking-" + orderNumber
        );


    const noteElement =
        document.getElementById(
            "note-" + orderNumber
        );


    if (!statusElement) {

        alert(
            "Order information not found."
        );

        return;

    }


    const newStatus =
        statusElement.value;


    const trackingNumber =
        trackingElement
            ? trackingElement.value.trim()
            : "";


    const deliveryNote =
        noteElement
            ? noteElement.value.trim()
            : "";


    try {


        // ==========================================
        // Get Customer Information
        // ==========================================

        const {
            data: order,
            error: fetchError
        } =
            await supabaseClient
                .from("orders")
                .select(
                    "order_number, customer_name, customer_email"
                )
                .eq(
                    "order_number",
                    orderNumber
                )
                .single();


        if (fetchError) {

            console.error(
                "Order fetch error:",
                fetchError
            );


            alert(
                "❌ Could not find order."
            );

            return;

        }


        // ==========================================
        // Update Supabase
        // ==========================================

        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .update({

                    status:
                        newStatus,

                    tracking_number:
                        trackingNumber ||
                        null,

                    delivery_note:
                        deliveryNote ||
                        "Order received. Preparing for delivery."

                })
                .eq(
                    "order_number",
                    orderNumber
                );


        if (error) {

            console.error(
                "Order update error:",
                error
            );


            alert(
                "❌ Failed to update order.\n\n" +
                error.message
            );

            return;

        }


        // ==========================================
        // Send Customer Email
        // ==========================================

        const emailSent =
            await sendStatusUpdateEmail(
                order,
                newStatus,
                trackingNumber,
                deliveryNote
            );


        if (emailSent) {

            alert(
                "✅ Order updated successfully.\n\n" +
                "📧 Customer notification email sent."
            );

        }

        else {

            alert(
                "✅ Order updated successfully.\n\n" +
                "⚠️ Customer notification email could not be sent."
            );

        }


        displayAdminOrders();

    }

    catch (error) {

        console.error(
            "Save order error:",
            error
        );


        alert(
            "❌ Failed to update order.\n\n" +
            error.message
        );

    }

}



// ==========================================
// ADMIN STATISTICS
// ==========================================

function updateAdminStatistics(
    orders
) {

    if (!orders) {

        orders = [];

    }


    // ==========================================
    // Total Orders
    // ==========================================

    const totalOrders =
        document.getElementById(
            "total-orders"
        );


    if (totalOrders) {

        totalOrders.textContent =
            orders.length;

    }


    // ==========================================
    // Total Sales
    // ==========================================

    let totalSales = 0;


    orders.forEach(
        function (order) {

            totalSales +=
                Number(
                    order.total
                ) || 0;

        }
    );


    const totalSalesElement =
        document.getElementById(
            "total-sales"
        );


    if (totalSalesElement) {

        totalSalesElement.textContent =
            "₦" +
            totalSales.toLocaleString();

    }


    // ==========================================
    // Total Customers
    // ==========================================

    const customers = [];


    orders.forEach(
        function (order) {

            if (
                order.customer_email &&
                !customers.includes(
                    order.customer_email
                )
            ) {

                customers.push(
                    order.customer_email
                );

            }

        }
    );


    const totalCustomers =
        document.getElementById(
            "total-customers"
        );


    if (totalCustomers) {

        totalCustomers.textContent =
            customers.length;

    }


    // Product count is handled
    // by updateProductStatistics()

}