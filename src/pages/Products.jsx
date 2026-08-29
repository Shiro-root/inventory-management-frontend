import { useEffect, useState } from 'react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/products';
import { fetchCategories } from '../api/categories';
import { fetchSuppliers } from '../api/suppliers';
import { extractErrorMessage, API_BASE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Tag from '../components/Tag';

const LOW_STOCK_THRESHOLD = 10;

const EMPTY_FORM = { name: '', sku: '', price: '', stock: '', categoryId: '', supplierId: '' };

function formatRupiah(value) {
  return `Rp${Number(value).toLocaleString('id-ID')}`;
}

export default function Products() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSuppliers(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setError('');
    } catch (err) {
      setError('Gagal memuat data produk.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreateModal() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: String(product.categoryId),
      supplierId: product.supplierId ? String(product.supplierId) : '',
    });
    setImageFile(null);
    setFormError('');
    setModalOpen(true);
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!editingProduct && !imageFile) {
      setFormError('Gambar produk wajib diunggah.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, imageFile };
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setModalOpen(false);
      await loadAll();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Gagal menyimpan produk.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) return;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      await loadAll();
    } catch (err) {
      alert(extractErrorMessage(err, 'Gagal menghapus produk.'));
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProducts = products.filter((p) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Katalog</div>
          <h1>Produk</h1>
          <p>Kelola daftar produk, harga, stok, dan gambar.</p>
        </div>
        <button type="button" className="btn btn-amber" onClick={openCreateModal}>
          + Tambah Produk
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="field" style={{ maxWidth: 320, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Cari nama atau SKU produk…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading-block">Memuat produk…</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>Tidak ada produk</h3>
            <p>Coba kata kunci lain atau tambahkan produk baru.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>SKU</th>
                <th>Kategori</th>
                <th>Pemasok</th>
                <th>Harga</th>
                <th>Stok</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className={p.stock < LOW_STOCK_THRESHOLD ? 'row-flagged' : ''}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={`${API_BASE_URL}${p.image}`}
                        alt={p.name}
                        className="product-thumb"
                      />
                      <span className="cell-strong">{p.name}</span>
                    </div>
                  </td>
                  <td className="cell-mono">{p.sku}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>{p.supplier?.name || '—'}</td>
                  <td className="cell-mono">{formatRupiah(p.price)}</td>
                  <td>
                    <Tag tone={p.stock < LOW_STOCK_THRESHOLD ? 'low' : 'ok'}>
                      {p.stock} unit
                    </Tag>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(p)}
                      >
                        Ubah
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? 'Menghapus…' : 'Hapus'}
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
          title={editingProduct ? 'Ubah Produk' : 'Tambah Produk'}
          onClose={() => setModalOpen(false)}
          width={560}
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="productName">Nama Produk</label>
              <input
                id="productName"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="mis. Mouse Wireless"
                required
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="productSku">SKU</label>
                <input
                  id="productSku"
                  type="text"
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  placeholder="mis. MWL-001"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="productPrice">Harga (Rp)</label>
                <input
                  id="productPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="mis. 150000"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="productStock">Stok Awal</label>
                <input
                  id="productStock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => updateField('stock', e.target.value)}
                  placeholder="mis. 50"
                  required
                />
                {editingProduct && (
                  <div className="field-hint">
                    Gunakan halaman Pergerakan Stok untuk mencatat mutasi stok masuk/keluar.
                  </div>
                )}
              </div>
              <div className="field">
                <label htmlFor="productCategory">Kategori</label>
                <select
                  id="productCategory"
                  value={form.categoryId}
                  onChange={(e) => updateField('categoryId', e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Pilih kategori
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="productSupplier">Pemasok (opsional)</label>
              <select
                id="productSupplier"
                value={form.supplierId}
                onChange={(e) => updateField('supplierId', e.target.value)}
              >
                <option value="">Tidak ada</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="productImage">
                Gambar Produk {editingProduct ? '(kosongkan jika tidak diubah)' : ''}
              </label>
              <input
                id="productImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
              />
              <div className="field-hint">Format JPG, PNG, atau WEBP. Maksimal 2MB.</div>
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
