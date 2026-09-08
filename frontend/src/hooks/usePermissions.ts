import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { userService } from "../services/userService";

type PermissionCode = string;

export function usePermissions() {
  const [
    permissionCodes,
    setPermissionCodes,
  ] = useState<PermissionCode[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadPermissions =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const permissions =
          await userService.getMyPermissions();

        const codes =
          permissions
            .map(
              (permission) =>
                permission.kode
            )
            .filter(
              (
                code
              ): code is string =>
                Boolean(code)
            );

        setPermissionCodes(
          codes
        );
      } catch (err: any) {
        console.error(
          "Gagal memuat permission user:",
          err
        );

        setPermissionCodes([]);

        setError(
          err?.response?.data?.detail ??
            "Gagal memuat hak akses."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadPermissions();
  }, [
    loadPermissions,
  ]);

  const permissionSet =
    useMemo(
      () =>
        new Set(
          permissionCodes
        ),
      [
        permissionCodes,
      ]
    );

  const hasPermission =
    useCallback(
      (
        code: PermissionCode
      ) =>
        permissionSet.has(
          code
        ),
      [
        permissionSet,
      ]
    );

  return {
    permissions:
      permissionCodes,

    hasPermission,

    loading,

    error,

    reload:
      loadPermissions,
  };
}