// ==========================================================
// HASBUNALLAHU STORE
// ADMIN DASHBOARD
// COMPLETE ADMIN.JS
// ==========================================================

const ADMIN_EMAIL = "kabirabdulazeez45@gmail.com";

let currentAdmin = null;


// ==========================================================
// SUPABASE CHECK
// ==========================================================

if (typeof supabaseClient === "undefined") {
    console.error("Supabase client is not available.");
}


// ==========================================================
// ELEMENT HELPER
// ==========================================================

function getElement(id) {
    return document.getElementById(id);
}


// ==========================================================
// MONEY
// ==========================================================

function formatMoney(amount) {
    return "₦" +
        Number(amount || 0).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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
// PARSE MEDIA
// ==========================================================

function parseMedia(value) {

    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    let current = value;

    // Handle values that may have been JSON encoded more than once.
    for (let i = 0; i < 3; i++) {

        if (typeof current !== "string") {
            break;
        }

        const trimmed = current.trim();

        if (!trimmed) {
            return [];
        }

        try {

            const parsed = JSON.parse(trimmed);

            if (Array.isArray(parsed)) {
                return parsed.filter(
                    item =>
                        typeof item === "string" &&
                        item.trim() !== ""
                );
            }

            if (typeof parsed === "string") {
                current = parsed;
                continue;
            }

        } catch (error) {
            break;
        }
    }

    if (typeof current === "string") {

        let cleaned = current.trim();

        if (
            cleaned.startsWith("[") &&
            cleaned.endsWith("]")
        ) {
            try {
                const parsed = JSON.parse(cleaned);

                if (Array.isArray(parsed)) {
                    return parsed.filter(Boolean);
                }
            } catch (error) {}
        }

        if (cleaned) {
            return [cleaned];
        }
    }

    return [];
}


// ==========================================================
// LOGIN MESSAGE
// ==========================================================

function showLoginMessage(message, success = false) {

    const element = getElement("login-message");

    if (!element) {
        return;
    }

    element.textContent = message;

    element.style.color =
        success ? "green" : "red";
}


// ==========================================================
// SHOW DASHBOARD
// ==========================================================

function showDashboard() {

    const login = getElement("admin-login");
    const dashboard = getElement("admin-dashboard");

    if (login) {
        login.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "block";
    }
}


// ==========================================================
// SHOW LOGIN
// ==========================================================

function showLogin() {

    const login = getElement("admin-login");
    const dashboard = getElement("admin-dashboard");

    if (login) {
        login.style.display = "block";
    }

    if (dashboard) {
        dashboard.style.display = "none";
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
        } = await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        const session = data?.session;

        if (!session) {
            showLogin();
            return;
        }

        const user = session.user;

        if (!user?.email) {

            await supabaseClient.auth.signOut();

            showLogin();

            return;
        }

        if (
            user.email.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await supabaseClient.auth.signOut();

            showLogin();

            showLoginMessage(
                "❌ You are not authorized to access the admin dashboard."
            );

            return;
        }

        currentAdmin = user;

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
        getElement("admin-email")?.value
            .trim()
            .toLowerCase();

    const password =
        getElement("admin-password")?.value;

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

    const button = event.submitter;

    if (button) {
        button.disabled = true;
        button.textContent = "Logging in...";
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        if (!data?.user) {
            throw new Error("No user returned.");
        }

        currentAdmin = data.user;

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
            button.disabled = false;
            button.textContent = "Login";
        }
    }
}


// ==========================================================
// LOGOUT
// ==========================================================

async function adminLogout() {

    try {
        await supabaseClient.auth.signOut();
    } catch (error) {
        console.error(error);
    }

    currentAdmin = null;

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

        const orderList = orders || [];

        let totalSales = 0;

        const customers = new Set();

        orderList.forEach(order => {

            totalSales +=
                Number(order.total) || 0;

            if (order.customer_email) {

                customers.add(
                    String(order.customer_email)
                        .toLowerCase()
                );
            }
        });

        const totalOrders =
            getElement("total-orders");

        const totalSalesElement =
            getElement("total-sales");

        const totalCustomers =
            getElement("total-customers");

        if (totalOrders) {
            totalOrders.textContent =
                orderList.length;
        }

        if (totalSalesElement) {
            totalSalesElement.textContent =
                formatMoney(totalSales);
        }

        if (totalCustomers) {
            totalCustomers.textContent =
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
                        count: "exact",
                        head: true
                    }
                );

        if (productError) {
            throw productError;
        }

        const totalProducts =
            getElement("total-products");

        if (totalProducts) {
            totalProducts.textContent =
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
// IMAGE PREVIEW
// ==========================================================

function setupImagePreview() {

    const input =
        getElement("product-image");

    const preview =
        getElement("image-preview");

    if (!input || !preview) {
        return;
    }

    input.addEventListener(
        "change",
        function () {

            preview.innerHTML = "";

            const files =
                Array.from(this.files || []);

            files.forEach(file => {

                if (
                    !file.type.startsWith("image/")
                ) {
                    return;
                }

                const url =
                    URL.createObjectURL(file);

                const div =
                    document.createElement("div");

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

                preview.appendChild(div);
            });
        }
    );
}


// ==========================================================
// VIDEO PREVIEW
// ==========================================================

function setupVideoPreview() {

    const input =
        getElement("product-video");

    const preview =
        getElement("video-preview");

    if (!input || !preview) {
        return;
    }

    input.addEventListener(
        "change",
        function () {

            preview.innerHTML = "";

            const files =
                Array.from(this.files || []);

            files.forEach(file => {

                if (
                    !file.type.startsWith("video/")
                ) {
                    return;
                }

                const url =
                    URL.createObjectURL(file);

                const div =
                    document.createElement("div");

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

                preview.appendChild(div);
            });
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
                    cacheControl: "3600",
                    contentType: file.type,
                    upsert: false
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
            .getPublicUrl(filePath);

    if (!data?.publicUrl) {
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
        getElement("product-message");

    const name =
        getElement("product-name")
            ?.value
            .trim();

    const price =
        Number(
            getElement("product-price")
                ?.value
        );

    const category =
        getElement("product-category")
            ?.value
            .trim();

    const description =
        getElement("product-description")
            ?.value
            .trim();

    const quantity =
        Number(
            getElement("product-quantity")
                ?.value
        );

    const imageFiles =
        Array.from(
            getElement("product-image")
                ?.files || []
        );

    const videoFiles =
        Array.from(
            getElement("product-video")
                ?.files || []
        );


    if (
        !name ||
        !category ||
        !description ||
        Number.isNaN(price) ||
        Number.isNaN(quantity)
    ) {

        message.textContent =
            "❌ Please complete all product fields.";

        message.style.color = "red";

        return;
    }


    if (imageFiles.length === 0) {

        message.textContent =
            "❌ Please select at least one image.";

        message.style.color = "red";

        return;
    }


    const button =
        getElement("add-product-button");

    try {

        button.disabled = true;

        const imageURLs = [];

        for (
            let i = 0;
            i < imageFiles.length;
            i++
        ) {

            message.textContent =
                `⏳ Uploading image ${i + 1} of ${imageFiles.length}...`;

            const url =
                await uploadFile(
                    "product-images",
                    "products",
                    imageFiles[i]
                );

            imageURLs.push(url);
        }


        const videoURLs = [];

        for (
            let i = 0;
            i < videoFiles.length;
            i++
        ) {

            message.textContent =
                `⏳ Uploading video ${i + 1} of ${videoFiles.length}...`;

            const url =
                await uploadFile(
                    "product-videos",
                    "products",
                    videoFiles[i]
                );

            videoURLs.push(url);
        }


        message.textContent =
            "⏳ Saving product...";


        const {
            error
        } =
            await supabaseClient
                .from("products")
                .insert([{
                    name: name,
                    price: price,
                    category: category,
                    image: JSON.stringify(imageURLs),
                    videos: JSON.stringify(videoURLs),
                    description: description,
                    quantity: quantity
                }]);


        if (error) {
            throw error;
        }


        message.textContent =
            `✅ Product added successfully.
Images: ${imageURLs.length}
Videos: ${videoURLs.length}`;

        message.style.color = "green";


        const form =
            getElement("add-product-form");

        if (form) {
            form.reset();
        }


        const imagePreview =
            getElement("image-preview");

        const videoPreview =
            getElement("video-preview");

        if (imagePreview) {
            imagePreview.innerHTML = "";
        }

        if (videoPreview) {
            videoPreview.innerHTML = "";
        }


        const quantityInput =
            getElement("product-quantity");

        if (quantityInput) {
            quantityInput.value = "30";
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

        message.textContent =
            "❌ " +
            (
                error.message ||
                "Could not add product."
            );

        message.style.color = "red";

    }

    finally {

        if (button) {
            button.disabled = false;
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
        getElement("products-table");

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
                    <td colspan="9">
                        No products found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML = "";


        products.forEach(product => {

            const images =
                parseMedia(product.image);

            const videos =
                parseMedia(product.videos);

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(product.id)}
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
                    ${escapeHtml(product.name)}
                </td>

                <td>
                    ${formatMoney(product.price)}
                </td>

                <td>
                    ${escapeHtml(product.category)}
                </td>

                <td>
                    ${Number(product.quantity) || 0}
                </td>

                <td>
                    ${escapeHtml(product.description)}
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

            table.appendChild(row);
        });

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
                    ${escapeHtml(error.message)}
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
        getElement("product-category");

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
        [...defaultCategories];


    try {

        const {
            data
        } =
            await supabaseClient
                .from("products")
                .select("category");


        (data || []).forEach(product => {

            if (product.category) {

                categories.push(
                    product.category.trim()
                );
            }
        });

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
            categories.concat(saved);

    }

    catch (error) {}


    categories =
        [
            ...new Set(
                categories.filter(Boolean)
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


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        select.appendChild(option);
    });
}


// ==========================================================
// ADD CATEGORY
// ==========================================================

function addNewCategory() {

    const category =
        prompt(
            "Enter the new category name:"
        );

    if (category === null) {
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


    let saved = [];

    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    "hasbunallahu_categories"
                ) || "[]"
            );

    }

    catch (error) {
        saved = [];
    }


    if (
        !saved.includes(newCategory)
    ) {

        saved.push(newCategory);

        localStorage.setItem(
            "hasbunallahu_categories",
            JSON.stringify(saved)
        );
    }


    loadCategories().then(() => {

        const select =
            getElement("product-category");

        if (select) {
            select.value =
                newCategory;
        }
    });
}


// ==========================================================
// EDIT PRODUCT
// ==========================================================

async function editProduct(productId) {

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

        if (name === null) {
            return;
        }


        const priceInput =
            prompt(
                "Price:",
                product.price ?? ""
            );

        if (priceInput === null) {
            return;
        }


        const category =
            prompt(
                "Category:",
                product.category || ""
            );

        if (category === null) {
            return;
        }


        const quantityInput =
            prompt(
                "Quantity / Stock:",
                product.quantity ?? 0
            );

        if (quantityInput === null) {
            return;
        }


        const description =
            prompt(
                "Description:",
                product.description || ""
            );

        if (description === null) {
            return;
        }


        const price =
            Number(priceInput);

        const quantity =
            Number(quantityInput);


        if (
            !name.trim() ||
            !category.trim() ||
            Number.isNaN(price) ||
            Number.isNaN(quantity)
        ) {

            alert(
                "❌ Invalid product information."
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
            "❌ Could not update product.\n\n" +
            error.message
        );
    }
}


// ==========================================================
// DELETE PRODUCT
// ==========================================================

async function deleteProduct(productId) {

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
            error.message
        );
    }
}


// ==========================================================
// ORDER STATUS OPTIONS
// ==========================================================

function createStatusOptions(currentStatus) {

    const statuses = [
        "Pending Payment",
        "Paid",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
    ];


    const current =
        String(currentStatus || "")
            .trim()
            .toLowerCase();


    return statuses.map(status => {

        const selected =
            status.toLowerCase() === current
                ? "selected"
                : "";

        return `
            <option
                value="${escapeHtml(status)}"
                ${selected}
            >
                ${escapeHtml(status)}
            </option>
        `;
    }).join("");
}


// ==========================================================
// LOAD ORDERS
// ==========================================================

async function loadOrders() {

    const table =
        getElement("orders-table");

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

        /*
         * IMPORTANT:
         *
         * We only READ the orders here.
         *
         * Nothing in this function changes
         * order.status.
         */

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


        orders.forEach(order => {

            const row =
                document.createElement("tr");


            const orderId =
                Number(order.id);


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        order.order_number || order.id
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
                        class="order-status"
                        data-order-id="${orderId}"
                    >
                        ${createStatusOptions(
                            order.status
                        )}
                    </select>

                </td>

                <td>

                    <input
                        type="text"
                        class="tracking-input"
                        data-order-id="${orderId}"
                        value="${escapeHtml(
                            order.tracking_number || ""
                        )}"
                        placeholder="Tracking number"
                    >

                    <br><br>

                    <button
                        type="button"
                        onclick="generateTracking(${orderId})"
                    >
                        Generate
                    </button>

                </td>

                <td>

                    <input
                        type="text"
                        class="delivery-note-input"
                        data-order-id="${orderId}"
                        value="${escapeHtml(
                            order.delivery_note || ""
                        )}"
                        placeholder="Delivery note"
                    >

                </td>

                <td>

                    <button
                        type="button"
                        onclick="saveOrderUpdate(${orderId})"
                    >
                        💾 Save
                    </button>

                </td>

            `;


            table.appendChild(row);
        });

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

    const now = new Date();

    const date =
        now.getFullYear() +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        String(
            now.getDate()
        ).padStart(2, "0");


    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
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

async function generateTracking(orderId) {

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

        /*
         * No .single()
         * No .select()
         */

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
            "Tracking error:",
            error
        );


        alert(
            "❌ Could not save tracking number.\n\n" +
            error.message
        );
    }
}


// ==========================================================
// SAVE ORDER UPDATE
// ==========================================================

async function saveOrderUpdate(orderId) {

    console.log(
        "SAVE ORDER CLICKED:",
        orderId
    );


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
        statusElement.value.trim();


    const tracking =
        trackingElement
            ? trackingElement.value.trim()
            : "";


    const note =
        noteElement
            ? noteElement.value.trim()
            : "";


    console.log(
        "ORDER UPDATE REQUEST:",
        {
            id: orderId,
            status: status,
            tracking: tracking,
            note: note
        }
    );


    if (!status) {

        alert(
            "❌ Please select an order status."
        );

        return;
    }


    try {

        /*
         * IMPORTANT:
         *
         * This is the ONLY place in this admin.js
         * where order.status is updated.
         *
         * There is NO hardcoded "Paid" here.
         */

        const {
            error: updateError
        } =
            await supabaseClient
                .from("orders")
                .update({

                    status: status,

                    tracking_number:
                        tracking || null,

                    delivery_note:
                        note || null

                })
                .eq(
                    "id",
                    orderId
                );


        if (updateError) {

            console.error(
                "Supabase order update error:",
                updateError
            );

            throw updateError;
        }


        /*
         * VERIFY THE DATABASE.
         *
         * We read the order again after updating it.
         * This confirms whether Supabase actually saved
         * the selected status.
         */

        const {
            data: savedOrder,
            error: verifyError
        } =
            await supabaseClient
                .from("orders")
                .select(
                    "id,order_number,status,tracking_number,delivery_note"
                )
                .eq(
                    "id",
                    orderId
                )
                .maybeSingle();


        if (verifyError) {

            console.error(
                "Verification error:",
                verifyError
            );

            throw verifyError;
        }


        if (!savedOrder) {

            throw new Error(
                "Order was updated but could not be found afterwards."
            );
        }


        console.log(
            "DATABASE STATUS AFTER SAVE:",
            savedOrder.status
        );


        /*
         * VERY IMPORTANT:
         *
         * If the database says something different from
         * what we selected, we report it instead of silently
         * changing it.
         */

        if (
            String(savedOrder.status || "")
                .trim()
                .toLowerCase() !==
            String(status)
                .trim()
                .toLowerCase()
        ) {

            alert(
                "⚠️ The database returned a different status.\n\n" +
                "Selected: " +
                status +
                "\n" +
                "Database: " +
                savedOrder.status
            );

            await loadOrders();

            return;
        }


        alert(
            "✅ Order status saved successfully.\n\n" +
            "Status: " +
            savedOrder.status
        );


        /*
         * Now reload from Supabase.
         *
         * It should display exactly what the database contains.
         */

        await loadOrders();

    }

    catch (error) {

        console.error(
            "Order update error:",
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
// LOAD ORDERS DEBUG HELPER
// ==========================================================

async function checkOrderStatus(orderId) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("orders")
                .select(
                    "id,order_number,status"
                )
                .eq(
                    "id",
                    orderId
                )
                .maybeSingle();


        if (error) {
            throw error;
        }


        console.log(
            "CURRENT DATABASE ORDER:",
            data
        );

        return data;

    }

    catch (error) {

        console.error(
            "Could not check order:",
            error
        );

        return null;
    }
}


// ==========================================================
// INITIALIZE
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "HASBUNALLAHU ADMIN JS - ORDER STATUS FIX VERSION"
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


        const logout =
            getElement(
                "admin-logout"
            );

        if (logout) {

            logout.addEventListener(
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