
document.addEventListener("DOMContentLoaded", () => {

    const previousPage = "../pages/inventory-hub-add-product.html";
    const draftStorageKey = "thv_productDraft";

    const goBackTop = document.getElementById("goBackTop");
    const previousButton = document.getElementById("previousButton");
    const addProductButton = document.getElementById("addProductButton");

    const pricingRows = document.getElementById("pricingRows");
    const stockRows = document.getElementById("stockRows");

    // GO BACK TO BASIC INFORMATION

    function goToPreviousPage() {
        window.location.href = previousPage;
    }

    goBackTop.addEventListener("click", goToPreviousPage);
    previousButton.addEventListener("click", goToPreviousPage);

    // ADD AND REMOVE PRICING AND STOCK FIELDS

    document.addEventListener("click", (event) => {

        const addButton = event.target.closest(".add-row");
        const removeButton = event.target.closest(".remove-row");

        if (addButton) {
            const targetId = addButton.dataset.target;
            const targetContainer = document.getElementById(targetId);

            if (!targetContainer) return;

            const isPricing = targetId === "pricingRows";
            const rowClass = isPricing ? "price-row" : "stock-row";
            const inputClass = isPricing ? "price-input" : "stock-input";
            const placeholder = isPricing
                ? "Enter base price of the product"
                : "Enter stock quantity";

            const newRow = document.createElement("div");
            newRow.className = `dynamic-row ${rowClass}`;

            newRow.innerHTML = `
                <button type="button" class="remove-row" aria-label="Remove field">−</button>
                <input
                    type="number"
                    class="${inputClass}"
                    placeholder="${placeholder}"
                    min="0"
                    step="${isPricing ? "0.01" : "1"}"
                >
                <button type="button" class="add-row" data-target="${targetId}" aria-label="Add field">+</button>
            `;

            targetContainer.appendChild(newRow);
        }

        if (removeButton) {
            const row = removeButton.closest(".dynamic-row");
            const container = row.parentElement;

            if (container.children.length > 1) {
                row.remove();
            }
        }
    });

    // ADD PRODUCT

    addProductButton.addEventListener("click", () => {

        const priceInputs = document.querySelectorAll(".price-input");
        const stockInputs = document.querySelectorAll(".stock-input");
        const thresholdInput = document.getElementById("lowStockThreshold");

        const prices = Array.from(priceInputs);
        const stocks = Array.from(stockInputs);

        const hasEmptyPrice = prices.some(input => input.value.trim() === "");
        const hasEmptyStock = stocks.some(input => input.value.trim() === "");

        const hasInvalidPrice = prices.some(input =>
            Number(input.value) < 0
        );

        const hasInvalidStock = stocks.some(input =>
            Number(input.value) < 0 || !Number.isInteger(Number(input.value))
        );

        if (hasEmptyPrice) {
            alert("Please enter the base price of the product.");
            return;
        }

        if (hasEmptyStock) {
            alert("Please enter the stock quantity.");
            return;
        }

        if (hasInvalidPrice) {
            alert("Please enter a valid product price.");
            return;
        }

        if (hasInvalidStock) {
            alert("Please enter a valid whole-number stock quantity.");
            return;
        }

        if (
            thresholdInput.value.trim() !== "" &&
            (
                Number(thresholdInput.value) < 0 ||
                !Number.isInteger(Number(thresholdInput.value))
            )
        ) {
            alert("Please enter a valid whole-number stock threshold.");
            return;
        }

        const pricingInformation = prices.map(input => Number(input.value));
        const stockInformation = stocks.map(input => Number(input.value));
        const lowStockThreshold = thresholdInput.value === ""
            ? null
            : Number(thresholdInput.value);

        const productPricingData = {
            prices: pricingInformation,
            stocks: stockInformation,
            lowStockThreshold: lowStockThreshold
        };

        const draftText = sessionStorage.getItem(draftStorageKey);
        if (!draftText) {
            alert("Please enter the product details first.");
            window.location.href = previousPage;
            return;
        }

        const draft = JSON.parse(draftText);
        const savedProducts = JSON.parse(localStorage.getItem("thv_added") || "[]");
        const product = {
            id: Date.now(),
            name: draft.name,
            description: draft.description,
            brand: draft.brand,
            category: draft.category || "Other",
            variation: draft.variation || "No Variation",
            imageName: draft.imageName || "",
            prices: productPricingData.prices,
            stocks: productPricingData.stocks,
            lowStockThreshold: productPricingData.lowStockThreshold,
            price: productPricingData.prices[0],
            qty: productPricingData.stocks.reduce((total, stock) => total + stock, 0),
            created: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            })
        };

        savedProducts.unshift(product);
        localStorage.setItem("thv_added", JSON.stringify(savedProducts));
        sessionStorage.removeItem(draftStorageKey);

        alert("Product added successfully.");
        window.location.href = "../pages/inventory.html";
    });

});
