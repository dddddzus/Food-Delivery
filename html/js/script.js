/* =========================================================
   FoodExpress – One script for:
   - index.html (login/register tabs + fake auth)
   - menu.html (render grid, categories, search)
             (detail modal like Figma)
             (cart drawer opens from right)
   - checkout.html (summary, payment selection, submit)
   Data are hardcoded now; later replace with MVC/DB.
========================================================= */

const App = (() => {
  const USER_KEY = "auth_user";
  const CART_KEY = "cart_items";

  // ---------- DATA (replace later from MVC/DB) ----------
  const foodItems = [
    {
      id: "1",
      name: "Margherita Pizza",
      description:
        "Klasická italská pizza s rajčatovou omáčkou, mozzarellou a čerstvou bazalkou",
      price: 189,
      image:
        "https://images.unsplash.com/photo-1621510564330-c87695020b53?auto=format&fit=crop&w=1080&q=80",
      category: "pizza",
    },
    {
      id: "2",
      name: "Cheeseburger Menu",
      description:
        "Šťavnatý burger s hovězím masem, sýrem cheddar, salátem a hranolkami",
      price: 249,
      image:
        "https://images.unsplash.com/photo-1651843465180-5965076f7368?auto=format&fit=crop&w=1080&q=80",
      category: "burger",
    },
    {
      id: "3",
      name: "Sushi set",
      description: "Mix 24 kusů sushi včetně maki, nigiri a california rolls",
      price: 399,
      image:
        "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?auto=format&fit=crop&w=1080&q=80",
      category: "sushi",
    },
    {
      id: "4",
      name: "Carbonara Pasta",
      description:
        "Tradiční italské těstoviny s pancettou, vejci, parmazánem a pepřem",
      price: 219,
      image:
        "https://images.unsplash.com/photo-1609166639722-47053ca112ea?auto=format&fit=crop&w=1080&q=80",
      category: "pasta",
    },
    {
      id: "5",
      name: "Caesar Salad",
      description:
        "Čerstvý salát s kuřecím masem, parmazánem, krutony a caesar dressingem",
      price: 169,
      image:
        "https://images.unsplash.com/photo-1640718153995-db4d3f0a6337?auto=format&fit=crop&w=1080&q=80",
      category: "salad",
    },
    {
      id: "6",
      name: "Čokoládový dort",
      description: "Lahodný čokoládový dort s krémem a čerstvým ovocem",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1655633584060-c875b9821061?auto=format&fit=crop&w=1080&q=80",
      category: "dessert",
    },
  ];

  const categories = [
    { key: "all", label: "Vše" },
    { key: "pizza", label: "Pizza" },
    { key: "burger", label: "Burger" },
    { key: "sushi", label: "Sushi" },
    { key: "pasta", label: "Pasta" },
    { key: "salad", label: "Saláty" },
    { key: "dessert", label: "Dezerty" },
  ];

  // Reviews + details (from your TSX)
  const reviewsData = {
    1: [
      {
        id: "r1",
        author: "Marie K.",
        rating: 5,
        comment:
          "Nejlepší pizza v okolí! Čerstvé ingredience a rychlé doručení.",
        date: "3. 1. 2026",
      },
      {
        id: "r2",
        author: "Petr N.",
        rating: 4,
        comment: "Výborná pizza, trochu málo bazalky, ale jinak super!",
        date: "28. 12. 2025",
      },
    ],
    2: [
      {
        id: "r3",
        author: "Jana S.",
        rating: 5,
        comment: "Burger jako z amerického filmu! Doporučuji!",
        date: "5. 1. 2026",
      },
      {
        id: "r4",
        author: "Tomáš V.",
        rating: 5,
        comment: "Hranolky byly perfektně křupavé. Rozhodně si dám znovu.",
        date: "2. 1. 2026",
      },
    ],
    3: [
      {
        id: "r5",
        author: "Lucie M.",
        rating: 5,
        comment: "Nejlepší sushi set! Čerstvé a chutné.",
        date: "4. 1. 2026",
      },
    ],
    4: [
      {
        id: "r6",
        author: "Martin K.",
        rating: 4,
        comment: "Velmi dobré carbonara, možná by mohlo být více slaniny.",
        date: "1. 1. 2026",
      },
    ],
    5: [
      {
        id: "r7",
        author: "Eva H.",
        rating: 5,
        comment: "Zdravý a chutný salát. Přesně to, co jsem potřebovala!",
        date: "6. 1. 2026",
      },
    ],
    6: [
      {
        id: "r8",
        author: "David P.",
        rating: 5,
        comment: "Božský dort! Sladká tečka za večeří.",
        date: "30. 12. 2025",
      },
    ],
  };

  const detailsData = {
    1: {
      prepTime: "20-30 min",
      calories: "850 kcal",
      allergens: ["Lepek", "Mléko"],
    },
    2: {
      prepTime: "25-35 min",
      calories: "1200 kcal",
      allergens: ["Lepek", "Mléko", "Hořčice"],
    },
    3: {
      prepTime: "30-40 min",
      calories: "650 kcal",
      allergens: ["Ryby", "Sója"],
    },
    4: {
      prepTime: "15-25 min",
      calories: "750 kcal",
      allergens: ["Lepek", "Vejce", "Mléko"],
    },
    5: {
      prepTime: "10-15 min",
      calories: "420 kcal",
      allergens: ["Vejce", "Ryby"],
    },
    6: {
      prepTime: "5-10 min",
      calories: "520 kcal",
      allergens: ["Lepek", "Vejce", "Mléko"],
    },
  };

  // ---------- STATE ----------
  let selectedCategory = "all";
  let searchQuery = "";
  let selectedItem = null;

  // ---------- helpers ----------
  function $(id) {
    return document.getElementById(id);
  }
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function cartCount(cart) {
    return cart.reduce((s, i) => s + i.quantity, 0);
  }
  function cartTotal(cart) {
    return cart.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  // =====================================================
  // AUTH (index.html)
  // =====================================================
  function initAuthPage() {
    const loginForm = $("loginForm");
    const registerForm = $("registerForm");
    const toast = $("toast");
    const tabs = document.querySelectorAll(".segmented-btn");
    if (!loginForm || !registerForm || !toast || tabs.length === 0) return;

    function showToast(msg, type) {
      toast.textContent = msg;
      toast.className = "toast " + (type || "");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => {
        toast.textContent = "";
        toast.className = "toast";
      }, 2500);
    }

    function setTab(name) {
      tabs.forEach((b) => {
        const active = b.dataset.tab === name;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });
      loginForm.classList.toggle("is-active", name === "login");
      registerForm.classList.toggle("is-active", name === "register");
      showToast("", "");
    }

    tabs.forEach((b) =>
      b.addEventListener("click", () => setTab(b.dataset.tab))
    );

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[name="email"]').value.trim();
      const password = loginForm
        .querySelector('input[name="password"]')
        .value.trim();
      if (!email || !password)
        return showToast("Vyplňte email a heslo.", "err");

      localStorage.setItem(
        USER_KEY,
        JSON.stringify({ email, name: "Uživatel" })
      );
      showToast("Úspěšně přihlášen!", "ok");
      setTimeout(() => (window.location.href = "menu.html"), 600);
    });

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = registerForm
        .querySelector('input[name="name"]')
        .value.trim();
      const email = registerForm
        .querySelector('input[name="email"]')
        .value.trim();
      const pass = registerForm
        .querySelector('input[name="password"]')
        .value.trim();
      const pass2 = registerForm
        .querySelector('input[name="confirmPassword"]')
        .value.trim();

      if (pass !== pass2) return showToast("Hesla se neshodují!", "err");
      if (!name || !email || !pass)
        return showToast("Vyplňte povinná pole.", "err");

      localStorage.setItem(USER_KEY, JSON.stringify({ email, name }));
      showToast("Registrace proběhla úspěšně!", "ok");
      setTimeout(() => (window.location.href = "menu.html"), 700);
    });

    setTab("login");
  }

  // =====================================================
  // HOME (menu.html)
  // =====================================================
  function ensureLoggedInOnHome() {
    // only if home exists
    if (!document.body.classList.contains("home")) return;
    if (!localStorage.getItem(USER_KEY)) window.location.href = "index.html";
  }

  function renderCategories() {
    const el = $("categoryTabs");
    if (!el) return;
    el.innerHTML = categories
      .map(
        (c) => `
        <button class="cat-btn ${c.key === selectedCategory ? "is-active" : ""}"
                type="button"
                data-cat="${c.key}">
          ${c.label}
        </button>`
      )
      .join("");

    el.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedCategory = btn.dataset.cat;
        renderCategories();
        renderGrid();
      });
    });
  }

  function filteredItems() {
    const q = searchQuery.trim().toLowerCase();
    return foodItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }

  function renderGrid() {
    const grid = $("foodGrid");
    const empty = $("emptyState");
    if (!grid) return;

    const items = filteredItems();
    grid.innerHTML = items
      .map(
        (item) => `
        <article class="card">
          <div class="card-media" data-open="${item.id}">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" />
          </div>
          <div class="card-body">
            <h3 class="card-title" data-open="${item.id}">${escapeHtml(
          item.name
        )}</h3>
            <p class="card-desc">${escapeHtml(item.description)}</p>
            <div class="card-row">
              <span class="card-price">${item.price} Kč</span>
              <button class="btn-add" type="button" data-add="${
                item.id
              }">Přidat</button>
            </div>
          </div>
        </article>`
      )
      .join("");

    if (empty) empty.hidden = items.length !== 0;

    grid.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(btn.dataset.add));
    });
    grid.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => openDetail(btn.dataset.open));
    });
  }

  // ---------- CART ----------
  function addToCart(id) {
    const item = foodItems.find((i) => i.id === id);
    if (!item) return;

    const cart = loadCart();
    const existing = cart.find((c) => c.id === id);
    if (existing) existing.quantity += 1;
    else
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      });

    saveCart(cart);
    updateCartUI();
  }

  function updateQty(id, nextQty) {
    let cart = loadCart();
    if (nextQty <= 0) cart = cart.filter((i) => i.id !== id);
    else
      cart = cart.map((i) => (i.id === id ? { ...i, quantity: nextQty } : i));
    saveCart(cart);
    updateCartUI(true);
  }

  function removeFromCart(id) {
    const cart = loadCart().filter((i) => i.id !== id);
    saveCart(cart);
    updateCartUI(true);
  }

  function updateCartUI(keepOpen = false) {
    const cart = loadCart();

    const countEl = $("cartCount");
    const totalEl = $("cartTotal");
    if (countEl) countEl.textContent = String(cartCount(cart));
    if (totalEl) totalEl.textContent = String(cartTotal(cart));

    const body = $("cartBody");
    if (body) {
      if (cart.length === 0) {
        body.innerHTML = `<div class="cart-empty">Váš košík je prázdný</div>`;
      } else {
        body.innerHTML = cart
          .map(
            (i) => `
            <div class="cart-item">
              <img src="${i.image}" alt="${escapeHtml(i.name)}" />
              <div class="cart-info">
                <p class="cart-name">${escapeHtml(i.name)}</p>
                <p class="cart-price">${i.price} Kč</p>
              </div>
              <div class="cart-controls">
                <button class="icon-btn" type="button" data-minus="${
                  i.id
                }">−</button>
                <span class="qty">${i.quantity}</span>
                <button class="icon-btn" type="button" data-plus="${
                  i.id
                }">+</button>
                <button class="icon-btn" type="button" data-x="${
                  i.id
                }">×</button>
              </div>
            </div>`
          )
          .join("");

        body.querySelectorAll("[data-minus]").forEach((b) =>
          b.addEventListener("click", () => {
            const id = b.dataset.minus;
            const cur = loadCart().find((x) => x.id === id)?.quantity || 1;
            updateQty(id, cur - 1);
          })
        );
        body.querySelectorAll("[data-plus]").forEach((b) =>
          b.addEventListener("click", () => {
            const id = b.dataset.plus;
            const cur = loadCart().find((x) => x.id === id)?.quantity || 0;
            updateQty(id, cur + 1);
          })
        );
        body
          .querySelectorAll("[data-x]")
          .forEach((b) =>
            b.addEventListener("click", () => removeFromCart(b.dataset.x))
          );
      }
    }

    if (!keepOpen) return;
  }

  function openCart() {
    const overlay = $("cartOverlay");
    const drawer = $("cartDrawer");
    if (!overlay || !drawer) return;

    overlay.hidden = false;
    drawer.hidden = false;

    requestAnimationFrame(() => drawer.classList.add("is-open"));
    updateCartUI(true);
  }

  function closeCart() {
    const overlay = $("cartOverlay");
    const drawer = $("cartDrawer");
    if (!overlay || !drawer) return;

    drawer.classList.remove("is-open");
    setTimeout(() => {
      overlay.hidden = true;
      drawer.hidden = true;
    }, 260);
  }

  function goCheckout() {
    // go to checkout page
    const cart = loadCart();
    if (cart.length === 0) return alert("Košík je prázdný.");
    window.location.href = "checkout.html";
  }

  // ---------- DETAIL MODAL (your Figmadesign) ----------
  function openDetail(id) {
    const item = foodItems.find((i) => i.id === id);
    if (!item) return;
    selectedItem = item;

    const reviews = reviewsData[item.id] || [];
    const details = detailsData[item.id] || {
      prepTime: "20-30 min",
      calories: "500 kcal",
      allergens: [],
    };
    const avg =
      reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(
            1
          )
        : "5.0";

    const ov = $("detailOverlay");
    const modal = $("detailModal");
    if (!ov || !modal) return;

    $("dTitle").textContent = item.name;
    $("dImg").src = item.image;
    $("dImg").alt = item.name;
    $("dPrice").textContent = String(item.price);
    $("dDesc").textContent = item.description;
    $("dPrep").textContent = details.prepTime;
    $("dCal").textContent = details.calories;
    $("dRating").textContent = avg;
    $("dRating2").textContent = avg;
    $("dReviewCount").textContent = String(reviews.length);
    $("dReviewCount2").textContent = String(reviews.length);

    // allergens
    const allergWrap = $("allergenWrap");
    const allergBox = $("dAllergens");
    if (details.allergens && details.allergens.length > 0) {
      allergWrap.hidden = false;
      allergBox.innerHTML = details.allergens
        .map((a) => `<span class="badge2">${escapeHtml(a)}</span>`)
        .join("");
    } else {
      allergWrap.hidden = true;
      allergBox.innerHTML = "";
    }

    // reviews
    const reviewsEl = $("dReviews");
    reviewsEl.innerHTML = reviews.length
      ? reviews
          .map((r) => {
            const stars =
              "★★★★★".slice(0, r.rating) + "☆☆☆☆☆".slice(0, 5 - r.rating);
            return `
              <div class="review">
                <div class="review-head">
                  <div>
                    <div class="review-name">${escapeHtml(
                      r.author
                    )} <span class="review-stars">${stars}</span></div>
                  </div>
                  <div class="review-date">${escapeHtml(r.date)}</div>
                </div>
                <p class="review-text">${escapeHtml(r.comment)}</p>
              </div>`;
          })
          .join("")
      : `<div class="review"><p class="review-text" style="color:#6b7280;margin:0;">Zatím žádné recenze.</p></div>`;

    ov.hidden = false;
    modal.hidden = false;

    // prevent body scroll under modal
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeDetail() {
    const ov = $("detailOverlay");
    const modal = $("detailModal");
    if (!ov || !modal) return;

    ov.hidden = true;
    modal.hidden = true;
    selectedItem = null;

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function addSelectedToCart() {
    if (!selectedItem) return;
    addToCart(selectedItem.id);
    closeDetail();
  }

  // ---------- USER MENU ----------
  function toggleUserMenu() {
    const m = $("userMenu");
    if (!m) return;
    m.hidden = !m.hidden;
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    window.location.href = "index.html";
  }

  // =====================================================
  // CHECKOUT (checkout.html)
  // =====================================================
  function initCheckoutPage() {
    if (!document.body.classList.contains("checkout")) return;

    // guard
    if (!localStorage.getItem(USER_KEY)) window.location.href = "index.html";

    const lines = $("summaryLines");
    const sumSubtotal = $("sumSubtotal");
    const sumDelivery = $("sumDelivery");
    const sumTotal = $("sumTotal");

    const cart = loadCart();
    const delivery = 49;
    const subtotal = cartTotal(cart);
    const total = subtotal + delivery;

    if (lines) {
      if (cart.length === 0) {
        lines.innerHTML = `<div style="color:#6b7280;font-weight:800">Košík je prázdný</div>`;
      } else {
        lines.innerHTML = cart
          .map(
            (i) =>
              `<div class="sumline"><span>${escapeHtml(i.name)} x${
                i.quantity
              }</span><span><b>${i.price * i.quantity} Kč</b></span></div>`
          )
          .join("");
      }
    }
    if (sumSubtotal) sumSubtotal.textContent = `${subtotal} Kč`;
    if (sumDelivery) sumDelivery.textContent = `${delivery} Kč`;
    if (sumTotal) sumTotal.textContent = `${total} Kč`;

    // payment buttons
    const payBtns = document.querySelectorAll(".pay-btn");
    const cardFields = $("cardFields");
    let selected = "card";

    payBtns.forEach((b) => {
      b.addEventListener("click", () => {
        selected = b.dataset.pay || "card";
        payBtns.forEach((x) => x.classList.toggle("is-active", x === b));
        if (cardFields)
          cardFields.style.display = selected === "card" ? "" : "none";
      });
    });
    if (cardFields)
      cardFields.style.display = selected === "card" ? "" : "none";
  }

  function submitOrder() {
    // simple "fake submit"
    if (!document.body.classList.contains("checkout")) return;

    const form = document.getElementById("checkoutForm");
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    alert("Objednávka byla úspěšně odeslána!");
    localStorage.removeItem(CART_KEY);
    window.location.href = "menu.html";
  }

  // =====================================================
  // INIT
  // =====================================================
  function initHomePage() {
    if (!document.body.classList.contains("home")) return;

    ensureLoggedInOnHome();

    const user = getUser();
    const userBtn = document.querySelector(".chip-user");
    if (userBtn && user?.name) userBtn.textContent = user.name;

    const input = $("searchInput");
    if (input) {
      input.addEventListener("input", () => {
        searchQuery = input.value;
        renderGrid();
      });
    }

    // close user menu on outside click
    document.addEventListener("click", (e) => {
      const menu = $("userMenu");
      const btn = document.querySelector(".chip-user");
      if (!menu || menu.hidden) return;
      if (menu.contains(e.target)) return;
      if (btn && btn.contains(e.target)) return;
      menu.hidden = true;
    });

    // esc closes modals/drawer
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeDetail();
      closeCart();
    });

    renderCategories();
    renderGrid();
    updateCartUI();
  }

  function init() {
    initAuthPage();
    initHomePage();
    initCheckoutPage();
  }

  return {
    init,

    // used from HTML onclick
    openCart,
    closeCart,
    goCheckout,

    openDetail,
    closeDetail,
    addSelectedToCart,

    toggleUserMenu,
    logout,

    submitOrder,
  };
})();

document.addEventListener("DOMContentLoaded", App.init);
