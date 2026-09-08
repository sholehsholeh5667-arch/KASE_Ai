import { useEffect, useMemo, useState } from "react";

import { useBarang } from "../../hooks/useBarang";
import type { Barang } from "../../types/barang";

interface Props {
  open: boolean;
  onClose: () => void;
  onPilih: (barang: Barang) => void;
}

export default function CariBarangDialog({
  open,
  onClose,
  onPilih,
}: Props) {
  const [search, setSearch] = useState("");

  const {
    loading,
    data: barang,
    loadData,
  } = useBarang();

  // =====================================================
  // LOAD DATA SAAT DIALOG DIBUKA
  // =====================================================

  useEffect(() => {
    if (!open) return;

    loadData();
    setSearch("");
  }, [open]);

  // =====================================================
  // FILTER BARANG
  // =====================================================

  const filteredBarang = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return barang;
    }

    return barang.filter((item) => {
      const kode =
        item.kode_barang?.toLowerCase() ?? "";

      const nama =
        item.nama_barang?.toLowerCase() ?? "";

      const alias =
        item.alias_barang?.toLowerCase() ?? "";

      return (
        kode.includes(keyword) ||
        nama.includes(keyword) ||
        alias.includes(keyword)
      );
    });
  }, [barang, search]);

  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  const formatRupiah = (value: number) => {
    return Number(value || 0).toLocaleString("id-ID");
  };

  // =====================================================
  // FORMAT FOTO
  // =====================================================

  const getFotoUrl = (foto?: string) => {
    if (!foto) {
      return "";
    }

    if (
      foto.startsWith("http://") ||
      foto.startsWith("https://")
    ) {
      return foto;
    }

    if (foto.startsWith("/")) {
      return `${import.meta.env.VITE_API_URL}${foto}`;
    }

      return `${import.meta.env.VITE_API_URL}/${foto}`;
  };

  // =====================================================
  // PILIH BARANG
  // =====================================================

  const handlePilih = (item: Barang) => {
    if (Number(item.stok) <= 0) {
      return;
    }

    onPilih(item);
    onClose();
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  // =====================================================
  // JANGAN RENDER JIKA TERTUTUP
  // =====================================================

  if (!open) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[2000]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >
      {/* =================================================
          MODAL UTAMA
          ================================================= */}

      <div
        className="
          flex
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
        style={{
          height: "calc(100vh - 2rem)",
          maxHeight: "calc(100vh - 2rem)",
        }}
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-200
            bg-white
            px-6
            py-4
          "
        >
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Cari Barang
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Pilih barang yang akan dimasukkan ke keranjang
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-2xl
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-800
            "
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        {/* =================================================
            SEARCH
            ================================================= */}

        <div
          className="
            shrink-0
            border-b
            border-gray-200
            bg-gray-50
            px-6
            py-4
          "
        >
          <div className="relative">
            <span
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            >
              🔍
            </span>

            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari nama, kode, atau alias barang..."
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                py-3
                pl-11
                pr-4
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {loading
                ? "Memuat data..."
                : `${filteredBarang.length} barang ditemukan`}
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="
                  text-sm
                  font-medium
                  text-blue-600
                  hover:text-blue-800
                "
              >
                Bersihkan pencarian
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            CONTENT — HANYA BAGIAN INI YANG SCROLL
            ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-6
            py-5
          "
        >
          {/* LOADING */}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div
                className="
                  h-10
                  w-10
                  animate-spin
                  rounded-full
                  border-4
                  border-gray-200
                  border-t-blue-600
                "
              />

              <p className="mt-4 text-sm text-gray-500">
                Memuat daftar barang...
              </p>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            filteredBarang.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                    text-3xl
                  "
                >
                  📦
                </div>

                <h3 className="mt-4 font-semibold text-gray-700">
                  Barang tidak ditemukan
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Coba gunakan nama atau kode barang yang lain.
                </p>
              </div>
            )}

          {/* =================================================
              GRID BARANG
              ================================================= */}

          {!loading &&
            filteredBarang.length > 0 && (
              <div
                className="
                  grid
                  grid-cols-1
                  items-stretch
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {filteredBarang.map((item) => {
                  const stok = Number(
                    item.stok || 0
                  );

                  const harga = Number(
                    item.harga_jual || 0
                  );

                  const habis = stok <= 0;

                  const fotoUrl =
                    getFotoUrl(item.foto);

                  return (
                    <div
                      key={item.id}
                      className={`
                        group
                        flex
                        h-full
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        border
                        bg-white
                        transition
                        ${
                          habis
                            ? "border-gray-200 opacity-70"
                            : "border-gray-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                        }
                      `}
                    >
                      {/* =================================================
                          FOTO
                          ================================================= */}

                      <div
                        className="
                          relative
                          flex
                          h-44
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          bg-gray-100
                        "
                      >
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={item.nama_barang}
                            className="
                              h-full
                              w-full
                              object-cover
                              transition
                              duration-300
                              group-hover:scale-105
                            "
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";

                              const fallback =
                                e.currentTarget
                                  .parentElement
                                  ?.querySelector(
                                    "[data-foto-fallback]"
                                  ) as HTMLElement | null;

                              if (fallback) {
                                fallback.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        {/* FOTO FALLBACK */}

                        <div
                          data-foto-fallback
                          className="
                            absolute
                            inset-0
                            items-center
                            justify-center
                            text-5xl
                            text-gray-300
                          "
                          style={{
                            display: fotoUrl
                              ? "none"
                              : "flex",
                          }}
                        >
                          📦
                        </div>

                        {/* STATUS STOK */}

                        <div className="absolute right-3 top-3">
                          {habis ? (
                            <span
                              className="
                                rounded-full
                                bg-red-600
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                text-white
                                shadow
                              "
                            >
                              Stok Habis
                            </span>
                          ) : stok <=
                            Number(
                              item.stok_minimum || 0
                            ) ? (
                            <span
                              className="
                                rounded-full
                                bg-orange-500
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                text-white
                                shadow
                              "
                            >
                              Stok Menipis
                            </span>
                          ) : (
                            <span
                              className="
                                rounded-full
                                bg-green-600
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                text-white
                                shadow
                              "
                            >
                              Tersedia
                            </span>
                          )}
                        </div>
                      </div>

                      {/* =================================================
                          INFORMASI
                          ================================================= */}

                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-1 text-xs font-medium text-gray-400">
                          {item.kode_barang}
                        </div>

                        <h3
                          className="
                            min-h-[48px]
                            text-base
                            font-bold
                            leading-6
                            text-gray-800
                          "
                        >
                          {item.nama_barang}
                        </h3>

                        {item.alias_barang && (
                          <p className="mt-1 truncate text-xs text-gray-400">
                            {item.alias_barang}
                          </p>
                        )}

                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <p className="text-xs text-gray-500">
                              Harga Jual
                            </p>

                            <p className="text-lg font-bold text-blue-700">
                              Rp {formatRupiah(harga)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              Stok
                            </p>

                            <p
                              className={`
                                text-sm
                                font-bold
                                ${
                                  habis
                                    ? "text-red-600"
                                    : "text-gray-700"
                                }
                              `}
                            >
                              {stok}{" "}
                              {item.satuan || ""}
                            </p>
                          </div>
                        </div>

                        {/* =================================================
                            PILIH
                            ================================================= */}

                        <button
                          type="button"
                          disabled={habis}
                          onClick={() =>
                            handlePilih(item)
                          }
                          className={`
                            mt-4
                            w-full
                            rounded-xl
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            transition
                            ${
                              habis
                                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                            }
                          `}
                        >
                          {habis
                            ? "Stok Habis"
                            : "Pilih Barang"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-t
            border-gray-200
            bg-gray-50
            px-6
            py-4
          "
        >
          <p className="text-sm text-gray-500">
            Klik{" "}
            <strong>Pilih Barang</strong>{" "}
            untuk memasukkan barang ke keranjang.
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="
              rounded-xl
              border
              border-gray-300
              bg-white
              px-5
              py-2.5
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-100
            "
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}