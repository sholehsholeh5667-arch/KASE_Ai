import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {},
});

api.interceptors.request.use(
  (config) => {

    let token =
      localStorage.getItem(
        "access_token"
      );

    if (token) {

      // Bersihkan jika token lama tersimpan
      // sebagai:
      // Bearer eyJ...
      token =
        token
          .replace(
            /^Bearer\s+/i,
            ""
          )
          .trim();

      // Simpan kembali dalam bentuk JWT mentah
      localStorage.setItem(
        "access_token",
        token
      );

      config.headers.Authorization =
        `Bearer ${token}`;
    }
    console.log(
     "AUTH HEADER TERPASANG:",
     Boolean(token)
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;