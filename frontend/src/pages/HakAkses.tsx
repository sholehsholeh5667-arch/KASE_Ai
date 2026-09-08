import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import {
  Check,
  ChevronRight,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { userService } from "../services/userService";

import type {
  UserMe,
  UserMember,
  UserRole,
} from "../types/user";

import type {
  Permission,
} from "../types/permission";



// ==========================================================
// ROLE RESMI BISNIS
// ==========================================================

const ROLE_INFO: Record<
  UserRole,
  {
    nama: string;
    deskripsi: string;
  }
> = {
  owner: {
    nama: "Owner",
    deskripsi:
      "Pemilik usaha dengan akses manajemen penuh.",
  },

  admin: {
    nama: "Administrator",
    deskripsi:
      "Pengelola administrasi dan operasional.",
  },

  kasir: {
    nama: "Kasir",
    deskripsi:
      "Petugas transaksi penjualan dan pelanggan.",
  },

  gudang: {
    nama: "Gudang",
    deskripsi:
      "Petugas stok, gudang, opname, dan retur.",
  },

  akuntan: {
    nama: "Akuntan",
    deskripsi:
      "Pengelola laporan dan administrasi keuangan.",
  },
};


// ==========================================================
// ROLE BAWAHAN YANG BOLEH DIBUAT OWNER
// ==========================================================

const MEMBER_ROLES: UserRole[] = [
  "admin",
  "kasir",
  "gudang",
  "akuntan",
];


// ==========================================================
// RINGKASAN PERMISSION UI
// ==========================================================
//
// Backend tetap menjadi sumber kebenaran permission.
// Ini hanya untuk tampilan ringkas.
// ==========================================================

// ==========================================================
// PERMISSION DATABASE
// ==========================================================
// Permission aktual diambil dari backend/database melalui
// endpoint /permissions/role/{role}.
// Sumber akses aktual tidak lagi memakai konfigurasi manual.


// HELPER
// ==========================================================

function normalizeRole(
  role: string
): UserRole | null {

  const value =
    role
      .trim()
      .toLowerCase();

  if (
    value === "owner" ||
    value === "admin" ||
    value === "kasir" ||
    value === "gudang" ||
    value === "akuntan"
  ) {
    return value;
  }

  return null;
}


function getInitial(
  nama: string
): string {
  return (
    nama
      .trim()
      .charAt(0)
      .toUpperCase() || "?"
  );
}


// ==========================================================
// COMPONENT
// ==========================================================

export default function HakAkses() {
  // ========================================================
  // SIMPAN PERMISSION ROLE
  // ========================================================

  // ========================================================
// SIMPAN PERMISSION ROLE
// ========================================================

async function handleSavePermissions(
  role: UserRole
): Promise<void> {

  try {

    setPermissionSaving(true);

    const permissions =
      draftPermissions[role] ?? [];

    const result =
      await userService.updateRolePermissions(
        role,
        permissions
      );

    const updated: Permission[] =
      result.permissions;

    setRolePermissions(
      (current) => ({
        ...current,
        [role]: updated,
      })
    );

    setDraftPermissions(
      (current) => ({
        ...current,
        [role]: updated.map(
          (permission: Permission) =>
            permission.kode
        ),
      })
    );

    setSnackbar({
      open: true,
      message:
        `Hak akses ${ROLE_INFO[role].nama} berhasil disimpan.`,
      severity: "success",
    });

  } catch (error: unknown) {

    console.error(
      "Gagal menyimpan hak akses:",
      error
    );

    const axiosError =
      error as {
        response?: {
          data?: {
            detail?: unknown;
          };
        };
      };

    const detail =
      axiosError.response?.data?.detail;

    let message =
      "Gagal menyimpan hak akses.";

    if (
      typeof detail ===
      "string"
    ) {
      message = detail;
    } else if (
      detail &&
      typeof detail === "object"
    ) {
      message =
        "Data permission tidak valid.";
    }

    setSnackbar({
      open: true,
      message,
      severity: "error",
    });

  } finally {

    setPermissionSaving(false);
  }
}

  // --------------------------------------------------------
  // CURRENT USER
  // --------------------------------------------------------

  const [
    currentUser,
    setCurrentUser,
  ] = useState<UserMe | null>(
    null
  );


  // --------------------------------------------------------
  // MEMBERS
  // --------------------------------------------------------

  const [
    members,
    setMembers,
  ] = useState<UserMember[]>(
    []
  );


  // --------------------------------------------------------
  // PERMISSION DARI DATABASE
  // --------------------------------------------------------

  const [
    rolePermissions,
    setRolePermissions,
  ] = useState<Record<string, Permission[]>>({});

  const [
    draftPermissions,
    setDraftPermissions,
  ] = useState<
    Record<string, string[]>
  >({});

  const [
   permissionSaving,
   setPermissionSaving,
  ] = useState(false);

  const [
    permissionLoading,
    setPermissionLoading,
  ] = useState(false);

  const [
    permissionError,
    setPermissionError,
  ] = useState<string | null>(null);


  // --------------------------------------------------------
  // SELECTED MEMBER
  // --------------------------------------------------------

  const [
    selectedId,
    setSelectedId,
  ] = useState<number | null>(
    null
  );


  // --------------------------------------------------------
  // SEARCH
  // --------------------------------------------------------

  const [
    search,
    setSearch,
  ] = useState("");


  // --------------------------------------------------------
  // LOADING
  // --------------------------------------------------------

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  // --------------------------------------------------------
  // DIALOG
  // --------------------------------------------------------

  const [
    openAdd,
    setOpenAdd,
  ] = useState(false);


  const [
    openEdit,
    setOpenEdit,
  ] = useState(false);


  // --------------------------------------------------------
  // FORM
  // --------------------------------------------------------

  const [
    form,
    setForm,
  ] = useState({
    nama: "",
    username: "",
    password: "",
    email: "",
    role: "kasir" as UserRole,
  });


  // --------------------------------------------------------
  // SNACKBAR
  // --------------------------------------------------------

  const [
    snackbar,
    setSnackbar,
  ] = useState<{
    open: boolean;
    message: string;
    severity:
      | "success"
      | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // ========================================================
  // LOAD MEMBERS
  // ========================================================

  async function loadMembers() {

    const data =
      await userService.getMembers(
        "",
        true
      );

    setMembers(data);

    if (
      data.length > 0 &&
      selectedId === null
    ) {
      setSelectedId(
        data[0].id
      );
    }
  }


  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {

    let mounted = true;

    const load = async () => {

      try {

        setLoading(true);

        const me =
          await userService.me();

        if (!mounted) {
          return;
        }

        setCurrentUser(me);

        const role =
          normalizeRole(
            me.role
          );

        // --------------------------------------------------
        // HANYA OWNER YANG MEMUAT ANGGOTA
        // --------------------------------------------------

        if (role === "owner") {

          const data =
            await userService.getMembers(
              "",
              true
            );

          if (!mounted) {
            return;
          }

          setMembers(data);

          if (data.length > 0) {
            setSelectedId(
              data[0].id
            );
          }
        }

      } catch (error) {

        console.error(
          "Gagal memuat Hak Akses:",
          error
        );

        if (mounted) {

          setSnackbar({
            open: true,
            message:
              "Gagal memuat data hak akses.",
            severity: "error",
          });
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }
      }
    };


    load();

    return () => {
      mounted = false;
    };

  }, []);


  // ========================================================
  // LOAD PERMISSION DARI DATABASE
  // ========================================================

  useEffect(() => {

    if (!currentUser) {
      return;
    }

    const currentRole =
      normalizeRole(currentUser.role);

    if (!currentRole) {
      return;
    }

    let mounted = true;

    const loadPermissions = async () => {

      try {

        setPermissionLoading(true);
        setPermissionError(null);

        if (currentRole === "owner") {

          const roles: UserRole[] = [
            "owner",
            "admin",
            "kasir",
            "gudang",
            "akuntan",
          ];

          const results =
            await Promise.all(
              roles.map(
                async (role) => {
                  const data =
                    await userService
                      .getRolePermissions(
                        role
                      );

                  return {
                    role,
                    data,
                  };
                }
              )
            );

          if (!mounted) {
            return;
          }

          const mapped: Record<
            string,
            Permission[]
          > = {};

          for (const result of results) {
            mapped[result.role] =
              result.data;
          }

          setRolePermissions(mapped);
          const draft: Record<
          string,
          string[]
        > = {};

for (const role of Object.keys(mapped)) {
  draft[role] =
    mapped[role].map(
      (permission) =>
        permission.kode
    );
}

setDraftPermissions(draft);

        } else {

          const data =
            await userService
              .getMyPermissions();

          if (!mounted) {
            return;
          }

          setRolePermissions({
            [currentRole]: data,
          });
          
          setDraftPermissions({
            [currentRole]:
            data.map(
              (permission) =>
                permission.kode
              ),
            });
        }

      } catch (error) {

        console.error(
          "Gagal memuat permission dari database:",
          error
        );

        if (mounted) {
          setPermissionError(
            "Gagal memuat hak akses dari database."
          );
        }

      } finally {

        if (mounted) {
          setPermissionLoading(false);
        }
      }

    };

    void loadPermissions();

    return () => {
      mounted = false;
    };

  }, [currentUser]);


  // ========================================================
  // SEARCH
  // ========================================================

  useEffect(() => {

    const role =
      currentUser
        ? normalizeRole(
            currentUser.role
          )
        : null;

    if (role !== "owner") {
      return;
    }

    const timer =
      window.setTimeout(
        async () => {

          try {

            const data =
              await userService.getMembers(
                search,
                true
              );

            setMembers(data);

            if (
              data.length > 0 &&
              !data.some(
                (member) =>
                  member.id ===
                  selectedId
              )
            ) {
              setSelectedId(
                data[0].id
              );
            }

          } catch (error) {

            console.error(
              "Gagal mencari anggota:",
              error
            );
          }
        },
        250
      );

    return () =>
      window.clearTimeout(timer);

  }, [
    search,
    currentUser,
  ]);


  // ========================================================
  // SELECTED MEMBER
  // ========================================================

  const selectedMember =
    useMemo(
      () =>
        members.find(
          (member) =>
            member.id ===
            selectedId
        ) ?? null,
      [
        members,
        selectedId,
      ]
    );


  // ========================================================
  // CURRENT ROLE
  // ========================================================

  const currentRole =
    currentUser
      ? normalizeRole(
          currentUser.role
        )
      : null;


  const currentRolePermissions =
    currentRole
      ? rolePermissions[
          currentRole
        ] ?? []
      : [];


  // ========================================================
  // DETAIL ROLE
  // ========================================================

  const selectedRole =
    selectedMember
      ? normalizeRole(
          selectedMember.role
        )
      : null;


  const selectedRoleInfo =
    selectedRole
      ? ROLE_INFO[
          selectedRole
        ]
      : null;


  const selectedRolePermissions =
  selectedRole
    ? rolePermissions[
        selectedRole
      ] ?? []
    : [];


  // ========================================================
  // STATISTICS
  // ========================================================

  const total =
    members.length;

  const active =
    members.filter(
      (member) =>
        member.aktif
    ).length;

  const inactive =
    members.filter(
      (member) =>
        !member.aktif
    ).length;


  // ========================================================
  // FORM OPEN
  // ========================================================

  function openCreateDialog() {

    setForm({
      nama: "",
      username: "",
      password: "",
      email: "",
      role: "kasir",
    });

    setOpenAdd(true);
  }


  function openEditDialog() {

    if (!selectedMember) {
      return;
    }

    const role =
      normalizeRole(
        selectedMember.role
      );

    if (!role) {
      return;
    }

    setForm({
      nama:
        selectedMember.nama,
      username:
        selectedMember.username,
      password: "",
      email:
        selectedMember.email ??
        "",
      role,
    });

    setOpenEdit(true);
  }
// ========================================================
// TOGGLE PERMISSION
// ========================================================

   function handlePermissionToggle(
   role: UserRole,
   permissionCode: string
  ): void {

    setDraftPermissions(
    (current) => {

      const existing =
        current[role] ?? [];

      const has =
        existing.includes(
          permissionCode
        );

      const next =
        has
          ? existing.filter(
              (code) =>
                code !==
                permissionCode
            )
          : [
              ...existing,
              permissionCode,
            ];

          return {
           ...current,
           [role]: next,
          };
        }
      );
    }


  // ========================================================
  // CREATE MEMBER
  // ========================================================

  async function handleCreate() {

    if (
      !form.nama.trim() ||
      !form.username.trim() ||
      !form.password
    ) {

      setSnackbar({
        open: true,
        message:
          "Nama, username, dan password wajib diisi.",
        severity: "error",
      });

      return;
    }

    try {

      setSaving(true);

      await userService.createMember({
        nama:
          form.nama.trim(),
        username:
          form.username.trim(),
        password:
          form.password,
        email:
          form.email.trim()
            ? form.email.trim()
            : null,
        role:
          form.role,
        aktif: true,
      });

      setOpenAdd(false);

      await loadMembers();

      setSnackbar({
        open: true,
        message:
          "Anggota berhasil ditambahkan.",
        severity: "success",
      });

    } catch (error: any) {

      const detail =
        error?.response?.data?.detail;

      setSnackbar({
        open: true,
        message:
          typeof detail === "string"
            ? detail
            : "Gagal menambahkan anggota.",
        severity: "error",
      });

    } finally {

      setSaving(false);
    }
  }


  // ========================================================
  // UPDATE MEMBER
  // ========================================================

  async function handleUpdate() {

    if (!selectedMember) {
      return;
    }

    try {

      setSaving(true);

      await userService.updateMember(
        selectedMember.id,
        {
          nama:
            form.nama.trim(),
          email:
            form.email.trim()
              ? form.email.trim()
              : null,
          role:
            form.role,
        }
      );

      setOpenEdit(false);

      await loadMembers();

      setSnackbar({
        open: true,
        message:
          "Data anggota berhasil diperbarui.",
        severity: "success",
      });

    } catch (error: any) {

      const detail =
        error?.response?.data?.detail;

      setSnackbar({
        open: true,
        message:
          typeof detail === "string"
            ? detail
            : "Gagal memperbarui anggota.",
        severity: "error",
      });

    } finally {

      setSaving(false);
    }
  }


  // ========================================================
  // TOGGLE STATUS
  // ========================================================

  async function handleToggleStatus() {

    if (!selectedMember) {
      return;
    }

    try {

      setSaving(true);

      await userService.updateMemberStatus(
        selectedMember.id,
        {
          aktif:
            !selectedMember.aktif,
        }
      );

      await loadMembers();

      setSnackbar({
        open: true,
        message:
          selectedMember.aktif
            ? "Anggota dinonaktifkan."
            : "Anggota diaktifkan.",
        severity: "success",
      });

    } catch (error: any) {

      const detail =
        error?.response?.data?.detail;

      setSnackbar({
        open: true,
        message:
          typeof detail === "string"
            ? detail
            : "Gagal mengubah status anggota.",
        severity: "error",
      });

    } finally {

      setSaving(false);
    }
  }


  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {

    return (
      <Box
        sx={{
          minHeight:
            "calc(100vh - 120px)",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          background:
            "#f7f7f8",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }


  // ========================================================
  // NON-OWNER
  // ========================================================

  if (currentRole !== "owner") {

    const roleInfo =
      currentRole
        ? ROLE_INFO[
            currentRole
          ]
        : null;

    return (
      <Box
        sx={{
          minHeight:
            "calc(100vh - 120px)",
          background:
            "#f7f7f8",
          px: {
            xs: 1.5,
            md: 3,
          },
          py: {
            xs: 1.5,
            md: 3,
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 1000,
            mx: "auto",
          }}
        >
          <Header />

          <Paper
            elevation={0}
            sx={{
              border:
                "1px solid #e5e7eb",
              borderRadius: 3,
              background:
                "#ffffff",
              overflow:
                "hidden",
            }}
          >
            <Box
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
              <Box
                sx={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 1.5,
                }}
              >
                <AvatarLetter
                  text={getInitial(
                    currentUser?.nama ??
                      currentUser?.username ??
                      ""
                  )}
                  large
                />

                <Box>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#171717",
                    }}
                  >
                    {currentUser?.nama}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: 13,
                      color: "#737373",
                    }}
                  >
                    {currentUser?.email ||
                      currentUser?.username}
                  </Typography>

                  <Box
                    sx={{
                      mt: 0.8,
                    }}
                  >
                    <Chip
                      label={
                        roleInfo?.nama ??
                        currentUser?.role
                      }
                      size="small"
                      sx={{
                        height: 26,
                        borderRadius: 1.5,
                        background:
                          "#f3f4f6",
                        color:
                          "#404040",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2.5,
                  background:
                    "#f7f7f8",
                  border:
                    "1px solid #eeeeee",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#737373",
                    textTransform:
                      "uppercase",
                    fontWeight: 700,
                    letterSpacing:
                      "0.05em",
                  }}
                >
                  Jabatan
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 17,
                    fontWeight: 700,
                  }}
                >
                  {roleInfo?.nama ??
                    currentUser?.role}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color:
                      "#737373",
                  }}
                >
                  {roleInfo?.deskripsi}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {permissionLoading && (
              <Box sx={{ px: 2, pt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CircularProgress size={18} />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#737373",
                    }}
                  >
                    Memuat hak akses dari database...
                  </Typography>
                </Box>
              </Box>
            )}

            {permissionError && (
              <Alert
                severity="error"
                sx={{ mx: 2, mt: 2 }}
              >
                {permissionError}
              </Alert>
            )}

            <AccessSection
            role={currentRole}
            permissions={
              currentRolePermissions
            }
            draftCodes={
              currentRole
              ? draftPermissions[
                currentRole
              ] ?? []
              : []
            }
            editable={
              currentRole !== null &&
              currentRolePermissions.some(
                (permission: Permission) =>
                  permission.kode ===
                "hak_akses.update"
              )
            }
            saving={
              permissionSaving
            }
            onToggle={
              handlePermissionToggle
            }
            onSave={
              handleSavePermissions
            }
          />
          </Paper>
        </Box>

        <Snackbar
          open={
            snackbar.open
          }
          autoHideDuration={
            3500
          }
          onClose={() =>
            setSnackbar(
              (prev) => ({
                ...prev,
                open: false,
              })
            )
          }
        >
          <Alert
            severity={
              snackbar.severity
            }
            onClose={() =>
              setSnackbar(
                (prev) => ({
                  ...prev,
                  open: false,
                })
              )
            }
          >
            {
              snackbar.message
            }
          </Alert>
        </Snackbar>
      </Box>
    );
  }


  // ========================================================
  // OWNER UI
  // ========================================================

  return (
    <Box
      sx={{
        minHeight:
          "calc(100vh - 120px)",
        background:
          "#f7f7f8",
        px: {
          xs: 1,
          sm: 2,
          md: 3,
        },
        py: {
          xs: 1,
          sm: 2,
          md: 3,
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
        }}
      >

        <Header />

        {/* SEARCH */}

        <Paper
          elevation={0}
          sx={{
            border:
              "1px solid #e5e7eb",
            borderRadius: 3,
            background:
              "#ffffff",
            p: 1,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                flex: 1,
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari nama, username, atau email..."
                InputProps={{
                  startAdornment: (
                    <Search
                      size={18}
                      style={{
                        marginRight: 8,
                      }}
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root":
                    {
                      borderRadius: 2,
                      "& fieldset": {
                        border:
                          "1px solid transparent",
                      },
                      "&:hover fieldset": {
                        border:
                          "1px solid #d1d5db",
                      },
                      "&.Mui-focused fieldset":
                        {
                          border:
                            "1px solid #9ca3af",
                        },
                    },
                }}
              />
            </Box>

            <Button
              variant="outlined"
              onClick={
                openCreateDialog
              }
              sx={{
                height: 40,
                minWidth: {
                  xs: 42,
                  sm: 155,
                },
                borderRadius: 2,
                borderColor:
                  "#d1d5db",
                color:
                  "#171717",
                textTransform:
                  "none",
              }}
            >
              <Plus size={17} />

              <Box
                component="span"
                sx={{
                  ml: 0.7,
                  display: {
                    xs: "none",
                    sm: "inline",
                  },
                }}
              >
                Tambah Anggota
              </Box>
            </Button>
          </Box>
        </Paper>


        {/* STATS */}

        <Box
          sx={{
            display:
              "grid",
            gridTemplateColumns:
              {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
              },
            gap: 1.5,
            mb: 2,
          }}
        >

          <StatCard
            icon={
              <Users
                size={18}
              />
            }
            label="Total Anggota"
            value={total}
          />

          <StatCard
            icon={
              <Check
                size={18}
              />
            }
            label="Aktif"
            value={active}
          />

          <StatCard
            icon={
              <Lock
                size={18}
              />
            }
            label="Nonaktif"
            value={inactive}
          />

        </Box>


        {/* MAIN */}

        <Box
          sx={{
            display:
              "grid",
            gridTemplateColumns:
              {
                xs: "1fr",
                lg: "minmax(340px, 0.95fr) minmax(0, 1.55fr)",
              },
            gap: 2,
            alignItems:
              "start",
          }}
        >

          {/* LIST */}

          <Paper
            elevation={0}
            sx={{
              border:
                "1px solid #e5e7eb",
              borderRadius: 3,
              background:
                "#ffffff",
              overflow:
                "hidden",
            }}
          >

            <Box
              sx={{
                px: 2,
                py: 1.7,
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Anggota
              </Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: 12,
                  color:
                    "#737373",
                }}
              >
                Anggota pada toko aktif.
              </Typography>
            </Box>

            <Divider />

            {members.length === 0 ? (

              <Box
                sx={{
                  p: 4,
                  textAlign:
                    "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    color:
                      "#737373",
                  }}
                >
                  Anggota tidak ditemukan.
                </Typography>
              </Box>

            ) : (

              members.map(
                (member) => {

                  const role =
                    normalizeRole(
                      member.role
                    );

                  const selected =
                    member.id ===
                    selectedId;

                  return (
                    <Box
                      key={
                        member.id
                      }
                      onClick={() =>
                        setSelectedId(
                          member.id
                        )
                      }
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor:
                          "pointer",
                        borderBottom:
                          "1px solid #f1f1f1",
                        background:
                          selected
                            ? "#f7f7f8"
                            : "#ffffff",
                        "&:hover":
                          {
                            background:
                              "#f7f7f8",
                          },
                      }}
                    >

                      <Box
                        sx={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 1.2,
                        }}
                      >

                        <AvatarLetter
                          text={getInitial(
                            member.nama
                          )}
                        />

                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >

                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 1,
                            }}
                          >

                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                member.nama
                              }
                            </Typography>

                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius:
                                  "50%",
                                background:
                                  member.aktif
                                    ? "#16a34a"
                                    : "#a3a3a3",
                              }}
                            />

                          </Box>

                          <Typography
                            sx={{
                              mt: 0.2,
                              fontSize: 12,
                              color:
                                "#737373",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              member.email ||
                              member.username
                            }
                          </Typography>

                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 0.8,
                              mt: 0.7,
                            }}
                          >

                            <Chip
                              label={
                                role
                                  ? ROLE_INFO[
                                      role
                                    ].nama
                                  : member.role
                              }
                              size="small"
                              sx={{
                                height: 23,
                                fontSize: 11,
                                borderRadius:
                                  1.5,
                                background:
                                  "#f3f4f6",
                                color:
                                  "#404040",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: 11,
                                color:
                                  "#a3a3a3",
                              }}
                            >
                              USR-
                              {String(
                                member.id
                              ).padStart(
                                4,
                                "0"
                              )}
                            </Typography>

                          </Box>

                        </Box>

                        <ChevronRight
                          size={18}
                          color={
                            selected
                              ? "#171717"
                              : "#a3a3a3"
                          }
                        />

                      </Box>

                    </Box>
                  );
                }
              )

            )}

          </Paper>


          {/* DETAIL */}

          <Paper
            elevation={0}
            sx={{
              border:
                "1px solid #e5e7eb",
              borderRadius: 3,
              background:
                "#ffffff",
              overflow:
                "hidden",
            }}
          >

            {!selectedMember ? (

              <Box
                sx={{
                  p: 5,
                  textAlign:
                    "center",
                }}
              >
                <UserRound
                  size={28}
                  color="#a3a3a3"
                />

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 14,
                    color:
                      "#737373",
                  }}
                >
                  Pilih anggota.
                </Typography>
              </Box>

            ) : (

              <>

                <Box
                  sx={{
                    p: {
                      xs: 2,
                      md: 2.5,
                    },
                  }}
                >

                  <Box
                    sx={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 1.5,
                    }}
                  >

                    <AvatarLetter
                      text={getInitial(
                        selectedMember.nama
                      )}
                      large
                    />

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >

                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 700,
                        }}
                      >
                        {
                          selectedMember.nama
                        }
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.2,
                          fontSize: 13,
                          color:
                            "#737373",
                        }}
                      >
                        {
                          selectedMember.email ||
                          selectedMember.username
                        }
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.2,
                          fontSize: 12,
                          color:
                            "#a3a3a3",
                        }}
                      >
                        USR-
                        {String(
                          selectedMember.id
                        ).padStart(
                          4,
                          "0"
                        )}
                      </Typography>

                    </Box>

                    <Chip
                      label={
                        selectedMember.aktif
                          ? "Aktif"
                          : "Nonaktif"
                      }
                      size="small"
                      sx={{
                        height: 26,
                        borderRadius:
                          1.5,
                        background:
                          selectedMember.aktif
                            ? "#ecfdf5"
                            : "#f5f5f5",
                        color:
                          selectedMember.aktif
                            ? "#15803d"
                            : "#737373",
                        fontWeight: 600,
                      }}
                    />

                  </Box>


                  {/* ROLE */}

                  <Box
                    sx={{
                      mt: 2.5,
                      p: 1.5,
                      borderRadius: 2.5,
                      background:
                        "#f7f7f8",
                      border:
                        "1px solid #eeeeee",
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: 11,
                        color:
                          "#737373",
                        textTransform:
                          "uppercase",
                        fontWeight: 700,
                        letterSpacing:
                          "0.05em",
                      }}
                    >
                      Jabatan
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        fontSize: 17,
                        fontWeight: 700,
                      }}
                    >
                      {
                        selectedRoleInfo?.nama ??
                        selectedMember.role
                      }
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.3,
                        fontSize: 12,
                        lineHeight: 1.6,
                        color:
                          "#737373",
                      }}
                    >
                      {
                        selectedRoleInfo?.deskripsi
                      }
                    </Typography>

                  </Box>

                </Box>


                <Divider />


                {/* ACCESS */}

                {permissionLoading && (
                  <Box
                    sx={{
                      px: 2.5,
                      pt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CircularProgress
                        size={18}
                      />

                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#737373",
                        }}
                      >
                        Memuat hak akses dari database...
                      </Typography>
                    </Box>
                  </Box>
                )}

                {permissionError && (
                  <Alert
                    severity="error"
                    sx={{
                      mx: 2.5,
                      mt: 2,
                    }}
                  >
                    {permissionError}
                  </Alert>
                )}
                <AccessSection
                role={selectedRole}
                permissions={
                  selectedRolePermissions
                }
                draftCodes={
                  selectedRole
                  ? draftPermissions[
                    selectedRole
                  ] ?? []
                  : []
                }
                editable
                saving={
                  permissionSaving
                }
                onToggle={
                  handlePermissionToggle
                }
                onSave={
                  handleSavePermissions
                }
              />
                <Divider />


                {/* ACTION */}

                <Box
                  sx={{
                    p: 2,
                    display:
                      "flex",
                    gap: 1,
                    justifyContent:
                      "flex-end",
                    flexWrap:
                      "wrap",
                  }}
                >

                  <Button
                    variant="outlined"
                    onClick={
                      handleToggleStatus
                    }
                    disabled={
                      saving ||
                      selectedMember.toko_status ===
                        "owner"
                    }
                    sx={{
                      textTransform:
                        "none",
                      borderRadius: 2,
                      borderColor:
                        "#d1d5db",
                      color:
                        "#171717",
                    }}
                  >
                    {selectedMember.aktif
                      ? "Nonaktifkan"
                      : "Aktifkan"}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={
                      openEditDialog
                    }
                    disabled={
                      saving ||
                      selectedMember.toko_status ===
                        "owner"
                    }
                    sx={{
                      textTransform:
                        "none",
                      borderRadius: 2,
                      borderColor:
                        "#d1d5db",
                      color:
                        "#171717",
                    }}
                  >
                    Ubah Jabatan
                  </Button>

                </Box>

              </>
            )}

          </Paper>

        </Box>
      </Box>


      {/* ====================================================
          CREATE DIALOG
      ==================================================== */}

      <Dialog
        open={openAdd}
        onClose={() =>
          !saving &&
          setOpenAdd(false)
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Tambah Anggota
        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            label="Nama"
            value={form.nama}
            onChange={(event) =>
              setForm(
                (prev) => ({
                  ...prev,
                  nama:
                    event.target
                      .value,
                })
              )
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Username"
            value={
              form.username
            }
            onChange={(event) =>
              setForm(
                (prev) => ({
                  ...prev,
                  username:
                    event.target
                      .value,
                })
              )
            }
            margin="normal"
          />

          <TextField
            fullWidth
            type="email"
            label="Email"
            value={
              form.email
            }
            onChange={(event) =>
              setForm(
                (prev) => ({
                  ...prev,
                  email:
                    event.target
                      .value,
                })
              )
            }
            margin="normal"
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={
              form.password
            }
            onChange={(event) =>
              setForm(
                (prev) => ({
                  ...prev,
                  password:
                    event.target
                      .value,
                })
              )
            }
            margin="normal"
          />

          <Select
            fullWidth
            value={
              form.role
            }
            onChange={(event) =>
              setForm(
                (prev) => ({
                  ...prev,
                  role:
                    event.target
                      .value as UserRole,
                })
              )
            }
            sx={{
              mt: 2,
            }}
          >
            {MEMBER_ROLES.map(
              (role) => (
                <MenuItem
                  key={role}
                  value={role}
                >
                  {
                    ROLE_INFO[
                      role
                    ].nama
                  }
                </MenuItem>
              )
            )}
          </Select>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={() =>
              setOpenAdd(false)
            }
            disabled={
              saving
            }
            sx={{
              textTransform:
                "none",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={
              handleCreate
            }
            disabled={
              saving
            }
            sx={{
              textTransform:
                "none",
              borderRadius: 2,
            }}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* ====================================================
          EDIT DIALOG
      ==================================================== */}

      <Dialog
        open={openEdit}
        onClose={() =>
          !saving &&
          setOpenEdit(false)
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Ubah Anggota
        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            label="Nama"
            value={
              form.nama
            }
            onChange={(event) =>
              setForm(
                (prev) => ({
                  ...prev,
                  nama:
                    event.target
                      .value,
                })
              )
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Username"
            value={
              form.username
            }
            disabled
            margin="normal"
          />

          <TextField
            fullWidth
            type="email"
            label="Email"
            value={
              form.email
            }
            onChange={(event) =>
              setForm(
                (prev) => ({
                  ...prev,
                  email:
                    event.target
                      .value,
                })
              )
            }
            margin="normal"
          />

          <Select
            fullWidth
            value={
              form.role
            }
            onChange={(event) =>
              setForm(
                (prev) => ({
                  ...prev,
                  role:
                    event.target
                      .value as UserRole,
                })
              )
            }
            sx={{
              mt: 2,
            }}
          >
            {MEMBER_ROLES.map(
              (role) => (
                <MenuItem
                  key={role}
                  value={role}
                >
                  {
                    ROLE_INFO[
                      role
                    ].nama
                  }
                </MenuItem>
              )
            )}
          </Select>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={() =>
              setOpenEdit(false)
            }
            disabled={
              saving
            }
            sx={{
              textTransform:
                "none",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={
              handleUpdate
            }
            disabled={
              saving
            }
            sx={{
              textTransform:
                "none",
              borderRadius: 2,
            }}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* ====================================================
          SNACKBAR
      ==================================================== */}

      <Snackbar
        open={
          snackbar.open
        }
        autoHideDuration={
          3500
        }
        onClose={() =>
          setSnackbar(
            (prev) => ({
              ...prev,
              open: false,
            })
          )
        }
      >
        <Alert
          severity={
            snackbar.severity
          }
          onClose={() =>
            setSnackbar(
              (prev) => ({
                ...prev,
                open: false,
              })
            )
          }
        >
          {
            snackbar.message
          }
        </Alert>
      </Snackbar>

    </Box>
  );
}


// ==========================================================
// HEADER
// ==========================================================

function Header() {
  return (
    <Box
      sx={{
        mb: 3,
      }}
    >
      <Box
        sx={{
          display:
            "flex",
          alignItems:
            "center",
          gap: 1.2,
        }}
      >

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            border:
              "1px solid #e5e7eb",
            background:
              "#ffffff",
          }}
        >
          <ShieldCheck
            size={22}
          />
        </Box>

        <Box>

          <Typography
            sx={{
              fontSize: {
                xs: 22,
                md: 26,
              },
              fontWeight: 700,
              color:
                "#171717",
              letterSpacing:
                "-0.02em",
            }}
          >
            Hak Akses
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              fontSize: 14,
              color:
                "#6b7280",
            }}
          >
            Kelola anggota dan lihat hak akses berdasarkan jabatan.
          </Typography>

        </Box>

      </Box>
    </Box>
  );
}


// ==========================================================
// STAT CARD
// ==========================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {

  return (
    <Card
      elevation={0}
      sx={{
        border:
          "1px solid #e5e7eb",
        borderRadius: 3,
        background:
          "#ffffff",
      }}
    >

      <CardContent
        sx={{
          p: 2,
          "&:last-child": {
            pb: 2,
          },
        }}
      >

        <Box
          sx={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
          }}
        >

          <Typography
            sx={{
              fontSize: 12,
              color:
                "#737373",
            }}
          >
            {label}
          </Typography>

          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 2,
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              background:
                "#f5f5f5",
              color:
                "#525252",
            }}
          >
            {icon}
          </Box>

        </Box>

        <Typography
          sx={{
            mt: 0.8,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          {value}
        </Typography>

      </CardContent>

    </Card>
  );
}


// ==========================================================
// AVATAR
// ==========================================================

function AvatarLetter({
  text,
  large = false,
}: {
  text: string;
  large?: boolean;
}) {

  return (
    <Box
      sx={{
        width:
          large ? 54 : 40,
        height:
          large ? 54 : 40,
        borderRadius: 2.5,
        flexShrink: 0,
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        background:
          "#f3f4f6",
        color:
          "#404040",
        fontSize:
          large ? 21 : 15,
        fontWeight: 700,
        border:
          "1px solid #e5e7eb",
      }}
    >
      {text}
    </Box>
  );
}
// ==========================================================
// ACCESS SECTION
// ==========================================================

function AccessSection({
  role,
  permissions,
  draftCodes,
  editable,
  saving,
  onToggle,
  onSave,
}: {
  role: UserRole | null;
  permissions: Permission[];
  draftCodes: string[];
  editable: boolean;
  saving: boolean;
  onToggle: (
    role: UserRole,
    permissionCode: string
  ) => void;
  onSave: (
    role: UserRole
  ) => void;
}) {

  // ========================================================
  // DAFTAR PERMISSION YANG TERDAFTAR DI FRONTEND
  // ========================================================

  const accessMap: {
    label: string;
    codes: string[];
  }[] = [

    {
      label: "Dashboard",
      codes: [
        "dashboard.view",
      ],
    },

    {
      label: "Barang",
      codes: [
        "barang.view",
        "barang.create",
        "barang.update",
        "barang.delete",
      ],
    },

    {
      label: "Kategori",
      codes: [
        "kategori.view",
        "kategori.create",
        "kategori.update",
        "kategori.delete",
      ],
    },

    {
      label: "Supplier",
      codes: [
        "supplier.view",
        "supplier.create",
        "supplier.update",
        "supplier.delete",
      ],
    },

    {
      label: "Pelanggan",
      codes: [
        "pelanggan.view",
        "pelanggan.create",
        "pelanggan.update",
        "pelanggan.delete",
      ],
    },

    {
      label: "Penjualan",
      codes: [
        "penjualan.view",
        "penjualan.create",
        "penjualan.update",
        "penjualan.delete",
      ],
    },

    {
      label: "Pembelian",
      codes: [
        "pembelian.view",
        "pembelian.create",
        "pembelian.update",
        "pembelian.delete",
      ],
    },

    {
      label: "Stok",
      codes: [
        "stok.view",
        "stok.adjust",
      ],
    },

    {
      label: "Mutasi Stok",
      codes: [
        "mutasi_stok.view",
      ],
    },

    {
      label: "Stock Opname",
      codes: [
        "stock_opname.view",
        "stock_opname.create",
        "stock_opname.update",
        "stock_opname.approve",
      ],
    },

    {
      label: "Retur Penjualan",
      codes: [
        "retur_penjualan.view",
        "retur_penjualan.create",
        "retur_penjualan.update",
        "retur_penjualan.delete",
      ],
    },

    {
      label: "Retur Pembelian",
      codes: [
        "retur_pembelian.view",
        "retur_pembelian.create",
        "retur_pembelian.update",
        "retur_pembelian.delete",
      ],
    },

    {
      label: "Laporan",
      codes: [
        "laporan.view",
        "laporan.export",
        "laporan.laba_rugi",
      ],
    },

    {
      label: "AI Muamalah",
      codes: [
        "muamalah.view",
      ],
    },

    {
      label: "AI Kitab Kuning",
      codes: [
        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",
      ],
    },

    {
      label: "AI Zakat",
      codes: [
        "zakat.view",
      ],
    },

    {
      label: "Pengguna",
      codes: [
        "user.view",
        "user.create",
        "user.update",
        "user.delete",
      ],
    },

    {
      label: "Hak Akses",
      codes: [
        "hak_akses.view",
        "hak_akses.update",
      ],
    },
  ];

  const permissionByCode =
    new Map(
      permissions.map(
        (permission) => [
          permission.kode,
          permission,
        ]
      )
    );

  const activeCodes =
    new Set(
      draftCodes
    );

  function getPermissionLabel(
    code: string
  ): string {

    const fromApi =
      permissionByCode.get(
        code
      );

    if (fromApi?.nama) {
      return fromApi.nama;
    }

    const action =
      code.split(".").pop() ?? "";

    switch (action) {
      case "view":
        return "Lihat";
      case "create":
        return "Tambah";
      case "update":
        return "Ubah";
      case "delete":
        return "Hapus";
      case "export":
        return "Export";
      case "laba_rugi":
        return "Laba/Rugi";
      case "adjust":
        return "Penyesuaian";
      case "approve":
        return "Setujui";
      case "search":
        return "Cari";
      case "translate":
        return "Terjemahkan";
      case "explain":
        return "Jelaskan";
      default:
        return code;
    }
  }

  function getGroupCodes(
    group: {
      label: string;
      codes: string[];
    }
  ): string[] {
    return group.codes;
  }

  const activeCount =
    draftCodes.length;

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 2.5,
        },
      }}
    >

      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent:
            "space-between",
          gap: 1.5,
          flexWrap: "wrap",
          mb: 2,
        }}
      >

        <Box>

          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            Hak akses
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              fontSize: 12,
              color:
                "#737373",
            }}
          >
            Hak akses {role
              ? ROLE_INFO[role].nama
              : "user"} mengikuti permission
            yang tersimpan di database.
          </Typography>

        </Box>

        <Chip
          size="small"
          label={`${activeCount} permission aktif`}
          sx={{
            height: 28,
            borderRadius: 1.5,
            background:
              "#f3f4f6",
            color:
              "#404040",
            fontWeight: 600,
          }}
        />

      </Box>


      {editable && role && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            fontSize: 12,
            alignItems: "center",
          }}
        >
          Centang atau hapus centang permission,
          lalu tekan <strong>Simpan Hak Akses</strong>.
        </Alert>
      )}


      {accessMap.map(
        (group) => {

          const codes =
            getGroupCodes(
              group
            );

          return (
            <Box
              key={
                group.label
              }
              sx={{
                mb: 1.5,
                border:
                  "1px solid #eeeeee",
                borderRadius: 2.5,
                overflow: "hidden",
                background:
                  "#ffffff",
              }}
            >

              <Box
                sx={{
                  px: 1.5,
                  py: 1.15,
                  background:
                    "#fafafa",
                  borderBottom:
                    "1px solid #eeeeee",
                }}
              >

                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color:
                      "#404040",
                  }}
                >
                  {group.label}
                </Typography>

              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                }}
              >

                {codes.map(
                  (code) => {

                    const checked =
                      activeCodes.has(
                        code
                      );

                    const permission =
                      permissionByCode.get(
                        code
                      );

                    return (
                      <Box
                        key={code}
                        onClick={() => {
                          if (
                            editable &&
                            role
                          ) {
                            onToggle(
                              role,
                              code
                            );
                          }
                        }}
                        sx={{
                          minHeight: 48,
                          px: 1.2,
                          py: 0.8,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.8,
                          borderBottom:
                            "1px solid #f1f1f1",
                          cursor:
                            editable && role
                              ? "pointer"
                              : "default",
                          "&:hover":
                            editable && role
                              ? {
                                  background:
                                    "#fafafa",
                                }
                              : undefined,
                        }}
                      >

                        <Checkbox
                          checked={
                            checked
                          }
                          disabled={
                            !editable ||
                            !role
                          }
                          onChange={() => {
                            if (
                              editable &&
                              role
                            ) {
                              onToggle(
                                role,
                                code
                              );
                            }
                          }}
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          size="small"
                          sx={{
                            p: 0.5,
                          }}
                        />

                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >

                          <Typography
                            sx={{
                              fontSize: 12.5,
                              fontWeight:
                                checked
                                  ? 600
                                  : 400,
                              color:
                                checked
                                  ? "#404040"
                                  : "#a3a3a3",
                            }}
                          >
                            {
                              getPermissionLabel(
                                code
                              )
                            }
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 10.5,
                              color:
                                "#a3a3a3",
                              mt: 0.1,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {permission?.deskripsi ??
                              code}
                          </Typography>

                        </Box>

                        <Typography
                          sx={{
                            fontSize: 10,
                            color:
                              checked
                                ? "#15803d"
                                : "#a3a3a3",
                            flexShrink: 0,
                            mr: 0.5,
                          }}
                        >
                          {checked
                            ? "AKTIF"
                            : "NONAKTIF"}
                        </Typography>

                      </Box>
                    );
                  }
                )}

              </Box>

            </Box>
          );
        }
      )}


      {editable && role && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <Button
            variant="contained"
            onClick={() =>
              onSave(role)
            }
            disabled={
              saving
            }
            sx={{
              textTransform:
                "none",
              borderRadius: 2,
              minWidth: 170,
              fontWeight: 600,
            }}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Hak Akses"}
          </Button>
        </Box>
      )}

    </Box>
  );
}
