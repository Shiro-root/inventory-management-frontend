import { useEffect, useMemo, useState } from 'react';
import { fetchStockMovements, createStockMovement } from '../api/stockMovements';
import { fetchProducts } from '../api/products';
import { extractErrorMessage } from '../api/axios';
import Modal from '../components/Modal';
import Tag from '../components/Tag';

const EMPTY_FORM = { productId: '', type: 'IN', quantity: '', note: '' };

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [products]);

  async function loadAll() {
    setLoading(true);
    try {
      const [movementsData, productsData] = await Promise.all([
        fetchStockMovements(),
        fetchProducts(),
      ]);
      setMovements(
        [...movementsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
      setProducts(productsData);
      setError('');
    } catch (err) {
      setError('Gagal memuat riwayat pergerakan stok.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreateModal() {
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedProduct = productMap[Number(form.productId)];

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!form.productId || !form.quantity) {
      setFormError('Produk dan jumlah wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      await createStockMovement({
        productId: Number(form.productId),
        type: form.type,
        quantity: Number(form.quantity),
        note: form.note || undefined,
      });
      setModalOpen(false);
      await loadAll();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Gagal mencatat pergerakan stok.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Ledger</div>
          <h1>Pergerakan Stok</h1>
          <p>Catat setiap barang masuk dan keluar agar jumlah stok selalu akurat.</p>
        </div>
        <button type="button" className="btn btn-amber" onClick={openCreateModal}>
          + Catat Pergerakan
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <div className="loading-block">Memuat riwayat…</div>
        ) : movements.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada riwayat</h3>
            <p>Catatan barang masuk dan keluar akan muncul di sini.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Produk</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="cell-mono">
                    {new Date(m.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="cell-strong">
                    {productMap[m.productId]?.name || `Produk #${m.productId}`}
                  </td>
                  <td>
                    <Tag tone={m.type === 'IN' ? 'in' : 'out'}>{m.type}</Tag>
                  </td>
                  <td className="cell-mono">{m.quantity} unit</td>
                  <td>{m.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal title="Catat Pergerakan Stok" onClose={() => setModalOpen(false)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="movementProduct">Produk</label>
              <select
                id="movementProduct"
                value={form.productId}
                onChange={(e) => updateField('productId', e.target.value)}
                required
              >
                <option value="" disabled>
                  Pilih produk
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — stok saat ini: {p.stock}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <div className="field-hint">Stok saat ini: {selectedProduct.stock} unit</div>
              )}
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="movementType">Tipe</label>
                <select
                  id="movementType"
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value)}
                >
                  <option value="IN">Masuk (IN)</option>
                  <option value="OUT">Keluar (OUT)</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="movementQuantity">Jumlah</label>
                <input
                  id="movementQuantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => updateField('quantity', e.target.value)}
                  placeholder="mis. 10"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="movementNote">Catatan (opsional)</label>
              <textarea
                id="movementNote"
                rows={2}
                value={form.note}
                onChange={(e) => updateField('note', e.target.value)}
                placeholder="mis. Retur dari pelanggan"
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
