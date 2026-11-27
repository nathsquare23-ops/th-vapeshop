
document.addEventListener("DOMContentLoaded", function () {

    const accountForm = document.getElementById("accountForm");

    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const username = document.getElementById("username");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");

    const oldPassword = document.getElementById("oldPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");

    const accountDisplayName = document.getElementById("accountDisplayName");
    const accountDisplayEmail = document.getElementById("accountDisplayEmail");

    const saveButton = document.querySelector(".save-button");
    const toast = document.getElementById("toast");

    // DISPLAY MESSAGE
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    // LOAD SAVED ACCOUNT DETAILS
    const savedAccount = localStorage.getItem("thVapeshopAccount");

    if (savedAccount) {
        const account = JSON.parse(savedAccount);

        fullName.value = account.fullName || fullName.value;
        email.value = account.email || email.value;
        username.value = account.username || username.value;
        phone.value = account.phone || "";
        address.value = account.address || "";

        accountDisplayName.textContent = fullName.value;
        accountDisplayEmail.textContent = email.value;
    }

    // SAVE ACCOUNT DETAILS
    accountForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const enteredOldPassword = oldPassword.value.trim();
        const enteredNewPassword = newPassword.value.trim();
        const enteredConfirmPassword = confirmPassword.value.trim();

        // CHECK IF THE USER WANTS TO CHANGE PASSWORD
        const changingPassword =
            enteredOldPassword !== "" ||
            enteredNewPassword !== "" ||
            enteredConfirmPassword !== "";

        if (changingPassword) {

            if (!enteredOldPassword) {
                showToast("Please enter your old password.");
                oldPassword.focus();
                return;
            }

            if (!enteredNewPassword) {
                showToast("Please enter your new password.");
                newPassword.focus();
                return;
            }

            if (!enteredConfirmPassword) {
                showToast("Please confirm your new password.");
                confirmPassword.focus();
                return;
            }

            if (enteredNewPassword !== enteredConfirmPassword) {
                showToast("New passwords do not match.");
                confirmPassword.focus();
                return;
            }

            if (enteredNewPassword.length < 8) {
                showToast("Your new password must have at least 8 characters.");
                newPassword.focus();
                return;
            }

            showToast("Password changes require database verification.");

            return;
        }

        // CHECK REQUIRED ACCOUNT DETAILS
        if (
            !fullName.value.trim() ||
            !email.value.trim() ||
            !username.value.trim()
        ) {
            showToast("Please complete all required fields.");
            return;
        }

        // COLLECT ACCOUNT DETAILS
        const updatedAccount = {
            fullName: fullName.value.trim(),
            email: email.value.trim(),
            username: username.value.trim(),
            phone: phone.value.trim(),
            address: address.value.trim()
        };

        // SAVE ACCOUNT DETAILS FOR FRONTEND DEMONSTRATION
        localStorage.setItem(
            "thVapeshopAccount",
            JSON.stringify(updatedAccount)
        );

        // UPDATE ACCOUNT HEADER
        accountDisplayName.textContent = updatedAccount.fullName;
        accountDisplayEmail.textContent = updatedAccount.email;

        // CLEAR PASSWORD FIELDS
        oldPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";

        showToast("Account details saved successfully.");

    });

});
