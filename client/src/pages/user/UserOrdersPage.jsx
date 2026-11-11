import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, CheckCircle2, Clock } from "lucide-react";
import { productApi, getErrorMessage } from "../../api/client";
import {
  formatDateTime,
  formatPrice,
  getStatusBadgeClass,
} from "../../utils/format";
import { UserSidebar } from "../../components/DashboardSidebar";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    productApi
      .getOrders()
      .then(({ data }) => {
        setOrders(data?.orders || []);
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Unable to fetch orders"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-layout">
      <UserSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="glass-surface" style={{ padding: "24px 28px" }}>
          <div className="glass-badge badge-cyan" style={{ marginBottom: 8 }}>
            <Package size={13} /> Orders
          </div>
          <h1 className="display-heading gradient-text" style={{ fontSize: "1.8rem" }}>
            Order History
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
            Track payment confirmations and delivery status across all your orders.
          </p>
        </div>

        {error && (
          <div className="glass-card" style={{ padding: 18, color: "#fecdd3" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="glass-skeleton" style={{ height: 240 }} />
        ) : orders.length === 0 ? (
          <div
            className="glass-surface"
            style={{ padding: 48, textAlign: "center" }}
          >
            <h3 className="display-heading">No orders placed yet</h3>
            <p style={{ color: "var(--text-muted)", margin: "8px 0 18px" }}>
              Once you complete checkout, your orders will appear here.
            </p>
            <Link to="/" className="glass-btn glass-btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order, index) => {
            const paid = Boolean(order?.payment?.success);
            const totalAmount =
              order?.payment?.transaction?.amount ||
              (order.products || []).reduce(
                (sum, item) =>
                  sum + (item?.productId?.price || 0) * (item?.quantity || 1),
                0
              );

            return (
              <div
                key={order._id}
                className="glass-surface"
                style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                      Order #{orders.length - index}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Placed {formatDateTime(order.createdAt)} • ID{" "}
                      <code>{order._id.slice(-8)}</code>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span
                      className={`glass-badge ${
                        paid ? "badge-emerald" : "badge-amber"
                      }`}
                    >
                      {paid ? (
                        <>
                          <CheckCircle2 size={12} /> Paid
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Payment Pending
                        </>
                      )}
                    </span>
                    <span
                      className={`glass-badge ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span className="glass-badge badge-cyan tabular-nums">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(order.products || []).map((line, i) => {
                    const p = line?.productId;
                    return (
                      <div
                        key={line._id || i}
                        className="glass-card"
                        style={{
                          padding: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 58,
                            height: 58,
                            borderRadius: 10,
                            overflow: "hidden",
                            flexShrink: 0,
                            background: "rgba(255,255,255,0.06)",
                          }}
                        >
                          {p?.images?.[0]?.url ? (
                            <img
                              src={p.images[0].url}
                              alt={p.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : null}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {p?.slug ? (
                            <Link
                              to={`/product/${p.slug}`}
                              style={{ fontWeight: 600 }}
                            >
                              {p.name}
                            </Link>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>
                              Product unavailable
                            </span>
                          )}
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Qty: {line.quantity} × {formatPrice(p?.price || 0)}
                          </div>
                        </div>
                        <div
                          className="tabular-nums"
                          style={{ fontWeight: 700, color: "var(--accent-cyan)" }}
                        >
                          {formatPrice((p?.price || 0) * (line.quantity || 1))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
