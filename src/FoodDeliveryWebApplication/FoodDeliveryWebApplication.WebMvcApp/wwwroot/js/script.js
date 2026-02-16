console.log("script.js loaded");

const App = (() => {
    // ---------- helpers ----------
    const $ = (id) => document.getElementById(id);

    function escapeHtml(s) {
        return String(s)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    async function getJson(url) {
        const r = await fetch(url, { headers: { Accept: "application/json" } });
        if (!r.ok) return [];
        const ct = (r.headers.get("content-type") || "").toLowerCase();
        if (!ct.includes("application/json")) return [];
        return await r.json();
    }

    async function post(url) {
        return await fetch(url, { method: "POST" });
    }

    // =====================================================
    // AUTH tabs (login/register) – index.cshtml
    // =====================================================
    function initAuthTabs() {
        const loginForm = $("loginForm");
        const registerForm = $("registerForm");
        const tabs = document.querySelectorAll(".segmented-btn");
        if (!loginForm || !registerForm || tabs.length === 0) return;

        function setTab(name) {
            tabs.forEach((b) => {
                const active = b.dataset.tab === name;
                b.classList.toggle("is-active", active);
                b.setAttribute("aria-selected", active ? "true" : "false");
            });

            loginForm.classList.toggle("is-active", name === "login");
            registerForm.classList.toggle("is-active", name === "register");
        }

        tabs.forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
        setTab("login");
    }

    // =====================================================
    // USER MENU (button top right)
    // =====================================================
    function toggleUserMenu() {
        const m = $("userMenu");
        if (!m) return;
        m.hidden = !m.hidden;
    }

    function initUserMenuCloseHandlers() {
        // zavírání po kliknutí mimo
        document.addEventListener("click", (e) => {
            const menu = $("userMenu");
            const btn = document.querySelector(".chip-user");
            if (!menu || menu.hidden) return;
            if (menu.contains(e.target)) return;
            if (btn && btn.contains(e.target)) return;
            menu.hidden = true;
        });

        // ESC zavírá
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            const menu = $("userMenu");
            if (menu) menu.hidden = true;
        });
    }

    // =====================================================
    // MENU: products read from DOM
    // =====================================================
    let products = [];
    let selectedProduct = null;

    function readProductsFromDom() {
        const nodes = document.querySelectorAll("[data-product]");
        products = Array.from(nodes).map((n) => ({
            id: n.dataset.id, // string from DOM
            name: n.dataset.name || "",
            description: n.dataset.description || "",
            price: Number(n.dataset.price || 0),
            image: n.dataset.image || "",
            category: n.dataset.category || "",
        }));
    }

    // =====================================================
    // CART: DB-backed (CartController endpoints)
    // =====================================================
    async function fetchCart() {
        // očekává: [{ productId, name, price, image, quantity }]
        return await getJson("/Cart/Get");
    }

    async function addToCart(productId) {
        const res = await post(`/Cart/Add?productId=${encodeURIComponent(productId)}`);
        if (!res.ok) {
            alert("Nepodařilo se přidat do košíku (možná nejsi přihlášený).");
            return;
        }
        await updateCartUI();
    }

    async function setQty(productId, qty) {
        const res = await post(
            `/Cart/SetQty?productId=${encodeURIComponent(productId)}&qty=${encodeURIComponent(qty)}`
        );
        if (!res.ok) {
            alert("Nepodařilo se upravit košík.");
            return;
        }
        await updateCartUI(true);
    }

    async function removeFromCart(productId) {
        const res = await post(`/Cart/Remove?productId=${encodeURIComponent(productId)}`);
        if (!res.ok) {
            alert("Nepodařilo se odstranit položku.");
            return;
        }
        await updateCartUI(true);
    }

    async function updateCartUI(keepOpen = false) {
        const cart = await fetchCart();

        const count = (cart || []).reduce((s, i) => s + i.quantity, 0);
        const total = (cart || []).reduce((s, i) => s + i.price * i.quantity, 0);

        const countEl = $("cartCount");
        const totalEl = $("cartTotal");
        if (countEl) countEl.textContent = String(count);
        if (totalEl) totalEl.textContent = String(total);

        const body = $("cartBody");
        if (!body) return;

        if (!cart || cart.length === 0) {
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
            <button class="icon-btn" type="button" data-minus="${i.productId}">−</button>
            <span class="qty">${i.quantity}</span>
            <button class="icon-btn" type="button" data-plus="${i.productId}">+</button>
            <button class="icon-btn" type="button" data-x="${i.productId}">×</button>
          </div>
        </div>
      `
            )
            .join("");

        body.querySelectorAll("[data-minus]").forEach((btn) =>
            btn.addEventListener("click", () => {
                const id = btn.dataset.minus;
                const cur = cart.find((x) => String(x.productId) === String(id))?.quantity || 1;
                setQty(id, cur - 1);
            })
        );

        body.querySelectorAll("[data-plus]").forEach((btn) =>
            btn.addEventListener("click", () => {
                const id = btn.dataset.plus;
                const cur = cart.find((x) => String(x.productId) === String(id))?.quantity || 0;
                setQty(id, cur + 1);
            })
        );

        body.querySelectorAll("[data-x]").forEach((btn) =>
            btn.addEventListener("click", () => removeFromCart(btn.dataset.x))
        );

        if (!keepOpen) return;
    }

    // =====================================================
    // CART drawer open/close
    // =====================================================
    async function openCart() {
        const overlay = $("cartOverlay");
        const drawer = $("cartDrawer");
        if (!overlay || !drawer) return;

        overlay.hidden = false;
        drawer.hidden = false;

        requestAnimationFrame(() => drawer.classList.add("is-open"));
        await updateCartUI(true);
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

    // =====================================================
    // DETAIL modal
    // =====================================================
    function openDetail(productId) {
        const p = products.find((x) => String(x.id) === String(productId));
        if (!p) return;
        selectedProduct = p;

        const ov = $("detailOverlay");
        const modal = $("detailModal");
        if (!ov || !modal) return;

        if ($("dTitle")) $("dTitle").textContent = p.name;
        if ($("dImg")) {
            $("dImg").src = p.image;
            $("dImg").alt = p.name;
        }
        if ($("dPrice")) $("dPrice").textContent = String(p.price);
        if ($("dDesc")) $("dDesc").textContent = p.description;

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
        selectedProduct = null;

        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }

    async function addSelectedToCart() {
        if (!selectedProduct) return;
        await addToCart(selectedProduct.id);
        closeDetail();
    }

    // =====================================================
    // MENU bindings
    // =====================================================
    function initMenuPage() {
        // menu stránku poznáme podle toho, že existuje aspoň jedna karta s data-product
        if (!document.querySelector("[data-product]")) return;

        readProductsFromDom();

        document.querySelectorAll("[data-open]").forEach((el) => {
            el.addEventListener("click", () => openDetail(el.dataset.open));
        });

        document.querySelectorAll("[data-add]").forEach((btn) => {
            btn.addEventListener("click", async () => addToCart(btn.dataset.add));
        });

        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            closeDetail();
            closeCart();
        });

        updateCartUI();
    }

    // =====================================================
    // INIT
    // =====================================================
    function init() {
        initAuthTabs();
        initMenuPage();
        initUserMenuCloseHandlers();
    }

    return {
        init,

        // onclick z HTML
        toggleUserMenu,
        openCart,
        closeCart,
        openDetail,
        closeDetail,
        addSelectedToCart,
    };
})();

document.addEventListener("DOMContentLoaded", App.init);
window.App = App;
