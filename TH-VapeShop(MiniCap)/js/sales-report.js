// SALES REPORT PAGE

document.addEventListener("DOMContentLoaded", function () {

    // SALES ANALYTICS PERIOD FILTER

    const periodButtons = document.querySelectorAll(".period-filter button");
    const chartLine = document.getElementById("sales-chart-line");

    const chartData = {
        Today: "M0 230 L60 180 L120 205 L180 125 L240 155 L300 110 L360 145 L420 75 L480 105 L540 65 L600 95 L700 25",

        Weekly: "M0 200 L100 160 L200 180 L300 100 L400 130 L500 70 L600 95 L700 30",

        Monthly: "M0 240 L60 210 L120 170 L180 190 L240 120 L300 145 L360 95 L420 120 L480 65 L540 85 L600 45 L700 20",

        Yearly: "M0 230 L60 180 L120 205 L180 125 L240 155 L300 110 L360 145 L420 75 L480 105 L540 65 L600 95 L700 25"
    };

    periodButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            periodButtons.forEach(function (item) {
                item.classList.remove("selected");
            });

            button.classList.add("selected");

            const selectedPeriod = button.dataset.period;

            chartLine.setAttribute("d", chartData[selectedPeriod]);

        });

    });


    // SORT COMPLETED ORDERS

    const sortButton = document.getElementById("sort-orders");
    const ordersList = document.getElementById("orders-list");

    let ascending = true;

    sortButton.addEventListener("click", function () {

        const rows = Array.from(ordersList.querySelectorAll("tr"));

        rows.sort(function (a, b) {

            const customerA = a.cells[0].textContent.trim().toLowerCase();
            const customerB = b.cells[0].textContent.trim().toLowerCase();

            if (ascending) {
                return customerA.localeCompare(customerB);
            }

            return customerB.localeCompare(customerA);

        });

        rows.forEach(function (row) {
            ordersList.appendChild(row);
        });

        ascending = !ascending;

    });


    // VIEW ALL ORDERS

    const viewAllOrders = document.getElementById("view-all-orders");

    viewAllOrders.addEventListener("click", function () {
        window.location.href = "../pages/sales-management-view-all-orders.html";
    });


    // VIEW ALL PRODUCTS

    const viewAllProducts = document.getElementById("view-all-products");

    viewAllProducts.addEventListener("click", function () {
        window.location.href = "../pages/inventory.html";
    });
});