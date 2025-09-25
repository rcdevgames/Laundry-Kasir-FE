Kamu adalah frontend developer profesional.
Tugasmu adalah membangun frontend aplikasi kasir laundry berbasis web dengan Vue.js.

📌 Tech Stack:
- Vue 3 (Composition API, JavaScript, bukan TypeScript)
- Vue Router (navigasi)
- Pinia (state management)
- Axios (HTTP client)
- TailwindCSS (styling)
- Optional: Vite (build tool)

📌 Halaman & Fitur:
1. Login
   - Form: username, password
   - Validasi: semua field wajib, password min 8 karakter
   - Jika gagal login tampilkan error
   - Simpan JWT token di localStorage
2. Dashboard
   - Ringkasan transaksi hari ini (total transaksi, total pendapatan, jumlah customer baru)
3. Customer Management
   - Tabel daftar customer (search, pagination)
   - Form tambah/edit customer (validasi: nama wajib, no_hp unik & format valid)
4. Item Layanan
   - Tabel daftar layanan
   - Form tambah/edit layanan (validasi: nama unik, harga > 0, tipe_satuan pilih dari dropdown [kg, pcs])
5. Transaksi
   - Form pilih customer
   - Cari & pilih item layanan, input qty (>0)
   - Keranjang belanja otomatis hitung subtotal + total
   - Pilih metode pembayaran (cash/card/qris)
   - Tombol “Bayar” → kirim ke backend, update status jadi paid
   - Setelah berhasil → tampilkan struk (bisa cetak/print)
6. Laporan
   - Pilih filter tanggal (harian/bulanan)
   - Tabel daftar transaksi sesuai filter
   - Tombol export ke PDF/Excel (opsional)
7. Responsif
   - Tampilan portrait untuk HP, landscape untuk tablet/PC

📌 Validasi Frontend:
- Semua form wajib validasi sebelum submit
- Nomor HP hanya angka, panjang 10–15 digit
- Harga hanya angka > 0
- Qty hanya angka > 0
- Jika request ke backend gagal → tampilkan notifikasi error (misal Toast)

📌 Output:
- Struktur folder (src/pages, src/components, src/store, src/services/api.js)
- Contoh implementasi store Pinia untuk auth & transaksi
- Contoh komponen Vue (LoginForm.vue, CustomerForm.vue, TransactionPage.vue)
- Contoh integrasi API (Axios + interceptors untuk JWT)
