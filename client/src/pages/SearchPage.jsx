import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { productApi, getErrorMessage } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const page = Number(searchParams.get("page") || 1);

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ filteredProductsCount: 0, resultPage: 9 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    productApi
      .list({ keyword, page })
      .then(({ data }) => {
        if (!active) return;
        setProducts(data?.products || []);
        setMeta({
          filteredProductsCount: data?.filteredProductsCount || 0,
          resultPage: data?.resultPage || 9,
        });
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "Search failed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [keyword, page]);

  const totalPages = Math.max(
    1,
    Math.ceil((meta.filteredProductsCount || 0) / (meta.resultPage || 9))
  );

  const goPage = (next) => {
    setSearchParams({ keyword, page: String(next) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="glass-surface" style={{ padding: "26px 28px" }}>
        <div className="glass-badge badge-cyan" style={{ marginBottom: 10 }}>
          <Search size={13} /> Search Results
        </div>
        <h1 className="display-heading" style={{ fontSize: "1.9rem" }}>
          {keyword ? (
            <>
              Results for <span className="gradient-text">"{keyword}"</span>
            </>
          ) : (
            "All Catalog Products"
          )}
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
          Found {meta.filteredProductsCount} matching item(s). Numeric queries
          automatically match products within ±10% of that price.
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
        <div className="glass-surface" style={{ padding: 48, textAlign: "center" }}>
          <h3 className="display-heading">No products matched your query</h3>
          <p style={{ color: "var(--text-muted)", margin: "8px 0 20px" }}>
            Try another keyword or return to the full storefront.
          </p>
          <Link to="/" className="glass-btn glass-btn-primary">
            Back to Shop
          </Link>
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
            onClick={() => goPage(page - 1)}
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
            onClick={() => goPage(page + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
