
const productsTableBody = document.getElementById("productsTableBody");
const filterSelect = document.getElementById("filterSelect");
const sortSelect = document.getElementById("sortSelect");
const emptyMessage = document.getElementById("emptyMessage");

const originalRows = Array.from(productsTableBody.querySelectorAll("tr"));

let currentPage = 1;
const totalPages = 10;

// FILTER PRODUCTS

filterSelect.addEventListener("change", function () {
    const selectedFilter = this.value;

    originalRows.forEach(row => {
        const productStatus = row.dataset.status;

        row.style.display =
            selectedFilter === "all" || productStatus === selectedFilter
                ? ""
                : "none";
    });

    checkEmptyResults();
});

// SORT PRODUCTS

sortSelect.addEventListener("change", function () {
    const selectedSort = this.value;
    const sortedRows = [...originalRows];

    sortedRows.sort((a, b) => {
        const priceA = Number(a.dataset.price);
        const priceB = Number(b.dataset.price);

        const salesA = Number(a.dataset.sales);
        const salesB = Number(b.dataset.sales);

        const nameA = a.dataset.name.toLowerCase();
        const nameB = b.dataset.name.toLowerCase();

        switch (selectedSort) {
            case "sales-high":
                return salesB - salesA;

            case "sales-low":
                return salesA - salesB;

            case "price-high":
                return priceB - priceA;

            case "price-low":
                return priceA - priceB;

            case "name":
                return nameA.localeCompare(nameB);

            default:
                return Number(originalRows.indexOf(a)) -
                       Number(originalRows.indexOf(b));
        }
    });

    sortedRows.forEach(row => productsTableBody.appendChild(row));

    // Apply the selected filter again after sorting.
    filterSelect.dispatchEvent(new Event("change"));
});

// CHECK EMPTY RESULTS

function checkEmptyResults() {
    const visibleRows = originalRows.filter(row => row.style.display !== "none");

    emptyMessage.hidden = visibleRows.length !== 0;
}

// PAGINATION

const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

previousButton.addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
    }
});

nextButton.addEventListener("click", function () {
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
    }
});

function updatePagination() {
    document.getElementById("currentPage").textContent = currentPage;

    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// MORE OPTIONS

document.querySelectorAll(".more-button").forEach(button => {
    button.addEventListener("click", function () {
        const row = this.closest("tr");
        const productName = row.dataset.name;

        alert("Product: " + productName + "\nMore options will be available here.");
    });
});

// INITIALIZE PAGE

updatePagination();
checkEmptyResults();
