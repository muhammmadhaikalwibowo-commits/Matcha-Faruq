import React, { useState } from 'react';
import { AlertCircle, Bike, MapPin, Route, Truck, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Field, inputClassName } from '../components/Field';
import { TopBar } from '../components/TopBar';
import {
  RADIUS_KM,
  TARIF_KIRIM_PER_KM,
  formatKm,
  formatRupiah,
  hitungJarakDariAlamat,
  hitungOngkir,
  tentukanMetode,
  validasiKuota,
} from '../lib/rules';
import { useApp } from '../state/AppContext';

export const ShippingPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, produk, openPO, currentUser, debugJarakOverride, setDebugJarakOverride, createOrder } = useApp();

  const [alamat, setAlamat] = useState(
    () => currentUser?.alamatDefault || 'Jl. Melati No. 12, Kec. Menteng'
  );
  const [submitErr, setSubmitErr] = useState('');

  const enriched = cart
    .map((item) => {
      const prod = produk.find((p) => p.id === item.produkId);
      return prod ? { ...item, prod, subtotal: prod.harga * item.jumlah } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = enriched.reduce((sum, item) => sum + item.subtotal, 0);

  if (enriched.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <TopBar title="Pengiriman" showBack backTo="/keranjang" />
        <div className="p-5 space-y-4">
          <Banner tone="waiting">Keranjang kosong. Tambahkan produk sebelum memilih pengiriman.</Banner>
          <Button onClick={() => navigate('/')}>Kembali ke Katalog</Button>
        </div>
      </div>
    );
  }

  const jarakRes = hitungJarakDariAlamat(alamat, debugJarakOverride);
  let metode: ReturnType<typeof tentukanMetode> | null = null;
  let ongkir = 0;

  if (jarakRes.ok) {
    metode = tentukanMetode(jarakRes.jarakKm);
    if (metode !== 'di_luar_area') {
      ongkir = hitungOngkir(jarakRes.jarakKm);
    }
  }

  const totalCups = enriched.reduce((sum, item) => sum + item.jumlah, 0);
  const poOpen = openPO.status === 'buka';
  const kuotaCheck = validasiKuota(openPO.sisaKuota, totalCups, poOpen);
  const canPay = jarakRes.ok && metode !== null && metode !== 'di_luar_area' && poOpen && kuotaCheck.ok;
  const totalBayar = subtotal + ongkir;

  const handlePay = () => {
    setSubmitErr('');
    if (!canPay || !jarakRes.ok) {
      setSubmitErr('Perbaiki alamat agar berada dalam radius layanan 15 km.');
      return;
    }

    const res = createOrder(alamat, jarakRes.jarakKm);
    if (!res.ok) {
      setSubmitErr(res.reason);
      return;
    }

    navigate(`/bayar/${res.pesananId}`);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar title="Pengiriman" showBack backTo="/keranjang" />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-6 flex flex-col gap-3 phone-scroll">
        {!poOpen ? (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO sedang TUTUP. Pesanan baru tidak dapat dibuat saat open PO ditutup.
          </Banner>
        ) : !kuotaCheck.ok ? (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            {kuotaCheck.reason}
          </Banner>
        ) : null}
        <Field
          label="Alamat pengiriman"
          htmlFor="shipping-alamat"
          error={!jarakRes.ok ? jarakRes.reason : undefined}
        >
          <div className="relative">
            <MapPin
              size={18}
              strokeWidth={2}
              className="absolute left-3 top-3.5 text-[#4A7C3A] dark:text-[#9ED588]"
            />
            <textarea
              id="shipping-alamat"
              rows={3}
              value={alamat}
              placeholder="Masukkan alamat lengkap (contoh: Jl. Melati No. 12)"
              onChange={(e) => {
                setAlamat(e.target.value);
                setSubmitErr('');
              }}
              className={`${inputClassName(!jarakRes.ok)} pl-10 resize-none`}
            />
          </div>
        </Field>

        {/* Preset alamat urut: 1,5 km -> 7,0 km -> 20,0 km */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Dekat toko (1,5 km)', text: 'Gg. Kenanga No. 5, Dekat toko' },
            { label: 'Melati (7,0 km)', text: 'Jl. Melati No. 12, Kec. Menteng' },
            { label: 'Jauh (20,0 km)', text: 'Jl. Raya Jauh Luar Kota No. 99' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setDebugJarakOverride(null);
                setAlamat(preset.text);
                setSubmitErr('');
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] text-[11px] font-semibold text-[#6B7866] dark:text-[#9FB098] hover:border-[#4A7C3A] hover:text-[#2F5A24] dark:hover:text-[#9ED588] cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {jarakRes.ok && metode === 'di_luar_area' && (
          <Banner tone="failed" icon={<AlertCircle size={18} strokeWidth={2} />}>
            Jarak tercatat {formatKm(jarakRes.jarakKm)} melebihi batas layanan maksimal {RADIUS_KM} km.
            Mohon perbaiki alamat Anda sebelum melanjutkan pembayaran.
          </Banner>
        )}

        {jarakRes.ok && metode && metode !== 'di_luar_area' && (
          <Card className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1F2A1C] dark:text-[#E8EFE3]">
                <Route size={16} className="text-[#4A7C3A] dark:text-[#9ED588]" />
                <span>Jarak terhitung</span>
              </div>
              <span className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
                {formatKm(jarakRes.jarakKm)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-[#1F2A1C] dark:text-[#E8EFE3]">
                Metode kirim
              </span>
              {metode === 'antar_sendiri' ? (
                <Chip tone="success" icon={<Bike size={14} strokeWidth={2} />}>
                  Antar penjual
                </Chip>
              ) : (
                <Chip tone="info" icon={<Truck size={14} strokeWidth={2} />}>
                  Jasa kirim
                </Chip>
              )}
            </div>

            <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] leading-snug bg-[#F8FAF5] dark:bg-[#161A14] rounded-[10px] p-2.5 border border-[#DFE6D8] dark:border-[#2E3829]">
              {metode === 'antar_sendiri'
                ? `Alasan: jarak sampai 2 km, metode ditentukan sistem (antar penjual). Alamat dalam radius layanan ${RADIUS_KM} km.`
                : `Alasan: jarak di atas 2 km, metode ditentukan sistem. Alamat dalam radius layanan ${RADIUS_KM} km.`}
            </p>
          </Card>
        )}

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#6B7866] dark:text-[#9FB098]">Subtotal produk</span>
            <span className="font-semibold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
              {formatRupiah(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#6B7866] dark:text-[#9FB098]">
              {canPay && jarakRes.ok
                ? metode === 'antar_sendiri'
                  ? 'Ongkos kirim (tarif tetap ≤ 2 km)'
                  : `Ongkos kirim (${Math.round(jarakRes.jarakKm)} km × ${formatRupiah(TARIF_KIRIM_PER_KM)})`
                : 'Ongkos kirim'}
            </span>
            <span className="font-semibold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
              {canPay ? formatRupiah(ongkir) : '—'}
            </span>
          </div>

          <div className="border-t border-[#DFE6D8] dark:border-[#2E3829] pt-2 flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
              Total bayar
            </span>
            <span className="text-[18px] font-extrabold text-[#2F5A24] dark:text-[#9ED588] tabular-nums">
              {canPay ? formatRupiah(totalBayar) : formatRupiah(subtotal)}
            </span>
          </div>
        </Card>

        {submitErr && <Banner tone="failed">{submitErr}</Banner>}

        <div className="flex-1 min-h-2" />

        <Button
          onClick={handlePay}
          disabled={!canPay}
          disabledReason={
            !poOpen
              ? 'Open PO sedang tutup sehingga pesanan tidak dapat dibuat.'
              : !kuotaCheck.ok
                ? kuotaCheck.reason
                : !jarakRes.ok
                  ? 'Masukkan alamat lengkap agar jarak dapat dihitung.'
                  : metode === 'di_luar_area'
                    ? 'Perbaiki alamat agar berada di dalam radius layanan 15 km.'
                    : undefined
          }
        >
          {!poOpen ? 'Open PO sedang tutup' : 'Bayar'}
        </Button>
      </div>
    </div>
  );
};
