import { useEffect, useState } from "react";

interface Props {
  open: boolean;

  grandTotal: number;

  bayar: number;

  metodeBayar: string;

  diskonJenis: "nominal" | "persen";

  diskonNilai: number;

  kembalian: number;

  loading: boolean;

  onClose: () => void;

  setBayar: (value: number) => void;

  setMetodeBayar: (value: string) => void;

  setDiskonJenis: (
    value: "nominal" | "persen"
  ) => void;

  setDiskonNilai: (
    value: number
  ) => void;

  onSimpan: () => Promise<any>;
}

export default function PembayaranDialog({
  open,
  grandTotal,
  bayar,
  metodeBayar,
  diskonJenis,
  diskonNilai,
  kembalian,
  loading,
  onClose,
  setBayar,
  setMetodeBayar,
  setDiskonJenis,
  setDiskonNilai,
  onSimpan,
}: Props) {
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
   * Jangan biarkan dialog menerima nilai lama
   * ketika dibuka kembali.
   */
  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const formatRupiah = (value: number) => {
    return Number(value || 0).toLocaleString(
      "id-ID"
    );
  };

  const simpan = async () => {
    setError("");

    /*
     * Validasi frontend
     */
    if (grandTotal < 0) {
      setError(
        "Grand total tidak valid."
      );
      return;
    }

    if (bayar < grandTotal) {
      setError(
        "Jumlah pembayaran masih kurang."
      );
      return;
    }

    if (diskonNilai < 0) {
      setError(
        "Diskon tidak boleh negatif."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * onSimpan mengembalikan:
       * {
       *   success,
       *   message,
       *   data
       * }
       */
      const result = await onSimpan();

      /*
       * Jika gagal, tetap di dialog pembayaran
       * supaya user dapat memperbaiki transaksi.
       */
      if (!result?.success) {
        setError(
          result?.message ??
          "Transaksi gagal disimpan."
        );

        return;
      }

      /*
       * JANGAN alert di sini.
       *
       * Hasil transaksi akan diteruskan
       * ke halaman Penjualan untuk faktur/struk.
       */
    } catch (error: any) {
      console.error(
        "Gagal menyimpan transaksi:",
        error
      );

      setError(
        error?.response?.data?.detail ??
        error?.message ??
        "Terjadi kesalahan saat menyimpan transaksi."
      );
    } finally {
      setSaving(false);
    }
  };

  const sedangMenyimpan =
    saving || loading;

  return (
    <div
      className="
        fixed
        inset-0
        z-[1000]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-xl
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            bg-[#0b2d63]
            px-6
            py-4
            text-white
          "
        >
          <div>
            <h2 className="text-xl font-bold">
              Pembayaran
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              Selesaikan pembayaran transaksi
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={sedangMenyimpan}
            className="
              rounded-full
              px-3
              py-1
              text-2xl
              leading-none
              text-white/80
              transition
              hover:bg-white/10
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="max-h-[75vh] overflow-y-auto p-6">

          {/* ERROR */}

          {error && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                text-red-700
              "
            >
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* TOTAL */}
          {/* ================================================= */}

          <div
            className="
              mb-5
              rounded-xl
              border
              border-green-200
              bg-green-50
              p-4
            "
          >
            <div className="text-sm text-gray-600">
              Total yang harus dibayar
            </div>

            <div
              className="
                mt-1
                text-3xl
                font-extrabold
                text-green-700
              "
            >
              Rp {formatRupiah(grandTotal)}
            </div>
          </div>

          {/* ================================================= */}
          {/* DISKON */}
          {/* ================================================= */}

          <div className="mb-5">

            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-gray-700
              "
            >
              Diskon
            </label>

            <div className="grid grid-cols-[140px_1fr] gap-3">

              <select
                value={diskonJenis}
                onChange={(e) =>
                  setDiskonJenis(
                    e.target.value as
                      | "nominal"
                      | "persen"
                  )
                }
                disabled={sedangMenyimpan}
                className="
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-3
                  py-3
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              >
                <option value="nominal">
                  Nominal
                </option>

                <option value="persen">
                  Persen
                </option>
              </select>

              <input
                type="number"
                min="0"
                value={diskonNilai}
                onChange={(e) =>
                  setDiskonNilai(
                    Math.max(
                      0,
                      Number(e.target.value) || 0
                    )
                  )
                }
                disabled={sedangMenyimpan}
                placeholder="0"
                className="
                  rounded-xl
                  border
                  border-gray-300
                  px-3
                  py-3
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Diskon boleh dibiarkan 0.
            </p>
          </div>

          {/* ================================================= */}
          {/* METODE PEMBAYARAN */}
          {/* ================================================= */}

          <div className="mb-5">

            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-gray-700
              "
            >
              Metode Pembayaran
            </label>

            <select
              value={metodeBayar}
              onChange={(e) =>
                setMetodeBayar(
                  e.target.value
                )
              }
              disabled={sedangMenyimpan}
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                px-3
                py-3
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            >
              <option value="Tunai">
                Tunai
              </option>

              <option value="Transfer">
                Transfer
              </option>

              <option value="QRIS">
                QRIS
              </option>

              <option value="Debit">
                Debit
              </option>

              <option value="Kredit">
                Kredit
              </option>
            </select>
          </div>

          {/* ================================================= */}
          {/* BAYAR */}
          {/* ================================================= */}

          <div className="mb-5">

            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-gray-700
              "
            >
              Uang Dibayar
            </label>

            <input
              type="number"
              min="0"
              value={bayar}
              onChange={(e) =>
                setBayar(
                  Math.max(
                    0,
                    Number(e.target.value) || 0
                  )
                )
              }
              disabled={sedangMenyimpan}
              placeholder="Masukkan jumlah pembayaran"
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                text-lg
                font-semibold
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />
          </div>

          {/* ================================================= */}
          {/* KEMBALIAN */}
          {/* ================================================= */}

          <div
            className={`
              mb-6
              rounded-xl
              border
              p-4
              ${
                kembalian >= 0
                  ? "border-blue-200 bg-blue-50"
                  : "border-red-200 bg-red-50"
              }
            `}
          >
            <div className="text-sm text-gray-600">
              {kembalian >= 0
                ? "Kembalian"
                : "Kekurangan Pembayaran"}
            </div>

            <div
              className={`
                mt-1
                text-2xl
                font-extrabold
                ${
                  kembalian >= 0
                    ? "text-blue-700"
                    : "text-red-600"
                }
              `}
            >
              Rp{" "}
              {formatRupiah(
                Math.abs(kembalian)
              )}
            </div>
          </div>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              pt-5
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={sedangMenyimpan}
              className="
                rounded-xl
                border
                border-gray-300
                bg-white
                px-5
                py-3
                font-semibold
                text-gray-700
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Batal
            </button>

            <button
              type="button"
              onClick={simpan}
              disabled={
                sedangMenyimpan ||
                bayar < grandTotal
              }
              className="
                rounded-xl
                bg-green-600
                px-6
                py-3
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-green-700
                disabled:cursor-not-allowed
                disabled:bg-gray-400
              "
            >
              {sedangMenyimpan
                ? "Menyimpan..."
                : "Simpan Transaksi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}