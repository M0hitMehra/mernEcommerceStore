import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "0 16px 24px",
      }}
    >
      <div
        className="glass-surface container-wide"
        style={{
          padding: "24px 28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={18} color="#38bdf8" />
          <span className="display-heading" style={{ fontWeight: 700 }}>
            LuminaGlass Store
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            — Frosted Glass Commerce Experience
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
          }}
        >
          <Link to="/">Catalog</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/cart">Checkout</Link>
          <Link to="/dashboard/user/orders">Track Orders</Link>
        </div>
      </div>
    </footer>
  );
}
