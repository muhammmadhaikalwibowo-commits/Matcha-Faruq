import { BATAS_BAYAR_MS, mockHashPassword } from '../lib/rules';
import type {
  AppNotification,
  DetailPesanan,
  OpenPO,
  Pembayaran,
  Pengiriman,
  Pesanan,
  Produk,
  User,
} from '../types';

function createMockReceiptSvg(kode: string, nominalLabel: string, pengirim: string, catatan: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">
    <rect width="320" height="220" rx="12" fill="#F8FAF5" stroke="#DFE6D8" stroke-width="2"/>
    <rect x="0" y="0" width="320" height="44" rx="12" fill="#2F5A24"/>
    <rect x="0" y="32" width="320" height="12" fill="#2F5A24"/>
    <text x="20" y="27" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">BUKTI TRANSFER QRIS</text>
    <text x="300" y="27" text-anchor="end" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#DCEFD2">#${kode}</text>
    <text x="20" y="76" font-family="Inter, sans-serif" font-size="11" fill="#6B7866">Nominal Terbayar</text>
    <text x="20" y="102" font-family="Inter, sans-serif" font-size="22" font-weight="800" fill="#1F2A1C">${nominalLabel}</text>
    <line x1="20" y1="118" x2="300" y2="118" stroke="#DFE6D8" stroke-dasharray="4 3"/>
    <text x="20" y="140" font-family="Inter, sans-serif" font-size="11" fill="#6B7866">Pengirim: ${pengirim}</text>
    <text x="20" y="160" font-family="Inter, sans-serif" font-size="11" fill="#6B7866">Tujuan: Toko Matcha Open PO</text>
    <text x="20" y="180" font-family="Inter, sans-serif" font-size="11" fill="#4A7C3A">${catatan}</text>
    <text x="20" y="202" font-family="Inter, sans-serif" font-size="10" fill="#6B7866">Status Bank: Berhasil Diproses</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface SeedState {
  users: User[];
  produk: Produk[];
  openPO: OpenPO;
  pesanan: Pesanan[];
  detailPesanan: DetailPesanan[];
  pembayaran: Pembayaran[];
  pengiriman: Pengiriman[];
  notifications: AppNotification[];
}

export function createSeedState(now = Date.now()): SeedState {
  const defaultHash = mockHashPassword('12345678');

  const users: User[] = [
    {
      id: 'user-dina',
      nama: 'Dina Ayu',
      email: 'dina.ayu@mail.com',
      noHp: '081234567890',
      passwordHash: defaultHash,
      peran: 'pembeli',
    },
    {
      id: 'user-raka',
      nama: 'Raka Pratama',
      email: 'raka.p@mail.com',
      noHp: '081298765432',
      passwordHash: defaultHash,
      peran: 'pembeli',
    },
    {
      id: 'user-salsa',
      nama: 'Salsa Maharani',
      email: 'salsa.m@mail.com',
      noHp: '081345678901',
      passwordHash: defaultHash,
      peran: 'pembeli',
    },
    {
      id: 'user-bima',
      nama: 'Bima Wijaya',
      email: 'bima.w@mail.com',
      noHp: '081456789012',
      passwordHash: defaultHash,
      peran: 'pembeli',
    },
    {
      id: 'user-admin',
      nama: 'Admin Matcha',
      email: 'admin@matcha.id',
      noHp: '081112223334',
      passwordHash: defaultHash,
      peran: 'admin',
    },
  ];

  const produk: Produk[] = [
    {
      id: 'prod-matcha-latte',
      nama: 'Matcha Latte',
      deskripsi:
        'Bubuk matcha Uji pilihan dikocok manual dengan susu segar dingin. Seimbang antara umami lembut dan manis ringan.',
      harga: 28000,
      stok: 20,
      gambarGradient: 'linear-gradient(135deg, #A9CF8C 0%, #4A7C3A 100%)',
      gambarUrl: '/src/assets/images/product_matcha_latte_1795430524010.jpg',
      catatanRasa: 'Creamy · Umami halus · 250 ml',
    },
    {
      id: 'prod-ceremonial',
      nama: 'Ceremonial Matcha',
      deskripsi:
        'First-harvest ceremonial grade dari Kyoto tanpa gula tambahan. Rasa pekat, bersih, dan aroma daun teh segar.',
      harga: 38000,
      stok: 12,
      gambarGradient: 'linear-gradient(135deg, #D7E8C4 0%, #7FAE62 100%)',
      gambarUrl: '/src/assets/images/product_ceremonial_matcha_1795430523249.jpg',
      catatanRasa: 'Murni · Pekat · Tanpa gula · 200 ml',
    },
    {
      id: 'prod-strawberry',
      nama: 'Matcha Strawberry',
      deskripsi:
        'Lapisan pure stroberi segar rumahan berpadu dengan susu oat dan matcha latte di bagian atas.',
      harga: 34000,
      stok: 15,
      gambarGradient: 'linear-gradient(135deg, #F3C9D2 0%, #9CC47F 100%)',
      gambarUrl: '/src/assets/images/product_matcha_strawberry_1795430523163.jpg',
      catatanRasa: 'Segar asam-manis · Buah asli · 250 ml',
    },
    {
      id: 'prod-hojicha',
      nama: 'Hojicha Latte',
      deskripsi:
        'Teh hijau panggang khas Jepang dengan aroma karamel dan kacang panggang yang hangat, cocok untuk sore hari.',
      harga: 25000,
      stok: 8,
      gambarGradient: 'linear-gradient(135deg, #C8B59A 0%, #6F8F55 100%)',
      gambarUrl: '/src/assets/images/product_hojicha_latte_1795430523147.jpg',
      catatanRasa: 'Roasted · Kafein rendah · 250 ml',
    },
  ];

  const openPO: OpenPO = {
    id: 'PO-2026-12',
    tanggalMulai: '2026-12-14',
    tanggalTutup: '2026-12-20',
    kuota: 50,
    sisaKuota: 38,
    status: 'buka',
  };

  const tToday = now;
  const h = 60 * 60 * 1000;
  const min = 60 * 1000;

  const pesanan: Pesanan[] = [
    {
      id: 'MT-0144',
      userId: 'user-raka',
      openPoId: openPO.id,
      waktuPesan: tToday - 45 * min,
      totalBayar: 61000,
      statusPesanan: 'diproses',
    },
    {
      id: 'MT-0143',
      userId: 'user-dina',
      openPoId: openPO.id,
      waktuPesan: tToday - 1.5 * h,
      totalBayar: 115000,
      statusPesanan: 'lunas',
    },
    {
      id: 'MT-0142',
      userId: 'user-dina',
      openPoId: openPO.id,
      waktuPesan: tToday - 3 * h,
      totalBayar: 115000,
      statusPesanan: 'dikirim',
    },
    {
      id: 'MT-0141',
      userId: 'user-raka',
      openPoId: openPO.id,
      waktuPesan: tToday - 4 * h,
      totalBayar: 61000,
      statusPesanan: 'lunas',
    },
    {
      id: 'MT-0140',
      userId: 'user-salsa',
      openPoId: openPO.id,
      waktuPesan: tToday - 5 * h,
      totalBayar: 142000,
      statusPesanan: 'lunas',
    },
    {
      id: 'MT-0139',
      userId: 'user-dina',
      openPoId: openPO.id,
      waktuPesan: tToday - 19 * min, // 23 jam 41 menit tersisa
      totalBayar: 33000,
      statusPesanan: 'menunggu_pembayaran',
    },
    {
      id: 'MT-0138',
      userId: 'user-bima',
      openPoId: openPO.id,
      waktuPesan: tToday - 26 * h,
      totalBayar: 33000,
      statusPesanan: 'diterima',
    },
    {
      id: 'MT-0131',
      userId: 'user-dina',
      openPoId: openPO.id,
      waktuPesan: tToday - 28 * h,
      totalBayar: 60000,
      statusPesanan: 'kedaluwarsa',
    },
  ];

  const detailPesanan: DetailPesanan[] = [
    // MT-0144 Raka (2 item: 56.000 + 5.000 = 61.000)
    {
      id: 'det-144-1',
      pesananId: 'MT-0144',
      produkId: 'prod-matcha-latte',
      namaProduk: 'Matcha Latte',
      jumlah: 2,
      hargaSatuan: 28000,
      subtotal: 56000,
    },
    // MT-0143 Dina (3 item: 94.000 + 21.000 = 115.000)
    {
      id: 'det-143-1',
      pesananId: 'MT-0143',
      produkId: 'prod-matcha-latte',
      namaProduk: 'Matcha Latte',
      jumlah: 2,
      hargaSatuan: 28000,
      subtotal: 56000,
    },
    {
      id: 'det-143-2',
      pesananId: 'MT-0143',
      produkId: 'prod-ceremonial',
      namaProduk: 'Ceremonial Matcha',
      jumlah: 1,
      hargaSatuan: 38000,
      subtotal: 38000,
    },
    // MT-0142 Dina (3 item: 94.000 + 21.000 = 115.000)
    {
      id: 'det-142-1',
      pesananId: 'MT-0142',
      produkId: 'prod-matcha-latte',
      namaProduk: 'Matcha Latte',
      jumlah: 2,
      hargaSatuan: 28000,
      subtotal: 56000,
    },
    {
      id: 'det-142-2',
      pesananId: 'MT-0142',
      produkId: 'prod-ceremonial',
      namaProduk: 'Ceremonial Matcha',
      jumlah: 1,
      hargaSatuan: 38000,
      subtotal: 38000,
    },
    // MT-0141 Raka (2 item: 56.000 + 5.000 = 61.000)
    {
      id: 'det-141-1',
      pesananId: 'MT-0141',
      produkId: 'prod-matcha-latte',
      namaProduk: 'Matcha Latte',
      jumlah: 2,
      hargaSatuan: 28000,
      subtotal: 56000,
    },
    // MT-0140 Salsa (4 item: 28.000 + 102.000 + 12.000 = 142.000)
    {
      id: 'det-140-1',
      pesananId: 'MT-0140',
      produkId: 'prod-matcha-latte',
      namaProduk: 'Matcha Latte',
      jumlah: 1,
      hargaSatuan: 28000,
      subtotal: 28000,
    },
    {
      id: 'det-140-2',
      pesananId: 'MT-0140',
      produkId: 'prod-strawberry',
      namaProduk: 'Matcha Strawberry',
      jumlah: 3,
      hargaSatuan: 34000,
      subtotal: 102000,
    },
    // MT-0139 Dina (1 item: 28.000 + 5.000 = 33.000)
    {
      id: 'det-139-1',
      pesananId: 'MT-0139',
      produkId: 'prod-matcha-latte',
      namaProduk: 'Matcha Latte',
      jumlah: 1,
      hargaSatuan: 28000,
      subtotal: 28000,
    },
    // MT-0138 Bima (1 item: 28.000 + 5.000 = 33.000)
    {
      id: 'det-138-1',
      pesananId: 'MT-0138',
      produkId: 'prod-matcha-latte',
      namaProduk: 'Matcha Latte',
      jumlah: 1,
      hargaSatuan: 28000,
      subtotal: 28000,
    },
    // MT-0131 Dina (2 item harga disalin saat order: 2x 27.500 + 5.000 = 60.000)
    {
      id: 'det-131-1',
      pesananId: 'MT-0131',
      produkId: 'prod-matcha-latte',
      namaProduk: 'Matcha Latte',
      jumlah: 2,
      hargaSatuan: 27500,
      subtotal: 55000,
    },
  ];

  const pembayaran: Pembayaran[] = [
    {
      pesananId: 'MT-0144',
      metodeBayar: 'cod',
      buktiUrl: '',
      buktiNamaFile: '',
      nominal: 61000,
      statusBayar: 'menunggu',
      alasanTolak: '',
      waktuUnggah: tToday - 40 * min,
      batasWaktu: tToday - 45 * min + BATAS_BAYAR_MS,
    },
    {
      pesananId: 'MT-0143',
      metodeBayar: 'qris',
      buktiUrl: createMockReceiptSvg('MT-0143', 'Rp115.000', 'Dina A.', 'QRIS Dinamis · Otomatis'),
      buktiNamaFile: 'qris-dinamis-mt0143',
      nominal: 115000,
      statusBayar: 'lunas',
      alasanTolak: '',
      waktuUnggah: tToday - 1.2 * h,
      batasWaktu: tToday - 1.5 * h + BATAS_BAYAR_MS,
      dikonfirmasiOleh: 'sistem_qris_otomatis',
    },
    {
      pesananId: 'MT-0142',
      metodeBayar: 'qris',
      buktiUrl: createMockReceiptSvg('MT-0142', 'Rp115.000', 'Dina A.', 'QRIS Dinamis · Otomatis'),
      buktiNamaFile: 'qris-dinamis-mt0142',
      nominal: 115000,
      statusBayar: 'lunas',
      alasanTolak: '',
      waktuUnggah: tToday - 2.8 * h,
      batasWaktu: tToday - 3 * h + BATAS_BAYAR_MS,
      dikonfirmasiOleh: 'sistem_qris_otomatis',
    },
    {
      pesananId: 'MT-0141',
      metodeBayar: 'qris',
      buktiUrl: createMockReceiptSvg('MT-0141', 'Rp61.000', 'Raka P.', 'QRIS Dinamis · Otomatis'),
      buktiNamaFile: 'qris-dinamis-mt0141',
      nominal: 61000,
      statusBayar: 'lunas',
      alasanTolak: '',
      waktuUnggah: tToday - 3.8 * h,
      batasWaktu: tToday - 4 * h + BATAS_BAYAR_MS,
      dikonfirmasiOleh: 'sistem_qris_otomatis',
    },
    {
      pesananId: 'MT-0140',
      metodeBayar: 'qris',
      buktiUrl: createMockReceiptSvg('MT-0140', 'Rp142.000', 'Salsa M.', 'QRIS Dinamis · Otomatis'),
      buktiNamaFile: 'qris-dinamis-mt0140',
      nominal: 142000,
      statusBayar: 'lunas',
      alasanTolak: '',
      waktuUnggah: tToday - 4.7 * h,
      batasWaktu: tToday - 5 * h + BATAS_BAYAR_MS,
      dikonfirmasiOleh: 'sistem_qris_otomatis',
    },
    {
      pesananId: 'MT-0139',
      metodeBayar: 'qris',
      buktiUrl: '',
      buktiNamaFile: '',
      nominal: 0,
      statusBayar: 'menunggu',
      alasanTolak: '',
      waktuUnggah: null,
      batasWaktu: tToday - 19 * min + BATAS_BAYAR_MS,
    },
    {
      pesananId: 'MT-0138',
      metodeBayar: 'qris',
      buktiUrl: createMockReceiptSvg('MT-0138', 'Rp33.000', 'Bima W.', 'QRIS Dinamis · Otomatis'),
      buktiNamaFile: 'qris-dinamis-mt0138',
      nominal: 33000,
      statusBayar: 'lunas',
      alasanTolak: '',
      waktuUnggah: tToday - 25.5 * h,
      batasWaktu: tToday - 26 * h + BATAS_BAYAR_MS,
      dikonfirmasiOleh: 'sistem_qris_otomatis',
    },
    {
      pesananId: 'MT-0131',
      metodeBayar: 'qris',
      buktiUrl: '',
      buktiNamaFile: '',
      nominal: 0,
      statusBayar: 'menunggu',
      alasanTolak: 'Batas waktu bayar QRIS 24 jam telah berakhir.',
      waktuUnggah: null,
      batasWaktu: tToday - 4 * h,
    },
  ];

  const pengiriman: Pengiriman[] = [
    {
      pesananId: 'MT-0144',
      alamat: 'Jl. Kenanga No. 4 (Dekat toko)',
      jarakKm: 1.5,
      metode: 'antar_sendiri',
      biayaKirim: 5000,
      nomorResi: '',
      statusKirim: 'diproses',
    },
    {
      pesananId: 'MT-0143',
      alamat: 'Jl. Melati Indah No. 18',
      jarakKm: 7.0,
      metode: 'jasa_kirim',
      biayaKirim: 21000,
      nomorResi: '',
      statusKirim: 'diproses',
    },
    {
      pesananId: 'MT-0142',
      alamat: 'Jl. Melati Raya No. 22',
      jarakKm: 7.0,
      metode: 'jasa_kirim',
      biayaKirim: 21000,
      nomorResi: 'JNE123456789',
      statusKirim: 'dikirim',
    },
    {
      pesananId: 'MT-0141',
      alamat: 'Gg. Flamboyan No. 3 (Dekat toko)',
      jarakKm: 1.5,
      metode: 'antar_sendiri',
      biayaKirim: 5000,
      nomorResi: '',
      statusKirim: 'diproses',
    },
    {
      pesananId: 'MT-0140',
      alamat: 'Jl. Cempaka Putih No. 9',
      jarakKm: 4.0,
      metode: 'jasa_kirim',
      biayaKirim: 12000,
      nomorResi: '',
      statusKirim: 'diproses',
    },
    {
      pesananId: 'MT-0139',
      alamat: 'Jl. Anggrek No. 2 (Dekat toko)',
      jarakKm: 1.5,
      metode: 'antar_sendiri',
      biayaKirim: 5000,
      nomorResi: '',
      statusKirim: 'diproses',
    },
    {
      pesananId: 'MT-0138',
      alamat: 'Jl. Dahlia No. 1 (Dekat toko)',
      jarakKm: 1.2,
      metode: 'antar_sendiri',
      biayaKirim: 5000,
      nomorResi: '',
      statusKirim: 'selesai',
    },
    {
      pesananId: 'MT-0131',
      alamat: 'Jl. Anggrek No. 2 (Dekat toko)',
      jarakKm: 1.5,
      metode: 'antar_sendiri',
      biayaKirim: 5000,
      nomorResi: '',
      statusKirim: 'diproses',
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      userId: 'user-dina',
      pesananId: 'MT-0142',
      pesan: 'Pesanan #MT-0142 sedang dikirim dengan no. resi JNE123456789.',
      waktu: tToday - 2 * h,
      dibaca: false,
    },
    {
      id: 'notif-2',
      userId: 'user-dina',
      pesananId: 'MT-0131',
      pesan: 'Pesanan #MT-0131 kedaluwarsa karena melewati batas waktu pembayaran 24 jam.',
      waktu: tToday - 12 * h,
      dibaca: true,
    },
  ];

  return {
    users,
    produk,
    openPO,
    pesanan,
    detailPesanan,
    pembayaran,
    pengiriman,
    notifications,
  };
}
