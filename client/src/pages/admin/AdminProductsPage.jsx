import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Upload, Search } from "lucide-react";
import {
  authApi,
  categoryApi,
  productApi,
  getErrorMessage,
} from "../../api/client";
import { fileToDataUrl, formatPrice } from "../../utils/format";
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
        loadAll();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete product"));
    }
  };

  const visibleProducts = products.filter((p) => {
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
            <h1 className="display-heading gradient-text" style={{ fontSize: "1.8rem" }}>
              Products Catalog
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: "6px 0 0" }}>
              Add new products, update inventory, or replace product photography.
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
          <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
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
              placeholder="Filter products..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="glass-skeleton" style={{ height: 260 }} />
          ) : visibleProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: 36, color: "var(--text-muted)" }}>
              No products found.
            </div>
          ) : (
            <div className="glass-table-wrap">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: 10,
                              overflow: "hidden",
                              background: "rgba(255,255,255,0.06)",
                              flexShrink: 0,
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
                        <div style={{ display: "inline-flex", gap: 8 }}>
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
              <h2 className="display-heading" style={{ fontSize: "1.35rem" }}>
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
                            border: "1px solid rgba(255,255,255,0.2)",
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
                            background: "#fb7185",
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
