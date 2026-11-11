import { NavLink } from "react-router-dom";
import {
  User,
  Package,
  LayoutDashboard,
  FolderKanban,
  Box,
  ClipboardList,
  Users,
} from "lucide-react";

export function UserSidebar() {
  const links = [
    { to: "/dashboard/user", label: "Profile & Address", icon: User, end: true },
    { to: "/dashboard/user/orders", label: "Order History", icon: Package },
  ];

  return (
    <aside className="glass-surface" style={{ padding: 14 }}>
      <div
        style={{
          padding: "8px 12px 12px",
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
        }}
      >
        Customer Portal
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `glass-pill ${isActive ? "active" : ""}`
              }
              style={{
                borderRadius: 14,
                padding: "11px 14px",
                justifyContent: "flex-start",
              }}
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export function AdminSidebar() {
  const links = [
    {
      to: "/dashboard/admin",
      label: "Overview",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/dashboard/admin/categories",
      label: "Categories",
      icon: FolderKanban,
    },
    { to: "/dashboard/admin/products", label: "Products", icon: Box },
    { to: "/dashboard/admin/orders", label: "Orders", icon: ClipboardList },
    { to: "/dashboard/admin/users", label: "Customers", icon: Users },
  ];

  return (
    <aside className="glass-surface" style={{ padding: 14 }}>
      <div
        style={{
          padding: "8px 12px 12px",
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--accent-cyan)",
        }}
      >
        Admin Studio
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `glass-pill ${isActive ? "active" : ""}`
              }
              style={{
                borderRadius: 14,
                padding: "11px 14px",
                justifyContent: "flex-start",
              }}
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
