// JavaScript for the View All Orders page.
// It draws the order cards and makes the tabs, Complete Order
// and Delete buttons work.

(function () {
  var grid = document.getElementById("orderGrid");
  var tabs = document.querySelectorAll(".vo-tab");
  var currentTab = "All";

  // ---------- Sample items (later your C# backend can send real ones) ----------
  var allItems = [
    { qty: 1, name: "Vape Pod Pro Max XS V ETC", price: 1000 },
    { qty: 1, name: "Vape Pod Pro XS III ETC", price: 1000 },
    { qty: 1, name: "Vape Pod Pro XS V ETC", price: 1000 },
    { qty: 1, name: "Vape Pod Pro Max VII ETC", price: 1000 }
  ];

  // takes the first "count" items
  function items(count) {
    return allItems.slice(0, count);
  }

  // ---------- Sample orders, in the same order as the Figma design ----------
  var orders = [
    { no: "01", customer: "Roroy Maur",      status: "In-Process", date: "September 11, 2001", time: "5:29 PM", items: items(4) },
    { no: "02", customer: "Paul Villanueva", status: "In-Process", date: "September 11, 2001", time: "3:29 AM", items: items(3) },
    { no: "05", customer: "Roroy Maur",      status: "In-Process", date: "September 11, 2001", time: "5:29 PM", items: items(4) },
    { no: "07", customer: "Richi Maur",      status: "Completed",  date: "September 11, 2001", time: "2:29 PM", items: items(1) },
    { no: "06", customer: "Kris Johnny",     status: "Completed",  date: "September 11, 2001", time: "7:29 PM", items: items(2) },
    { no: "04", customer: "Paul Villanueva", status: "In-Process", date: "September 11, 2001", time: "3:29 AM", items: items(3) },
    { no: "03", customer: "Kris Johnny",     status: "Completed",  date: "September 11, 2001", time: "7:29 PM", items: items(2) },
    { no: "08", customer: "Roroy Maur",      status: "In-Process", date: "September 11, 2001", time: "5:29 PM", items: items(4) }
  ];

  // ---------- Small helpers ----------
  // 4000 -> "₱4,000"
  function money(number) {
    return "₱" + number.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  // 1 -> "01"
  function twoDigits(number) {
    return String(number).padStart(2, "0");
  }

  function subTotal(order) {
    var total = 0;
    order.items.forEach(function (item) { total += item.price * item.qty; });
    return total;
  }

  // ---------- Build the HTML for one card ----------
  function cardHtml(order, index) {
    var rows = order.items.map(function (item) {
      return '<div class="o-item"><span>' + twoDigits(item.qty) + '</span><span>' + item.name +
             '</span><span>' + money(item.price) + '</span></div>';
    }).join("");

    // only orders that are still In-Process get buttons
    var buttons = "";
    if (order.status === "In-Process") {
      buttons =
        '<div class="o-btns">' +
          '<button type="button" class="o-btn o-del" data-act="delete" aria-label="Delete order">' +
            '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>' +
          '<a href="new-order.html" class="o-btn o-edit" aria-label="Edit order">' +
            '<svg class="icon" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></a>' +
          '<button type="button" class="o-btn o-done" data-act="complete">Complete Order</button>' +
        '</div>';
    }

    var badgeClass = order.status === "Completed" ? "completed" : "in-process";

    return '<article class="o-card" data-i="' + index + '">' +
      '<div class="o-head"><div class="o-no">' + order.no + '</div>' +
        '<div><p class="o-name">' + order.customer + '</p><span class="o-badge ' + badgeClass + '">' + order.status + '</span></div></div>' +
      '<div class="o-date"><span>' + order.date + '</span><span>' + order.time + '</span></div>' +
      '<div class="o-cols"><span>Qty</span><span>Items</span><span>Price</span></div>' +
      '<div class="o-items">' + rows + '</div>' +
      '<div class="o-sub"><span>SubTotal</span><span>' + money(subTotal(order)) + '</span></div>' +
      buttons +
    '</article>';
  }

  // ---------- Draw all cards that match the selected tab ----------
  function render() {
    var html = "";
    orders.forEach(function (order, index) {
      if (currentTab === "All" || order.status === currentTab) {
        html += cardHtml(order, index);
      }
    });
    grid.innerHTML = html || '<p class="vo-empty">No orders found.</p>';
  }

  // ---------- Tabs: All / In-Process / Completed ----------
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      currentTab = tab.textContent.trim();
      render();
    });
  });

  // ---------- Complete Order and Delete buttons ----------
  grid.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-act]");
    if (!button) return;

    var index = button.closest(".o-card").dataset.i;
    var order = orders[index];

    if (button.dataset.act === "complete") {
      if (confirm("Mark order " + order.no + " as completed?")) {
        order.status = "Completed";   // later: tell the backend
        render();
      }
    }

    if (button.dataset.act === "delete") {
      if (confirm("Delete order " + order.no + "?")) {
        orders.splice(index, 1);      // later: tell the backend
        render();
      }
    }
  });

  // ---------- Go back ----------
  document.querySelector(".vo-back").addEventListener("click", function (event) {
    event.preventDefault();
    history.back();
  });

  // Draw the page for the first time
  render();
})();
