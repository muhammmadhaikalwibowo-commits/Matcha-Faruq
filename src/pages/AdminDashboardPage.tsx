import React from 'react';
import {
  BadgeCheck,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { ProgressBar } from '../components/ProgressBar';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { formatRentangTanggal } from '../lib/rules';
import { useApp } from '../state/AppContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { openPO, pesanan, pembayaran, nowMs } = useApp();

  const poOpen = openPO.status === 'buka';
  const rentang = formatRentangTanggal(openPO.tanggalMulai, openPO.tanggalTutup);

  const startOfDay = new Date(nowMs);
  startOfDay.setHours(0, 0, 0, 0);
  const pesananHariIni = pesanan.filter(
    (p) => p.waktuPesan >= startOfDay.getTime() && p.statusPesanan !== 'kedaluwarsa'
  ).length;

  const qrisLunasOtomatis = pembayaran.filter(
    (p) => p.metodeBayar === 'qris' && p.statusBayar === 'lunas'
  ).length;

  const siapKirim = pesanan.filter(
    (p) => p.statusPesanan === 'lunas' || p.statusPesanan === 'diproses'
  ).length;

  const kuotaTerpakai = Math.max(0, openPO.kuota - openPO.sisaKuota);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar
        title="Dashboard Toko"
        showLogout
        rightSlot={
          poOpen ? (
            <Chip tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} />}>
              PO Buka
            </Chip>
          ) : (
            <Chip tone="failed" icon={<XCircle size={12} strokeWidth={2} />}>
              PO Tutup
            </Chip>
          )
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-4 space-y-3 phone-scroll">
        {!poOpen ? (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO sedang DITUTUP. Pembeli melihat status tutup dan tidak bisa memesan.
          </Banner>
        ) : openPO.sisaKuota <= 0 ? (
          <Banner tone="waiting" icon={<CalendarRange size={18} strokeWidth={2} />}>
            Kuota Open PO periode {rentang} sudah habis ({openPO.kuota} cup terpakai).
          </Banner>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-[12px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
              Pesanan hari ini
            </p>
            <p className="text-[24px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] mt-1 tabular-nums">
              {pesananHariIni}
            </p>
          </Card>

          <Card>
            <p className="text-[12px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
              QRIS lunas otomatis
            </p>
            <p className="text-[24px] font-bold text-[#2F5A24] dark:text-[#9ED588] mt-1 tabular-nums">
              {qrisLunasOtomatis}
            </p>
          </Card>

          <Card>
            <p className="text-[12px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
              Siap kirim
            </p>
            <p className="text-[24px] font-bold text-[#2F5A24] dark:text-[#9ED588] mt-1 tabular-nums">
              {siapKirim}
            </p>
          </Card>

          <Card>
            <p className="text-[12px] font-semibold text-[#6B7866] dark:text-[#9FB098]">
              Sisa kuota
            </p>
            <p className="text-[24px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] mt-1 tabular-nums">
              {openPO.sisaKuota}/{openPO.kuota}
            </p>
          </Card>
        </div>

        <Card onClick={() => navigate('/admin/open-po')} className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                Open PO &amp; Kuota
              </h2>
              <Chip tone={poOpen ? 'success' : 'failed'}>
                {poOpen ? 'Buka' : 'Tutup'}
              </Chip>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-[12px] font-semibold text-[#6B7866] dark:text-[#9FB098] tabular-nums">
              <span>
                {kuotaTerpakai}/{openPO.kuota} cup · {rentang}
              </span>
              <ChevronRight size={16} />
            </div>
          </div>
          <ProgressBar value={kuotaTerpakai} max={openPO.kuota} />
        </Card>

        <Card onClick={() => navigate('/admin/bayar')}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-[12px] bg-[#E6F0DC] dark:bg-[#253720] text-[#2F5A24] dark:text-[#9ED588] flex items-center justify-center shrink-0">
                <BadgeCheck size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                  Pembayaran QRIS &amp; COD
                </h2>
                <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] truncate">
                  QRIS diverifikasi otomatis oleh sistem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Chip tone="success" icon={<CheckCircle2 size={12} />}>
                Otomatis
              </Chip>
              <ChevronRight size={18} className="text-[#6B7866] dark:text-[#9FB098]" />
            </div>
          </div>
        </Card>
      </div>

      <TabBar mode="admin" />
    </div>
  );
};
