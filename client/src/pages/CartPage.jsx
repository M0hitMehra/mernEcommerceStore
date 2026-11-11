import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CreditCard,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { productApi, getErrorMessage } from "../api/client";
import { formatPrice } from "../utils/format";
import BraintreeDropIn from "../components/BraintreeDropIn";

export default function CartPage() {
  const {
    items,
    totalCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [clientToken, setClientToken] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [dropInInstance, setDropInInstance] = useState(null);
  const [paying, setPaying] = useState(false);

  const handleInstance = useCallback((inst) => {
    setDropInInstance(inst);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || items.length === 0) {
      setClientToken("");
      return;
    }
    let active = true;
    setTokenLoading(true);
    productApi
      .getBraintreeToken()
      .then(({ data }) => {
        if (active && data?.clientToken) {
          setClientToken(data.clientToken);
        }
      })
      .catch(() => {
        if (active) setClientToken("");
      })
      .finally(() => {
        if (active) setTokenLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, items.length]);

  const handlePayment = async () => {
    if (!dropInInstance) {
      toast.error("Payment gateway is not ready yet");
      return;
    }
    setPaying(true);
    try {
      const { nonce } = await dropInInstance.requestPaymentMethod();
      const cartPayload = items.map((item) => ({
        product: item.product,
        price: item.price,
        quantity: item.quantity,
      }));
      const { data } = await productApi.submitBraintreePayment(
        cartPayload,
        nonce
      );
      if (data?.success) {
        clearCart();
        toast.success(data.message || "Order placed successfully!");
        navigate("/dashboard/user/orders");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Payment failed"));
    } finally {
      setPaying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="glass-surface"
        style={{ padding: "64px 24px", textAlign: "center" }}
      >
        <ShoppingBag size={52} style={{ opacity: 0.4, marginBottom: 14 }} />
        <h1 className="display-heading" style={{ fontSize: "1.8rem" }}>
          Your Cart is Empty
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "10px 0 24px" }}>
          Add curated products from the store to begin checkout.
        </p>
        <Link to="/" className="glass-btn glass-btn-primary">
          Continue Shopping
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="glass-surface" style={{ padding: "24px 28px" }}>
        <h1 className="display-heading gradient-text" style={{ fontSize: "1.9rem" }}>
          Shopping Cart & Checkout
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
          {totalCount} item(s) ready for order — Total{" "}
          <strong style={{ color: "#fff" }}>{formatPrice(subtotal)}</strong>
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left: Cart Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((item) => (
            <div
              key={item.product}
              className="glass-card"
              style={{
                padding: 16,
                display: "flex",
                gap: 16,
                alignItems: "center",
              }}
            >
              <Link
                to={`/product/${item.slug}`}
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 14,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
              </Link>

              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  to={`/product/${item.slug}`}
                  className="display-heading"
                  style={{
                    display: "block",
                    fontSize: "1.06rem",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {item.name}
                </Link>
                <div
                  className="tabular-nums"
                  style={{ color: "var(--accent-cyan)", fontWeight: 600 }}
                >
                  {formatPrice(item.price)} each
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <button
                    type="button"
                    className="glass-pill"
                    style={{ padding: "5px 9px" }}
                    onClick={() =>
                      updateQuantity(item.product, item.quantity - 1)
                    }
                  >
                    <Minus size={13} />
                  </button>
                  <span className="tabular-nums" style={{ fontWeight: 700 }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="glass-pill"
                    style={{ padding: "5px 9px" }}
                    disabled={item.quantity >= (item.maxQuantity || 999)}
                    onClick={() =>
                      updateQuantity(item.product, item.quantity + 1)
                    }
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 12,
                }}
              >
                <div
                  className="display-heading tabular-nums"
                  style={{ fontSize: "1.12rem", fontWeight: 700 }}
                >
                  {formatPrice(item.price * item.quantity)}
                </div>
                <button
                  type="button"
                  className="glass-btn glass-btn-danger glass-btn-sm"
                  onClick={() => removeItem(item.product)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary & Payment */}
        <div
          className="glass-surface"
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <h2 className="display-heading" style={{ fontSize: "1.3rem" }}>
            Order Summary
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingBottom: 14,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Items ({totalCount})</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
              <span style={{ color: "var(--accent-emerald)" }}>Included</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.2rem",
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              <span>Total</span>
              <span className="tabular-nums gradient-text">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="glass-card" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                <Lock size={16} color="#38bdf8" />
                Sign in required to checkout
              </div>
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: "0.88rem",
                  color: "var(--text-secondary)",
                }}
              >
                Log into your account to confirm your delivery address and
                complete Braintree payment.
              </p>
              <button
                type="button"
                className="glass-btn glass-btn-primary"
                style={{ width: "100%" }}
                onClick={() => navigate("/login", { state: { from: "/cart" } })}
              >
                Sign In to Checkout
              </button>
            </div>
          ) : (
            <>
              {/* Address Card */}
              <div className="glass-card" style={{ padding: 14 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      color: "var(--accent-cyan)",
                    }}
                  >
                    <MapPin size={14} /> Delivery Address
                  </span>
                  <Link
                    to="/dashboard/user"
                    style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                  >
                    Edit
                  </Link>
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  {user?.address || "No delivery address set"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {user?.name} • {user?.phone}
                </div>
              </div>

              {/* Braintree Drop-In */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <CreditCard size={16} color="#38bdf8" />
                  Payment Method
                </div>

                {tokenLoading ? (
                  <div className="glass-skeleton" style={{ height: 140 }} />
                ) : clientToken ? (
                  <BraintreeDropIn
                    clientToken={clientToken}
                    onInstance={handleInstance}
                  />
                ) : (
                  <div
                    className="glass-card"
                    style={{ padding: 14, color: "var(--text-muted)", fontSize: "0.86rem" }}
                  >
                    Payment gateway token unavailable. Verify Braintree sandbox
                    keys on the server.
                  </div>
                )}

                <button
                  type="button"
                  className="glass-btn glass-btn-primary"
                  disabled={!dropInInstance || paying || !user?.address}
                  onClick={handlePayment}
                >
                  {paying
                    ? "Processing Payment..."
                    : `Pay ${formatPrice(subtotal)}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
