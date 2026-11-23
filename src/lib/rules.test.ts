import { describe, expect, it } from 'vitest';
import {
  hitungOngkir,
  tentukanMetode,
  validasiFileBukti,
  validasiKuota,
  validasiSelesaiPengiriman,
} from './rules';

describe('MATCHA business rules', () => {
  describe('tentukanMetode & hitungOngkir', () => {
    it('1.5 km -> antar_sendiri, Rp5.000', () => {
      expect(tentukanMetode(1.5)).toBe('antar_sendiri');
      expect(hitungOngkir(1.5)).toBe(5000);
    });

    it('tepat 2.0 km -> masih antar_sendiri, Rp5.000', () => {
      expect(tentukanMetode(2.0)).toBe('antar_sendiri');
      expect(hitungOngkir(2.0)).toBe(5000);
    });

    it('2.01 km -> jasa_kirim, Rp6.000 (dibulatkan 2 * 3000)', () => {
      expect(tentukanMetode(2.01)).toBe('jasa_kirim');
      expect(hitungOngkir(2.01)).toBe(6000);
    });

    it('7 km -> jasa_kirim, Rp21.000', () => {
      expect(tentukanMetode(7)).toBe('jasa_kirim');
      expect(hitungOngkir(7)).toBe(21000);
    });

    it('20 km -> di_luar_area dan hitungOngkir throw', () => {
      expect(tentukanMetode(20)).toBe('di_luar_area');
      expect(() => hitungOngkir(20)).toThrow();
    });

    it('-1 km -> throw invalid distance', () => {
      expect(() => tentukanMetode(-1)).toThrow();
      expect(() => hitungOngkir(-1)).toThrow();
    });
  });

  describe('validasiKuota', () => {
    it('kuota 3 vs pesan 5 -> ditolak dengan sisa kuota nyata', () => {
      const res = validasiKuota(3, 5, true);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.reason).toContain('3');
      }
    });

    it('open PO tutup -> ditolak', () => {
      const res = validasiKuota(10, 2, false);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.reason.toLowerCase()).toContain('ditutup');
      }
    });

    it('jumlah 0 dan -2 -> ditolak', () => {
      expect(validasiKuota(10, 0, true).ok).toBe(false);
      expect(validasiKuota(10, -2, true).ok).toBe(false);
    });

    it('jumlah valid dalam kuota -> ok', () => {
      expect(validasiKuota(3, 3, true)).toEqual({ ok: true });
    });
  });

  describe('validasiFileBukti & validasiSelesaiPengiriman', () => {
    it('menolak file melebihi 2 MB atau format salah', () => {
      expect(
        validasiFileBukti({ name: 'bukti.exe', type: 'application/octet-stream', size: 1024 }).ok
      ).toBe(false);
      expect(
        validasiFileBukti({ name: 'bukti.png', type: 'image/png', size: 3 * 1024 * 1024 }).ok
      ).toBe(false);
      expect(
        validasiFileBukti({ name: 'bukti.jpg', type: 'image/jpeg', size: 450 * 1024 }).ok
      ).toBe(true);
    });

    it('menolak selesai pada jasa kirim tanpa nomor resi', () => {
      const res = validasiSelesaiPengiriman('jasa_kirim', 'selesai', '');
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.reason).toBe('Isi resi lebih dulu sebelum status selesai');
      }
      expect(validasiSelesaiPengiriman('jasa_kirim', 'selesai', 'JNE12345').ok).toBe(true);
      expect(validasiSelesaiPengiriman('antar_sendiri', 'selesai', '').ok).toBe(true);
    });
  });
});
