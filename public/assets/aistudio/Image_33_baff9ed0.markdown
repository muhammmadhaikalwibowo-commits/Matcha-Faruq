---
name: Matcha Artisan Commerce
colors:
  surface: '#FFFFFF'
  surface-dim: '#d1dec9'
  surface-bright: '#f0fee7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf8e2'
  surface-container: '#e5f2dc'
  surface-container-high: '#dfecd7'
  surface-container-highest: '#d9e7d1'
  on-surface: '#141e11'
  on-surface-variant: '#42493d'
  inverse-surface: '#283325'
  inverse-on-surface: '#e7f5df'
  outline: '#72796c'
  outline-variant: '#c2c9ba'
  surface-tint: '#396a2a'
  primary: '#326324'
  on-primary: '#ffffff'
  primary-container: '#4a7c3a'
  on-primary-container: '#ddffcc'
  inverse-primary: '#9ed588'
  secondary: '#3d6931'
  on-secondary: '#ffffff'
  secondary-container: '#bbeda7'
  on-secondary-container: '#416d35'
  tertiary: '#515a4b'
  on-tertiary: '#ffffff'
  tertiary-container: '#697363'
  on-tertiary-container: '#eef8e4'
  error: '#B3402F'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b9f2a2'
  primary-fixed-dim: '#9ed588'
  on-primary-fixed: '#032100'
  on-primary-fixed-variant: '#215114'
  secondary-fixed: '#bdf0aa'
  secondary-fixed-dim: '#a2d490'
  on-secondary-fixed: '#022200'
  on-secondary-fixed-variant: '#25501b'
  tertiary-fixed: '#dce6d2'
  tertiary-fixed-dim: '#c0cab7'
  on-tertiary-fixed: '#151e12'
  on-tertiary-fixed-variant: '#40493b'
  background: '#F8FAF5'
  on-background: '#141e11'
  surface-variant: '#d9e7d1'
  muted: '#6B7866'
  line: '#DFE6D8'
  disabled-bg: '#C9D1C3'
  disabled-fg: '#7B8576'
  status-success-bg: '#DCEFD2'
  status-success-fg: '#2F5A24'
  status-pending-bg: '#FFF0C9'
  status-pending-fg: '#8A6200'
  status-failed-bg: '#F8D9D3'
  status-failed-fg: '#A3331F'
  status-info-bg: '#DBE8F7'
  status-info-fg: '#1F4F87'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 46px
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 27px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '800'
    lineHeight: 24px
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 19px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 19px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  caption-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 15px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.25rem
---

# DESIGN.md — MATCHA (Mobile App, 390 × 844)

Design system untuk aplikasi pemesanan matcha open PO. Dua peran: **Pembeli** dan **Penjual/Admin**. Semua token diambil dari prototipe HTML 14 layar.

## 1. Brand & Nuansa
- Nama: **MATCHA**. Tagline: "Pesan matcha open PO, tanpa ribet."
- Nuansa: segar, tenang, bersih, hijau matcha dengan latar putih kehijauan. Terasa seperti toko kecil yang rapi, bukan aplikasi korporat.
- Bahasa UI: **Bahasa Indonesia**, singkat, langsung, tanpa jargon.
- Prinsip: (1) status selalu terlihat (chip + banner), (2) angka uang tegas dan besar, (3) error muncul tepat di bawah kolom yang salah, (4) sistem yang memutuskan metode kirim, pembeli tidak memilih.

## 2. Warna

### Inti
| Token | Hex | Pemakaian |
|---|---|---|
| `primary` | `#4A7C3A` | Tombol utama, tab aktif, tautan, bar progres, toggle aktif |
| `primary-dark` | `#2F5A24` | Logo MATCHA, nominal besar di layar QRIS, teks chip sukses |
| `primary-light` | `#E6F0DC` | Latar lembut, hover, ikon container |
| `background` | `#F8FAF5` | Latar layar |
| `surface` | `#FFFFFF` | Kartu, kolom input, bottom nav, top bar tombol |
| `ink` | `#1F2A1C` | Teks utama |
| `muted` | `#6B7866` | Teks sekunder, label nonaktif, placeholder |
| `line` | `#DFE6D8` | Border kartu, divider, track progress |
| `error` | `#B3402F` | Border input error, teks error, tombol Tolak |
| `disabled-bg` / `disabled-fg` | `#C9D1C3` / `#7B8576` | Tombol dan toggle nonaktif |

### Status (chip & banner)
| Status | Latar | Teks | Dipakai untuk |
|---|---|---|---|
| Sukses | `#DCEFD2` | `#2F5A24` | Open PO buka, Lunas, Antar penjual |
| Menunggu | `#FFF0C9` | `#8A6200` | Menunggu konfirmasi, Diproses |
| Gagal | `#F8D9D3` | `#A3331F` | Ditolak, Tutup, banner open PO tutup |
| Info | `#DBE8F7` | `#1F4F87` | Jasa kirim, Dikirim |

### Gradien placeholder foto produk
Hijau muda ke hijau tua `#A9CF8C → #4A7C3A`; variasi: `#D7E8C4 → #7FAE62`, `#F3C9D2 → #9CC47F` (strawberry), `#C8B59A → #6F8F55` (hojicha). Ganti dengan foto produk asli bila ada.

### Dark mode (opsional)
Latar `#161A14`, teks `#E8EFE3`, muted `#9FB098`. Pertahankan `primary`.

## 3. Tipografi
Font: **Inter** (fallback system-ui).

| Peran | Ukuran / berat |
|---|---|
| Logo MATCHA (login) | 34 / 800 |
| Nominal besar (QRIS) | 30 / 800 |
| KPI dashboard | 24 / 700 |
| Judul layar (top bar) | 20 / 700 |
| Total bayar | 18 / 800 |
| Judul item, tombol | 14 / 700 |
| Body | 14 / 400 |
| Label field | 12 / 600 |
| Caption, muted | 12 / 400 |
| Chip | 11 / 700 |

Line height 1.35.

## 4. Layout & Spacing
- Frame: **390 × 844**, radius luar 28.
- Status bar 44, top bar (judul + tombol back 34), body, bottom nav 70.
- Padding horizontal 20, jarak antar blok 12, padding kartu 12.
- Bottom nav pembeli: **3 tab** (Katalog, Keranjang, Riwayat). Bottom nav penjual: **5 tab** (Dashboard, Open PO, Rekap, Bayar, Kirim).
- Tombol aksi utama menempel di bawah body (di atas nav atau di dasar layar bila tanpa nav), dipisah dari konten dengan spacer fleksibel.

## 5. Bentuk
| Elemen | Radius |
|---|---|
| Kartu | 14 |
| Tombol, input | 12 |
| Gambar produk | 12 (detail: 18) |
| Chip, toggle | pill (99) |
| Tombol back | lingkaran, putih, border `line` |

Tanpa bayangan berat. Pemisah memakai border 1px `line`.

## 6. Komponen
- **Tombol utama**: isi `primary`, teks putih 700, padding 14, radius 12, lebar penuh.
- **Tombol sekunder (outline)**: putih, border 1.5px `primary`, teks `primary`.
- **Tombol bahaya**: isi `error` (Tolak).
- **Tombol nonaktif**: `disabled-bg`, teks `disabled-fg`, selalu disertai teks alasan di bawahnya.
- **Input**: putih, border `line`, radius 12, padding 12. State error: border `error` + pesan merah 12px di bawahnya. Label di atas, 12/600.
- **Kartu produk**: gambar 64×64 kiri, nama + stok + harga tengah, chip status kanan.
- **Banner**: radius 12, padding 10×12, 12/600; hijau untuk info positif, merah untuk peringatan (open PO tutup).
- **Stepper jumlah**: tombol bulat putih "−" dan "+", angka tebal di tengah.
- **Toggle**: pill 46×26, aktif `primary`, nonaktif `disabled-bg`.
- **Progress bar**: tinggi 8, track `line`, isi `primary`.
- **KPI card**: grid 2 kolom, label muted di atas, angka 24 tebal.
- **Timeline status**: titik 8px `primary` untuk langkah selesai, `disabled-bg` untuk belum.
- **Tabel rekap**: font 12, header muted, baris dipisah border `line`.
- **QR**: kotak putih 190×190 dengan border putih tebal, dicentang di tengah layar.

## 7. Ikonografi (WAJIB, tanpa emoji)
**Jangan pakai emoji di mana pun.** Semua ikon harus berupa ikon vektor dari satu keluarga yang konsisten: **Lucide** (utama) atau **Material Symbols Rounded**. Stroke 1.75–2px, sudut membulat, ukuran 22–24 (nav), 20 (inline), 18 (dalam chip/tombol kecil). Warna: `primary` saat aktif, `muted` saat tidak aktif.

| Tempat | Ikon (Lucide) |
|---|---|
| Nav pembeli: Katalog | `coffee` atau `cup-soda` |
| Nav pembeli: Keranjang | `shopping-cart` |
| Nav pembeli: Riwayat | `receipt` |
| Nav penjual: Dashboard | `layout-dashboard` |
| Nav penjual: Open PO | `calendar-range` |
| Nav penjual: Rekap | `file-spreadsheet` |
| Nav penjual: Bayar | `badge-check` |
| Nav penjual: Kirim | `package` / `truck` |
| Tombol back | `chevron-left` |
| Stepper | `minus`, `plus` |
| Unggah bukti | `upload` / `image-up` |
| Lokasi/alamat | `map-pin` |
| Jarak/ongkir | `route` |
| Antar penjual | `bike` |
| Jasa kirim | `truck` |
| Batas waktu | `clock` |
| Sukses/lunas | `check-circle-2` |
| Ditolak/error | `x-circle`, `alert-circle` |
| Ekspor CSV/PDF | `download`, `file-text` |
| Peringatan banner | `info`, `alert-triangle` |
| Dropdown status | `chevron-down` |
| Lupa password/ mata | `eye`, `eye-off` |

## 8. Gaya Konten
- Mata uang: `Rp28.000` (titik pemisah ribuan, tanpa spasi). Jarak: `7,0 km` (koma desimal).
- Tanggal: `14 Des 09:12`, rentang `14–20 Des`.
- Kode pesanan: `#MT-0142`.
- Pesan error selalu menyebut perbaikannya, contoh: "Password minimal 8 karakter".
- Tombol berupa kata kerja: Daftar, Masuk, Bayar, Unggah bukti bayar, Terima, Tolak, Simpan perubahan.

## 9. Aksesibilitas
- Kontras teks terhadap latar minimal 4.5:1; status tidak hanya mengandalkan warna (selalu ada teks dan ikon).
- Target sentuh minimal 44px untuk tombol dan tab.
- State nonaktif harus punya penjelasan teks.
