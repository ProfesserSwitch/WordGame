import {
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};
export const DialogComponent = ({ open, onClose, children }: DialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth hideBackdrop>
      <DialogTitle>Use Google's location service?</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
