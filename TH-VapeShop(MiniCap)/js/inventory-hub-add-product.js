const goBackButton = document.getElementById("goBackButton");
const cancelButton = document.getElementById("cancelButton");
const nextButton = document.getElementById("nextButton");

const productForm = document.getElementById("productInformationForm");

const productImage = document.getElementById("productImage");
const browseButton = document.getElementById("browseButton");
const dropZone = document.getElementById("dropZone");

const uploadContent = document.getElementById("uploadContent");
const imagePreview = document.getElementById("imagePreview");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const removeFileButton = document.getElementById("removeFileButton");
const uploadNote = document.getElementById("uploadNote");

let selectedFile = null;
let previewURL = null;
const draftStorageKey = "thv_productDraft";

// GO BACK

function returnToInventoryHub() {
    window.location.href = "../pages/inventory.html";
}

goBackButton.addEventListener("click", returnToInventoryHub);
cancelButton.addEventListener("click", returnToInventoryHub);


// OPEN FILE BROWSER

browseButton.addEventListener("click", () => {
    productImage.click();
});


// HANDLE SELECTED FILE

productImage.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
        handleFile(file);
    }
});


// FILE VALIDATION AND PREVIEW

function handleFile(file) {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "video/mp4"
    ];

    const maximumSize = 50 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file format. Please select a JPEG, PNG, PDF, or MP4 file.");
        productImage.value = "";
        return;
    }

    if (file.size > maximumSize) {
        alert("The selected file exceeds the 50MB limit.");
        productImage.value = "";
        return;
    }

    selectedFile = file;

    fileName.textContent = file.name;

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    if (file.type.startsWith("image/")) {
        previewURL = URL.createObjectURL(file);
        previewImage.src = previewURL;
        previewImage.style.display = "block";
    } else {
        previewImage.removeAttribute("src");
        previewImage.style.display = "none";
    }

    uploadContent.style.display = "none";
    imagePreview.style.display = "flex";

    if (file.type === "application/pdf") {
        fileName.textContent = file.name + " (PDF file)";
    }

    if (file.type === "video/mp4") {
        fileName.textContent = file.name + " (MP4 video)";
    }

    uploadNote.textContent = "File selected successfully.";
}


// REMOVE SELECTED FILE

removeFileButton.addEventListener("click", () => {
    selectedFile = null;

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    productImage.value = "";
    previewImage.removeAttribute("src");

    imagePreview.style.display = "none";
    uploadContent.style.display = "flex";

    uploadNote.textContent = "You can upload one product photo at a time.";
});


// DRAG AND DROP

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (file) {
        handleFile(file);

        const transfer = new DataTransfer();
        transfer.items.add(file);
        productImage.files = transfer.files;
    }
});


// NEXT BUTTON

nextButton.addEventListener("click", () => {
    if (!productForm.reportValidity()) {
        return;
    }

    const draft = {
        name: document.getElementById("productName").value.trim(),
        description: document.getElementById("productDescription").value.trim(),
        variation: document.getElementById("productVariation").value || "No Variation",
        brand: document.getElementById("productBrand").value,
        category: document.getElementById("productCategory").value || "Other",
        imageName: selectedFile ? selectedFile.name : ""
    };

    sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    window.location.href = "../pages/inventory-hub-add-product-pricing.html";
});

// Restore the first step if the user goes back from pricing.
const savedDraft = sessionStorage.getItem(draftStorageKey);
if (savedDraft) {
    const draft = JSON.parse(savedDraft);
    document.getElementById("productName").value = draft.name || "";
    document.getElementById("productDescription").value = draft.description || "";
    document.getElementById("productVariation").value = draft.variation || "";
    document.getElementById("productBrand").value = draft.brand || "";
    document.getElementById("productCategory").value = draft.category || "";
}