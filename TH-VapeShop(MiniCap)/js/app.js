// Shared sign-in, navigation, and logout behavior for the whole demo.
(function () {
  "use strict";

  var currentFile = window.location.pathname.split("/").pop() || "index.html";
  var isLoginPage = currentFile === "index.html";
  var isPagesFolder = /\/pages\/[^/]+$/i.test(window.location.pathname);
  var rootPath = isPagesFolder ? "../" : "./";

  // Keep the demo pages private until the login form has been used.
  if (!isLoginPage && sessionStorage.getItem("thv_loggedIn") !== "1") {
    window.location.replace(rootPath + "index.html");
    return;
  }

  if (isLoginPage) {
    return;
  }

  var pages = [
    { file: "dashboard.html", label: "Dashboard" },
    { file: "inventory.html", label: "Inventory Hub" },
    { file: "inventory-hub-add-product.html", label: "Add Product" },
    { file: "inventory-hub-add-product-pricing.html", label: "Product Pricing" },
    { file: "edit-product-list.html", label: "Edit Product List" },
    { file: "edit-product.html", label: "Edit Product" },
    { file: "product-overview.html", label: "Product Overview" },
    { file: "product-history.html", label: "Product History" },
    { file: "activity-log.html", label: "Activity Log" },
    { file: "sales-management.html", label: "Sales Management" },
    { file: "sales-management-new-order.html", label: "Point of Sale" },
    { file: "new-order.html", label: "Legacy New Order" },
    { file: "sales-management-view-all-orders.html", label: "Sales Orders" },
    { file: "view-all-orders.html", label: "Legacy Orders" },
    { file: "sales-report.html", label: "Sales Report" },
    { file: "sales-report-best-selling-products.html", label: "Best Selling Products" },
    { file: "sales-report-completed-orders.html", label: "Completed Orders" },
    { file: "sales-report-completed-orders-view-order.html", label: "Completed Order Details" },
    { file: "settings.html", label: "Settings" },
    { file: "settings-admin-account-information.html", label: "Admin Account" },
    { file: "settings-user-management.html", label: "User Management" },
    { file: "settings-user-manager-add-user.html", label: "Add Staff User" },
    { file: "settings-user-management-account-edit.html", label: "Edit Staff Account" },
    { file: "settings-data-management.html", label: "Data Management" }
  ];

  function pageLink(file, label) {
    var link = document.createElement("a");
    link.href = rootPath + "pages/" + file;
    link.textContent = label;
    if (file === currentFile) {
      link.setAttribute("aria-current", "page");
    }
    return link;
  }

  function makeGroup(label, fileNames) {
    var group = document.createElement("details");
    var summary = document.createElement("summary");
    var children = document.createElement("div");
    group.className = "app-nav-group";
    children.className = "app-nav-children";
    summary.textContent = label;

    fileNames.forEach(function (file) {
      var page = pages.find(function (item) { return item.file === file; });
      if (page) {
        children.appendChild(pageLink(page.file, page.label));
        if (page.file === currentFile) {
          group.open = true;
        }
      }
    });

    group.appendChild(summary);
    group.appendChild(children);
    return group;
  }

  function addAppShell() {
    var oldNotification = document.querySelector(
      "body > header.topbar .notification-button, body > header.topbar #notificationButton, body > header.topbar .bell"
    );
    var oldShell = document.querySelectorAll("body > aside.sidebar, body > header.topbar");
    Array.prototype.forEach.call(oldShell, function (element) {
      element.remove();
    });

    var content = document.createElement("div");
    content.className = "app-content";
    Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
      if (node.nodeType === 1 && node.tagName.toLowerCase() === "script") {
        return;
      }
      content.appendChild(node);
    });

    var footer = document.createElement("footer");
    footer.className = "app-footer";
    footer.textContent = "TH VapeShop - Inventory Management Demo";
    content.appendChild(footer);

    var sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";
    sidebar.setAttribute("aria-label", "Main navigation");

    var brand = document.createElement("a");
    brand.className = "app-brand";
    brand.href = rootPath + "pages/dashboard.html";
    brand.innerHTML = '<span class="app-brand-mark" aria-hidden="true">TH</span><span>TH VapeShop</span>';
    sidebar.appendChild(brand);

    var nav = document.createElement("nav");
    nav.className = "app-nav";
    nav.setAttribute("aria-label", "Pages");
    nav.appendChild(pageLink("dashboard.html", "Dashboard"));
    nav.appendChild(makeGroup("Inventory", [
      "inventory.html",
      "inventory-hub-add-product.html",
      "inventory-hub-add-product-pricing.html",
      "edit-product-list.html",
      "edit-product.html",
      "product-overview.html",
      "product-history.html"
    ]));
    nav.appendChild(makeGroup("Sales", [
      "sales-management.html",
      "sales-management-new-order.html",
      "new-order.html",
      "sales-management-view-all-orders.html",
      "view-all-orders.html"
    ]));
    nav.appendChild(makeGroup("Reports", [
      "sales-report.html",
      "sales-report-best-selling-products.html",
      "sales-report-completed-orders.html",
      "sales-report-completed-orders-view-order.html"
    ]));
    nav.appendChild(makeGroup("Administration", [
      "settings.html",
      "settings-admin-account-information.html",
      "settings-user-management.html",
      "settings-user-manager-add-user.html",
      "settings-user-management-account-edit.html",
      "settings-data-management.html"
    ]));
    nav.appendChild(pageLink("activity-log.html", "Activity Log"));
    sidebar.appendChild(nav);

    var logout = document.createElement("button");
    logout.className = "app-logout";
    logout.type = "button";
    logout.textContent = "Log out";
    logout.addEventListener("click", function () {
      sessionStorage.removeItem("thv_loggedIn");
      window.location.href = rootPath + "index.html";
    });
    sidebar.appendChild(logout);

    var topbar = document.createElement("header");
    topbar.className = "app-topbar";
    var menuButton = document.createElement("button");
    menuButton.className = "app-menu-toggle";
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", "Toggle navigation menu");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "Menu";
    menuButton.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("app-menu-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
    topbar.appendChild(menuButton);

    var title = document.createElement("div");
    title.className = "app-page-title";
    title.textContent = document.title.split("|")[0].split("-")[0].trim();
    topbar.appendChild(title);

    if (oldNotification) {
      oldNotification.id = oldNotification.id || "notificationButton";
      oldNotification.classList.add("app-notifications");
      oldNotification.addEventListener("click", function () {
        window.alert("There are no new notifications.");
      });
      topbar.appendChild(oldNotification);
    } else {
      var notificationButton = document.createElement("button");
      notificationButton.className = "app-notifications";
      notificationButton.id = "notificationButton";
      notificationButton.type = "button";
      notificationButton.setAttribute("aria-label", "Notifications");
      var notificationIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      notificationIcon.setAttribute("viewBox", "0 0 24 24");
      notificationIcon.setAttribute("aria-hidden", "true");
      var notificationPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      notificationPath.setAttribute("d", "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4");
      notificationIcon.appendChild(notificationPath);
      notificationButton.appendChild(notificationIcon);
      notificationButton.addEventListener("click", function () {
        window.alert("There are no new notifications.");
      });
      topbar.appendChild(notificationButton);
    }

    var user = document.createElement("div");
    user.className = "app-user-label";
    user.textContent = "Signed in";
    topbar.appendChild(user);

    document.body.classList.add("app-view");
    document.body.insertBefore(content, document.body.firstChild);
    document.body.insertBefore(topbar, content);
    document.body.insertBefore(sidebar, topbar);

    content.addEventListener("click", function (event) {
      if (window.innerWidth <= 760 && document.body.classList.contains("app-menu-open")) {
        document.body.classList.remove("app-menu-open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addAppShell);
  } else {
    addAppShell();
  }
}());
