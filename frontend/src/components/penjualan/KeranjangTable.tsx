import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  Add,
  DeleteOutline,
  Remove,
  ShoppingCart,
  ImageOutlined,
} from "@mui/icons-material";

import type { PenjualanItem } from "../../types/penjualan";

interface Props {
  items: PenjualanItem[];

  onTambahQty: (barangId: number) => void;

  onKurangiQty: (barangId: number) => void;

  onHapus: (barangId: number) => void;
}


// =====================================================
// FORMAT RUPIAH
// =====================================================

const formatRupiah = (nominal: number) => {
  return `Rp ${Number(nominal || 0).toLocaleString(
    "id-ID"
  )}`;
};


// =====================================================
// URL FOTO
// =====================================================

const getFotoUrl = (
  foto?: string | null
): string | null => {

  if (!foto) {
    return null;
  }

  const value = foto.trim();

  if (!value) {
    return null;
  }

  // URL lengkap
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  // Path dari backend
  if (value.startsWith("/")) {
    return `${import.meta.env.VITE_API_URL}${value}`;
  }

     return `${import.meta.env.VITE_API_URL}/${value}`;
};

// =====================================================
// COMPONENT
// =====================================================

export default function KeranjangTable({
  items,
  onTambahQty,
  onKurangiQty,
  onHapus,
}: Props) {

  return (

    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        width: "100%",
        overflowX: "auto",
      }}
    >

      <Table
        sx={{
          minWidth: 760,
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <TableHead>

          <TableRow
            sx={{
              backgroundColor: "#f8fafc",
            }}
          >

            <TableCell
              sx={{
                fontWeight: 800,
                color: "#334155",
                width: 90,
              }}
            >
              Foto
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 800,
                color: "#334155",
              }}
            >
              Barang
            </TableCell>

            <TableCell
              align="center"
              sx={{
                fontWeight: 800,
                color: "#334155",
              }}
            >
              Qty
            </TableCell>

            <TableCell
              align="right"
              sx={{
                fontWeight: 800,
                color: "#334155",
              }}
            >
              Harga
            </TableCell>

            <TableCell
              align="right"
              sx={{
                fontWeight: 800,
                color: "#334155",
              }}
            >
              Subtotal
            </TableCell>

            <TableCell
              align="center"
              sx={{
                fontWeight: 800,
                color: "#334155",
                width: 90,
              }}
            >
              Aksi
            </TableCell>

          </TableRow>

        </TableHead>


        {/* =================================================
            BODY
        ================================================= */}

        <TableBody>

          {/* =================================================
              KOSONG
          ================================================= */}

          {items.length === 0 && (

            <TableRow>

              <TableCell
                colSpan={6}
                align="center"
                sx={{
                  py: 7,
                }}
              >

                <Stack
                  alignItems="center"
                  spacing={1.5}
                >

                  <Box
                    sx={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f1f5f9",
                    }}
                  >

                    <ShoppingCart
                      sx={{
                        fontSize: 30,
                        color: "#94a3b8",
                      }}
                    />

                  </Box>

                  <Typography
                    fontWeight={700}
                    color="text.secondary"
                  >
                    Keranjang masih kosong
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Tambahkan barang untuk memulai
                    transaksi.
                  </Typography>

                </Stack>

              </TableCell>

            </TableRow>

          )}


          {/* =================================================
              DATA BARANG
          ================================================= */}

          {items.map((item) => {

            // PenjualanItem versi lama mungkin belum
            // memiliki property foto.
            const foto = getFotoUrl(
              (item as PenjualanItem & {
                foto?: string | null;
              }).foto
            );

            const subtotal =
              Number(item.qty || 0) *
              Number(item.harga_jual || 0);


            return (

              <TableRow
                key={item.barang_id}
                hover
                sx={{
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >

                {/* =================================================
                    FOTO
                ================================================= */}

                <TableCell>

                  {foto ? (

                    <Box
                      component="img"
                      src={foto}
                      alt={item.nama_barang}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";

                        const parent =
                          event.currentTarget
                            .parentElement;

                        if (parent) {
                          parent
                            .querySelector(
                              ".foto-placeholder"
                            )
                            ?.removeAttribute(
                              "style"
                            );
                        }
                      }}
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: 2,
                        objectFit: "cover",
                        border: "1px solid",
                        borderColor: "divider",
                        display: "block",
                      }}
                    />

                  ) : null}


                  <Box
                    className="foto-placeholder"
                    sx={{
                      width: 58,
                      height: 58,
                      borderRadius: 2,
                      display: foto
                        ? "none"
                        : "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f1f5f9",
                      border: "1px solid",
                      borderColor: "#e2e8f0",
                    }}
                  >

                    <ImageOutlined
                      sx={{
                        color: "#94a3b8",
                        fontSize: 28,
                      }}
                    />

                  </Box>

                </TableCell>


                {/* =================================================
                    NAMA BARANG
                ================================================= */}

                <TableCell>

                  <Typography
                    fontWeight={700}
                    color="#1e293b"
                  >
                    {item.nama_barang}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    ID Barang: {item.barang_id}
                  </Typography>

                </TableCell>


                {/* =================================================
                    QTY
                ================================================= */}

                <TableCell align="center">

                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    alignItems="center"
                  >

                    <IconButton
                      size="small"
                      onClick={() =>
                        onKurangiQty(
                          item.barang_id
                        )
                      }
                      disabled={
                        Number(item.qty) <= 1
                      }
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        width: 30,
                        height: 30,
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>


                    <Box
                      sx={{
                        minWidth: 38,
                        textAlign: "center",
                        fontWeight: 800,
                      }}
                    >
                      {item.qty}
                    </Box>


                    <IconButton
                      size="small"
                      onClick={() =>
                        onTambahQty(
                          item.barang_id
                        )
                      }
                      sx={{
                        border: "1px solid",
                        borderColor: "primary.main",
                        color: "primary.main",
                        width: 30,
                        height: 30,
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>

                  </Stack>

                </TableCell>


                {/* =================================================
                    HARGA
                ================================================= */}

                <TableCell align="right">

                  <Typography
                    fontWeight={600}
                  >
                    {formatRupiah(
                      item.harga_jual
                    )}
                  </Typography>

                </TableCell>


                {/* =================================================
                    SUBTOTAL
                ================================================= */}

                <TableCell align="right">

                  <Typography
                    fontWeight={800}
                    color="#0b2a5b"
                  >
                    {formatRupiah(subtotal)}
                  </Typography>

                </TableCell>


                {/* =================================================
                    HAPUS
                ================================================= */}

                <TableCell align="center">

                  <IconButton
                    color="error"
                    onClick={() =>
                      onHapus(
                        item.barang_id
                      )
                    }
                    title="Hapus barang"
                    sx={{
                      backgroundColor:
                        "rgba(211,47,47,0.06)",

                      "&:hover": {
                        backgroundColor:
                          "rgba(211,47,47,0.12)",
                      },
                    }}
                  >

                    <DeleteOutline />

                  </IconButton>

                </TableCell>

              </TableRow>

            );
          })}

        </TableBody>

      </Table>

    </TableContainer>
  );
}