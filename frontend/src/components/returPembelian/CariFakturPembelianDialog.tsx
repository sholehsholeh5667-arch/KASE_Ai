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

import type {
  Pembelian,
} from "../../types/pembelian";


// ==========================================================
// PROPS
// ==========================================================

interface Props {
  open: boolean;

  onClose: () => void;

  onSelect: (
    item: Pembelian
  ) => void;
}


// ==========================================================
// COMPONENT
// ==========================================================

export default function CariFakturPembelianDialog({
  open,
  onClose,
  onSelect,
}: Props) {

  // ========================================================
  // STATE
  // ========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    data,
    setData,
  ] = useState<Pembelian[]>([]);


  // ========================================================
  // LOAD DATA SAAT DIALOG DIBUKA
  // ========================================================

  useEffect(() => {

    if (!open) {
      return;
    }

    void loadData();

  }, [open]);


  // ========================================================
  // LOAD FAKTUR PEMBELIAN DARI API
  // ========================================================

  const loadData = async () => {

    try {

      setLoading(true);

      setError(null);


      // ====================================================
      // API
      //
      // Backend asli mengirim:
      //
      // {
      //   data: [...],
      //   total: 59
      // }
      //
      // pembelianService.getAll()
      // sudah menormalisasi menjadi:
      //
      // {
      //   items: [...],
      //   total,
      //   page,
      //   size,
      //   pages
      // }
      // ====================================================

      const response =
        await pembelianService.getAll(
          1,
          100,
          ""
        );


      // ====================================================
      // MASUKKAN DATA KE STATE
      // ====================================================

      if (
        Array.isArray(
          response.items
        )
      ) {

        setData(
          response.items
        );

      } else {

        setData([]);

      }


    } catch (err) {

      console.error(
        "Gagal mengambil faktur pembelian:",
        err
      );

      setData([]);

      setError(
        "Gagal mengambil data faktur pembelian."
      );


    } finally {

      setLoading(false);

    }

  };


  // ========================================================
  // PILIH FAKTUR
  // ========================================================

  const handleSelect = (
    item: Pembelian
  ) => {

    onSelect(item);

    onClose();

  };


  // ========================================================
  // FORMAT TANGGAL
  // ========================================================

  const formatTanggal = (
    tanggal: string
  ): string => {

    if (!tanggal) {
      return "-";
    }

    return tanggal.substring(
      0,
      10
    );

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

      {/* ==================================================
          TITLE
      ================================================== */}

      <DialogTitle>
        Pilih Faktur Pembelian
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
            TABLE
        ================================================== */}

        <Table>

          {/* ================================================
              HEADER
          ================================================ */}

          <TableHead>

            <TableRow>

              <TableCell>
                No Faktur
              </TableCell>

              <TableCell>
                Tanggal
              </TableCell>

              <TableCell>
                Supplier ID
              </TableCell>

              <TableCell align="right">
                Subtotal
              </TableCell>

              <TableCell align="right">
                Grand Total
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
                  colSpan={6}
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
              data.length > 0 &&

              data.map(
                (
                  item
                ) => (

                  <TableRow
                    key={item.id}
                  >

                    {/* ====================================
                        NO FAKTUR
                    ==================================== */}

                    <TableCell>

                      {item.no_faktur}

                    </TableCell>


                    {/* ====================================
                        TANGGAL
                    ==================================== */}

                    <TableCell>

                      {formatTanggal(
                        item.tanggal
                      )}

                    </TableCell>


                    {/* ====================================
                        SUPPLIER
                    ==================================== */}

                    <TableCell>

                      {item.supplier_id}

                    </TableCell>


                    {/* ====================================
                        SUBTOTAL
                    ==================================== */}

                    <TableCell
                      align="right"
                    >

                      {formatRupiah(
                        item.subtotal
                      )}

                    </TableCell>


                    {/* ====================================
                        GRAND TOTAL
                    ==================================== */}

                    <TableCell
                      align="right"
                    >

                      {formatRupiah(
                        item.grand_total
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
                DATA KOSONG
            ============================================== */}

            {!loading &&
              !error &&
              data.length === 0 && (

                <TableRow>

                  <TableCell
                    colSpan={6}
                    align="center"
                  >

                    Tidak ada faktur pembelian.

                  </TableCell>

                </TableRow>

              )}

          </TableBody>

        </Table>

      </DialogContent>

    </Dialog>

  );

}