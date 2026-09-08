import { useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";

import {
  resetPassword,
} from "../services/auth";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const token = useMemo(
    () =>
      searchParams.get("token") ?? "",
    [searchParams]
  );

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Token reset password tidak ditemukan."
      );
      return;
    }

    if (!password) {
      setError(
        "Password baru wajib diisi."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password minimal 8 karakter."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Konfirmasi password tidak sama."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await resetPassword({
          token,
          new_password: password,
        });

      setMessage(
        result.message
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error: any) {
      setError(
        error.response?.data?.detail ??
        "Gagal mereset password."
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


          {/* JUDUL */}

          <Typography
            variant="h6"
            fontWeight={700}
            mt={2.5}
            sx={{
              color: "#1e293b",
            }}
          >
            Reset Password
          </Typography>


          {/* DESKRIPSI */}

          <Typography
            color="text.secondary"
            mt={0.8}
            fontSize={13}
          >
            Buat password baru
            untuk akun Anda
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
            PASSWORD BARU
        ================================================== */}

        <TextField
          fullWidth

          margin="normal"

          label="Password Baru"

          type={
            showPassword
              ? "text"
              : "password"
          }

          value={password}

          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }

          InputProps={{
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
            KONFIRMASI PASSWORD
        ================================================== */}

        <TextField
          fullWidth

          margin="normal"

          label="Konfirmasi Password"

          type={
            showConfirmPassword
              ? "text"
              : "password"
          }

          value={
            confirmPassword
          }

          onChange={(event) =>
            setConfirmPassword(
              event.target.value
            )
          }

          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) =>
                        !value
                    )
                  }

                  edge="end"
                >
                  {showConfirmPassword ? (
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
            BUTTON UBAH PASSWORD
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

          disabled={
            loading ||
            !!message
          }

          onClick={handleSubmit}
        >
          {loading ? (
            <CircularProgress
              size={24}
              color="inherit"
            />
          ) : (
            "UBAH PASSWORD"
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
          © KASE AI
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