import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    typeof location.state?.from === "string"
      ? location.state.from
      : location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login({ email, password });
      if (data?.success) {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid credentials"));
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
        style={{ width: "100%", maxWidth: 430, padding: "34px 30px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="glass-badge badge-cyan" style={{ marginBottom: 12 }}>
            <LogIn size={13} /> Mohit Store ID
          </div>
          <h1 className="display-heading" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            Sign in to Mohit Store
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 6 }}>
            Access your orders, address, and fast checkout.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <label className="glass-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
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
                type="email"
                required
                className="glass-input"
                style={{ paddingLeft: 38 }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label className="glass-label">Password</label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.78rem",
                  color: "var(--accent)",
                  marginBottom: 6,
                }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock
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
                type="password"
                required
                className="glass-input"
                style={{ paddingLeft: 38 }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="glass-btn glass-btn-primary"
            disabled={submitting}
            style={{ marginTop: 6 }}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: 22,
            textAlign: "center",
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
          }}
        >
          New here?{" "}
          <Link to="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
