export type UserRole = 'pembeli' | 'admin';

export interface User {
  id: string;
  nama: string;
  email: string;
  noHp: string;
  passwordHash: string;
  peran: UserRole;
  authProvider?: 'email' | 'google';
  alamatDefault?: string;
}

export interface Produk {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambarGradient: string;
  gambarUrl?: string;
  catatanRasa: string;
}

export type OpenPOStatus = 'buka' | 'tutup';

export interface OpenPO {
  id: string;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalTutup: string; // YYYY-MM-DD
  kuota: number;
  sisaKuota: number;
  status: OpenPOStatus;
}

export type StatusPesanan =
  | 'menunggu_pembayaran'
  | 'menunggu_konfirmasi'
  | 'lunas'
  | 'ditolak'
  | 'kedaluwarsa'
  | 'diproses'
  | 'dikirim'
  | 'diterima';

export interface Pesanan {
  id: string; // e.g., 'MT-0142'
  userId: string;
  openPoId: string;
  waktuPesan: number; // epoch ms
  totalBayar: number;
  statusPesanan: StatusPesanan;
}

export interface DetailPesanan {
  id: string;
  pesananId: string;
  produkId: string;
  namaProduk: string;
  jumlah: number;
  hargaSatuan: number; // COPIED at order time
  subtotal: number;
}

export type StatusBayar = 'menunggu' | 'lunas' | 'ditolak';
export type MetodeBayar = 'qris' | 'cod';

export interface Pembayaran {
  pesananId: string;
  metodeBayar: MetodeBayar;
  buktiUrl: string; // data URL or mock proof identifier
  buktiNamaFile: string;
  nominal: number; // nominal pada bukti yang terbaca/diinput
  statusBayar: StatusBayar;
  alasanTolak: string;
  waktuUnggah: number | null;
  batasWaktu: number; // 24h from order creation
  dikonfirmasiOleh?: string;
}

export type MetodeKirim = 'antar_sendiri' | 'jasa_kirim';
export type StatusKirim = 'diproses' | 'dikirim' | 'selesai';

export interface Pengiriman {
  pesananId: string;
  alamat: string;
  jarakKm: number; // stored at order time
  metode: MetodeKirim;
  biayaKirim: number;
  nomorResi: string;
  statusKirim: StatusKirim;
}

export interface CartItem {
  produkId: string;
  jumlah: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  pesananId: string;
  pesan: string;
  waktu: number;
  dibaca: boolean;
}

export interface LoginLockState {
  failedAttempts: Record<string, number>;
  lockedUntil: Record<string, number>;
}
