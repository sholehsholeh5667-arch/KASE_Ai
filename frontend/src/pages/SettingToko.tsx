import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  Printer,
  RefreshCw,
  Save,
  Settings,
  Store,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import api from "../api/axios";


// ==========================================================
// TYPE
// ==========================================================

interface SettingsTokoData {
  id?: number;

  store_name: string;
  owner_name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;

  currency: string;
  tax: number;

  thermal_printer: string;
  receipt_width: number;

  backup_auto: boolean;
  language: string;
}


// ==========================================================
// DEFAULT
// ==========================================================

const DEFAULT_SETTINGS: SettingsTokoData = {
  store_name: "",
  owner_name: "",
  address: "",
  phone: "",
  email: "",
  logo: "",

  currency: "IDR",
  tax: 0,

  thermal_printer: "",
  receipt_width: 80,

  backup_auto: false,
  language: "id",
};


// ==========================================================
// HELPER
// ==========================================================

function safeString(
  value: unknown
): string {
  return String(
    value ?? ""
  );
}


function safeNumber(
  value: unknown,
  fallback: number
): number {
  const numberValue =
    Number(value);

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : fallback;
}


// ==========================================================
// PAGE
// ==========================================================

export default function SettingToko() {

  // ========================================================
  // STATE
  // ========================================================

  const [
    settings,
    setSettings,
  ] = useState<SettingsTokoData>(
    DEFAULT_SETTINGS
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // ========================================================
  // LOAD
  // ========================================================

  const loadSettings =
    async () => {

      try {

        setLoading(true);
        setError("");


        const response =
          await api.get(
            "/settings"
          );


        const data =
          response.data ?? {};


        setSettings({
          id:
            data.id,

          store_name:
            safeString(
              data.store_name
            ),

          owner_name:
            safeString(
              data.owner_name
            ),

          address:
            safeString(
              data.address
            ),

          phone:
            safeString(
              data.phone
            ),

          email:
            safeString(
              data.email
            ),

          logo:
            safeString(
              data.logo
            ),

          currency:
            safeString(
              data.currency
            ) || "IDR",

          tax: Math.max(
            0,
            safeNumber(
              data.tax,
              0
            )
          ),

          thermal_printer:
            safeString(
              data.thermal_printer
            ),

          receipt_width: Math.max(
            1,
            safeNumber(
              data.receipt_width,
              80
            )
          ),

          backup_auto:
            Boolean(
              data.backup_auto
            ),

          language:
            safeString(
              data.language
            ) || "id",
        });

      } catch (err: any) {

        console.error(
          "GAGAL MEMUAT SETTINGS:",
          err
        );


        const detail =
          err?.response?.data?.detail;


        setError(
          typeof detail ===
            "string"
            ? detail
            : "Pengaturan toko gagal dimuat."
        );

      } finally {

        setLoading(false);

      }
    };


  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {

    void loadSettings();

  }, []);


  // ========================================================
  // UPDATE
  // ========================================================

  const updateField = <
    K extends keyof SettingsTokoData
  >(
    field: K,
    value: SettingsTokoData[K]
  ) => {

    setSettings(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };


  // ========================================================
  // SAVE
  // ========================================================

  const handleSave =
    async () => {

      try {

        setSaving(true);
        setError("");
        setSuccess("");


        const payload = {

          store_name:
            safeString(
              settings.store_name
            ).trim(),

          owner_name:
            safeString(
              settings.owner_name
            ).trim(),

          address:
            safeString(
              settings.address
            ).trim(),

          phone:
            safeString(
              settings.phone
            ).trim(),

          email:
            safeString(
              settings.email
            ).trim() || null,

          logo:
            safeString(
              settings.logo
            ).trim() || null,

          currency:
            safeString(
              settings.currency
            ).trim() || "IDR",

          tax: Math.max(
            0,
            safeNumber(
              settings.tax,
              0
            )
          ),

          thermal_printer:
            safeString(
              settings.thermal_printer
            ).trim() || null,

          receipt_width:
            Math.max(
              1,
              safeNumber(
                settings.receipt_width,
                80
              )
            ),

          backup_auto:
            Boolean(
              settings.backup_auto
            ),

          language:
            safeString(
              settings.language
            ).trim() || "id",
        };


        console.log(
          "PAYLOAD SETTINGS:",
          payload
        );


        const response =
          await api.put(
            "/settings",
            payload
          );


        const saved =
          response.data ?? {};


        setSettings({
          id:
            saved.id ??
            settings.id,

          store_name:
            safeString(
              saved.store_name
            ),

          owner_name:
            safeString(
              saved.owner_name
            ),

          address:
            safeString(
              saved.address
            ),

          phone:
            safeString(
              saved.phone
            ),

          email:
            safeString(
              saved.email
            ),

          logo:
            safeString(
              saved.logo
            ),

          currency:
            safeString(
              saved.currency
            ) || "IDR",

          tax: Math.max(
            0,
            safeNumber(
              saved.tax,
              0
            )
          ),

          thermal_printer:
            safeString(
              saved.thermal_printer
            ),

          receipt_width:
            Math.max(
              1,
              safeNumber(
                saved.receipt_width,
                80
              )
            ),

          backup_auto:
            Boolean(
              saved.backup_auto
            ),

          language:
            safeString(
              saved.language
            ) || "id",
        });


        setSuccess(
          "Pengaturan toko berhasil disimpan."
        );

      } catch (err: any) {

        console.error(
          "GAGAL MENYIMPAN SETTINGS:",
          err
        );


        const detail =
          err?.response?.data?.detail;


        if (
          Array.isArray(detail)
        ) {

          setError(
            detail
              .map(
                (item: any) => {

                  const location =
                    Array.isArray(
                      item?.loc
                    )
                      ? item.loc.join(
                          "."
                        )
                      : "field";

                  return (
                    `${location}: ` +
                    `${item?.msg ?? "Data tidak valid."}`
                  );
                }
              )
              .join(" | ")
          );

        } else if (
          typeof detail ===
          "string"
        ) {

          setError(detail);

        } else {

          setError(
            "Pengaturan toko gagal disimpan."
          );
        }

      } finally {

        setSaving(false);

      }
    };


  // ========================================================
  // LOADING SCREEN
  // ========================================================

  if (loading) {

    return (

      <Box
        sx={{
          minHeight:
            "calc(100vh - 120px)",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >

        <Stack
          spacing={2}
          alignItems="center"
        >

          <CircularProgress />

          <Typography
            color="text.secondary"
          >
            Memuat pengaturan toko...
          </Typography>

        </Stack>

      </Box>

    );
  }


  // ========================================================
  // PAGE
  // ========================================================

  return (

    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        pb: 5,
      }}
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >

        <Box>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              color:
                "#0b2a5b",
            }}
          >
            Setting Toko
          </Typography>

          <Typography
            mt={0.5}
            color="text.secondary"
          >
            Kelola informasi toko,
            pencetakan, dan pengaturan
            sistem.
          </Typography>

        </Box>


        <Button
          variant="outlined"
          startIcon={
            <RefreshCw
              size={18}
            />
          }
          onClick={() =>
            void loadSettings()
          }
          disabled={saving}
          sx={{
            borderRadius: 2,
          }}
        >
          Muat Ulang
        </Button>

      </Box>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>

      )}


      {/* ====================================================
          INFORMASI TOKO
      ==================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          mb: 3,
          borderRadius: 3,
          border:
            "1px solid #e2e8f0",
        }}
      >

        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          mb={2}
        >

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              backgroundColor:
                "#eff6ff",
              color:
                "#0b2a5b",
            }}
          >

            <Store
              size={22}
            />

          </Box>


          <Box>

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Informasi Toko
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Data yang digunakan
              pada sistem dan faktur.
            </Typography>

          </Box>

        </Box>


        <Divider
          sx={{
            mb: 3,
          }}
        />


        <Grid
          container
          spacing={2.5}
        >

          {/* NAMA TOKO */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >

            <TextField
              fullWidth
              label="Nama Toko"
              placeholder="Contoh: KASE AI"
              value={
                settings.store_name
              }
              onChange={(event) =>
                updateField(
                  "store_name",
                  event.target.value
                )
              }
            />

          </Grid>


          {/* PEMILIK */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >

            <TextField
              fullWidth
              label="Nama Pemilik"
              placeholder="Nama pemilik usaha"
              value={
                settings.owner_name
              }
              onChange={(event) =>
                updateField(
                  "owner_name",
                  event.target.value
                )
              }
            />

          </Grid>


          {/* TELEPON */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >

            <TextField
              fullWidth
              label="Nomor Telepon"
              placeholder="Contoh: 081234567890"
              value={
                settings.phone
              }
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value
                )
              }
            />

          </Grid>


          {/* EMAIL */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >

            <TextField
              fullWidth
              type="email"
              label="Email"
              placeholder="nama@email.com"
              value={
                settings.email
              }
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
            />

          </Grid>


          {/* ALAMAT */}

          <Grid
            size={{
              xs: 12,
            }}
          >

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Alamat Toko"
              placeholder="Alamat lengkap toko"
              value={
                settings.address
              }
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value
                )
              }
            />

          </Grid>


          {/* LOGO */}

          <Grid
            size={{
              xs: 12,
            }}
          >

            <TextField
              fullWidth
              label="Logo"
              placeholder="URL atau path logo"
              helperText="Opsional."
              value={
                settings.logo
              }
              onChange={(event) =>
                updateField(
                  "logo",
                  event.target.value
                )
              }
            />

          </Grid>

        </Grid>

      </Paper>


      {/* ====================================================
          PENGATURAN CETAK
      ==================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          mb: 3,
          borderRadius: 3,
          border:
            "1px solid #e2e8f0",
        }}
      >

        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          mb={2}
        >

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              backgroundColor:
                "#f0fdf4",
              color:
                "#15803d",
            }}
          >

            <Printer
              size={22}
            />

          </Box>


          <Box>

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Pengaturan Cetak
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Konfigurasi printer dan
              format cetakan.
            </Typography>

          </Box>

        </Box>


        <Divider
          sx={{
            mb: 3,
          }}
        />


        <Grid
          container
          spacing={2.5}
        >

          {/* PRINTER */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >

            <TextField
              fullWidth
              label="Printer Thermal"
              placeholder="Contoh: POS-80"
              value={
                settings.thermal_printer
              }
              onChange={(event) =>
                updateField(
                  "thermal_printer",
                  event.target.value
                )
              }
            />

          </Grid>


          {/* LEBAR STRUK */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >

            <TextField
              fullWidth
              type="number"
              label="Lebar Struk"
              inputProps={{
                min: 1,
              }}
              helperText="Contoh: 58 atau 80 mm."
              value={
                settings.receipt_width
              }
              onChange={(event) =>
                updateField(
                  "receipt_width",
                  Math.max(
                    1,
                    Number(
                      event.target.value
                    ) || 80
                  )
                )
              }
            />

          </Grid>


          {/* MATA UANG */}

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >

            <FormControl
              fullWidth
            >

              <InputLabel>
                Mata Uang
              </InputLabel>

              <Select
                label="Mata Uang"
                value={
                  settings.currency ||
                  "IDR"
                }
                onChange={(event) =>
                  updateField(
                    "currency",
                    event.target.value
                  )
                }
              >

                <MenuItem value="IDR">
                  IDR — Rupiah
                </MenuItem>

              </Select>

            </FormControl>

          </Grid>


          {/* PAJAK */}

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >

            <TextField
              fullWidth
              type="number"
              label="Pajak Default"
              inputProps={{
                min: 0,
                step: 0.01,
              }}
              helperText="Tidak boleh negatif."
              value={
                settings.tax
              }
              onChange={(event) =>
                updateField(
                  "tax",
                  Math.max(
                    0,
                    Number(
                      event.target.value
                    ) || 0
                  )
                )
              }
            />

          </Grid>


          {/* BAHASA */}

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >

            <FormControl
              fullWidth
            >

              <InputLabel>
                Bahasa
              </InputLabel>

              <Select
                label="Bahasa"
                value={
                  settings.language ||
                  "id"
                }
                onChange={(event) =>
                  updateField(
                    "language",
                    event.target.value
                  )
                }
              >

                <MenuItem value="id">
                  Indonesia
                </MenuItem>

                <MenuItem value="en">
                  English
                </MenuItem>

              </Select>

            </FormControl>

          </Grid>

        </Grid>

      </Paper>


      {/* ====================================================
    PENGATURAN SISTEM
==================================================== */}

<Paper
  elevation={0}
  sx={{
    p: {
      xs: 2,
      md: 3,
    },
    mb: 3,
    borderRadius: 3,
    border: "1px solid #e2e8f0",
  }}
>
  {/* HEADER */}

  <Box
    display="flex"
    alignItems="center"
    gap={1.5}
    mb={2}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        color: "#475569",
      }}
    >
      <Settings size={22} />
    </Box>

    <Box>
      <Typography
        variant="h6"
        fontWeight={800}
      >
        Pengaturan Sistem
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
      >
        Pengaturan tambahan aplikasi.
      </Typography>
    </Box>
  </Box>

  <Divider sx={{ mb: 2 }} />

  {/* BACKUP OTOMATIS */}

  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      p: 2,
      borderRadius: 2,
      border: "1px solid #e2e8f0",
      backgroundColor: settings.backup_auto
        ? "#f0fdf4"
        : "#f8fafc",
      transition: "all 0.2s ease",
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        fontWeight={700}
        sx={{
          color: "#1e293b",
        }}
      >
        Backup otomatis
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.3,
        }}
      >
        Aktifkan pencadangan otomatis sistem.
      </Typography>

      {/* STATUS */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.8}
        sx={{
          mt: 1,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor:
              settings.backup_auto
                ? "#16a34a"
                : "#94a3b8",
          }}
        />

        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: settings.backup_auto
              ? "#15803d"
              : "#64748b",
          }}
        >
          {settings.backup_auto
            ? "Backup otomatis aktif"
            : "Backup otomatis tidak aktif"}
        </Typography>
      </Stack>
    </Box>

    <Switch
      checked={Boolean(
        settings.backup_auto
      )}
      onChange={(event) =>
        updateField(
          "backup_auto",
          event.target.checked
        )
      }
      color="success"
    />
  </Box>

  {/* INFO */}

  <Box
    sx={{
      mt: 2,
      p: 1.5,
      borderRadius: 2,
      backgroundColor: "#f8fafc",
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
    >
      Pengaturan backup akan tersimpan bersama
      pengaturan toko ketika tombol
      <strong> "Simpan Pengaturan" </strong>
      ditekan.
    </Typography>
  </Box>
</Paper>


      {/* ====================================================
          BUTTON AREA
      ==================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border:
            "1px solid #e2e8f0",
          backgroundColor:
            "#f8fafc",
        }}
      >

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          flexWrap="wrap"
        >

          <Box>

            <Typography
              fontWeight={800}
            >
              Simpan perubahan
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Pastikan data toko sudah benar
              sebelum menyimpan.
            </Typography>

          </Box>


          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Save
                  size={18}
                />
              )
            }
            onClick={
              handleSave
            }
            disabled={
              saving
            }
            sx={{
              minWidth: 200,
              borderRadius: 2,
              fontWeight: 700,
              py: 1.2,
            }}
          >

            {
              saving
                ? "Menyimpan..."
                : "Simpan Pengaturan"
            }

          </Button>

        </Box>

      </Paper>


      {/* ====================================================
          SUCCESS
      ==================================================== */}

      <Snackbar
        open={
          Boolean(success)
        }
        autoHideDuration={3500}
        onClose={() =>
          setSuccess("")
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >

        <Alert
          severity="success"
          variant="filled"
          onClose={() =>
            setSuccess("")
          }
          sx={{
            width: "100%",
          }}
        >
          {success}
        </Alert>

      </Snackbar>

    </Box>
  );
}