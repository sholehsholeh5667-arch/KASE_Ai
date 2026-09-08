import type {
  PropsWithChildren,
  ReactNode,
} from "react";

import { usePermissions } from "../hooks/usePermissions";


/* ==========================================================
   TYPES
========================================================== */

interface PermissionGuardProps
  extends PropsWithChildren {
  permission: string;

  /**
   * Tampilan ketika permission tidak dimiliki.
   * Default: null → elemen tidak ditampilkan.
   */
  fallback?: ReactNode;

  /**
   * Tampilan sementara ketika permission
   * masih sedang dimuat.
   * Default: null.
   */
  loadingFallback?: ReactNode;
}


/* ==========================================================
   PERMISSION GUARD
========================================================== */

/**
 * PermissionGuard
 *
 * Mengontrol tampilan berdasarkan permission user
 * yang sedang login.
 *
 * Contoh:
 *
 * <PermissionGuard permission="barang.create">
 *   <Button>Tambah Barang</Button>
 * </PermissionGuard>
 *
 * Jika permission ada:
 *   → children ditampilkan
 *
 * Jika permission tidak ada:
 *   → fallback ditampilkan
 *
 * Jika permission masih dimuat:
 *   → loadingFallback ditampilkan
 */
export function PermissionGuard({
  permission,
  fallback = null,
  loadingFallback = null,
  children,
}: PermissionGuardProps) {

  const {
    hasPermission,
    loading,
  } = usePermissions();


  /* ========================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <>
        {loadingFallback}
      </>
    );
  }


  /* ========================================================
     CEK PERMISSION
  ======================================================== */

  if (
    !hasPermission(
      permission
    )
  ) {
    return (
      <>
        {fallback}
      </>
    );
  }


  /* ========================================================
     ALLOW
  ======================================================== */

  return (
    <>
      {children}
    </>
  );
}


/* ==========================================================
   HELPER COMPONENT
   UNTUK LOGIKA TERBALIK
========================================================== */

interface PermissionDeniedProps
  extends PropsWithChildren {
  permission: string;
  fallback?: ReactNode;
}


/**
 * PermissionDenied
 *
 * Menampilkan children hanya ketika
 * user TIDAK memiliki permission.
 *
 * Biasanya dipakai untuk pesan informasi.
 */
export function PermissionDenied({
  permission,
  fallback = null,
  children,
}: PermissionDeniedProps) {

  const {
    hasPermission,
    loading,
  } = usePermissions();


  if (loading) {
    return null;
  }


  if (
    hasPermission(
      permission
    )
  ) {
    return (
      <>
        {fallback}
      </>
    );
  }


  return (
    <>
      {children}
    </>
  );
}