import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Check, ExternalLink } from "lucide-react";
import { authApi, categoryApi, getErrorMessage } from "../../api/client";
import { AdminSidebar } from "../../components/DashboardSidebar";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const loadCategories = async () => {
    try {
      const [catRes, overviewRes] = await Promise.all([
        categoryApi.getAll(),
        authApi.getAdminOverview(),
      ]);
      setCategories(catRes.data?.categories || []);
      setProducts(overviewRes.data?.products || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const countsByCategory = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cid = p.category?._id || p.category;
      if (cid) map[cid] = (map[cid] || 0) + 1;
    });
    return map;
  }, [products]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await categoryApi.create(newName.trim());
      if (data?.success) {
        toast.success(data.message || "Category created");
        setNewName("");
        loadCategories();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create category"));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return;
    try {
      const { data } = await categoryApi.update(id, editingName.trim());
      if (data?.success) {
        toast.success(data.message || "Category updated");
        setEditingId(null);
        setEditingName("");
        loadCategories();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update category"));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const { data } = await categoryApi.remove(id);
      if (data?.success) {
        toast.success(data.message || "Category deleted");
        loadCategories();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete category"));
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="glass-surface" style={{ padding: "24px 28px" }}>
          <h1 className="display-heading" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            Manage Categories ({categories.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "6px 0 18px" }}>
            Create, rename, or remove Mohit Store collections.
          </p>

          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
          >
            <input
              type="text"
              required
              className="glass-input"
              style={{ flex: 1, minWidth: 220 }}
              placeholder="New category name (e.g. Audio & Wearables)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="submit"
              className="glass-btn glass-btn-primary"
              disabled={creating}
            >
              <Plus size={16} />
              {creating ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        <div className="glass-surface" style={{ padding: 20 }}>
          {loading ? (
            <div className="glass-skeleton" style={{ height: 220 }} />
          ) : categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
              No categories found. Add your first category above.
            </div>
          ) : (
            <div className="glass-table-wrap">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Products</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td>
                        {editingId === cat._id ? (
                          <input
                            type="text"
                            className="glass-input"
                            style={{ padding: "7px 10px" }}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                        ) : (
                          <strong>{cat.name}</strong>
                        )}
                      </td>
                      <td>
                        <code style={{ color: "var(--text-muted)" }}>{cat.slug}</code>
                      </td>
                      <td>
                        <span className="glass-badge badge-cyan">
                          {countsByCategory[cat._id] || 0} item(s)
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            gap: 8,
                            justifyContent: "flex-end",
                          }}
                        >
                          {editingId === cat._id ? (
                            <>
                              <button
                                type="button"
                                className="glass-btn glass-btn-primary glass-btn-sm"
                                onClick={() => handleUpdate(cat._id)}
                              >
                                <Check size={14} /> Save
                              </button>
                              <button
                                type="button"
                                className="glass-btn glass-btn-secondary glass-btn-sm"
                                onClick={() => setEditingId(null)}
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <Link
                                to={`/category/${cat.slug}`}
                                className="glass-btn glass-btn-secondary glass-btn-sm"
                                title="View in Storefront"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <button
                                type="button"
                                className="glass-btn glass-btn-secondary glass-btn-sm"
                                onClick={() => {
                                  setEditingId(cat._id);
                                  setEditingName(cat.name);
                                }}
                              >
                                <Pencil size={14} /> Edit
                              </button>
                              <button
                                type="button"
                                className="glass-btn glass-btn-danger glass-btn-sm"
                                onClick={() => handleDelete(cat._id, cat.name)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
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
    </div>
  );
}
