import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import type { ReactNode } from "react";

import MainLayout from "../layouts/MainLayout";

// ==========================================================
// PUBLIC
// ==========================================================

import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// ==========================================================
// DASHBOARD
// ==========================================================

import Dashboard from "../pages/Dashboard";
import DashboardAnalytics from "../pages/DashboardAnalytics";

// ==========================================================
// MASTER DATA
// ==========================================================

import BarangPage from "../pages/BarangPage";
import Kategori from "../pages/Kategori";
import Supplier from "../pages/Supplier";
import Pelanggan from "../pages/Pelanggan";

// ==========================================================
// TRANSAKSI
// ==========================================================

import Pembelian from "../pages/Pembelian";
import Penjualan from "../pages/Penjualan";
import ReturPembelian from "../pages/ReturPembelian";
import ReturPenjualan from "../pages/ReturPenjualan";

// ==========================================================
// STOK
// ==========================================================

import StockOpname from "../pages/StockOpname";
import MutasiStok from "../pages/MutasiStok";

// ==========================================================
// LAPORAN
// ==========================================================

import Laporan from "../pages/Laporan";

// ==========================================================
// AI
// ==========================================================

import Muamalah from "../pages/Muamalah";
import Kitab from "../pages/Kitab";
import AIZakat from "../pages/AIZakat";

// ==========================================================
// HAK AKSES
// ==========================================================

import HakAkses from "../pages/HakAkses";

// ==========================================================
// SETTING TOKO
// ==========================================================

import SettingToko from "../pages/SettingToko";

// ==========================================================
// TEST TOKO AKTIF
// ==========================================================

import TestToko from "../pages/TestToko";

// ==========================================================
// PRIVATE ROUTE
// ==========================================================

function PrivateRoute({
  children,
}: {
  children: ReactNode;
}) {
  const token =
    localStorage.getItem(
      "access_token"
    );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <>{children}</>;
}

// ==========================================================
// PUBLIC ROUTE
// ==========================================================

function PublicRoute({
  children,
}: {
  children: ReactNode;
}) {
  const token =
    localStorage.getItem(
      "access_token"
    );

  if (token) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <>{children}</>;
}

// ==========================================================
// APP ROUTER
// ==========================================================

export default function AppRouter() {
  return (
    <Routes>

      {/* ==================================================
          ROOT
      ================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* ==================================================
          PUBLIC ROUTES
      ================================================== */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <ForgotPassword />
        }
      />

      <Route
        path="/reset-password"
        element={
          <ResetPassword />
        }
      />

      {/* ==================================================
          PRIVATE APPLICATION
      ================================================== */}

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >

        {/* ==================================================
            DASHBOARD
        ================================================== */}

        <Route
          index
          element={
            <Dashboard />
          }
        />

        <Route
          path="dashboard"
          element={
            <Dashboard />
          }
        />

        <Route
          path="dashboard-analytics"
          element={
            <DashboardAnalytics />
          }
        />

        {/* ==================================================
            MASTER DATA
        ================================================== */}

        <Route
          path="barang"
          element={
            <BarangPage />
          }
        />

        <Route
          path="kategori"
          element={
            <Kategori />
          }
        />

        <Route
          path="supplier"
          element={
            <Supplier />
          }
        />

        <Route
          path="pelanggan"
          element={
            <Pelanggan />
          }
        />

        {/* ==================================================
            TRANSAKSI
        ================================================== */}

        <Route
          path="pembelian"
          element={
            <Pembelian />
          }
        />

        <Route
          path="penjualan"
          element={
            <Penjualan />
          }
        />

        <Route
          path="retur-pembelian"
          element={
            <ReturPembelian />
          }
        />

        <Route
          path="retur-penjualan"
          element={
            <ReturPenjualan />
          }
        />

        {/* ==================================================
            STOK
        ================================================== */}

        <Route
          path="stock-opname"
          element={
            <StockOpname />
          }
        />

        <Route
          path="mutasi-stok"
          element={
            <MutasiStok />
          }
        />

        {/* ==================================================
            LAPORAN
        ================================================== */}

        <Route
          path="laporan"
          element={
            <Laporan />
          }
        />

        {/* ==================================================
            AI MUAMALAH
        ================================================== */}

        <Route
          path="ai-muamalah"
          element={
            <Muamalah />
          }
        />

        {/* ==================================================
            AI KITAB KUNING
        ================================================== */}

        <Route
          path="ai-kitab"
          element={
            <Kitab />
          }
        />

        {/* ==================================================
            AI ZAKAT TIJARAH
        ================================================== */}

        <Route
          path="ai-zakat"
          element={
            <AIZakat />
          }
        />

        {/* ==================================================
            HAK AKSES
        ================================================== */}

        <Route
          path="hak-akses"
          element={
            <HakAkses />
          }
        />

        {/* ==================================================
            SETTING TOKO
        ================================================== */}

        <Route
          path="setting"
          element={
            <SettingToko />
          }
        />

        {/* ==================================================
            TEST TOKO AKTIF
        ================================================== */}

        <Route
          path="test-toko"
          element={
            <TestToko />
          }
        />

      </Route>

      {/* ==================================================
          NOT FOUND
      ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}