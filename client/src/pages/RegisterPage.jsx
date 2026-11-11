import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const data = await register(form);
      if (data?.success) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "16px 0",
      }}
    >
      <div
        className="glass-surface"
        style={{ width: "100%", maxWidth: 480, padding: "34px 30px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div className="glass-badge badge-violet" style={{ marginBottom: 10 }}>
            <UserPlus size={13} /> New Account
          </div>
          <h1 className="display-heading gradient-text" style={{ fontSize: "1.9rem" }}>
            Create Your Account
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 6 }}>
            Join LuminaGlass to shop, save delivery details, and track orders.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label className="glass-label">Full Name</label>
            <input
              type="text"
              required
              className="glass-input"
              placeholder="Alex Mercer"
              value={form.name}
              onChange={onChange("name")}
            />
          </div>

          <div>
            <label className="glass-label">Email Address</label>
            <input
              type="email"
              required
              className="glass-input"
              placeholder="alex@example.com"
              value={form.email}
              onChange={onChange("email")}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <label className="glass-label">Password (min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                className="glass-input"
                placeholder="••••••"
                value={form.password}
                onChange={onChange("password")}
              />
            </div>
            <div>
              <label className="glass-label">Phone Number</label>
              <input
                type="tel"
                required
                className="glass-input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={onChange("phone")}
              />
            </div>
          </div>

          <div>
            <label className="glass-label">Delivery Address</label>
            <textarea
              rows={2}
              required
              className="glass-textarea"
              placeholder="Street, Apartment, City, Postal Code"
              value={form.address}
              onChange={onChange("address")}
            />
          </div>

          <button
            type="submit"
            className="glass-btn glass-btn-primary"
            disabled={submitting}
            style={{ marginTop: 6 }}
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
