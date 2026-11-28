
document.addEventListener("DOMContentLoaded", function () {

    const addUserForm = document.getElementById("addUserForm");

    const fullName = document.getElementById("fullName");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");

    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");

    const toast = document.getElementById("toast");

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    addUserForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const enteredFullName = fullName.value.trim();
        const enteredUsername = username.value.trim();
        const enteredEmail = email.value.trim();
        const enteredNewPassword = newPassword.value;
        const enteredConfirmPassword = confirmPassword.value;

        if (
            enteredFullName === "" ||
            enteredUsername === "" ||
            enteredEmail === ""
        ) {
            showToast("Please complete all required fields.");
            return;
        }

        if (
            enteredNewPassword === "" ||
            enteredConfirmPassword === ""
        ) {
            showToast("Please enter and confirm the new password.");
            return;
        }

        if (enteredNewPassword.length < 8) {
            showToast("Password must have at least 8 characters.");
            newPassword.focus();
            return;
        }

        if (enteredNewPassword !== enteredConfirmPassword) {
            showToast("Passwords do not match.");
            confirmPassword.focus();
            return;
        }

        let staffUsers = [];

        const savedUsers = localStorage.getItem("thVapeshopStaff");

        if (savedUsers) {
            try {
                staffUsers = JSON.parse(savedUsers);

                if (!Array.isArray(staffUsers)) {
                    staffUsers = [];
                }
            } catch (error) {
                staffUsers = [];
            }
        }

        const usernameExists = staffUsers.some(function (user) {
            return user.username &&
                user.username.toLowerCase() === enteredUsername.toLowerCase();
        });

        if (usernameExists) {
            showToast("This username is already registered.");
            username.focus();
            return;
        }

        const emailExists = staffUsers.some(function (user) {
            return user.email &&
                user.email.toLowerCase() === enteredEmail.toLowerCase();
        });

        if (emailExists) {
            showToast("This email is already registered.");
            email.focus();
            return;
        }

        const newStaff = {
            id: Date.now(),
            fullName: enteredFullName,
            username: enteredUsername,
            email: enteredEmail,
            phone: phone.value.trim(),
            address: address.value.trim(),
            role: "Staff"
        };

        staffUsers.push(newStaff);

        localStorage.setItem(
            "thVapeshopStaff",
            JSON.stringify(staffUsers)
        );

        addUserForm.reset();

        showToast("Staff account added successfully.");

    });

});
