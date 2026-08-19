// ==========================================================
// HASBUNALLAHU STORE
// ADMIN DASHBOARD
// COMPLETE VERSION
// ==========================================================


// ==========================================================
// ADMIN SETTINGS
// ==========================================================

const ADMIN_EMAIL =
    "kabirabdulazeez45@gmail.com";

let currentAdmin = null;


// ==========================================================
// ELEMENT HELPER
// ==========================================================

function getElement(id) {

    return document.getElementById(id);

}


// ==========================================================
// FORMAT MONEY
// ==========================================================

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


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// LOGIN MESSAGE
// ==========================================================

function showLoginMessage(
    message,
    success = false
) {

    const element =
        getElement("login-message");

    if (!element) return;

    element.textContent =
        message;

    element.style.color =
        success ? "green" : "red";

}


// ==========================================================
// SHOW DASHBOARD
// ==========================================================

function showDashboard() {

    const login =
        getElement("admin-login");

    const dashboard =
        getElement("admin-dashboard");

    if (login) {

        login.style.display =
            "none";

    }

    if (dashboard) {

        dashboard.style.display =
            "block";

    }

}


// ==========================================================
// SHOW LOGIN
// ==========================================================

function showLogin() {

    const login =
        getElement("admin-login");

    const dashboard =
        getElement("admin-dashboard");

    if (login) {

        login.style.display =
            "block";

    }

    if (dashboard) {

        dashboard.style.display =
            "none";

    }

}


// ==========================================================
// CHECK ADMIN SESSION
// ==========================================================

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

            throw error;

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
            "Session error:",
            error
        );

        showLogin();

    }

}


// ==========================================================
// ADMIN LOGIN
// ==========================================================

async function adminLogin(event) {

    event.preventDefault();

    const email =
        getElement(
            "admin-email"
        )?.value
            .trim()
            .toLowerCase();

    const password =
        getElement(
            "admin-password"
        )?.value;

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

    const button =
        event.submitter;

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Logging in...";

    }

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

            throw error;

        }

        if (!data.user) {

            throw new Error(
                "No user returned."
            );

        }

        currentAdmin =
            data.user;

        showDashboard();

        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );

        showLoginMessage(
            "❌ Login failed: " +
            (
                error.message ||
                "Unknown error"
            )
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Login";

        }

    }

}


// ==========================================================
// LOGOUT
// ==========================================================

async function adminLogout() {

    try {

        await supabaseClient
            .auth
            .signOut();

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

    currentAdmin =
        null;

    showLogin();

}


// ==========================================================
// LOAD DASHBOARD
// ==========================================================

async function loadDashboard() {

    await Promise.all([

        loadStatistics(),

        loadProducts(),

        loadOrders(),

        loadCategories()

    ]);

}


// ==========================================================
// STATISTICS
// ==========================================================

async function loadStatistics() {

    try {

        const {
            data: orders,
            error
        } =
            await supabaseClient
                .from("orders")
                .select(
                    "id,total,customer_email"
                );

        if (error) {

            throw error;

        }

        const orderList =
            orders || [];

        let totalSales =
            0;

        const customers =
            new Set();

        orderList.forEach(
            order => {

                totalSales +=
                    Number(order.total) || 0;

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
            getElement(
                "total-orders"
            );

        const totalSalesElement =
            getElement(
                "total-sales"
            );

        const totalCustomersElement =
            getElement(
                "total-customers"
            );

        if (totalOrdersElement) {

            totalOrdersElement.textContent =
                orderList.length;

        }

        if (totalSalesElement) {

            totalSalesElement.textContent =
                formatMoney(
                    totalSales
                );

        }

        if (totalCustomersElement) {

            totalCustomersElement.textContent =
                customers.size;

        }


        const {
            count,
            error: productError
        } =
            await supabaseClient
                .from("products")
                .select(
                    "id",
                    {
                        count:
                            "exact",

                        head:
                            true
                    }
                );

        if (productError) {

            throw productError;

        }

        const totalProductsElement =
            getElement(
                "total-products"
            );

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


// ==========================================================
// PARSE MEDIA
// ==========================================================

function parseMedia(value) {

    if (!value) {

        return [];

    }

    if (Array.isArray(value)) {

        return value.filter(
            item =>
                typeof item === "string" &&
                item.trim() !== ""
        );

    }

    try {

        let parsed =
            JSON.parse(value);

        if (
            typeof parsed === "string"
        ) {

            try {

                parsed =
                    JSON.parse(parsed);

            }

            catch (error) {}

        }

        if (Array.isArray(parsed)) {

            return parsed.filter(
                item =>
                    typeof item === "string" &&
                    item.trim() !== ""
            );

        }

    }

    catch (error) {

        // Continue to old URL format

    }

    return [
        String(value)
    ];

}


// ==========================================================
// IMAGE PREVIEW
// ==========================================================

function setupImagePreview() {

    const input =
        getElement(
            "product-image"
        );

    const preview =
        getElement(
            "image-preview"
        );

    if (!input || !preview) {

        return;

    }

    input.addEventListener(
        "change",
        function() {

            preview.innerHTML =
                "";

            const files =
                Array.from(
                    this.files || []
                );

            files.forEach(
                file => {

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        return;

                    }

                    const url =
                        URL.createObjectURL(
                            file
                        );

                    const div =
                        document.createElement(
                            "div"
                        );

                    div.className =
                        "preview-item";

                    div.innerHTML = `

                        <img
                            src="${url}"
                            alt="Image preview"
                        >

                        <small>
                            ${escapeHtml(file.name)}
                        </small>

                    `;

                    preview.appendChild(
                        div
                    );

                }
            );

        }
    );

}


// ==========================================================
// VIDEO PREVIEW
// ==========================================================

function setupVideoPreview() {

    const input =
        getElement(
            "product-video"
        );

    const preview =
        getElement(
            "video-preview"
        );

    if (!input || !preview) {

        return;

    }

    input.addEventListener(
        "change",
        function() {

            preview.innerHTML =
                "";

            const files =
                Array.from(
                    this.files || []
                );

            files.forEach(
                file => {

                    if (
                        !file.type.startsWith(
                            "video/"
                        )
                    ) {

                        return;

                    }

                    const url =
                        URL.createObjectURL(
                            file
                        );

                    const div =
                        document.createElement(
                            "div"
                        );

                    div.className =
                        "preview-item";

                    div.innerHTML = `

                        <video
                            src="${url}"
                            controls
                            muted
                        ></video>

                        <small>
                            ${escapeHtml(file.name)}
                        </small>

                    `;

                    preview.appendChild(
                        div
                    );

                }
            );

        }
    );

}


// ==========================================================
// UPLOAD FILE
// ==========================================================

async function uploadFile(
    bucket,
    folder,
    file
) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const fileName =
        `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}.${extension}`;

    const filePath =
        `${folder}/${fileName}`;

    const {
        error
    } =
        await supabaseClient
            .storage
            .from(bucket)
            .upload(
                filePath,
                file,
                {

                    cacheControl:
                        "3600",

                    contentType:
                        file.type,

                    upsert:
                        false

                }
            );

    if (error) {

        throw error;

    }

    const {
        data
    } =
        supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(
                filePath
            );

    if (
        !data ||
        !data.publicUrl
    ) {

        throw new Error(
            "Could not create public URL."
        );

    }

    return data.publicUrl;

}


// ==========================================================
// ADD PRODUCT
// ==========================================================

async function addProduct(event) {

    event.preventDefault();

    const message =
        getElement(
            "product-message"
        );

    const name =
        getElement(
            "product-name"
        )?.value
            .trim();

    const price =
        Number(
            getElement(
                "product-price"
            )?.value
        );

    const category =
        getElement(
            "product-category"
        )?.value
            .trim();

    const description =
        getElement(
            "product-description"
        )?.value
            .trim();

    const quantity =
        Number(
            getElement(
                "product-quantity"
            )?.value
        );

    const imageFiles =
        Array.from(
            getElement(
                "product-image"
            )?.files || []
        );

    const videoFiles =
        Array.from(
            getElement(
                "product-video"
            )?.files || []
        );

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

    const button =
        getElement(
            "add-product-button"
        );

    try {

        if (button) {

            button.disabled =
                true;

        }

        const imageURLs =
            [];

        for (
            let i = 0;
            i < imageFiles.length;
            i++
        ) {

            if (message) {

                message.textContent =
                    `⏳ Uploading image ${i + 1} of ${imageFiles.length}...`;

                message.style.color =
                    "blue";

            }

            const url =
                await uploadFile(
                    "product-images",
                    "products",
                    imageFiles[i]
                );

            imageURLs.push(
                url
            );

        }

        const videoURLs =
            [];

        for (
            let i = 0;
            i < videoFiles.length;
            i++
        ) {

            if (message) {

                message.textContent =
                    `⏳ Uploading video ${i + 1} of ${videoFiles.length}...`;

                message.style.color =
                    "blue";

            }

            const url =
                await uploadFile(
                    "product-videos",
                    "products",
                    videoFiles[i]
                );

            videoURLs.push(
                url
            );

        }

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
                            JSON.stringify(
                                imageURLs
                            ),

                        videos:
                            JSON.stringify(
                                videoURLs
                            ),

                        description:
                            description,

                        quantity:
                            quantity

                    }

                ]);

        if (error) {

            throw error;

        }

        if (message) {

            message.textContent =
                `✅ Product added successfully!

Images: ${imageURLs.length}
Videos: ${videoURLs.length}`;

            message.style.color =
                "green";

        }

        getElement(
            "add-product-form"
        )?.reset();

        getElement(
            "image-preview"
        ).innerHTML =
            "";

        getElement(
            "video-preview"
        ).innerHTML =
            "";

        getElement(
            "product-quantity"
        ).value =
            "30";

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

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "➕ Add Product";

        }

    }

}


// ==========================================================
// LOAD PRODUCTS
// ==========================================================

async function loadProducts() {

    const table =
        getElement(
            "products-table"
        );

    if (!table) {

        return;

    }

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
                        ascending:
                            true
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

                    <td colspan="9">
                        No products found.
                    </td>

                </tr>

            `;

            return;

        }

        table.innerHTML =
            "";

        products.forEach(
            product => {

                const images =
                    parseMedia(
                        product.image
                    );

                const videos =
                    parseMedia(
                        product.videos
                    );

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            product.id
                        )}
                    </td>

                    <td>

                        ${
                            images[0]
                                ? `
                                    <img
                                        src="${escapeHtml(images[0])}"
                                        class="product-main-image"
                                        alt="Product"
                                    >
                                `
                                : "No image"
                        }

                        <div class="media-count">

                            ${images.length}
                            image${images.length === 1 ? "" : "s"}

                        </div>

                    </td>

                    <td>

                        ${
                            videos[0]
                                ? `
                                    <video
                                        src="${escapeHtml(videos[0])}"
                                        controls
                                        class="product-video-preview"
                                    ></video>
                                `
                                : "No video"
                        }

                        <div class="media-count">

                            ${videos.length}
                            video${videos.length === 1 ? "" : "s"}

                        </div>

                    </td>

                    <td>
                        ${escapeHtml(
                            product.name
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            product.price
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            product.category
                        )}
                    </td>

                    <td>
                        ${Number(
                            product.quantity
                        ) || 0}
                    </td>

                    <td>
                        ${escapeHtml(
                            product.description
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            onclick="editProduct(${Number(product.id)})"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            type="button"
                            onclick="deleteProduct(${Number(product.id)})"
                        >
                            🗑️ Delete
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
            "Products error:",
            error
        );

        table.innerHTML = `

            <tr>

                <td colspan="9">

                    ❌ Could not load products.

                    <br><br>

                    ${escapeHtml(
                        error.message
                    )}

                </td>

            </tr>

        `;

    }

}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

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
        [
            ...defaultCategories
        ];

    try {

        const {
            data
        } =
            await supabaseClient
                .from("products")
                .select(
                    "category"
                );

        (data || []).forEach(
            product => {

                if (
                    product.category
                ) {

                    categories.push(
                        product.category.trim()
                    );

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Category error:",
            error
        );

    }

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "hasbunallahu_categories"
                ) || "[]"
            );

        categories =
            categories.concat(
                saved
            );

    }

    catch (error) {

        // Ignore

    }

    categories =
        [
            ...new Set(
                categories.filter(
                    Boolean
                )
            )
        ];

    categories.sort(
        (a, b) =>
            a.localeCompare(b)
    );

    select.innerHTML = `

        <option value="">
            Select category
        </option>

    `;

    categories.forEach(
        category => {

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


// ==========================================================
// ADD CATEGORY
// ==========================================================

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
            "Please enter a category."
        );

        return;

    }

    let saved =
        [];

    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    "hasbunallahu_categories"
                ) || "[]"
            );

    }

    catch (error) {

        saved =
            [];

    }

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

    loadCategories()
        .then(
            () => {

                getElement(
                    "product-category"
                ).value =
                    newCategory;

            }
        );

}


// ==========================================================
// EDIT PRODUCT
// ==========================================================

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
                .select(
                    "id,name,price,category,quantity,description"
                )
                .eq(
                    "id",
                    productId
                )
                .maybeSingle();

        if (error) {

            throw error;

        }

        if (!product) {

            alert(
                "❌ Product not found."
            );

            return;

        }

        const name =
            prompt(
                "Product name:",
                product.name || ""
            );

        if (
            name === null
        ) {

            return;

        }

        const priceInput =
            prompt(
                "Price:",
                product.price || "0"
            );

        if (
            priceInput === null
        ) {

            return;

        }

        const category =
            prompt(
                "Category:",
                product.category || ""
            );

        if (
            category === null
        ) {

            return;

        }

        const quantityInput =
            prompt(
                "Quantity / Stock:",
                product.quantity ?? "0"
            );

        if (
            quantityInput === null
        ) {

            return;

        }

        const description =
            prompt(
                "Description:",
                product.description || ""
            );

        if (
            description === null
        ) {

            return;

        }

        const price =
            Number(
                priceInput
            );

        const quantity =
            Number(
                quantityInput
            );

        if (
            Number.isNaN(price) ||
            Number.isNaN(quantity)
        ) {

            alert(
                "❌ Price and quantity must be valid numbers."
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

                    quantity:
                        quantity,

                    description:
                        description.trim()

                })
                .eq(
                    "id",
                    productId
                );

        if (updateError) {

            throw updateError;

        }

        alert(
            "✅ Product updated successfully."
        );

        await loadProducts();

        await loadStatistics();

        await loadCategories();

    }

    catch (error) {

        console.error(
            "Edit product error:",
            error
        );

        alert(
            "❌ Could not edit product.\n\n" +
            (
                error.message ||
                "Unknown error"
            )
        );

    }

}


// ==========================================================
// DELETE PRODUCT
// ==========================================================

async function deleteProduct(
    productId
) {

    if (
        !confirm(
            "Are you sure you want to delete this product?"
        )
    ) {

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
            "❌ Could not delete product.\n\n" +
            (
                error.message ||
                "Unknown error"
            )
        );

    }

}


// ==========================================================
// ORDER STATUS MAPPING
// ==========================================================
//
// DATABASE VALUE        ADMIN DISPLAY
//
// pending               Pending Payment
// paid                  Paid
// processing            Processing
// shipping              Shipping
// shipping              Out for Delivery
// delivered             Delivered
// cancelled             Cancelled
//
// IMPORTANT:
// The database receives "shipping", NOT "Out for Delivery".
// ==========================================================

const ORDER_STATUSES = [

    {
        database:
            "pending",

        label:
            "Pending Payment"
    },

    {
        database:
            "paid",

        label:
            "Paid"
    },

    {
        database:
            "processing",

        label:
            "Processing"
    },

    {
        database:
            "shipping",

        label:
            "Shipping"
    },

    {
        database:
            "delivered",

        label:
            "Delivered"
    },

    {
        database:
            "cancelled",

        label:
            "Cancelled"
    }

];


// ==========================================================
// NORMALIZE DATABASE STATUS
// ==========================================================

function normalizeOrderStatus(
    status
) {

    const value =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();

    if (
        value ===
        "out for delivery"
    ) {

        return "shipping";

    }

    if (
        value ===
        "shipped"
    ) {

        return "shipping";

    }

    if (
        value ===
        "shipping"
    ) {

        return "shipping";

    }

    if (
        value ===
        "pending payment"
    ) {

        return "pending";

    }

    if (
        value ===
        "paid"
    ) {

        return "paid";

    }

    if (
        value ===
        "processing"
    ) {

        return "processing";

    }

    if (
        value ===
        "delivered"
    ) {

        return "delivered";

    }

    if (
        value ===
        "cancelled"
    ) {

        return "cancelled";

    }

    return value;

}


// ==========================================================
// CREATE STATUS OPTIONS
// ==========================================================

function createStatusOptions(
    currentStatus
) {

    const databaseStatus =
        normalizeOrderStatus(
            currentStatus
        );

    return ORDER_STATUSES
        .map(
            status => {

                return `

                    <option
                        value="${escapeHtml(status.database)}"
                        ${
                            status.database ===
                            databaseStatus
                                ? "selected"
                                : ""
                        }
                    >
                        ${escapeHtml(status.label)}
                    </option>

                `;

            }
        )
        .join("");

}


// ==========================================================
// GET STATUS LABEL
// ==========================================================

function getStatusLabel(
    databaseStatus
) {

    const normalized =
        normalizeOrderStatus(
            databaseStatus
        );

    const found =
        ORDER_STATUSES.find(
            status =>
                status.database ===
                normalized
        );

    return found
        ? found.label
        : databaseStatus || "";

}


// ==========================================================
// LOAD ORDERS
// ==========================================================

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
                        ascending:
                            false
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

        table.innerHTML =
            "";

        orders.forEach(
            order => {

                const row =
                    document.createElement(
                        "tr"
                    );

                const databaseStatus =
                    normalizeOrderStatus(
                        order.status
                    );

                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            order.order_number
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.customer_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.customer_email
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.phone
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            order.total
                        )}
                    </td>

                    <td>

                        <select
                            class="order-status"
                            data-order-id="${Number(order.id)}"
                        >

                            ${createStatusOptions(
                                databaseStatus
                            )}

                        </select>

                        <small
                            style="
                                display:block;
                                margin-top:5px;
                                color:#666;
                            "
                        >
                            Database:
                            ${escapeHtml(
                                databaseStatus
                            )}
                        </small>

                    </td>

                    <td>

                        <input
                            type="text"
                            class="tracking-input"
                            data-order-id="${Number(order.id)}"
                            value="${escapeHtml(
                                order.tracking_number || ""
                            )}"
                            placeholder="Tracking number"
                        >

                        <br><br>

                        <button
                            type="button"
                            onclick="generateTracking(${Number(order.id)})"
                        >
                            Generate
                        </button>

                    </td>

                    <td>

                        <input
                            type="text"
                            class="delivery-note-input"
                            data-order-id="${Number(order.id)}"
                            value="${escapeHtml(
                                order.delivery_note || ""
                            )}"
                            placeholder="Delivery note"
                        >

                    </td>

                    <td>

                        <button
                            type="button"
                            onclick="saveOrderUpdate(${Number(order.id)})"
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
                        error.message
                    )}

                </td>

            </tr>

        `;

    }

}


// ==========================================================
// GENERATE TRACKING NUMBER
// ==========================================================

function generateTrackingNumber() {

    const now =
        new Date();

    const date =
        now.getFullYear() +
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
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
        date +
        "-" +
        random
    );

}


// ==========================================================
// GENERATE AND SAVE TRACKING
// ==========================================================

async function generateTracking(
    orderId
) {

    const input =
        document.querySelector(
            `.tracking-input[data-order-id="${orderId}"]`
        );

    if (!input) {

        alert(
            "❌ Tracking input not found."
        );

        return;

    }

    const tracking =
        generateTrackingNumber();

    input.value =
        tracking;

    try {

        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .update({

                    tracking_number:
                        tracking

                })
                .eq(
                    "id",
                    orderId
                );

        if (error) {

            throw error;

        }

        alert(
            "✅ Tracking number saved:\n\n" +
            tracking
        );

        await loadOrders();

    }

    catch (error) {

        console.error(
            "Tracking update error:",
            error
        );

        alert(
            "❌ Could not save tracking number.\n\n" +
            (
                error.message ||
                "Unknown error"
            )
        );

    }

}


// ==========================================================
// SAVE ORDER UPDATE
// ==========================================================
//
// IMPORTANT:
//
// The SELECTED VALUE is already the database value.
//
// Example:
//
// Admin selects:
// "Shipping"
//
// JavaScript sends:
// "shipping"
//
// Database:
// shipping
//
// No .single()
// No .select()
// ==========================================================

async function saveOrderUpdate(
    orderId
) {

    const statusElement =
        document.querySelector(
            `.order-status[data-order-id="${orderId}"]`
        );

    const trackingElement =
        document.querySelector(
            `.tracking-input[data-order-id="${orderId}"]`
        );

    const noteElement =
        document.querySelector(
            `.delivery-note-input[data-order-id="${orderId}"]`
        );

    if (!statusElement) {

        alert(
            "❌ Could not find order status."
        );

        return;

    }

    const status =
        normalizeOrderStatus(
            statusElement.value
        );

    const tracking =
        trackingElement
            ? trackingElement.value.trim()
            : "";

    const note =
        noteElement
            ? noteElement.value.trim()
            : "";

    console.log(
        "ORDER UPDATE",
        {
            orderId:
                orderId,

            selectedStatus:
                statusElement.value,

            databaseStatus:
                status,

            tracking:
                tracking,

            note:
                note
        }
    );

    // Make sure the status is one of the allowed
    // database values.

    const validStatus =
        ORDER_STATUSES.some(
            item =>
                item.database ===
                status
        );

    if (!validStatus) {

        alert(
            "❌ Invalid order status:\n\n" +
            status
        );

        return;

    }

    try {

        console.log(
            "Saving to database:",
            {
                id:
                    orderId,

                status:
                    status,

                tracking_number:
                    tracking || null,

                delivery_note:
                    note || null
            }
        );

        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .update({

                    status:
                        status,

                    tracking_number:
                        tracking || null,

                    delivery_note:
                        note || null

                })
                .eq(
                    "id",
                    orderId
                );

        if (error) {

            console.error(
                "Supabase order update error:",
                error
            );

            throw error;

        }

        console.log(
            "Order update successful."
        );

        alert(
            "✅ Order updated successfully.\n\n" +
            "Status saved as: " +
            status
        );

        await loadOrders();

    }

    catch (error) {

        console.error(
            "SAVE ORDER ERROR:",
            error
        );

        alert(
            "❌ Could not update order.\n\n" +
            (
                error.message ||
                "Unknown error"
            )
        );

    }

}


// ==========================================================
// INITIALIZE ADMIN
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "HASBUNALLAHU STORE ADMIN JS - STATUS MAPPING VERSION"
        );

        setupImagePreview();

        setupVideoPreview();

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

        const categoryButton =
            getElement(
                "add-category-button"
            );

        if (categoryButton) {

            categoryButton.addEventListener(
                "click",
                addNewCategory
            );

        }

        checkAdminSession();

    }
);