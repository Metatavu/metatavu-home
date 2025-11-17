import styled from "@emotion/styled";
import { Box, Card, Typography } from "@mui/material";

/**
 * Timebank card styled component
 */
export const TimebankCard = styled(Card)({
  border: "2px solid #bdbdbd;"
});

/**
 * Timebank card title component
 *
 * @param title title string
 * @returns timebank card title component
 */
export const TimebankCardTitle = (title: string) => (
  <Typography
    gutterBottom
    variant="h6"
    sx={{
      color: "white",
      textAlign: "center",
      backgroundColor: "#bdbdbd",
      width: "100%",
      p: 2,
      fontWeight: "bold"
    }}
  >
    {title}
  </Typography>
);

/**
 * Timebank card flex box styled component
 */
export const TimebankCardFlexBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center"
});