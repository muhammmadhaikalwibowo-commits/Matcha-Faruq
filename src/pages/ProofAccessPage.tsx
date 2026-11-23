import React from 'react';
import { CheckCircle2, QrCode, ShieldAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { TopBar } from '../components/TopBar';
import { formatRupiah } from '../lib/rules';
import { useApp } from '../state/AppContext';

export const ProofAccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, pesanan, pembayaran } = useApp();

  const order = pesanan.find((p) => p.id === id);
  const pay = pembayaran.find((p) => p.pesananId === id);

  if (!order || !pay) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <TopBar title="Detail Transaksi" showBack />
        <div className="p-5 space-y-4">
          <Banner tone="failed">Data transaksi pembayaran tidak ditemukan.</Banner>
          <Button onClick={() => navigate('/')}>Kembali</Button>
        </div>
      </div>
    );
  }

  const isAllowed =
    Boolean(currentUser) &&
    (currentUser!.id === order.userId || currentUser!.peran === 'admin');

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar title={`Transaksi #${order.id}`} showBack />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-6 flex flex-col phone-scroll">
        {!isAllowed ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
            <div className="w-16 h-16 rounded-full bg-[#F8D9D3] dark:bg-[#3D1B17] text-[#A3331F] dark:text-[#F29F94] flex items-center justify-center">
              <ShieldAlert size={30} />
            </div>
            <h2 className="text-[20px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
              Akses ditolak
            </h2>
            <p className="text-[13px] text-[#6B7866] dark:text-[#9FB098] leading-relaxed max-w-[280px]">
              Detail pembayaran pesanan #{order.id} hanya dapat diakses oleh pemilik pesanan atau admin toko (NFR-04).
            </p>
            <div className="w-full pt-2">
              <Button onClick={() => navigate('/')}>Kembali ke Katalog</Button>
            </div>
          </div>
        ) : (
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                #{order.id} · {pay.metodeBayar === 'cod' ? 'COD' : 'QRIS Dinamis'}
              </p>
              <Chip
                tone={pay.statusBayar === 'lunas' ? 'success' : 'waiting'}
                icon={pay.statusBayar === 'lunas' ? <CheckCircle2 size={12} /> : <QrCode size={12} />}
              >
                {pay.statusBayar === 'lunas' ? 'Lunas otomatis' : 'Menunggu'}
              </Chip>
            </div>
            {pay.buktiUrl ? (
              <img
                src={pay.buktiUrl}
                alt={`Bukti transaksi ${order.id}`}
                className="w-full rounded-[12px] border border-[#DFE6D8] dark:border-[#2E3829]"
              />
            ) : (
              <Banner tone="info">
                Transaksi menggunakan {pay.metodeBayar === 'cod' ? 'COD (Bayar di tempat)' : 'QRIS Dinamis otomatis'}.
              </Banner>
            )}
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B7866] dark:text-[#9FB098]">Total tagihan</span>
              <span className="font-bold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
                {formatRupiah(order.totalBayar)}
              </span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
