// =====================================================================
//  TH Vapeshop - script.js
//  ONE file for ALL pages. It checks which page is open and only runs
//  the code for that page.
//  Add this line to every HTML page, just ABOVE the fit-screen.js line:
//      <script src="script.js"></script>
// =====================================================================
(function () {
  "use strict";

  // Set to false if you want to open any page directly without logging in.
  var REQUIRE_LOGIN = true;

  // ---------------------------------------------------------------
  // 1. SMALL HELPERS
  // ---------------------------------------------------------------
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  // which page is open? (e.g. "dashboard.html")
  var page = location.pathname.split("/").pop() || "index.html";

  // save / load things in the browser (localStorage)
  function load(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  // "logged in" flag (forgotten when the tab is closed)
  function isLoggedIn() {
    try { return sessionStorage.getItem("thv_loggedIn") === "1"; } catch (e) { return true; }
  }

  function setLoggedIn(on) {
    try {
      if (on) sessionStorage.setItem("thv_loggedIn", "1");
      else sessionStorage.removeItem("thv_loggedIn");
    } catch (e) {}
  }

  // stop people from opening inner pages without logging in
  if (REQUIRE_LOGIN && page !== "index.html" && !isLoggedIn()) {
    location.replace("../index.html");
    return;
  }

  // make text safe to put inside HTML
  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // "₱1,000" -> 1000
  function parseNumber(text) {
    var n = parseFloat(String(text).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  }

  // 5000.6 -> "₱5,000.6"
  function peso(n) {
    return "₱" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function todayText() {
    return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s") + " ago";
  }

  // 1700000000000 -> "5 min ago"
  function timeAgo(ms) {
    var secs = Math.floor((Date.now() - ms) / 1000);
    if (secs < 60) return plural(Math.max(secs, 1), "sec");
    var mins = Math.floor(secs / 60);
    if (mins < 60) return mins + " min ago";
    var hours = Math.floor(mins / 60);
    if (hours < 24) return plural(hours, "hour");
    var days = Math.floor(hours / 24);
    if (days < 30) return plural(days, "day");
    return new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  // alternate row shading (every 2nd row gets the "shade" class)
  function reshade(items) {
    items.forEach(function (el, i) {
      el.classList.toggle("shade", i % 2 === 1);
    });
  }

  // small message at the bottom of the screen
  function toast(message) {
    var box = document.createElement("div");
    box.textContent = message;
    box.style.cssText =
      "position:fixed;left:50%;bottom:40px;transform:translateX(-50%);" +
      "background:#232323;color:#fff;padding:14px 26px;border-radius:10px;" +
      "font:500 18px Inter,sans-serif;z-index:9999;max-width:90%;text-align:center;" +
      "box-shadow:0 6px 20px rgba(0,0,0,.35);";
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 2600);
  }

  // ---------------------------------------------------------------
  // 2. POP-UP BOXES (used by the bell and the Filters buttons)
  // ---------------------------------------------------------------
  var openPopover = null;

  function closePopover() {
    if (openPopover) {
      openPopover.remove();
      openPopover = null;
    }
  }

  // shows a white box under a button; clicking the button again hides it
  function togglePopover(anchor, build, width) {
    if (openPopover && openPopover._anchor === anchor) {
      closePopover();
      return;
    }
    closePopover();

    var container = anchor.parentElement;
    container.style.position = "relative";

    var pop = document.createElement("div");
    pop._anchor = anchor;
    pop.style.cssText =
      "position:absolute;z-index:500;background:#fff;color:#222;" +
      "border:1px solid #d4d4d4;border-radius:10px;padding:18px;" +
      "box-shadow:0 8px 24px rgba(0,0,0,.25);font:400 18px Inter,sans-serif;width:" + width + "px;";
    pop.style.top = (anchor.offsetTop + anchor.offsetHeight + 8) + "px";
    pop.style.left = Math.max(0, anchor.offsetLeft + anchor.offsetWidth - width) + "px";

    build(pop);
    container.appendChild(pop);
    openPopover = pop;
  }

  // click anywhere else = close the pop-up
  document.addEventListener("click", function (e) {
    if (openPopover && !openPopover.contains(e.target) && !openPopover._anchor.contains(e.target)) {
      closePopover();
    }
  });

  // Filters button: dropdown boxes that change what rows are shown.
  // fields = [{ name: "Category", options: ["All", "Juice", ...] }, ...]
  // onChange(state) runs every time a dropdown changes.
  function makeFilter(button, fields, onChange) {
    var state = {};
    fields.forEach(function (f) { state[f.name] = f.options[0]; });

    function markActive() {
      var active = fields.some(function (f) { return state[f.name] !== f.options[0]; });
      button.style.borderColor = active ? "#1565d8" : "";
      button.style.color = active ? "#1565d8" : "";
    }

    button.addEventListener("click", function () {
      togglePopover(button, function (pop) {
        var html = "";
        fields.forEach(function (f) {
          html += '<div style="font-size:16px;color:#555;margin-bottom:6px;">' + f.name + "</div>";
          html += '<select data-field="' + f.name + '" style="width:100%;height:40px;margin-bottom:14px;' +
                  'border:1px solid #bbb;border-radius:6px;font-size:16px;padding:0 8px;background:#fff;">';
          f.options.forEach(function (o) {
            html += "<option" + (state[f.name] === o ? " selected" : "") + ">" + o + "</option>";
          });
          html += "</select>";
        });
        html += '<div data-reset style="text-align:right;color:#1565d8;font-size:16px;cursor:pointer;">Reset filters</div>';
        pop.innerHTML = html;

        $$("select", pop).forEach(function (select) {
          select.addEventListener("change", function () {
            state[select.getAttribute("data-field")] = select.value;
            markActive();
            onChange(state);
          });
        });

        $("[data-reset]", pop).addEventListener("click", function () {
          fields.forEach(function (f) { state[f.name] = f.options[0]; });
          $$("select", pop).forEach(function (select) { select.selectedIndex = 0; });
          markActive();
          onChange(state);
        });
      }, 260);
    });

    return state;
  }

  // Previous / Next buttons with "Page 1 of 10" text
  function setupPagination(prev, next, label) {
    if (!prev || !next || !label) return;
    var current = 1;
    var total = 10;
    var told = false;

    function draw() {
      label.textContent = "Page " + current + " of " + total;
      prev.style.opacity = current === 1 ? ".5" : "";
      next.style.opacity = current === total ? ".5" : "";
    }

    function note() {
      if (!told) {
        told = true;
        toast("Sample data: the same rows show on every page until a database is connected.");
      }
    }

    prev.addEventListener("click", function () {
      if (current > 1) { current--; draw(); note(); }
    });
    next.addEventListener("click", function () {
      if (current < total) { current++; draw(); note(); }
    });
    draw();
  }

  // ---------------------------------------------------------------
  // 3. ACTIVITY LOG DATA (shared by several pages)
  //    Every change you make is remembered here.
  // ---------------------------------------------------------------
  function addActivity(product, full, short) {
    var log = load("thv_activity", []);
    // full  = sentence with the product name (activity log, inventory)
    // short = sentence without the name (product history)
    log.unshift({ product: product, full: full, short: short, time: Date.now() });
    save("thv_activity", log.slice(0, 50));
  }

  function getActivity() {
    return load("thv_activity", []);
  }

  // ---------------------------------------------------------------
  // 4. SHARED PARTS (sidebar + top bar on every page except login)
  // ---------------------------------------------------------------
  function setupSharedParts() {
    // Bell: shows low-stock notifications and hides the red dot
    var bell = $(".bell");
    if (bell) {
      bell.addEventListener("click", function () {
        var dot = $(".dot", bell);
        if (dot) dot.style.display = "none";

        togglePopover(bell, function (pop) {
          pop.innerHTML =
            '<div style="font-weight:600;font-size:20px;margin-bottom:10px;">Notifications</div>' +
            '<div style="padding:8px 0;border-top:1px solid #eee;font-size:16px;color:#e11d1d;">Vape Pod IV Max is out of stock</div>' +
            '<div style="padding:8px 0;border-top:1px solid #eee;font-size:16px;">Vape Juice X (30ml) has 3 units left</div>' +
            '<div style="padding:8px 0;border-top:1px solid #eee;font-size:16px;">Vape Juice III Y has 6 units left</div>' +
            '<div style="padding:8px 0;border-top:1px solid #eee;font-size:16px;">Vape Box Mod V has 8 units left</div>' +
            '<div style="padding:8px 0;border-top:1px solid #eee;font-size:16px;">Vape Pod II has 10 units left</div>' +
            '<a href="../pages/inventory.html" style="display:block;margin-top:10px;font-size:16px;color:#1565d8;">Go to Inventory Hub &rarr;</a>';
        }, 360);
      });
    }

    // Links that go nowhere yet + Sign Out
    document.addEventListener("click", function (e) {
      var link = e.target.closest ? e.target.closest("a") : null;
      if (!link || e.defaultPrevented) return;

      if (link.classList.contains("signout")) {
        if (confirm("Sign out of TH Vapeshop?")) {
          setLoggedIn(false);
        } else {
          e.preventDefault();
        }
        return;
      }

      if (link.getAttribute("href") === "#") {
        e.preventDefault();
        toast("This page isn't built yet.");
      }
    });
  }

  // ---------------------------------------------------------------
  // 5. LOGIN PAGE (index.html)
  // ---------------------------------------------------------------
  function loginPage() {
    var form = $("form");
    var email = $("#email");
    var password = $("#password");
    var remember = $("input[name='remember']");
    var forgot = $(".forgot");

    // fill the email back in if "Remember" was ticked before
    var savedEmail = load("thv_email", "");
    if (savedEmail) {
      email.value = savedEmail;
      remember.checked = true;
    }

    // red message under the form
    var error = document.createElement("p");
    error.style.cssText = "color:#ff6b6b;font-size:16px;text-align:center;margin:-22px 0 18px;min-height:20px;";
    $("button[type='submit']", form).before(error);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailText = email.value.trim();
      var looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailText);

      if (!emailText) {
        error.textContent = "Please enter your email.";
        email.focus();
        return;
      }
      if (!looksLikeEmail) {
        error.textContent = "That email doesn't look right. Example: name@email.com";
        email.focus();
        return;
      }
      if (password.value.length < 8) {
        error.textContent = "Password must be at least 8 characters.";
        password.focus();
        return;
      }

      // (school demo: any valid email + 8 character password works)
      save("thv_email", remember.checked ? emailText : "");
      setLoggedIn(true);
      location.href = "pages/dashboard.html";
    });

    [email, password].forEach(function (input) {
      input.addEventListener("input", function () { error.textContent = ""; });
    });

    forgot.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Password reset isn't available in this demo.");
    });
  }

  // ---------------------------------------------------------------
  // 6. DASHBOARD (dashboard.html)
  // ---------------------------------------------------------------
  function dashboardPage() {
    // put today's date in the card titles
    $$(".card-title").forEach(function (title) {
      if (/Today/.test(title.textContent)) {
        title.textContent = title.textContent.replace(/\|.*$/, "| " + todayText());
      }
    });

    // stock bars grow when the page opens
    $$(".alert-bar .fill").forEach(function (fill) {
      var width = fill.style.width;
      fill.style.width = "0%";
      fill.style.transition = "width .8s ease";
      setTimeout(function () { fill.style.width = width; }, 80);
    });

    // search: press Enter to look the product up in the Inventory Hub
    var search = $(".search input");
    if (search) {
      search.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && search.value.trim()) {
          location.href = "../pages/inventory.html?q=" + encodeURIComponent(search.value.trim());
        }
      });
    }

    // click an alert or a top-selling item -> open it in the Inventory Hub
    $$(".alert-row, .top-item").forEach(function (row) {
      var nameEl = $(".alert-name, .top-name", row);
      if (!nameEl) return;
      row.style.cursor = "pointer";
      row.addEventListener("click", function () {
        var name = nameEl.textContent.replace(/\(.*\)/, "").trim();
        location.href = "../pages/inventory.html?q=" + encodeURIComponent(name);
      });
    });
  }

  // ---------------------------------------------------------------
  // 7. INVENTORY HUB (inventory.html)
  // ---------------------------------------------------------------
  function availabilityOf(qty) {
    if (qty <= 0) return { cls: "out", label: "Out of stock" };
    if (qty <= 10) return { cls: "low", label: "Low stock" };
    return { cls: "in", label: "In-stock" };
  }

  function inventoryPage() {
    var tbody = $("table tbody");
    var search = $(".search input");
    var statNums = $$(".stats .stat .num"); // Total Units, Products, Low Stock, Out of Stock

    // stock bars grow when the page opens
    $$(".dist-row .fill").forEach(function (fill) {
      var width = fill.style.width;
      fill.style.width = "0%";
      fill.style.transition = "width .8s ease";
      setTimeout(function () { fill.style.width = width; }, 80);
    });

    // --- build one table row for a product we added ---
    function makeRow(p) {
      var av = availabilityOf(p.qty);
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="left"><a href="../pages/product-overview.html" class="product-link">' + esc(p.name) + "</a></td>" +
        "<td>" + esc(p.category) + "</td>" +
        "<td>" + peso(p.price) + "</td>" +
        "<td>" + esc(p.variation) + "</td>" +
        "<td>" + p.qty + "</td>" +
        '<td class="' + av.cls + '">' + av.label + "</td>" +
        '<td class="date">' + esc(p.created) + "</td>";
      return tr;
    }

    // --- keep the four number boxes up to date ---
    function bumpStats(p) {
      var av = availabilityOf(p.qty);
      function add(index, amount) {
        if (statNums[index]) statNums[index].textContent = parseNumber(statNums[index].textContent) + amount;
      }
      add(0, p.qty);
      add(1, 1);
      if (av.cls === "low") add(2, 1);
      if (av.cls === "out") add(3, 1);
    }

    // products added earlier come back every time the page opens
    load("thv_added", []).slice().reverse().forEach(function (p) {
      tbody.insertBefore(makeRow(p), tbody.firstChild);
      bumpStats(p);
    });

    // --- search + filters ---
    var classOf = { "In-stock": "in", "Out of stock": "out", "Low stock": "low" };
    var noResults = document.createElement("tr");
    noResults.innerHTML = '<td colspan="7" style="padding:30px;color:#777;">No products found.</td>';
    noResults.style.display = "none";
    tbody.appendChild(noResults);

    var filterState = { Category: "All", Availability: "All" };

    function applyFilters() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;

      $$("tr", tbody).forEach(function (tr) {
        if (tr === noResults) return;
        var cells = tr.children;
        var okSearch = !q || tr.textContent.toLowerCase().indexOf(q) !== -1;
        var okCategory = filterState.Category === "All" || cells[1].textContent.trim() === filterState.Category;
        var okAvail = filterState.Availability === "All" || cells[5].classList.contains(classOf[filterState.Availability]);
        var show = okSearch && okCategory && okAvail;
        tr.style.display = show ? "" : "none";
        if (show) shown++;
      });

      noResults.style.display = shown === 0 ? "" : "none";
    }

    filterState = makeFilter($(".btn-filter"), [
      { name: "Category", options: ["All", "Juice", "Pod", "Variable Mod", "Cartridge", "Device", "Coil", "E-liquid", "Accessories", "Other"] },
      { name: "Availability", options: ["All", "In-stock", "Out of stock", "Low stock"] }
    ], function (state) {
      filterState = state;
      applyFilters();
    });

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    // coming from the dashboard search? fill it in
    var q = new URLSearchParams(location.search).get("q");
    if (q && search) search.value = q;
    applyFilters();

    // --- remember which product was clicked ---
    tbody.addEventListener("click", function (e) {
      var link = e.target.closest("a.product-link");
      if (!link) return;
      var cells = link.closest("tr").children;
      save("thv_selected", {
        name: cells[0].textContent.trim(),
        category: cells[1].textContent.trim(),
        price: parseNumber(cells[2].textContent),
        variation: cells[3].textContent.trim(),
        qty: parseNumber(cells[4].textContent),
        created: cells[6].textContent.trim()
      });
    });

    // --- Add Product pop-up ---
    $$(".actions .btn-blue").forEach(function (btn) {
      if (btn.tagName === "BUTTON") {
        btn.addEventListener("click", function () {
          openAddProduct(function (p) {
            var list = load("thv_added", []);
            list.unshift(p);
            save("thv_added", list);

            tbody.insertBefore(makeRow(p), tbody.firstChild);
            bumpStats(p);
            addActivity(p.name, "added the product " + esc(p.name), "added the product");
            applyFilters();
            renderRecent();
            toast("Product added: " + p.name);
          });
        });
      }
    });

    // --- pagination ---
    setupPagination($$(".page-btn")[0], $$(".page-btn")[1], $(".pagination span"));

    // --- Recent Activities box on the right ---
    function renderRecent() {
      var ul = $(".activities ul");
      // remove entries we added before, then add them again (newest on top)
      $$("li[data-log]", ul).forEach(function (li) { li.remove(); });

      getActivity().slice(0, 7).reverse().forEach(function (entry) {
        var li = document.createElement("li");
        li.setAttribute("data-log", "1");
        li.innerHTML =
          '<img src="../assets/avatar.jpg" alt="">' +
          '<span class="who">Roroy Maur</span>' +
          '<span class="what">' + entry.full + "</span>" +
          '<span class="time">' + timeAgo(entry.time) + "</span>";
        ul.insertBefore(li, ul.firstChild);
      });

      while (ul.children.length > 7) ul.removeChild(ul.lastElementChild);
      reshade($$("li", ul));
    }
    renderRecent();
  }

  // the pop-up form for adding a product
  function openAddProduct(onAdd) {
    var overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);" +
      "z-index:1000;display:flex;align-items:center;justify-content:center;";

    var form = document.createElement("form");
    form.noValidate = true;
    form.style.cssText =
      "background:#fff;border-radius:14px;padding:30px 34px;width:520px;max-width:92%;" +
      "font-family:Inter,sans-serif;color:#222;";

    var input = "width:100%;height:44px;margin:6px 0 14px;padding:0 12px;border:1.5px solid #333;" +
                "border-radius:4px;font:inherit;font-size:18px;box-sizing:border-box;background:#fff;";
    var label = "font-size:18px;color:#555;";

    form.innerHTML =
      '<h2 style="font-size:30px;margin-bottom:16px;">Add Product</h2>' +
      '<div style="' + label + '">Product name</div><input id="ap-name" type="text" style="' + input + '">' +
      '<div style="' + label + '">Category</div>' +
      '<select id="ap-cat" style="' + input + '"><option>Juice</option><option>Pod</option><option>Variable Mod</option><option>Cartridge</option></select>' +
      '<div style="' + label + '">Variation (optional)</div><input id="ap-var" type="text" style="' + input + '">' +
      '<div style="display:flex;gap:16px;">' +
        '<div style="flex:1;"><div style="' + label + '">Price (₱)</div><input id="ap-price" type="number" min="0" style="' + input + '"></div>' +
        '<div style="flex:1;"><div style="' + label + '">Quantity</div><input id="ap-qty" type="number" min="0" style="' + input + '"></div>' +
      "</div>" +
      '<p id="ap-error" style="color:#e11d1d;font-size:16px;min-height:20px;margin-bottom:10px;"></p>' +
      '<div style="display:flex;justify-content:flex-end;gap:16px;">' +
        '<button type="button" id="ap-cancel" style="height:44px;padding:0 26px;border:1px solid #e11d1d;background:#fff;color:#e11d1d;border-radius:4px;font-size:18px;cursor:pointer;">Cancel</button>' +
        '<button type="submit" style="height:44px;padding:0 30px;border:none;background:#1565d8;color:#fff;border-radius:4px;font-size:18px;cursor:pointer;">Add</button>' +
      "</div>";

    overlay.appendChild(form);
    document.body.appendChild(overlay);
    $("#ap-name", form).focus();

    function close() {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);

    $("#ap-cancel", form).addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#ap-name", form).value.trim();
      var price = parseFloat($("#ap-price", form).value);
      var qty = parseInt($("#ap-qty", form).value, 10);
      var error = $("#ap-error", form);

      if (!name) { error.textContent = "Please enter a product name."; return; }
      if (isNaN(price) || price < 0) { error.textContent = "Please enter a valid price."; return; }
      if (isNaN(qty) || qty < 0) { error.textContent = "Please enter a valid quantity."; return; }

      onAdd({
        name: name,
        category: $("#ap-cat", form).value,
        variation: $("#ap-var", form).value.trim(),
        price: price,
        qty: qty,
        created: todayText()
      });
      close();
    });
  }

  // ---------------------------------------------------------------
  // 8. EDIT PRODUCT LIST (edit-product-list.html)
  // ---------------------------------------------------------------
  function editProductListPage() {
    var search = $(".search input");
    var classOf = { "In-stock": "in", "Out of stock": "out", "Low stock": "low" };
    var filterState = { Category: "All", Availability: "All" };

    function rows() {
      return $$(".pl-table .pl-row").filter(function (r) { return !r.classList.contains("pl-head"); });
    }

    function applyFilters() {
      var q = search ? search.value.trim().toLowerCase() : "";
      rows().forEach(function (row) {
        var cells = row.children;
        var okSearch = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        var okCategory = filterState.Category === "All" || cells[2].textContent.trim() === filterState.Category;
        var okAvail = filterState.Availability === "All" || cells[5].classList.contains(classOf[filterState.Availability]);
        row.style.display = okSearch && okCategory && okAvail ? "" : "none";
      });
    }

    filterState = makeFilter($(".pl-filters"), [
      { name: "Category", options: ["All", "Juice", "Pod", "Variable Mod", "Cartridge", "Device", "Coil", "E-liquid", "Accessories", "Other"] },
      { name: "Availability", options: ["All", "In-stock", "Out of stock", "Low stock"] }
    ], function (state) {
      filterState = state;
      applyFilters();
    });

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    // remember which product's "Edit Product" button was clicked
    $$(".pl-edit").forEach(function (button) {
      button.addEventListener("click", function () {
        var cells = button.closest(".pl-row").children;
        save("thv_selected", {
          name: cells[1].textContent.trim(),
          category: cells[2].textContent.trim(),
          price: parseNumber(cells[3].textContent),
          variation: "",
          qty: parseNumber(cells[4].textContent)
        });
      });
    });

    setupPagination($$(".pl-page-btn")[0], $$(".pl-page-btn")[1], $(".pl-page-text"));
  }

  // ---------------------------------------------------------------
  // 9. EDIT PRODUCT (edit-product.html)
  // ---------------------------------------------------------------
  function editProductPage() {
    var selected = load("thv_selected", null);
    var nameInput = $("#pname");
    var catInput = $("#pcat");
    var varInput = $("#pvar");
    var brandInput = $("#pbrand");
    var descInput = $("#pdesc");
    var priceInput = $("#price");
    var unitsInput = $("#units");
    var alertInput = $("#alert");
    var currentValues = $$(".r-value"); // [0] = current price, [1] = current units

    // fill the form with the product that was clicked
    var currentPrice = parseNumber(currentValues[0].textContent);
    var currentQty = parseNumber(currentValues[1].textContent);

    if (selected) {
      $(".ep-header h1").textContent = selected.name;
      nameInput.value = selected.name;
      catInput.value = selected.category || catInput.value;
      if (selected.variation !== undefined) varInput.value = selected.variation;
      if (selected.brand !== undefined) brandInput.value = selected.brand;
      if (selected.desc !== undefined) descInput.value = selected.desc;
      if (selected.alertLevel !== undefined) alertInput.value = selected.alertLevel;
      currentPrice = selected.price;
      currentQty = selected.qty;
      currentValues[0].textContent = peso(currentPrice);
      currentValues[1].textContent = currentQty;
    }

    // the +/- boxes start at the current price and units
    priceInput.value = currentPrice;
    unitsInput.value = currentQty;

    // remember what it was before editing
    var before = {
      name: nameInput.value, category: catInput.value, variation: varInput.value,
      brand: brandInput.value, desc: descInput.value, price: currentPrice, qty: currentQty
    };

    // --- Upload / Remove photo ---
    var photo = $(".ep-photo img");
    var picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/*";

    $(".upload").addEventListener("click", function (e) {
      e.preventDefault();
      picker.click();
    });

    picker.addEventListener("change", function () {
      var file = picker.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () { photo.src = reader.result; };
      reader.readAsDataURL(file);
    });

    $(".remove").addEventListener("click", function (e) {
      e.preventDefault();
      photo.src = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110"><rect width="110" height="110" fill="#e5e5e5"/></svg>'
      );
    });

    // --- Save button ---
    function bad(input, message) {
      input.style.borderColor = "#e11d1d";
      input.focus();
      toast(message);
    }

    [nameInput, priceInput, unitsInput, alertInput].forEach(function (input) {
      input.addEventListener("input", function () { input.style.borderColor = ""; });
    });

    $(".btn-save").addEventListener("click", function (e) {
      e.preventDefault();

      var name = nameInput.value.trim();
      var price = parseFloat(priceInput.value);
      var units = parseInt(unitsInput.value, 10);
      var alertLevel = parseInt(alertInput.value, 10);

      if (!name) return bad(nameInput, "Product name can't be empty.");
      if (isNaN(price) || price < 0) return bad(priceInput, "Please enter a valid price (0 or more).");
      if (isNaN(units) || units < 0) return bad(unitsInput, "Units can't be negative.");
      if (isNaN(alertLevel) || alertLevel < 0) return bad(alertInput, "Low stock level can't be negative.");

      // write down every change in the activity log
      function changed(label, oldValue, newValue) {
        var o = "<u>" + esc(oldValue) + "</u>";
        var n = "<u>" + esc(newValue) + "</u>";
        addActivity(
          name,
          "updated the " + label + " of the product " + esc(name) + " from " + o + " to " + n,
          "updated the " + label + " of the product from " + o + " to " + n
        );
      }

      if (name !== before.name) {
        var text = "updated the product name of the product <u>" + esc(before.name) + "</u> to <u>" + esc(name) + "</u>";
        addActivity(name, text, text);
      }
      if (price !== before.price) changed("price", peso(before.price), peso(price));
      if (units !== before.qty) changed("stock", before.qty, units);
      if (catInput.value.trim() !== before.category) changed("category", before.category, catInput.value.trim());
      if (varInput.value.trim() !== before.variation) changed("variation", before.variation || "none", varInput.value.trim() || "none");
      if (brandInput.value.trim() !== before.brand) addActivity(name, "updated the product brand of the product " + esc(name) + " to <u>" + esc(brandInput.value.trim()) + "</u>", "updated the product brand to <u>" + esc(brandInput.value.trim()) + "</u>");
      if (descInput.value.trim() !== before.desc.trim()) addActivity(name, "updated the description of the product " + esc(name), "updated the description of the product");

      // save the new values, then go back to the overview
      save("thv_selected", {
        name: name,
        category: catInput.value.trim(),
        variation: varInput.value.trim(),
        brand: brandInput.value.trim(),
        desc: descInput.value.trim(),
        price: price,
        qty: units,
        alertLevel: alertLevel,
        created: selected ? selected.created : undefined,
        updated: Date.now()
      });
      location.href = "../pages/product-overview.html";
    });
  }

  // ---------------------------------------------------------------
  // 10. PRODUCT OVERVIEW (product-overview.html)
  // ---------------------------------------------------------------
  function productOverviewPage() {
    var s = load("thv_selected", null);
    if (!s) return;

    $(".ph-title").textContent = s.name;

    $$(".ov-list .item").forEach(function (item) {
      var key = $(".k", item).textContent.trim();
      var value = $(".v", item);

      if (key === "Product name") value.textContent = s.name;
      if (key === "Product Category" && s.category) value.textContent = s.category;
      if (key === "Variation" && s.variation !== undefined) value.textContent = s.variation || "—";
      if (key === "Date Added" && s.created) value.textContent = s.created;
      if (key === "Product Brand" && s.brand !== undefined) value.textContent = s.brand || "—";
      if (key === "Description" && s.desc !== undefined) value.textContent = s.desc || "—";
      if (key === "Last Updated" && s.updated) {
        var d = new Date(s.updated);
        value.innerHTML =
          esc(d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })) +
          ' <span class="bar">|</span> ' +
          esc(d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
      }
    });

    $$(".side-row").forEach(function (row) {
      var key = $(".k", row).textContent.trim();
      var value = $(".v", row);
      if (key === "Price") value.textContent = peso(s.price);
      if (key === "In-Stock") value.textContent = s.qty;
    });
  }

  // ---------------------------------------------------------------
  // 11. PRODUCT HISTORY (product-history.html)
  // ---------------------------------------------------------------
  function productHistoryPage() {
    var s = load("thv_selected", null);
    if (!s) return;

    $(".ph-title").textContent = s.name;

    var list = $(".history-box");
    getActivity()
      .filter(function (entry) { return entry.product === s.name; })
      .reverse()
      .forEach(function (entry) {
        var li = document.createElement("li");
        li.innerHTML =
          '<div class="h-user"><img src="../assets/avatar.jpg" alt=""><span>Roroy Maur</span></div>' +
          '<p class="h-text">' + entry.short + "</p>" +
          '<span class="h-time">' + timeAgo(entry.time) + "</span>";
        list.insertBefore(li, list.firstChild);
      });

    reshade($$("li", list));
  }

  // ---------------------------------------------------------------
  // 12. ACTIVITY LOG (activity-log.html)
  // ---------------------------------------------------------------
  function activityLogPage() {
    var list = $(".al-list");
    var search = $(".al-search input");
    var filterState = { Date: "All" };

    // add our saved activities on top
    getActivity().reverse().forEach(function (entry) {
      var row = document.createElement("div");
      row.className = "al-row";
      row.innerHTML =
        '<div class="c-user"><img src="../assets/avatar.jpg" alt=""><span>Roroy P. Maur</span></div>' +
        '<p class="c-activity">' + entry.full + "</p>" +
        '<span class="c-date">' + timeAgo(entry.time) + "</span>";
      list.insertBefore(row, list.firstChild);
    });

    var noResults = document.createElement("div");
    noResults.textContent = "No activity found.";
    noResults.style.cssText = "display:none;padding:40px;text-align:center;font-size:22px;color:#777;";
    list.appendChild(noResults);

    function applyFilters() {
      var q = search.value.trim().toLowerCase();
      var shown = [];

      $$(".al-row", list).forEach(function (row) {
        var isRecent = /ago/.test($(".c-date", row).textContent);
        var okSearch = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        var okDate = filterState.Date === "All" ||
                     (filterState.Date === "Recent (ago)" && isRecent) ||
                     (filterState.Date === "Older (dated)" && !isRecent);
        var show = okSearch && okDate;
        row.style.display = show ? "" : "none";
        if (show) shown.push(row);
      });

      reshade(shown);
      noResults.style.display = shown.length === 0 ? "block" : "none";
    }

    filterState = makeFilter($(".al-filters"), [
      { name: "Date", options: ["All", "Recent (ago)", "Older (dated)"] }
    ], function (state) {
      filterState = state;
      applyFilters();
    });

    search.addEventListener("input", applyFilters);
    applyFilters();
  }

  // ---------------------------------------------------------------
  // 13. START: run the code for the page that is open
  // ---------------------------------------------------------------
  if (page === "index.html") {
    loginPage();
  } else {
    setupSharedParts();
  }

  if (page === "dashboard.html") dashboardPage();
  if (page === "inventory.html") inventoryPage();
  if (page === "edit-product-list.html") editProductListPage();
  if (page === "edit-product.html") editProductPage();
  if (page === "product-overview.html") productOverviewPage();
  if (page === "product-history.html") productHistoryPage();
  if (page === "activity-log.html") activityLogPage();
})();
