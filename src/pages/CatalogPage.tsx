import React from 'react';
import { CheckCircle2, Clock, Coffee, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { ProductImage } from '../components/ProductImage';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { formatRentangTanggal, formatRupiah } from '../lib/rules';
import { useApp } from '../state/AppContext';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { produk, openPO, currentUser } = useApp();

  const poOpen = openPO.status === 'buka';
  const kuotaHabis = poOpen && openPO.sisaKuota <= 0;
  const canOrder = poOpen && !kuotaHabis;
  const rentang = formatRentangTanggal(openPO.tanggalMulai, openPO.tanggalTutup);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar
        title="Katalog Matcha"
        showBell={Boolean(currentUser)}
        showLogout={Boolean(currentUser)}
        rightSlot={
          !currentUser ? (
            <button
              type="button"
              onClick={() => navigate('/masuk')}
              className="px-3 py-1.5 rounded-full bg-[#4A7C3A] text-white text-[12px] font-bold cursor-pointer"
            >
              Masuk
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-4 flex flex-col gap-3 phone-scroll">
        {!poOpen ? (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO TUTUP · Periode {rentang} sudah ditutup. Pesanan baru dibuka kembali saat periode berikutnya.
          </Banner>
        ) : kuotaHabis ? (
          <Banner tone="waiting" icon={<Clock size={18} strokeWidth={2} />}>
            Kuota Open PO HABIS · {rentang} (0 dari {openPO.kuota} cup tersisa).
          </Banner>
        ) : (
          <Banner tone="success" icon={<CheckCircle2 size={18} strokeWidth={2} />}>
            Open PO BUKA · {rentang} · Sisa kuota {openPO.sisaKuota} dari {openPO.kuota} cup
          </Banner>
        )}

        <div className="space-y-3">
          {produk.map((item) => {
            const outOfStock = item.stok <= 0;
            const disabledCard = !canOrder;

            return (
              <Card
                key={item.id}
                onClick={disabledCard ? undefined : () => navigate(`/produk/${item.id}`)}
                className={disabledCard ? 'opacity-60' : ''}
              >
                <div className="flex items-center gap-3">
                  <ProductImage
                    src={item.gambarUrl}
                    alt={item.nama}
                    gradient={item.gambarGradient}
                    className="w-[64px] h-[64px] rounded-[12px] shrink-0"
                    iconSize={24}
                  />

                  <div className="flex-1 min-w-0">
                    <h2 className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] truncate">
                      {item.nama}
                    </h2>
                    <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] mt-0.5 tabular-nums">
                      Stok {item.stok} cup
                    </p>
                    <p className="text-[14px] font-bold text-[#2F5A24] dark:text-[#9ED588] mt-1 tabular-nums">
                      {formatRupiah(item.harga)}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {!poOpen ? (
                      <Chip tone="failed" icon={<XCircle size={13} strokeWidth={2} />}>
                        Tutup
                      </Chip>
                    ) : kuotaHabis ? (
                      <Chip tone="waiting" icon={<Clock size={13} strokeWidth={2} />}>
                        Kuota penuh
                      </Chip>
                    ) : outOfStock ? (
                      <Chip tone="failed" icon={<XCircle size={13} strokeWidth={2} />}>
                        Habis
                      </Chip>
                    ) : (
                      <Chip tone="success" icon={<Coffee size={13} strokeWidth={2} />}>
                        Open PO
                      </Chip>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {!canOrder && (
          <>
            <div className="flex-1" />
            <div className="pt-2">
              <Button
                disabled
                disabledReason={
                  !poOpen
                    ? 'Tombol pesan dinonaktifkan karena open PO tutup.'
                    : 'Tombol pesan dinonaktifkan karena kuota open PO sudah habis.'
                }
              >
                {!poOpen ? 'Open PO sedang tutup (nonaktif)' : 'Kuota Open PO habis (nonaktif)'}
              </Button>
            </div>
          </>
        )}
      </div>

      <TabBar mode="pembeli" />
    </div>
  );
};
