import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  ClipboardList,
  IndianRupee,
  Layers,
  Users,
  ArrowRight,
  AlertTriangle,
  Eye,
  X,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { authApi, categoryApi, getErrorMessage } from "../../api/client";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  getStatusBadgeClass,
  ORDER_STATUSES,
} from "../../utils/format";
import { AdminSidebar } from "../../components/DashboardSidebar";

export default function AdminOverviewPage() {
  const [data, setData] = useState({
    users: [],
    products: [],
    orders: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    Promise.all([authApi.getAdminOverview(), categoryApi.getAll()])
      .then(([overviewRes, catRes]) => {
        setData({
          users: overviewRes.data?.users || [],
          products: overviewRes.data?.products || [],
          orders: overviewRes.data?.orders || [],
          categories: catRes.data?.categories || [],
        });
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Failed to load admin overview"));
      })
      .finally(() => setLoading(false));
  }, []);

  const analytics = useMemo(() => {
    const getOrderTotal = (order) => {
      const amt = Number(order?.payment?.transaction?.amount || 0);
      if (amt > 0) return amt;
      return (order.products || []).reduce(
        (s, item) => s + (item?.productId?.price || 0) * (item?.quantity || 1),
        0
      );
    };

    const totalRevenue = data.orders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    const paidOrders = data.orders.filter((o) => o?.payment?.success).length;
    const totalUnits = data.products.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0
    );
    const lowStockProducts = data.products.filter(
      (p) => Number(p.quantity || 0) <= 15
    );

    const statusCounts = ORDER_STATUSES.map((st) => ({
      status: st,
      count: data.orders.filter((o) => o.status === st).length,
    }));

    const catBreakdown = data.categories.map((cat) => {
      const matching = data.products.filter(
        (p) => (p.category?._id || p.category) === cat._id
      );
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        count: matching.length,
        units: matching.reduce((s, p) => s + Number(p.quantity || 0), 0),
      };
    });

    const maxCatCount = Math.max(1, ...catBreakdown.map((c) => c.count));

    return {
      totalRevenue,
      paidOrders,
      totalUnits,
      lowStockProducts,
      statusCounts,
      catBreakdown,
      maxCatCount,
      getOrderTotal,
    };
  }, [data]);

  const stats = [
    {
      label: "Order Volume",
      value: formatPrice(analytics.totalRevenue),
      sub: `${analytics.paidOrders} paid of ${data.orders.length} orders`,
      icon: IndianRupee,
      color: "var(--success)",
    },
    {
      label: "Orders",
      value: data.orders.length,
      sub: `${data.orders.filter((o) => o.status === "Delivered").length} delivered`,
      icon: ClipboardList,
      color: "var(--accent)",
    },
    {
      label: "Products",
      value: data.products.length,
      sub: `${analytics.totalUnits} total units in stock`,
      icon: Box,
      color: "var(--violet)",
    },
    {
      label: "Low Stock Alerts",
      value: analytics.lowStockProducts.length,
      sub: "Items with ≤ 15 units",
      icon: AlertTriangle,
      color: "var(--warning)",
    },
    {
      label: "Customers",
      value: data.users.length,
      sub: `${data.users.filter((u) => u.role === 1).length} admin(s)`,
      icon: Users,
      color: "var(--accent)",
    },
    {
      label: "Categories",
      value: data.categories.length,
      sub: `${analytics.catBreakdown.filter((c) => c.count > 0).length} active`,
      icon: Layers,
      color: "var(--success)",
    },
  ];

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          className="glass-surface"
          style={{
            padding: "24px 28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div>
            <h1 className="display-heading" style={{ fontSize: "1.9rem", fontWeight: 700 }}>
              Admin Studio Overview
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
              Live telemetry across Mohit Store products, categories, orders, and customers.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link
              to="/dashboard/admin/products"
              className="glass-btn glass-btn-primary glass-btn-sm"
            >
              Manage Products
            </Link>
            <Link
              to="/dashboard/admin/categories"
              className="glass-btn glass-btn-secondary glass-btn-sm"
            >
              Manage Categories
            </Link>
          </div>
        </div>

        {error && (
          <div className="glass-card" style={{ padding: 18, color: "var(--danger)" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="stats-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-skeleton" style={{ height: 112 }} />
            ))}
          </div>
        ) : (
          <>
            {/* KPI Grid */}
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
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      <span>{s.label}</span>
                      <Icon size={17} style={{ color: s.color }} />
                    </div>
                    <div
                      className="display-heading tabular-nums"
                      style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: 8 }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        color: "var(--text-muted)",
                        marginTop: 4,
                      }}
                    >
                      {s.sub}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Analytics Split */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 20,
              }}
            >
              {/* Category Breakdown */}
              <div className="glass-surface" style={{ padding: 22 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h2 className="display-heading" style={{ fontSize: "1.12rem", fontWeight: 700 }}>
                    Catalog by Category
                  </h2>
                  <Link
                    to="/dashboard/admin/categories"
                    className="glass-pill"
                    style={{ fontSize: "0.76rem", padding: "5px 10px" }}
                  >
                    Edit <ArrowRight size={12} />
                  </Link>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {analytics.catBreakdown.map((cat) => (
                    <div key={cat._id}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.86rem",
                          marginBottom: 5,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {cat.count} item(s) • {cat.units} units
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          borderRadius: 999,
                          background: "var(--pill-bg)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 999,
                            width: `${Math.max(
                              cat.count > 0 ? 8 : 0,
                              (cat.count / analytics.maxCatCount) * 100
                            )}%`,
                            background: "var(--accent)",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Funnel + Low Stock */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="glass-surface" style={{ padding: 22 }}>
                  <h2
                    className="display-heading"
                    style={{ fontSize: "1.12rem", fontWeight: 700, marginBottom: 14 }}
                  >
                    Order Fulfillment Status
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {analytics.statusCounts.map((s) => (
                      <div
                        key={s.status}
                        className="glass-card"
                        style={{
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flex: "1 1 130px",
                        }}
                      >
                        <span
                          className={`glass-badge ${getStatusBadgeClass(s.status)}`}
                        >
                          {s.status}
                        </span>
                        <strong className="tabular-nums" style={{ marginLeft: "auto" }}>
                          {s.count}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-surface" style={{ padding: 22 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h2
                      className="display-heading"
                      style={{ fontSize: "1.12rem", fontWeight: 700 }}
                    >
                      Low Stock Products
                    </h2>
                    <Link
                      to="/dashboard/admin/products"
                      className="glass-pill"
                      style={{ fontSize: "0.76rem", padding: "5px 10px" }}
                    >
                      Inventory <ArrowRight size={12} />
                    </Link>
                  </div>
                  {analytics.lowStockProducts.length === 0 ? (
                    <div style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                      All products have healthy inventory (&gt; 15 units).
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {analytics.lowStockProducts.slice(0, 5).map((p) => (
                        <div
                          key={p._id}
                          className="glass-card"
                          style={{
                            padding: "10px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {p.images?.[0]?.url && (
                              <img
                                src={p.images[0].url}
                                alt={p.name}
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 8,
                                  objectFit: "cover",
                                }}
                              />
                            )}
                            <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                              {p.name}
                            </span>
                          </div>
                          <span
                            className={`glass-badge ${
                              p.quantity === 0 ? "badge-rose" : "badge-amber"
                            }`}
                          >
                            {p.quantity} left
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders with Detailed View */}
            <div className="glass-surface" style={{ padding: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h2 className="display-heading" style={{ fontSize: "1.18rem", fontWeight: 700 }}>
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
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Details</th>
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
                          <td className="tabular-nums" style={{ fontWeight: 600 }}>
                            {formatPrice(analytics.getOrderTotal(o))}
                          </td>
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
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="glass-btn glass-btn-secondary glass-btn-sm"
                              onClick={() => setSelectedOrder(o)}
                            >
                              <Eye size={14} /> View
                            </button>
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

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div
          className="glass-modal-backdrop"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="glass-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 620,
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
                <h2 className="display-heading" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  Order Detailed View
                </h2>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  ID {selectedOrder._id} • {formatDateTime(selectedOrder.createdAt)}
                </div>
              </div>
              <button
                type="button"
                className="glass-pill"
                style={{ padding: 7 }}
                onClick={() => setSelectedOrder(null)}
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
                <MapPin size={14} /> Buyer & Shipping Info
              </div>
              <div style={{ fontWeight: 600 }}>{selectedOrder.buyer?.name}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {selectedOrder.buyer?.email} • {selectedOrder.buyer?.phone}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
                {selectedOrder.buyer?.address}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span
                className={`glass-badge ${
                  selectedOrder?.payment?.success
                    ? "badge-emerald"
                    : "badge-amber"
                }`}
              >
                {selectedOrder?.payment?.success ? (
                  <>
                    <CheckCircle2 size={12} /> Payment Succeeded
                  </>
                ) : (
                  <>
                    <Clock size={12} />{" "}
                    {selectedOrder?.payment?.message || "Payment Unconfirmed"}
                  </>
                )}
              </span>
              <span
                className={`glass-badge ${getStatusBadgeClass(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status}
              </span>
              <span className="glass-badge badge-cyan tabular-nums">
                {formatPrice(analytics.getOrderTotal(selectedOrder))}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(selectedOrder.products || []).map((line, i) => (
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
                        width: 52,
                        height: 52,
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
          </div>
        </div>
      )}
    </div>
  );
}
