const accountForm = document.getElementById("accountForm");
const formMessage = document.getElementById("formMessage");

accountForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const newPassword = accountForm.elements.newPassword.value;
  const confirmPassword = accountForm.elements.confirmPassword.value;
  const oldPassword = accountForm.elements.oldPassword.value;

  formMessage.classList.remove("error");

  if (newPassword || confirmPassword) {
    if (!oldPassword) {
      showMessage("Enter your old password before changing it.", true);
      accountForm.elements.oldPassword.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("New password and confirmation do not match.", true);
      accountForm.elements.confirmPassword.focus();
      return;
    }
  }

  showMessage("Changes validated. Backend connection is needed to save them.");
});

function showMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", Boolean(isError));
}
