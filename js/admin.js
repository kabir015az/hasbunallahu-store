// ==========================================
// HASBUNALLAHU STORE
// ADMIN DASHBOARD
// MULTIPLE PRODUCT IMAGES
// ==========================================


// ==========================================
// ADMIN EMAIL
// ==========================================

const ADMIN_EMAIL =
    "kabirabdulazeez45@gmail.com";


// ==========================================
// VARIABLES
// ==========================================

let currentAdmin = null;


// ==========================================
// ELEMENT HELPER
// ==========================================

function getElement(id) {

    return document.getElementById(id);

}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return "₦" +
        Number(amount || 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// SHOW LOGIN MESSAGE
// ==========================================

function showLoginMessage(
    message,
    success = false
) {

    const element =
        getElement("login-message");

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.style.color =
        success
            ? "green"
            : "red";

}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {

    const login =
        getElement("admin-login");

    const dashboard =
        getElement("admin-dashboard");

    if (login) {
        login.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "block";
    }

}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    const login =
        getElement("admin-login");

    const dashboard =
        getElement("admin-dashboard");

    if (login) {
        login.style.display = "block";
    }

    if (dashboard) {
        dashboard.style.display = "none";
    }

}


// ==========================================
// CHECK ADMIN SESSION
// ==========================================

async function checkAdminSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();

        if (error) {

            console.error(
                "Session error:",
                error
            );

            showLogin();

            return;

        }

        const session =
            data.session;

        if (!session) {

            showLogin();

            return;

        }

        const user =
            session.user;

        if (
            !user ||
            !user.email
        ) {

            await supabaseClient
                .auth
                .signOut();

            showLogin();

            return;

        }

        if (
            user.email.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await supabaseClient
                .auth
                .signOut();

            showLogin();

            showLoginMessage(
                "❌ You are not authorized to access the admin dashboard."
            );

            return;

        }

        currentAdmin =
            user;

        showDashboard();

        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Admin session error:",
            error
        );

        showLogin();

    }

}


// ==========================================
// ADMIN LOGIN
// ==========================================

async function adminLogin(event) {

    event.preventDefault();

    const emailInput =
        getElement("admin-email");

    const passwordInput =
        getElement("admin-password");

    if (
        !emailInput ||
        !passwordInput
    ) {

        showLoginMessage(
            "❌ Login fields were not found."
        );

        return;

    }

    const email =
        emailInput.value
            .trim()
            .toLowerCase();

    const password =
        passwordInput.value;

    if (!email || !password) {

        showLoginMessage(
            "Please enter your email and password."
        );

        return;

    }

    if (
        email !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        showLoginMessage(
            "❌ This email is not the admin email."
        );

        return;

    }

    const loginButton =
        event.submitter ||
        event.target.querySelector(
            'button[type="submit"]'
        );

    if (loginButton) {

        loginButton.disabled = true;
        loginButton.textContent =
            "Logging in...";

    }

    showLoginMessage(
        "Checking login..."
    );

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });

        if (error) {

            console.error(
                "Supabase login error:",
                error
            );

            showLoginMessage(
                "❌ Login failed: " +
                error.message
            );

            return;

        }

        if (
            !data ||
            !data.user
        ) {

            showLoginMessage(
                "❌ Login failed. No user was returned."
            );

            return;

        }

        if (
            data.user.email.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await supabaseClient
                .auth
                .signOut();

            showLoginMessage(
                "❌ This account is not authorized as admin."
            );

            return;

        }

        currentAdmin =
            data.user;

        showLoginMessage(
            "✅ Login successful!",
            true
        );

        showDashboard();

        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        showLoginMessage(
            "❌ " +
            (
                error.message ||
                "Unable to login."
            )
        );

    }

    finally {

        if (loginButton) {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";

        }

    }

}


// ==========================================
// LOGOUT
// ==========================================

async function adminLogout() {

    try {

        await supabaseClient
            .auth
            .signOut();

        currentAdmin =
            null;

        showLogin();

        showLoginMessage(
            "You have been logged out.",
            true
        );

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    await Promise.all([

        loadStatistics(),

        loadProducts(),

        loadOrders(),

        loadCategories()

    ]);

}


// ==========================================
// LOAD STATISTICS
// ==========================================

async function loadStatistics() {

    try {

        const {
            data: orders,
            error: ordersError
        } =
            await supabaseClient
                .from("orders")
                .select(
                    "id,total,customer_email"
                );

        if (ordersError) {
            throw ordersError;
        }

        const orderList =
            orders || [];

        const totalOrders =
            orderList.length;

        let totalSales = 0;

        const customers =
            new Set();

        orderList.forEach(
            function(order) {

                totalSales +=
                    Number(
                        order.total
                    ) || 0;

                if (
                    order.customer_email
                ) {

                    customers.add(
                        order.customer_email
                            .toLowerCase()
                    );

                }

            }
        );

        const totalOrdersElement =
            getElement("total-orders");

        const totalSalesElement =
            getElement("total-sales");

        const totalCustomersElement =
            getElement("total-customers");

        if (totalOrdersElement) {
            totalOrdersElement.textContent =
                totalOrders;
        }

        if (totalSalesElement) {
            totalSalesElement.textContent =
                formatMoney(totalSales);
        }

        if (totalCustomersElement) {
            totalCustomersElement.textContent =
                customers.size;
        }


        const {
            count,
            error: productsError
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

        if (productsError) {
            throw productsError;
        }

        const totalProductsElement =
            getElement("total-products");

        if (totalProductsElement) {

            totalProductsElement.textContent =
                count || 0;

        }

    }

    catch (error) {

        console.error(
            "Statistics error:",
            error
        );

    }

}


// ==========================================
// GET PRODUCT IMAGES
// ==========================================

function getProductImages(imageValue) {

    if (!imageValue) {
        return [];
    }

    // New multiple-image format
    try {

        const parsed =
            JSON.parse(imageValue);

        if (Array.isArray(parsed)) {

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

        // Existing single image
        // is not JSON.

    }

    // Existing products
    return [
        String(imageValue)
    ];

}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    const table =
        getElement("products-table");

    if (!table) {
        return;
    }

    table.innerHTML = `

        <tr>

            <td colspan="8">
                Loading products...
            </td>

        </tr>

    `;

    try {

        const {
            data: products,
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
            throw error;
        }

        if (
            !products ||
            products.length === 0
        ) {

            table.innerHTML = `

                <tr>

                    <td colspan="8">
                        No products found.
                    </td>

                </tr>

            `;

            return;

        }

        table.innerHTML = "";

        products.forEach(
            function(product) {

                const row =
                    document.createElement(
                        "tr"
                    );

                const images =
                    getProductImages(
                        product.image
                    );

                const mainImage =
                    images.length > 0
                        ? images[0]
                        : "";

                row.innerHTML = `

                    <td>
                        ${escapeHtml(product.id)}
                    </td>

                    <td>

                        ${
                            mainImage
                                ? `
                                    <img
                                        src="${escapeHtml(mainImage)}"
                                        alt="${escapeHtml(
                                            product.name ||
                                            "Product"
                                        )}"
                                        class="product-main-image"
                                        onerror="
                                            this.style.display='none'
                                        "
                                    >
                                  `
                                : "No image"
                        }

                        ${
                            images.length > 1
                                ? `
                                    <br>
                                    <small>
                                        ${images.length}
                                        images
                                    </small>
                                  `
                                : ""
                        }

                    </td>

                    <td>
                        ${escapeHtml(
                            product.name || ""
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.price
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            product.category || ""
                        )}
                    </td>

                    <td>
                        ${
                            Number(
                                product.quantity
                            ) || 0
                        }
                    </td>

                    <td>
                        ${escapeHtml(
                            product.description || ""
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            onclick="editProduct(${product.id})"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            type="button"
                            onclick="deleteProduct(${product.id})"
                        >
                            🗑️ Delete
                        </button>

                    </td>

                `;

                table.appendChild(row);

            }
        );

    }

    catch (error) {

        console.error(
            "Products error:",
            error
        );

        table.innerHTML = `

            <tr>

                <td colspan="8">

                    ❌ Could not load products.

                    <br><br>

                    ${escapeHtml(
                        error.message || ""
                    )}

                </td>

            </tr>

        `;

    }

}


// ==========================================
// IMAGE PREVIEW
// ==========================================

function setupImagePreview() {

    const imageInput =
        getElement("product-image");

    const preview =
        getElement("image-preview");

    if (
        !imageInput ||
        !preview
    ) {
        return;
    }

    imageInput.addEventListener(
        "change",
        function() {

            preview.innerHTML = "";

            const files =
                Array.from(
                    this.files || []
                );

            files.forEach(
                function(file) {

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {
                        return;
                    }

                    const imageURL =
                        URL.createObjectURL(
                            file
                        );

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.className =
                        "preview-item";

                    item.innerHTML = `

                        <img
                            src="${imageURL}"
                            alt="Preview"
                        >

                        <br>

                        <small>
                            ${escapeHtml(
                                file.name
                            )}
                        </small>

                    `;

                    preview.appendChild(
                        item
                    );

                }
            );

        }
    );

}


// ==========================================
// ADD PRODUCT
// ==========================================

async function addProduct(event) {

    event.preventDefault();

    const message =
        getElement("product-message");

    const name =
        getElement("product-name")
            ?.value.trim();

    const price =
        Number(
            getElement("product-price")
                ?.value
        );

    const category =
        getElement("product-category")
            ?.value.trim();

    const description =
        getElement("product-description")
            ?.value.trim();

    const quantity =
        Number(
            getElement("product-quantity")
                ?.value
        );

    const imageInput =
        getElement("product-image");

    const imageFiles =
        Array.from(
            imageInput?.files || []
        );


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
        !name ||
        !category ||
        !description ||
        Number.isNaN(price) ||
        Number.isNaN(quantity)
    ) {

        if (message) {

            message.textContent =
                "❌ Please complete all product fields.";

            message.style.color =
                "red";

        }

        return;

    }


    if (
        imageFiles.length === 0
    ) {

        if (message) {

            message.textContent =
                "❌ Please select at least one image.";

            message.style.color =
                "red";

        }

        return;

    }


    const addButton =
        getElement(
            "add-product-button"
        );


    try {

        if (addButton) {

            addButton.disabled =
                true;

            addButton.textContent =
                "⏳ Uploading...";

        }

        if (message) {

            message.textContent =
                "⏳ Uploading product images...";

            message.style.color =
                "blue";

        }


        const imageURLs = [];


        // ==========================================
        // UPLOAD ALL IMAGES
        // ==========================================

        for (
            let i = 0;
            i < imageFiles.length;
            i++
        ) {

            const imageFile =
                imageFiles[i];

            if (
                !imageFile.type.startsWith(
                    "image/"
                )
            ) {

                throw new Error(
                    `${imageFile.name} is not an image.`
                );

            }


            const extension =
                imageFile.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 10)}.${extension}`;


            const filePath =
                `products/${fileName}`;


            if (message) {

                message.textContent =
                    `⏳ Uploading image ${
                        i + 1
                    } of ${
                        imageFiles.length
                    }...`;

            }


            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("product-images")
                    .upload(
                        filePath,
                        imageFile,
                        {
                            cacheControl:
                                "3600",

                            contentType:
                                imageFile.type,

                            upsert:
                                false
                        }
                    );


            if (uploadError) {

                console.error(
                    "IMAGE UPLOAD ERROR:",
                    uploadError
                );

                throw uploadError;

            }


            const {
                data:
                    publicURLData
            } =
                supabaseClient
                    .storage
                    .from("product-images")
                    .getPublicUrl(
                        filePath
                    );


            const imageURL =
                publicURLData?.publicUrl;


            if (!imageURL) {

                throw new Error(
                    "Could not get image URL."
                );

            }


            imageURLs.push(
                imageURL
            );

        }


        // ==========================================
        // SAVE IMAGE URLS
        // ==========================================

        const imageValue =
            JSON.stringify(
                imageURLs
            );


        if (message) {

            message.textContent =
                "⏳ Saving product...";

        }


        const {
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
                            imageValue,

                        description:
                            description,

                        quantity:
                            quantity

                    }

                ]);


        if (error) {

            console.error(
                "PRODUCT SAVE ERROR:",
                error
            );

            throw error;

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        if (message) {

            message.textContent =
                `✅ Product added successfully with ${
                    imageURLs.length
                } image${
                    imageURLs.length === 1
                        ? ""
                        : "s"
                }.`;

            message.style.color =
                "green";

        }


        getElement(
            "add-product-form"
        )?.reset();


        const quantityInput =
            getElement(
                "product-quantity"
            );

        if (quantityInput) {

            quantityInput.value =
                "30";

        }


        const preview =
            getElement(
                "image-preview"
            );

        if (preview) {

            preview.innerHTML =
                "";

        }


        await loadProducts();

        await loadStatistics();

        await loadCategories();

    }

    catch (error) {

        console.error(
            "Add product error:",
            error
        );

        if (message) {

            message.textContent =
                "❌ " +
                (
                    error.message ||
                    "Could not add product."
                );

            message.style.color =
                "red";

        }

    }

    finally {

        if (addButton) {

            addButton.disabled =
                false;

            addButton.textContent =
                "➕ Add Product";

        }

    }

}


// ==========================================
// LOAD CATEGORIES
// ==========================================

async function loadCategories() {

    const select =
        getElement(
            "product-category"
        );

    if (!select) {
        return;
    }


    const defaultCategories = [

        "Electronics",

        "Phones & Accessories",

        "Computers",

        "Fashion",

        "Shoes",

        "Bags",

        "Beauty",

        "Home & Kitchen",

        "School",

        "Books",

        "Sports",

        "Other"

    ];


    let categories =
        [];


    try {

        const {
            data: products,
            error
        } =
            await supabaseClient
                .from("products")
                .select(
                    "category"
                );


        if (!error && products) {

            products.forEach(
                function(product) {

                    if (
                        product.category &&
                        product.category.trim()
                    ) {

                        categories.push(
                            product.category.trim()
                        );

                    }

                }
            );

        }

    }

    catch (error) {

        console.error(
            "Category loading error:",
            error
        );

    }


    // ==========================================
    // LOCAL CUSTOM CATEGORIES
    // ==========================================

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "hasbunallahu_categories"
                ) || "[]"
            );

        if (Array.isArray(saved)) {

            categories =
                categories.concat(
                    saved
                );

        }

    }

    catch (error) {

        console.error(
            "Saved categories error:",
            error
        );

    }


    categories =
        defaultCategories.concat(
            categories
        );


    categories =
        [...new Set(
            categories
                .map(
                    function(category) {
                        return category.trim();
                    }
                )
                .filter(Boolean)
        )];


    categories.sort(
        function(a, b) {

            return a.localeCompare(
                b
            );

        }
    );


    select.innerHTML = `

        <option value="">
            Select category
        </option>

    `;


    categories.forEach(
        function(category) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            select.appendChild(
                option
            );

        }
    );

}


// ==========================================
// ADD NEW CATEGORY
// ==========================================

function addNewCategory() {

    const category =
        prompt(
            "Enter the new category name:"
        );


    if (
        category === null
    ) {
        return;
    }


    const newCategory =
        category.trim();


    if (!newCategory) {

        alert(
            "Please enter a category name."
        );

        return;

    }


    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "hasbunallahu_categories"
                ) || "[]"
            );


        if (
            !saved.includes(
                newCategory
            )
        ) {

            saved.push(
                newCategory
            );

            localStorage.setItem(
                "hasbunallahu_categories",
                JSON.stringify(saved)
            );

        }

    }

    catch (error) {

        console.error(
            "Save category error:",
            error
        );

    }


    loadCategories()
        .then(
            function() {

                const select =
                    getElement(
                        "product-category"
                    );

                if (select) {

                    select.value =
                        newCategory;

                }

            }
        );

}


// ==========================================
// EDIT PRODUCT
// ==========================================

async function editProduct(
    productId
) {

    const newName =
        prompt(
            "Enter new product name:"
        );


    if (
        newName === null
    ) {
        return;
    }


    const newPrice =
        prompt(
            "Enter new price:"
        );


    if (
        newPrice === null
    ) {
        return;
    }


    const newQuantity =
        prompt(
            "Enter new quantity:"
        );


    if (
        newQuantity === null
    ) {
        return;
    }


    const price =
        Number(
            newPrice
        );

    const quantity =
        Number(
            newQuantity
        );


    if (
        Number.isNaN(price) ||
        Number.isNaN(quantity)
    ) {

        alert(
            "Invalid price or quantity."
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

                    name:
                        newName.trim(),

                    price:
                        price,

                    quantity:
                        quantity

                })
                .eq(
                    "id",
                    productId
                );


        if (error) {
            throw error;
        }


        alert(
            "✅ Product updated successfully."
        );


        await loadProducts();

        await loadStatistics();

    }

    catch (error) {

        console.error(
            "Edit product error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Could not update product."
            )
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


    if (!confirmed) {
        return;
    }


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
            throw error;
        }


        alert(
            "✅ Product deleted successfully."
        );


        await loadProducts();

        await loadStatistics();

    }

    catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Could not delete product."
            )
        );

    }

}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const table =
        getElement(
            "orders-table"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

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
            throw error;
        }


        if (
            !orders ||
            orders.length === 0
        ) {

            table.innerHTML = `

                <tr>

                    <td colspan="9">
                        No orders found.
                    </td>

                </tr>

            `;

            return;

        }


        table.innerHTML = "";


        orders.forEach(
            function(order) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            order.order_number || ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.customer_name || ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.customer_email || ""
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.phone || ""
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            order.total
                        )}
                    </td>

                    <td>

                        <select
                            data-order-id="${order.id}"
                            class="order-status"
                        >

                            ${createStatusOptions(
                                order.status
                            )}

                        </select>

                    </td>

                    <td>

                        <input
                            type="text"
                            value="${escapeHtml(
                                order.tracking_number || ""
                            )}"
                            placeholder="Tracking number"
                            class="tracking-input"
                            data-order-id="${order.id}"
                        >

                        <button
                            type="button"
                            onclick="generateTracking(${order.id})"
                        >
                            Generate
                        </button>

                    </td>

                    <td>

                        <input
                            type="text"
                            value="${escapeHtml(
                                order.delivery_note || ""
                            )}"
                            placeholder="Delivery note"
                            class="delivery-note-input"
                            data-order-id="${order.id}"
                        >

                    </td>

                    <td>

                        <button
                            type="button"
                            onclick="saveOrderUpdate(${order.id})"
                        >
                            💾 Save
                        </button>

                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Orders error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="9">

                    ❌ Could not load orders.

                    <br><br>

                    ${escapeHtml(
                        error.message || ""
                    )}

                </td>

            </tr>

        `;

    }

}


// ==========================================
// STATUS OPTIONS
// ==========================================

function createStatusOptions(
    currentStatus
) {

    const statuses = [

        "Pending Payment",

        "Paid",

        "Processing",

        "Shipped",

        "Out for Delivery",

        "Delivered",

        "Cancelled"

    ];


    return statuses
        .map(
            function(status) {

                return `

                    <option
                        value="${escapeHtml(status)}"
                        ${
                            status ===
                            currentStatus
                                ? "selected"
                                : ""
                        }
                    >
                        ${escapeHtml(status)}
                    </option>

                `;

            }
        )
        .join("");

}


// ==========================================
// GENERATE TRACKING NUMBER
// ==========================================

function generateTrackingNumber() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    const random =
        Math.floor(
            100000 +
            Math.random() *
            900000
        );


    return (
        "HST-" +
        year +
        month +
        day +
        "-" +
        random
    );

}


// ==========================================
// GENERATE TRACKING
// ==========================================

async function generateTracking(
    orderId
) {

    const input =
        document.querySelector(
            `.tracking-input[data-order-id="${orderId}"]`
        );


    if (!input) {
        return;
    }


    const trackingNumber =
        generateTrackingNumber();


    input.value =
        trackingNumber;


    try {

        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .update({

                    tracking_number:
                        trackingNumber

                })
                .eq(
                    "id",
                    orderId
                );


        if (error) {
            throw error;
        }


        alert(
            "✅ Tracking number generated:\n\n" +
            trackingNumber
        );

    }

    catch (error) {

        console.error(
            "Tracking error:",
            error
        );


        alert(
            "❌ Could not save tracking number."
        );

    }

}


// ==========================================
// SAVE ORDER UPDATE
// ==========================================

async function saveOrderUpdate(
    orderId
) {

    const statusInput =
        document.querySelector(
            `.order-status[data-order-id="${orderId}"]`
        );


    const trackingInput =
        document.querySelector(
            `.tracking-input[data-order-id="${orderId}"]`
        );


    const deliveryInput =
        document.querySelector(
            `.delivery-note-input[data-order-id="${orderId}"]`
        );


    if (!statusInput) {

        alert(
            "Order status field not found."
        );

        return;

    }


    const status =
        statusInput.value;


    const trackingNumber =
        trackingInput
            ? trackingInput.value.trim()
            : "";


    const deliveryNote =
        deliveryInput
            ? deliveryInput.value.trim()
            : "";


    try {

        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .update({

                    status:
                        status,

                    tracking_number:
                        trackingNumber,

                    delivery_note:
                        deliveryNote

                })
                .eq(
                    "id",
                    orderId
                );


        if (error) {
            throw error;
        }


        alert(
            "✅ Order updated successfully."
        );


        await loadOrders();

    }

    catch (error) {

        console.error(
            "Order update error:",
            error
        );


        alert(
            "❌ Could not update order:\n\n" +
            (
                error.message ||
                "Unknown error"
            )
        );

    }

}


// ==========================================
// INITIALIZE ADMIN
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "ADMIN JS VERSION 3 LOADED"
        );


        // ==========================================
        // IMAGE PREVIEW
        // ==========================================

        setupImagePreview();


        // ==========================================
        // LOGIN FORM
        // ==========================================

        const loginForm =
            getElement(
                "admin-login-form"
            );


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                adminLogin
            );

        }


        // ==========================================
        // LOGOUT
        // ==========================================

        const logoutButton =
            getElement(
                "admin-logout"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                adminLogout
            );

        }


        // ==========================================
        // ADD PRODUCT
        // ==========================================

        const productForm =
            getElement(
                "add-product-form"
            );


        if (productForm) {

            productForm.addEventListener(
                "submit",
                addProduct
            );

        }


        // ==========================================
        // ADD CATEGORY
        // ==========================================

        const addCategoryButton =
            getElement(
                "add-category-button"
            );


        if (addCategoryButton) {

            addCategoryButton.addEventListener(
                "click",
                addNewCategory
            );

        }


        // ==========================================
        // CHECK SESSION
        // ==========================================

        checkAdminSession();


        console.log(
            "Hasbunallahu Store Admin loaded."
        );

    }
);