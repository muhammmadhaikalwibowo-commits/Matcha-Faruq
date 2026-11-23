import React, { useState } from 'react';
import { Banknote, CheckCircle2, Clock, QrCode, XCircle } from 'lucide-react';
import { Banner } from '../components/Banner';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { formatRupiah, formatTanggalJam } from '../lib/rules';
import { useApp } from '../state/AppContext';

type PayFilter = 'semua' | 'qris' | 'cod';

export const AdminPaymentConfirmPage: React.FC = () => {
  const { openPO, pesanan, pembayaran, users } = useApp();
  const [filter, setFilter] = useState<PayFilter>('semua');
  const poOpen = openPO.status === 'buka';

  const sortedOrders = [...pesanan].sort((a, b) => b.waktuPesan - a.waktuPesan);

  const filteredList = sortedOrders.filter((order) => {
    const pay = pembayaran.find((p) => p.pesananId === order.id);
    if (!pay) return false;
    if (filter === 'qris') return pay.metodeBayar === 'qris';
    if (filter === 'cod') return pay.metodeBayar === 'cod';
    return true;
  });

  const qrisLunasCount = pembayaran.filter(
    (p) => p.metodeBayar === 'qris' && p.statusBayar === 'lunas'
  ).length;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar
        title="Pembayaran Otomatis"
        rightSlot={
          <Chip tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} />}>
            {qrisLunasCount} QRIS lunas
          </Chip>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-4 flex flex-col gap-3 phone-scroll">
        {!poOpen && (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO sedang TUTUP · Pembayaran QRIS/COD untuk pesanan yang sudah masuk tetap tercatat di sini.
          </Banner>
        )}

        <Banner tone="success" icon={<CheckCircle2 size={18} strokeWidth={2} />}>
          QRIS dinamis terverifikasi otomatis oleh sistem saat pembeli memindai. Penjual tidak perlu memeriksa bukti bayar manual lagi.
        </Banner>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          {(
            [
              { key: 'semua', label: 'Semua' },
              { key: 'qris', label: 'QRIS Dinamis' },
              { key: 'cod', label: 'COD' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#4A7C3A] text-white'
                    : 'bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] text-[#6B7866] dark:text-[#9FB098] hover:border-[#4A7C3A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Transaction log */}
        <div className="space-y-2.5">
          {filteredList.map((order) => {
            const pay = pembayaran.find((p) => p.pesananId === order.id);
            const buyer = users.find((u) => u.id === order.userId);
            if (!pay) return null;

            const isCod = pay.metodeBayar === 'cod';
            const isExpired = order.statusPesanan === 'kedaluwarsa';
            const isPaid = pay.statusBayar === 'lunas';

            return (
              <Card key={order.id} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
                      #{order.id} · {buyer?.nama ?? 'Pembeli'}
                    </p>
                    <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] mt-0.5 flex items-center gap-1.5">
                      {isCod ? <Banknote size={13} /> : <QrCode size={13} />}
                      <span>{isCod ? 'COD (Bayar di tempat)' : 'QRIS Dinamis'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatTanggalJam(order.waktuPesan)}</span>
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isExpired ? (
                      <Chip tone="failed" icon={<XCircle size={12} />}>
                        Kedaluwarsa
                      </Chip>
                    ) : isPaid ? (
                      <Chip tone="success" icon={<CheckCircle2 size={12} />}>
                        {isCod ? 'COD Lunas' : 'Lunas otomatis'}
                      </Chip>
                    ) : isCod ? (
                      <Chip tone="waiting" icon={<Banknote size={12} />}>
                        Tagih saat tiba
                      </Chip>
                    ) : (
                      <Chip tone="waiting" icon={<Clock size={12} />}>
                        Belum scan
                      </Chip>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DFE6D8] dark:border-[#2E3829] flex items-center justify-between text-[13px]">
                  <span className="text-[#6B7866] dark:text-[#9FB098]">
                    {isPaid
                      ? isCod
                        ? 'Tunai diterima kurir'
                        : 'Terverifikasi sistem QRIS'
                      : isCod
                        ? 'Tunai disiapkan pembeli'
                        : 'Menunggu pembayaran QRIS'}
                  </span>
                  <span className="font-extrabold text-[#2F5A24] dark:text-[#9ED588] tabular-nums">
                    {formatRupiah(order.totalBayar)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <TabBar mode="admin" />
    </div>
  );
};
