
import { Box,Grid } from "@mui/material";

const SearchAndFilterSection = ()=>{
  return <div>SearchAndFilterSection</div>;
}
const ListSection = ()=>{
  return <div>ListSection</div>;
}
const ShopSpellFeature = () => {
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
           zIndex: 9999,
           height: "400px",
           width: { xs: "80%", sm: "80%", md: "80%", lg: "80%" },
           // pr:
           // overflowY: "auto",
         }}
       >
        <Box sx={{width: '100%', mb:2 , backgroundColor:'red'}}>
          <SearchAndFilterSection />
        </Box>
        <Box sx={{width: '100%', height:'calc(100% - 60px)', backgroundColor:'blue'}}>
          <ListSection />
        </Box>

         {/* <Button onClick={() => navigate("/battle")}>play</Button> */}
       </Box>
  );
};

export default ShopSpellFeature;
