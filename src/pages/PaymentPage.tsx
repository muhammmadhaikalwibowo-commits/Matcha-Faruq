import React, { useEffect, useRef, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  QrCode,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { QrCodeBox } from '../components/QrCodeBox';
import { TopBar } from '../components/TopBar';
import { formatCountdown, formatRupiah } from '../lib/rules';
import { useApp } from '../state/AppContext';
import type { MetodeBayar } from '../types';

export const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    pesanan,
    pembayaran,
    pengiriman,
    currentUser,
    nowMs,
    payWithDynamicQris,
    confirmCodOrder,
  } = useApp();

  const order = pesanan.find((p) => p.id === id);
  const pay = pembayaran.find((p) => p.pesananId === id);
  const ship = pengiriman.find((s) => s.pesananId === id);

  const [paymentMethod, setPaymentMethod] = useState<MetodeBayar>(
    () => pay?.metodeBayar ?? 'qris'
  );
  const [qrNonce, setQrNonce] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!order || !pay) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <TopBar title="Pembayaran" showBack backTo="/riwayat" />
        <div className="p-5 space-y-4">
          <Banner tone="failed">Pesanan tidak ditemukan.</Banner>
          <Button onClick={() => navigate('/riwayat')}>Ke Riwayat Pesanan</Button>
        </div>
      </div>
    );
  }

  // NFR-04 ownership enforcement
  if (!currentUser || (order.userId !== currentUser.id && currentUser.peran !== 'admin')) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <TopBar title="Pembayaran" showBack backTo="/" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#F8D9D3] dark:bg-[#3D1B17] text-[#A3331F] dark:text-[#F29F94] flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-[18px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
            Akses ditolak
          </h2>
          <p className="text-[13px] text-[#6B7866] dark:text-[#9FB098]">
            Anda tidak memiliki izin untuk membuka halaman pembayaran milik pembeli lain.
          </p>
          <Button onClick={() => navigate('/')} fullWidth={false}>
            Kembali ke Katalog
          </Button>
        </div>
      </div>
    );
  }

  const remainingMs = pay.batasWaktu - nowMs;
  const isExpired = order.statusPesanan === 'kedaluwarsa' || remainingMs <= 0;
  const alreadyPaid = pay.statusBayar === 'lunas' || order.statusPesanan === 'lunas';

  const handleSimulateQrisPay = () => {
    if (isProcessing) return;
    setSubmitError('');
    setIsProcessing(true);

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const res = payWithDynamicQris(order.id);
      setIsProcessing(false);
      if (!res.ok) {
        setSubmitError(res.reason);
        return;
      }
      navigate('/riwayat');
    }, 450);
  };

  const handleConfirmCod = () => {
    setSubmitError('');
    const res = confirmCodOrder(order.id);
    if (!res.ok) {
      setSubmitError(res.reason);
      return;
    }
    navigate('/riwayat');
  };

  const qrPayload = `000201010212MATCHA-PO-${order.id}-AMT-${order.totalBayar}-V${qrNonce}`;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar title={`Bayar #${order.id}`} showBack backTo="/riwayat" />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-6 flex flex-col gap-3 phone-scroll">
        {/* Nominal */}
        <Card className="text-center py-4">
          <p className="text-[12px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
            Nominal yang harus dibayar
          </p>
          <p className="text-[30px] font-extrabold text-[#2F5A24] dark:text-[#9ED588] mt-1 tabular-nums leading-tight">
            {formatRupiah(order.totalBayar)}
          </p>
        </Card>

        {alreadyPaid ? (
          <>
            <Banner tone="success" icon={<CheckCircle2 size={18} strokeWidth={2} />}>
              Pembayaran pesanan #{order.id} sudah lunas dan terverifikasi otomatis oleh sistem.
            </Banner>
            <div className="flex-1 min-h-2" />
            <Button onClick={() => navigate('/riwayat')}>Lihat Riwayat Pesanan</Button>
          </>
        ) : (
          <>
            {/* Pilihan metode bayar: QRIS Dinamis atau COD */}
            <div>
              <p className="text-[12px] font-semibold text-[#1F2A1C] dark:text-[#E8EFE3] mb-1.5">
                Pilih metode pembayaran
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('qris');
                    setSubmitError('');
                  }}
                  className={`min-h-[46px] px-3 py-2.5 rounded-[12px] border text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'bg-[#E6F0DC] dark:bg-[#253720] border-[#4A7C3A] text-[#2F5A24] dark:text-[#A7DF94]'
                      : 'bg-white dark:bg-[#1F261C] border-[#DFE6D8] dark:border-[#2E3829] text-[#6B7866] dark:text-[#9FB098] hover:border-[#4A7C3A]'
                  }`}
                >
                  <QrCode size={16} />
                  QRIS Otomatis
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('cod');
                    setSubmitError('');
                  }}
                  className={`min-h-[46px] px-3 py-2.5 rounded-[12px] border text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-[#E6F0DC] dark:bg-[#253720] border-[#4A7C3A] text-[#2F5A24] dark:text-[#A7DF94]'
                      : 'bg-white dark:bg-[#1F261C] border-[#DFE6D8] dark:border-[#2E3829] text-[#6B7866] dark:text-[#9FB098] hover:border-[#4A7C3A]'
                  }`}
                >
                  <Banknote size={16} />
                  COD (Di Tempat)
                </button>
              </div>
            </div>

            {paymentMethod === 'qris' ? (
              <>
                {/* Dynamic Generated QR Box */}
                <Card className="text-center space-y-2.5 py-4">
                  <QrCodeBox value={qrPayload} />
                  <div className="space-y-1">
                    <p className="text-[12px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                      QRIS Dinamis · #{order.id} (v{qrNonce})
                    </p>
                    <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
                      Nominal {formatRupiah(order.totalBayar)} otomatis terisi saat dipindai
                    </p>
                  </div>
                  {!isExpired && (
                    <button
                      type="button"
                      onClick={() => setQrNonce((n) => n + 1)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8FAF5] dark:bg-[#161A14] border border-[#DFE6D8] dark:border-[#2E3829] text-[12px] font-semibold text-[#4A7C3A] dark:text-[#9ED588] hover:border-[#4A7C3A] cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      Buat ulang QR
                    </button>
                  )}
                </Card>

                {isExpired ? (
                  <Banner tone="failed" icon={<Clock size={18} strokeWidth={2} />}>
                    Batas waktu pembayaran 24 jam sudah lewat. Pesanan kedaluwarsa dan kuota dikembalikan.
                  </Banner>
                ) : (
                  <>
                    <Banner tone="waiting" icon={<Clock size={18} strokeWidth={2} />}>
                      Batas waktu bayar:{' '}
                      <span className="tabular-nums">{formatCountdown(remainingMs)}</span>
                    </Banner>

                    <Banner tone="success" icon={<CheckCircle2 size={18} strokeWidth={2} />}>
                      Terverifikasi otomatis oleh sistem. Pembeli tidak perlu unggah bukti dan penjual tidak perlu cek manual.
                    </Banner>
                  </>
                )}

                {submitError && <Banner tone="failed">{submitError}</Banner>}

                <div className="flex-1 min-h-2" />

                <Button
                  onClick={handleSimulateQrisPay}
                  disabled={isExpired || isProcessing}
                  disabledReason={
                    isExpired
                      ? 'QRIS kedaluwarsa karena batas waktu 24 jam telah berakhir.'
                      : undefined
                  }
                >
                  <Sparkles size={17} />
                  {isProcessing ? 'Memverifikasi pembayaran...' : 'Simulasikan scan & bayar QRIS'}
                </Button>
              </>
            ) : (
              <>
                <Banner tone="info" icon={<Banknote size={18} strokeWidth={2} />}>
                  Bayar tunai di tempat (COD) saat pesanan tiba. Tidak perlu pembayaran QRIS sekarang.
                </Banner>

                <Card className="space-y-2.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B7866] dark:text-[#9FB098]">Penerima</span>
                    <span className="font-semibold text-[#1F2A1C] dark:text-[#E8EFE3]">
                      {currentUser.nama} · {currentUser.noHp}
                    </span>
                  </div>
                  {ship && (
                    <div className="flex items-start justify-between gap-3 text-[13px]">
                      <span className="text-[#6B7866] dark:text-[#9FB098] shrink-0">Alamat</span>
                      <span className="font-medium text-[#1F2A1C] dark:text-[#E8EFE3] text-right">
                        {ship.alamat}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-[#DFE6D8] dark:border-[#2E3829] pt-2 flex items-center justify-between text-[13px]">
                    <span className="text-[#6B7866] dark:text-[#9FB098]">Uang tunai disiapkan</span>
                    <span className="text-[16px] font-extrabold text-[#2F5A24] dark:text-[#9ED588] tabular-nums">
                      {formatRupiah(order.totalBayar)}
                    </span>
                  </div>
                </Card>

                {isExpired && (
                  <Banner tone="failed" icon={<Clock size={18} strokeWidth={2} />}>
                    Batas waktu konfirmasi 24 jam sudah lewat. Pesanan kedaluwarsa.
                  </Banner>
                )}

                {submitError && <Banner tone="failed">{submitError}</Banner>}

                <div className="flex-1 min-h-2" />

                <Button
                  onClick={handleConfirmCod}
                  disabled={isExpired}
                  disabledReason={
                    isExpired
                      ? 'Konfirmasi COD dinonaktifkan karena batas waktu 24 jam telah berakhir.'
                      : undefined
                  }
                >
                  <CheckCircle2 size={17} />
                  Konfirmasi pesanan COD
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
