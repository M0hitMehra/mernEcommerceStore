import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Eye,
  X,
  MapPin,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { authApi, productApi, getErrorMessage } from "../../api/client";
import {
  formatDateTime,
  formatPrice,
  getStatusBadgeClass,
  ORDER_STATUSES,
} from "../../utils/format";
import { AdminSidebar } from "../../components/DashboardSidebar";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await authApi.getAdminOverview();
      setOrders(data?.orders || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await productApi.changeOrderStatus(orderId, nextStatus);
      if (data?.success) {
        toast.success(data.message || `Status updated to ${nextStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
        setDetailOrder((prev) =>
          prev && prev._id === orderId ? { ...prev, status: nextStatus } : prev
        );
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to change order status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const getOrderTotal = (order) =>
    Number(order?.payment?.transaction?.amount || 0) ||
    (order.products || []).reduce(
      (s, i) => s + (i?.productId?.price || 0) * (i?.quantity || 1),
      0
    );

  const visibleOrders = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      o._id?.toLowerCase().includes(q) ||
      o.buyer?.name?.toLowerCase().includes(q) ||
      o.buyer?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="glass-surface" style={{ padding: "24px 28px" }}>
          <div className="glass-badge badge-cyan" style={{ marginBottom: 8 }}>
            <ClipboardList size={13} /> Fulfillment
          </div>
          <h1 className="display-heading" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            Manage Orders ({orders.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "6px 0 16px" }}>
            Inspect buyer details, payment status, and update order fulfillment stages.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 340 }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                className="glass-input"
                style={{ paddingLeft: 38 }}
                placeholder="Search buyer, email, or order ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            <button
              type="button"
              className={`glass-pill ${statusFilter === "" ? "active" : ""}`}
              onClick={() => setStatusFilter("")}
            >
              All ({orders.length})
            </button>
            {ORDER_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                className={`glass-pill ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st} ({orders.filter((o) => o.status === st).length})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="glass-skeleton" style={{ height: 260 }} />
        ) : visibleOrders.length === 0 ? (
          <div
            className="glass-surface"
            style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}
          >
            No matching orders found.
          </div>
        ) : (
          visibleOrders.map((order, idx) => {
            const total = getOrderTotal(order);

            return (
              <div
                key={order._id}
                className="glass-surface"
                style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--glass-hairline)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Order #{visibleOrders.length - idx} —{" "}
                      {order.buyer?.name || "Customer"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {order.buyer?.email} • {order.buyer?.address} •{" "}
                      {formatDateTime(order.createdAt)}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                    <span className="glass-badge badge-cyan tabular-nums">
                      {formatPrice(total)}
                    </span>
                    <span
                      className={`glass-badge ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <select
                      className="glass-select"
                      style={{ width: 155, padding: "7px 10px", fontSize: "0.84rem" }}
                      disabled={updatingId === order._id}
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="glass-btn glass-btn-secondary glass-btn-sm"
                      onClick={() => setDetailOrder(order)}
                    >
                      <Eye size={14} /> Detailed View
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {(order.products || []).map((line, i) => (
                    <div
                      key={line._id || i}
                      className="glass-card"
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {line?.productId?.images?.[0]?.url && (
                        <img
                          src={line.productId.images[0].url}
                          alt={line.productId.name}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <div style={{ fontSize: "0.84rem" }}>
                        <div style={{ fontWeight: 600 }}>
                          {line?.productId?.name || "Removed product"}
                        </div>
                        <div style={{ color: "var(--text-muted)" }}>
                          Qty {line.quantity} ×{" "}
                          {formatPrice(line?.productId?.price || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <div
          className="glass-modal-backdrop"
          onClick={() => setDetailOrder(null)}
        >
          <div
            className="glass-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 26,
              background: "var(--glass-dropdown-bg)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 className="display-heading" style={{ fontSize: "1.35rem", fontWeight: 700 }}>
                  Order Detailed View
                </h2>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  ID {detailOrder._id} • {formatDateTime(detailOrder.createdAt)}
                </div>
              </div>
              <button
                type="button"
                className="glass-pill"
                style={{ padding: 7 }}
                onClick={() => setDetailOrder(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="glass-card" style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--accent)",
                  marginBottom: 6,
                }}
              >
                <MapPin size={14} /> Customer & Delivery Details
              </div>
              <div style={{ fontWeight: 600 }}>{detailOrder.buyer?.name}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {detailOrder.buyer?.email} • {detailOrder.buyer?.phone}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
                {detailOrder.buyer?.address}
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: 14,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Payment Gateway Status
                </div>
                <div style={{ marginTop: 4 }}>
                  <span
                    className={`glass-badge ${
                      detailOrder?.payment?.success
                        ? "badge-emerald"
                        : "badge-amber"
                    }`}
                  >
                    {detailOrder?.payment?.success ? (
                      <>
                        <CheckCircle2 size={12} /> Paid (
                        {detailOrder?.payment?.transaction?.id || "Braintree"})
                      </>
                    ) : (
                      <>
                        <Clock size={12} />{" "}
                        {detailOrder?.payment?.message || "Payment Unconfirmed"}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <select
                className="glass-select"
                style={{ width: 170, padding: "8px 10px" }}
                disabled={updatingId === detailOrder._id}
                value={detailOrder.status}
                onChange={(e) =>
                  handleStatusChange(detailOrder._id, e.target.value)
                }
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(detailOrder.products || []).map((line, i) => (
                <div
                  key={line._id || i}
                  className="glass-card"
                  style={{
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {line?.productId?.images?.[0]?.url && (
                    <img
                      src={line.productId.images[0].url}
                      alt={line.productId.name}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      {line?.productId?.name || "Removed product"}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      Qty: {line.quantity} ×{" "}
                      {formatPrice(line?.productId?.price || 0)}
                    </div>
                  </div>
                  <div className="tabular-nums" style={{ fontWeight: 700 }}>
                    {formatPrice((line?.productId?.price || 0) * (line.quantity || 1))}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 10,
                borderTop: "1px solid var(--glass-hairline)",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              <span>Order Total</span>
              <span className="tabular-nums">
                {formatPrice(getOrderTotal(detailOrder))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
