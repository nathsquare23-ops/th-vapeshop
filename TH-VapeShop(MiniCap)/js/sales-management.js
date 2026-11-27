
const STORAGE_KEY = "thVapeshopOrders";

const sampleOrders = [
    {
        id: 1,
        customer: "Roroy Maur",
        date: "September 11, 2001",
        time: "5:29 PM",
        status: "In-Process",
        payment: "Cash",
        items: [
            { name: "Vape Pod Pro Max XS V ETC", quantity: 1, price: 1000 },
            { name: "Vape Pod Pro XS III ETC", quantity: 1, price: 1000 },
            { name: "Vape Pod Pro XS V ETC", quantity: 1, price: 1000 },
            { name: "Vape Pod Pro Max VII ETC", quantity: 1, price: 4300.60 }
        ]
    },
    {
        id: 2,
        customer: "Richi Maur",
        date: "September 11, 2001",
        time: "2:29 PM",
        status: "Completed",
        payment: "GCash",
        items: [
            { name: "Vape Pod Pro Max XS V ETC", quantity: 1, price: 1000 }
        ]
    },
    {
        id: 3,
        customer: "Kris Johnny",
        date: "September 11, 2001",
        time: "7:29 PM",
        status: "Completed",
        payment: "Cash",
        items: [
            { name: "Vape Pod Pro XS III ETC", quantity: 1, price: 1000 },
            { name: "Vape Pod Pro XS V ETC", quantity: 1, price: 1000 }
        ]
    },
    {
        id: 4,
        customer: "Paul Villanueva",
        date: "September 11, 2001",
        time: "3:29 AM",
        status: "In-Process",
        payment: "Cash",
        items: [
            { name: "Vape Pod Pro Max VII ETC", quantity: 1, price: 1000 }
        ]
    },
    {
        id: 5,
        customer: "Paul Malicdem",
        date: "September 11, 2001",
        time: "1:38 PM",
        status: "Completed",
        payment: "GCash",
        items: [
            { name: "Vape Pod Pro XS III ETC", quantity: 5, price: 700 }
        ]
    },
    {
        id: 6,
        customer: "Flux Hakaishin",
        date: "September 12, 2001",
        time: "4:38 PM",
        status: "Completed",
        payment: "Cash",
        items: [
            { name: "Vape Pod Pro Max XS V ETC", quantity: 3, price: 737 }
        ]
    },
    {
        id: 7,
        customer: "Nathaniel Obis",
        date: "September 12, 2001",
        time: "7:10 PM",
        status: "In-Process",
        payment: "Cash",
        items: [
            { name: "Vape Pod Pro XS III ETC", quantity: 1, price: 550 }
        ]
    },
    {
        id: 8,
        customer: "Roy Malicdem",
        date: "September 13, 2001",
        time: "9:38 PM",
        status: "Completed",
        payment: "GCash",
        items: [
            { name: "Vape Pod Pro Max VII ETC", quantity: 2, price: 440 }
        ]
    }
];

let orders = loadOrders();
let sortAscending = false;
let showAll = false;

const orderCardsGrid = document.getElementById("orderCardsGrid");
const recentOrdersTable = document.getElementById("recentOrdersTable");

const orderModal = document.getElementById("orderModal");
const detailsModal = document.getElementById("detailsModal");
const orderForm = document.getElementById("orderForm");

const toast = document.getElementById("toast");

// LOAD AND SAVE ORDERS

function loadOrders() {
    const savedOrders = localStorage.getItem(STORAGE_KEY);

    if (savedOrders) {
        try {
            return JSON.parse(savedOrders);
        } catch (error) {
            return [...sampleOrders];
        }
    }

    return [...sampleOrders];
}

function saveOrders() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// HELPER FUNCTIONS

function getOrderTotal(order) {
    return order.items.reduce((total, item) => {
        return total + (item.quantity * item.price);
    }, 0);
}

function getTotalQuantity(order) {
    return order.items.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
}

function formatCurrency(amount) {
    return "₱" + amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getStatusClass(status) {
    return status === "Completed" ? "completed" : "in-process";
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// UPDATE SUMMARY

function updateSummary() {
    const totalOrders = orders.length;

    const completedOrders = orders.filter(order => {
        return order.status === "Completed";
    }).length;

    const totalItems = orders.reduce((total, order) => {
        return total + getTotalQuantity(order);
    }, 0);

    document.getElementById("totalOrders").textContent = totalOrders;

    document.getElementById("completedOrders").textContent =
        completedOrders;

    document.getElementById("totalItemsSold").textContent =
        totalItems;
}

// DISPLAY ORDER CARDS

function renderOrderCards() {
    orderCardsGrid.innerHTML = "";

    const latestOrders = [...orders].slice(-4).reverse();

    latestOrders.forEach(order => {
        const card = document.createElement("article");
        card.className = "order-card";

        const itemsHTML = order.items.map((item, index) => {
            return `
                <div class="order-item">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <span class="order-item-name">${escapeHTML(item.name)}</span>
                    <span class="order-item-price">
                        ${formatCurrency(item.price * item.quantity)}
                    </span>
                </div>
            `;
        }).join("");

        card.innerHTML = `
            <div class="order-card-header">
                <div class="order-number">
                    ${String(order.id).padStart(2, "0")}
                </div>

                <div class="order-customer">
                    <h3 title="${escapeHTML(order.customer)}">
                        ${escapeHTML(order.customer)}
                    </h3>

                    <span class="order-status ${getStatusClass(order.status)}">
                        ${order.status}
                    </span>
                </div>
            </div>

            <div class="order-date">
                <span>${escapeHTML(order.date)}</span>
                <span>${escapeHTML(order.time)}</span>
            </div>

            <div class="order-items-heading">
                <span>Qty</span>
                <span>Items</span>
                <span class="order-item-price">Price</span>
            </div>

            <div class="order-items-list">
                ${itemsHTML}
            </div>

            <div class="order-total">
                <span>SubTotal</span>
                <strong>${formatCurrency(getOrderTotal(order))}</strong>
            </div>

            <div class="order-actions">
                <button
                    class="action-button delete-button"
                    type="button"
                    data-action="delete"
                    data-id="${order.id}"
                    title="Delete order"
                >⌫</button>

                <button
                    class="action-button edit-button"
                    type="button"
                    data-action="edit"
                    data-id="${order.id}"
                    title="Edit order"
                >✎</button>

                ${
                    order.status === "In-Process"
                    ? `
                        <button
                            class="action-button complete-button"
                            type="button"
                            data-action="complete"
                            data-id="${order.id}"
                        >
                            Complete Order
                        </button>
                    `
                    : `
                        <button
                            class="action-button complete-button"
                            type="button"
                            data-action="view"
                            data-id="${order.id}"
                        >
                            View Order
                        </button>
                    `
                }
            </div>
        `;

        orderCardsGrid.appendChild(card);
    });
}

// DISPLAY RECENT ORDERS TABLE

function renderRecentOrders() {
    recentOrdersTable.innerHTML = "";

    let displayedOrders = [...orders].reverse();

    if (!showAll) {
        displayedOrders = displayedOrders.slice(0, 5);
    }

    displayedOrders.forEach(order => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(order.customer)}</td>
            <td>${formatCurrency(getOrderTotal(order))}</td>
            <td>${getTotalQuantity(order)}</td>
            <td>${escapeHTML(order.date)} | ${escapeHTML(order.time)}</td>
            <td>
                <span class="status ${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
        `;

        recentOrdersTable.appendChild(row);
    });

    document.getElementById("tableCount").textContent =
        `Showing ${displayedOrders.length} of ${orders.length} orders`;

    document.getElementById("viewAllButton").textContent =
        showAll ? "Show Recent" : "View All";
}

// ESCAPE USER INPUT

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

// REFRESH PAGE CONTENT

function renderPage() {
    updateSummary();
    renderOrderCards();
    renderRecentOrders();
}

// OPEN AND CLOSE ORDER MODAL

function openOrderModal(order = null) {
    orderForm.reset();

    document.getElementById("orderId").value = "";

    if (order) {
        document.getElementById("modalTitle").textContent = "Edit Order";

        document.getElementById("orderId").value = order.id;
        document.getElementById("customerName").value = order.customer;
        document.getElementById("productName").value = order.items[0].name;
        document.getElementById("productQuantity").value =
            order.items[0].quantity;
        document.getElementById("productPrice").value =
            order.items[0].price;
        document.getElementById("paymentMethod").value = order.payment;
    } else {
        document.getElementById("modalTitle").textContent = "New Order";
    }

    orderModal.classList.add("show");
}

function closeOrderModal() {
    orderModal.classList.remove("show");
}

document.getElementById("newOrderButton").addEventListener("click", () => {
    openOrderModal();
});

document.getElementById("closeModalButton").addEventListener("click", closeOrderModal);
document.getElementById("cancelModalButton").addEventListener("click", closeOrderModal);

// SAVE NEW OR EDITED ORDER

orderForm.addEventListener("submit", event => {
    event.preventDefault();

    const orderId = document.getElementById("orderId").value;

    const customer = document.getElementById("customerName").value.trim();
    const product = document.getElementById("productName").value.trim();

    const quantity = Number(document.getElementById("productQuantity").value);
    const price = Number(document.getElementById("productPrice").value);

    const payment = document.getElementById("paymentMethod").value;

    if (!customer || !product || quantity < 1 || price < 0) {
        showToast("Please check the order information.");
        return;
    }

    if (orderId) {
        const order = orders.find(item => item.id === Number(orderId));

        if (order) {
            order.customer = customer;
            order.items = [{
                name: product,
                quantity: quantity,
                price: price
            }];
            order.payment = payment;
        }

        showToast("Order updated successfully.");
    } else {
        const newOrder = {
            id: orders.length
                ? Math.max(...orders.map(order => order.id)) + 1
                : 1,
            customer: customer,
            date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }),
            time: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
            }),
            status: "In-Process",
            payment: payment,
            items: [{
                name: product,
                quantity: quantity,
                price: price
            }]
        };

        orders.push(newOrder);

        showToast("New order added successfully.");
    }

    saveOrders();
    renderPage();
    closeOrderModal();
});

// ORDER CARD ACTIONS

orderCardsGrid.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    const order = orders.find(item => item.id === id);

    if (!order) return;

    if (action === "delete") {
        const confirmDelete = confirm(
            `Are you sure you want to delete Order #${id}?`
        );

        if (!confirmDelete) return;

        orders = orders.filter(item => item.id !== id);

        saveOrders();
        renderPage();

        showToast("Order deleted successfully.");
    }

    if (action === "edit") {
        openOrderModal(order);
    }

    if (action === "complete") {
        const confirmComplete = confirm(
            `Mark Order #${id} as completed?`
        );

        if (!confirmComplete) return;

        order.status = "Completed";

        saveOrders();
        renderPage();

        showToast("Order marked as completed.");
    }

    if (action === "view") {
        openDetailsModal(order);
    }
});

// ORDER DETAILS

function openDetailsModal(order) {
    const content = document.getElementById("orderDetailsContent");

    const productsHTML = order.items.map(item => {
        return `
            <div class="details-product">
                <span>
                    ${escapeHTML(item.name)}
                    <br>
                    <small>${item.quantity} × ${formatCurrency(item.price)}</small>
                </span>

                <strong>${formatCurrency(item.quantity * item.price)}</strong>
            </div>
        `;
    }).join("");

    content.innerHTML = `
        <div class="details-row">
            <span class="details-label">Order Number</span>
            <span class="details-value">
                #${String(order.id).padStart(2, "0")}
            </span>
        </div>

        <div class="details-row">
            <span class="details-label">Customer</span>
            <span class="details-value">${escapeHTML(order.customer)}</span>
        </div>

        <div class="details-row">
            <span class="details-label">Order Date</span>
            <span class="details-value">${escapeHTML(order.date)}</span>
        </div>

        <div class="details-row">
            <span class="details-label">Order Time</span>
            <span class="details-value">${escapeHTML(order.time)}</span>
        </div>

        <div class="details-row">
            <span class="details-label">Payment Method</span>
            <span class="details-value">${escapeHTML(order.payment)}</span>
        </div>

        <div class="details-row">
            <span class="details-label">Status</span>
            <span class="details-value">${escapeHTML(order.status)}</span>
        </div>

        <div class="details-products">
            <h3>Purchased Products</h3>
            ${productsHTML}
        </div>

        <div class="details-total">
            <span>Total Amount</span>
            <span>${formatCurrency(getOrderTotal(order))}</span>
        </div>
    `;

    detailsModal.classList.add("show");
}

document.getElementById("closeDetailsButton").addEventListener("click", () => {
    detailsModal.classList.remove("show");
});

// SORT ORDERS

document.getElementById("sortButton").addEventListener("click", () => {
    sortAscending = !sortAscending;

    orders.sort((a, b) => {
        return sortAscending ? a.id - b.id : b.id - a.id;
    });

    renderPage();

    showToast(sortAscending ? "Oldest orders first." : "Newest orders first.");
});

// VIEW ALL ORDERS

function showAllOrders() {
    showAll = !showAll;
    renderRecentOrders();

    if (showAll) {
        document.getElementById("recentOrdersSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

document.getElementById("viewAllButton").addEventListener("click", showAllOrders);
document.getElementById("showAllOrdersButton").addEventListener("click", showAllOrders);

document.getElementById("viewAllOrdersButton").addEventListener("click", () => {
    showAll = true;
    renderRecentOrders();

    document.getElementById("recentOrdersSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// CLOSE MODALS WHEN CLICKING OUTSIDE

orderModal.addEventListener("click", event => {
    if (event.target === orderModal) {
        closeOrderModal();
    }
});

detailsModal.addEventListener("click", event => {
    if (event.target === detailsModal) {
        detailsModal.classList.remove("show");
    }
});

// INITIAL DISPLAY

renderPage();
