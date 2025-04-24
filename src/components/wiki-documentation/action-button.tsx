import { Button } from "@mui/material";
import { wikiScreenColors } from "src/theme";

const colors = wikiScreenColors;

interface Props {
  children: string | JSX.Element,
  onClick?: () => void
}

const ActionButton = ({children, onClick}: Props) => (
  <Button 
    variant="contained" 
    sx={{
      width: "100%", 
      backgroundColor: colors.button.main, 
      color: colors.button.text, 
      "&:hover": {
        backgroundColor: colors.button.hover
      }
    }} 
    onClick={onClick}
  >
    {children}
  </Button>
)

export default ActionButton;