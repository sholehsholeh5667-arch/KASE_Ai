/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#0f172a",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#06b6d4",
        background: "#f8fafc"
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      },

      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.08)"
      }
    }
  },

  plugins: []
};