import { useEffect, useMemo, useState } from "react";

import type { Barang } from "../types/barang";

import type {
  Penjualan,
  PenjualanItem,
  PenjualanCreate,
  PenjualanUpdate,
} from "../types/penjualan";

import {
  getPenjualan,
  getPenjualanById,
  createPenjualan,
  updatePenjualan,
  deletePenjualan,
} from "../services/penjualanService";

export function usePenjualan() {
  // =====================================
  // DATA API
  // =====================================

  const [data, setData] = useState<Penjualan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // DATA TRANSAKSI
  // =====================================

  const [keranjang, setKeranjang] =
    useState<PenjualanItem[]>([]);

  const [pelangganId, setPelangganId] =
    useState<number | null>(null);

  // =====================================
  // DISKON
  // =====================================

  const [diskonJenis, setDiskonJenis] =
    useState<"nominal" | "persen">("nominal");

  const [diskonNilai, setDiskonNilai] =
    useState(0);

  // =====================================
  // PEMBAYARAN
  // =====================================

  const [bayar, setBayar] =
    useState(0);

  const [metodeBayar, setMetodeBayar] =
    useState("Tunai");

  const [keterangan, setKeterangan] =
    useState("");

  // =====================================
  // DIALOG
  // =====================================

  const [openCariBarang, setOpenCariBarang] =
    useState(false);

  const [openPembayaran, setOpenPembayaran] =
    useState(false);

  // =====================================
  // HASIL TRANSAKSI TERAKHIR
  // =====================================

  /*
   * Menyimpan hasil transaksi setelah berhasil.
   *
   * Data ini dipakai oleh halaman Penjualan
   * untuk menampilkan faktur dan tombol cetak.
   */
  const [transaksiTerakhir, setTransaksiTerakhir] =
    useState<Penjualan | null>(null);

  // =====================================
  // SETTING PAJAK
  // =====================================

  /*
   * Sementara hardcode.
   * Nanti dapat diambil dari Setting Toko.
   */
  const setting = {
    pajakAktif: false,

    jenisPajak: "persen" as
      | "persen"
      | "nominal",

    nilaiPajak: 11,
  };

  // =====================================
  // COMPUTED
  // =====================================

  const totalItem = useMemo(() => {
    return keranjang.reduce(
      (total, item) =>
        total + Number(item.qty || 0),
      0
    );
  }, [keranjang]);

  const subtotal = useMemo(() => {
    return keranjang.reduce(
      (total, item) =>
        total +
        Number(item.qty || 0) *
        Number(item.harga_jual || 0),
      0
    );
  }, [keranjang]);

  // =====================================
  // HITUNG DISKON
  // =====================================

  const diskon = useMemo(() => {
    const nilai = Math.max(
      0,
      Number(diskonNilai || 0)
    );

    if (diskonJenis === "persen") {
      return (
        subtotal *
        nilai /
        100
      );
    }

    return nilai;
  }, [
    subtotal,
    diskonJenis,
    diskonNilai,
  ]);

  // =====================================
  // HITUNG PAJAK
  // =====================================

  const pajak = useMemo(() => {
    if (!setting.pajakAktif) {
      return 0;
    }

    const dasarPajak = Math.max(
      0,
      subtotal - diskon
    );

    if (
      setting.jenisPajak ===
      "persen"
    ) {
      return (
        dasarPajak *
        setting.nilaiPajak /
        100
      );
    }

    return Math.max(
      0,
      setting.nilaiPajak
    );
  }, [
    subtotal,
    diskon,
    setting.pajakAktif,
    setting.jenisPajak,
    setting.nilaiPajak,
  ]);

  // =====================================
  // GRAND TOTAL
  // =====================================

  const grandTotal = useMemo(() => {
    return Math.max(
      0,
      subtotal -
      diskon +
      pajak
    );
  }, [
    subtotal,
    diskon,
    pajak,
  ]);

  // =====================================
  // KEMBALIAN
  // =====================================

  const kembalian = useMemo(() => {
    return Math.max(
      0,
      Number(bayar || 0) -
      grandTotal
    );
  }, [
    bayar,
    grandTotal,
  ]);

  // =====================================
  // LOAD DATA
  // =====================================

  const loadData = async () => {
    try {
      setLoading(true);

      const result =
        await getPenjualan();

      setData(result);

      setError("");
    } catch (err: any) {
      console.error(
        "Gagal mengambil data penjualan:",
        err
      );

      setError(
        err?.response?.data?.detail ??
        "Gagal mengambil data penjualan."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // RELOAD
  // =====================================

  const reload = async () => {
    await loadData();
  };

  // =====================================
  // GET BY ID
  // =====================================

  const getById = async (
    id: number
  ): Promise<Penjualan> => {
    return await getPenjualanById(id);
  };

  // =====================================
  // CREATE PENJUALAN
  // =====================================

  const create = async (
    payload: PenjualanCreate
  ): Promise<Penjualan> => {
    try {
      setLoading(true);

      const result =
        await createPenjualan(
          payload
        );

      await loadData();

      return result;
    } catch (err) {
      console.error(
        "Gagal membuat penjualan:",
        err
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // UPDATE PENJUALAN
  // =====================================

  const update = async (
    id: number,
    payload: PenjualanUpdate
  ): Promise<Penjualan> => {
    try {
      setLoading(true);

      const result =
        await updatePenjualan(
          id,
          payload
        );

      await loadData();

      return result;
    } catch (err) {
      console.error(
        "Gagal mengubah penjualan:",
        err
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // DELETE PENJUALAN
  // =====================================

  const remove = async (
    id: number
  ): Promise<void> => {
    try {
      setLoading(true);

      await deletePenjualan(id);

      await loadData();
    } catch (err) {
      console.error(
        "Gagal menghapus penjualan:",
        err
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // CEK BARANG
  // =====================================

  const cekBarang = (
    barangId: number
  ) => {
    return keranjang.findIndex(
      (item) =>
        item.barang_id ===
        barangId
    );
  };

  // =====================================
  // TAMBAH BARANG
  // =====================================

  const tambahBarang = (
    barang: Barang
  ) => {

    const index =
      cekBarang(barang.id);

    if (index >= 0) {

      setKeranjang((prev) =>
        prev.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  qty:
                    Number(item.qty) + 1,
                }
              : item
        )
      );

      return;
    }

    // PenjualanItem lama mungkin belum
    // memiliki property foto.
    const itemBaru: PenjualanItem & {
      foto?: string | null;
    } = {

      barang_id:
        barang.id,

      nama_barang:
        barang.nama_barang,

      qty: 1,

      harga_jual:
        Number(
          barang.harga_jual || 0
        ),

      // FOTO BARANG
      foto:
        barang.foto ?? null,
    };

    setKeranjang((prev) => [
      ...prev,
      itemBaru,
    ]);
  };

  // =====================================
  // UBAH QTY
  // =====================================

  const ubahQty = (
    barangId: number,
    qty: number
  ) => {
    if (qty <= 0) {
      return;
    }

    setKeranjang((prev) =>
      prev.map((item) =>
        item.barang_id ===
        barangId
          ? {
              ...item,
              qty,
            }
          : item
      )
    );
  };

  // =====================================
  // TAMBAH QTY
  // =====================================

  const tambahQty = (
    barangId: number
  ) => {
    const item =
      keranjang.find(
        (i) =>
          i.barang_id ===
          barangId
      );

    if (!item) {
      return;
    }

    ubahQty(
      barangId,
      Number(item.qty) + 1
    );
  };

  // =====================================
  // KURANGI QTY
  // =====================================

  const kurangiQty = (
    barangId: number
  ) => {
    const item =
      keranjang.find(
        (i) =>
          i.barang_id ===
          barangId
      );

    if (!item) {
      return;
    }

    if (item.qty <= 1) {
      hapusBarang(barangId);
      return;
    }

    ubahQty(
      barangId,
      Number(item.qty) - 1
    );
  };

  // =====================================
  // HAPUS BARANG
  // =====================================

  const hapusBarang = (
    barangId: number
  ) => {
    setKeranjang((prev) =>
      prev.filter(
        (item) =>
          item.barang_id !==
          barangId
      )
    );
  };

  // =====================================
  // KOSONGKAN KERANJANG
  // =====================================

  const kosongkanKeranjang =
    () => {
      setKeranjang([]);
    };

  // =====================================
  // DIALOG CARI BARANG
  // =====================================

  const bukaCariBarang = () => {
    setOpenCariBarang(true);
  };

  const tutupCariBarang = () => {
    setOpenCariBarang(false);
  };

  const toggleCariBarang =
    () => {
      setOpenCariBarang(
        (prev) => !prev
      );
    };

  // =====================================
  // DIALOG PEMBAYARAN
  // =====================================

  const bukaPembayaran = () => {
    if (
      keranjang.length === 0
    ) {
      throw new Error(
        "Keranjang masih kosong."
      );
    }

    setOpenPembayaran(true);
  };

  const tutupPembayaran = () => {
    setOpenPembayaran(false);
  };

  const togglePembayaran =
    () => {
      if (
        keranjang.length === 0
      ) {
        throw new Error(
          "Keranjang masih kosong."
        );
      }

      setOpenPembayaran(
        (prev) => !prev
      );
    };

  // =====================================
  // VALIDASI TRANSAKSI
  // =====================================

  const validasi = () => {
    if (
      keranjang.length === 0
    ) {
      return {
        success: false,
        message:
          "Keranjang masih kosong.",
      };
    }

    if (diskon < 0) {
      return {
        success: false,
        message:
          "Diskon tidak boleh negatif.",
      };
    }

    if (pajak < 0) {
      return {
        success: false,
        message:
          "Pajak tidak boleh negatif.",
      };
    }

    if (grandTotal < 0) {
      return {
        success: false,
        message:
          "Grand total tidak valid.",
      };
    }

    if (
      Number(bayar || 0) <
      grandTotal
    ) {
      return {
        success: false,
        message:
          "Pembayaran kurang.",
      };
    }

    return {
      success: true,
      message: "",
    };
  };

  // =====================================
  // RESET FORM
  // =====================================

  const resetForm = () => {
    setKeranjang([]);

    setPelangganId(null);

    setDiskonJenis(
      "nominal"
    );

    setDiskonNilai(0);

    setBayar(0);

    setMetodeBayar(
      "Tunai"
    );

    setKeterangan("");

    setOpenCariBarang(false);

    setOpenPembayaran(false);
  };

  // =====================================
  // TUTUP HASIL TRANSAKSI
  // =====================================

  const tutupTransaksiTerakhir =
    () => {
      setTransaksiTerakhir(
        null
      );
    };

  // =====================================
  // SIMPAN TRANSAKSI
  // =====================================

  const simpanTransaksi =
    async () => {
      const cek =
        validasi();

      if (!cek.success) {
        return cek;
      }

      const payload:
        PenjualanCreate = {
        pelanggan_id:
          pelangganId,

        diskon:
          diskon,

        pajak:
          pajak,

        metode_bayar:
          metodeBayar,

        dibayar:
          bayar,

        keterangan:
          keterangan,

        items:
          keranjang.map(
            (item) => ({
              barang_id:
                item.barang_id,

              qty:
                item.qty,

              harga_jual:
                item.harga_jual,
            })
          ),
      };

      try {
        setLoading(true);

        /*
         * Simpan ke backend.
         *
         * Backend mengembalikan data
         * Penjualan termasuk nomor faktur.
         */
        const hasil =
          await createPenjualan(
            payload
          );

        /*
         * Simpan hasil transaksi
         * untuk ditampilkan pada
         * dialog faktur.
         */
        setTransaksiTerakhir(
          hasil
        );

        /*
         * Muat ulang daftar transaksi.
         */
        await loadData();

        /*
         * Setelah backend sukses,
         * baru kosongkan transaksi aktif.
         */
        resetForm();

        return {
          success: true,

          message:
            "Penjualan berhasil disimpan.",

          data: hasil,
        };
      } catch (err: any) {
        console.error(
          "Gagal menyimpan transaksi:",
          err
        );

        return {
          success: false,

          message:
            err?.response?.data
              ?.detail ??
            "Terjadi kesalahan saat menyimpan transaksi.",
        };
      } finally {
        setLoading(false);
      }
    };

  // =====================================
  // INIT
  // =====================================

  useEffect(() => {
    loadData();
  }, []);

  // =====================================
  // RETURN
  // =====================================

  return {
    // API
    data,
    loading,
    error,

    reload,
    getById,
    create,
    update,
    remove,

    // TRANSAKSI
    keranjang,

    pelangganId,

    diskonJenis,
    diskonNilai,

    bayar,

    metodeBayar,

    keterangan,

    transaksiTerakhir,

    // COMPUTED
    totalItem,

    subtotal,

    diskon,

    pajak,

    grandTotal,

    kembalian,

    // DIALOG
    openCariBarang,

    openPembayaran,

    // SETTER
    setPelangganId,

    setDiskonJenis,

    setDiskonNilai,

    setBayar,

    setMetodeBayar,

    setKeterangan,

    // KERANJANG
    cekBarang,

    tambahBarang,

    tambahQty,

    kurangiQty,

    ubahQty,

    hapusBarang,

    kosongkanKeranjang,

    // DIALOG
    bukaCariBarang,

    tutupCariBarang,

    toggleCariBarang,

    bukaPembayaran,

    tutupPembayaran,

    togglePembayaran,

    // TRANSAKSI
    validasi,

    resetForm,

    simpanTransaksi,

    tutupTransaksiTerakhir,
  };
}