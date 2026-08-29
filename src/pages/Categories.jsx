import { useEffect, useState } from 'react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categories';
import { extractErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Categories() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      setError('Gagal memuat data kategori.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateModal() {
    setEditingCategory(null);
    setName('');
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setName(category.name);
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, name);
      } else {
        await createCategory(name);
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Gagal menyimpan kategori.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;
    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      await loadCategories();
    } catch (err) {
      alert(extractErrorMessage(err, 'Gagal menghapus kategori.'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Katalog</div>
          <h1>Kategori Produk</h1>
          <p>Kelompokkan produk agar lebih mudah dicari dan dilaporkan.</p>
        </div>
        <button type="button" className="btn btn-amber" onClick={openCreateModal}>
          + Tambah Kategori
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <div className="loading-block">Memuat kategori…</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada kategori</h3>
            <p>Tambahkan kategori pertama untuk mulai mengelompokkan produk.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th>Dibuat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="cell-strong">{cat.name}</td>
                  <td className="cell-mono">
                    {new Date(cat.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(cat)}
                      >
                        Ubah
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat.id}
                        >
                          {deletingId === cat.id ? 'Menghapus…' : 'Hapus'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editingCategory ? 'Ubah Kategori' : 'Tambah Kategori'}
          onClose={() => setModalOpen(false)}
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="categoryName">Nama Kategori</label>
              <input
                id="categoryName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Elektronik"
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
