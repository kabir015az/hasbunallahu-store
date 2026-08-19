// ==========================================
// HASBUNALLAHU STORE
// ADMIN DASHBOARD JAVASCRIPT
// ==========================================


// ==========================================
// ADMIN EMAIL
// ==========================================

const ADMIN_EMAIL =
    "kabirabdulazeez45@gmail.com";


// ==========================================
// STORAGE BUCKET
// ==========================================

const PRODUCT_IMAGE_BUCKET =
    "product-images";


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
            data?.session;


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

        loginButton.disabled =
            true;

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

            throw error;

        }


        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "No user was returned."
            );

        }


        if (
            data.user.email
                .toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await supabaseClient
                .auth
                .signOut();

            throw new Error(
                "This account is not authorized as admin."
            );

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

        loadCategories(),

        loadProducts(),

        loadOrders()

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


        let totalSales =
            0;


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
                totalOrders;

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
            error: productsError
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


        if (productsError) {
            throw productsError;
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


// ==========================================
// CATEGORY STORAGE
// ==========================================

const DEFAULT_CATEGORIES = [

    "School",

    "Electronics",

    "Fashion",

    "Beauty",

    "Home",

    "Accessories",

    "Food",

    "Books",

    "Other"

];


// ==========================================
// GET SAVED LOCAL CATEGORIES
// ==========================================

function getLocalCategories() {

    try {

        const saved =
            localStorage.getItem(
                "hasbunallahu_categories"
            );


        if (!saved) {

            return [];

        }


        const categories =
            JSON.parse(saved);


        return Array.isArray(categories)
            ? categories
            : [];

    }

    catch (error) {

        console.error(
            "Category storage error:",
            error
        );

        return [];

    }

}


// ==========================================
// SAVE LOCAL CATEGORY
// ==========================================

function saveLocalCategory(
    category
) {

    const categories =
        getLocalCategories();


    const exists =
        categories.some(
            function(item) {

                return item.toLowerCase() ===
                    category.toLowerCase();

            }
        );


    if (!exists) {

        categories.push(
            category
        );

        localStorage.setItem(
            "hasbunallahu_categories",
            JSON.stringify(categories)
        );

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


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .select(
                    "category"
                );


        if (error) {

            console.error(
                "Could not load categories:",
                error
            );

        }


        const categories =
            new Set();


        // Default categories

        DEFAULT_CATEGORIES.forEach(
            function(category) {

                categories.add(
                    category
                );

            }
        );


        // Categories already stored locally

        getLocalCategories()
            .forEach(
                function(category) {

                    categories.add(
                        category
                    );

                }
            );


        // Categories already used by products

        (data || []).forEach(
            function(product) {

                if (
                    product.category &&
                    product.category.trim()
                ) {

                    categories.add(
                        product.category.trim()
                    );

                }

            }
        );


        select.innerHTML = `

            <option value="">
                Select category
            </option>

        `;


        Array.from(categories)
            .sort(
                function(a, b) {

                    return a.localeCompare(b);

                }
            )
            .forEach(
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

    catch (error) {

        console.error(
            "Category loading error:",
            error
        );

    }

}


// ==========================================
// ADD CATEGORY
// ==========================================

function addCategory() {

    const categoryName =
        prompt(
            "Enter the new category name:"
        );


    if (
        categoryName ===
        null
    ) {

        return;

    }


    const category =
        categoryName.trim();


    if (!category) {

        alert(
            "Please enter a category name."
        );

        return;

    }


    const select =
        getElement(
            "product-category"
        );


    if (!select) {
        return;
    }


    const existingOptions =
        Array.from(
            select.options
        );


    const exists =
        existingOptions.some(
            function(option) {

                return option.value
                    .toLowerCase() ===
                    category.toLowerCase();

            }
        );


    if (exists) {

        select.value =
            existingOptions.find(
                function(option) {

                    return option.value
                        .toLowerCase() ===
                        category.toLowerCase();

                }
            ).value;


        alert(
            "This category already exists."
        );

        return;

    }


    saveLocalCategory(
        category
    );


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


    select.value =
        category;


    alert(
        "✅ Category added: " +
        category
    );

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

                    <td colspan="8">
                        No products found.
                    </td>

                </tr>

            `;

            return;

        }


        table.innerHTML =
            "";


        products.forEach(
            function(product) {

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

                        <img
                            src="${escapeHtml(
                                product.image || ""
                            )}"
                            alt="${escapeHtml(
                                product.name || "Product"
                            )}"
                            class="product-table-image"
                            onerror="
                                this.style.display='none'
                            "
                        >

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
                        ${Number(
                            product.quantity
                        ) || 0}
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
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

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
// IMAGE PREVIEW
// ==========================================

function setupImagePreview() {

    const imageInput =
        getElement(
            "product-image"
        );


    const preview =
        getElement(
            "image-preview"
        );


    if (
        !imageInput ||
        !preview
    ) {

        return;

    }


    imageInput.addEventListener(
        "change",
        function() {

            const file =
                this.files?.[0];


            preview.innerHTML =
                "";


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );

                this.value =
                    "";

                return;

            }


            const imageURL =
                URL.createObjectURL(
                    file
                );


            preview.innerHTML = `

                <img
                    src="${imageURL}"
                    alt="Product preview"
                >

            `;

        }
    );

}


// ==========================================
// ADD PRODUCT
// ==========================================

async function addProduct(event) {

    event.preventDefault();


    const form =
        getElement(
            "add-product-form"
        );


    const button =
        getElement(
            "add-product-button"
        );


    const message =
        getElement(
            "product-message"
        );


    const name =
        getElement(
            "product-name"
        )?.value.trim();


    const price =
        Number(
            getElement(
                "product-price"
            )?.value
        );


    const category =
        getElement(
            "product-category"
        )?.value.trim();


    const imageInput =
        getElement(
            "product-image"
        );


    const imageFile =
        imageInput?.files?.[0];


    const description =
        getElement(
            "product-description"
        )?.value.trim();


    const quantity =
        Number(
            getElement(
                "product-quantity"
            )?.value
        );


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name) {

        showProductMessage(
            "❌ Please enter the product name.",
            false
        );

        return;

    }


    if (
        Number.isNaN(price) ||
        price < 0
    ) {

        showProductMessage(
            "❌ Please enter a valid price.",
            false
        );

        return;

    }


    if (!category) {

        showProductMessage(
            "❌ Please select a category.",
            false
        );

        return;

    }


    if (!imageFile) {

        showProductMessage(
            "❌ Please select a product image.",
            false
        );

        return;

    }


    if (
        !imageFile.type.startsWith(
            "image/"
        )
    ) {

        showProductMessage(
            "❌ Please select a valid image file.",
            false
        );

        return;

    }


    if (!description) {

        showProductMessage(
            "❌ Please enter a product description.",
            false
        );

        return;

    }


    if (
        Number.isNaN(quantity) ||
        quantity < 0
    ) {

        showProductMessage(
            "❌ Please enter a valid quantity.",
            false
        );

        return;

    }


    try {

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Uploading image...";

        }


        showProductMessage(
            "⏳ Uploading product image...",
            true
        );


        // ==========================================
        // FILE EXTENSION
        // ==========================================

        let fileExtension =
            imageFile.name
                .split(".")
                .pop()
                .toLowerCase();


        if (!fileExtension) {

            fileExtension =
                "jpg";

        }


        // ==========================================
        // UNIQUE FILE NAME
        // ==========================================

        const fileName =
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 10)}.${fileExtension}`;


        const filePath =
            `products/${fileName}`;


        // ==========================================
        // UPLOAD TO SUPABASE STORAGE
        // ==========================================

        const {
            data: uploadData,
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(
                    PRODUCT_IMAGE_BUCKET
                )
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


        console.log(
            "Image uploaded:",
            uploadData
        );


        // ==========================================
        // GET PUBLIC URL
        // ==========================================

        const {
            data: publicURLData
        } =
            supabaseClient
                .storage
                .from(
                    PRODUCT_IMAGE_BUCKET
                )
                .getPublicUrl(
                    filePath
                );


        const imageURL =
            publicURLData?.publicUrl;


        if (!imageURL) {

            throw new Error(
                "Could not get the public image URL."
            );

        }


        console.log(
            "Image URL:",
            imageURL
        );


        if (button) {

            button.textContent =
                "Saving product...";

        }


        showProductMessage(
            "⏳ Saving product...",
            true
        );


        // ==========================================
        // SAVE PRODUCT
        // ==========================================

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
                            imageURL,

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
                "PRODUCT SAVE ERROR:",
                error
            );

            throw error;

        }


        console.log(
            "Product saved:",
            data
        );


        // Save category locally

        saveLocalCategory(
            category
        );


        showProductMessage(
            "✅ Product added successfully!",
            true
        );


        // Reset form

        if (form) {
            form.reset();
        }


        // Reset quantity

        const quantityInput =
            getElement(
                "product-quantity"
            );


        if (quantityInput) {

            quantityInput.value =
                "30";

        }


        // Clear image preview

        const preview =
            getElement(
                "image-preview"
            );


        if (preview) {

            preview.innerHTML =
                "";

        }


        // Reload categories

        await loadCategories();


        // Reload products

        await loadProducts();


        // Reload statistics

        await loadStatistics();

    }

    catch (error) {

        console.error(
            "ADD PRODUCT ERROR:",
            error
        );


        showProductMessage(
            "❌ " +
            (
                error.message ||
                "Could not add product."
            ),
            false
        );

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


// ==========================================
// SHOW PRODUCT MESSAGE
// ==========================================

function showProductMessage(
    message,
    success
) {

    const element =
        getElement(
            "product-message"
        );


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
        newName ===
        null
    ) {

        return;

    }


    const newPrice =
        prompt(
            "Enter new price:"
        );


    if (
        newPrice ===
        null
    ) {

        return;

    }


    const newQuantity =
        prompt(
            "Enter new quantity:"
        );


    if (
        newQuantity ===
        null
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

        await loadCategories();

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
        )
            .padStart(
                2,
                "0"
            );


    const day =
        String(
            now.getDate()
        )
            .padStart(
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
// GENERATE TRACKING FOR ORDER
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

        // Login

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


        // Logout

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


        // Add product

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


        // Add category

        const addCategoryButton =
            getElement(
                "add-category-button"
            );


        if (addCategoryButton) {

            addCategoryButton.addEventListener(
                "click",
                addCategory
            );

        }


        // Image preview

        setupImagePreview();


        // Check admin session

        checkAdminSession();


        console.log(
            "Hasbunallahu Store Admin loaded."
        );

    }
);