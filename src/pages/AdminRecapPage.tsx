import React, { useState } from 'react';
import { CheckCircle2, Download, FileText, XCircle } from 'lucide-react';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { exportRekapCSV, exportRekapPDF, type RekapRow } from '../lib/export';
import { formatRupiah } from '../lib/rules';
import { useApp } from '../state/AppContext';
import type { StatusPesanan } from '../types';

type FilterTab = 'lunas' | 'menunggu' | 'ditolak';

function matchesFilter(status: StatusPesanan, filter: FilterTab): boolean {
  if (filter === 'lunas') {
    return (
      status === 'lunas' ||
      status === 'diproses' ||
      status === 'dikirim' ||
      status === 'diterima'
    );
  }
  if (filter === 'menunggu') {
    return status === 'menunggu_pembayaran' || status === 'menunggu_konfirmasi';
  }
  return status === 'ditolak' || status === 'kedaluwarsa';
}

function shortBuyerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  return `${parts[0]} ${parts[1][0]}.`;
}

export const AdminRecapPage: React.FC = () => {
  const { openPO, pesanan, detailPesanan, pembayaran, users } = useApp();
  const [filter, setFilter] = useState<FilterTab>('lunas');
  const [exportNotice, setExportNotice] = useState<string>('');
  const poOpen = openPO.status === 'buka';

  const filteredOrders = pesanan
    .filter((o) => matchesFilter(o.statusPesanan, filter))
    .sort((a, b) => b.waktuPesan - a.waktuPesan);

  const lunasOrders = pesanan.filter((o) => matchesFilter(o.statusPesanan, 'lunas'));
  const lunasTotalSum = lunasOrders.reduce((s, o) => s + o.totalBayar, 0);

  const rows: RekapRow[] = filteredOrders.map((order, idx) => {
    const buyer = users.find((u) => u.id === order.userId);
    const items = detailPesanan.filter((d) => d.pesananId === order.id);
    const pay = pembayaran.find((p) => p.pesananId === order.id);
    const itemCount = items.reduce((s, d) => s + d.jumlah, 0);
    const itemRingkas = `${itemCount} cup (${items.map((i) => i.namaProduk.split(' ')[0]).join('+')})`;
    return {
      no: idx + 1,
      pesananId: order.id,
      pembeli: buyer ? shortBuyerName(buyer.nama) : 'Pembeli',
      itemRingkas,
      total: order.totalBayar,
      statusLabel: pay?.metodeBayar === 'cod' ? `${order.statusPesanan} (COD)` : order.statusPesanan,
    };
  });

  const lunasRows: RekapRow[] = lunasOrders.map((order, idx) => {
    const buyer = users.find((u) => u.id === order.userId);
    const items = detailPesanan.filter((d) => d.pesananId === order.id);
    const pay = pembayaran.find((p) => p.pesananId === order.id);
    const itemCount = items.reduce((s, d) => s + d.jumlah, 0);
    return {
      no: idx + 1,
      pesananId: order.id,
      pembeli: buyer ? shortBuyerName(buyer.nama) : 'Pembeli',
      itemRingkas: `${itemCount} item`,
      total: order.totalBayar,
      statusLabel: pay?.metodeBayar === 'cod' ? 'COD' : 'Lunas',
    };
  });

  const displayedTotalSum = filteredOrders.reduce((s, o) => s + o.totalBayar, 0);
  const summaryText = `${lunasOrders.length} pesanan lunas/aktif · ${formatRupiah(lunasTotalSum)}`;

  const handleExportCSV = () => {
    const targetRows = filter === 'lunas' ? lunasRows : rows;
    exportRekapCSV(targetRows, `rekap-matcha-${filter}.csv`);
    setExportNotice(`CSV diunduh (${targetRows.length} baris pesanan ${filter}).`);
  };

  const handleExportPDF = () => {
    const targetRows = filter === 'lunas' ? lunasRows : rows;
    exportRekapPDF(targetRows, summaryText, `rekap-matcha-${filter}.pdf`);
    setExportNotice(`PDF diunduh (${targetRows.length} baris pesanan ${filter}).`);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar
        title="Rekap Pesanan"
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

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-4 flex flex-col gap-3 phone-scroll">
        {!poOpen && (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO periode ini berstatus TUTUP. Rekap pesanan periode berjalan tetap dapat diekspor.
          </Banner>
        )}
        <div className="flex items-center gap-2">
          {(
            [
              { key: 'lunas', label: 'Lunas' },
              { key: 'menunggu', label: 'Menunggu' },
              { key: 'ditolak', label: 'Kedaluwarsa' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setFilter(tab.key);
                  setExportNotice('');
                }}
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

        <Banner tone="success">{summaryText}</Banner>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-[#DFE6D8] dark:border-[#2E3829] text-[#6B7866] dark:text-[#9FB098] bg-[#F8FAF5] dark:bg-[#161A14]">
                  <th className="py-2.5 pl-3 pr-2 font-semibold">No</th>
                  <th className="py-2.5 px-2 font-semibold">Pembeli</th>
                  <th className="py-2.5 px-2 font-semibold">Item</th>
                  <th className="py-2.5 pl-2 pr-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#6B7866] dark:text-[#9FB098]">
                      Tidak ada pesanan pada filter ini.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.pesananId}
                      className="border-b border-[#DFE6D8] dark:border-[#2E3829] last:border-b-0 text-[#1F2A1C] dark:text-[#E8EFE3]"
                    >
                      <td className="py-2.5 pl-3 pr-2 tabular-nums text-[#6B7866] dark:text-[#9FB098]">
                        {row.no}
                      </td>
                      <td className="py-2.5 px-2 font-semibold">
                        <div>{row.pembeli}</div>
                        <div className="text-[10px] text-[#6B7866] dark:text-[#9FB098] tabular-nums">
                          #{row.pesananId}
                          {row.statusLabel.includes('COD') ? ' · COD' : ''}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-[#6B7866] dark:text-[#9FB098]">
                        {row.itemRingkas}
                      </td>
                      <td className="py-2.5 pl-2 pr-3 text-right font-bold text-[#2F5A24] dark:text-[#9ED588] tabular-nums">
                        {formatRupiah(row.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {rows.length > 0 && filter !== 'lunas' && (
            <div className="px-3 py-2 bg-[#F8FAF5] dark:bg-[#161A14] border-t border-[#DFE6D8] dark:border-[#2E3829] flex justify-between text-[12px] font-bold">
              <span className="text-[#6B7866] dark:text-[#9FB098]">
                Total ({rows.length} pesanan)
              </span>
              <span className="text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
                {formatRupiah(displayedTotalSum)}
              </span>
            </div>
          )}
        </Card>

        {exportNotice && <Banner tone="info">{exportNotice}</Banner>}

        <div className="flex-1 min-h-2" />

        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download size={16} />
            Ekspor CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <FileText size={16} />
            Ekspor PDF
          </Button>
        </div>
      </div>

      <TabBar mode="admin" />
    </div>
  );
};
