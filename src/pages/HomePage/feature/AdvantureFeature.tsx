import { useNavigate } from "react-router-dom"; //เปลี่ยน หน้า
import { memo } from "react";
import { HoverListItem } from "../components/HoverListItem";
import { Box, Button, Typography, Grid } from "@mui/material";
import { useData } from "../hook/useData";
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

const DetailItem = memo(({ orderNo, name }: DetailItemProps) => {
  return (
    <HoverListItem>
      <Grid container spacing={2}  sx={{ width: "99%" }}>
        <Grid size={{ xs: 3, sm: 3, md: 3, lg: 1 }}>
          {/* order stage map */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Typography>{orderNo}.</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs:9,  sm: 9, md: 9, lg: 10 }}>
          {/* order stage map */}

            <Typography>{name}</Typography>
        </Grid>
        {/* // <Grid size={{ xs: 3, sm: 3, md: 3, lg: 5 }}>
         <Box>
        <Typography>{orderNo}</Typography>
         </Box>
        </Grid> */}
      </Grid>
    </HoverListItem>
  );
});

const ListSection = memo(({ stages }: ListSectionProps) => {
  return (

   <Box sx={{ overflowY: "auto", height: "100%" }} role="listbox-1">
    {stages.map((item) => (
        <DetailItem orderNo={item.orderNo} name={item.name} />
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
});

const AdvantureFeature = () => {
  const { stages } = useData();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",

        transform: "translate(-50%, -50%)",
        background: "#feffebff",
        // borderRadius: 2,
        border: "20px solid #000",
        padding: 4,
        // boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        zIndex: 9999,
        height: "400px",
        width: { xs: "80%", sm: "80%", md: "50%", lg: "80%" },
        // pr:
        // overflowY: "auto",
      }}
    >
      <ListSection stages={stages} />
      {/* <Button onClick={() => navigate("/battle")}>play</Button> */}
    </Box>
  );
};

export default AdvantureFeature;
