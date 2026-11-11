import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        className="glass-surface"
        style={{ padding: "48px 36px", textAlign: "center", maxWidth: 460 }}
      >
        <div
          className="display-heading gradient-text"
          style={{ fontSize: "4rem", fontWeight: 800, lineHeight: 1 }}
        >
          404
        </div>
        <h1 className="display-heading" style={{ fontSize: "1.5rem", marginTop: 12 }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "10px 0 24px" }}>
          The frosted route you followed does not exist or has moved.
        </p>
        <Link to="/" className="glass-btn glass-btn-primary">
          <Home size={16} /> Return Home
        </Link>
      </div>
    </div>
  );
}
