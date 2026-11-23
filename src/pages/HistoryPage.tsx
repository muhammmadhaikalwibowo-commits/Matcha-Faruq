import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Receipt,
  Truck,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip, type ChipTone } from '../components/Chip';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { formatRupiah, formatTanggalJam } from '../lib/rules';
import { useApp } from '../state/AppContext';
import type { MetodeBayar, StatusPesanan } from '../types';

function getStatusMeta(status: StatusPesanan, metodeBayar: MetodeBayar): {
  label: string;
  tone: ChipTone;
  icon: React.ReactNode;
} {
  switch (status) {
    case 'menunggu_pembayaran':
      return {
        label: 'Belum bayar',
        tone: 'waiting',
        icon: <Clock size={12} strokeWidth={2} />,
      };
    case 'menunggu_konfirmasi':
      return {
        label: 'Menunggu',
        tone: 'waiting',
        icon: <Clock size={12} strokeWidth={2} />,
      };
    case 'lunas':
      return {
        label: 'Lunas',
        tone: 'success',
        icon: <CheckCircle2 size={12} strokeWidth={2} />,
      };
    case 'diproses':
      return metodeBayar === 'cod'
        ? {
            label: 'COD · Diproses',
            tone: 'waiting',
            icon: <Banknote size={12} strokeWidth={2} />,
          }
        : {
            label: 'Lunas',
            tone: 'success',
            icon: <CheckCircle2 size={12} strokeWidth={2} />,
          };
    case 'dikirim':
      return {
        label: metodeBayar === 'cod' ? 'COD · Dikirim' : 'Dikirim',
        tone: 'info',
        icon: <Truck size={12} strokeWidth={2} />,
      };
    case 'diterima':
      return {
        label: 'Diterima',
        tone: 'success',
        icon: <CheckCircle2 size={12} strokeWidth={2} />,
      };
    case 'ditolak':
    case 'kedaluwarsa':
      return {
        label: 'Kedaluwarsa',
        tone: 'failed',
        icon: <XCircle size={12} strokeWidth={2} />,
      };
  }
}

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    openPO,
    pesanan,
    detailPesanan,
    pembayaran,
    pengiriman,
  } = useApp();

  const [expandedId, setExpandedId] = useState<string | null>('MT-0142');

  if (!currentUser) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <TopBar title="Riwayat Pesanan" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <Receipt size={32} className="text-[#4A7C3A] dark:text-[#9ED588]" />
          <p className="text-[14px] text-[#6B7866] dark:text-[#9FB098]">
            Masuk terlebih dahulu untuk melihat riwayat pesanan Anda.
          </p>
          <Button onClick={() => navigate('/masuk')}>Masuk</Button>
        </div>
        <TabBar mode="pembeli" />
      </div>
    );
  }

  const myOrders = pesanan
    .filter((o) => o.userId === currentUser.id)
    .sort((a, b) => b.waktuPesan - a.waktuPesan);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar title="Riwayat Pesanan" showBell showLogout />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-4 space-y-3 phone-scroll">
        {openPO.status === 'tutup' && (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO saat ini berstatus TUTUP · Pesanan yang sudah dibuat tetap diproses hingga selesai.
          </Banner>
        )}
        {myOrders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-[14px] text-[#6B7866] dark:text-[#9FB098]">
              Belum ada pesanan di open PO ini.
            </p>
            <Button onClick={() => navigate('/')}>Mulai Pesan</Button>
          </div>
        ) : (
          myOrders.map((order) => {
            const items = detailPesanan.filter((d) => d.pesananId === order.id);
            const pay = pembayaran.find((p) => p.pesananId === order.id);
            const ship = pengiriman.find((s) => s.pesananId === order.id);
            const isCod = pay?.metodeBayar === 'cod';
            const meta = getStatusMeta(order.statusPesanan, pay?.metodeBayar ?? 'qris');
            const isOpen = expandedId === order.id;

            const stepPaid =
              order.statusPesanan === 'lunas' ||
              order.statusPesanan === 'diproses' ||
              order.statusPesanan === 'dikirim' ||
              order.statusPesanan === 'diterima';
            const stepShipped =
              order.statusPesanan === 'dikirim' || order.statusPesanan === 'diterima';
            const stepDone = order.statusPesanan === 'diterima';

            const steps = [
              { label: 'Pesanan dibuat', done: true, detail: formatTanggalJam(order.waktuPesan) },
              {
                label: isCod ? 'Metode COD dipilih' : 'QRIS dinamis dibuat',
                done: true,
                detail: pay?.waktuUnggah
                  ? formatTanggalJam(pay.waktuUnggah)
                  : order.statusPesanan === 'kedaluwarsa'
                    ? 'Kedaluwarsa'
                    : 'Siap dibayar',
              },
              {
                label: isCod
                  ? 'Diproses penjual (Bayar di tempat)'
                  : 'Terverifikasi otomatis sistem',
                done: stepPaid,
                detail: isCod
                  ? stepDone
                    ? 'Tunai lunas diterima'
                    : 'Bayar tunai saat tiba'
                  : stepPaid
                    ? 'Lunas otomatis'
                    : order.statusPesanan === 'kedaluwarsa'
                      ? 'Lewat batas 24 jam'
                      : 'Menunggu scan QRIS',
              },
              {
                label: ship?.nomorResi ? `Dikirim · Resi ${ship.nomorResi}` : 'Dikirim',
                done: stepShipped,
                detail:
                  ship?.metode === 'antar_sendiri' ? 'Diantar penjual' : 'Jasa kirim',
              },
              {
                label: 'Diterima pembeli',
                done: stepDone,
                detail: stepDone ? 'Selesai' : 'Belum selesai',
              },
            ];

            return (
              <Card key={order.id} className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : order.id)}
                  className="w-full text-left flex items-start justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
                        #{order.id}
                      </span>
                      <span className="text-[12px] text-[#6B7866] dark:text-[#9FB098] tabular-nums">
                        {formatTanggalJam(order.waktuPesan)}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] mt-0.5 truncate">
                      {items.map((i) => `${i.jumlah}× ${i.namaProduk}`).join(', ')}
                    </p>
                    <p className="text-[15px] font-extrabold text-[#2F5A24] dark:text-[#9ED588] mt-1 tabular-nums">
                      {formatRupiah(order.totalBayar)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Chip tone={meta.tone} icon={meta.icon}>
                      {meta.label}
                    </Chip>
                    <span className="text-[#6B7866] dark:text-[#9FB098]">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </button>

                {order.statusPesanan === 'menunggu_pembayaran' && (
                  <Button onClick={() => navigate(`/bayar/${order.id}`)}>
                    Bayar sekarang (QRIS / COD)
                  </Button>
                )}

                {isOpen && (
                  <div className="pt-2 border-t border-[#DFE6D8] dark:border-[#2E3829] space-y-2">
                    {steps.map((st, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span
                          className={`w-[8px] h-[8px] rounded-full mt-1.5 shrink-0 ${
                            st.done ? 'bg-[#4A7C3A]' : 'bg-[#C9D1C3] dark:bg-[#2E3829]'
                          }`}
                        />
                        <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
                          <span
                            className={`text-[12px] ${
                              st.done
                                ? 'font-semibold text-[#1F2A1C] dark:text-[#E8EFE3]'
                                : 'text-[#6B7866] dark:text-[#9FB098]'
                            }`}
                          >
                            {st.label}
                          </span>
                          <span className="text-[11px] text-[#6B7866] dark:text-[#9FB098] shrink-0 tabular-nums">
                            {st.detail}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <TabBar mode="pembeli" />
    </div>
  );
};
