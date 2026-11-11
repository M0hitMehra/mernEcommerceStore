import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, Shield, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../api/client";
import { UserSidebar } from "../../components/DashboardSidebar";

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        password: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: user?.email || form.email,
        phone: form.phone,
        address: form.address,
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }
      await updateProfile(payload);
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <UserSidebar />

      <div className="glass-surface" style={{ padding: 28 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div>
            <div className="glass-badge badge-cyan" style={{ marginBottom: 8 }}>
              <User size={13} /> Account Settings
            </div>
            <h1 className="display-heading gradient-text" style={{ fontSize: "1.8rem" }}>
              Your Profile
            </h1>
          </div>
          <span
            className={`glass-badge ${
              user?.role === 1 ? "badge-violet" : "badge-emerald"
            }`}
          >
            <Shield size={13} />
            {user?.role === 1 ? "Administrator" : "Verified Customer"}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <label className="glass-label">Full Name</label>
            <input
              type="text"
              required
              className="glass-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="glass-label">Email Address (Account ID)</label>
            <input
              type="email"
              disabled
              className="glass-input"
              style={{ opacity: 0.65, cursor: "not-allowed" }}
              value={form.email}
            />
          </div>

          <div>
            <label className="glass-label">Phone Number</label>
            <input
              type="tel"
              required
              className="glass-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="glass-label">New Password (optional)</label>
            <input
              type="password"
              className="glass-input"
              placeholder="Leave blank to keep current"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="glass-label">Delivery Address</label>
            <textarea
              rows={3}
              required
              className="glass-textarea"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="glass-btn glass-btn-primary"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
