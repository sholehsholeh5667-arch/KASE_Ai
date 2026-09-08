import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Avatar,
  CircularProgress,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from "@mui/icons-material";

import { login } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLogin = async () => {
    if (!username || !password) {
      alert(
        "Username dan Password wajib diisi"
      );
      return;
    }

    try {
      setLoading(true);

      const result = await login({
        username,
        password,
      });

      // Simpan token login
      localStorage.setItem(
        "access_token",
        result.access_token
      );

      // Simpan username
      localStorage.setItem(
        "username",
        username
      );

      // Masuk dashboard
      navigate("/dashboard");

    } catch (error: any) {
      alert(
        error.response?.data?.detail ??
        "Login gagal"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",

        background:
          "linear-gradient(135deg,#0b2a5b,#123d7a,#06b6d4)",

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        p: 2,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: 430,

          maxWidth: "100%",

          p: 5,

          borderRadius: 5,

          backgroundColor: "#ffffff",
        }}
      >

        {/* ==================================================
            BRANDING KASE AI
        ================================================== */}

        <Box
          textAlign="center"
          mb={4}
        >

          {/* LOGO KASE AI */}

          <Avatar
            sx={{
              width: 88,

              height: 88,

              bgcolor: "#0b2a5b",

              margin: "auto",

              fontSize: 38,

              fontWeight: 800,

              color: "#ffffff",

              border:
                "3px solid #d4af37",

              boxShadow:
                "0 6px 18px rgba(0,0,0,0.22)",
            }}
          >
            K
          </Avatar>


          {/* NAMA APLIKASI */}

          <Typography
            variant="h4"
            fontWeight="bold"
            mt={2}
            sx={{
              color: "#0b2a5b",

              letterSpacing: 1.5,
            }}
          >
            KASE AI
          </Typography>


          {/* TAGLINE */}

          <Typography
            mt={0.8}
            sx={{
              color: "#64748b",

              fontSize: 15,

              fontWeight: 600,

              letterSpacing: 0.2,
            }}
          >
            Kasir AI Syari'ah Entrepreneur
          </Typography>


          {/* DESKRIPSI */}

          <Typography
            color="text.secondary"
            mt={1.5}
            fontSize={13}
          >
            Sistem kasir dan manajemen usaha
            berbasis AI
          </Typography>

        </Box>


        {/* ==================================================
            USERNAME
        ================================================== */}

        <TextField
          fullWidth

          label="Username"

          margin="normal"

          value={username}

          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }

          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />


        {/* ==================================================
            PASSWORD
        ================================================== */}

        <TextField
          fullWidth

          margin="normal"

          label="Password"

          type={
            showPassword
              ? "text"
              : "password"
          }

          value={password}

          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }

          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),

            endAdornment: (
              <InputAdornment position="end">

                <IconButton
                  onClick={() =>
                    setShowPassword(
                      (value) =>
                        !value
                    )
                  }

                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>

              </InputAdornment>
            ),
          }}
        />


        {/* ==================================================
            REMEMBER ME + LUPA PASSWORD
        ================================================== */}

        <Box
          display="flex"

          justifyContent="space-between"

          alignItems="center"

          mt={1}
        >

          <FormControlLabel
            control={
              <Checkbox />
            }

            label="Remember Me"
          />


          <Typography
            color="primary"

            sx={{
              cursor: "pointer",

              fontSize: 14,

              fontWeight: 600,

              userSelect: "none",

              "&:hover": {
                textDecoration:
                  "underline",
              },
            }}

            onClick={() =>
              navigate(
                "/forgot-password"
              )
            }
          >
            Lupa Password?
          </Typography>

        </Box>


        {/* ==================================================
            LOGIN BUTTON
        ================================================== */}

        <Button
          fullWidth

          variant="contained"

          size="large"

          sx={{
            mt: 3,

            py: 1.5,

            borderRadius: 3,

            fontWeight: "bold",

            fontSize: 16,

            backgroundColor:
              "#0b2a5b",

            "&:hover": {
              backgroundColor:
                "#123d7a",
            },
          }}

          disabled={loading}

          onClick={handleLogin}
        >

          {loading ? (
            <CircularProgress
              size={24}
              color="inherit"
            />
          ) : (
            "LOGIN"
          )}

        </Button>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <Typography
          textAlign="center"

          mt={4}

          color="text.secondary"

          fontSize={13}
        >
          KASE AI
        </Typography>

        <Typography
          textAlign="center"

          mt={0.5}

          color="text.secondary"

          fontSize={11}
        >
          Kasir AI Syari'ah Entrepreneur
        </Typography>

      </Paper>
    </Box>
  );
}