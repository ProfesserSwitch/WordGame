import { Box } from "@mui/material";

export default function PaperFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ position: "relative", width: 560 }}>
      {/* SVG กระดาษ */}
      <svg
        viewBox="0 0 560 420"
        width="100%"
        height="auto"
        style={{ display: "block" }}
      >
        <path
          d="
            M30 20
            Q10 50 30 80
            L25 120
            Q10 150 30 190
            L20 300
            Q40 380 80 390
            L480 390
            Q510 390 540 300
            L550 80
            Q570 5 470 30
            L80 30
            Q50 20 30 20
          "
          fill="#f5ecd8"
          stroke="#6b4a2d"
          strokeWidth="6"
        />
      </svg>

      {/* Content */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
