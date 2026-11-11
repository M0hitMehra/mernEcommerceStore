import { Link } from "react-router-dom";
import { ShoppingBag, Eye, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const coverImage = product?.images?.[0]?.url;
  const inStock = Number(product?.quantity ?? 0) > 0;

  return (
    <article
      className="glass-card glass-card-interactive"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Image */}
      <Link
        to={`/product/${product.slug}`}
        style={{
          position: "relative",
          display: "block",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background:
            "radial-gradient(circle at center, rgba(56,189,248,0.14), rgba(15,23,42,0.5))",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={product.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "var(--text-muted)",
              fontSize: "0.86rem",
            }}
          >
            No Image
          </div>
        )}

        {/* Top Badges */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            pointerEvents: "none",
          }}
        >
          {product?.category?.name ? (
            <span
              className="glass-badge"
              style={{
                background: "rgba(9, 14, 29, 0.68)",
                backdropFilter: "blur(10px)",
                color: "#e2e8f0",
              }}
            >
              {product.category.name}
            </span>
          ) : (
            <span />
          )}

          <span
            className={`glass-badge ${inStock ? "badge-emerald" : "badge-rose"}`}
            style={{
              backdropFilter: "blur(10px)",
              background: inStock
                ? "rgba(6, 78, 59, 0.72)"
                : "rgba(136, 19, 55, 0.75)",
            }}
          >
            {inStock ? `${product.quantity} left` : "Out of Stock"}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div
        style={{
          padding: "16px 18px 18px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <Link to={`/product/${product.slug}`}>
            <h3
              className="display-heading"
              style={{
                fontSize: "1.06rem",
                fontWeight: 700,
                marginBottom: 6,
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </h3>
          </Link>
          <p
            style={{
              margin: 0,
              fontSize: "0.86rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 6,
          }}
        >
          <div>
            <div
              className="display-heading tabular-nums gradient-text"
              style={{ fontSize: "1.24rem", fontWeight: 700 }}
            >
              {formatPrice(product.price)}
            </div>
            {product.shipping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.74rem",
                  color: "var(--accent-emerald)",
                  marginTop: 2,
                }}
              >
                <Truck size={12} /> Fast Shipping
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link
              to={`/product/${product.slug}`}
              className="glass-btn glass-btn-secondary glass-btn-sm"
              title="View details"
            >
              <Eye size={15} />
            </Link>
            <button
              type="button"
              className="glass-btn glass-btn-primary glass-btn-sm"
              disabled={!inStock}
              onClick={() => addItem(product, 1)}
            >
              <ShoppingBag size={15} />
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
