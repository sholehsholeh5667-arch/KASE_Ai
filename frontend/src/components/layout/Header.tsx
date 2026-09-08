import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  NotificationsNone,
  AccountCircle,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") ||
    "Pengguna";

  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "username"
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) =>
          theme.zIndex.drawer + 1,

        background:
          "linear-gradient(90deg,#081f46 0%,#0b2a5b 55%,#123d7a 100%)",

        borderBottom:
          "1px solid rgba(255,255,255,0.08)",

        boxShadow:
          "0 3px 12px rgba(0,0,0,0.18)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",

          px: {
            xs: 2,
            md: 3,
          },
        }}
      >

        {/* ==================================================
            BRANDING
        ================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            minWidth: 0,
          }}
        >

          {/* LOGO K */}

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,

              backgroundColor:
                "#0b2a5b",

              border:
                "2px solid #d4af37",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              mr: 1.5,

              flexShrink: 0,

              boxShadow:
                "0 3px 10px rgba(0,0,0,0.20)",
            }}
          >
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: 21,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              K
            </Typography>
          </Box>


          {/* NAMA DAN TAGLINE */}

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                color: "#ffffff",

                fontSize: {
                  xs: 17,
                  sm: 19,
                },

                fontWeight: 800,

                letterSpacing: 1,

                lineHeight: 1.1,

                whiteSpace: "nowrap",
              }}
            >
              KASE AI
            </Typography>

            <Typography
              sx={{
                color:
                  "rgba(255,255,255,0.72)",

                fontSize: {
                  xs: 10,
                  sm: 11,
                },

                fontWeight: 500,

                mt: 0.4,

                lineHeight: 1.2,

                whiteSpace: "nowrap",
              }}
            >
              Kasir AI Syari'ah Entrepreneur
            </Typography>
          </Box>

        </Box>


        {/* ==================================================
            AREA KANAN
        ================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: {
              xs: 0.5,
              sm: 1,
            },
          }}
        >

          {/* NOTIFIKASI */}

          <Tooltip title="Notifikasi">

            <IconButton
              size="large"
              sx={{
                color: "#ffffff",

                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.10)",

                  color: "#d4af37",
                },
              }}
            >
              <NotificationsNone />
            </IconButton>

          </Tooltip>


          {/* USER */}

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },

              alignItems: "center",

              gap: 1,

              px: 1,

              py: 0.5,
            }}
          >

            <AccountCircle
              sx={{
                color: "#ffffff",
                fontSize: 34,
              }}
            />

            <Box
              sx={{
                lineHeight: 1,
              }}
            >

              <Typography
                sx={{
                  color: "#ffffff",

                  fontSize: 13,

                  fontWeight: 700,

                  lineHeight: 1.2,

                  maxWidth: 140,

                  overflow: "hidden",

                  textOverflow:
                    "ellipsis",

                  whiteSpace: "nowrap",
                }}
              >
                {username}
              </Typography>

              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,0.60)",

                  fontSize: 10,

                  mt: 0.35,
                }}
              >
                Pengguna
              </Typography>

            </Box>

          </Box>


          {/* LOGOUT */}

          <Button
            onClick={logout}
            sx={{
              color: "#ffffff",

              fontWeight: 700,

              fontSize: 13,

              textTransform: "none",

              border:
                "1px solid rgba(255,255,255,0.20)",

              borderRadius: 2,

              px: {
                xs: 1.5,
                sm: 2,
              },

              py: 0.8,

              ml: {
                xs: 0.5,
                sm: 1,
              },

              "&:hover": {
                backgroundColor:
                  "rgba(255,255,255,0.10)",

                borderColor:
                  "#d4af37",

                color: "#d4af37",
              },
            }}
          >
            Logout
          </Button>

        </Box>

      </Toolbar>
    </AppBar>
  );
}