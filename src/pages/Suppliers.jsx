import { useEffect, useState } from 'react';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../api/suppliers';
import { extractErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const EMPTY_FORM = { name: '', phone: '', address: '' };

export default function Suppliers() {
  const { isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadSuppliers() {
    setLoading(true);
    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
      setError('');
    } catch (err) {
      setError('Gagal memuat data pemasok.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  function openCreateModal() {
    setEditingSupplier(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(supplier) {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address || '',
    });
    setFormError('');
    setModalOpen(true);
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, form);
      } else {
        await createSupplier(form);
      }
      setModalOpen(false);
      await loadSuppliers();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Gagal menyimpan pemasok.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(supplier) {
    if (!window.confirm(`Hapus pemasok "${supplier.name}"?`)) return;
    setDeletingId(supplier.id);
    try {
      await deleteSupplier(supplier.id);
      await loadSuppliers();
    } catch (err) {
      alert(extractErrorMessage(err, 'Gagal menghapus pemasok.'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Mitra</div>
          <h1>Pemasok</h1>
          <p>Kelola kontak pemasok yang memasok produk ke gudang.</p>
        </div>
        <button type="button" className="btn btn-amber" onClick={openCreateModal}>
          + Tambah Pemasok
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <div className="loading-block">Memuat pemasok…</div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada pemasok</h3>
            <p>Tambahkan pemasok pertama untuk mulai mencatat asal produk.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Telepon</th>
                <th>Alamat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr key={sup.id}>
                  <td className="cell-strong">{sup.name}</td>
                  <td className="cell-mono">{sup.phone}</td>
                  <td>{sup.address || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(sup)}
                      >
                        Ubah
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(sup)}
                          disabled={deletingId === sup.id}
                        >
                          {deletingId === sup.id ? 'Menghapus…' : 'Hapus'}
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
          title={editingSupplier ? 'Ubah Pemasok' : 'Tambah Pemasok'}
          onClose={() => setModalOpen(false)}
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="supplierName">Nama Pemasok</label>
              <input
                id="supplierName"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="mis. CV Sumber Makmur"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="supplierPhone">Nomor Telepon</label>
              <input
                id="supplierPhone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="mis. 08123456789"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="supplierAddress">Alamat (opsional)</label>
              <textarea
                id="supplierAddress"
                rows={3}
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Alamat lengkap pemasok"
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
