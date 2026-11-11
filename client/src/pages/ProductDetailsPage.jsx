import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { productApi, getErrorMessage } from "../api/client";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import ProductCard from "../components/ProductCard";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      setSelectedImage(0);
      setQty(1);
      setLightboxOpen(false);
      setZoomed(false);

      try {
        const { data } = await productApi.getSingle(slug);
        if (!active) return;
        const prod = data?.product;
        setProduct(prod || null);

        let recs = [];
        if (prod?._id && prod?.category?._id) {
          try {
            const { data: rel } = await productApi.getRelated(
              prod.category._id,
              prod._id
            );
            recs = rel?.relatedProducts || [];
          } catch {
            recs = [];
          }
        }

        // Fallback to general catalog recommendations if same category has no other items
        if (recs.length === 0 && prod?._id) {
          try {
            const { data: listRes } = await productApi.list({
              keyword: "",
              page: 1,
            });
            recs = (listRes?.products || [])
              .filter((item) => item._id !== prod._id)
              .slice(0, 4);
          } catch {
            recs = [];
          }
        }

        if (active) setRecommended(recs);
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Unable to load product"));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  const images = product?.images || [];

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setZoomed(false);
      } else if (e.key === "ArrowRight" && images.length > 1) {
        setZoomed(false);
        setSelectedImage((i) => (i + 1) % images.length);
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        setZoomed(false);
        setSelectedImage((i) => (i - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, images.length]);

  if (loading) {
    return (
      <div className="glass-skeleton" style={{ height: 480, borderRadius: 26 }} />
    );
  }

  if (error || !product) {
    return (
      <div className="glass-surface" style={{ padding: 48, textAlign: "center" }}>
        <h2 className="display-heading">Product not found</h2>
        <p style={{ color: "var(--text-muted)", margin: "10px 0 20px" }}>
          {error || "This product may have been removed."}
        </p>
        <Link to="/" className="glass-btn glass-btn-primary">
          Back to Store
        </Link>
      </div>
    );
  }

  const mainImg = images[selectedImage]?.url || images[0]?.url;
  const inStock = Number(product.quantity ?? 0) > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div>
        <Link to="/" className="glass-pill" style={{ marginBottom: 18 }}>
          <ArrowLeft size={14} /> Back to Mohit Store
        </Link>

        <div
          className="glass-surface"
          style={{
            padding: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: 36,
            alignItems: "start",
          }}
        >
          {/* Clickable Gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => mainImg && setLightboxOpen(true)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && mainImg) {
                  e.preventDefault();
                  setLightboxOpen(true);
                }
              }}
              className="glass-card"
              style={{
                position: "relative",
                aspectRatio: "4 / 3",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                background: "var(--media-bg)",
                cursor: mainImg ? "zoom-in" : "default",
                padding: 12,
              }}
              title={mainImg ? "Click to view full photo" : undefined}
            >
              {mainImg ? (
                <>
                  <img
                    src={mainImg}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: 12,
                      transition: "transform 0.3s ease",
                    }}
                  />
                  <span
                    className="glass-pill"
                    style={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      padding: "6px 12px",
                      fontSize: "0.76rem",
                      background: "var(--glass-bg-elevated)",
                      boxShadow: "var(--glass-shadow-sm)",
                    }}
                  >
                    <ZoomIn size={13} /> Click to view
                  </span>
                </>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>No Image</span>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {images.map((img, idx) => (
                  <button
                    key={img.public_id || idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      overflow: "hidden",
                      padding: 4,
                      cursor: "pointer",
                      border:
                        selectedImage === idx
                          ? "2px solid var(--accent)"
                          : "1px solid var(--glass-hairline)",
                      background: "var(--media-bg)",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: 8,
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Specifications & Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {product.category?.name && (
                <Link
                  to={`/category/${product.category.slug}`}
                  className="glass-badge badge-cyan"
                >
                  {product.category.name}
                </Link>
              )}
              <span
                className={`glass-badge ${
                  inStock ? "badge-emerald" : "badge-rose"
                }`}
              >
                {inStock ? (
                  <>
                    <CheckCircle2 size={13} /> In Stock ({product.quantity})
                  </>
                ) : (
                  <>
                    <XCircle size={13} /> Out of Stock
                  </>
                )}
              </span>
              {product.shipping && (
                <span className="glass-badge badge-violet">
                  <Truck size={13} /> Shipping Available
                </span>
              )}
            </div>

            <h1
              className="display-heading"
              style={{
                fontSize: "clamp(1.65rem, 3vw, 2.35rem)",
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h1>

            <div
              className="display-heading tabular-nums"
              style={{ fontSize: "2rem", fontWeight: 700 }}
            >
              {formatPrice(product.price)}
            </div>

            <div
              className="glass-card"
              style={{ padding: "16px 18px", background: "var(--glass-bg-subtle)" }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                Specifications & Overview
              </div>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                  fontSize: "0.95rem",
                  whiteSpace: "pre-line",
                }}
              >
                {product.description}
              </p>
            </div>

            {inStock && (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="glass-label" style={{ margin: 0 }}>
                  Quantity
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    className="glass-pill"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="tabular-nums"
                    style={{
                      minWidth: 32,
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    className="glass-pill"
                    disabled={qty >= product.quantity}
                    onClick={() =>
                      setQty((q) => Math.min(product.quantity, q + 1))
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
              <button
                type="button"
                className="glass-btn glass-btn-primary"
                disabled={!inStock}
                onClick={() => addItem(product, qty)}
              >
                <ShoppingBag size={17} />
                Add to Bag
              </button>
              <button
                type="button"
                className="glass-btn glass-btn-secondary"
                disabled={!inStock}
                onClick={() => {
                  addItem(product, qty);
                  navigate("/cart");
                }}
              >
                <Zap size={17} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={19} style={{ color: "var(--accent)" }} />
            <h2 className="display-heading" style={{ fontSize: "1.45rem", fontWeight: 700 }}>
              Recommended Products
            </h2>
          </div>
          {product.category?.slug && (
            <Link
              to={`/category/${product.category.slug}`}
              className="glass-pill"
              style={{ fontSize: "0.82rem" }}
            >
              More in {product.category.name}
            </Link>
          )}
        </div>

        {recommended.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: 24, color: "var(--text-muted)", textAlign: "center" }}
          >
            Explore more items on the{" "}
            <Link to="/" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Mohit Store home page
            </Link>
            .
          </div>
        ) : (
          <div className="recommended-grid">
            {recommended.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
      </section>

      {/* Photo Lightbox Modal */}
      {lightboxOpen && mainImg && (
        <div
          className="glass-modal-backdrop"
          onClick={() => {
            setLightboxOpen(false);
            setZoomed(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Product photo viewer"
        >
          <div
            className="glass-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 960,
              maxHeight: "92vh",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "var(--glass-dropdown-bg)",
            }}
          >
            {/* Lightbox Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {product.name}{" "}
                {images.length > 1 && (
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    ({selectedImage + 1} / {images.length})
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  className="glass-pill"
                  onClick={() => setZoomed((z) => !z)}
                >
                  {zoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
                  {zoomed ? "Reset Zoom" : "Zoom In"}
                </button>
                <button
                  type="button"
                  className="glass-pill"
                  style={{ padding: 8 }}
                  onClick={() => {
                    setLightboxOpen(false);
                    setZoomed(false);
                  }}
                  aria-label="Close photo viewer"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Lightbox Main Image */}
            <div
              style={{
                position: "relative",
                flex: 1,
                minHeight: 340,
                maxHeight: "66vh",
                borderRadius: 18,
                background: "var(--media-bg)",
                overflow: zoomed ? "auto" : "hidden",
                display: "grid",
                placeItems: "center",
                padding: 12,
              }}
            >
              <img
                src={mainImg}
                alt={product.name}
                onClick={() => setZoomed((z) => !z)}
                style={{
                  maxWidth: zoomed ? "none" : "100%",
                  maxHeight: zoomed ? "none" : "62vh",
                  width: zoomed ? "155%" : "auto",
                  objectFit: "contain",
                  cursor: zoomed ? "zoom-out" : "zoom-in",
                  borderRadius: 12,
                  transition: "width 0.25s ease",
                }}
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="glass-pill"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      padding: 10,
                      background: "var(--glass-bg-elevated)",
                      boxShadow: "var(--glass-shadow-sm)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomed(false);
                      setSelectedImage(
                        (i) => (i - 1 + images.length) % images.length
                      );
                    }}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className="glass-pill"
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      padding: 10,
                      background: "var(--glass-bg-elevated)",
                      boxShadow: "var(--glass-shadow-sm)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomed(false);
                      setSelectedImage((i) => (i + 1) % images.length);
                    }}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnails */}
            {images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {images.map((img, idx) => (
                  <button
                    key={img.public_id || idx}
                    type="button"
                    onClick={() => {
                      setZoomed(false);
                      setSelectedImage(idx);
                    }}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 10,
                      padding: 3,
                      cursor: "pointer",
                      background: "var(--media-bg)",
                      border:
                        selectedImage === idx
                          ? "2px solid var(--accent)"
                          : "1px solid var(--glass-hairline)",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} thumb ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: 6,
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
