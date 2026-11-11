import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  ShieldCheck,
  Package,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Grid,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { categoryApi } from "../api/client";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const catRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    let active = true;
    categoryApi
      .getAll()
      .then(({ data }) => {
        if (active && data?.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    setMobileOpen(false);
    navigate(q ? `/search?keyword=${encodeURIComponent(q)}` : "/");
  };

  return (
    <header className="glass-nav">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "12px 20px",
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, rgba(56,189,248,0.85), rgba(168,85,247,0.85))",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 6px 20px rgba(56, 189, 248, 0.35)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <Sparkles size={19} color="#fff" />
          </div>
          <div>
            <div
              className="display-heading"
              style={{ fontSize: "1.12rem", fontWeight: 700, lineHeight: 1.1 }}
            >
              Lumina<span style={{ color: "var(--accent-cyan)" }}>Glass</span>
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Curated Commerce
            </div>
          </div>
        </Link>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="nav-search-desktop"
          style={{
            flex: 1,
            maxWidth: 420,
            position: "relative",
          }}
        >
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="glass-input"
            placeholder="Search products or price (e.g. 999)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              paddingLeft: 40,
              paddingRight: 80,
              paddingTop: 9,
              paddingBottom: 9,
              borderRadius: 999,
              fontSize: "0.88rem",
            }}
          />
          <button
            type="submit"
            className="glass-btn glass-btn-primary glass-btn-sm"
            style={{
              position: "absolute",
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
              borderRadius: 999,
              padding: "6px 14px",
            }}
          >
            Search
          </button>
        </form>

        {/* Desktop Actions */}
        <nav
          className="nav-links-desktop"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `glass-pill ${isActive ? "active" : ""}`
            }
          >
            Shop
          </NavLink>

          {/* Categories Dropdown */}
          <div ref={catRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={`glass-pill ${catMenuOpen ? "active" : ""}`}
              onClick={() => setCatMenuOpen((v) => !v)}
            >
              <Grid size={15} />
              Categories
              <ChevronDown size={14} />
            </button>
            {catMenuOpen && (
              <div
                className="glass-surface"
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 240,
                  padding: 8,
                  zIndex: 60,
                  background: "rgba(12, 18, 34, 0.92)",
                }}
              >
                <Link
                  to="/categories"
                  onClick={() => setCatMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "9px 12px",
                    borderRadius: 10,
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: "var(--accent-cyan)",
                  }}
                >
                  All Categories
                </Link>
                <div
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                    margin: "4px 0",
                  }}
                />
                {categories.length === 0 ? (
                  <div
                    style={{
                      padding: "10px 12px",
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    No categories found
                  </div>
                ) : (
                  <div style={{ maxHeight: 280, overflowY: "auto" }}>
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setCatMenuOpen(false)}
                        style={{
                          display: "block",
                          padding: "8px 12px",
                          borderRadius: 10,
                          fontSize: "0.86rem",
                          color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            type="button"
            className="glass-pill"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open shopping cart"
          >
            <ShoppingBag size={16} />
            <span>Cart</span>
            {totalCount > 0 && (
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 999,
                  padding: "0 6px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  color: "#fff",
                }}
              >
                {totalCount}
              </span>
            )}
          </button>

          {/* Auth Controls */}
          {!isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link to="/login" className="glass-btn glass-btn-secondary glass-btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="glass-btn glass-btn-primary glass-btn-sm">
                Join
              </Link>
            </div>
          ) : (
            <div ref={userRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="glass-pill active"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <User size={15} />
                <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div
                  className="glass-surface"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: 230,
                    padding: 8,
                    zIndex: 60,
                    background: "rgba(12, 18, 34, 0.94)",
                  }}
                >
                  <div style={{ padding: "8px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {user?.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.email}
                    </div>
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: "rgba(255,255,255,0.08)",
                      margin: "6px 0",
                    }}
                  />
                  <Link
                    to="/dashboard/user"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 12px",
                      borderRadius: 10,
                      fontSize: "0.86rem",
                    }}
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <Link
                    to="/dashboard/user/orders"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 12px",
                      borderRadius: 10,
                      fontSize: "0.86rem",
                    }}
                  >
                    <Package size={15} /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/dashboard/admin"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "9px 12px",
                        borderRadius: 10,
                        fontSize: "0.86rem",
                        color: "var(--accent-cyan)",
                        fontWeight: 600,
                      }}
                    >
                      <ShieldCheck size={15} /> Admin Studio
                    </Link>
                  )}
                  <div
                    style={{
                      height: 1,
                      background: "rgba(255,255,255,0.08)",
                      margin: "6px 0",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate("/");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 12px",
                      borderRadius: 10,
                      fontSize: "0.86rem",
                      color: "#fda4af",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Buttons */}
        <div
          className="nav-mobile-triggers"
          style={{ display: "none", alignItems: "center", gap: 8 }}
        >
          <button
            type="button"
            className="glass-pill"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag size={16} />
            {totalCount > 0 && <span>{totalCount}</span>}
          </button>
          <button
            type="button"
            className="glass-pill"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Content */}
      {mobileOpen && (
        <div
          style={{
            padding: "12px 20px 20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              className="glass-input"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="glass-btn glass-btn-primary">
              Go
            </button>
          </form>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link
              to="/"
              className="glass-pill"
              onClick={() => setMobileOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/categories"
              className="glass-pill"
              onClick={() => setMobileOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/cart"
              className="glass-pill"
              onClick={() => setMobileOpen(false)}
            >
              Cart ({totalCount})
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard/user"
                  className="glass-pill"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/dashboard/user/orders"
                  className="glass-pill"
                  onClick={() => setMobileOpen(false)}
                >
                  Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/dashboard/admin"
                    className="glass-pill active"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Studio
                  </Link>
                )}
                <button
                  type="button"
                  className="glass-pill"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="glass-pill"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="glass-pill active"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 920px) {
          .nav-search-desktop,
          .nav-links-desktop {
            display: none !important;
          }
          .nav-mobile-triggers {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
