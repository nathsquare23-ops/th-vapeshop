// JavaScript for the New Order page.
// It makes the + / - buttons, the order list, the totals, search, sort,
// category tabs and the bottom buttons work.

(function () {
  // How many units of each product are in stock.
  // (Sample number for now. Later your C# backend can send the real one.)
  var STOCK = 10;

  // ---------- Grab the parts of the page we need ----------
  var grid = document.querySelector(".p-grid");
  var rowsBox = document.getElementById("orderRows");
  var itemsBadge = document.querySelector(".items-badge");
  var totalRows = document.querySelectorAll(".t-row");
  var searchInput = document.querySelector(".no-search input");

  // ---------- Make a list of products from the cards on the page ----------
  var products = Array.from(document.querySelectorAll(".p-card")).map(function (card) {
    return {
      card: card,
      name: card.querySelector(".p-name").textContent,
      category: card.querySelector(".p-cat").textContent,
      price: parseFloat(card.querySelector(".p-foot strong").textContent.replace(/[^0-9.]/g, "")),
      qty: 0
    };
  });

  // Extra amounts the user can edit (shipping, tax, coupon, discount)
  var extras = { shipping: 0, tax: 0, coupon: 0, discount: 0 };

  // ---------- Small helper: turns 4000 into "4,000" ----------
  function money(number, decimals) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: 2
    });
  }

  // ---------- Change how many of a product are in the order ----------
  function changeQty(product, amount) {
    var newQty = product.qty + amount;
    if (newQty < 0) newQty = 0;
    if (newQty > STOCK) newQty = STOCK;
    product.qty = newQty;
    product.card.querySelector(".counter span").textContent = newQty;
    render();
  }

  // ---------- Draw the order list and the totals ----------
  function render() {
    var inOrder = products.filter(function (p) { return p.qty > 0; });

    // order rows
    if (inOrder.length === 0) {
      rowsBox.innerHTML = '<p class="empty-order">No items yet. Use the + buttons to add products.</p>';
    } else {
      rowsBox.innerHTML = inOrder.map(function (p) {
        var index = products.indexOf(p);
        return '<div class="od-row" data-i="' + index + '">' +
          '<div><strong>' + p.name + '</strong><small>In Stock: ' + STOCK + '</small></div>' +
          '<span class="bold">₱' + money(p.price) + '</span>' +
          '<div class="qty"><button type="button" data-act="plus">+</button>' + p.qty +
          '<button type="button" data-act="minus">&minus;</button></div>' +
          '<span class="bold">₱' + money(p.price * p.qty, 1) + '</span>' +
          '<button type="button" class="trash" data-act="remove" aria-label="Remove">' +
          '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>' +
          '</div>';
      }).join("");
    }

    itemsBadge.textContent = "Items : " + inOrder.length;

    // totals
    var subTotal = 0;
    inOrder.forEach(function (p) { subTotal += p.price * p.qty; });
    var grand = subTotal + extras.shipping + extras.tax - extras.coupon - extras.discount;
    if (grand < 0) grand = 0;

    setTotal(0, "$" + subTotal);
    setTotal(1, "$" + extras.shipping);
    setTotal(2, "$" + extras.tax);
    setTotal(3, "$" + extras.coupon);
    setTotal(4, "-$" + extras.discount);
    setTotal(5, "$" + grand.toFixed(2));
  }

  // writes text into the right-hand side of one totals row
  function setTotal(rowNumber, text) {
    var spans = totalRows[rowNumber].querySelectorAll("span");
    spans[spans.length - 1].textContent = text;
  }

  // ---------- Click the + / - buttons on the product cards ----------
  grid.addEventListener("click", function (event) {
    var button = event.target.closest(".counter button");
    if (!button) return;
    var product = products.find(function (p) { return p.card === button.closest(".p-card"); });
    changeQty(product, button.textContent.trim() === "+" ? 1 : -1);
  });

  // ---------- Click the + / - / trash buttons in the order list ----------
  rowsBox.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    var product = products[button.closest(".od-row").dataset.i];
    if (button.dataset.act === "plus") changeQty(product, 1);
    if (button.dataset.act === "minus") changeQty(product, -1);
    if (button.dataset.act === "remove") changeQty(product, -product.qty);
  });

  // ---------- Edit shipping, tax, coupon and discount ----------
  var extraNames = ["shipping", "tax", "coupon", "discount"];
  extraNames.forEach(function (name, i) {
    var pencil = totalRows[i + 1].querySelector(".edit");
    pencil.addEventListener("click", function () {
      var answer = prompt("Enter the " + name + " amount:", extras[name]);
      if (answer === null) return;               // user pressed Cancel
      var number = parseFloat(answer);
      if (isNaN(number) || number < 0) return;   // ignore bad input
      extras[name] = number;
      render();
    });
  });

  // ---------- Search and category tabs ----------
  var currentCategory = "all";

  // "Pods" and "Pod" should count as the same word
  function simple(text) {
    return text.toLowerCase().trim().replace(/s$/, "");
  }

  function applyFilters() {
    var search = searchInput.value.toLowerCase().trim();
    var shown = 0;

    products.forEach(function (p) {
      var matchesSearch = p.name.toLowerCase().indexOf(search) !== -1;
      var matchesCategory = currentCategory === "all" || simple(p.category) === currentCategory;
      var visible = matchesSearch && matchesCategory;
      p.card.style.display = visible ? "" : "none";
      if (visible) shown++;
    });

    // show a message when nothing matches
    var message = document.getElementById("noResults");
    if (shown === 0 && !message) {
      message = document.createElement("p");
      message.id = "noResults";
      message.className = "no-results";
      message.textContent = "No products found.";
      grid.appendChild(message);
    }
    if (shown > 0 && message) message.remove();
  }

  searchInput.addEventListener("input", applyFilters);

  document.querySelectorAll(".cat").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".cat").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      currentCategory = tab.textContent.trim() === "All Categories" ? "all" : simple(tab.textContent);
      applyFilters();
    });
  });

  // ---------- Sort button: low to high, then high to low ----------
  var lowToHigh = true;
  document.querySelector(".no-sort").addEventListener("click", function () {
    var sorted = products.slice().sort(function (a, b) {
      return lowToHigh ? a.price - b.price : b.price - a.price;
    });
    sorted.forEach(function (p) { grid.appendChild(p.card); });
    lowToHigh = !lowToHigh;
  });

  // ---------- Cash / GCash ----------
  var payButtons = document.querySelectorAll(".pay");
  payButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      payButtons.forEach(function (b) { b.classList.remove("active"); });
      button.classList.add("active");
    });
  });

  // ---------- Bottom buttons ----------
  function clearOrder() {
    products.forEach(function (p) {
      p.qty = 0;
      p.card.querySelector(".counter span").textContent = 0;
    });
    extras = { shipping: 0, tax: 0, coupon: 0, discount: 0 };
    render();
  }

  function hasItems() {
    return products.some(function (p) { return p.qty > 0; });
  }

  document.querySelector(".act.reset").addEventListener("click", clearOrder);

  document.querySelector(".act.cancel").addEventListener("click", function () {
    if (confirm("Cancel this order?")) clearOrder();
  });

  document.querySelector(".act.hold").addEventListener("click", function () {
    if (!hasItems()) { alert("Add at least one product first."); return; }
    alert("Order put on hold.");   // later: send to the backend
  });

  document.querySelector(".act.payment").addEventListener("click", function () {
    if (!hasItems()) { alert("Add at least one product first."); return; }
    alert("Choose Cash or GCash below, then press Save.");
  });

  document.querySelector(".save").addEventListener("click", function () {
    if (!hasItems()) { alert("Add at least one product first."); return; }
    var method = document.querySelector(".pay.active").textContent;
    alert("Order saved! Paid by " + method + ".");   // later: send to the backend
    window.location.href = "view-all-orders.html";
  });

  // ---------- Go back ----------
  document.querySelector(".no-back").addEventListener("click", function (event) {
    event.preventDefault();
    history.back();
  });

  // ---------- Show today's date (day/month/year) ----------
  var today = new Date();
  var day = String(today.getDate()).padStart(2, "0");
  var month = String(today.getMonth() + 1).padStart(2, "0");
  document.querySelector(".date-box span").textContent = day + "/" + month + "/" + today.getFullYear();

  // Draw the page for the first time
  render();
})();
