import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';
import { fetchSuppliers } from '../api/suppliers';
import Tag from '../components/Tag';
import { API_BASE_URL } from '../api/axios';

const LOW_STOCK_THRESHOLD = 10;

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categoryCount, setCategoryCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [productsData, categoriesData, suppliersData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchSuppliers(),
        ]);
        setProducts(productsData);
        setCategoryCount(categoriesData.length);
        setSupplierCount(suppliersData.length);
      } catch (err) {
        setError('Gagal memuat data ringkasan.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockProducts = products
    .filter((p) => p.stock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);

  if (loading) return <div className="loading-block">Memuat ringkasan gudang…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Ringkasan</div>
          <h1>Kondisi gudang hari ini</h1>
          <p>Pantauan cepat jumlah produk, kategori, pemasok, dan stok menipis.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card" style={{ '--accent': 'var(--amber)' }}>
          <div className="stat-label">Total Produk</div>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--teal)' }}>
          <div className="stat-label">Kategori</div>
          <div className="stat-value">{categoryCount}</div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--ink)' }}>
          <div className="stat-label">Pemasok</div>
          <div className="stat-value">{supplierCount}</div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--rust)' }}>
          <div className="stat-label">Nilai Stok Total</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            Rp{totalStockValue.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <div className="section-heading">
        <h2>Produk dengan stok menipis (&lt; {LOW_STOCK_THRESHOLD})</h2>
        <Link to="/produk" className="btn btn-outline btn-sm">
          Lihat semua produk
        </Link>
      </div>

      <div className="table-wrap">
        {lowStockProducts.length === 0 ? (
          <div className="empty-state">
            <h3>Semua stok aman</h3>
            <p>Tidak ada produk di bawah ambang batas stok minimum saat ini.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>SKU</th>
                <th>Kategori</th>
                <th>Stok</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p.id} className="row-flagged">
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
                  <td>
                    <Tag tone="low">{p.stock} unit</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
