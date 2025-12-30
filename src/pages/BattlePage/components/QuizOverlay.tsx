import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { QuizData } from "../types";

interface QuizOverlayProps {
  data: QuizData;
  onAnswer: (ans: string) => void;
  onTimeout: () => void; // Callback when time runs out
}

export const QuizOverlay: React.FC<QuizOverlayProps> = ({ data, onAnswer, onTimeout }) => {
  const DURATION = 5000; // 5 seconds to answer (adjust as needed)
  const [timeLeft, setTimeLeft] = useState(DURATION);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DURATION - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeout(); // Trigger timeout logic
      }
    }, 16); // ~60fps update

    return () => clearInterval(interval);
  }, [onTimeout]);

  const progress = (timeLeft / DURATION) * 100;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px", // Position at the bottom
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "800px",
        background: "rgba(0, 0, 0, 0.85)",
        border: "3px solid #ff4d4d",
        borderRadius: "12px",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 2000,
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.8)",
      }}
    >
      {/* Timer Bar */}
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "#333",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "5px",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: progress > 30 ? "#00e676" : "#ff1744", // Green -> Red
          }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0 }} // Direct update from state
        />
      </div>

      {/* Choices (Horizontal Layout) */}
      <div
        style={{
          display: "flex",
          flexDirection: "row", // Horizontal
          justifyContent: "space-between",
          gap: "10px",
          width: "100%",
        }}
      >
        {data.choices.map((choice, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.05, backgroundColor: "#444" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAnswer(choice)}
            style={{
              flex: 1, // Distribute space evenly
              padding: "15px 10px",
              fontSize: "18px",
              fontWeight: "bold",
              background: "#2a2a2a",
              color: "#fff",
              border: "2px solid #555",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "center",
              whiteSpace: "nowrap", // Prevent text wrapping
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {choice}
          </motion.button>
        ))}
      </div>
    </div>
  );
};