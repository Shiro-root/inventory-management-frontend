# Inventory Management — Frontend

Frontend React (Vite) untuk backend [inventory-management-backend](https://github.com/Shiro-root/inventory-management-backend).

## Fitur

- Login & registrasi (JWT, disimpan di `localStorage`)
- Dashboard ringkasan: total produk, kategori, pemasok, nilai stok, dan daftar stok menipis
- CRUD Produk (dengan unggah gambar), Kategori, dan Pemasok
- Pencatatan Pergerakan Stok (barang masuk/keluar) beserta riwayatnya
- Kontrol akses berbasis peran: tombol **Hapus** hanya tampil untuk role `ADMIN` (mengikuti aturan `verifyRole` di backend)
- Otomatis logout & redirect ke halaman login saat token kedaluwarsa (401)

## Menjalankan proyek

```bash
npm install
cp .env.example .env   # sesuaikan VITE_API_BASE_URL jika backend tidak di localhost:3000
npm run dev
```

Aplikasi berjalan di `http://localhost:5173` secara default.

## ⚠️ Penting: aktifkan CORS di backend

Backend saat ini (`server.js`) belum memasang middleware `cors`, sehingga permintaan dari frontend (port 5173) ke backend (port 3000) akan diblokir browser. Tambahkan ini di backend:

```bash
npm install cors
```

```js
// server.js
import cors from 'cors';
// ...
app.use(cors({ origin: 'http://localhost:5173' }));
```

Pasang `app.use(cors(...))` sebelum route-route lain didaftarkan.

## Struktur

```
src/
  api/            # semua pemanggilan Axios ke backend, satu file per resource
  context/        # AuthContext (login, logout, penyimpanan token)
  components/     # Layout (sidebar), Modal, Tag, ProtectedRoute
  pages/          # Login, Register, Dashboard, Products, Categories, Suppliers, StockMovements
```

## Catatan tentang kontrak API

- `GET /api/products`, `/api/categories`, `/api/suppliers`, `/api/stock-movements` mengembalikan array langsung.
- Endpoint `POST`/`PUT` sebagian besar membungkus hasil dalam `{ message, data }`, kecuali `POST /api/categories` yang mengembalikan objek kategori langsung.
- `GET /api/stock-movements` tidak menyertakan relasi produk, sehingga frontend menggabungkannya secara manual dengan data dari `GET /api/products`.
- Gambar produk diakses melalui `${VITE_API_BASE_URL}${product.image}` karena backend menyajikannya secara statis di `/assets`.
- Ambang batas "stok menipis" saat ini di-hardcode ke `< 10` unit di sisi frontend (`Dashboard.jsx` dan `Products.jsx`) karena backend belum menyediakan pengaturan ini.

## Build produksi

```bash
npm run build
```

Hasil build ada di folder `dist/`.
