import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  ArrowBack,
  Email,
} from "@mui/icons-material";

import {
  forgotPassword,
} from "../services/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // KIRIM PERMINTAAN RESET PASSWORD
  // ==========================================================

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Email wajib diisi."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await forgotPassword({
          email: cleanEmail,
        });

      setMessage(
        result.message
      );

    } catch (error: any) {
      setError(
        error.response?.data?.detail ??
        "Gagal memproses permintaan reset password."
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

          backgroundColor:
            "#ffffff",
        }}
      >

        {/* ==================================================
            BRANDING KASE AI
        ================================================== */}

        <Box
          textAlign="center"
          mb={4}
        >

          {/* LOGO */}

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
            }}
          >
            Kasir AI Syari'ah Entrepreneur
          </Typography>


          {/* JUDUL */}

          <Typography
            variant="h6"
            fontWeight={700}
            mt={2.5}
            sx={{
              color: "#1e293b",
            }}
          >
            Lupa Password
          </Typography>


          {/* DESKRIPSI */}

          <Typography
            color="text.secondary"
            mt={0.8}
            fontSize={13}
          >
            Masukkan email akun Anda
            untuk mendapatkan link
            reset password.
          </Typography>

        </Box>


        {/* ==================================================
            PESAN SUKSES
        ================================================== */}

        {message && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            {message}
          </Alert>
        )}


        {/* ==================================================
            PESAN ERROR
        ================================================== */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}


        {/* ==================================================
            EMAIL
        ================================================== */}

        <TextField
          fullWidth

          label="Email"

          type="email"

          margin="normal"

          value={email}

          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }

          onKeyDown={(event) => {
            if (
              event.key === "Enter"
            ) {
              handleSubmit();
            }
          }}

          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  mr: 1,

                  display: "flex",

                  alignItems: "center",
                }}
              >
                <Email
                  color="action"
                />
              </Box>
            ),
          }}
        />


        {/* ==================================================
            KIRIM LINK RESET
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

            fontSize: 15,

            backgroundColor:
              "#0b2a5b",

            "&:hover": {
              backgroundColor:
                "#123d7a",
            },
          }}

          disabled={loading}

          onClick={handleSubmit}
        >

          {loading ? (
            <CircularProgress
              size={24}
              color="inherit"
            />
          ) : (
            "KIRIM LINK RESET"
          )}

        </Button>


        {/* ==================================================
            KEMBALI KE LOGIN
        ================================================== */}

        <Button
          fullWidth

          startIcon={
            <ArrowBack />
          }

          sx={{
            mt: 2,

            color: "#0b2a5b",

            fontWeight: 600,
          }}

          onClick={() =>
            navigate("/login")
          }
        >
          Kembali ke Login
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