import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Field, inputClassName } from '../components/Field';
import { TabBar } from '../components/TabBar';
import { Toggle } from '../components/Toggle';
import { TopBar } from '../components/TopBar';
import { formatRentangTanggal } from '../lib/rules';
import { useApp } from '../state/AppContext';

export const AdminOpenPOPage: React.FC = () => {
  const { openPO, updateOpenPO } = useApp();

  const [isBuka, setIsBuka] = useState(openPO.status === 'buka');
  const [tanggalMulai, setTanggalMulai] = useState(openPO.tanggalMulai);
  const [tanggalTutup, setTanggalTutup] = useState(openPO.tanggalTutup);
  const [kuota, setKuota] = useState(String(openPO.kuota));
  const [sisaKuota, setSisaKuota] = useState(String(openPO.sisaKuota));
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setIsBuka(openPO.status === 'buka');
    setTanggalMulai(openPO.tanggalMulai);
    setTanggalTutup(openPO.tanggalTutup);
    setKuota(String(openPO.kuota));
    setSisaKuota(String(openPO.sisaKuota));
  }, [openPO]);

  const handleToggleStatus = (nextOpen: boolean) => {
    setIsBuka(nextOpen);
    const res = updateOpenPO({ status: nextOpen ? 'buka' : 'tutup' });
    if (!res.ok) {
      setFeedback({ ok: false, text: res.reason });
      return;
    }
    setFeedback({
      ok: true,
      text: nextOpen
        ? 'Open PO dibuka. Katalog dan checkout pembeli sekarang aktif.'
        : 'Open PO ditutup. Katalog, keranjang, dan checkout pembeli sekarang dinonaktifkan.',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const parsedKuota = Number(kuota);
    const parsedSisa = Number(sisaKuota);

    if (!tanggalMulai || !tanggalTutup) {
      setFeedback({ ok: false, text: 'Tanggal mulai dan tutup wajib diisi.' });
      return;
    }
    if (tanggalTutup < tanggalMulai) {
      setFeedback({ ok: false, text: 'Tanggal tutup tidak boleh sebelum tanggal mulai.' });
      return;
    }

    const res = updateOpenPO({
      status: isBuka ? 'buka' : 'tutup',
      tanggalMulai,
      tanggalTutup,
      kuota: parsedKuota,
      sisaKuota: parsedSisa,
    });

    if (!res.ok) {
      setFeedback({ ok: false, text: res.reason });
      return;
    }

    setFeedback({
      ok: true,
      text: `Perubahan open PO tersimpan (Status: ${isBuka ? 'BUKA' : 'TUTUP'}).`,
    });
  };

  const poOpen = openPO.status === 'buka';
  const rentang = formatRentangTanggal(openPO.tanggalMulai, openPO.tanggalTutup);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar
        title="Kelola Open PO"
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

      <form
        onSubmit={handleSave}
        className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-4 flex flex-col gap-3 phone-scroll"
      >
        {poOpen ? (
          <Banner tone="success" icon={<CheckCircle2 size={18} strokeWidth={2} />}>
            Open PO aktif ({rentang}) · Sisa kuota {openPO.sisaKuota}/{openPO.kuota} cup.
          </Banner>
        ) : (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO sedang DITUTUP. Seluruh halaman pembeli menampilkan status tutup.
          </Banner>
        )}

        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
              Status Open PO
            </p>
            <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
              {isBuka
                ? 'Aktif: pembeli dapat memesan produk dari katalog'
                : 'Tutup: katalog, keranjang, & checkout dinonaktifkan'}
            </p>
          </div>
          <Toggle
            checked={isBuka}
            onChange={handleToggleStatus}
            label="Buka atau tutup open PO"
          />
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal mulai" htmlFor="po-mulai">
            <input
              id="po-mulai"
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className={inputClassName()}
            />
          </Field>

          <Field label="Tanggal tutup" htmlFor="po-tutup">
            <input
              id="po-tutup"
              type="date"
              value={tanggalTutup}
              onChange={(e) => setTanggalTutup(e.target.value)}
              className={inputClassName()}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kuota total (cup)" htmlFor="po-kuota">
            <input
              id="po-kuota"
              type="number"
              min={1}
              value={kuota}
              onChange={(e) => setKuota(e.target.value)}
              className={`${inputClassName()} tabular-nums`}
            />
          </Field>

          <Field label="Sisa kuota (cup)" htmlFor="po-sisa">
            <input
              id="po-sisa"
              type="number"
              min={0}
              value={sisaKuota}
              onChange={(e) => setSisaKuota(e.target.value)}
              className={`${inputClassName()} tabular-nums`}
            />
          </Field>
        </div>

        {feedback && (
          <Banner tone={feedback.ok ? 'success' : 'failed'}>{feedback.text}</Banner>
        )}

        <div className="flex-1 min-h-2" />

        <Button type="submit">Simpan jadwal &amp; kuota</Button>
      </form>

      <TabBar mode="admin" />
    </div>
  );
};
