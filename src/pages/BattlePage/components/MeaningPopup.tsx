import { motion } from "framer-motion";

interface MeaningPopupProps {
  meaning: string ;
}

export const MeaningPopup: React.FC<MeaningPopupProps> = ({
  meaning
}) => {
  return (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  zIndex: 999,
                }}
              >
                <div style={{ height: "65px" }} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.85, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: "rgba(244, 228, 188)",
                    border: "2px solid #5c4033",
                    padding: "10px 25px",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#8d6e63",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    — Meaning —<br />
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      color: "#3e2723",
                      fontWeight: "bold",
                    }}
                  >
                    {meaning}
                  </span>
                </motion.div>
              </div>
    );
};
