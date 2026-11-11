import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { authApi, getErrorMessage } from "../api/client";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await authApi.resetPassword(token, password);
      if (data?.success) {
        toast.success(data.message || "Password updated successfully!");
        navigate("/login");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Reset link expired or invalid"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "65vh",
        display: "grid",
        placeItems: "center",
        padding: "16px 0",
      }}
    >
      <div
        className="glass-surface"
        style={{ width: "100%", maxWidth: 440, padding: "34px 30px" }}
      >
        <div className="glass-badge badge-emerald" style={{ marginBottom: 10 }}>
          <ShieldCheck size={13} /> Set New Password
        </div>
        <h1 className="display-heading gradient-text" style={{ fontSize: "1.75rem" }}>
          Choose a New Password
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "6px 0 20px" }}>
          Enter your new password below to regain access to your account.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label className="glass-label">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="glass-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="glass-label">Confirm Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="glass-input"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="glass-btn glass-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Updating Password..." : "Update Password"}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: "center", fontSize: "0.86rem" }}>
          <Link to="/login" style={{ color: "var(--accent-cyan)" }}>
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
