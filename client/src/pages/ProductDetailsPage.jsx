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
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      setSelectedImage(0);
      setQty(1);
      try {
        const { data } = await productApi.getSingle(slug);
        if (!active) return;
        const prod = data?.product;
        setProduct(prod || null);

        if (prod?._id && prod?.category?._id) {
          const { data: rel } = await productApi.getRelated(
            prod.category._id,
            prod._id
          );
          if (active) setRelated(rel?.relatedProducts || []);
        } else {
          setRelated([]);
        }
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

  if (loading) {
    return (
      <div className="glass-skeleton" style={{ height: 480, borderRadius: 24 }} />
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
          Back to Catalog
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const mainImg = images[selectedImage]?.url || images[0]?.url;
  const inStock = Number(product.quantity ?? 0) > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div>
        <Link to="/" className="glass-pill" style={{ marginBottom: 18 }}>
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div
          className="glass-surface"
          style={{
            padding: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* Gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className="glass-card"
              style={{
                aspectRatio: "4 / 3",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                background: "rgba(15, 23, 42, 0.55)",
              }}
            >
              {mainImg ? (
                <img
                  src={mainImg}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
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
                      borderRadius: 12,
                      overflow: "hidden",
                      padding: 0,
                      cursor: "pointer",
                      border:
                        selectedImage === idx
                          ? "2px solid var(--accent-cyan)"
                          : "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
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
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.3rem)", fontWeight: 800 }}
            >
              {product.name}
            </h1>

            <div
              className="display-heading tabular-nums gradient-text"
              style={{ fontSize: "2.1rem", fontWeight: 800 }}
            >
              {formatPrice(product.price)}
            </div>

            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                fontSize: "0.98rem",
                whiteSpace: "pre-line",
              }}
            >
              {product.description}
            </p>

            {/* Quantity & Actions */}
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

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
              <button
                type="button"
                className="glass-btn glass-btn-primary"
                disabled={!inStock}
                onClick={() => addItem(product, qty)}
              >
                <ShoppingBag size={17} />
                Add to Cart
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

      {/* Related Products */}
      {related.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 className="display-heading" style={{ fontSize: "1.45rem" }}>
            Similar Products You Might Like
          </h2>
          <div className="products-grid">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
