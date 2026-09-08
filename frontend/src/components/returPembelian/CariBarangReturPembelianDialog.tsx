import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  useEffect,
  useState,
} from "react";

import { pembelianService } from "../../services/pembelianService";

import { barangService } from "../../services/barangService";


// ==========================================================
// TYPE BARANG RETUR
// ==========================================================

interface BarangRetur {

  barang_id: number;

  kode_barang: string;

  nama_barang: string;

  qty_beli: number;

  qty_retur: number;

  harga: number;

}


// ==========================================================
// TYPE DETAIL PEMBELIAN
// ==========================================================

interface DetailPembelian {

  id: number;

  pembelian_id: number;

  barang_id: number;

  qty: number | string;

  harga_beli: number | string;

  subtotal: number | string;

}


// ==========================================================
// TYPE RESPONSE PEMBELIAN DETAIL
// ==========================================================

interface PembelianDetailResponse {

  id: number;

  no_faktur: string;

  supplier_id: number;

  detail?: DetailPembelian[];

}


// ==========================================================
// PROPS
// ==========================================================

interface Props {

  open: boolean;

  pembelianId: number | null;

  onClose: () => void;

  onSelect: (
    barang: BarangRetur
  ) => void;

}


// ==========================================================
// COMPONENT
// ==========================================================

export default function CariBarangReturPembelianDialog({

  open,

  pembelianId,

  onClose,

  onSelect,

}: Props) {

  // ========================================================
  // STATE
  // ========================================================

  const [
    barang,
    setBarang,
  ] = useState<BarangRetur[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  // ========================================================
  // LOAD DETAIL FAKTUR
  // ========================================================

  useEffect(() => {

    if (!open) {

      return;

    }


    if (
      pembelianId === null ||
      pembelianId <= 0
    ) {

      setBarang([]);

      setError(
        "Faktur pembelian belum dipilih."
      );

      return;

    }


    void loadBarang();

  }, [
    open,
    pembelianId,
  ]);


  // ========================================================
  // AMBIL DETAIL BARANG DARI FAKTUR
  // ========================================================

  const loadBarang = async () => {

    try {

      setLoading(true);

      setError(null);

      setBarang([]);


      // ====================================================
      // AMBIL FAKTUR YANG DIPILIH
      // ====================================================

      const pembelian =
        await pembelianService.getById(
          pembelianId as number
        ) as PembelianDetailResponse;


      // ====================================================
      // DETAIL FAKTUR
      // ====================================================

      const detail =
        Array.isArray(
          pembelian.detail
        )
          ? pembelian.detail
          : [];


      if (
        detail.length === 0
      ) {

        setError(
          "Faktur pembelian tidak memiliki detail barang."
        );

        return;

      }


      // ====================================================
      // AMBIL DATA BARANG BERDASARKAN ID
      // ====================================================

      const hasil: BarangRetur[] = [];


      for (
        const item of detail
      ) {

        try {

          const barangData =
            await barangService.getById(
              Number(
                item.barang_id
              )
            );


          hasil.push({

            barang_id:
              Number(
                item.barang_id
              ),

            kode_barang:
              barangData.kode_barang,

            nama_barang:
              barangData.nama_barang,

            // ------------------------------------------------
            // QTY YANG BENAR-BENAR DIBELI DI FAKTUR
            // ------------------------------------------------
            qty_beli:
              Number(
                item.qty
              ),

            // ------------------------------------------------
            // SEMENTARA 0.
            // Nanti dapat dikurangi berdasarkan retur
            // sebelumnya bila diperlukan.
            // ------------------------------------------------
            qty_retur: 0,

            // ------------------------------------------------
            // SANGAT PENTING:
            // gunakan HARGA DARI FAKTUR PEMBELIAN
            // ------------------------------------------------
            harga:
              Number(
                item.harga_beli
              ),

          });


        } catch (barangError) {

          console.error(
            `Gagal mengambil barang ID ${item.barang_id}:`,
            barangError
          );

        }

      }


      // ====================================================
      // HASIL AKHIR
      // ====================================================

      if (
        hasil.length === 0
      ) {

        setError(
          "Tidak ada barang yang dapat diambil dari faktur."
        );

        return;

      }


      setBarang(
        hasil
      );


    } catch (err) {

      console.error(
        "Gagal mengambil detail barang dari faktur:",
        err
      );

      setBarang([]);

      setError(
        "Gagal mengambil detail barang dari faktur."
      );


    } finally {

      setLoading(false);

    }

  };


  // ========================================================
  // PILIH BARANG
  // ========================================================

  const handleSelect = (
    item: BarangRetur
  ) => {

    onSelect(
      item
    );

    onClose();

  };


  // ========================================================
  // FORMAT RUPIAH
  // ========================================================

  const formatRupiah = (
    value: number
  ): string => {

    return (
      "Rp " +
      Number(
        value ?? 0
      ).toLocaleString(
        "id-ID"
      )
    );

  };


  // ========================================================
  // RENDER
  // ========================================================

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >

      <DialogTitle>
        Pilih Barang Retur Pembelian
      </DialogTitle>


      <DialogContent>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <Alert
            severity="error"
            sx={{
              mb: 2,
            }}
          >

            {error}

          </Alert>

        )}


        {/* ==================================================
            TABEL
        ================================================== */}

        <Table>


          {/* ================================================
              HEADER
          ================================================ */}

          <TableHead>

            <TableRow>

              <TableCell>
                Kode
              </TableCell>


              <TableCell>
                Nama Barang
              </TableCell>


              <TableCell align="right">
                Qty Beli
              </TableCell>


              <TableCell align="right">
                Harga
              </TableCell>


              <TableCell align="center">
                Aksi
              </TableCell>

            </TableRow>

          </TableHead>


          {/* ================================================
              BODY
          ================================================ */}

          <TableBody>


            {/* ==============================================
                LOADING
            ============================================== */}

            {loading && (

              <TableRow>

                <TableCell
                  colSpan={5}
                  align="center"
                >

                  <CircularProgress />

                </TableCell>

              </TableRow>

            )}


            {/* ==============================================
                DATA
            ============================================== */}

            {!loading &&
              !error &&
              barang.length > 0 &&

              barang.map(
                (
                  item
                ) => (

                  <TableRow
                    key={
                      item.barang_id
                    }
                  >


                    {/* ====================================
                        KODE
                    ==================================== */}

                    <TableCell>

                      {item.kode_barang}

                    </TableCell>


                    {/* ====================================
                        NAMA
                    ==================================== */}

                    <TableCell>

                      {item.nama_barang}

                    </TableCell>


                    {/* ====================================
                        QTY BELI
                    ==================================== */}

                    <TableCell
                      align="right"
                    >

                      {item.qty_beli}

                    </TableCell>


                    {/* ====================================
                        HARGA FAKTUR
                    ==================================== */}

                    <TableCell
                      align="right"
                    >

                      {formatRupiah(
                        item.harga
                      )}

                    </TableCell>


                    {/* ====================================
                        AKSI
                    ==================================== */}

                    <TableCell
                      align="center"
                    >

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          handleSelect(
                            item
                          )
                        }
                      >

                        Pilih

                      </Button>

                    </TableCell>


                  </TableRow>

                )
              )}


            {/* ==============================================
                KOSONG
            ============================================== */}

            {!loading &&
              !error &&
              barang.length === 0 && (

                <TableRow>

                  <TableCell
                    colSpan={5}
                    align="center"
                  >

                    Tidak ada barang pada faktur.

                  </TableCell>

                </TableRow>

              )}

          </TableBody>

        </Table>


      </DialogContent>

    </Dialog>

  );

}