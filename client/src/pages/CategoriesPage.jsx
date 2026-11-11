import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, ArrowUpRight } from "lucide-react";
import { categoryApi, getErrorMessage } from "../api/client";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    categoryApi
      .getAll()
      .then(({ data }) => {
        setCategories(data?.categories || []);
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Failed to load categories"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="glass-surface" style={{ padding: "28px 30px" }}>
        <div className="glass-badge badge-cyan" style={{ marginBottom: 10 }}>
          <Layers size={13} /> Collections
        </div>
        <h1 className="display-heading" style={{ fontSize: "2rem", fontWeight: 700 }}>
          Browse All Categories
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "8px 0 0" }}>
          Select any collection in Mohit Store to view curated products.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 20, color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="categories-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="glass-skeleton" style={{ height: 112 }} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div
          className="glass-surface"
          style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}
        >
          No categories have been created yet.
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="glass-card glass-card-interactive"
              style={{
                padding: "22px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h2
                  className="display-heading"
                  style={{ fontSize: "1.14rem", fontWeight: 600 }}
                >
                  {cat.name}
                </h2>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  /{cat.slug}
                </div>
              </div>
              <div className="glass-pill" style={{ padding: 8 }}>
                <ArrowUpRight size={16} style={{ color: "var(--accent)" }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
