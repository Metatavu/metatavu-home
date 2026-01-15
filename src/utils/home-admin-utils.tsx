import { Box, Grid, Skeleton } from "@mui/material";
import type { ReactNode } from "react";
import strings from "src/localization/strings";

const renderCardWithSkeleton = (title: string): ReactNode => (
  <Box
    sx={{
      background: "#ffffff",
      borderRadius: 1,
      boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
      minHeight: title === strings.sprint.sprintview ? 258 : 139
    }}
  >
    <Grid sx={{ padding: 2 }}>
      <Box sx={{ fontWeight: "bold", fontSize: 22 }}>{title}</Box>
      <div style={{ color: "#888", fontSize: 15, padding: "12px 0" }}>
        {strings.notOptedInDescription.description}
      </div>
      <Skeleton variant="rectangular" height={20} sx={{ mt: 1 }} />
    </Grid>
  </Box>
);

export default renderCardWithSkeleton;
