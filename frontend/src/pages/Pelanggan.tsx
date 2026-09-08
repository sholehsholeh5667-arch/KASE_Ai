import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

import type {
  Pelanggan,
  PelangganCreate,
} from "../types/pelanggan";

import { pelangganService } from "../services/pelangganService";
import { usePermissions } from "../hooks/usePermissions";


/* =====================================================
   FORM DEFAULT
===================================================== */

const emptyForm: PelangganCreate = {
  nama: "",
  alamat: "",
  telepon: "",
  email: "",
};


/* =====================================================
   PAGE PELANGGAN
===================================================== */

export default function Pelanggan() {

  /* ===================================================
     PERMISSION
  =================================================== */

  const {
    hasPermission,
    loading: permissionLoading,
  } = usePermissions();


  const canView =
    !permissionLoading &&
    hasPermission("pelanggan.view");

  const canCreate =
    !permissionLoading &&
    hasPermission("pelanggan.create");

  const canUpdate =
    !permissionLoading &&
    hasPermission("pelanggan.update");

  const canDelete =
    !permissionLoading &&
    hasPermission("pelanggan.delete");

  const hasActions =
    canUpdate || canDelete;


  /* ===================================================
     DATA
  =================================================== */

  const [pelanggan, setPelanggan] =
    useState<Pelanggan[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  /* ===================================================
     DIALOG
  =================================================== */

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedPelanggan, setSelectedPelanggan] =
    useState<Pelanggan | null>(null);

  const [form, setForm] =
    useState<PelangganCreate>({
      ...emptyForm,
    });


  /* ===================================================
     VALIDATION ERROR
  =================================================== */

  const [errors, setErrors] = useState({
    nama: "",
    telepon: "",
    email: "",
  });


  /* ===================================================
     DELETE DIALOG
  =================================================== */

  const [openDelete, setOpenDelete] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Pelanggan | null>(null);


  /* ===================================================
     SNACKBAR
  =================================================== */

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      severity: "success" as
        | "success"
        | "error",
      message: "",
    });


  /* ===================================================
     LOAD DATA
  =================================================== */

  const loadData = async () => {

    if (
      permissionLoading ||
      !canView
    ) {
      setPelanggan([]);
      setLoading(false);
      return;
    }

    try {

      setLoading(true);

      const data =
        await pelangganService.getAll();

      setPelanggan(data);

    } catch (error) {

      console.error(
        "Gagal mengambil data pelanggan:",
        error
      );

      setSnackbar({
        open: true,
        severity: "error",
        message:
          "Gagal mengambil data pelanggan.",
      });

    } finally {

      setLoading(false);

    }
  };


  /* ===================================================
     LOAD DATA SAAT PERMISSION SIAP
  =================================================== */

  useEffect(() => {
    if (permissionLoading) {
      return;
    }

    if (!canView) {
      setPelanggan([]);
      setLoading(false);
      return;
    }

    void loadData();
  }, [
    permissionLoading,
    canView,
  ]);


  /* ===================================================
     FILTER SEARCH
  =================================================== */

  const filteredPelanggan =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return pelanggan;
      }

      return pelanggan.filter(
        (item) =>
          item.nama
            .toLowerCase()
            .includes(keyword) ||

          (item.telepon ?? "")
            .toLowerCase()
            .includes(keyword) ||

          (item.email ?? "")
            .toLowerCase()
            .includes(keyword) ||

          (item.alamat ?? "")
            .toLowerCase()
            .includes(keyword)
      );

    }, [pelanggan, search]);


  /* ===================================================
     STATISTIK
  =================================================== */

  const totalPelanggan =
    pelanggan.length;

  const denganTelepon =
    pelanggan.filter((item) => {
      const telepon = (
        item.telepon ?? ""
      ).trim().replace(/[\s-]/g, "");

      return /^(\+62|62|0)[0-9]{8,14}$/.test(
        telepon
      );
    }).length;

  const denganEmail =
    pelanggan.filter((item) => {
      const email = (
        item.email ?? ""
      ).trim();

      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      );
    }).length;


  /* ===================================================
     BUKA TAMBAH
  =================================================== */

  const handleTambah = () => {

    if (
      permissionLoading ||
      !canCreate
    ) {
      return;
    }

    setSelectedPelanggan(
      null
    );

    setForm({
      ...emptyForm,
    });

    setErrors({
      nama: "",
      telepon: "",
      email: "",
    });

    setOpenDialog(true);
  };


  /* ===================================================
     BUKA EDIT
  =================================================== */

  const handleEdit = (
    item: Pelanggan
  ) => {

    if (
      permissionLoading ||
      !canUpdate
    ) {
      return;
    }

    setSelectedPelanggan(
      item
    );

    setForm({
      nama: item.nama,
      alamat:
        item.alamat ?? "",
      telepon:
        item.telepon ?? "",
      email:
        item.email ?? "",
    });

    setErrors({
      nama: "",
      telepon: "",
      email: "",
    });

    setOpenDialog(true);
  };


  /* ===================================================
     TUTUP FORM
  =================================================== */

  const handleCloseDialog = () => {

    if (loading) {
      return;
    }

    setOpenDialog(false);

    setSelectedPelanggan(
      null
    );

    setForm({
      ...emptyForm,
    });

    setErrors({
      nama: "",
      telepon: "",
      email: "",
    });
  };


  /* ===================================================
     INPUT FORM
  =================================================== */

  const handleChange = (
    field: keyof PelangganCreate,
    value: string
  ) => {

    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    if (field === "nama") {

      setErrors(
        (previous) => ({
          ...previous,
          nama: "",
        })
      );
    }

    if (field === "telepon") {

      setErrors(
        (previous) => ({
          ...previous,
          telepon: "",
        })
      );
    }

    if (field === "email") {

      setErrors(
        (previous) => ({
          ...previous,
          email: "",
        })
      );
    }
  };


  /* ===================================================
     VALIDASI FORM
  =================================================== */

  const validateForm = () => {

    const newErrors = {
      nama: "",
      telepon: "",
      email: "",
    };


    /* ===============================================
       NAMA
    =============================================== */

    const nama =
      form.nama.trim();

    if (!nama) {

      newErrors.nama =
        "Nama pelanggan wajib diisi.";

    } else if (
      nama.length < 2
    ) {

      newErrors.nama =
        "Nama pelanggan minimal 2 karakter.";

    } else if (
      nama.toLowerCase() === "string"
    ) {

      newErrors.nama =
        'Nilai "string" tidak diperbolehkan sebagai nama pelanggan.';
    }


    /* ===============================================
       TELEPON
    =============================================== */

    const telepon =
      (
        form.telepon ?? ""
      ).trim();

    if (telepon) {

      const normalizedPhone =
        telepon.replace(
          /[\s-]/g,
          ""
        );

      const phoneValid =
        /^(\+62|62|0)[0-9]{8,14}$/.test(
          normalizedPhone
        );

      if (!phoneValid) {

        newErrors.telepon =
          "Nomor telepon tidak valid. Contoh: 081234567890.";
      }
    }


    /* ===============================================
       EMAIL
    =============================================== */

    const email =
      (
        form.email ?? ""
      ).trim();

    if (email) {

      const emailValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        );

      if (!emailValid) {

        newErrors.email =
          "Format email tidak valid.";

      } else if (
        email.toLowerCase() ===
        "string@string.com"
      ) {

        newErrors.email =
          'Email contoh "string@string.com" tidak diperbolehkan.';
      }
    }


    setErrors(newErrors);

    return (
      !newErrors.nama &&
      !newErrors.telepon &&
      !newErrors.email
    );
  };


  /* ===================================================
     SIMPAN
  =================================================== */

  const handleSave = async () => {

    const canSave =
      selectedPelanggan
        ? canUpdate
        : canCreate;

    if (
      permissionLoading ||
      !canSave
    ) {

      setSnackbar({
        open: true,
        severity: "error",
        message:
          "Anda tidak memiliki izin untuk melakukan tindakan ini.",
      });

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {

      setLoading(true);

      const payload:
        PelangganCreate = {

        nama:
          form.nama.trim(),

        alamat:
          form.alamat?.trim() ||
          "",

        telepon:
          form.telepon?.trim() ||
          "",

        email:
          form.email?.trim() ||
          "",
      };


      /* ===============================================
         EDIT
      =============================================== */

      if (selectedPelanggan) {

        await pelangganService.update(
          selectedPelanggan.id,
          payload
        );

        setSnackbar({
          open: true,
          severity: "success",
          message:
            "Data pelanggan berhasil diperbarui.",
        });

      }


      /* ===============================================
         TAMBAH
      =============================================== */

      else {

        await pelangganService.create(
          payload
        );

        setSnackbar({
          open: true,
          severity: "success",
          message:
            "Pelanggan berhasil ditambahkan.",
        });

      }


      setOpenDialog(false);

      setSelectedPelanggan(
        null
      );

      setForm({
        ...emptyForm,
      });

      setErrors({
        nama: "",
        telepon: "",
        email: "",
      });

      await loadData();

    } catch (error: any) {

      console.error(
        "Gagal menyimpan pelanggan:",
        error
      );

      const detail =
        error?.response?.data?.detail;

      setSnackbar({
        open: true,
        severity: "error",
        message:
          typeof detail === "string"
            ? detail
            : "Gagal menyimpan data pelanggan.",
      });

    } finally {

      setLoading(false);

    }
  };


  /* ===================================================
     BUKA DELETE
  =================================================== */

  const handleDelete = (
    item: Pelanggan
  ) => {

    if (
      permissionLoading ||
      !canDelete
    ) {
      return;
    }

    setDeleteTarget(item);

    setOpenDelete(true);
  };


  /* ===================================================
     KONFIRMASI DELETE
  =================================================== */

  const handleConfirmDelete =
    async () => {

      if (
        !canDelete
      ) {

        setSnackbar({
          open: true,
          severity: "error",
          message:
            "Anda tidak memiliki izin untuk menghapus pelanggan.",
        });

        setOpenDelete(false);

        setDeleteTarget(
          null
        );

        return;
      }

      if (!deleteTarget) {
        return;
      }

      try {

        setLoading(true);

        await pelangganService.remove(
          deleteTarget.id
        );

        setSnackbar({
          open: true,
          severity: "success",
          message:
            "Pelanggan berhasil dihapus.",
        });

        setOpenDelete(false);

        setDeleteTarget(
          null
        );

        await loadData();

      } catch (error: any) {

        console.error(
          "Gagal menghapus pelanggan:",
          error
        );

        const detail =
          error?.response?.data?.detail;

        setSnackbar({
          open: true,
          severity: "error",
          message:
            typeof detail === "string"
              ? detail
              : "Gagal menghapus pelanggan.",
        });

      } finally {

        setLoading(false);

      }
    };


  /* ===================================================
     UI
  =================================================== */

  if (
    !permissionLoading &&
    !canView
  ) {
    return (
      <Box
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          minHeight: "100%",
          backgroundColor:
            "#f4f7fb",
        }}
      >
        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e1e7ef",
            borderRadius: 3,
            maxWidth: 720,
            mx: "auto",
            mt: {
              xs: 4,
              md: 8,
            },
          }}
        >
          <CardContent
            sx={{
              py: {
                xs: 5,
                md: 7,
              },
              textAlign:
                "center",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
                borderRadius:
                  "50%",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                backgroundColor:
                  "#edf4ff",
                color: "#0b356d",
              }}
            >
              🔒
            </Box>

            <Typography
              variant="h5"
              fontWeight={800}
              color="#0b356d"
            >
              Akses Ditolak
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#52637a",
                fontSize: 15,
              }}
            >
              Anda tidak memiliki izin
              untuk melihat data pelanggan.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: "#7a8798",
              }}
            >
              Hubungi administrator toko
              untuk mendapatkan akses.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (

    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        backgroundColor:
          "#f4f7fb",
        minHeight:
          "100%",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 3,
        }}
      >

        <Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0b356d",
              mb: 0.5,
            }}
          >
            Pelanggan
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Kelola data pelanggan KASE AI
            dengan mudah dan rapi.
          </Typography>

        </Box>


        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >

          <Button
            variant="outlined"
            startIcon={
              <RefreshIcon />
            }
            onClick={
              loadData
            }
            disabled={loading}
            sx={{
              borderColor:
                "#0b356d",
              color:
                "#0b356d",
              fontWeight: 700,
            }}
          >
            Refresh
          </Button>


          {canCreate && (
            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              onClick={
                handleTambah
              }
              disabled={
                loading ||
                permissionLoading
              }
              sx={{
                backgroundColor:
                  "#d9b42f",
                color:
                  "#082f63",
                fontWeight: 800,
                "&:hover": {
                  backgroundColor:
                    "#caa523",
                },
              }}
            >
              Tambah Pelanggan
            </Button>
          )}

        </Box>

      </Box>


      {/* =================================================
          STAT CARD
      ================================================= */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >

        {/* TOTAL */}

        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e1e7ef",
            borderRadius: 3,
          }}
        >

          <CardContent>

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >

              <Box>

                <Typography
                  color="text.secondary"
                  variant="body2"
                  fontWeight={600}
                >
                  Total Pelanggan
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="#0b356d"
                  mt={1}
                >
                  {totalPelanggan}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Data pelanggan terdaftar
                </Typography>

              </Box>

              <PeopleIcon
                sx={{
                  fontSize: 42,
                  color: "#246bce",
                  backgroundColor:
                    "#eaf2ff",
                  p: 1,
                  borderRadius: 2,
                }}
              />

            </Box>

          </CardContent>

        </Card>


        {/* TELEPON */}

        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e1e7ef",
            borderRadius: 3,
          }}
        >

          <CardContent>

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >

              <Box>

                <Typography
                  color="text.secondary"
                  variant="body2"
                  fontWeight={600}
                >
                  Memiliki Telepon
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="#0b356d"
                  mt={1}
                >
                  {denganTelepon}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Pelanggan dengan nomor telepon
                </Typography>

              </Box>

              <PhoneIcon
                sx={{
                  fontSize: 42,
                  color: "#168a54",
                  backgroundColor:
                    "#e8f6ef",
                  p: 1,
                  borderRadius: 2,
                }}
              />

            </Box>

          </CardContent>

        </Card>


        {/* EMAIL */}

        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e1e7ef",
            borderRadius: 3,
          }}
        >

          <CardContent>

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >

              <Box>

                <Typography
                  color="text.secondary"
                  variant="body2"
                  fontWeight={600}
                >
                  Memiliki Email
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="#0b356d"
                  mt={1}
                >
                  {denganEmail}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Pelanggan dengan email
                </Typography>

              </Box>

              <EmailIcon
                sx={{
                  fontSize: 42,
                  color: "#7b4ce2",
                  backgroundColor:
                    "#f1eaff",
                  p: 1,
                  borderRadius: 2,
                }}
              />

            </Box>

          </CardContent>

        </Card>

      </Box>


      {/* =================================================
          MAIN TABLE CARD
      ================================================= */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid #e1e7ef",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >

        <Box
          sx={{
            p: 2.5,
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: {
              xs: "stretch",
              md: "center",
            },
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 2,
          }}
        >

          <Box>

            <Typography
              variant="h6"
              fontWeight={800}
              color="#0b356d"
            >
              Daftar Pelanggan
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {filteredPelanggan.length}
              {" "}
              pelanggan
              {" "}ditampilkan
            </Typography>

          </Box>


          <TextField
            size="small"
            placeholder="Cari nama, telepon, email..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            InputProps={{
              startAdornment: (
                <SearchIcon
                  sx={{
                    mr: 1,
                    color:
                      "text.secondary",
                  }}
                />
              ),
            }}
            sx={{
              width: {
                xs: "100%",
                md: 330,
              },
            }}
          />

        </Box>


        <Divider />


        {/* =================================================
            TABLE
        ================================================= */}

        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >

          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse:
                "collapse",
              minWidth: 850,

              "& th": {
                textAlign: "left",
                padding:
                  "14px 16px",
                backgroundColor:
                  "#f8fafc",
                color: "#52637a",
                fontSize: 13,
                fontWeight: 800,
                borderBottom:
                  "1px solid #e1e7ef",
              },

              "& td": {
                padding:
                  "15px 16px",
                borderBottom:
                  "1px solid #edf0f4",
                fontSize: 14,
                color: "#26364d",
              },

              "& tbody tr:hover": {
                backgroundColor:
                  "#f8fbff",
              },
            }}
          >

            <thead>

              <tr>

                <th
                  style={{
                    width: 60,
                  }}
                >
                  No
                </th>

                <th>
                  Pelanggan
                </th>

                <th>
                  Telepon
                </th>

                <th>
                  Email
                </th>

                <th>
                  Alamat
                </th>

                {hasActions && (
                  <th
                    style={{
                      width: 120,
                      textAlign:
                        "center",
                    }}
                  >
                    Aksi
                  </th>
                )}

              </tr>

            </thead>


            <tbody>

              {/* LOADING */}

              {loading &&
                pelanggan.length === 0 && (

                  <tr>

                    <td
                      colSpan={hasActions ? 6 : 5}
                      style={{
                        textAlign:
                          "center",
                        padding: 40,
                      }}
                    >
                      Memuat data pelanggan...
                    </td>

                  </tr>

                )}


              {/* EMPTY */}

              {!loading &&
                filteredPelanggan.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={hasActions ? 6 : 5}
                      style={{
                        textAlign:
                          "center",
                        padding: 50,
                      }}
                    >

                      <PeopleIcon
                        sx={{
                          fontSize: 50,
                          color:
                            "#b6c0ce",
                          mb: 1,
                        }}
                      />

                      <Typography
                        fontWeight={700}
                        color="text.secondary"
                      >
                        {search
                          ? "Pelanggan tidak ditemukan"
                          : "Belum ada pelanggan"}
                      </Typography>

                      {!search && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={0.5}
                        >
                          {canCreate
                            ? 'Klik "Tambah Pelanggan" untuk menambahkan data.'
                            : "Anda tidak memiliki izin untuk menambahkan pelanggan."}
                        </Typography>
                      )}

                    </td>

                  </tr>

                )}


              {/* DATA */}

              {filteredPelanggan.map(
                (item, index) => (

                  <tr
                    key={item.id}
                  >

                    <td>
                      {index + 1}
                    </td>


                    <td>

                      <Box
                        sx={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 1.5,
                        }}
                      >

                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius:
                              "50%",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            backgroundColor:
                              "#eaf2ff",
                            color:
                              "#0b356d",
                            fontWeight: 800,
                          }}
                        >
                          {item.nama
                            .charAt(0)
                            .toUpperCase()}
                        </Box>

                        <Typography
                          fontWeight={700}
                        >
                          {item.nama}
                        </Typography>

                      </Box>

                    </td>


                    <td>
                      {item.telepon ||
                        "-"}
                    </td>


                    <td>
                      {item.email ||
                        "-"}
                    </td>


                    <td>
                      {item.alamat ||
                        "-"}
                    </td>


                    {hasActions && (
                      <td>

                        <Box
                          sx={{
                            display:
                              "flex",
                            justifyContent:
                              "center",
                            gap: 0.5,
                          }}
                        >

                        {canUpdate && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                            disabled={
                              loading ||
                              permissionLoading
                            }
                            sx={{
                              color:
                                "#246bce",
                              backgroundColor:
                                "#edf4ff",
                              "&:hover": {
                                backgroundColor:
                                  "#dbeaff",
                              },
                            }}
                          >
                            <EditIcon
                              fontSize="small"
                            />
                          </IconButton>
                        )}


                        {canDelete && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                            disabled={
                              loading ||
                              permissionLoading
                            }
                            sx={{
                              color:
                                "#d32f2f",
                              backgroundColor:
                                "#fff0f0",
                              "&:hover": {
                                backgroundColor:
                                  "#ffe0e0",
                              },
                            }}
                          >
                            <DeleteIcon
                              fontSize="small"
                            />
                          </IconButton>
                        )}

                        </Box>

                      </td>
                    )}

                  </tr>

                )
              )}

            </tbody>

          </Box>

        </Box>

      </Card>


      {/* =================================================
          DIALOG TAMBAH / EDIT
      ================================================= */}

      <Dialog
        open={openDialog}
        onClose={
          handleCloseDialog
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#0b356d",
          }}
        >
          {selectedPelanggan
            ? "Edit Pelanggan"
            : "Tambah Pelanggan"}
        </DialogTitle>


        <DialogContent
          dividers
        >

          <Box
            sx={{
              display:
                "flex",
              flexDirection:
                "column",
              gap: 2,
              pt: 1,
            }}
          >

            <TextField
              label="Nama Pelanggan"
              required
              fullWidth
              value={
                form.nama
              }
              onChange={(event) =>
                handleChange(
                  "nama",
                  event.target.value
                )
              }
              error={
                Boolean(
                  errors.nama
                )
              }
              helperText={
                errors.nama ||
                "Nama pelanggan wajib diisi."
              }
              autoFocus
            />


            <TextField
              label="Nomor Telepon"
              fullWidth
              value={
                form.telepon ??
                ""
              }
              onChange={(event) =>
                handleChange(
                  "telepon",
                  event.target.value
                )
              }
              error={
                Boolean(
                  errors.telepon
                )
              }
              helperText={
                errors.telepon ||
                "Contoh: 081234567890"
              }
              placeholder="081234567890"
            />


            <TextField
              label="Email"
              type="email"
              fullWidth
              value={
                form.email ??
                ""
              }
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value
                )
              }
              error={
                Boolean(
                  errors.email
                )
              }
              helperText={
                errors.email ||
                "Contoh: pelanggan@email.com"
              }
              placeholder="pelanggan@email.com"
            />


            <TextField
              label="Alamat"
              fullWidth
              multiline
              minRows={3}
              value={
                form.alamat ??
                ""
              }
              onChange={(event) =>
                handleChange(
                  "alamat",
                  event.target.value
                )
              }
              placeholder="Alamat pelanggan"
            />

          </Box>

        </DialogContent>


        <DialogActions
          sx={{
            p: 2,
          }}
        >

          <Button
            onClick={
              handleCloseDialog
            }
            disabled={loading}
            sx={{
              color: "#52637a",
              fontWeight: 700,
            }}
          >
            Batal
          </Button>


          <Button
            variant="contained"
            onClick={
              handleSave
            }
            disabled={
              loading ||
              permissionLoading ||
              !form.nama.trim() ||
              !(selectedPelanggan
                ? canUpdate
                : canCreate)
            }
            sx={{
              backgroundColor:
                "#d9b42f",
              color:
                "#082f63",
              fontWeight: 800,
              "&:hover": {
                backgroundColor:
                  "#caa523",
              },
            }}
          >
            {loading
              ? "Menyimpan..."
              : selectedPelanggan
                ? "Simpan Perubahan"
                : "Simpan Pelanggan"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* =================================================
          DIALOG DELETE
      ================================================= */}

      <Dialog
        open={openDelete}
        onClose={() => {

          if (!loading) {

            setOpenDelete(false);

            setDeleteTarget(
              null
            );

          }

        }}
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#b71c1c",
          }}
        >
          Hapus Pelanggan
        </DialogTitle>


        <DialogContent>

          <Typography>
            Apakah Anda yakin ingin
            menghapus pelanggan:
          </Typography>

          <Typography
            fontWeight={800}
            mt={1}
          >
            "{deleteTarget?.nama}"
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={1}
          >
            Data yang sudah dihapus
            tidak dapat dikembalikan
            melalui halaman ini.
          </Typography>

        </DialogContent>


        <DialogActions
          sx={{
            p: 2,
          }}
        >

          <Button
            onClick={() => {

              setOpenDelete(false);

              setDeleteTarget(
                null
              );

            }}
            disabled={loading}
          >
            Batal
          </Button>


          <Button
            variant="contained"
            color="error"
            onClick={
              handleConfirmDelete
            }
            disabled={
              loading ||
              permissionLoading ||
              !hasPermission(
                "pelanggan.delete"
              )
            }
            startIcon={
              <DeleteIcon />
            }
          >
            {loading
              ? "Menghapus..."
              : "Hapus"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* =================================================
          SNACKBAR
      ================================================= */}

      <Snackbar
        open={
          snackbar.open
        }
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar(
            (previous) => ({
              ...previous,
              open: false,
            })
          )
        }
      >

        <Alert
          severity={
            snackbar.severity
          }
          variant="filled"
          onClose={() =>
            setSnackbar(
              (previous) => ({
                ...previous,
                open: false,
              })
            )
          }
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>
  );
}
