import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Layers,
} from "lucide-react";
import { categoryApi, productApi, getErrorMessage } from "../api/client";
import ProductCard from "../components/ProductCard";

const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under ₹500", min: "0", max: "500" },
  { label: "₹500 – ₹1,999", min: "500", max: "1999" },
  { label: "₹2,000 – ₹4,999", min: "2000", max: "4999" },
  { label: "₹5,000+", min: "5000", max: "" },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [page, setPage] = useState(1);

  const [meta, setMeta] = useState({
    productsCount: 0,
    filteredProductsCount: 0,
    resultPage: 9,
  });

  useEffect(() => {
    categoryApi
      .getAll()
      .then(({ data }) => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await productApi.list({
        keyword: appliedKeyword,
        page,
        category: selectedCategory,
        minPrice,
        maxPrice,
      });
      setProducts(data?.products || []);
      setMeta({
        productsCount: data?.productsCount || 0,
        filteredProductsCount: data?.filteredProductsCount || 0,
        resultPage: data?.resultPage || 9,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load products"));
    } finally {
      setLoading(false);
    }
  }, [appliedKeyword, page, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.max(
    1,
    Math.ceil((meta.filteredProductsCount || 0) / (meta.resultPage || 9))
  );

  const resetFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setKeyword("");
    setAppliedKeyword("");
    setPage(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Clean Apple-style Hero Banner */}
      <section
        className="glass-surface"
        style={{
          padding: "36px 34px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <div className="glass-badge badge-cyan" style={{ marginBottom: 14 }}>
            Mohit Store
          </div>
          <h1
            className="display-heading"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              marginBottom: 12,
            }}
          >
            The best way to buy the products you love.
          </h1>
          <p
            style={{
              margin: "0 0 22px",
              color: "var(--text-secondary)",
              fontSize: "1.02rem",
              lineHeight: 1.55,
            }}
          >
            Explore curated collections with instant category filtering, price
            precision, and seamless Braintree checkout.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link to="/categories" className="glass-btn glass-btn-primary">
              <Layers size={16} />
              Browse Categories
            </Link>
            <Link to="/cart" className="glass-btn glass-btn-secondary">
              Review Bag
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(130px, 1fr))",
            gap: 12,
          }}
        >
          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Products
            </div>
            <div
              className="display-heading tabular-nums"
              style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: 4 }}
            >
              {meta.productsCount}
            </div>
          </div>
          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Collections
            </div>
            <div
              className="display-heading tabular-nums"
              style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: 4 }}
            >
              {categories.length}
            </div>
          </div>
        </div>
      </section>

      {/* Main Storefront */}
      <div className="storefront-layout">
        {/* Filters */}
        <aside
          className="glass-surface"
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SlidersHorizontal size={16} style={{ color: "var(--accent)" }} />
              <h2 className="display-heading" style={{ fontSize: "1.02rem" }}>
                Refine
              </h2>
            </div>
            <button
              type="button"
              className="glass-pill"
              style={{ padding: "5px 10px", fontSize: "0.76rem" }}
              onClick={resetFilters}
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedKeyword(keyword.trim());
              setPage(1);
            }}
          >
            <label className="glass-label">Keyword or Price</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Name, spec, or 500..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button
                type="submit"
                className="glass-btn glass-btn-secondary glass-btn-sm"
                aria-label="Apply search"
              >
                <Search size={15} />
              </button>
            </div>
          </form>

          <div>
            <label className="glass-label">Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              <button
                type="button"
                className={`glass-pill ${selectedCategory === "" ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory("");
                  setPage(1);
                }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className={`glass-pill ${
                    selectedCategory === cat._id ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat._id);
                    setPage(1);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="glass-label">Price Range</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PRICE_PRESETS.map((preset) => {
                const isActive =
                  minPrice === preset.min && maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className={`glass-pill ${isActive ? "active" : ""}`}
                    style={{ justifyContent: "space-between", borderRadius: 12 }}
                    onClick={() => {
                      setMinPrice(preset.min);
                      setMaxPrice(preset.max);
                      setPage(1);
                    }}
                  >
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="glass-label">Custom Range (₹)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input
                type="number"
                min="0"
                className="glass-input"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
              />
              <input
                type="number"
                min="0"
                className="glass-input"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            className="glass-card"
            style={{
              padding: "14px 18px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Showing{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {products.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {meta.filteredProductsCount}
              </strong>{" "}
              products
              {appliedKeyword && (
                <span>
                  {" "}
                  for <code>"{appliedKeyword}"</code>
                </span>
              )}
            </div>
            <div className="glass-badge">
              Page {page} of {totalPages}
            </div>
          </div>

          {error && (
            <div
              className="glass-card"
              style={{
                padding: 20,
                borderColor: "var(--danger-border)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="glass-skeleton"
                  style={{ height: 350 }}
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div
              className="glass-surface"
              style={{ padding: "56px 24px", textAlign: "center" }}
            >
              <h3 className="display-heading" style={{ fontSize: "1.3rem" }}>
                No matching products found
              </h3>
              <p style={{ color: "var(--text-muted)", margin: "8px 0 20px" }}>
                Try clearing your category or price filters to view more items.
              </p>
              <button
                type="button"
                className="glass-btn glass-btn-primary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                marginTop: 8,
              }}
            >
              <button
                type="button"
                className="glass-btn glass-btn-secondary glass-btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                return (
                  <button
                    key={p}
                    type="button"
                    className={`glass-pill ${p === page ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                className="glass-btn glass-btn-secondary glass-btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
