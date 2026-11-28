
document.addEventListener("DOMContentLoaded", function () {

    const backupStatus = document.getElementById("backupStatus");
    const backupFrequency = document.getElementById("backupFrequency");
    const lastBackupDate = document.getElementById("lastBackupDate");

    const createBackupButton = document.getElementById("createBackupButton");
    const downloadBackupButton = document.getElementById("downloadBackupButton");
    const restoreBackupButton = document.getElementById("restoreBackupButton");

    const restoreModal = document.getElementById("restoreModal");
    const cancelRestore = document.getElementById("cancelRestore");
    const confirmRestore = document.getElementById("confirmRestore");

    const toast = document.getElementById("toast");

    let automaticBackupEnabled = true;
    let latestBackupCreated = true;

    // DISPLAY TOAST MESSAGE
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    // AUTOMATIC BACKUP STATUS
    backupStatus.addEventListener("click", function () {

        automaticBackupEnabled = !automaticBackupEnabled;

        if (automaticBackupEnabled) {
            backupStatus.textContent = "Enabled";
            backupStatus.classList.remove("disabled");
            backupStatus.classList.add("enabled");

            showToast("Automatic backup enabled.");
        } else {
            backupStatus.textContent = "Disabled";
            backupStatus.classList.remove("enabled");
            backupStatus.classList.add("disabled");

            showToast("Automatic backup disabled.");
        }
    });

    backupStatus.style.cursor = "pointer";

    // BACKUP FREQUENCY
    backupFrequency.addEventListener("change", function () {
        showToast("Backup frequency set to " + backupFrequency.value + ".");
    });

    // CREATE BACKUP
    createBackupButton.addEventListener("click", function () {

        createBackupButton.disabled = true;
        createBackupButton.textContent = "Creating Backup...";

        setTimeout(function () {

            const currentDate = new Date();

            lastBackupDate.textContent = currentDate.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );

            latestBackupCreated = true;

            createBackupButton.disabled = false;
            createBackupButton.textContent = "Create Backup Now";

            showToast("Backup created successfully.");

        }, 1200);
    });

    // DOWNLOAD BACKUP
    downloadBackupButton.addEventListener("click", function () {

        if (!latestBackupCreated) {
            showToast("No backup is available to download.");
            return;
        }

        showToast("Backup download is not connected to the database yet.");
    });

    // OPEN RESTORE CONFIRMATION
    restoreBackupButton.addEventListener("click", function () {
        restoreModal.classList.add("show");
    });

    // CLOSE RESTORE CONFIRMATION
    cancelRestore.addEventListener("click", function () {
        restoreModal.classList.remove("show");
    });

    // CONFIRM RESTORE
    confirmRestore.addEventListener("click", function () {

        restoreModal.classList.remove("show");

        showToast("Database restore is not connected yet.");
    });

    // CLOSE MODAL WHEN CLICKING OUTSIDE
    restoreModal.addEventListener("click", function (event) {

        if (event.target === restoreModal) {
            restoreModal.classList.remove("show");
        }
    });

});
