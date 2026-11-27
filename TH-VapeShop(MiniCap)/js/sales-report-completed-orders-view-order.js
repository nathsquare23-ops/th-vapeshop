const goBackButton = document.getElementById("goBackButton");


// Return to the Completed Orders page
goBackButton.addEventListener("click", function () {
    window.location.href = "../pages/sales-report-completed-orders.html";
});