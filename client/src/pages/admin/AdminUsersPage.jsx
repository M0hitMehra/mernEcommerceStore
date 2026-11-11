import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users } from "lucide-react";
import { authApi, getErrorMessage } from "../../api/client";
import { AdminSidebar } from "../../components/DashboardSidebar";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .getAdminOverview()
      .then(({ data }) => {
        setUsers(data?.users || []);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Failed to load users"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="glass-surface" style={{ padding: "24px 28px" }}>
          <div className="glass-badge badge-violet" style={{ marginBottom: 8 }}>
            <Users size={13} /> Directory
          </div>
          <h1 className="display-heading gradient-text" style={{ fontSize: "1.8rem" }}>
            Registered Customers
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
            {users.length} account(s) registered in the store.
          </p>
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
                    <th>Address</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td style={{ maxWidth: 260 }}>{u.address}</td>
                      <td>
                        <span
                          className={`glass-badge ${
                            u.role === 1 ? "badge-violet" : "badge-cyan"
                          }`}
                        >
                          {u.role === 1 ? "Admin" : "Customer"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
