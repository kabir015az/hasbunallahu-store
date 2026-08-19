// ==========================================
// HASBUNALLAHU STORE
// ADMIN DASHBOARD
// MULTIPLE IMAGES + MULTIPLE VIDEOS
// FULL PRODUCT EDITING
// ==========================================


const ADMIN_EMAIL =
    "kabirabdulazeez45@gmail.com";


let currentAdmin = null;

let editingProduct = null;


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
// PARSE MEDIA
// Handles:
// ["url1","url2"]
// "[\"url1\",\"url2\"]"
// ["url"]
// single URL
// ==========================================

function parseMedia(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return [];
    }


    // Already an array

    if (Array.isArray(value)) {

        return value
            .flat(Infinity)
            .filter(
                item =>
                    typeof item === "string" &&
                    item.trim() !== ""
            );

    }


    let current =
        value;


    // Try multiple levels because
    // some existing rows are double encoded.

    for (
        let attempt = 0;
        attempt < 4;
        attempt++
    ) {

        if (Array.isArray(current)) {

            return current
                .flat(Infinity)
                .filter(
                    item =>
                        typeof item === "string" &&
                        item.trim() !== ""
                );

        }


        if (
            typeof current !== "string"
        ) {
            break;
        }


        const text =
            current.trim();


        if (!text) {
            return [];
        }


        try {

            const parsed =
                JSON.parse(text);

            current =
                parsed;

        }

        catch (error) {

            // If it looks like a plain URL,
            // use it directly.

            if (
                text.startsWith("http://") ||
                text.startsWith("https://")
            ) {

                return [text];

            }

            break;

        }

    }


    if (Array.isArray(current)) {

        return current
            .flat(Infinity)
            .filter(
                item =>
                    typeof item === "string" &&
                    item.trim() !== ""
            );

    }


    if (
        typeof current === "string" &&
        current.trim()
    ) {

        return [current.trim()];

    }


    return [];

}



// ==========================================
// LOGIN MESSAGE
// ==========================================

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
// CHECK SESSION
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



// ==========================================
// ADMIN LOGIN
// ==========================================

async function adminLogin(event) {

    event.preventDefault();

    const email =
        getElement("admin-email")
            ?.value
            .trim()
            .toLowerCase();

    const password =
        getElement("admin-password")
            ?.value;

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

        button.disabled = true;

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

            button.disabled = false;

            button.textContent =
                "Login";

        }

    }

}



// ==========================================
// LOGOUT
// ==========================================

async function adminLogout() {

    await supabaseClient
        .auth
        .signOut();

    currentAdmin =
        null;

    showLogin();

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
// STATISTICS
// ==========================================

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

        let totalSales = 0;

        const customers =
            new Set();

        orderList.forEach(
            order => {

                totalSales +=
                    Number(order.total) || 0;

                if (order.customer_email) {

                    customers.add(
                        order.customer_email
                            .toLowerCase()
                    );

                }

            }
        );

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



// ==========================================
// IMAGE PREVIEW - ADD PRODUCT
// ==========================================

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
        function() {

            preview.innerHTML = "";

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



// ==========================================
// VIDEO PREVIEW - ADD PRODUCT
// ==========================================

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
        function() {

            preview.innerHTML = "";

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



// ==========================================
// EDIT IMAGE PREVIEW
// ==========================================

function setupEditImagePreview() {

    const input =
        getElement(
            "edit-product-images"
        );

    const preview =
        getElement(
            "edit-image-preview"
        );

    if (!input || !preview) {
        return;
    }

    input.addEventListener(
        "change",
        function() {

            preview.innerHTML = "";

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
                            alt="New image"
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



// ==========================================
// EDIT VIDEO PREVIEW
// ==========================================

function setupEditVideoPreview() {

    const input =
        getElement(
            "edit-product-videos"
        );

    const preview =
        getElement(
            "edit-video-preview"
        );

    if (!input || !preview) {
        return;
    }

    input.addEventListener(
        "change",
        function() {

            preview.innerHTML = "";

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



// ==========================================
// UPLOAD FILE
// ==========================================

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


    if (!data?.publicUrl) {

        throw new Error(
            "Could not create public URL."
        );

    }


    return data.publicUrl;

}



// ==========================================
// ADD PRODUCT
// ==========================================

async function addProduct(event) {

    event.preventDefault();

    const message =
        getElement(
            "product-message"
        );

    const name =
        getElement(
            "product-name"
        ).value.trim();

    const price =
        Number(
            getElement(
                "product-price"
            ).value
        );

    const category =
        getElement(
            "product-category"
        ).value.trim();

    const description =
        getElement(
            "product-description"
        ).value.trim();

    const quantity =
        Number(
            getElement(
                "product-quantity"
            ).value
        );


    const imageFiles =
        Array.from(
            getElement(
                "product-image"
            ).files || []
        );


    const videoFiles =
        Array.from(
            getElement(
                "product-video"
            ).files || []
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

        message.style.color =
            "red";

        return;

    }


    if (
        imageFiles.length === 0
    ) {

        message.textContent =
            "❌ Please select at least one image.";

        message.style.color =
            "red";

        return;

    }


    const button =
        getElement(
            "add-product-button"
        );


    try {

        button.disabled =
            true;


        button.textContent =
            "Adding...";


        const imageURLs = [];


        for (
            let i = 0;
            i < imageFiles.length;
            i++
        ) {

            message.textContent =
                `⏳ Uploading image ${i + 1} of ${imageFiles.length}...`;

            message.style.color =
                "blue";


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


            videoURLs.push(
                url
            );

        }


        message.textContent =
            "⏳ Saving product...";


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


        message.textContent =
            `✅ Product added successfully!

Images: ${imageURLs.length}
Videos: ${videoURLs.length}`;

        message.style.color =
            "green";


        getElement(
            "add-product-form"
        ).reset();


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

        message.textContent =
            "❌ " +
            (
                error.message ||
                "Could not add product."
            );

        message.style.color =
            "red";

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "➕ Add Product";

    }

}



// ==========================================
// LOAD PRODUCTS
// ==========================================

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
                                        onerror="this.style.display='none'"
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
                            onclick="editProduct(${product.id})"
                        >
                            ✏️ Edit
                        </button>

                        <br><br>

                        <button
                            type="button"
                            onclick="deleteProduct(${product.id})"
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



// ==========================================
// LOAD CATEGORIES
// ==========================================

async function loadCategories() {

    const selects = [

        getElement(
            "product-category"
        ),

        getElement(
            "edit-product-category"
        )

    ].filter(Boolean);


    if (
        selects.length === 0
    ) {
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


    selects.forEach(
        select => {

            const currentValue =
                select.value;


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


            if (currentValue) {

                select.value =
                    currentValue;

            }

        }
    );

}



// ==========================================
// ADD CATEGORY
// ==========================================

function addNewCategory(
    target = "product-category"
) {

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

                const select =
                    getElement(target);

                if (select) {

                    select.value =
                        newCategory;

                }

            }
        );

}



// ==========================================
// OPEN EDIT PRODUCT
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
            throw error;
        }


        if (!product) {

            alert(
                "❌ Product not found."
            );

            return;

        }


        editingProduct =
            product;


        // ==========================================
        // BASIC DETAILS
        // ==========================================

        getElement(
            "edit-product-id"
        ).value =
            product.id;


        getElement(
            "edit-product-name"
        ).value =
            product.name || "";


        getElement(
            "edit-product-price"
        ).value =
            Number(
                product.price
            ) || 0;


        getElement(
            "edit-product-quantity"
        ).value =
            Number(
                product.quantity
            ) || 0;


        getElement(
            "edit-product-description"
        ).value =
            product.description || "";


        // ==========================================
        // CATEGORY
        // ==========================================

        await loadCategories();


        const categorySelect =
            getElement(
                "edit-product-category"
            );


        categorySelect.value =
            product.category || "";


        // ==========================================
        // MEDIA
        // ==========================================

        const images =
            parseMedia(
                product.image
            );


        const videos =
            parseMedia(
                product.videos
            );


        renderExistingImages(
            images
        );


        renderExistingVideos(
            videos
        );


        // Clear new file selections

        const imageInput =
            getElement(
                "edit-product-images"
            );

        const videoInput =
            getElement(
                "edit-product-videos"
            );


        if (imageInput) {
            imageInput.value = "";
        }

        if (videoInput) {
            videoInput.value = "";
        }


        getElement(
            "edit-image-preview"
        ).innerHTML =
            "";


        getElement(
            "edit-video-preview"
        ).innerHTML =
            "";


        getElement(
            "edit-product-message"
        ).textContent =
            "";


        getElement(
            "edit-product-title"
        ).textContent =
            "Editing: " +
            (
                product.name ||
                "Product"
            );


        openEditModal();

    }

    catch (error) {

        console.error(
            "Edit product loading error:",
            error
        );

        alert(
            "❌ Could not load product:\n\n" +
            error.message
        );

    }

}



// ==========================================
// RENDER EXISTING IMAGES
// ==========================================

function renderExistingImages(
    images
) {

    const container =
        getElement(
            "edit-existing-images"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        !images ||
        images.length === 0
    ) {

        container.innerHTML = `

            <p>
                No existing images.
            </p>

        `;

        return;

    }


    images.forEach(
        (url, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "existing-media-item";


            item.innerHTML = `

                <img
                    src="${escapeHtml(url)}"
                    alt="Product image ${index + 1}"
                    onerror="
                        this.style.opacity='0.4';
                    "
                >

                <label>

                    <input
                        type="checkbox"
                        class="keep-existing-image"
                        value="${escapeHtml(url)}"
                        checked
                    >

                    Keep image ${index + 1}

                </label>

            `;


            container.appendChild(
                item
            );

        }
    );

}



// ==========================================
// RENDER EXISTING VIDEOS
// ==========================================

function renderExistingVideos(
    videos
) {

    const container =
        getElement(
            "edit-existing-videos"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        !videos ||
        videos.length === 0
    ) {

        container.innerHTML = `

            <p>
                No existing videos.
            </p>

        `;

        return;

    }


    videos.forEach(
        (url, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "existing-media-item";


            item.innerHTML = `

                <video
                    src="${escapeHtml(url)}"
                    controls
                    muted
                ></video>

                <label>

                    <input
                        type="checkbox"
                        class="keep-existing-video"
                        value="${escapeHtml(url)}"
                        checked
                    >

                    Keep video ${index + 1}

                </label>

            `;


            container.appendChild(
                item
            );

        }
    );

}



// ==========================================
// OPEN EDIT MODAL
// ==========================================

function openEditModal() {

    const modal =
        getElement(
            "edit-product-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}



// ==========================================
// CLOSE EDIT MODAL
// ==========================================

function closeEditModal() {

    const modal =
        getElement(
            "edit-product-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";


    editingProduct =
        null;

}



// ==========================================
// SAVE EDITED PRODUCT
// ==========================================

async function saveEditedProduct(
    event
) {

    event.preventDefault();


    const message =
        getElement(
            "edit-product-message"
        );


    const button =
        getElement(
            "save-edit-product"
        );


    const productId =
        getElement(
            "edit-product-id"
        ).value;


    const name =
        getElement(
            "edit-product-name"
        ).value.trim();


    const price =
        Number(
            getElement(
                "edit-product-price"
            ).value
        );


    const category =
        getElement(
            "edit-product-category"
        ).value.trim();


    const quantity =
        Number(
            getElement(
                "edit-product-quantity"
            ).value
        );


    const description =
        getElement(
            "edit-product-description"
        ).value.trim();


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
        !productId ||
        !name ||
        !category ||
        !description ||
        Number.isNaN(price) ||
        Number.isNaN(quantity) ||
        price < 0 ||
        quantity < 0
    ) {

        message.textContent =
            "❌ Please complete all product fields correctly.";

        message.style.color =
            "red";

        return;

    }


    // ==========================================
    // EXISTING MEDIA TO KEEP
    // ==========================================

    const keptImages =
        Array.from(
            document.querySelectorAll(
                ".keep-existing-image:checked"
            )
        ).map(
            checkbox =>
                checkbox.value
        );


    const keptVideos =
        Array.from(
            document.querySelectorAll(
                ".keep-existing-video:checked"
            )
        ).map(
            checkbox =>
                checkbox.value
        );


    // ==========================================
    // NEW FILES
    // ==========================================

    const newImageFiles =
        Array.from(
            getElement(
                "edit-product-images"
            ).files || []
        );


    const newVideoFiles =
        Array.from(
            getElement(
                "edit-product-videos"
            ).files || []
        );


    // ==========================================
    // PREVENT NO IMAGE
    // ==========================================

    if (
        keptImages.length === 0 &&
        newImageFiles.length === 0
    ) {

        message.textContent =
            "❌ A product must have at least one image.";

        message.style.color =
            "red";

        return;

    }


    try {

        button.disabled =
            true;


        button.textContent =
            "Saving...";


        // ==========================================
        // UPLOAD NEW IMAGES
        // ==========================================

        const newImageURLs = [];


        for (
            let i = 0;
            i < newImageFiles.length;
            i++
        ) {

            message.textContent =
                `⏳ Uploading new image ${i + 1} of ${newImageFiles.length}...`;

            message.style.color =
                "blue";


            const url =
                await uploadFile(
                    "product-images",
                    "products",
                    newImageFiles[i]
                );


            newImageURLs.push(
                url
            );

        }


        // ==========================================
        // UPLOAD NEW VIDEOS
        // ==========================================

        const newVideoURLs = [];


        for (
            let i = 0;
            i < newVideoFiles.length;
            i++
        ) {

            message.textContent =
                `⏳ Uploading new video ${i + 1} of ${newVideoFiles.length}...`;


            const url =
                await uploadFile(
                    "product-videos",
                    "products",
                    newVideoFiles[i]
                );


            newVideoURLs.push(
                url
            );

        }


        // ==========================================
        // FINAL MEDIA ARRAYS
        // ==========================================

        const finalImages =
            [
                ...keptImages,
                ...newImageURLs
            ];


        const finalVideos =
            [
                ...keptVideos,
                ...newVideoURLs
            ];


        // ==========================================
        // UPDATE SUPABASE
        // ==========================================

        message.textContent =
            "⏳ Updating product...";


        const {
            error
        } =
            await supabaseClient
                .from("products")
                .update({

                    name:
                        name,

                    price:
                        price,

                    category:
                        category,

                    quantity:
                        quantity,

                    description:
                        description,

                    image:
                        JSON.stringify(
                            finalImages
                        ),

                    videos:
                        JSON.stringify(
                            finalVideos
                        )

                })
                .eq(
                    "id",
                    productId
                );


        if (error) {
            throw error;
        }


        // ==========================================
        // SUCCESS
        // ==========================================

        message.textContent =
            `✅ Product updated successfully!

Images: ${finalImages.length}
Videos: ${finalVideos.length}`;

        message.style.color =
            "green";


        await loadProducts();

        await loadStatistics();

        await loadCategories();


        // Wait briefly so success message
        // can be seen before closing.

        setTimeout(
            () => {

                closeEditModal();

            },
            900
        );

    }

    catch (error) {

        console.error(
            "Save edited product error:",
            error
        );


        message.textContent =
            "❌ " +
            (
                error.message ||
                "Could not update product."
            );


        message.style.color =
            "red";

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "💾 Save Changes";

    }

}



// ==========================================
// DELETE PRODUCT
// ==========================================

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

        alert(
            "❌ " +
            error.message
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


        table.innerHTML =
            "";


        orders.forEach(
            order => {

                const row =
                    document.createElement(
                        "tr"
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
                            class="tracking-input"
                            data-order-id="${order.id}"
                            value="${escapeHtml(
                                order.tracking_number || ""
                            )}"
                            placeholder="Tracking number"
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
                            class="delivery-note-input"
                            data-order-id="${order.id}"
                            value="${escapeHtml(
                                order.delivery_note || ""
                            )}"
                            placeholder="Delivery note"
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
                        error.message
                    )}

                </td>

            </tr>

        `;

    }

}



// ==========================================
// ORDER STATUS
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


    return statuses.map(
        status => `

            <option
                value="${escapeHtml(status)}"
                ${
                    status === currentStatus
                        ? "selected"
                        : ""
                }
            >
                ${escapeHtml(status)}
            </option>

        `
    ).join("");

}



// ==========================================
// TRACKING NUMBER
// ==========================================

function generateTrackingNumber() {

    const now =
        new Date();


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

    }

    catch (error) {

        alert(
            "❌ " +
            error.message
        );

    }

}



// ==========================================
// SAVE ORDER
// ==========================================

async function saveOrderUpdate(
    orderId
) {

    const status =
        document.querySelector(
            `.order-status[data-order-id="${orderId}"]`
        )?.value;


    const tracking =
        document.querySelector(
            `.tracking-input[data-order-id="${orderId}"]`
        )?.value.trim();


    const note =
        document.querySelector(
            `.delivery-note-input[data-order-id="${orderId}"]`
        )?.value.trim();


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
                        tracking,

                    delivery_note:
                        note

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

        alert(
            "❌ " +
            error.message
        );

    }

}



// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "ADMIN JS VERSION 5 - FULL PRODUCT EDITING"
        );


        // ==========================================
        // ADD PRODUCT MEDIA
        // ==========================================

        setupImagePreview();

        setupVideoPreview();


        // ==========================================
        // EDIT PRODUCT MEDIA
        // ==========================================

        setupEditImagePreview();

        setupEditVideoPreview();


        // ==========================================
        // LOGIN
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

        const categoryButton =
            getElement(
                "add-category-button"
            );


        if (categoryButton) {

            categoryButton.addEventListener(
                "click",
                function() {

                    addNewCategory(
                        "product-category"
                    );

                }
            );

        }


        // ==========================================
        // EDIT CATEGORY
        // ==========================================

        const editCategoryButton =
            getElement(
                "edit-add-category-button"
            );


        if (editCategoryButton) {

            editCategoryButton.addEventListener(
                "click",
                function() {

                    addNewCategory(
                        "edit-product-category"
                    );

                }
            );

        }


        // ==========================================
        // EDIT FORM
        // ==========================================

        const editForm =
            getElement(
                "edit-product-form"
            );


        if (editForm) {

            editForm.addEventListener(
                "submit",
                saveEditedProduct
            );

        }


        // ==========================================
        // CLOSE EDIT
        // ==========================================

        const closeButton =
            getElement(
                "close-edit-product"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeEditModal
            );

        }


        const cancelButton =
            getElement(
                "cancel-edit-product"
            );


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeEditModal
            );

        }


        // ==========================================
        // CLICK OUTSIDE MODAL
        // ==========================================

        const modal =
            getElement(
                "edit-product-modal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeEditModal();

                    }

                }
            );

        }


        // ==========================================
        // ESCAPE KEY
        // ==========================================

        document.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Escape"
                ) {

                    closeEditModal();

                }

            }
        );


        // ==========================================
        // START ADMIN
        // ==========================================

        checkAdminSession();

    }
);