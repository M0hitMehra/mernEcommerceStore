import { Link } from "react-router-dom";

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
          padding: "20px 26px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "var(--accent)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            M
          </span>
          <span className="display-heading" style={{ fontWeight: 700 }}>
            Mohit Store
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>
            — Curated Commerce
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            fontSize: "0.86rem",
            color: "var(--text-secondary)",
          }}
        >
          <Link to="/">Store</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/cart">Bag</Link>
          <Link to="/dashboard/user/orders">Orders</Link>
        </div>
      </div>
    </footer>
  );
}
