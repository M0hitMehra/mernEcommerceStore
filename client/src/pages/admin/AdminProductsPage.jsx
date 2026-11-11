import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Search,
  Eye,
  ExternalLink,
  Truck,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  authApi,
  categoryApi,
  productApi,
  getErrorMessage,
} from "../../api/client";
import { fileToDataUrl, formatDateTime, formatPrice } from "../../utils/format";
import { AdminSidebar } from "../../components/DashboardSidebar";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  quantity: "",
  shipping: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const [detailProduct, setDetailProduct] = useState(null);
  const [detailImageIdx, setDetailImageIdx] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageDataUrls, setImageDataUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c._id] = c.name;
    });
    return map;
  }, [categories]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [overviewRes, catRes] = await Promise.all([
        authApi.getAdminOverview(),
        categoryApi.getAll(),
      ]);
      setProducts(overviewRes.data?.products || []);
      setCategories(catRes.data?.categories || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({
      ...EMPTY_FORM,
      category: categories[0]?._id || "",
    });
    setImageDataUrls([]);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category?._id || product.category || "",
      quantity: String(product.quantity ?? ""),
      shipping: Boolean(product.shipping),
    });
    setImageDataUrls([]);
    setModalOpen(true);
  };

  const openDetailModal = (product) => {
    setDetailProduct(product);
    setDetailImageIdx(0);
  };

  const handleImagePick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const urls = await Promise.all(files.map((f) => fileToDataUrl(f)));
      setImageDataUrls((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Could not process one or more selected images");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct && imageDataUrls.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", String(Number(form.price)));
      fd.append("category", form.category);
      fd.append("quantity", String(Number(form.quantity)));
      fd.append("shipping", String(Boolean(form.shipping)));

      if (imageDataUrls.length > 0) {
        imageDataUrls.forEach((url) => fd.append("images", url));
      }

      if (editingProduct) {
        const { data } = await productApi.update(editingProduct._id, fd);
        if (data?.success) {
          toast.success(data.message || "Product updated");
          setModalOpen(false);
          loadAll();
        }
      } else {
        const { data } = await productApi.create(fd);
        if (data?.success) {
          toast.success(data.message || "Product created");
          setModalOpen(false);
          loadAll();
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save product"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;
    try {
      const { data } = await productApi.remove(product._id);
      if (data?.success) {
        toast.success(data.message || "Product deleted");
        if (detailProduct?._id === product._id) setDetailProduct(null);
        loadAll();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete product"));
    }
  };

  const visibleProducts = products.filter((p) => {
    const catId = p.category?._id || p.category;
    if (filterCategory && catId !== filterCategory) return false;
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          className="glass-surface"
          style={{
            padding: "24px 28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div>
            <h1 className="display-heading" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              Products Catalog ({products.length})
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
              Add products, upload multi-photo galleries, inspect detailed specs, or update stock.
            </p>
          </div>
          <button
            type="button"
            className="glass-btn glass-btn-primary"
            onClick={openCreateModal}
          >
            <Plus size={16} /> New Product
          </button>
        </div>

        <div className="glass-surface" style={{ padding: 20 }}>
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 360 }}>
              <Search
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
                type="text"
                className="glass-input"
                style={{ paddingLeft: 38 }}
                placeholder="Search products..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                className={`glass-pill ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Table view"
              >
                <List size={15} /> Table
              </button>
              <button
                type="button"
                className={`glass-pill ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <LayoutGrid size={15} /> Cards
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              marginBottom: 18,
            }}
          >
            <button
              type="button"
              className={`glass-pill ${filterCategory === "" ? "active" : ""}`}
              onClick={() => setFilterCategory("")}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                className={`glass-pill ${
                  filterCategory === cat._id ? "active" : ""
                }`}
                onClick={() => setFilterCategory(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="glass-skeleton" style={{ height: 260 }} />
          ) : visibleProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: 36, color: "var(--text-muted)" }}>
              No products matched your filter.
            </div>
          ) : viewMode === "grid" ? (
            <div className="products-grid">
              {visibleProducts.map((p) => (
                <div
                  key={p._id}
                  className="glass-card"
                  style={{
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    onClick={() => openDetailModal(p)}
                    style={{
                      aspectRatio: "4 / 3",
                      background: "var(--media-bg)",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {p.images?.[0]?.url && (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                    <span
                      className="glass-badge"
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        background: "var(--glass-bg-elevated)",
                      }}
                    >
                      {(p.images || []).length} photo(s)
                    </span>
                  </div>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="tabular-nums" style={{ fontWeight: 700 }}>
                        {formatPrice(p.price)}
                      </span>
                      <span className={`glass-badge ${p.quantity > 0 ? "badge-emerald" : "badge-rose"}`}>
                        {p.quantity} in stock
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 6 }}>
                      <button
                        type="button"
                        className="glass-btn glass-btn-secondary glass-btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => openDetailModal(p)}
                      >
                        <Eye size={13} /> Details
                      </button>
                      <button
                        type="button"
                        className="glass-btn glass-btn-secondary glass-btn-sm"
                        onClick={() => openEditModal(p)}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="glass-btn glass-btn-danger glass-btn-sm"
                        onClick={() => handleDelete(p)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-table-wrap">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Images</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            cursor: "pointer",
                          }}
                          onClick={() => openDetailModal(p)}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              overflow: "hidden",
                              background: "var(--media-bg)",
                              flexShrink: 0,
                              border: "1px solid var(--glass-hairline)",
                            }}
                          >
                            {p.images?.[0]?.url ? (
                              <img
                                src={p.images[0].url}
                                alt={p.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : null}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div
                              style={{
                                fontSize: "0.76rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {p.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="glass-badge">
                          {p.category?.name || categoryMap[p.category] || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="glass-badge badge-cyan">
                          {(p.images || []).length} img
                        </span>
                      </td>
                      <td className="tabular-nums" style={{ fontWeight: 600 }}>
                        {formatPrice(p.price)}
                      </td>
                      <td>
                        <span
                          className={`glass-badge ${
                            p.quantity > 0 ? "badge-emerald" : "badge-rose"
                          }`}
                        >
                          {p.quantity}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            type="button"
                            className="glass-btn glass-btn-secondary glass-btn-sm"
                            onClick={() => openDetailModal(p)}
                            title="Detailed view"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            type="button"
                            className="glass-btn glass-btn-secondary glass-btn-sm"
                            onClick={() => openEditModal(p)}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className="glass-btn glass-btn-danger glass-btn-sm"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Product View Modal */}
      {detailProduct && (
        <div
          className="glass-modal-backdrop"
          onClick={() => setDetailProduct(null)}
        >
          <div
            className="glass-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 820,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 26,
              background: "var(--glass-dropdown-bg)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 className="display-heading" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                  {detailProduct.name}
                </h2>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  ID {detailProduct._id} • Slug: <code>{detailProduct.slug}</code>
                </div>
              </div>
              <button
                type="button"
                className="glass-pill"
                style={{ padding: 7 }}
                onClick={() => setDetailProduct(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 22,
              }}
            >
              {/* Multi-Image Gallery */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  className="glass-card"
                  style={{
                    aspectRatio: "4 / 3",
                    background: "var(--media-bg)",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    padding: 10,
                  }}
                >
                  {detailProduct.images?.[detailImageIdx]?.url ? (
                    <img
                      src={detailProduct.images[detailImageIdx].url}
                      alt={detailProduct.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: 10,
                      }}
                    />
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>No Image</span>
                  )}
                </div>

                {(detailProduct.images || []).length > 1 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {detailProduct.images.map((img, idx) => (
                      <button
                        key={img.public_id || idx}
                        type="button"
                        onClick={() => setDetailImageIdx(idx)}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 10,
                          padding: 3,
                          cursor: "pointer",
                          background: "var(--media-bg)",
                          border:
                            detailImageIdx === idx
                              ? "2px solid var(--accent)"
                              : "1px solid var(--glass-hairline)",
                        }}
                      >
                        <img
                          src={img.url}
                          alt=""
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

              {/* Specs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span className="glass-badge badge-cyan">
                    {detailProduct.category?.name ||
                      categoryMap[detailProduct.category] ||
                      "Uncategorized"}
                  </span>
                  <span
                    className={`glass-badge ${
                      detailProduct.quantity > 0 ? "badge-emerald" : "badge-rose"
                    }`}
                  >
                    Stock: {detailProduct.quantity}
                  </span>
                  {detailProduct.shipping && (
                    <span className="glass-badge badge-violet">
                      <Truck size={12} /> Shipping Enabled
                    </span>
                  )}
                </div>

                <div
                  className="display-heading tabular-nums"
                  style={{ fontSize: "1.75rem", fontWeight: 700 }}
                >
                  {formatPrice(detailProduct.price)}
                </div>

                <div
                  className="glass-card"
                  style={{ padding: 14, background: "var(--glass-bg-subtle)" }}
                >
                  <div
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    DESCRIPTION
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.55,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {detailProduct.description}
                  </div>
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Created: {formatDateTime(detailProduct.createdAt)}
                  <br />
                  Updated: {formatDateTime(detailProduct.updatedAt)}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto" }}>
                  <button
                    type="button"
                    className="glass-btn glass-btn-primary glass-btn-sm"
                    onClick={() => {
                      const target = detailProduct;
                      setDetailProduct(null);
                      openEditModal(target);
                    }}
                  >
                    <Pencil size={14} /> Edit Product
                  </button>
                  <Link
                    to={`/product/${detailProduct.slug}`}
                    className="glass-btn glass-btn-secondary glass-btn-sm"
                  >
                    <ExternalLink size={14} /> Open Store Page
                  </Link>
                  <button
                    type="button"
                    className="glass-btn glass-btn-danger glass-btn-sm"
                    onClick={() => handleDelete(detailProduct)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="glass-modal-backdrop"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="glass-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              background: "var(--glass-dropdown-bg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2 className="display-heading" style={{ fontSize: "1.35rem", fontWeight: 700 }}>
                {editingProduct ? "Edit Product" : "Create Product"}
              </h2>
              <button
                type="button"
                className="glass-pill"
                style={{ padding: 7 }}
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label className="glass-label">Product Name</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="glass-label">Description</label>
                <textarea
                  rows={3}
                  required
                  className="glass-textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label className="glass-label">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="glass-input"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="glass-label">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="glass-input"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="glass-label">Category</label>
                  <select
                    required
                    className="glass-select"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.shipping}
                  onChange={(e) =>
                    setForm({ ...form, shipping: e.target.checked })
                  }
                />
                Shipping Available
              </label>

              <div>
                <label className="glass-label">
                  Product Images{" "}
                  {editingProduct && "(leave empty to keep existing images)"}
                </label>

                {editingProduct &&
                  imageDataUrls.length === 0 &&
                  (editingProduct.images || []).length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          fontSize: "0.76rem",
                          color: "var(--text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        Current Gallery ({editingProduct.images.length}):
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {editingProduct.images.map((img, i) => (
                          <img
                            key={img.public_id || i}
                            src={img.url}
                            alt=""
                            style={{
                              width: 52,
                              height: 52,
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid var(--glass-hairline)",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                <label
                  className="glass-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: 16,
                    cursor: "pointer",
                    borderStyle: "dashed",
                  }}
                >
                  <Upload size={17} style={{ color: "var(--accent)" }} />
                  <span>Choose image(s)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImagePick}
                  />
                </label>

                {imageDataUrls.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    {imageDataUrls.map((src, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <img
                          src={src}
                          alt="preview"
                          style={{
                            width: 68,
                            height: 68,
                            objectFit: "cover",
                            borderRadius: 10,
                            border: "1px solid var(--glass-hairline)",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImageDataUrls((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: "none",
                            background: "var(--danger)",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  className="glass-btn glass-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-btn glass-btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
