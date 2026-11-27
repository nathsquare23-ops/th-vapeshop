
const STORAGE_KEY = "thVapeshopOrders";

const products = [
    {
        id: 1,
        name: "IPhone 14 64GB",
        category: "Juice",
        price: 15800,
        stock: 10,
        image: "📦"
    },
    {
        id: 2,
        name: "MacBook Pro",
        category: "Pods",
        price: 1000,
        stock: 10,
        image: "📦"
    },
    {
        id: 3,
        name: "Rolex Tribute V3",
        category: "Variable Mods",
        price: 6800,
        stock: 6,
        image: "📦"
    },
    {
        id: 4,
        name: "Red Nike Angelo",
        category: "Cartridges",
        price: 8965,
        stock: 8,
        image: "📦"
    },
    {
        id: 5,
        name: "Blue White OGR",
        category: "Pods",
        price: 1200,
        stock: 15,
        image: "📦"
    },
    {
        id: 6,
        name: "Vape Pod Pro",
        category: "Pods",
        price: 950,
        stock: 12,
        image: "📦"
    },
    {
        id: 7,
        name: "Classic Juice 30ml",
        category: "Juice",
        price: 350,
        stock: 20,
        image: "🧴"
    },
    {
        id: 8,
        name: "Strawberry Juice",
        category: "Juice",
        price: 400,
        stock: 18,
        image: "🧴"
    },
    {
        id: 9,
        name: "Replacement Cartridge",
        category: "Cartridges",
        price: 250,
        stock: 25,
        image: "📦"
    },
    {
        id: 10,
        name: "Variable Mod X",
        category: "Variable Mods",
        price: 2500,
        stock: 7,
        image: "📦"
    },
    {
        id: 11,
        name: "Pod Cartridge V2",
        category: "Cartridges",
        price: 300,
        stock: 14,
        image: "📦"
    },
    {
        id: 12,
        name: "Premium Juice 60ml",
        category: "Juice",
        price: 550,
        stock: 9,
        image: "🧴"
    }
];

let cart = [];
let selectedCategory = "All Categories";
let selectedPayment = "Cash";
let currentPage = 1;
let productsPerPage = 12;
let sortAscending = true;

let customers = [
    "Walk In Customer",
    "John Doe",
    "Jane Smith",
    "Regular Customer"
];

const productGrid = document.getElementById("productGrid");
const orderItems = document.getElementById("orderItems");
const emptyOrder = document.getElementById("emptyOrder");

const customerModal = document.getElementById("customerModal");
const customerSelect = document.getElementById("customerSelect");

const searchInput = document.getElementById("productSearch");
const discountInput = document.getElementById("discountInput");

const toast = document.getElementById("toast");

// INITIAL SETUP

function initializePage() {
    const today = new Date();

    document.getElementById("orderDate").value =
        today.toISOString().split("T")[0];

    document.getElementById("transactionId").textContent =
        "#" + Math.floor(10000 + Math.random() * 90000);

    renderProducts();
    renderCart();
    renderCustomers();
}

function formatCurrency(amount) {
    return "₱" + amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// PRODUCT CATALOG

function getFilteredProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    let filteredProducts = products.filter(product => {
        const matchesCategory =
            selectedCategory === "All Categories" ||
            product.category === selectedCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    filteredProducts.sort((a, b) => {
        return sortAscending
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
    });

    return filteredProducts;
}

function renderProducts() {
    const filteredProducts = getFilteredProducts();

    const totalPages = Math.max(
        1,
        Math.ceil(filteredProducts.length / productsPerPage)
    );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * productsPerPage;

    const visibleProducts = filteredProducts.slice(
        startIndex,
        startIndex + productsPerPage
    );

    productGrid.innerHTML = "";

    document.getElementById("productCount").textContent =
        `${filteredProducts.length} Products`;

    document.getElementById("pageIndicator").textContent =
        `${currentPage} of ${totalPages}`;

    document.getElementById("previousPageButton").disabled =
        currentPage === 1;

    document.getElementById("nextPageButton").disabled =
        currentPage === totalPages;

    if (visibleProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products">
                No products found.
            </div>
        `;

        return;
    }

    visibleProducts.forEach(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const quantityInCart = cartItem ? cartItem.quantity : 0;

        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                ${product.image}
            </div>

            <span class="product-category">
                ${escapeHTML(product.category)}
            </span>

            <h3 class="product-name">
                ${escapeHTML(product.name)}
            </h3>

            <span class="product-stock">
                In Stock: ${product.stock - quantityInCart}
            </span>

            <div class="product-card-bottom">
                <span class="product-price">
                    ${formatCurrency(product.price)}
                </span>

                <button
                    class="add-product-button"
                    type="button"
                    data-id="${product.id}"
                    ${quantityInCart >= product.stock ? "disabled" : ""}
                    title="Add product"
                >
                    +
                </button>
            </div>
        `;

        productGrid.appendChild(card);
    });
}

// CATEGORY FILTER

document.getElementById("categories").addEventListener("click", event => {
    const button = event.target.closest(".category");

    if (!button) return;

    document.querySelectorAll(".category").forEach(category => {
        category.classList.remove("active");
    });

    button.classList.add("active");

    selectedCategory = button.dataset.category;
    currentPage = 1;

    renderProducts();
});

// PRODUCT SEARCH

searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderProducts();
});

document.getElementById("clearSearch").addEventListener("click", () => {
    searchInput.value = "";
    currentPage = 1;
    renderProducts();
    searchInput.focus();
});

// PRODUCT SORTING

document.getElementById("sortProductsButton").addEventListener("click", () => {
    sortAscending = !sortAscending;
    renderProducts();

    showToast(
        sortAscending
            ? "Products sorted A to Z."
            : "Products sorted Z to A."
    );
});

// PRODUCT PAGINATION

document.getElementById("previousPageButton").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
    }
});

document.getElementById("nextPageButton").addEventListener("click", () => {
    const totalPages = Math.ceil(
        getFilteredProducts().length / productsPerPage
    );

    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
    }
});

// ADD PRODUCT TO CART

productGrid.addEventListener("click", event => {
    const button = event.target.closest(".add-product-button");

    if (!button) return;

    const productId = Number(button.dataset.id);

    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showToast("Not enough stock available.");
            return;
        }

        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    renderCart();
    renderProducts();

    showToast("Product added to order.");
});

// CART TOTALS

function getSubtotal() {
    return cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
}

function getDiscount() {
    const discount = Number(discountInput.value) || 0;

    return Math.max(0, Math.min(discount, getSubtotal()));
}

function getTotal() {
    return getSubtotal() - getDiscount();
}

function getTotalQuantity() {
    return cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
}

// DISPLAY CART

function renderCart() {
    orderItems.innerHTML = "";

    emptyOrder.style.display = cart.length === 0 ? "flex" : "none";

    cart.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(item.name)}</td>

            <td>${formatCurrency(item.price)}</td>

            <td>
                <div class="quantity-control">
                    <button
                        type="button"
                        data-action="increase"
                        data-id="${item.id}"
                    >+</button>

                    <span>${item.quantity}</span>

                    <button
                        type="button"
                        data-action="decrease"
                        data-id="${item.id}"
                    >−</button>
                </div>
            </td>

            <td>
                ${formatCurrency(item.price * item.quantity)}
            </td>

            <td>
                <button
                    class="remove-item-button"
                    type="button"
                    data-action="remove"
                    data-id="${item.id}"
                    title="Remove product"
                >
                    ×
                </button>
            </td>
        `;

        orderItems.appendChild(row);
    });

    document.getElementById("itemCount").textContent =
        getTotalQuantity();

    updateTotals();
}

// CART QUANTITY AND REMOVE BUTTONS

orderItems.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const productId = Number(button.dataset.id);
    const action = button.dataset.action;

    const cartItem = cart.find(item => item.id === productId);

    if (!cartItem) return;

    if (action === "increase") {
        const product = products.find(item => item.id === productId);

        if (cartItem.quantity >= product.stock) {
            showToast("Not enough stock available.");
            return;
        }

        cartItem.quantity++;
    }

    if (action === "decrease") {
        cartItem.quantity--;

        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    }

    if (action === "remove") {
        cart = cart.filter(item => item.id !== productId);
    }

    renderCart();
    renderProducts();
});

// UPDATE TOTAL AMOUNTS

function updateTotals() {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    const total = getTotal();

    document.getElementById("subtotalAmount").textContent =
        formatCurrency(subtotal);

    document.getElementById("discountAmount").textContent =
        formatCurrency(discount);

    document.getElementById("totalAmount").textContent =
        formatCurrency(total);
}

discountInput.addEventListener("input", updateTotals);

// PAYMENT METHOD SELECTION

document.querySelector(".payment-options").addEventListener("click", event => {
    const button = event.target.closest(".payment-option");

    if (!button) return;

    document.querySelectorAll(".payment-option").forEach(option => {
        option.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedPayment = button.dataset.payment;
});

// CUSTOMER MANAGEMENT

function renderCustomers() {
    customerSelect.innerHTML = "";

    customers.forEach(customer => {
        const option = document.createElement("option");

        option.value = customer;
        option.textContent = customer;

        customerSelect.appendChild(option);
    });
}

function openCustomerModal() {
    customerModal.classList.add("show");
    document.getElementById("newCustomerName").focus();
}

function closeCustomerModal() {
    customerModal.classList.remove("show");
    document.getElementById("customerForm").reset();
}

document.getElementById("addCustomerButton").addEventListener("click", openCustomerModal);

document.getElementById("closeCustomerModal").addEventListener("click", closeCustomerModal);

document.getElementById("cancelCustomerModal").addEventListener("click", closeCustomerModal);

document.getElementById("customerForm").addEventListener("submit", event => {
    event.preventDefault();

    const customerName = document
        .getElementById("newCustomerName")
        .value
        .trim();

    if (!customerName) return;

    const existingCustomer = customers.some(customer => {
        return customer.toLowerCase() === customerName.toLowerCase();
    });

    if (existingCustomer) {
        showToast("Customer already exists.");
        return;
    }

    customers.push(customerName);

    renderCustomers();

    customerSelect.value = customerName;

    closeCustomerModal();

    showToast("Customer added successfully.");
});

// SAVE ORDER

function saveOrder() {
    if (cart.length === 0) {
        showToast("Please add at least one product.");
        return;
    }

    const customer = customerSelect.value;
    const orderDate = document.getElementById("orderDate").value;

    if (!orderDate) {
        showToast("Please select an order date.");
        return;
    }

    const order = {
        id: Date.now(),
        transactionId: document.getElementById("transactionId").textContent,
        customer: customer,
        date: new Date(orderDate + "T12:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }),
        time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        }),
        status: "Completed",
        payment: selectedPayment,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        subtotal: getSubtotal(),
        discount: getDiscount(),
        total: getTotal()
    };

    let savedOrders = [];

    try {
        savedOrders = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(savedOrders)) {
            savedOrders = [];
        }
    } catch (error) {
        savedOrders = [];
    }

    savedOrders.push(order);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedOrders)
    );

    showToast("Order saved successfully.");

    setTimeout(() => {
        window.location.href = "../pages/sales-management.html";
    }, 700);
}

document.getElementById("saveOrderButton").addEventListener("click", () => {
    saveOrder();
});

// CANCEL ORDER

document.getElementById("cancelOrderButton").addEventListener("click", () => {
    if (cart.length > 0) {
        const confirmCancel = confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmCancel) return;
    }

    window.location.href = "../pages/sales-management.html";
});

// CLOSE CUSTOMER MODAL WHEN CLICKING OUTSIDE

customerModal.addEventListener("click", event => {
    if (event.target === customerModal) {
        closeCustomerModal();
    }
});

// START PAGE

initializePage();
