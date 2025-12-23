import { Paper, Button } from "@mui/material";

type HoverListItemProps = {
    children: React.ReactNode;
    onclick?: ()=>void;
};
export const HoverListItem = ({children,onclick}:HoverListItemProps) => {
  return (
    <Paper sx={{ cursor: "pointer", margin: 0.5 }}>
      <Button
        variant="text"
        size="small"
        onClick={onclick}
        sx={{
          width: "100%",
          height: "100%",
          padding: 5,
          justifyContent: "flex-start",
          textAlign: "left",
          color: "inherit",
          "&:hover": {
            backgroundColor: "transparent",
          },
          "&:disabled": {
            opacity: 0.6,
          },
        }}
      >
        {children}
      </Button>
    </Paper>
  );
};
