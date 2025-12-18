import { Box, Button, Grid, Typography, Stack, Chip } from "@mui/material";
const Info = ()=>{
  return (
    <Box sx={{display:'flex',flexDirection:'column', backgroundColor:'pink',m:1}}>
      {/* name + description */}
      <Box sx={{width:'100%',height:'50px'}}>
        <Typography variant="subtitle1" fontSize={30} fontFamily={"fantasy"} fontWeight={'light'}>Monster</Typography>
        <Box sx={{height:'50px', backgroundColor:'brown'}}>
           <Typography>Desctipion : Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.</Typography>
        </Box>
      </Box>

      {/* status */}
    </Box>
  )
}
const DetailMonster = () => {
  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      {/* picture monster */}
      <Grid
        size={{ xs: 12, sm: 12, md: 5, lg: 5 }}
        sx={{
          border: "1px solid black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: "grey",
            height: "90%",
            width: "80%",
            alignItems: "center",
            borderRadius: "20px",
          }}
        >
          picture monster
        </Box>
      </Grid>
      {/* detail monster*/}
      <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            border: "1px solid black",
            width:'100%'
          }}
        >
          {/* button tab */}
          <Stack direction="row" spacing={2} sx={{mt:1, ml:2}}>
            <Chip label="Info" />
            <Chip label="Defense" />
          </Stack>
          {/* <Box sx={{display:'flex', width:'100%', justifyContent:'space-evenly', mt:1}}>
            <Button sx={{border:'2px solid black' ,borderRadius:'10px' ,}}>
              <Typography>info</Typography>
            </Button>
            <Button sx={{border:'2px solid black' ,borderRadius:'10px'}}>
              <Typography>status</Typography>
            </Button>
            <Button sx={{border:'2px solid black' ,borderRadius:'10px'}}>
              <Typography>defense</Typography>
            </Button>
          </Box> */}

          {/* detail */}
          <Box>
            <Info/>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

const ListMonster = () => {
  return <></>;
};
const MonsterLibrary = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#feffebff",
        border: "20px solid #000",
        padding: 4,
        zIndex: 9999,
        height: "400px",
        width: { xs: "80%", sm: "80%", md: "50%", lg: "60%" },
        // pr:
        // overflowY: "auto",
      }}
    >
      {/* Detail Monster */}
      <Box
        sx={{
          width: "100%",
          height: "calc(100% - 60px)",
          // backgroundColor: "pink",
          overflow: "auto",
          p: 1,
        }}
      >
        <DetailMonster />
      </Box>

      {/* tab select Monster */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          mb: 2,
          padding: 1,
          backgroundColor: "yellow",
        }}
      >
        <ListMonster />
      </Box>
    </Box>
  );
};
export default MonsterLibrary;
