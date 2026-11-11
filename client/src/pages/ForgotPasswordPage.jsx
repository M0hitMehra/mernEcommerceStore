import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound, ArrowLeft } from "lucide-react";
import { authApi, getErrorMessage } from "../api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSentMessage("");
    try {
      const { data } = await authApi.forgetPassword(email);
      if (data?.success) {
        setSentMessage(data.message);
        toast.success(data.message || "Reset email sent");
      } else {
        toast.error(data?.message || "Could not send reset link");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to request password reset"));
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
        <Link to="/login" className="glass-pill" style={{ marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div className="glass-badge badge-amber" style={{ marginBottom: 10 }}>
          <KeyRound size={13} /> Password Recovery
        </div>
        <h1 className="display-heading gradient-text" style={{ fontSize: "1.75rem" }}>
          Reset Your Password
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "6px 0 20px" }}>
          Enter your account email and we will send you a password reset link.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label className="glass-label">Registered Email</label>
            <input
              type="email"
              required
              className="glass-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="glass-btn glass-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        {sentMessage && (
          <div
            className="glass-card"
            style={{
              marginTop: 18,
              padding: 14,
              borderColor: "rgba(52,211,153,0.45)",
              color: "#a7f3d0",
              fontSize: "0.88rem",
            }}
          >
            {sentMessage}
          </div>
        )}
      </div>
    </div>
  );
}
