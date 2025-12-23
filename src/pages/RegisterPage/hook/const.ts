export type SnackbarState = {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
};