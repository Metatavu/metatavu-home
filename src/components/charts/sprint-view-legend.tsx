import { Box, Typography, useTheme } from "@mui/material";


const SprintViewLegend = () => {
    const theme = useTheme();
    
    return (
        <Box display="flex" justifyContent="center" alignItems="center" mt={1.5}>
           {/* Color box */}
        <Box
            sx={{
                width: 10,
                height: 9,
                borderRadius: "100%",
                backgroundColor: theme.palette.info.main,
                mr: 1
            }}
            />

             {/* Label */}
            <Typography variant="caption"
            sx={{
                fontSize: 12,
                lineHeight: 1
            }}>
                Estimate Hours
            </Typography>
            </Box>
    );
};

export default SprintViewLegend;
    

