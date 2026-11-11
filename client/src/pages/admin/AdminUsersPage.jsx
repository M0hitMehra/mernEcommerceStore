import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, Search, Eye, X, Mail, Phone, MapPin } from "lucide-react";
import { authApi, getErrorMessage } from "../../api/client";
import { formatDate, formatPrice, getStatusBadgeClass } from "../../utils/format";
import { AdminSidebar } from "../../components/DashboardSidebar";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    authApi
      .getAdminOverview()
      .then(({ data }) => {
        setUsers(data?.users || []);
        setOrders(data?.orders || []);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load users"));
      })
      .finally(() => setLoading(false));
  }, []);

  const getUserOrders = (userId) =>
    orders.filter((o) => (o.buyer?._id || o.buyer) === userId);

  const visibleUsers = users.filter((u) => {
    if (roleFilter === "admin" && u.role !== 1) return false;
    if (roleFilter === "customer" && u.role === 1) return false;
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="glass-surface" style={{ padding: "24px 28px" }}>
          <div className="glass-badge badge-violet" style={{ marginBottom: 8 }}>
            <Users size={13} /> Directory
          </div>
          <h1 className="display-heading" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            Registered Accounts ({users.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "6px 0 16px" }}>
            Inspect customer profiles, contact details, and order activity.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
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
                placeholder="Search name, email, or phone..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 7 }}>
              <button
                type="button"
                className={`glass-pill ${roleFilter === "all" ? "active" : ""}`}
                onClick={() => setRoleFilter("all")}
              >
                All ({users.length})
              </button>
              <button
                type="button"
                className={`glass-pill ${roleFilter === "admin" ? "active" : ""}`}
                onClick={() => setRoleFilter("admin")}
              >
                Admins ({users.filter((u) => u.role === 1).length})
              </button>
              <button
                type="button"
                className={`glass-pill ${roleFilter === "customer" ? "active" : ""}`}
                onClick={() => setRoleFilter("customer")}
              >
                Customers ({users.filter((u) => u.role !== 1).length})
              </button>
            </div>
          </div>
        </div>

        <div className="glass-surface" style={{ padding: 20 }}>
          {loading ? (
            <div className="glass-skeleton" style={{ height: 220 }} />
          ) : (
            <div className="glass-table-wrap">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((u) => {
                    const userOrders = getUserOrders(u._id);
                    return (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>
                          <span className="glass-badge">
                            {userOrders.length} order(s)
                          </span>
                        </td>
                        <td>
                          <span
                            className={`glass-badge ${
                              u.role === 1 ? "badge-violet" : "badge-cyan"
                            }`}
                          >
                            {u.role === 1 ? "Admin" : "Customer"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="glass-btn glass-btn-secondary glass-btn-sm"
                            onClick={() => setSelectedUser(u)}
                          >
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detailed View Modal */}
      {selectedUser && (
        <div
          className="glass-modal-backdrop"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="glass-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 580,
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
                  {selectedUser.name}
                </h2>
                <span
                  className={`glass-badge ${
                    selectedUser.role === 1 ? "badge-violet" : "badge-cyan"
                  }`}
                  style={{ marginTop: 6 }}
                >
                  {selectedUser.role === 1 ? "Administrator" : "Customer"}
                </span>
              </div>
              <button
                type="button"
                className="glass-pill"
                style={{ padding: 7 }}
                onClick={() => setSelectedUser(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="glass-card"
              style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
                <Mail size={15} style={{ color: "var(--accent)" }} />
                {selectedUser.email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
                <Phone size={15} style={{ color: "var(--accent)" }} />
                {selectedUser.phone}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
                <MapPin size={15} style={{ color: "var(--accent)" }} />
                {selectedUser.address}
              </div>
            </div>

            <div>
              <h3 className="display-heading" style={{ fontSize: "1.05rem", marginBottom: 10 }}>
                Order History ({getUserOrders(selectedUser._id).length})
              </h3>
              {getUserOrders(selectedUser._id).length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                  This user has not placed any orders yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {getUserOrders(selectedUser._id).map((o) => {
                    const total =
                      Number(o?.payment?.transaction?.amount || 0) ||
                      (o.products || []).reduce(
                        (s, i) => s + (i?.productId?.price || 0) * (i?.quantity || 1),
                        0
                      );
                    return (
                      <div
                        key={o._id}
                        className="glass-card"
                        style={{
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                            {(o.products || []).length} item(s) • {formatDate(o.createdAt)}
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                            ID {o._id.slice(-8)}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className={`glass-badge ${getStatusBadgeClass(o.status)}`}>
                            {o.status}
                          </span>
                          <strong className="tabular-nums">{formatPrice(total)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
