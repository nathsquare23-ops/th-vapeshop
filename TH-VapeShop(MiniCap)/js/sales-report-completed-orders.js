
const searchInput = document.getElementById("searchInput");
const ordersTableBody = document.getElementById("ordersTableBody");

const originalRows = Array.from(ordersTableBody.querySelectorAll("tr"));

let ascending = true;
let currentPage = 1;
const totalPages = 10;

// SEARCH CUSTOMER

searchInput.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();

    originalRows.forEach(row => {
        const customerName = row.cells[0].textContent.toLowerCase();

        if (customerName.includes(searchValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

// SORT CUSTOMERS

document.getElementById("sortButton").addEventListener("click", function () {
    const sortedRows = [...originalRows];

    sortedRows.sort((a, b) => {
        const nameA = a.cells[0].textContent.toLowerCase();
        const nameB = b.cells[0].textContent.toLowerCase();

        return ascending
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
    });

    sortedRows.forEach(row => ordersTableBody.appendChild(row));

    ascending = !ascending;
});

// VIEW ORDER BUTTONS

document.querySelectorAll(".view-order-button").forEach(button => {
    button.addEventListener("click", function () {
        const row = this.closest("tr");

        const customer = row.cells[0].textContent;
        const amount = row.cells[1].textContent;
        const quantity = row.cells[2].textContent;
        const paymentMethod = row.cells[3].textContent;
        const orderDate = row.cells[4].textContent;

        // Temporary display until the individual order details page is connected.
        alert(
            "Order Details\n\n" +
            "Customer: " + customer + "\n" +
            "Amount: " + amount + "\n" +
            "Quantity: " + quantity + "\n" +
            "Payment Method: " + paymentMethod + "\n" +
            "Order Date and Time: " + orderDate
        );
    });
});

// PAGINATION

document.getElementById("previousButton").addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
    }
});

document.getElementById("nextButton").addEventListener("click", function () {
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
    }
});

function updatePagination() {
    document.getElementById("currentPage").textContent = currentPage;

    document.getElementById("previousButton").disabled = currentPage === 1;
    document.getElementById("nextButton").disabled = currentPage === totalPages;
}

// VIEW ALL BUTTON

document.getElementById("viewAllButton").addEventListener("click", function () {
    searchInput.value = "";

    originalRows.forEach(row => {
        row.style.display = "";
    });

    alert("All completed orders are displayed.");
});

// INITIALIZE PAGINATION

updatePagination();
