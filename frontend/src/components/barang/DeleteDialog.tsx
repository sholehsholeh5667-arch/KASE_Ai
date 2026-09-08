import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

interface DeleteDialogProps {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteDialog({
  open,
  title,
  message,
  loading = false,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
          color="inherit"
        >
          Batal
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading}
          color="error"
          variant="contained"
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Hapus"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}