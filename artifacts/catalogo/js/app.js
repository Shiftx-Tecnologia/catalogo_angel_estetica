/* ==========================================
   CATÁLOGO DE PRODUTOS — app.js
   Edite data/products.json para gerenciar os produtos.
   ========================================== */

(function () {
  "use strict";

  /* ------ Estado ------ */
  let allProducts = [];
  let allCategories = [];
  let config = {};
  let activeCategory = "Todos";
  let searchQuery = "";
  let currentProduct = null;

  /* ------ Elementos DOM ------ */
  const sidebar        = document.getElementById("sidebar");
  const overlay        = document.getElementById("overlay");
  const menuToggle     = document.getElementById("menu-toggle");
  const sidebarClose   = document.getElementById("sidebar-close");
  const categoryList   = document.getElementById("category-list");
  const searchInput    = document.getElementById("search-input");
  const searchClear    = document.getElementById("search-clear");
  const productsGrid   = document.getElementById("products-grid");
  const emptyState     = document.getElementById("empty-state");
  const loadingState   = document.getElementById("loading-state");
  const productCount   = document.getElementById("product-count");
  const filterBar      = document.getElementById("filter-bar");
  const filterBadge    = document.getElementById("filter-badge");
  const filterClear    = document.getElementById("filter-clear");
  const resetBtn       = document.getElementById("reset-btn");
  const modalBackdrop  = document.getElementById("modal-backdrop");
  const modal          = document.getElementById("modal");
  const modalClose     = document.getElementById("modal-close");
  const modalMainImg   = document.getElementById("modal-main-img");
  const modalThumbs    = document.getElementById("modal-thumbs");
  const modalBadge     = document.getElementById("modal-badge");
  const modalTitle     = document.getElementById("modal-title");
  const modalCode      = document.getElementById("modal-code");
  const modalDesc      = document.getElementById("modal-desc");
  const modalWaBtn     = document.getElementById("modal-whatsapp-btn");
  const brandName      = document.getElementById("brand-name");
  const header         = document.getElementById("header");

  /* ==========================================
     CARREGAR DADOS
     ========================================== */
  async function loadData() {
    try {
      const base = getBasePath();
      const res = await fetch(base + "data/products.json");
      if (!res.ok) throw new Error("Erro ao carregar produtos");
      const data = await res.json();

      config = data.config || {};
      allProducts = data.products || [];
      allCategories = data.categories || [];

      applyConfig();
      buildCategoryMenu();
      renderProducts();
      hideLoading();
    } catch (err) {
      hideLoading();
      console.error("Falha ao carregar products.json:", err);
      productsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
          <p>Não foi possível carregar os produtos.<br>Verifique se o arquivo <code>data/products.json</code> existe.</p>
        </div>`;
    }
  }

  /* Detecta o base path para GitHub Pages ou Vite */
  function getBasePath() {
    const scripts = document.querySelectorAll("script[src]");
    for (const s of scripts) {
      const src = s.getAttribute("src") || "";
      const match = src.match(/^(.*\/)js\/app\.js$/);
      if (match) return match[1];
    }
    return "./";
  }

  function hideLoading() {
    if (loadingState) loadingState.style.display = "none";
  }

  /* ==========================================
     APLICAR CONFIGURAÇÃO
     ========================================== */
  function applyConfig() {
    if (config.storeName) {
      document.title = config.storeName + " — Catálogo";
      if (brandName) brandName.textContent = config.storeName;
    }
    if (config.storeTagline) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", config.storeTagline);
    }
  }

  /* ==========================================
     MONTAR MENU DE CATEGORIAS
     ========================================== */
  function buildCategoryMenu() {
    const categoryIcons = {};
    allCategories.forEach(c => { categoryIcons[c.name] = c.icon || ""; });

    const existing = categoryList.querySelector('[data-category="Todos"]');
    if (existing) existing.parentElement.remove();

    categoryList.innerHTML = "";

    // "Todos" primeiro
    const allLi = document.createElement("li");
    allLi.innerHTML = `
      <button class="category-btn active" data-category="Todos">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Todos os Produtos
      </button>`;
    categoryList.appendChild(allLi);

    // Categorias dinâmicas
    const usedCategories = [...new Set(allProducts.map(p => p.category))];
    const ordered = allCategories.filter(c => usedCategories.includes(c.name));

    ordered.forEach(cat => {
      const li = document.createElement("li");
      li.innerHTML = `
        <button class="category-btn" data-category="${escapeHtml(cat.name)}">
          ${cat.icon || ""}
          ${escapeHtml(cat.name)}
        </button>`;
      categoryList.appendChild(li);
    });

    // Categorias não mapeadas (no JSON de categorias mas com produtos)
    usedCategories.forEach(name => {
      if (!allCategories.find(c => c.name === name)) {
        const li = document.createElement("li");
        li.innerHTML = `<button class="category-btn" data-category="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
        categoryList.appendChild(li);
      }
    });

    // Eventos
    categoryList.querySelectorAll(".category-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        selectCategory(btn.dataset.category);
        closeSidebar();
      });
    });
  }

  /* ==========================================
     FILTRAR E RENDERIZAR
     ========================================== */
  function getFiltered() {
    return allProducts.filter(p => {
      const matchCat = activeCategory === "Todos" || p.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }

  function renderProducts() {
    const filtered = getFiltered();

    // Atualiza contador
    productCount.textContent = filtered.length === allProducts.length
      ? `${allProducts.length} produto${allProducts.length !== 1 ? "s" : ""}`
      : `${filtered.length} de ${allProducts.length} produto${allProducts.length !== 1 ? "s" : ""}`;

    // Barra de filtro ativo
    if (activeCategory !== "Todos") {
      filterBar.style.display = "flex";
      filterBadge.textContent = activeCategory;
    } else {
      filterBar.style.display = "none";
    }

    // Limpar grid
    productsGrid.innerHTML = "";

    if (filtered.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    filtered.forEach(product => {
      const card = createCard(product);
      productsGrid.appendChild(card);
    });
  }

  function createCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Ver detalhes de " + product.name);

    const img = product.image || "https://placehold.co/400x400/ede8fb/6C3FC5?text=Produto";
    const isPromo = product.promo || product.category === "Promoções";

    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.src='https://placehold.co/400x400/ede8fb/6C3FC5?text=Imagem';" />
        <span class="card-badge ${isPromo ? "promo" : ""}">${isPromo ? "Promoção" : escapeHtml(product.category)}</span>
      </div>
      <div class="card-body">
        <span class="card-category">${escapeHtml(product.category)}</span>
        <h3 class="card-name">${escapeHtml(product.name)}</h3>
        <p class="card-desc">${escapeHtml(product.description || "")}</p>
        ${product.code ? `<span class="card-code">${escapeHtml(product.code)}</span>` : ""}
      </div>
      <div class="card-footer">
        <button class="btn-interest" data-id="${product.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Tenho Interesse
        </button>
      </div>`;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-interest")) {
        e.stopPropagation();
        openWhatsApp(product);
        return;
      }
      openModal(product);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(product);
      }
    });

    return card;
  }

  /* ==========================================
     MODAL
     ========================================== */
  function openModal(product) {
    currentProduct = product;

    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const mainImg = images[0] || "https://placehold.co/600x600/ede8fb/6C3FC5?text=Produto";

    modalMainImg.src = mainImg;
    modalMainImg.alt = product.name;
    modalTitle.textContent = product.name;
    modalBadge.textContent = product.category;
    modalDesc.textContent = product.description || "";
    modalCode.textContent = product.code ? "Código: " + product.code : "";

    // Thumbs
    modalThumbs.innerHTML = "";
    if (images.length > 1) {
      images.forEach((src, i) => {
        const thumb = document.createElement("div");
        thumb.className = "modal-thumb" + (i === 0 ? " active" : "");
        thumb.innerHTML = `<img src="${escapeHtml(src)}" alt="Imagem ${i + 1}" loading="lazy" />`;
        thumb.addEventListener("click", () => {
          modalMainImg.style.opacity = "0";
          setTimeout(() => {
            modalMainImg.src = src;
            modalMainImg.style.opacity = "1";
          }, 100);
          modalThumbs.querySelectorAll(".modal-thumb").forEach(t => t.classList.remove("active"));
          thumb.classList.add("active");
        });
        modalThumbs.appendChild(thumb);
      });
    }

    // WhatsApp
    modalWaBtn.onclick = () => openWhatsApp(product);

    modalBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => modalClose.focus(), 100);
  }

  function closeModal() {
    modalBackdrop.classList.remove("open");
    document.body.style.overflow = "";
    currentProduct = null;
  }

  /* ==========================================
     WHATSAPP
     ========================================== */
  function openWhatsApp(product) {
    const number = product.whatsapp || config.whatsapp || "5511999999999";
    const template = config.whatsappMessage ||
      "Olá, tenho interesse neste produto.\n\nProduto: {nome}\nDescrição: {descricao}\nImagem: {imagem}\n\nPoderia me fornecer mais informações?";

    const imageUrl = product.image || "";
    const message = template
      .replace("{nome}", product.name)
      .replace("{descricao}", product.description || "")
      .replace("{imagem}", imageUrl);

    const url = "https://wa.me/" + number.replace(/\D/g, "") + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  /* ==========================================
     CATEGORIA
     ========================================== */
  function selectCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.category === cat);
    });
    renderProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ==========================================
     SIDEBAR (mobile)
     ========================================== */
  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  /* ==========================================
     EVENTOS
     ========================================== */
  menuToggle.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", () => { closeSidebar(); closeModal(); });

  modalClose.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    const hasValue = searchQuery.length > 0;
    searchClear.classList.toggle("visible", hasValue);
    renderProducts();
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    searchClear.classList.remove("visible");
    searchInput.focus();
    renderProducts();
  });

  filterClear.addEventListener("click", () => {
    selectCategory("Todos");
  });

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    searchClear.classList.remove("visible");
    selectCategory("Todos");
  });

  // Fechar modal com Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalBackdrop.classList.contains("open")) closeModal();
      else closeSidebar();
    }
  });

  // Header sombra ao scrollar
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  /* ==========================================
     UTILITÁRIOS
     ========================================== */
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ==========================================
     INICIAR
     ========================================== */
  loadData();
})();
