import { useEffect, useState } from "react";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
  Typography,
} from "@mui/material";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Users,
  ShoppingCart,
  RotateCcw,
  ClipboardCheck,
  ArrowLeftRight,
  FileText,
  BarChart3,
  Settings,
  ShieldCheck,
  BookOpen,
  LibraryBig,
  Scale,
  Sparkles,
} from "lucide-react";

import { usePermissions } from "../../hooks/usePermissions";
import { userService } from "../../services/userService";
import type { UserRole } from "../../types/user";


/* ==========================================================
   CONFIGURASI SIDEBAR
========================================================== */

const drawerWidth = 250;
const headerHeight = 72;


/* ==========================================================
   TIPE MENU
========================================================== */

interface SidebarMenu {
  title: string;
  path: string;
  icon: typeof LayoutDashboard;
  permission?: string;
  allowedRoles?: UserRole[];
}


/* ==========================================================
   SIDEBAR
========================================================== */

export default function Sidebar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* ========================================================
     PERMISSION USER LOGIN
  ======================================================== */

  const {
    hasPermission,
    loading: permissionLoading,
  } = usePermissions();


  /* ========================================================
     ROLE USER LOGIN
  ======================================================== */

  const [
    currentRole,
    setCurrentRole,
  ] = useState<UserRole | null>(null);

  const [
    roleLoading,
    setRoleLoading,
  ] = useState(true);


  useEffect(() => {

    let mounted = true;

    const loadCurrentUser = async () => {

      try {

        const me =
          await userService.me();

        if (!mounted) {
          return;
        }

        const role =
          String(me.role ?? "")
            .trim()
            .toLowerCase();

        if (
          role === "owner" ||
          role === "admin" ||
          role === "kasir" ||
          role === "gudang" ||
          role === "akuntan"
        ) {
          setCurrentRole(
            role as UserRole
          );
        } else {
          setCurrentRole(null);
        }

      } catch (error) {

        console.error(
          "Gagal mengambil role user untuk Sidebar:",
          error
        );

        if (mounted) {
          setCurrentRole(null);
        }

      } finally {

        if (mounted) {
          setRoleLoading(false);
        }

      }

    };

    void loadCurrentUser();

    return () => {
      mounted = false;
    };

  }, []);


  /* ========================================================
     MENU
  ======================================================== */

  const menus: SidebarMenu[] = [

    /* ======================================================
       DASHBOARD
    ====================================================== */

    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      permission:
        "dashboard.view",
    },


    /* ======================================================
       MASTER DATA
    ====================================================== */

    {
      title: "Barang",
      path: "/barang",
      icon: Package,
      permission:
        "barang.view",
    },

    {
      title: "Kategori",
      path: "/kategori",
      icon: Tags,
      permission:
        "kategori.view",
    },

    {
      title: "Supplier",
      path: "/supplier",
      icon: Truck,
      permission:
        "supplier.view",
    },

    {
      title: "Pelanggan",
      path: "/pelanggan",
      icon: Users,
      permission:
        "pelanggan.view",
    },


    /* ======================================================
       TRANSAKSI
    ====================================================== */

    {
      title: "Pembelian",
      path: "/pembelian",
      icon: ShoppingCart,
      permission:
        "pembelian.view",
    },

    {
      title: "Penjualan",
      path: "/penjualan",
      icon: ShoppingCart,
      permission:
        "penjualan.view",
    },

    {
      title: "Retur Penjualan",
      path: "/retur-penjualan",
      icon: RotateCcw,
      permission:
        "retur_penjualan.view",
    },

    {
      title: "Retur Pembelian",
      path: "/retur-pembelian",
      icon: RotateCcw,
      permission:
        "retur_pembelian.view",
    },


    /* ======================================================
       MANAJEMEN STOK
    ====================================================== */

    {
      title: "Stock Opname",
      path: "/stock-opname",
      icon: ClipboardCheck,
      permission:
        "stock_opname.view",
    },

    {
      title: "Mutasi Stok",
      path: "/mutasi-stok",
      icon: ArrowLeftRight,
      permission:
        "mutasi_stok.view",
    },


    /* ======================================================
       LAPORAN
    ====================================================== */

    {
      title: "Laporan",
      path: "/laporan",
      icon: FileText,
      permission:
        "laporan.view",
    },


    /* ======================================================
       SISTEM
    ====================================================== */

    {
      title: "Dashboard Analytics",
      path: "/dashboard-analytics",
      icon: BarChart3,
      allowedRoles: [
        "owner",
      ],
    },

    {
      title: "Setting Toko",
      path: "/setting",
      icon: Settings,
      allowedRoles: [
        "owner",
      ],
    },

    {
      title: "Hak Akses User",
      path: "/hak-akses",
      icon: ShieldCheck,
      permission:
        "hak_akses.view",
    },


    /* ======================================================
       AI
    ====================================================== */

    {
      title: "AI Muamalah",
      path: "/ai-muamalah",
      icon: BookOpen,
      permission:
        "muamalah.view",
    },

    {
      title: "AI Kitab Kuning",
      path: "/ai-kitab",
      icon: LibraryBig,
      permission:
        "kitab.view",
    },

    {
      title: "AI Zakat Tijarah",
      path: "/ai-zakat",
      icon: Scale,
      permission:
        "zakat.view",
    },
  ];


  /* ========================================================
     FILTER MENU BERDASARKAN ROLE + PERMISSION
  ======================================================== */

  const visibleMenus =
    permissionLoading ||
    roleLoading
      ? []
      : menus.filter(
          (menu) => {

            /* ------------------------------------------------
               MENU KHUSUS ROLE
            ------------------------------------------------ */

            if (
              menu.allowedRoles &&
              (
                !currentRole ||
                !menu.allowedRoles.includes(
                  currentRole
                )
              )
            ) {
              return false;
            }


            /* ------------------------------------------------
               MENU DENGAN PERMISSION
            ------------------------------------------------ */

            if (
              menu.permission
            ) {
              return hasPermission(
                menu.permission
              );
            }


            /* ------------------------------------------------
               MENU TANPA PERMISSION
               hanya boleh tampil jika role cocok
            ------------------------------------------------ */

            return Boolean(
              menu.allowedRoles
            );
          }
        );


  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <Drawer
      variant="permanent"

      sx={{
        width:
          drawerWidth,

        flexShrink: 0,

        "& .MuiDrawer-paper": {

          width:
            drawerWidth,

          boxSizing:
            "border-box",


          /* =================================================
             SIDEBAR DI BAWAH HEADER
          ================================================= */

          top:
            `${headerHeight}px`,

          height:
            `calc(100vh - ${headerHeight}px)`,


          /* =================================================
             BACKGROUND
          ================================================= */

          background:
            "linear-gradient(180deg,#0b2a5b 0%,#123d7a 100%)",

          color:
            "#ffffff",


          /* =================================================
             BORDER
          ================================================= */

          borderRight:
            "1px solid rgba(255,255,255,0.08)",


          /* =================================================
             SCROLL
          ================================================= */

          overflowX:
            "hidden",

          overflowY:
            "auto",


          /* =================================================
             SCROLLBAR
          ================================================= */

          "&::-webkit-scrollbar": {
            width: 6,
          },

          "&::-webkit-scrollbar-track": {
            background:
              "transparent",
          },

          "&::-webkit-scrollbar-thumb": {
            background:
              "rgba(255,255,255,0.22)",

            borderRadius:
              10,
          },

          "&::-webkit-scrollbar-thumb:hover": {
            background:
              "rgba(255,255,255,0.35)",
          },

        },
      }}
    >


      {/* ==================================================
          BRANDING
      ================================================== */}

      <Box
        sx={{
          px: 2,
          pt: 4,
          pb: 3,
          textAlign: "center",
        }}
      >


        {/* =================================================
            LOGO K
        ================================================= */}

        <Box
          sx={{
            width: 58,
            height: 58,
            margin: "0 auto",
            borderRadius: 2,
            border:
              "2px solid #d4af37",

            background:
              "linear-gradient(145deg,#0b2a5b,#071d42)",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            boxShadow:
              "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >

          <Typography
            sx={{
              color:
                "#ffffff",

              fontSize:
                32,

              fontWeight:
                800,

              lineHeight:
                1,
            }}
          >
            K
          </Typography>

        </Box>


        {/* =================================================
            NAMA APLIKASI
        ================================================= */}

        <Typography
          sx={{
            mt: 1.5,

            fontSize:
              23,

            fontWeight:
              800,

            letterSpacing:
              1,

            color:
              "#ffffff",

            lineHeight:
              1.1,
          }}
        >
          KASE AI
        </Typography>


        {/* =================================================
            TAGLINE
        ================================================= */}

        <Typography
          sx={{
            mt: 0.8,

            fontSize:
              11,

            lineHeight:
              1.4,

            color:
              "rgba(255,255,255,0.78)",

            maxWidth:
              170,

            marginLeft:
              "auto",

            marginRight:
              "auto",
          }}
        >
          Kasir AI Syari'ah
          <br />
          Entrepreneur
        </Typography>

      </Box>


      {/* ==================================================
          DIVIDER
      ================================================== */}

      <Divider
        sx={{
          borderColor:
            "rgba(255,255,255,0.12)",
        }}
      />


      {/* ==================================================
          MENU
      ================================================== */}

      <List
        sx={{
          px: 1,
          py: 1.5,
        }}
      >

        {visibleMenus.map(
          (menu) => {

            const Icon =
              menu.icon;


            /* =============================================
               ACTIVE
            ============================================= */

            const active =
              location.pathname ===
              menu.path;


            return (
              <ListItemButton
                key={
                  menu.path
                }

                selected={
                  active
                }

                onClick={() =>
                  navigate(
                    menu.path
                  )
                }

                sx={{
                  minHeight:
                    46,

                  mb:
                    0.5,

                  px:
                    1.5,

                  borderRadius:
                    2,

                  color:
                    active
                      ? "#0b2a5b"
                      : "rgba(255,255,255,0.9)",

                  backgroundColor:
                    active
                      ? "#d4af37"
                      : "transparent",

                  transition:
                    "all 0.2s ease",


                  /* =======================================
                     HOVER
                  ======================================= */

                  "&:hover": {

                    backgroundColor:
                      active
                        ? "#d4af37"
                        : "rgba(255,255,255,0.09)",
                  },


                  /* =======================================
                     SELECTED
                  ======================================= */

                  "&.Mui-selected": {

                    backgroundColor:
                      "#d4af37",

                    color:
                      "#0b2a5b",

                    fontWeight:
                      700,
                  },


                  "&.Mui-selected:hover": {

                    backgroundColor:
                      "#d4af37",
                  },

                }}
              >


                {/* =========================================
                    ICON
                ========================================= */}

                <Box
                  sx={{
                    width:
                      24,

                    minWidth:
                      24,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    mr:
                      1.5,
                  }}
                >

                  <Icon
                    size={
                      19
                    }

                    strokeWidth={
                      active
                        ? 2.5
                        : 2
                    }
                  />

                </Box>


                {/* =========================================
                    TEXT
                ========================================= */}

                <ListItemText
                  primary={
                    menu.title
                  }

                  primaryTypographyProps={{
                    fontSize:
                      13.5,

                    fontWeight:
                      active
                        ? 700
                        : 500,

                    lineHeight:
                      1.2,
                  }}
                />

              </ListItemButton>
            );
          }
        )}

      </List>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <Box
        sx={{
          mt:
            "auto",

          px:
            2,

          py:
            2,

          textAlign:
            "center",

          borderTop:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >

        <Box
          sx={{
            display:
              "flex",

            justifyContent:
              "center",

            mb:
              0.5,
          }}
        >

          <Sparkles
            size={
              14
            }

            color={
              "#d4af37"
            }
          />

        </Box>


        <Typography
          sx={{
            fontSize:
              10,

            color:
              "rgba(255,255,255,0.55)",
          }}
        >
          KASE AI
        </Typography>


        <Typography
          sx={{
            fontSize:
              9,

            color:
              "rgba(255,255,255,0.4)",

            mt:
              0.3,
          }}
        >
          Syari'ah Entrepreneur
        </Typography>

      </Box>


    </Drawer>
  );
}