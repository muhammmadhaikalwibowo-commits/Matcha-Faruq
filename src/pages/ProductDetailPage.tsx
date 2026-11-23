import React, { useState } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ProductImage } from '../components/ProductImage';
import { Stepper } from '../components/Stepper';
import { TopBar } from '../components/TopBar';
import { formatRupiah, validasiKuota } from '../lib/rules';
import { useApp } from '../state/AppContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { produk, openPO, cart, setCartItemQuantity } = useApp();

  const product = produk.find((p) => p.id === id);
  const existingCartItem = cart.find((c) => c.produkId === id);

  const [jumlah, setJumlah] = useState<number>(() => existingCartItem?.jumlah ?? 1);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!product) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <TopBar title="Detail Produk" showBack backTo="/" />
        <div className="p-5 space-y-4">
          <Banner tone="failed">Produk tidak ditemukan.</Banner>
          <Button onClick={() => navigate('/')}>Kembali ke Katalog</Button>
        </div>
      </div>
    );
  }

  const poOpen = openPO.status === 'buka';
  const kuotaHabis = poOpen && openPO.sisaKuota <= 0;
  const canOrder = poOpen && !kuotaHabis;
  const liveTotal = product.harga * jumlah;

  const handleQtyChange = (next: number) => {
    const safeNext = Math.max(0, next);
    setJumlah(safeNext);
    setErrorMsg('');
    if (safeNext === 0 && existingCartItem) {
      setCartItemQuantity(product.id, 0);
    }
  };

  const handleAdd = () => {
    if (jumlah === 0) {
      setCartItemQuantity(product.id, 0);
      navigate('/keranjang');
      return;
    }

    const otherCartCups = cart
      .filter((c) => c.produkId !== product.id)
      .reduce((s, c) => s + c.jumlah, 0);

    const kuotaCheck = validasiKuota(openPO.sisaKuota, otherCartCups + jumlah, poOpen);
    if (!kuotaCheck.ok) {
      setErrorMsg(kuotaCheck.reason);
      return;
    }

    if (jumlah > product.stok) {
      setErrorMsg(`Stok ${product.nama} tersisa ${product.stok} cup`);
      return;
    }

    setCartItemQuantity(product.id, jumlah);
    navigate('/keranjang');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TopBar
        title="Detail Produk"
        showBack
        backTo="/"
        rightSlot={
          !poOpen ? (
            <Chip tone="failed" icon={<XCircle size={12} strokeWidth={2} />}>
              PO Tutup
            </Chip>
          ) : kuotaHabis ? (
            <Chip tone="waiting" icon={<Clock size={12} strokeWidth={2} />}>
              Kuota Habis
            </Chip>
          ) : (
            <Chip tone="success" icon={<CheckCircle2 size={12} strokeWidth={2} />}>
              PO Buka
            </Chip>
          )
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pb-6 flex flex-col gap-3 phone-scroll">
        <ProductImage
          src={product.gambarUrl}
          alt={product.nama}
          gradient={product.gambarGradient}
          className="w-full h-[200px] rounded-[18px] shrink-0"
          iconSize={34}
          overlayCaption={product.catatanRasa}
        />

        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <h2 className="text-[20px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3] leading-snug">
              {product.nama}
            </h2>
            <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098] mt-0.5 tabular-nums">
              Stok tersedia: {product.stok} cup
            </p>
          </div>
          <p className="text-[18px] font-extrabold text-[#2F5A24] dark:text-[#9ED588] tabular-nums shrink-0">
            {formatRupiah(product.harga)}
          </p>
        </div>

        <p className="text-[14px] text-[#1F2A1C]/90 dark:text-[#E8EFE3]/90 leading-relaxed">
          {product.deskripsi}
        </p>

        {!poOpen ? (
          <Banner tone="failed" icon={<XCircle size={18} strokeWidth={2} />}>
            Open PO periode ini sudah ditutup.
          </Banner>
        ) : kuotaHabis ? (
          <Banner tone="waiting" icon={<Clock size={18} strokeWidth={2} />}>
            Kuota open PO periode ini sudah habis (0 cup tersisa).
          </Banner>
        ) : (
          <Banner tone="success" icon={<CheckCircle2 size={18} strokeWidth={2} />}>
            Sisa kuota open PO: {openPO.sisaKuota} cup
          </Banner>
        )}

        <div className="bg-white dark:bg-[#1F261C] border border-[#DFE6D8] dark:border-[#2E3829] rounded-[14px] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-bold text-[#1F2A1C] dark:text-[#E8EFE3]">
              Jumlah pesanan
            </p>
            <p className="text-[12px] text-[#6B7866] dark:text-[#9FB098]">
              {jumlah === 0 ? 'Jumlah 0 akan menghapus item' : 'Minimal 1 cup untuk memesan'}
            </p>
          </div>
          <Stepper value={jumlah} min={0} max={99} onChange={handleQtyChange} ariaLabel="Jumlah cup" />
        </div>

        {errorMsg && <Banner tone="failed">{errorMsg}</Banner>}

        <div className="flex-1 min-h-2" />

        <Button
          onClick={handleAdd}
          disabled={!canOrder || (jumlah === 0 && !existingCartItem)}
          disabledReason={
            !poOpen
              ? 'Pesanan tidak dapat dibuat karena open PO sedang tutup.'
              : kuotaHabis
                ? 'Pesanan tidak dapat dibuat karena kuota open PO habis.'
                : jumlah === 0 && !existingCartItem
                  ? 'Pilih minimal 1 cup untuk ditambahkan ke keranjang.'
                  : undefined
          }
        >
          {jumlah === 0 && existingCartItem
            ? 'Hapus dari keranjang'
            : `Tambah ke keranjang · ${formatRupiah(liveTotal)}`}
        </Button>
      </div>
    </div>
  );
};
