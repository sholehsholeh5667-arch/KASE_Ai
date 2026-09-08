import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import type { Supplier } from "../../types/supplier";

interface DeleteSupplierDialogProps {
  open: boolean;
  supplier: Supplier | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteSupplierDialog({
  open,
  supplier,
  loading,
  onClose,
  onConfirm,
}: DeleteSupplierDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Hapus Supplier</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Apakah Anda yakin ingin menghapus supplier
          <strong> "{supplier?.nama}" </strong>
          ?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Batal
        </Button>

        <Button
          color="error"
          variant="contained"
          disabled={loading}
          onClick={onConfirm}
        >
          {loading ? (
            <CircularProgress
              size={20}
              color="inherit"
            />
          ) : (
            "Hapus"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}