# CONTEXT.md — MATCHA

Ringkasan konteks aplikasi dari laporan IF350 Final Project (Kelompok 6, Semester Ganjil 2026/2027) dan prototipe HTML 14 layar. Dipakai sebagai referensi agar desain, prompt, dan kode konsisten.

## 1. Ringkasan Proyek
- **Nama**: MATCHA — Aplikasi Pemesanan dan Pengiriman Matcha untuk Toko Open PO.
- **Mata kuliah**: IF350 Final Project. Dosen: Eunike Endariahna Surbakti.
- **Masalah**: toko matcha berjualan dengan sistem open PO lewat WhatsApp. Data pesanan tersebar di tiga tempat: chat WhatsApp, catatan rekap manual, dan mutasi rekening. Akibatnya pesanan tercecer, rekap salah hitung, status bayar sulit dipantau, dan ongkir dihitung manual.
- **Solusi**: satu aplikasi untuk pesanan, pembayaran, dan pengiriman. Pembeli memilih varian dan jumlah, membayar dengan QRIS statis milik toko, lalu mengunggah bukti bayar untuk diverifikasi admin. Penjual mendapat rekap otomatis, mengatur open PO dan kuota, serta mengelola pengiriman.
- **Pengguna**: Pembeli, dan Penjual/Admin Toko.

## 2. Aturan Bisnis Kunci
| Aturan | Nilai |
|---|---|
| Batas antar sendiri | sampai **2 km** (nilai tepat 2,0 km masih antar sendiri) |
| Tarif antar sendiri | **Rp5.000** flat |
| Tarif jasa kirim | **Rp3.000 per km**, jarak dibulatkan |
| Radius layanan | maksimal **15 km**; lebih dari itu ditolak |
| Metode kirim | **ditentukan sistem** dari jarak, pembeli tidak memilih |
| Batas waktu bayar | **24 jam** sejak pesanan dibuat; lewat itu pesanan kedaluwarsa dan kuota dikembalikan |
| Konfirmasi admin | paling lama **12 jam** pada jam operasional (NFR-06) |
| Bukti bayar | JPG, PNG, atau PDF, maksimal **2 MB** |
| Password | minimal 8 karakter, disimpan sebagai hash |
| Login gagal | 5 kali salah, akun dikunci sementara |
| Nomor resi | wajib diisi untuk jasa kirim sebelum status selesai |
| Open PO | punya tanggal mulai/tutup, kuota (contoh 50 cup), sisa kuota; pesanan ditolak bila tutup atau melebihi sisa kuota |
| Kuota | dikunci saat pesanan dibuat, dikembalikan saat kedaluwarsa |
| Bukti ditolak | pembeli bisa unggah ulang selama masih dalam batas 24 jam |

Contoh data: harga Rp25.000–Rp38.000 per cup; alamat 1,5 km (Rp5.000, diantar penjual) dan 7 km (Rp21.000, jasa kirim).

## 3. Functional Requirements
| ID | Requirement |
|---|---|
| FR-01 | Registrasi akun pembeli (nama, email, no HP, password) |
| FR-02 | Login dan pemulihan password |
| FR-03 | Katalog: nama, harga, gambar, sisa stok, status open PO |
| FR-04 | Pilih varian, isi jumlah, kelola keranjang |
| FR-05 | Validasi stok dan sisa kuota saat checkout |
| FR-06 | Ringkasan: subtotal, ongkir, total bayar |
| FR-07 | Pembayaran QRIS statis: QR, nominal, batas waktu, unggah bukti |
| FR-08 | Penentuan metode kirim dari jarak, batas 2 km |
| FR-09 | Hitung ongkir sesuai metode |
| FR-10 | Riwayat pesanan dan notifikasi tiap perubahan status |
| FR-11 | Penjual buka/tutup open PO beserta kuota dan tanggal |
| FR-12 | Rekap pesanan dan ekspor CSV/PDF |
| FR-13 | Konfirmasi pembayaran manual (terima/tolak dengan alasan) |
| FR-14 | Status pengiriman dan nomor resi |

## 4. Non-Functional Requirements
| ID | Ukuran |
|---|---|
| NFR-01 | Katalog tampil penuh ≤ 3 detik di 4G |
| NFR-02 | Rekap cocok 100% dengan data transaksi |
| NFR-03 | Password tersimpan sebagai hash |
| NFR-04 | Bukti bayar hanya bisa diakses pemilik pesanan dan admin |
| NFR-05 | Mengikuti UU No. 27 Tahun 2022 (PDP) |
| NFR-06 | Bukti bayar dikonfirmasi ≤ 12 jam pada jam operasional |
| NFR-07 | Katalog sampai layar pembayaran maksimal 5 layar |

## 5. Batas Lingkup
- **In scope**: alur pembeli (registrasi sampai pesanan diterima), alur penjual (buka open PO sampai tutup pengiriman), verifikasi pembayaran manual berbasis QRIS statis.
- **Out of scope**: payment gateway otomatis dan rekonsiliasi mutasi bank, API resmi jasa kirim (resi diisi manual), manajemen stok bahan baku/produksi, akuntansi dan pajak.
- Alasan tanpa payment gateway: toko mitra belum berbadan usaha.
- Fitur "ambil sendiri di toko" diminta pemilik toko di Sprint Review 4, dinilai 8 story point, **ditunda ke luar rilis pertama**.

## 6. Alur Utama
**Pembeli**: Registrasi → Login → Katalog → Detail produk → Keranjang → Pengiriman (alamat, jarak, metode otomatis) → Pembayaran QRIS → Unggah bukti → Riwayat (Menunggu → Lunas/Ditolak → Dikirim → Diterima).

**Penjual**: Login admin → Dashboard → Kelola open PO → Konfirmasi pembayaran → Kelola pengiriman → Rekap dan ekspor.

**Keputusan di alur**:
1. Open PO buka dan stok cukup? Tidak: pesanan ditolak dengan alasan.
2. Alamat dalam area layanan? Tidak: minta perbaiki alamat (tanpa batas percobaan karena pesanan belum terbentuk).
3. Jarak ≤ 2 km? Ya: antar penjual; tidak: jasa kirim + ongkir.
4. Unggah dalam 24 jam? Tidak: kedaluwarsa, kuota kembali.
5. Nominal bukti sesuai? Tidak: ditolak, pembeli unggah ulang.

**Status pesanan**: Menunggu pembayaran, Menunggu konfirmasi, Lunas, Ditolak, Kedaluwarsa, Diproses, Dikirim, Diterima.

## 7. Model Data (ERD)
- **User** (user_id, nama, email unik, no_hp, password_hash, peran: pembeli/admin)
- **Produk** (produk_id, nama, harga, stok, gambar_url)
- **OpenPO** (openpo_id, tanggal_mulai, tanggal_tutup, kuota, sisa_kuota, status buka/tutup)
- **Pesanan** (pesanan_id, user_id, openpo_id, waktu_pesan, total_bayar, status_pesanan)
- **DetailPesanan** (detail_id, pesanan_id, produk_id, jumlah, harga_satuan, subtotal)
- **Pembayaran** (pembayaran_id, pesanan_id, bukti_url, nominal, status_bayar, waktu_unggah, dikonfirmasi_oleh)
- **Pengiriman** (pengiriman_id, pesanan_id, alamat, jarak_km, metode_kirim, biaya_kirim, nomor_resi, status_kirim)

Keputusan model: `harga_satuan` disalin ke DetailPesanan (harga bisa berubah antar periode); `jarak_km` disimpan (bukti metode kirim, hemat panggilan API); `sisa_kuota` disimpan sebagai kolom sendiri (dikunci dan dikembalikan sebagai perubahan nilai).

## 8. Layar Prototipe (390 × 844, 14 layar)
| No | Layar | Ref |
|---|---|---|
| 01 | Registrasi | FR-01 |
| 02 | Login | FR-02 |
| 03 | Homepage katalog | FR-03 |
| 04 | Detail produk | FR-04, FR-05 |
| 05 | Keranjang dan ringkasan | FR-04, FR-06 |
| 06 | Pilih pengiriman | FR-08, FR-09 |
| 07 | Pembayaran QRIS | FR-07 |
| 08 | Riwayat pesanan | FR-10, FR-14 |
| 09 | Dashboard penjual | FR-12 |
| 10 | Kelola open PO | FR-11 |
| 11 | Rekap pesanan | FR-12 |
| 12 | Konfirmasi pembayaran | FR-13 |
| 13 | Kelola pengiriman | FR-14 |
| 14 | Katalog, open PO tutup (layar negatif, TC-08) | FR-05, FR-11 |

Navigasi: pembeli 3 tab (Katalog, Keranjang, Riwayat); penjual 5 tab (Dashboard, Open PO, Rekap, Bayar, Kirim).

## 9. Metode, Jadwal, Tim
- **Metode**: Hybrid, yaitu Scrum (sprint 2 minggu, 8 sprint) ditambah 4 gate: G1 requirement (18 Sep), G2 prototipe (2 Okt), G3 fitur lengkap + UAT positif (26 Nov), G4 keamanan lulus (14 Des).
- **Durasi**: 7 Sep – 21 Des 2026 (16 minggu, 76 hari kerja), 42 tugas, 6 fase.
- **Peluncuran**: 15 Des 2026 (G4 satu-satunya gate yang boleh menggeser tanggal).
- **Tim (4 orang)**: Project Manager + BA, UI/UX Designer + Frontend, Backend Developer + integrasi peta, QA Engineer + Risk Owner.
- **Anggota**: Muhammad Faruq Albar, Raihan Rifqi Kurniawan, Muhammad Haikal Wibowo, Asfa Abimanyu.
- **Alat**: Jira, GitHub, Figma. Backend diuji dengan pytest, Postman, k6, OWASP ZAP.
- **Budget**: total Rp103.499.000 (subtotal Rp94.090.000 + contingency 10%).

## 10. Pengujian (ringkas)
28 test case mencakup seluruh FR dan NFR. Contoh kasus penting: TC-08 open PO tutup, TC-09 melebihi kuota, TC-14 lewat 24 jam, TC-15 alamat 1,5 km (Rp5.000), TC-16 alamat 7 km (Rp21.000), TC-17 di luar area, TC-22 resi kosong ditolak, TC-25 akses bukti oleh akun lain ditolak.

Kode inti `kirim.py`: `tentukan_metode(jarak_km)` (di_luar_area bila > 15; antar_sendiri bila ≤ 2; selain itu jasa_kirim), `hitung_ongkir(jarak_km)`, `validasi_kuota(sisa_kuota, jumlah_pesan, po_dibuka)`.

## 11. Risiko Teratas
MGT-01 anggota tim tidak tersedia (skor 9); TECH-01 jarak keliru; TECH-03 checkout bersamaan saat kuota tinggal satu (butuh transaksi DB dengan row lock); EXT-01 layanan peta down; MGT-02 pemilik toko sulit dihubungi; COM-02 jeda konfirmasi manual terasa lama.

## 12. Catatan untuk Desain
- Pembeli **tidak pernah memilih** metode kirim. Layar pengiriman hanya menampilkan hasil dan alasannya.
- Status harus terlihat di satu layar untuk kedua pihak (chip berwarna + timeline).
- Setiap tombol nonaktif perlu penjelasan teks.
- **Tanpa emoji**; pakai ikon vektor (lihat `design.md`).
- Ketidakkonsistenan kecil di laporan yang perlu dirapikan: Bagian 6b menyebut 13 layar sambil menggambar 14; tanggal peluncuran 15 Des sementara Sprint 8 tertulis 14–25 Des padahal proyek berakhir 21 Des.
