const searchInput = document.getElementById("searchInput");
const userTableBody = document.getElementById("userTableBody");

const addStaffButton = document.getElementById("addStaffButton");
const staffModal = document.getElementById("staffModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");

const staffForm = document.getElementById("staffForm");
const modalTitle = document.getElementById("modalTitle");

const staffName = document.getElementById("staffName");
const staffEmail = document.getElementById("staffEmail");
const staffUsername = document.getElementById("staffUsername");

const selectAll = document.getElementById("selectAll");

let editingRow = null;

/* SEARCH USERS */

searchInput.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();
    const rows = userTableBody.querySelectorAll("tr");

    rows.forEach(function (row) {
        const rowText = row.textContent.toLowerCase();

        if (rowText.includes(searchValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

/* OPEN ADD STAFF MODAL */

addStaffButton.addEventListener("click", function () {
    editingRow = null;
    staffForm.reset();

    modalTitle.textContent = "Add Staff";
    staffModal.classList.add("show");
});

/* CLOSE MODAL */

function hideModal() {
    staffModal.classList.remove("show");
    staffForm.reset();
    editingRow = null;
}

closeModal.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);

staffModal.addEventListener("click", function (event) {
    if (event.target === staffModal) {
        hideModal();
    }
});

/* SAVE NEW STAFF OR EDIT EXISTING STAFF */

staffForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = staffName.value.trim();
    const email = staffEmail.value.trim();
    const username = staffUsername.value.trim();

    if (!name || !email || !username) {
        alert("Please complete all fields.");
        return;
    }

    if (editingRow) {
        editingRow.querySelector(".name-cell").lastChild.textContent = name;
        editingRow.children[2].textContent = email;
        editingRow.children[3].textContent = username;

        alert("Staff information updated successfully.");
    } else {
        const newRow = document.createElement("tr");

        const currentDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        newRow.innerHTML = `
            <td>
                <input type="checkbox" class="row-checkbox">
            </td>

            <td class="name-cell">
                <div class="default-avatar">${name.charAt(0).toUpperCase()}</div>
                ${name}
            </td>

            <td>${email}</td>
            <td>${username}</td>
            <td>${currentDate}</td>

            <td class="actions-cell">
                <button class="edit-button" title="Edit">✎</button>
                <button class="delete-button" title="Delete">♜</button>
            </td>
        `;

        userTableBody.appendChild(newRow);

        alert("Staff account added successfully.");
    }

    hideModal();
});

/* EDIT AND DELETE STAFF */

userTableBody.addEventListener("click", function (event) {
    const clickedButton = event.target.closest("button");

    if (!clickedButton) {
        return;
    }

    const row = clickedButton.closest("tr");

    if (clickedButton.classList.contains("edit-button")) {
        editingRow = row;

        staffName.value = row.children[1].textContent.trim();
        staffEmail.value = row.children[2].textContent.trim();
        staffUsername.value = row.children[3].textContent.trim();

        modalTitle.textContent = "Edit Staff";
        staffModal.classList.add("show");
    }

    if (clickedButton.classList.contains("delete-button")) {
        const staffMember = row.children[1].textContent.trim();

        const confirmDelete = confirm(
            "Are you sure you want to delete " + staffMember + "?"
        );

        if (confirmDelete) {
            row.remove();
        }
    }
});

/* SELECT ALL CHECKBOXES */

selectAll.addEventListener("change", function () {
    const checkboxes = userTableBody.querySelectorAll(".row-checkbox");

    checkboxes.forEach(function (checkbox) {
        checkbox.checked = selectAll.checked;
    });
});

/* UPDATE SELECT ALL CHECKBOX */

userTableBody.addEventListener("change", function (event) {
    if (!event.target.classList.contains("row-checkbox")) {
        return;
    }

    const checkboxes = userTableBody.querySelectorAll(".row-checkbox");
    const checkedBoxes = userTableBody.querySelectorAll(".row-checkbox:checked");

    selectAll.checked = checkboxes.length === checkedBoxes.length;
});
