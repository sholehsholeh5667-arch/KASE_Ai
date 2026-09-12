import api from "../api/axios";

import {
  Alert,
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import {
  useMemo,
  useState,
} from "react";

import {
  ReceiptIcon,
  Printer,
  Save,
  X,
} from "lucide-react";

import { usePembelian } from "../hooks/usePembelian";
import { usePermissions } from "../hooks/usePermissions";

import CariSupplierDialog from "../components/pembelian/CariSupplierDialog";
import CariBarangPembelianDialog from "../components/pembelian/CariBarangPembelianDialog";

import type { Supplier } from "../types/supplier";
import type { Barang } from "../types/barang";


// ==========================================================
// ITEM KERANJANG
// ==========================================================

interface KeranjangItem {
  barang: Barang;
  qty: number;
  harga_beli: number;
}


// ==========================================================
// DATA PEMBELIAN MINIMAL
// ==========================================================

interface PembelianMinimal {
  id?: number;
}


// ==========================================================
// PAGE PEMBELIAN
// ==========================================================

export default function Pembelian() {

  const {
    loading,
    data,
    search,
    setSearch,
    create,
    loadData,
  } = usePembelian();


  // ========================================================
  // PERMISSION
  // ========================================================

  const {
    hasPermission,
    loading: permissionLoading,
  } = usePermissions();

  const canView =
    !permissionLoading &&
    hasPermission("pembelian.view");

  const canCreate =
    !permissionLoading &&
    hasPermission("pembelian.create");

  const canUpdate =
    !permissionLoading &&
    hasPermission("pembelian.update");

  const canDelete =
    !permissionLoading &&
    hasPermission("pembelian.delete");


  // ========================================================
  // SUPPLIER
  // ========================================================

  const [openSupplier, setOpenSupplier] =
    useState(false);

  const [supplier, setSupplier] =
    useState<Supplier | null>(null);


  // ========================================================
  // BARANG
  // ========================================================

  const [openBarang, setOpenBarang] =
    useState(false);

  const [keranjang, setKeranjang] =
    useState<KeranjangItem[]>([]);


  // ========================================================
  // ID PEMBELIAN TERAKHIR
  //
  // Diprioritaskan dari transaksi yang baru saja disimpan.
  // Jika belum ada state tersebut, gunakan data transaksi
  // yang sudah dimuat dari backend sebagai fallback.
  // ========================================================

  const [lastPembelianId, setLastPembelianId] =
    useState<number | null>(null);


  const latestPembelianId =
    useMemo(() => {

      if (lastPembelianId) {
        return lastPembelianId;
      }

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {
        return 0;
      }

      return Math.max(
        ...data.map(
          (item: PembelianMinimal) =>
            Number(item.id) || 0
        )
      );

    }, [
      data,
      lastPembelianId,
    ]);


  // ========================================================
  // TAMBAH BARANG
  // ========================================================

  const tambahBarang = (
    barang: Barang
  ) => {

    if (
      permissionLoading ||
      !canCreate
    ) {
      return;
    }

    const existing =
      keranjang.find(
        (item) =>
          item.barang.id === barang.id
      );


    if (existing) {

      setKeranjang(
        keranjang.map(
          (item) =>
            item.barang.id === barang.id
              ? {
                  ...item,
                  qty: item.qty + 1,
                }
              : item
        )
      );

      return;
    }


    setKeranjang([
      ...keranjang,
      {
        barang,
        qty: 1,
        harga_beli:
          Number(
            barang.harga_jual
          ),
      },
    ]);
  };


  // ========================================================
  // GRAND TOTAL
  //
  // Modul Pembelian:
  // - tidak menggunakan pajak
  // - tidak menggunakan input diskon
  // ========================================================

  const grandTotal =
    keranjang.reduce(

      (
        totalNilai,
        item
      ) =>
        totalNilai +
        item.qty *
        item.harga_beli,

      0
    );


  // ========================================================
  // SIMPAN PEMBELIAN
  // ========================================================

  const simpanPembelian =
    async () => {

      // ----------------------------------------------------
      // VALIDASI PERMISSION
      // ----------------------------------------------------

      if (
        permissionLoading ||
        !canCreate
      ) {

        alert(
          "Anda tidak memiliki izin untuk membuat pembelian."
        );

        return;
      }


      // ----------------------------------------------------
      // VALIDASI SUPPLIER
      // ----------------------------------------------------

      if (!supplier) {

        alert(
          "Supplier belum dipilih."
        );

        return;
      }


      // ----------------------------------------------------
      // VALIDASI BARANG
      // ----------------------------------------------------

      if (
        keranjang.length === 0
      ) {

        alert(
          "Belum ada barang."
        );

        return;
      }


      try {

        // ==================================================
        // SIMPAN KE BACKEND
        // ==================================================

        const created: any =
          await create({

            supplier_id:
              supplier.id,

            detail:
              keranjang.map(
                (item) => ({

                  barang_id:
                    item.barang.id,

                  qty:
                    item.qty,

                  harga_beli:
                    item.harga_beli,

                })
              ),

          });


        // ==================================================
        // AMBIL ID DARI RESPONSE CREATE
        //
        // Kemungkinan response:
        // { id: 5219, ... }
        //
        // atau:
        // { data: { id: 5219, ... } }
        // ==================================================

        let pembelianId =
          Number(
            created?.id ??
            created?.data?.id ??
            0
          );


        // ==================================================
        // FALLBACK:
        // Jika create() tidak mengembalikan ID,
        // ambil transaksi terbaru dari backend.
        // ==================================================

        if (
          !pembelianId ||
          pembelianId <= 0
        ) {

          const response =
            await api.get(
              "/pembelian/",
              {
                params: {
                  page: 1,
                  size: 1,
                  search: "",
                },
              }
            );


          const responseData =
            response.data;


          const items =
            Array.isArray(
              responseData?.data
            )
              ? responseData.data
              : Array.isArray(
                  responseData?.items
                )
                ? responseData.items
                : [];


          const terbaru =
            items.length > 0
              ? items[0]
              : null;


          pembelianId =
            Number(
              terbaru?.id ?? 0
            );
        }


        // ==================================================
        // VALIDASI ID
        // ==================================================

        if (
          !pembelianId ||
          pembelianId <= 0
        ) {

          throw new Error(
            "ID pembelian terbaru tidak ditemukan."
          );
        }


        // ==================================================
        // SIMPAN ID TERAKHIR
        // ==================================================

        setLastPembelianId(
          pembelianId
        );


        // ==================================================
        // UPDATE DATA LIST
        // ==================================================

        await loadData();


        // ==================================================
        // RESET FORM
        // ==================================================

        setKeranjang([]);

        setSupplier(null);


        // ==================================================
        // INFORMASI BERHASIL
        // ==================================================

        alert(
          `Pembelian berhasil disimpan.\nID Pembelian: ${pembelianId}`
        );

      } catch (err) {

        console.error(
          "GAGAL SIMPAN PEMBELIAN:",
          err
        );

        alert(
          "Gagal menyimpan pembelian."
        );
      }
    };


  // ========================================================
  // CETAK FAKTUR TERAKHIR
  // ========================================================

  const cetakFakturTerakhir = async () => {

      if (
        permissionLoading ||
        !canView
      ) {

        alert(
          "Anda tidak memiliki izin untuk melihat atau mencetak pembelian."
        );

        return;
      }

      if (
        !latestPembelianId
      ) {

        alert(
          "Belum ada pembelian yang dapat dicetak."
        );

        return;
      }


      // ==================================================
      // BASE URL API
      // ==================================================

      const apiBase =
        (
          import.meta.env.VITE_API_URL + "/api/v1"
        ).replace(
          /\/$/,
          ""
        );


      // ==================================================
      // URL PREVIEW FAKTUR
      // ==================================================

      const url =
        `${apiBase}/pembelian/` +
        `${latestPembelianId}` +
        `/print-preview?jenis=faktur`;


      console.log(
        "MEMBUKA FAKTUR:",
        url
      );


      // ==================================================
      // BUKA PREVIEW DI TAB BARU
      // ==================================================

      const token =
        localStorage.getItem("access_token")
          ?.replace(/^Bearer\s+/i, "")
          .trim();

      const response = await fetch(url, {
          method: "GET",
        headers: {
         Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank", "noopener,noreferrer");
      };

   // ========================================================
  // RESET FORM
  // ========================================================

  const batalPembelian =
    () => {

      setKeranjang([]);

      setSupplier(null);
    };


  // ========================================================
  // RENDER
  // ========================================================

  if (permissionLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          color="text.secondary"
          fontWeight={600}
        >
          Memuat hak akses...
        </Typography>
      </Box>
    );
  }


  if (!canView) {
    return (
      <Box
        sx={{
          width: "100%",
          py: 4,
        }}
      >
        <Alert severity="error">
          Anda tidak memiliki izin untuk melihat Pembelian.
        </Alert>
      </Box>
    );
  }


  return (
    <Box
      sx={{
        width: "100%",
      }}
    >

      {/* ====================================================
          TITLE
      ==================================================== */}

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Pembelian
      </Typography>


      {/* ====================================================
          FORM PEMBELIAN
      ==================================================== */}

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
        }}
      >

        <Grid
          container
          spacing={2}
        >

          {/* =================================================
              NO FAKTUR
          ================================================= */}

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >

            <TextField
              fullWidth
              label="No Faktur"
              value="Otomatis"
              disabled
            />

          </Grid>


          {/* =================================================
              TANGGAL
          ================================================= */}

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >

            <TextField
              fullWidth
              label="Tanggal"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />

          </Grid>


          {/* =================================================
              SUPPLIER
          ================================================= */}

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >

            <TextField
              fullWidth
              label="Supplier"
              value={
                supplier?.nama ?? ""
              }
              InputProps={{
                readOnly: true,
              }}
            />


            {canCreate && (
              <Button
                variant="outlined"
                sx={{
                  mt: 2,
                }}
                onClick={() =>
                  setOpenSupplier(
                    true
                  )
                }
                disabled={
                  loading ||
                  permissionLoading
                }
              >
                Pilih Supplier
              </Button>
            )}

          </Grid>

        </Grid>


        <Divider
          sx={{
            my: 3,
          }}
        />


        {/* =================================================
            SEARCH + TAMBAH BARANG
        ================================================= */}

        <Grid
          container
          spacing={2}
          mb={2}
        >

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >

            <TextField
              fullWidth
              label="Cari Pembelian"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </Grid>


          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >

            {canCreate && (
              <Button
                variant="contained"
                startIcon={
                  <ReceiptIcon
                    size={18}
                  />
                }
                onClick={() =>
                  setOpenBarang(true)
                }
                disabled={
                  loading ||
                  permissionLoading
                }
              >
                Tambah Barang
              </Button>
            )}

          </Grid>

        </Grid>


        {/* =================================================
            DETAIL BARANG
        ================================================= */}

        <Table
          sx={{
            mt: 2,
          }}
        >

          <TableHead>

            <TableRow>

              <TableCell>
                Kode
              </TableCell>

              <TableCell>
                Nama Barang
              </TableCell>

              <TableCell align="right">
                Qty
              </TableCell>

              <TableCell align="right">
                Harga Beli
              </TableCell>

              <TableCell align="right">
                Subtotal
              </TableCell>

              <TableCell align="center">
                Aksi
              </TableCell>

            </TableRow>

          </TableHead>


          <TableBody>

            {/* =================================================
                EMPTY
            ================================================= */}

            {keranjang.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={6}
                  align="center"
                >
                  Belum ada barang.
                </TableCell>

              </TableRow>

            )}


            {/* =================================================
                ITEMS
            ================================================= */}

            {keranjang.map(
              (
                item
              ) => (

                <TableRow
                  key={
                    item.barang.id
                  }
                >

                  <TableCell>
                    {
                      item.barang
                        .kode_barang
                    }
                  </TableCell>


                  <TableCell>
                    {
                      item.barang
                        .nama_barang
                    }
                  </TableCell>


                  <TableCell align="right">
                    {item.qty}
                  </TableCell>


                  <TableCell align="right">

                    Rp{" "}

                    {
                      item.harga_beli.toLocaleString(
                        "id-ID"
                      )
                    }

                  </TableCell>


                  <TableCell align="right">

                    Rp{" "}

                    {
                      (
                        item.qty *
                        item.harga_beli
                      ).toLocaleString(
                        "id-ID"
                      )
                    }

                  </TableCell>


                  <TableCell align="center">

                    {canCreate && (
                      <Button
                        color="error"
                        size="small"
                        startIcon={
                          <X
                            size={15}
                          />
                        }
                        onClick={() =>
                          setKeranjang(
                            keranjang.filter(
                              (x) =>
                                x.barang.id !==
                                item.barang.id
                            )
                          )
                        }
                      >
                        Hapus
                      </Button>
                    )}

                  </TableCell>

                </TableRow>

              )
            )}

          </TableBody>

        </Table>


        <Divider
          sx={{
            my: 3,
          }}
        />


        {/* =================================================
            TOTAL
        ================================================= */}

        <Typography
          variant="h5"
          fontWeight="bold"
        >
          Grand Total : Rp{" "}

          {
            grandTotal.toLocaleString(
              "id-ID"
            )
          }

        </Typography>


        {/* =================================================
            AKSI
        ================================================= */}

        <Box
          mt={3}
          display="flex"
          gap={2}
          flexWrap="wrap"
        >

          {/* =================================================
              SIMPAN
          ================================================= */}

          {canCreate && (
            <Button
              variant="contained"
              color="success"
              startIcon={
                <Save
                  size={18}
                />
              }
              onClick={
                simpanPembelian
              }
              disabled={
                loading ||
                permissionLoading ||
                !supplier ||
                keranjang.length === 0
              }
            >
              {
                loading
                  ? "Menyimpan..."
                  : "Simpan Pembelian"
              }
            </Button>
          )}


          {/* =================================================
              BATAL
          ================================================= */}

          <Button
            variant="outlined"
            color="error"
            startIcon={
              <X
                size={18}
              />
            }
            onClick={
              batalPembelian
            }
          >
            Batal
          </Button>


          {/* =================================================
              CETAK FAKTUR TERAKHIR
          ================================================= */}

          {canView && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={
                <Printer
                  size={18}
                />
              }
              onClick={
                cetakFakturTerakhir
              }
              disabled={
                !latestPembelianId
              }
            >
              Cetak Faktur Terakhir
            </Button>
          )}

        </Box>

      </Paper>


      {/* ====================================================
          DIALOG SUPPLIER
      ==================================================== */}

      <CariSupplierDialog
        open={
          openSupplier
        }
        onClose={() =>
          setOpenSupplier(
            false
          )
        }
        onSelect={
          (item) => {

            setSupplier(
              item
            );

            setOpenSupplier(
              false
            );

          }
        }
      />
      
      {/* ====================================================
          DIALOG BARANG
      ==================================================== */}

      <CariBarangPembelianDialog
        open={
          openBarang
        }
        onClose={() =>
          setOpenBarang(
            false
          )
        }
        onSelect={
          (barang) => {

            tambahBarang(
              barang
            );

            setOpenBarang(
              false
            );

          }
        }
      />

    </Box>
  );
}