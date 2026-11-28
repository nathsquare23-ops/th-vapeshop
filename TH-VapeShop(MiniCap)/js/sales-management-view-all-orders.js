
const orders = [
    {
        number: "01",
        customer: "Roroy Maur",
        date: "September 11, 2001",
        time: "5:29 PM",
        status: "in-process",
        subtotal: "₱7,300.60",
        products: [
            { quantity: "01", name: "Vape Pod Pro Max XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS III ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro Max VII ETC", price: "₱1,000" }
        ]
    },
    {
        number: "02",
        customer: "Paul Villanueva",
        date: "September 11, 2001",
        time: "3:29 AM",
        status: "in-process",
        subtotal: "₱3,000",
        products: [
            { quantity: "01", name: "Vape Pod Pro Max XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS III ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS V ETC", price: "₱1,000" }
        ]
    },
    {
        number: "03",
        customer: "Kris Johnny",
        date: "September 11, 2001",
        time: "7:29 PM",
        status: "completed",
        subtotal: "₱2,000",
        products: [
            { quantity: "01", name: "Vape Pod Pro Max XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS III ETC", price: "₱1,000" }
        ]
    },
    {
        number: "04",
        customer: "Paul Villanueva",
        date: "September 11, 2001",
        time: "3:29 AM",
        status: "in-process",
        subtotal: "₱7,300.60",
        products: [
            { quantity: "01", name: "Vape Pod Pro Max XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS III ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro Max VII ETC", price: "₱1,000" }
        ]
    },
    {
        number: "05",
        customer: "Roroy Maur",
        date: "September 11, 2001",
        time: "5:29 PM",
        status: "in-process",
        subtotal: "₱7,300.60",
        products: [
            { quantity: "01", name: "Vape Pod Pro Max XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS III ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro Max VII ETC", price: "₱1,000" }
        ]
    },
    {
        number: "06",
        customer: "Richi Maur",
        date: "September 11, 2001",
        time: "2:29 PM",
        status: "completed",
        subtotal: "₱1,000",
        products: [
            { quantity: "01", name: "Vape Pod Pro Max XS V ETC", price: "₱1,000" }
        ]
    },
    {
        number: "07",
        customer: "Kris Johnny",
        date: "September 11, 2001",
        time: "7:29 PM",
        status: "completed",
        subtotal: "₱2,000",
        products: [
            { quantity: "01", name: "Vape Pod Pro Max XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS III ETC", price: "₱1,000" }
        ]
    },
    {
        number: "08",
        customer: "Roroy Maur",
        date: "September 11, 2001",
        time: "5:29 PM",
        status: "in-process",
        subtotal: "₱7,300.60",
        products: [
            { quantity: "01", name: "Vape Pod Pro Max XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS III ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro XS V ETC", price: "₱1,000" },
            { quantity: "01", name: "Vape Pod Pro Max VII ETC", price: "₱1,000" }
        ]
    }
];

const ordersGrid = document.getElementById("ordersGrid");
const categoryTabs = document.querySelectorAll(".category-tab");

// GENERATE ORDER CARDS

function renderOrders(filter = "all") {

    ordersGrid.innerHTML = "";

    const filteredOrders = orders.filter(order => {
        return filter === "all" || order.status === filter;
    });

    if (filteredOrders.length === 0) {
        ordersGrid.innerHTML = `
            <div class="empty-state">
                No orders found.
            </div>
        `;
        return;
    }

    filteredOrders.forEach(order => {

        const statusText =
            order.status === "completed"
                ? "Completed"
                : "In-Process";

        const productsHTML = order.products.map(product => `
            <div class="product-row">
                <span class="product-quantity">${product.quantity}</span>
                <span class="product-name">${product.name}</span>
                <span class="product-price">${product.price}</span>
            </div>
        `).join("");

        const card = document.createElement("div");
        card.className = "order-card";

        card.innerHTML = `
            <div class="order-header">

                <div class="order-number">
                    ${order.number}
                </div>

                <div class="order-customer">
                    <h3>${order.customer}</h3>
                </div>

                <span class="order-status ${order.status}">
                    ${statusText}
                </span>

            </div>

            <div class="order-datetime">
                <span>${order.date}</span>
                <span>${order.time}</span>
            </div>

            <div class="product-heading">
                <span>Qty</span>
                <span>Items</span>
                <span>Price</span>
            </div>

            <div class="product-list">
                ${productsHTML}
            </div>

            ${order.products.length > 2 ? `
                <div class="product-more">....................</div>
            ` : ""}

            <div class="order-subtotal">
                <span>SubTotal</span>
                <span class="subtotal-amount">${order.subtotal}</span>
            </div>

            <div class="order-actions">

                <button class="action-button delete-button"
                    type="button" title="Delete Order">
                    <span>♲</span>
                </button>

                <button class="action-button edit-button"
                    type="button" title="Edit Order">
                    <span>✎</span>
                </button>

                ${order.status === "in-process" ? `
                    <button class="complete-button" type="button">
                        Complete Order
                    </button>
                ` : ""}

            </div>
        `;

        ordersGrid.appendChild(card);
    });
}

// CATEGORY FILTERS

categoryTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        categoryTabs.forEach(item => {
            item.classList.remove("active");
        });

        tab.classList.add("active");

        const selectedFilter = tab.dataset.filter;

        renderOrders(selectedFilter);
    });

});

// GO BACK BUTTON

function goBack() {

    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "../pages/sales-management.html";
    }

}

// INITIAL DISPLAY

renderOrders("all");
