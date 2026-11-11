import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GlassLoader() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        className="glass-surface"
        style={{
          padding: "24px 36px",
          textAlign: "center",
          fontWeight: 600,
          color: "var(--text-secondary)",
        }}
      >
        Verifying frosted session...
      </div>
    </div>
  );
}

export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <GlassLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <GlassLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard/user" replace />;
  }
  return <Outlet />;
}
