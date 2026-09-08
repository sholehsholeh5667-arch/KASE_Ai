import {
  Box,
  Toolbar,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";

import {
  Outlet,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

import {
  getCurrentToko,
} from "../services/tokoService";

import type {
  Toko,
} from "../types/toko";

export default function MainLayout() {

  // ==========================================================
  // CURRENT TOKO
  // ==========================================================

  const [toko, setToko] = useState<Toko | null>(null);

  const [loadingToko, setLoadingToko] =
    useState(true);

  const [errorToko, setErrorToko] =
    useState("");

  // ==========================================================
  // LOAD CURRENT TOKO
  // ==========================================================

  useEffect(() => {

    let mounted = true;

    async function loadCurrentToko() {

      try {

        setLoadingToko(true);
        setErrorToko("");

        const data =
          await getCurrentToko();

        if (!mounted) {
          return;
        }

        console.log(
          "MAIN LAYOUT - CURRENT TOKO:",
          data
        );

        setToko(data);

      } catch (error) {

        console.error(
          "Gagal mengambil current toko:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorToko(
          "Toko aktif tidak dapat dimuat."
        );

      } finally {

        if (mounted) {
          setLoadingToko(false);
        }

      }
    }

    loadCurrentToko();

    return () => {
      mounted = false;
    };

  }, []);

  // ==========================================================
  // OUTLET CONTEXT
  // ==========================================================

  const outletContext = {
    toko,
    loadingToko,
    errorToko,
  };

  // ==========================================================
  // LAYOUT
  // ==========================================================

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
      }}
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <Header />


      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <Sidebar />


      {/* ====================================================
          MAIN
      ==================================================== */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 0,
        }}
      >

        <Toolbar />


        {/* ==================================================
            CURRENT TOKO BAR
        ================================================== */}

        <Box
          sx={{
            px: {
              xs: 2,
              md: 3,
            },
            pt: 1.5,
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,

              px: 2,
              py: 1.25,

              backgroundColor: "#ffffff",

              border:
                "1px solid #e2e8f0",

              borderRadius: 2,

              boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.04)",

              minHeight: 58,

              flexWrap: "wrap",
            }}
          >

            {/* ==============================================
                LABEL
            ============================================== */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minWidth: 0,
              }}
            >

              <Box
                sx={{
                  width: 38,
                  height: 38,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  borderRadius: 1.5,

                  backgroundColor:
                    "#eff6ff",

                  color:
                    "#1d4ed8",

                  fontSize: 20,
                }}
              >
                🏪
              </Box>


              <Box
                sx={{
                  minWidth: 0,
                }}
              >

                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.04em",
                  }}
                >
                  Toko Aktif
                </Typography>


                {loadingToko && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >

                    <CircularProgress
                      size={15}
                    />

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#64748b",
                      }}
                    >
                      Memuat toko...
                    </Typography>

                  </Box>
                )}


                {!loadingToko &&
                  !errorToko &&
                  toko && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 1,
                        flexWrap:
                          "wrap",
                      }}
                    >

                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {toko.nama}
                      </Typography>


                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#64748b",
                        }}
                      >
                        {toko.kode}
                      </Typography>

                    </Box>
                  )}


                {!loadingToko &&
                  errorToko && (
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#dc2626",
                      }}
                    >
                      {errorToko}
                    </Typography>
                  )}

              </Box>

            </Box>


            {/* ==============================================
                STATUS
            ============================================== */}

            {!loadingToko &&
              !errorToko &&
              toko && (

                <Chip
                  label={
                    toko.aktif
                      ? "Aktif"
                      : "Tidak Aktif"
                  }
                  size="small"
                  sx={{
                    fontWeight: 700,

                    backgroundColor:
                      toko.aktif
                        ? "#dcfce7"
                        : "#fee2e2",

                    color:
                      toko.aktif
                        ? "#15803d"
                        : "#b91c1c",
                  }}
                />

              )}

          </Box>

        </Box>


        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <Box
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >

          <Outlet
            context={outletContext}
          />

        </Box>

      </Box>

    </Box>
  );
}