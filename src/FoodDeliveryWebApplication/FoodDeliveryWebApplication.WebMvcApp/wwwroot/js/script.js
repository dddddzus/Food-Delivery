/* FoodExpress – MVC version
   - products are rendered server-side (Razor) into HTML
   - JS only handles: search, category filter, cart drawer, detail modal, checkout summary
*/

const App = (() => {
    const CART_KEY = "cart_items";

    let foodItems = []; // loaded from DOM
    let selectedCategory = "all";
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

    // ---------- cart storage ----------
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

    // ---------- read products rendered by MVC ----------
    function readProductsFromDom() {
        const nodes = document.querySelectorAll("[data-product]");
        foodItems = Array.from(nodes).map((n) => ({
            id: n.dataset.id,
            name: n.dataset.name,
            description: n.dataset.description,
            price: Number(n.dataset.price),
            image: n.dataset.image,
            category: n.dataset.category,
        }));
    }

    // ---------- search + category filter (DOM-based) ----------
    function applyFilters() {
        const q = ($("searchInput")?.value || "").trim().toLowerCase();

        document.querySelectorAll("[data-product]").forEach((card) => {
            const name = (card.dataset.name || "").toLowerCase();
            const desc = (card.dataset.description || "").toLowerCase();
            const cat = card.dataset.category || "";

            const okCat = selectedCategory === "all" || cat === selectedCategory;
            const okSearch = !q || name.includes(q) || desc.includes(q);
            card.style.display = okCat && okSearch ? "" : "none";
        });

        // empty state
        const anyVisible = Array.from(document.querySelectorAll("[data-product]"))
            .some((c) => c.style.display !== "none");
        const empty = $("emptyState");
        if (empty) empty.hidden = anyVisible;
    }

    function bindCategories() {
        const el = $("categoryTabs");
        if (!el) return;

        el.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-cat]");
            if (!btn) return;

            selectedCategory = btn.dataset.cat || "all";

            el.querySelectorAll("[data-cat]").forEach((b) => {
                b.classList.toggle("is-active", b.dataset.cat === selectedCategory);
            });

            applyFilters();
        });
    }

    function bindSearch() {
        const input = $("searchInput");
        if (!input) return;
        input.addEventListener("input", applyFilters);
    }

    // ---------- cart ----------
    function addToCart(id) {
        const item = foodItems.find((i) => i.id === id);
        if (!item) return;

        const cart = loadCart();
        const existing = cart.find((c) => c.id === id);
        if (existing) existing.quantity += 1;
        else cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 });

        saveCart(cart);
        updateCartUI();
    }

    function updateQty(id, nextQty) {
        let cart = loadCart();
        if (nextQty <= 0) cart = cart.filter((i) => i.id !== id);
        else cart = cart.map((i) => (i.id === id ? { ...i, quantity: nextQty } : i));
        saveCart(cart);
        updateCartUI(true);
    }

    function removeFromCart(id) {
        const cart = loadCart().filter((i) => i.id !== id);
        saveCart(cart);
        updateCartUI(true);
    }

    function updateCartUI() {
        const cart = loadCart();

        const countEl = $("cartCount");
        const totalEl = $("cartTotal");
        if (countEl) countEl.textContent = String(cartCount(cart));
        if (totalEl) totalEl.textContent = String(cartTotal(cart));

        const body = $("cartBody");
        if (!body) return;

        if (cart.length === 0) {
            body.innerHTML = `<div class="cart-empty">Váš košík je prázdný</div>`;
            return;
        }

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
            <button class="icon-btn" type="button" data-minus="${i.id}">−</button>
            <span class="qty">${i.quantity}</span>
            <button class="icon-btn" type="button" data-plus="${i.id}">+</button>
            <button class="icon-btn" type="button" data-x="${i.id}">×</button>
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
        body.querySelectorAll("[data-x]").forEach((b) =>
            b.addEventListener("click", () => removeFromCart(b.dataset.x))
        );
    }

    function openCart() {
        const overlay = $("cartOverlay");
        const drawer = $("cartDrawer");
        if (!overlay || !drawer) return;

        overlay.hidden = false;
        drawer.hidden = false;
        requestAnimationFrame(() => drawer.classList.add("is-open"));
        updateCartUI();
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
        const cart = loadCart();
        if (cart.length === 0) return alert("Košík je prázdný.");
        window.location.href = "/FoodExpress/Checkout"; // MVC route
    }

    // ---------- detail modal (simple: uses product data; reviews/allergens can stay later) ----------
    function openDetail(id) {
        const item = foodItems.find((i) => i.id === id);
        if (!item) return;
        selectedItem = item;

        const ov = $("detailOverlay");
        const modal = $("detailModal");
        if (!ov || !modal) return;

        $("dTitle").textContent = item.name;
        $("dImg").src = item.image;
        $("dImg").alt = item.name;
        $("dPrice").textContent = String(item.price);
        $("dDesc").textContent = item.description;

        ov.hidden = false;
        modal.hidden = false;

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

    function bindCardClicks() {
        // add buttons
        document.querySelectorAll("[data-add]").forEach((btn) => {
            btn.addEventListener("click", () => addToCart(btn.dataset.add));
        });

        // open detail
        document.querySelectorAll("[data-open]").forEach((el) => {
            el.addEventListener("click", () => openDetail(el.dataset.open));
        });
    }

    // ---------- checkout ----------
    function initCheckoutPage() {
        if (!document.body.classList.contains("checkout")) return;

        const lines = $("summaryLines");
        const sumSubtotal = $("sumSubtotal");
        const sumDelivery = $("sumDelivery");
        const sumTotal = $("sumTotal");

        const cart = loadCart();
        const delivery = 49;
        const subtotal = cartTotal(cart);
        const total = subtotal + delivery;

        if (lines) {
            lines.innerHTML = cart.length
                ? cart
                    .map(
                        (i) =>
                            `<div class="sumline"><span>${escapeHtml(i.name)} x${i.quantity}</span><span><b>${i.price * i.quantity} Kč</b></span></div>`
                    )
                    .join("")
                : `<div style="color:#6b7280;font-weight:800">Košík je prázdný</div>`;
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
                if (cardFields) cardFields.style.display = selected === "card" ? "" : "none";
            });
        });

        if (cardFields) cardFields.style.display = selected === "card" ? "" : "none";
    }

    function submitOrder() {
        const form = document.getElementById("checkoutForm");
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }
        alert("Objednávka byla úspěšně odeslána!");
        localStorage.removeItem(CART_KEY);
        window.location.href = "/FoodExpress/Menu";
    }

    // ---------- init ----------
    function initHomePage() {
        if (!document.body.classList.contains("home")) return;

        readProductsFromDom();
        bindSearch();
        bindCategories();
        bindCardClicks();
        applyFilters();
        updateCartUI();

        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            closeDetail();
            closeCart();
        });
    }

    function init() {
        initHomePage();
        initCheckoutPage();
    }

    return {
        init,
        openCart,
        closeCart,
        goCheckout,
        openDetail,
        closeDetail,
        addSelectedToCart,
        submitOrder,
    };
})();

document.addEventListener("DOMContentLoaded", App.init);
