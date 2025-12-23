import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useMemo } from "react";

const STAR_COUNT = 100;

export default function StarBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 7,
        opacity: Math.random() * 0.4 + 0.3,
        duration: Math.random() * 8 + 6,
      })),
    []
  );

  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{ opacity: [star.opacity, 1, star.opacity] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: "#9B8484",
            clipPath:
              "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          }}
        />
      ))}
    </Box>
  );
}
