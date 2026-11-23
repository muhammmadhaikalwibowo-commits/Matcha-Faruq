import type { MetodeKirim, StatusKirim } from '../types';

export const BATAS_ANTAR_KM = 2.0;
export const TARIF_ANTAR = 5000;
export const TARIF_KIRIM_PER_KM = 3000;
export const RADIUS_KM = 15;
export const MAX_BUKTI_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_BUKTI_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
export const ALLOWED_BUKTI_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const BATAS_BAYAR_MS = 24 * 60 * 60 * 1000;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MS = 3 * 60 * 1000; // 3 menit

export type HasilMetode = MetodeKirim | 'di_luar_area';

/**
 * Menentukan metode pengiriman berdasarkan jarak (km).
 * Pembeli tidak pernah memilih metode kirim secara manual.
 */
export function tentukanMetode(jarakKm: number): HasilMetode {
  if (!Number.isFinite(jarakKm) || jarakKm < 0) {
    throw new Error('Jarak pengiriman tidak valid');
  }
  if (jarakKm > RADIUS_KM) {
    return 'di_luar_area';
  }
  if (jarakKm <= BATAS_ANTAR_KM) {
    return 'antar_sendiri';
  }
  return 'jasa_kirim';
}

/**
 * Menghitung ongkos kirim berdasarkan jarak (km).
 * <= 2.0 km: Rp5.000 flat
 * > 2.0 km s.d. 15 km: Math.round(jarakKm) * Rp3.000
 * > 15 km: throw error
 */
export function hitungOngkir(jarakKm: number): number {
  const metode = tentukanMetode(jarakKm);
  if (metode === 'di_luar_area') {
    throw new Error(`Alamat berada di luar radius layanan maksimal ${RADIUS_KM} km`);
  }
  if (metode === 'antar_sendiri') {
    return TARIF_ANTAR;
  }
  return Math.round(jarakKm) * TARIF_KIRIM_PER_KM;
}

/**
 * Validasi kuota open PO dan jumlah pesanan.
 */
export function validasiKuota(
  sisaKuota: number,
  jumlah: number,
  poDibuka: boolean
): { ok: true } | { ok: false; reason: string } {
  if (!poDibuka) {
    return { ok: false, reason: 'Open PO periode ini sudah ditutup' };
  }
  if (!Number.isFinite(jumlah) || jumlah <= 0) {
    return { ok: false, reason: 'Jumlah pesanan harus lebih dari 0' };
  }
  if (jumlah > sisaKuota) {
    return { ok: false, reason: `Sisa kuota tinggal ${sisaKuota} cup` };
  }
  return { ok: true };
}

/**
 * Menghitung jarak mock dari alamat atau nilai override debug panel.
 */
export function hitungJarakDariAlamat(
  alamat: string,
  debugJarakOverride?: number | null
): { ok: true; jarakKm: number } | { ok: false; reason: string } {
  const trimmed = alamat.trim();
  if (!trimmed) {
    return { ok: false, reason: 'Alamat tidak ditemukan. Masukkan alamat lengkap terlebih dahulu.' };
  }

  if (debugJarakOverride !== null && debugJarakOverride !== undefined) {
    if (!Number.isFinite(debugJarakOverride) || debugJarakOverride < 0) {
      return { ok: false, reason: 'Jarak pada alamat tidak valid' };
    }
    return { ok: true, jarakKm: debugJarakOverride };
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes('dekat toko') || lower.includes('dekat')) {
    return { ok: true, jarakKm: 1.5 };
  }
  if (lower.includes('tepat 2') || lower.includes('2.0 km') || lower.includes('2,0 km')) {
    return { ok: true, jarakKm: 2.0 };
  }
  if (lower.includes('jauh') || lower.includes('luar')) {
    return { ok: true, jarakKm: 20.0 };
  }
  if (lower.includes('melati')) {
    return { ok: true, jarakKm: 7.0 };
  }
  if (trimmed.length < 5) {
    return { ok: false, reason: 'Alamat tidak ditemukan. Tambahkan nama jalan dan nomor rumah.' };
  }

  return { ok: true, jarakKm: 7.0 };
}

/**
 * Validasi file bukti pembayaran (hanya JPG, PNG, PDF dan maksimal 2 MB).
 */
export function validasiFileBukti(file: {
  name: string;
  type: string;
  size: number;
}): { ok: true } | { ok: false; reason: string } {
  const lowerName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_BUKTI_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasAllowedMime = file.type ? ALLOWED_BUKTI_MIME_TYPES.includes(file.type) : hasAllowedExt;

  if (!hasAllowedExt || !hasAllowedMime) {
    return {
      ok: false,
      reason: 'Format file tidak didukung. Gunakan file JPG, PNG, atau PDF.',
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      reason: 'File bukti bayar kosong. Pilih file lain yang valid.',
    };
  }

  if (file.size > MAX_BUKTI_SIZE_BYTES) {
    return {
      ok: false,
      reason: 'Ukuran file melebihi 2 MB. Kompres atau pilih file lebih kecil.',
    };
  }

  return { ok: true };
}

/**
 * Validasi sebelum mengubah status pengiriman ke 'selesai'.
 */
export function validasiSelesaiPengiriman(
  metode: MetodeKirim,
  statusBaru: StatusKirim,
  nomorResi: string
): { ok: true } | { ok: false; reason: string } {
  if (metode === 'jasa_kirim' && statusBaru === 'selesai' && nomorResi.trim() === '') {
    return {
      ok: false,
      reason: 'Isi resi lebih dulu sebelum status selesai',
    };
  }
  return { ok: true };
}

export function validasiEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validasiNoHp(noHp: string): boolean {
  const digits = noHp.replace(/[^0-9]/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function mockHashPassword(password: string): string {
  let hash = 2166136261;
  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `sha256_mock_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function formatRupiah(nominal: number): string {
  const rounded = Math.round(nominal);
  const absFormatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return rounded < 0 ? `-Rp${absFormatted}` : `Rp${absFormatted}`;
}

export function formatKm(jarakKm: number): string {
  return `${jarakKm.toFixed(1).replace('.', ',')} km`;
}

const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatTanggalJam(epochMs: number): string {
  const d = new Date(epochMs);
  const tgl = d.getDate();
  const bln = BULAN_ID[d.getMonth()] ?? 'Des';
  const jam = String(d.getHours()).padStart(2, '0');
  const mnt = String(d.getMinutes()).padStart(2, '0');
  return `${tgl} ${bln} ${jam}:${mnt}`;
}

export function formatRentangTanggal(mulai: string, tutup: string): string {
  const d1 = new Date(`${mulai}T00:00:00`);
  const d2 = new Date(`${tutup}T00:00:00`);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
    return `${mulai} – ${tutup}`;
  }
  const t1 = d1.getDate();
  const b1 = BULAN_ID[d1.getMonth()];
  const t2 = d2.getDate();
  const b2 = BULAN_ID[d2.getMonth()];
  if (b1 === b2) {
    return `${t1}–${t2} ${b1}`;
  }
  return `${t1} ${b1}–${t2} ${b2}`;
}

export function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) {
    return '0 jam 0 menit';
  }
  const totalMinutes = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} jam ${minutes} menit`;
}
