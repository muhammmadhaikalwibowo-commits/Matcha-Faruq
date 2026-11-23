import React, { useState } from 'react';
import { Banknote, Bike, CheckCircle2, ChevronDown, Truck, XCircle } from 'lucide-react';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Field, inputClassName } from '../components/Field';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { formatKm, formatRupiah } from '../lib/rules';
import { useApp } from '../state/AppContext';
import type { StatusKirim } from '../types';

export const AdminDeliveryPage: React.FC = () => {
  const { openPO, pesanan, pengiriman, pembayaran, users, updateDelivery } = useApp();
  const poOpen = openPO.status === 'buka';

  const paidOrders = pesanan
    .filter(
      (o) =>
        o.statusPesanan === 'lunas' ||
        o.statusPesanan === 'diproses' ||
        o.statusPesanan === 'dikirim' ||
        o.statusPesanan === 'diterima'
    )
    .sort((a, b) => b.waktuPesan - a.waktuPesan);

  const [draftResi, setDraftResi] = useState<Record<string, string>>({});
  const [draftStatus, setDraftStatus] = useState<Record<string, StatusKirim>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [cardSuccess, setCardSuccess] = useState<Record<string, string>>({});

  const handleSave = (pesananId: string) => {
    const ship = pengiriman.find((s) => s.pesananId === pesananId);
    if (!ship) return;

    const resiVal = draftResi[pesananId] ?? ship.nomorResi;
    const statusVal = draftStatus[pesananId] ?? ship.statusKirim;

    const res = updateDelivery(pesananId, resiVal, statusVal);
    if (!res.ok) {
      setCardErrors((prev) => ({ ...prev, [pesananId]: res.reason }));
      setCardSuccess((prev) => ({ ...prev, [pesananId]: '' }));
      return;
    }

    setCardErrors((prev) => ({ ...prev, [pesananId]: '' }));
    setCardSuccess((prev) => ({
      ...prev,
      [pesananId]: `Pengiriman #${pesananId} diperbarui (${statusVal}).`,
    }));
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar
        title="Kelola Pengiriman"
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
        {!poOpen && (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO sedang TUTUP · Pesanan yang sudah lunas/COD tetap dapat dikirim.
          </Banner>
        )}
        {paidOrders.length === 0 ? (
          <Banner tone="info">Belum ada pesanan siap kirim saat ini.</Banner>
        ) : (
          paidOrders.map((order) => {
            const ship = pengiriman.find((s) => s.pesananId === order.id);
            const pay = pembayaran.find((p) => p.pesananId === order.id);
            const buyer = users.find((u) => u.id === order.userId);
            if (!ship) return null;

            const isCod = pay?.metodeBayar === 'cod';
            const currentResi = draftResi[order.id] ?? ship.nomorResi;
            const currentStatus = draftStatus[order.id] ?? ship.statusKirim;
            const errMsg = cardErrors[order.id] ?? '';
            const okMsg = cardSuccess[order.id] ?? '';

            return (
              <Card key={order.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] tabular-nums">
                      #{order.id} · {buyer?.nama ?? 'Pembeli'}
                    </p>
                    <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] mt-0.5 leading-snug">
                      {ship.alamat} ({formatKm(ship.jarakKm)})
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {ship.metode === 'antar_sendiri' ? (
                      <Chip tone="success" icon={<Bike size={13} />}>
                        Antar penjual
                      </Chip>
                    ) : (
                      <Chip tone="info" icon={<Truck size={13} />}>
                        Jasa kirim
                      </Chip>
                    )}
                    {isCod && (
                      <Chip tone="waiting" icon={<Banknote size={12} />}>
                        COD {formatRupiah(order.totalBayar)}
                      </Chip>
                    )}
                  </div>
                </div>

                {ship.metode === 'jasa_kirim' && (
                  <Field
                    label="Nomor resi (wajib sebelum selesai)"
                    htmlFor={`resi-${order.id}`}
                    error={errMsg || undefined}
                  >
                    <input
                      id={`resi-${order.id}`}
                      type="text"
                      placeholder="Contoh: JNE123456789"
                      value={currentResi}
                      onChange={(e) => {
                        setDraftResi((p) => ({ ...p, [order.id]: e.target.value }));
                        if (errMsg) setCardErrors((p) => ({ ...p, [order.id]: '' }));
                      }}
                      className={inputClassName(Boolean(errMsg))}
                    />
                  </Field>
                )}

                <div className="grid grid-cols-2 gap-2.5 items-end">
                  <Field label="Status kirim" htmlFor={`status-${order.id}`}>
                    <div className="relative">
                      <select
                        id={`status-${order.id}`}
                        value={currentStatus}
                        onChange={(e) => {
                          setDraftStatus((p) => ({
                            ...p,
                            [order.id]: e.target.value as StatusKirim,
                          }));
                          if (errMsg) setCardErrors((p) => ({ ...p, [order.id]: '' }));
                        }}
                        className={`${inputClassName()} appearance-none pr-9 cursor-pointer`}
                      >
                        <option value="diproses">Diproses</option>
                        <option value="dikirim">Dikirim</option>
                        <option value="selesai">Selesai</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7866] dark:text-[#9FB098] pointer-events-none"
                      />
                    </div>
                  </Field>

                  <Button onClick={() => handleSave(order.id)}>Simpan</Button>
                </div>

                {ship.metode === 'antar_sendiri' && errMsg && (
                  <Banner tone="failed">{errMsg}</Banner>
                )}

                {okMsg && <Banner tone="success">{okMsg}</Banner>}
              </Card>
            );
          })
        )}
      </div>

      <TabBar mode="admin" />
    </div>
  );
};
