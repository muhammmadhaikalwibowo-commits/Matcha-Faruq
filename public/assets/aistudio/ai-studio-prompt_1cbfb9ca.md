# Prompt untuk Google AI Studio (Build mode) — MATCHA

Tempel blok di bawah ini sebagai prompt tunggal. Kalau AI Studio terlalu lambat atau memotong hasil, bagi menjadi dua: kirim sampai bagian 6 dulu, lalu bagian 7 sampai akhir sebagai prompt lanjutan.

---

```
Build a clickable mobile app MOCKUP (frontend only, no real backend) called "MATCHA", an ordering app for a small matcha shop that sells via pre-order ("open PO"). Use React + Vite + TypeScript + Tailwind CSS + React Router + lucide-react. All UI text in Indonesian. State lives in a React context with in-memory mock data (optionally persisted to localStorage). No emoji anywhere: use lucide-react icons only.

## 1. APP SHELL
- Render the app inside a centered phone frame of 390x844 px (rounded 28px, 1px border #CFD8C6) on desktop; full screen on real mobile.
- Structure: status bar (44px, static "9:41"), top bar (back button + title), scrollable body, bottom tab bar (70px).
- Role switcher: a small floating toggle outside the phone frame (or in the login screen) to jump between "Pembeli" and "Penjual" for demo purposes. Login with demo accounts: buyer dina.ayu@mail.com / 12345678, admin admin@matcha.id / 12345678.
- A debug panel outside the phone frame (desktop only) with: toggle "Open PO buka/tutup", input "jarak alamat (km)", button "Reset data demo".

## 2. DESIGN TOKENS
Font Inter. Colors: primary #4A7C3A, primary-dark #2F5A24, primary-light #E6F0DC, background #F8FAF5, surface #FFFFFF, ink #1F2A1C, muted #6B7866, line #DFE6D8, error #B3402F, disabled bg #C9D1C3 / fg #7B8576.
Status chips (bg / text): success #DCEFD2 / #2F5A24, waiting #FFF0C9 / #8A6200, failed #F8D9D3 / #A3331F, info #DBE8F7 / #1F4F87.
Radius: cards 14, buttons and inputs 12, chips and toggles pill. Page padding 20, gap 12. No heavy shadows. Type scale: screen title 20/700, body 14, caption 12, chip 11/700, KPI 24/700, total 18/800.
Buttons: primary (filled green, full width, padding 14, bold), outline (white, 1.5px green border), danger (#B3402F), disabled (gray, always with an explanation line beneath).
Inputs: white, 1px line border; error state = red border + red 12px message directly below the field.
Icons (lucide-react, strokeWidth 2, 22px in nav): Katalog=Coffee, Keranjang=ShoppingCart, Riwayat=Receipt, Dashboard=LayoutDashboard, Open PO=CalendarRange, Rekap=FileSpreadsheet, Bayar=BadgeCheck, Kirim=Truck, back=ChevronLeft, upload=Upload, address=MapPin, distance=Route, seller delivery=Bike, courier=Truck, deadline=Clock, success=CheckCircle2, error=XCircle, warning=AlertCircle, export=Download, password toggle=Eye/EyeOff.

## 3. DATA MODEL (TypeScript types + seed data)
- User {id, nama, email, noHp, passwordHash(mock), peran: 'pembeli'|'admin'}
- Produk {id, nama, harga, stok, gambarGradient}. Seed: Matcha Latte 28000 (stok 20), Ceremonial Matcha 38000 (12), Matcha Strawberry 34000 (15), Hojicha Latte 25000 (8).
- OpenPO {id, tanggalMulai, tanggalTutup, kuota:50, sisaKuota:38, status:'buka'|'tutup'}
- Pesanan {id:'MT-0142', userId, openPoId, waktuPesan, totalBayar, statusPesanan}
- DetailPesanan {pesananId, produkId, jumlah, hargaSatuan (COPIED at order time), subtotal}
- Pembayaran {pesananId, buktiUrl, nominal, statusBayar:'menunggu'|'lunas'|'ditolak', alasanTolak, waktuUnggah, batasWaktu (24h from order)}
- Pengiriman {pesananId, alamat, jarakKm (stored), metode:'antar_sendiri'|'jasa_kirim', biayaKirim, nomorResi, statusKirim:'diproses'|'dikirim'|'selesai'}
Order status flow: menunggu_pembayaran -> menunggu_konfirmasi -> lunas | ditolak | kedaluwarsa; then diproses -> dikirim -> diterima.
Seed a few orders for the seller screens: #MT-0142 Dina A. (3 item, Rp115.000, lunas, jasa kirim, resi JNE123456789), #MT-0141 Raka P. (2 item, Rp61.000, antar penjual), #MT-0140 Salsa M. (4 item, Rp142.000, jasa kirim, resi kosong), #MT-0138 Bima W. (1 item, Rp33.000), plus pending proofs #MT-0143 Dina A. Rp115.000 and #MT-0144 Raka P. Rp61.000. Buyer history seed: #MT-0142 Lunas, #MT-0139 Menunggu (Rp33.000), #MT-0131 Ditolak (Rp60.000).

## 4. BUSINESS RULES (implement as pure functions in /lib/rules.ts and use them everywhere)
- BATAS_ANTAR_KM=2.0, TARIF_ANTAR=5000, TARIF_KIRIM_PER_KM=3000, RADIUS_KM=15.
- tentukanMetode(jarak): invalid/negative -> throw; >15 -> 'di_luar_area'; <=2 (exactly 2.0 included) -> 'antar_sendiri'; else 'jasa_kirim'.
- hitungOngkir(jarak): antar_sendiri -> 5000; jasa_kirim -> Math.round(jarak) * 3000; di_luar_area -> throw.
- validasiKuota(sisaKuota, jumlah, poDibuka): closed -> "Open PO periode ini sudah ditutup"; jumlah<=0 -> "Jumlah pesanan harus lebih dari 0"; jumlah>sisa -> "Sisa kuota tinggal N cup"; else ok.
- The BUYER NEVER PICKS the delivery method. The system decides from distance and shows the reason. The buyer can only change the address.
- Distance is mocked: derive from the debug panel value, or from keywords in the address ("Melati" = 7 km, "Dekat toko" = 1.5 km, "Jauh" = 20 km, empty = "alamat tidak ditemukan"). Round km display with comma: "7,0 km".
- Creating an order locks quota (sisaKuota -= total cups). Expiry after 24h (simulate with a countdown and a debug button "Percepat 24 jam") sets status kedaluwarsa and returns quota.
- Payment proof: accept JPG/PNG/PDF only, max 2 MB; otherwise show error and do not store. Rejected proof lets the buyer re-upload while within the 24h window.
- Admin reject requires a reason (block the Tolak button and show an error if empty). Accept sets status Lunas and triggers an in-app notification to the buyer.
- Seller cannot set delivery to "selesai" for a courier order while nomorResi is empty (show "Isi resi lebih dulu sebelum status selesai").
- Delivery list for the seller only shows orders that are already lunas.
- Recap numbers are computed from the order data (never hardcoded): count and total of lunas orders must match exactly.
- Password min 8 chars; 5 wrong logins lock the account for a few minutes (mock timer); email already registered shows "Email sudah terdaftar".

## 5. SCREENS AND ROUTES (14 screens, build all)
BUYER
1. /daftar Registrasi: nama, email, no HP, password (eye toggle). Inline errors under each field ("Format email belum benar", "Password minimal 8 karakter"). Button "Daftar", link "Sudah punya akun? Masuk".
2. /masuk Login: wordmark MATCHA (Coffee icon above), tagline "Pesan matcha open PO, tanpa ribet.", email, password, "Lupa password?", button "Masuk", link "Belum punya akun? Daftar".
3. / Katalog: banner (green when open: "Open PO BUKA · 14–20 Des · Sisa kuota 38 dari 50 cup"), product cards (64px gradient image, name, "Stok N cup", price, chip "Open PO"). Bottom nav 3 tabs.
4. /produk/:id Detail: hero image 200px, name, price, description, banner "Sisa kuota open PO: 38 cup", stepper (Minus/Plus), button "Tambah ke keranjang · Rp56.000" (live total). Quantity 0 removes the item; negative is impossible.
5. /keranjang Keranjang: item cards, summary (Subtotal, "Ongkos kirim: dihitung setelah alamat", Total sementara), button "Lanjut ke pengiriman". Run validasiKuota on checkout and show the real remaining quota on failure, cart unchanged.
6. /pengiriman: address textarea with MapPin icon, auto-computed distance, selected method chip (info "Jasa kirim" with Truck icon or success "Antar penjual" with Bike icon), explanation "Alasan: jarak di atas 2 km, metode ditentukan sistem. Alamat dalam radius layanan 15 km.", shipping cost line (e.g. "Ongkos kirim (7 km × Rp3.000) Rp21.000"), Total bayar, button "Bayar". Beyond 15 km or address not found: block, show "perbaiki alamat", no bill created.
7. /bayar/:id Pembayaran QRIS: "Nominal yang harus dibayar", big amount (30px, primary-dark), QR placeholder (generate a QR-like SVG), caption "QRIS statis · Toko Matcha Open PO", banner with live countdown "Batas waktu bayar: 23 jam 41 menit", file input "Unggah bukti bayar" with Upload icon and the format/size validation.
8. /riwayat Riwayat: order cards with status chip, expandable timeline (Pesanan dibuat, Bukti bayar diunggah, Dikonfirmasi admin, Dikirim + No. resi, Diterima), rejected card shows reason and "Unggah ulang" button. Notification bell (Bell icon) with a badge in the top bar showing status-change notifications.
14. Katalog when open PO is closed (same route 3, conditional): red banner "Open PO periode ini sudah ditutup. Pesanan dibuka lagi saat periode berikutnya dimulai.", dimmed cards with chip "Tutup", disabled gray button "Pesan sekarang (nonaktif)" and caption "Tombol pesan dinonaktifkan karena open PO tutup."

SELLER (admin role, 5-tab bottom nav)
9. /admin Dashboard: chip "Open PO buka", 2x2 KPI (Pesanan hari ini, Menunggu konfirmasi, Siap kirim, Sisa kuota "38/50"), card "Kuota terpakai" with progress bar, card "Bukti bayar menunggu" with count chip. All values computed from state.
10. /admin/open-po Kelola open PO: toggle Buka/Tutup, tanggal mulai, tanggal tutup, kuota, sisa kuota, button "Simpan perubahan".
11. /admin/rekap Rekap: filter chips (Lunas, Menunggu, Ditolak), table (No, Pembeli, Item, Total), summary "N pesanan lunas · Rp total", buttons "Ekspor CSV" (really download a CSV whose row count equals the number of lunas orders) and "Ekspor PDF" (window.print or a simple generated PDF).
12. /admin/bayar Konfirmasi bayar: queue of pending proofs with chip "N menunggu", main card with proof preview, "Nominal seharusnya" vs "Nominal pada bukti", reason field, buttons Tolak (danger, XCircle) and Terima (primary, Check). Highlight when the two amounts differ.
13. /admin/kirim Kelola pengiriman: card per paid order with method chip, resi field (required for courier), status dropdown (Diproses, Dikirim, Selesai), validation error as specified.

## 6. USER FLOWS TO MAKE WORK END-TO-END
A. Happy path buyer: Masuk -> Katalog -> Detail -> Keranjang -> Pengiriman (7 km, jasa kirim, Rp21.000) -> Pembayaran -> unggah bukti -> Riwayat shows "Menunggu".
B. Admin: Bayar -> Terima -> buyer sees "Lunas" + notification -> Kirim: fill resi, set Dikirim -> buyer timeline updates -> Rekap totals update and CSV export matches.
C. Negative: open PO closed (debug toggle) disables ordering; quantity above remaining quota is rejected with the real quota; address >15 km blocked; wrong file type/size rejected; admin rejects without reason is blocked; courier order cannot be "Selesai" without resi; unpaid order after 24h expires and quota returns; a buyer cannot open another buyer's proof URL (show "Akses ditolak").

## 7. CODE STRUCTURE
/src/lib/rules.ts (pure rule functions + a small vitest file covering: 1.5 km, exactly 2.0 km, 2.01 km, 7 km, 20 km, -1, quota 3 vs 5, closed PO, quantities 0 and -2), /src/state (context + reducer), /src/components (Button, Chip, Card, Banner, Field, Stepper, Toggle, ProgressBar, TabBar, TopBar, PhoneFrame), /src/pages (one file per screen), /src/data/seed.ts. Typed props, small components, no unused libs, no emoji in code or UI.

## 8. QUALITY BAR
Pixel-match the tokens above, keep 390x844 layout without horizontal scroll, minimum 44px touch targets, visible focus states, status never conveyed by color alone (always text + icon), every empty/error/loading state designed. Give me the app running with seed data so I can click through every flow immediately.
```

---

## Tips pemakaian
- Lampirkan `design.md` dan `context.md` di AI Studio bila ada opsi unggah file; keduanya melengkapi prompt ini.
- Kalau hasilnya berantakan, minta perbaikan per bagian, misalnya: "Perbaiki hanya layar 06 Pengiriman sesuai aturan bagian 4, jangan ubah layar lain."
- Pastikan fungsi di `rules.ts` lulus tes batas 2,0 km vs 2,01 km sebelum lanjut menambah fitur.
