import { Link, useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function CartDrawer() {
  const {
    items,
    totalCount,
    subtotal,
    drawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeItem,
  } = useCart();
  const navigate = useNavigate();

  if (!drawerOpen) return null;

  return (
    <div
      className="glass-drawer-backdrop"
      onClick={() => setDrawerOpen(false)}
    >
      <aside
        className="glass-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping bag drawer"
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid var(--glass-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingBag size={19} style={{ color: "var(--accent)" }} />
            <h2 className="display-heading" style={{ fontSize: "1.12rem" }}>
              Your Bag ({totalCount})
            </h2>
          </div>
          <button
            type="button"
            className="glass-pill"
            onClick={() => setDrawerOpen(false)}
            style={{ padding: 7 }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                margin: "auto",
                textAlign: "center",
                padding: "32px 16px",
                color: "var(--text-muted)",
              }}
            >
              <ShoppingBag
                size={44}
                style={{ opacity: 0.35, marginBottom: 12 }}
              />
              <p style={{ margin: "0 0 16px", fontSize: "0.95rem" }}>
                Your bag is empty.
              </p>
              <button
                type="button"
                className="glass-btn glass-btn-primary glass-btn-sm"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/");
                }}
              >
                Explore Mohit Store
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product}
                className="glass-card"
                style={{
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <Link
                  to={`/product/${item.slug}`}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "var(--media-bg)",
                    border: "1px solid var(--glass-hairline)",
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : null}
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: "block",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </Link>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: "0.86rem",
                      color: "var(--accent)",
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    {formatPrice(item.price)}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <button
                      type="button"
                      className="glass-pill"
                      style={{ padding: "4px 8px" }}
                      onClick={() =>
                        updateQuantity(item.product, item.quantity - 1)
                      }
                    >
                      <Minus size={12} />
                    </button>
                    <span
                      className="tabular-nums"
                      style={{ fontSize: "0.88rem", fontWeight: 600 }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="glass-pill"
                      style={{ padding: "4px 8px" }}
                      disabled={item.quantity >= (item.maxQuantity || 999)}
                      onClick={() =>
                        updateQuantity(item.product, item.quantity + 1)
                      }
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="glass-btn glass-btn-danger glass-btn-sm"
                  style={{ padding: 7 }}
                  onClick={() => removeItem(item.product)}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div
            style={{
              padding: "18px 22px",
              borderTop: "1px solid var(--glass-hairline)",
              background: "var(--glass-bg-subtle)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 14,
              }}
            >
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Subtotal
              </span>
              <span
                className="display-heading tabular-nums"
                style={{ fontSize: "1.35rem", fontWeight: 700 }}
              >
                {formatPrice(subtotal)}
              </span>
            </div>
            <button
              type="button"
              className="glass-btn glass-btn-primary"
              style={{ width: "100%" }}
              onClick={() => {
                setDrawerOpen(false);
                navigate("/cart");
              }}
            >
              Review Bag & Checkout
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
