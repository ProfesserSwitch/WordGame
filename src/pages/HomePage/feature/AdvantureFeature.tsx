import { useNavigate } from "react-router-dom"; //เปลี่ยน หน้า
import { memo } from "react";
import { HoverListItem } from "../components/HoverListItem";
import { Box, Button, Typography, Grid } from "@mui/material";
import { useData } from "../hook/useData";
import { motion } from "framer-motion";
//อีหน้าแตด
type DetailItemProps = {
  orderNo: number;
  name: string;
};
type ListSectionProps = {
  //
  stages: {
    id?: string;
    orderNo: number;
    name: string;
    description?: string;
  }[];
};

const DetailItem = memo(
  ({
    orderNo,
    name,
    handleStageClick,
  }: DetailItemProps & { handleStageClick: () => void }) => {
    return (
      <HoverListItem onClick={handleStageClick}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* เลขด่าน */}
          <Box
            sx={{
              width: 40,
              height: 40,
              border: "3px solid #2b1d14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: `"Press Start 2P"`,
              fontSize: 14,
              backgroundColor: "#fff",
            }}
          >
            {orderNo}
          </Box>

          {/* ชื่อด่าน */}
          <Box>
            <div>{name}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Enemy Lv. {orderNo * 5}
            </div>
          </Box>
        </Box>
      </HoverListItem>
    );
  }
);

const ListSection = memo(
  ({
    stages,
    handleStageClick,
  }: ListSectionProps & { handleStageClick: () => void }) => {
    return (
      <Box sx={{ overflowY: "auto", height: "100%" }} role="listbox-1">
        {stages.map((item) => (
          <DetailItem
            orderNo={item.orderNo}
            name={item.name}
            handleStageClick={handleStageClick}
          />
        ))}
      </Box>
      // <Box
      //   sx={{
      //     height: "100%",
      //     overflow: "auto",
      //     display: "flex",
      //     flexDirection: "column",
      //     // gap: 1,
      //     pr: 1,
      //   }}
      //   role="listbox-1"
      // >

      //   {list.map((item) => (
      //     <ReportItem
      //       key={item.id}
      //       ReportItem={item}
      //       isSelected={selectedReportId === item.id}
      //       onSelect={onSelectReport}
      //       isUpdating={isUpdating}
      //     />
      //   ))}
      // </Box>
    );
  }
);
export const Title = ({title}: {title: string}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "-36px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={
          // { opacity: 0, scale: 0.6, y: -10 }
          false
      }
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -4, 0], // ลอยขึ้นลง
        }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
          y: {
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut",
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: `"Press Start 2P", monospace`,
            fontSize: { xs: 20, md: 28 },
            color: "#fffbe6",
            paddingX: 3,
            paddingY: 1,
            background: "#3a1c14",
            border: "3px solid #b22222",

            boxShadow: `
              0 0 0 2px #000,
              4px 4px 0 #000,
              0 0 12px rgba(255,80,80,0.8)
            `,
            textShadow: `
              2px 2px 0 #000,
              0 0 8px rgba(255,80,80,0.9)
            `,
            letterSpacing: 2,
          }}
        >
          {title}
        </Typography>
      </motion.div>
    </Box>
  );
};

const AdvantureFeature = () => {
  const { stages } = useData();
  const navigate = useNavigate();

  const handleStageClick = () => {
    navigate(`/battle`);
  };
  const MotionBox = motion(Box);
  return (
    <MotionBox
      initial={
      //   {
      //   opacity: 0,
      //   scale: 0.85,
      //   y: "-45%",
      //   x: "-50%",
      // }
      false
      }
      animate={{
        opacity: 1,
        scale: 1,
        y: "-50%",
        x: "-50%",
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      sx={{
        position: "fixed",
        top: "60%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        paddingTop: 6, // เผื่อหัว
        background: "linear-gradient(#7b4a3b, #5a3328)",
        border: "6px solid #7a1f1f",
        boxShadow: `
    inset 0 0 0 3px #d6b46a,
    0 0 20px rgba(180,40,40,0.5),
    0 20px 40px rgba(0,0,0,0.8)
  `,
        width: { xs: "90vw", sm: "400px", md: "40%" },
        height: "480px",
        padding: 2,
      }}
    >
      <Title title="ADVENTURE"/>
      <ListSection stages={stages} handleStageClick={handleStageClick} />
    </MotionBox>
  );
};

export default AdvantureFeature;
