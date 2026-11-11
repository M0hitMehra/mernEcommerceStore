import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { categoryApi, productApi, getErrorMessage } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ filteredProductsCount: 0, resultPage: 9 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data: catRes } = await categoryApi.getSingle(slug);
        if (!active) return;
        const cat = catRes?.category;
        setCategory(cat);

        if (cat?._id) {
          const { data: prodRes } = await productApi.list({
            keyword: "",
            category: cat._id,
            page,
          });
          if (!active) return;
          setProducts(prodRes?.products || []);
          setMeta({
            filteredProductsCount: prodRes?.filteredProductsCount || 0,
            resultPage: prodRes?.resultPage || 9,
          });
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, "Unable to load category products"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, page]);

  const totalPages = Math.max(
    1,
    Math.ceil((meta.filteredProductsCount || 0) / (meta.resultPage || 9))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="glass-surface" style={{ padding: "26px 28px" }}>
        <Link
          to="/categories"
          className="glass-pill"
          style={{ marginBottom: 14, display: "inline-flex" }}
        >
          <ArrowLeft size={14} /> All Categories
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Layers size={22} color="#38bdf8" />
          <h1 className="display-heading gradient-text" style={{ fontSize: "2rem" }}>
            {category?.name || slug}
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
          {meta.filteredProductsCount} product(s) available in this category.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 20, color: "#fecdd3" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="glass-skeleton" style={{ height: 350 }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          className="glass-surface"
          style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}
        >
          No products found in this category yet.
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <button
            type="button"
            className="glass-btn glass-btn-secondary glass-btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="glass-pill active">
            Page {page} / {totalPages}
          </span>
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
    </div>
  );
}
