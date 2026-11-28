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

  function pageLink(file, label, icon, active) {
    var link = document.createElement("a");
    link.href = rootPath + "pages/" + file;
    link.innerHTML = icon + "<span>" + label + "</span>";
    if (active) {
      link.setAttribute("aria-current", "page");
    }
    return link;
  }

  function activeSection() {
    if (currentFile === "dashboard.html") return "dashboard";
    if (/^(inventory|inventory-hub|edit-product|product-)/.test(currentFile)) return "inventory";
    if (/^(sales-management|new-order|view-all-orders)/.test(currentFile)) return "sales";
    if (/^sales-report/.test(currentFile)) return "reports";
    if (/^settings/.test(currentFile)) return "settings";
    if (currentFile === "activity-log.html") return "activity";
    return "";
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

    var sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";
    sidebar.setAttribute("aria-label", "Main navigation");

    var brand = document.createElement("a");
    brand.className = "app-brand";
    brand.href = rootPath + "pages/dashboard.html";
    brand.innerHTML = '<img src="' + rootPath + 'assets/logo-small.png" alt=""><span>TH Vapeshop</span>';
    sidebar.appendChild(brand);

    var nav = document.createElement("nav");
    nav.className = "app-nav";
    nav.setAttribute("aria-label", "Pages");
    var icons = {
      dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h7V4H4zM15 20h5v-9h-5zM4 20h7v-3H4zM15 8h5V4h-5z"/></svg>',
      sales: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18l-2 12H5L3 7zM3 7l-1-3h4l2 3M8 11v4m4-4v4m4-4v4M7 19l-1 2m11-2 1 2"/></svg>',
      inventory: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4m-9 4v10"/></svg>',
      reports: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10m6 10V4m6 16v-7m6 7H2"/></svg>',
      settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4L5.5 15a8 8 0 0 1 0-1.9l-1.4-1.2 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.2a8 8 0 0 1-.1 1.9z"/></svg>',
      activity: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
      logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></svg>'
    };
    var section = activeSection();
    [
      { file: "dashboard.html", label: "Dashboard", key: "dashboard" },
      { file: "sales-management.html", label: "Sales Management", key: "sales" },
      { file: "inventory.html", label: "Inventory Hub", key: "inventory" },
      { file: "sales-report.html", label: "Sales Report", key: "reports" },
      { file: "settings.html", label: "Settings", key: "settings" },
      { file: "activity-log.html", label: "Recent Activities", key: "activity" }
    ].forEach(function (item) {
      nav.appendChild(pageLink(item.file, item.label, icons[item.key], section === item.key));
    });
    sidebar.appendChild(nav);

    var logout = document.createElement("button");
    logout.className = "app-logout";
    logout.type = "button";
    logout.innerHTML = icons.logout + "<span>Sign Out</span>";
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
      var notificationDot = document.createElement("span");
      notificationDot.className = "notification-dot";
      notificationDot.setAttribute("aria-hidden", "true");
      notificationButton.appendChild(notificationDot);
      notificationButton.addEventListener("click", function () {
        window.alert("There are no new notifications.");
      });
      topbar.appendChild(notificationButton);
    }

    var user = document.createElement("div");
    user.className = "app-user-label";
    user.innerHTML =
      '<img src="' + rootPath + 'assets/avatar.jpg" alt="">' +
      '<span><strong>Roroy Maur</strong><small>Admin</small></span>' +
      '<span class="app-user-chevron" aria-hidden="true">⌄</span>';
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
