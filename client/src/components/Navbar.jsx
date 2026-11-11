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
  Grid,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { categoryApi } from "../api/client";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount, setDrawerOpen } = useCart();
  const { isDark, toggleTheme } = useTheme();
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
          gap: "14px",
          padding: "10px 18px",
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
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--accent)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(0, 113, 227, 0.28)",
            }}
          >
            M
          </div>
          <span
            className="display-heading"
            style={{ fontSize: "1.08rem", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Mohit Store
          </span>
        </Link>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="nav-search-desktop"
          style={{
            flex: 1,
            maxWidth: 400,
            position: "relative",
          }}
        >
          <Search
            size={15}
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
            placeholder="Search Mohit Store..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              paddingLeft: 38,
              paddingRight: 76,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 999,
              fontSize: "0.86rem",
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
              padding: "5px 13px",
              fontSize: "0.78rem",
            }}
          >
            Search
          </button>
        </form>

        {/* Desktop Actions */}
        <nav
          className="nav-links-desktop"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `glass-pill ${isActive ? "active" : ""}`
            }
          >
            Store
          </NavLink>

          {/* Categories Dropdown */}
          <div ref={catRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={`glass-pill ${catMenuOpen ? "active" : ""}`}
              onClick={() => setCatMenuOpen((v) => !v)}
            >
              <Grid size={14} />
              Categories
              <ChevronDown size={13} />
            </button>
            {catMenuOpen && (
              <div
                className="glass-dropdown"
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 236,
                  padding: 8,
                  zIndex: 60,
                }}
              >
                <Link
                  to="/categories"
                  onClick={() => setCatMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "9px 12px",
                    borderRadius: 12,
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  All Categories
                </Link>
                <div className="hairline-divider" style={{ margin: "4px 0" }} />
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
                          e.currentTarget.style.background = "var(--pill-bg)";
                          e.currentTarget.style.color = "var(--text-primary)";
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

          {/* Theme Toggle */}
          <button
            type="button"
            className="glass-pill"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{ padding: "8px 11px" }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Cart Trigger */}
          <button
            type="button"
            className="glass-pill"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open shopping bag"
          >
            <ShoppingBag size={15} />
            <span>Bag</span>
            {totalCount > 0 && (
              <span
                style={{
                  minWidth: 19,
                  height: 19,
                  borderRadius: 999,
                  padding: "0 6px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  background: "var(--accent)",
                  color: "#fff",
                }}
              >
                {totalCount}
              </span>
            )}
          </button>

          {/* Auth Controls */}
          {!isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link
                to="/login"
                className="glass-btn glass-btn-secondary glass-btn-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="glass-btn glass-btn-primary glass-btn-sm"
              >
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
                <User size={14} />
                <span
                  style={{
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown size={13} />
              </button>
              {userMenuOpen && (
                <div
                  className="glass-dropdown"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: 230,
                    padding: 8,
                    zIndex: 60,
                  }}
                >
                  <div style={{ padding: "8px 12px" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
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
                  <div className="hairline-divider" style={{ margin: "6px 0" }} />
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
                        color: "var(--accent)",
                        fontWeight: 600,
                      }}
                    >
                      <ShieldCheck size={15} /> Admin Studio
                    </Link>
                  )}
                  <div className="hairline-divider" style={{ margin: "6px 0" }} />
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
                      color: "var(--danger)",
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

        {/* Mobile Triggers */}
        <div
          className="nav-mobile-triggers"
          style={{ display: "none", alignItems: "center", gap: 6 }}
        >
          <button
            type="button"
            className="glass-pill"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{ padding: 8 }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            className="glass-pill"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open bag"
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
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            padding: "12px 18px 18px",
            borderTop: "1px solid var(--glass-hairline)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              className="glass-input"
              placeholder="Search Mohit Store..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="glass-btn glass-btn-primary glass-btn-sm">
              Go
            </button>
          </form>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link to="/" className="glass-pill" onClick={() => setMobileOpen(false)}>
              Store
            </Link>
            <Link
              to="/categories"
              className="glass-pill"
              onClick={() => setMobileOpen(false)}
            >
              Categories
            </Link>
            <Link to="/cart" className="glass-pill" onClick={() => setMobileOpen(false)}>
              Bag ({totalCount})
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
                  Sign Out
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
                  Join
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
