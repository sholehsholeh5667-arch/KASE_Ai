import {
  useCallback,
  useState,
} from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { useStockOpname } from "../hooks/useStockOpname";
import CariBarangDialog from "../components/stockOpname/CariBarangDialog";
import type { Barang } from "../types/barang";

type OpnameItem = {
  barang: Barang;
  stok_fisik: number;
  keterangan: string;
};

export default function StockOpname() {

  const {
      create,
      loadData,
      data,
      loading,
    } = useStockOpname();

  const [catatan, setCatatan] =
    useState("");

  const [daftarBarang, setDaftarBarang] =
    useState<OpnameItem[]>([]);

  const [bukaDialogBarang, setBukaDialogBarang] =
    useState(false);

    // ======================================================
// RESET FORM
// ======================================================

const resetForm = useCallback((): void => {

  setDaftarBarang([]);

  setCatatan("");

}, []);


// ======================================================
// PILIH BARANG
// ======================================================

const pilihBarang = useCallback(
  (barang: Barang) => {

    const sudahAda = daftarBarang.find(

      (item) =>

        item.barang.id === barang.id

    );
    if (sudahAda) {

      alert("Barang sudah dipilih.");

      return;

    }

    setDaftarBarang((old) => [

      ...old,

      {

        barang,

        stok_fisik: barang.stok,

        keterangan: "",

      },

    ]);

    setBukaDialogBarang(false);

  },

  [daftarBarang]

);


// ======================================================
// HITUNG SELISIH
// ======================================================

const hitungSelisih = useCallback(

  (item: OpnameItem): number => {

    return item.stok_fisik - item.barang.stok

  },

  []

);


// ======================================================
// UBAH STOK FISIK
// ======================================================

const ubahStokFisik = useCallback(

  (

    barangId: number,

    stok: number

  ) => {

    setDaftarBarang((old) =>

      old.map((item) =>

        item.barang.id === barangId

          ? {

              ...item,

              stok_fisik: stok,

            }

          : item

      )

    );

  },

  []

);


// ======================================================
// UBAH KETERANGAN
// ======================================================

const ubahKeterangan = useCallback(

  (

    barangId: number,

    keterangan: string

  ) => {

    setDaftarBarang((old) =>

      old.map((item) =>

        item.barang.id === barangId

          ? {

              ...item,

              keterangan,

            }

          : item

      )

    );

  },

  []

);


// ======================================================
// HAPUS BARANG
// ======================================================

const hapusBarang = useCallback(

  (barangId: number) => {

    setDaftarBarang((old) =>

      old.filter(

        (item) =>

          item.barang.id !== barangId

      )

    );

  },

  []

);


// ======================================================
// SIMPAN STOCK OPNAME
// ======================================================

const simpanStockOpname = async () => {

  if (daftarBarang.length === 0) {

    alert("Belum ada barang.");

    return;

  }

  await create({

    nomor: "",

    created_by: 1,

    keterangan: catatan,

    detail: daftarBarang.map((item) => ({

      barang_id: item.barang.id,

      stok_sistem: item.barang.stok,

      stok_fisik: item.stok_fisik,

      selisih: hitungSelisih(item),

      keterangan: item.keterangan,

    })),

  });

  alert("Stock Opname berhasil disimpan.");

  resetForm();

  loadData();

};

    return (
  <Box p={3}>

    <Typography
      variant="h5"
      fontWeight="bold"
      mb={2}
    >
      Stock Opname
    </Typography>

    <Card>

      <CardContent>

        <Stack
          direction="row"
          spacing={2}
          mb={3}
        >

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              setBukaDialogBarang(true)
            }
          >
            Tambah Barang
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={simpanStockOpname}
          >
            Simpan
          </Button>

          <Button
            variant="outlined"
            color="warning"
            startIcon={<RestartAltIcon />}
            onClick={resetForm}
          >
            Reset
          </Button>

        </Stack>

        <Divider sx={{ mb: 3 }} />

        <TextField
          label="Catatan"
          fullWidth
          multiline
          rows={2}
          value={catatan}
          onChange={(e) =>
            setCatatan(e.target.value)
          }
        />

      </CardContent>

    </Card>

    <Paper sx={{ mt: 3 }}>

      <Table>

        <TableHead>

          <TableRow>

            <TableCell>Kode</TableCell>

            <TableCell>Nama Barang</TableCell>

            <TableCell align="right">
              Stok Sistem
            </TableCell>

            <TableCell align="right">
              Stok Fisik
            </TableCell>

            <TableCell align="right">
              Selisih
            </TableCell>

            <TableCell>
              Keterangan
            </TableCell>

            <TableCell align="center">
              Aksi
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {daftarBarang.map((item) => (

            <TableRow
              key={item.barang.id}
            >

              <TableCell>
                {item.barang.kode_barang}
              </TableCell>

              <TableCell>
                {item.barang.nama_barang}
              </TableCell>

              <TableCell align="right">
                {item.barang.stok}
              </TableCell>

              <TableCell align="right">

                <TextField
                  type="number"
                  size="small"
                  value={item.stok_fisik}
                  onChange={(e) =>
                    ubahStokFisik(
                      item.barang.id,
                      Number(e.target.value)
                    )
                  }
                />

              </TableCell>

              <TableCell align="right">

                {hitungSelisih(item)}

              </TableCell>

              <TableCell>

                <TextField
                  size="small"
                  value={item.keterangan}
                  onChange={(e) =>
                    ubahKeterangan(
                      item.barang.id,
                      e.target.value
                    )
                  }
                />

              </TableCell>

              <TableCell align="center">

                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() =>
                    hapusBarang(
                      item.barang.id
                    )
                  }
                >
                  Hapus
                </Button>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </Paper>
{/* ======================================================
    RIWAYAT STOCK OPNAME
====================================================== */}

<Card sx={{ mt: 3 }}>
  <CardContent>

    <Typography
      variant="h6"
      fontWeight="bold"
      mb={2}
    >
      Riwayat Stock Opname
    </Typography>

    <Divider sx={{ mb: 2 }} />

    <Paper variant="outlined">

      <Table>

        <TableHead>

          <TableRow>

            <TableCell>Nomor</TableCell>

            <TableCell>Tanggal</TableCell>

            <TableCell>Status</TableCell>

            <TableCell>Keterangan</TableCell>

            <TableCell align="center">
              Jumlah Item
            </TableCell>

            <TableCell align="center">
              Aksi
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {loading ? (

            <TableRow>

              <TableCell
                colSpan={6}
                align="center"
              >
                Memuat riwayat...
              </TableCell>

            </TableRow>

          ) : data.length === 0 ? (

            <TableRow>

              <TableCell
                colSpan={6}
                align="center"
              >
                Belum ada riwayat Stock Opname.
              </TableCell>

            </TableRow>

          ) : (

            data.map((opname) => (

              <TableRow key={opname.id}>

                <TableCell>
                  {opname.nomor}
                </TableCell>

                <TableCell>
                  {new Date(
                    opname.tanggal
                  ).toLocaleString("id-ID")}
                </TableCell>

                <TableCell>
                  {opname.status}
                </TableCell>

                <TableCell>
                  {opname.keterangan || "-"}
                </TableCell>

                <TableCell align="center">
                  {opname.detail?.length ?? 0}
                </TableCell>

                <TableCell align="center">

                  <Button
                    size="small"
                    variant="outlined"
                  >
                    Detail
                  </Button>

                </TableCell>

              </TableRow>

            ))

          )}

        </TableBody>

      </Table>

    </Paper>

  </CardContent>
</Card>
    <CariBarangDialog
  open={bukaDialogBarang}
  onClose={() => setBukaDialogBarang(false)}
  onSelect={pilihBarang}
/>

  </Box>
);
  <></>
}
