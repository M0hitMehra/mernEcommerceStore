import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList } from "lucide-react";
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
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to change order status"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="glass-surface" style={{ padding: "24px 28px" }}>
          <div className="glass-badge badge-cyan" style={{ marginBottom: 8 }}>
            <ClipboardList size={13} /> Fulfillment
          </div>
          <h1 className="display-heading gradient-text" style={{ fontSize: "1.8rem" }}>
            Manage Orders
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
            Update fulfillment stages across all customer orders.
          </p>
        </div>

        {loading ? (
          <div className="glass-skeleton" style={{ height: 260 }} />
        ) : orders.length === 0 ? (
          <div
            className="glass-surface"
            style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}
          >
            No customer orders yet.
          </div>
        ) : (
          orders.map((order, idx) => {
            const total =
              order?.payment?.transaction?.amount ||
              (order.products || []).reduce(
                (s, i) => s + (i?.productId?.price || 0) * (i?.quantity || 1),
                0
              );

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
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Order #{orders.length - idx} — {order.buyer?.name || "Unknown"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {order.buyer?.email} • {order.buyer?.address} •{" "}
                      {formatDateTime(order.createdAt)}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                      style={{ width: 165, padding: "7px 10px", fontSize: "0.84rem" }}
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
    </div>
  );
}
