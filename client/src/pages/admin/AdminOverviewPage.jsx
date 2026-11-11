import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  ClipboardList,
  IndianRupee,
  Layers,
  Users,
  ArrowRight,
} from "lucide-react";
import { authApi, categoryApi, getErrorMessage } from "../../api/client";
import { formatDate, formatPrice, getStatusBadgeClass } from "../../utils/format";
import { AdminSidebar } from "../../components/DashboardSidebar";

export default function AdminOverviewPage() {
  const [data, setData] = useState({
    users: [],
    products: [],
    orders: [],
    categoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([authApi.getAdminOverview(), categoryApi.getAll()])
      .then(([overviewRes, catRes]) => {
        setData({
          users: overviewRes.data?.users || [],
          products: overviewRes.data?.products || [],
          orders: overviewRes.data?.orders || [],
          categoriesCount: (catRes.data?.categories || []).length,
        });
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Failed to load admin overview"));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = data.orders.reduce((sum, order) => {
    const amt = Number(order?.payment?.transaction?.amount || 0);
    if (amt > 0) return sum + amt;
    const lineSum = (order.products || []).reduce(
      (s, item) => s + (item?.productId?.price || 0) * (item?.quantity || 1),
      0
    );
    return sum + lineSum;
  }, 0);

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: IndianRupee,
      accent: "#34d399",
    },
    {
      label: "Total Orders",
      value: data.orders.length,
      icon: ClipboardList,
      accent: "#38bdf8",
    },
    {
      label: "Products",
      value: data.products.length,
      icon: Box,
      accent: "#a78bfa",
    },
    {
      label: "Customers",
      value: data.users.length,
      icon: Users,
      accent: "#f472b6",
    },
    {
      label: "Categories",
      value: data.categoriesCount,
      icon: Layers,
      accent: "#fbbf24",
    },
  ];

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="glass-surface" style={{ padding: "24px 28px" }}>
          <h1 className="display-heading gradient-text" style={{ fontSize: "1.9rem" }}>
            Admin Studio Overview
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
            Live store telemetry across products, categories, orders, and customers.
          </p>
        </div>

        {error && (
          <div className="glass-card" style={{ padding: 18, color: "#fecdd3" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="stats-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-skeleton" style={{ height: 110 }} />
            ))}
          </div>
        ) : (
          <>
            <div className="stats-grid">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="glass-card"
                    style={{ padding: "18px 20px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "var(--text-muted)",
                        fontSize: "0.84rem",
                      }}
                    >
                      <span>{s.label}</span>
                      <Icon size={18} color={s.accent} />
                    </div>
                    <div
                      className="display-heading tabular-nums"
                      style={{ fontSize: "1.65rem", fontWeight: 700, marginTop: 8 }}
                    >
                      {s.value}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Orders */}
            <div className="glass-surface" style={{ padding: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h2 className="display-heading" style={{ fontSize: "1.2rem" }}>
                  Recent Orders
                </h2>
                <Link
                  to="/dashboard/admin/orders"
                  className="glass-pill"
                  style={{ fontSize: "0.8rem" }}
                >
                  Manage All <ArrowRight size={14} />
                </Link>
              </div>

              {data.orders.length === 0 ? (
                <div style={{ color: "var(--text-muted)", padding: "16px 0" }}>
                  No orders yet.
                </div>
              ) : (
                <div className="glass-table-wrap">
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Buyer</th>
                        <th>Items</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.slice(0, 6).map((o) => (
                        <tr key={o._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              {o.buyer?.name || "Customer"}
                            </div>
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {o.buyer?.email}
                            </div>
                          </td>
                          <td>{(o.products || []).length} item(s)</td>
                          <td>{formatDate(o.createdAt)}</td>
                          <td>
                            <span
                              className={`glass-badge ${getStatusBadgeClass(
                                o.status
                              )}`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
