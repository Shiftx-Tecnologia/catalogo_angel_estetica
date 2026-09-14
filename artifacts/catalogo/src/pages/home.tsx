import { useEffect, useMemo, useState } from "react";
import { Search, X, MessageCircle, ChevronRight } from "lucide-react";
import productsData from "../../data/products.json";

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  code: string;
  image: string;
  images: string[];
  promo: boolean;
};

type Category = { name: string; icon: string };
type Config = {
  storeName: string;
  storeTagline: string;
  whatsapp: string;
  whatsappMessage: string;
};

const config = productsData.config as Config;
const categories = productsData.categories as Category[];
const products = productsData.products as Product[];

export default function Home() {
  const [activeCat, setActiveCat] = useState<string>("Skincare");
  const [search, setSearch] = useState("");
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (openProduct) {
      setActiveImg(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [openProduct]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = p.category === activeCat;
      const term = search.trim().toLowerCase();
      const matchSearch = !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [activeCat, search]);

  const onCat = (c: string) => {
    setActiveCat(c);
    setSidebarOpen(false);
  };

  const buildWaLink = (p: Product) => {
    let msg = config.whatsappMessage;
    msg = msg.replace(/{nome}/g, p.name);
    msg = msg.replace(/{categoria}/g, p.category);
    msg = msg.replace(/{imagem}/g, p.image);
    return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      <div className={`overlay ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Categorias</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {categories.map((c) => (
            <button
              key={c.name}
              className={`category-btn ${activeCat === c.name ? "active" : ""}`}
              onClick={() => onCat(c.name)}
            >
              <span dangerouslySetInnerHTML={{ __html: c.icon }} />
              <span>{c.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-inner">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <span /><span /><span />
            </button>
            <a className="brand" href="#top">
              <img className="brand-logo" src="https://res.cloudinary.com/dxnmjt7zn/image/upload/v1789068449/Angel_-_logo_yfz2yf.jpg" alt={config.storeName} /> 
            </a>
          </div>
          <div className="header-center">
            <div className="search-wrap">
              <Search size={18} className="search-icon" />
              <input
                className="search-input"
                type="search"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear visible" onClick={() => setSearch("")} aria-label="Limpar busca">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="header-right">
          </div>
        </div>
      </header>

      <main className="layout" id="top">
        <div className="main-content">

          <div className="filter-bar">
            <span className="filter-label">Exibindo:</span>
            <span className="filter-badge">
              {activeCat}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Search size={32} />
              </div>
              <h3>Nada por aqui</h3>
              <p>Tente outra categoria ou termo de busca.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="product-card"
                  onClick={() => window.open(buildWaLink(p), "_blank")}
                >
                  <div className="card-image-wrap">
                    <img src={p.image} alt={p.name} loading="lazy" />
                    <span className={`card-badge ${p.promo ? "promo" : ""}`}>
                      {p.promo ? "Promo" : p.category}
                    </span>
                  </div>
                  <div className="card-body">
                    <span className="card-category">{p.category}</span>
                    <h3 className="card-name">{p.name}</h3>
                    <p className="card-desc">{p.description}</p>
                    <span className="card-code">Cód. {p.code}</span>
                  </div>
                  <div className="card-footer">
                    <button
                      className="btn-interest"
                      onClick={(e) => { e.stopPropagation(); window.open(buildWaLink(p), "_blank"); }}
                    >
                      <MessageCircle size={16} />
                      Tenho interesse
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {openProduct && (
        <div className="modal-backdrop open" onClick={() => setOpenProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpenProduct(null)} aria-label="Fechar">
              <X size={18} />
            </button>
            <div className="modal-inner">
              <div className="modal-gallery">
                <div className="modal-main-img-wrap">
                  <img className="modal-main-img" src={openProduct.images[activeImg]} alt={openProduct.name} />
                </div>
                {openProduct.images.length > 1 && (
                  <div className="modal-thumbs">
                    {openProduct.images.map((src, i) => (
                      <button
                        key={i}
                        className={`modal-thumb ${i === activeImg ? "active" : ""}`}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={src} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-info">
                <span className="modal-badge">{openProduct.category}</span>
                <h2 className="modal-title">{openProduct.name}</h2>
                <span className="modal-code">Cód. {openProduct.code}</span>
                <p className="modal-desc">{openProduct.description}</p>
                <a className="btn-whatsapp" href={buildWaLink(openProduct)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={20} />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
