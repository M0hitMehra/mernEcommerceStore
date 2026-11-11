import { Link } from "react-router-dom";
import { ShoppingBag, Truck } from "lucide-react";
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
      {/* Image Stage */}
      <Link
        to={`/product/${product.slug}`}
        style={{
          position: "relative",
          display: "block",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: "var(--media-bg)",
          borderBottom: "1px solid var(--glass-hairline)",
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
              e.currentTarget.style.transform = "scale(1.04)";
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

        {!inStock && (
          <span
            className="glass-badge badge-rose"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backdropFilter: "blur(12px)",
            }}
          >
            Out of Stock
          </span>
        )}
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
          {product?.category?.name && (
            <div
              style={{
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 4,
              }}
            >
              {product.category.name}
            </div>
          )}
          <Link to={`/product/${product.slug}`}>
            <h3
              className="display-heading"
              style={{
                fontSize: "1.04rem",
                fontWeight: 600,
                marginBottom: 6,
                lineHeight: 1.32,
              }}
            >
              {product.name}
            </h3>
          </Link>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              lineHeight: 1.48,
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
            paddingTop: 8,
            borderTop: "1px solid var(--glass-hairline)",
          }}
        >
          <div>
            <div
              className="display-heading tabular-nums"
              style={{ fontSize: "1.14rem", fontWeight: 700 }}
            >
              {formatPrice(product.price)}
            </div>
            {product.shipping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.73rem",
                  color: "var(--success)",
                  marginTop: 2,
                }}
              >
                <Truck size={11} /> Free delivery
              </div>
            )}
          </div>

          <button
            type="button"
            className="glass-btn glass-btn-primary glass-btn-sm"
            disabled={!inStock}
            onClick={() => addItem(product, 1)}
          >
            <ShoppingBag size={14} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
