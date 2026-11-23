import React, { useState } from 'react';
import { Clock, ShoppingCart, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProductImage } from '../components/ProductImage';
import { Stepper } from '../components/Stepper';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { formatRupiah, validasiKuota } from '../lib/rules';
import { useApp } from '../state/AppContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, produk, openPO, currentUser, setCartItemQuantity } = useApp();
  const [checkoutError, setCheckoutError] = useState<string>('');

  const enriched = cart
    .map((item) => {
      const prod = produk.find((p) => p.id === item.produkId);
      if (!prod) return null;
      return {
        ...item,
        prod,
        subtotal: prod.harga * item.jumlah,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const totalCups = enriched.reduce((sum, item) => sum + item.jumlah, 0);
  const subtotal = enriched.reduce((sum, item) => sum + item.subtotal, 0);
  const poOpen = openPO.status === 'buka';
  const kuotaCheck = validasiKuota(openPO.sisaKuota, totalCups, poOpen);

  const handleCheckout = () => {
    setCheckoutError('');
    if (!currentUser) {
      navigate('/masuk');
      return;
    }

    const kuotaResult = validasiKuota(
      openPO.sisaKuota,
      totalCups,
      openPO.status === 'buka'
    );
    if (!kuotaResult.ok) {
      setCheckoutError(kuotaResult.reason);
      return;
    }

    for (const item of enriched) {
      if (item.jumlah > item.prod.stok) {
        setCheckoutError(
          `Stok ${item.prod.nama} tersisa ${item.prod.stok} cup. Kurangi jumlah sebelum lanjut.`
        );
        return;
      }
    }

    navigate('/pengiriman');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar title="Keranjang" showBack backTo="/" showBell={Boolean(currentUser)} />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-4 flex flex-col gap-3 phone-scroll">
        {!poOpen ? (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO sedang TUTUP. Keranjang tetap tersimpan, tetapi checkout dinonaktifkan sampai periode berikutnya dibuka.
          </Banner>
        ) : enriched.length > 0 && !kuotaCheck.ok ? (
          <Banner tone="waiting" icon={<Clock size={18} strokeWidth={2} />}>
            {kuotaCheck.reason}. Kurangi jumlah cup di keranjang sebelum melanjutkan.
          </Banner>
        ) : null}
        {enriched.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#E6F0DC] dark:bg-[#253720] text-[#4A7C3A] dark:text-[#9ED588] flex items-center justify-center">
              <ShoppingCart size={26} strokeWidth={1.9} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                Keranjang masih kosong
              </h2>
              <p className="text-[13px] text-[#6B7866] dark:text-[#9FB098] mt-1">
                Pilih varian matcha favorit Anda di katalog open PO.
              </p>
            </div>
            <div className="w-full max-w-[220px] pt-1">
              <Button onClick={() => navigate('/')}>Lihat Katalog</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {enriched.map(({ prod, jumlah, subtotal: itemSubtotal }) => (
                <Card key={prod.id}>
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={prod.gambarUrl}
                      alt={prod.nama}
                      gradient={prod.gambarGradient}
                      className="w-[56px] h-[56px] rounded-[12px] shrink-0"
                      iconSize={22}
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] truncate">
                        {prod.nama}
                      </h2>
                      <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] tabular-nums">
                        {formatRupiah(prod.harga)} / cup
                      </p>
                      <p className="text-[14px] font-bold text-[#2F5A24] dark:text-[#9ED588] mt-0.5 tabular-nums">
                        {formatRupiah(itemSubtotal)}
                      </p>
                    </div>
                    <Stepper
                      value={jumlah}
                      min={0}
                      max={99}
                      onChange={(next) => {
                        setCheckoutError('');
                        setCartItemQuantity(prod.id, next);
                      }}
                      ariaLabel={`Jumlah ${prod.nama}`}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {checkoutError && <Banner tone="failed">{checkoutError}</Banner>}

            <div className="flex-1 min-h-2" />

            <Card className="space-y-2">
              <div className="flex items-center justify-between text-[13px] text-[#1F2A1C] dark:text-[#E8EFE3]">
                <span className="text-[#6B7866] dark:text-[#9FB098]">
                  Subtotal ({totalCups} cup)
                </span>
                <span className="font-semibold tabular-nums">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B7866] dark:text-[#9FB098]">Ongkos kirim</span>
                <span className="text-[#6B7866] dark:text-[#9FB098] text-right">
                  dihitung setelah alamat
                </span>
              </div>
              <div className="border-t border-[#DFE6D8] dark:border-[#2E3829] pt-2 flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
                  Total sementara
                </span>
                <span className="text-[18px] font-extrabold text-[#2F5A24] dark:text-[#9ED588] tabular-nums">
                  {formatRupiah(subtotal)}
                </span>
              </div>
            </Card>

            <Button
              onClick={handleCheckout}
              disabled={!poOpen || !kuotaCheck.ok}
              disabledReason={
                !poOpen
                  ? 'Checkout dinonaktifkan karena open PO sedang tutup.'
                  : !kuotaCheck.ok
                    ? kuotaCheck.reason
                    : undefined
              }
            >
              {!poOpen ? 'Open PO sedang tutup' : 'Lanjut ke pengiriman'}
            </Button>
          </>
        )}
      </div>

      <TabBar mode="pembeli" />
    </div>
  );
};
