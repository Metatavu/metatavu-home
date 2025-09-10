import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import UserRoleUtils from "src/utils/user-role-utils";

interface BackButtonProps {
  label: string;
}

const BackButton = ({ label }: BackButtonProps) => {
  const navigate = useNavigate();
  const isAdmin = UserRoleUtils.adminMode();

  const navBack = () => {
    if (window.history.length > 1) navigate(-1);
    else if (isAdmin) navigate("/admin");
    else navigate("/"); // fallback for non-admin
  };

  return (
    <Button
      variant="contained"
      onClick={navBack}
      startIcon={<KeyboardReturn />}
      sx={{
        mt: 3,
        padding: "10px",
        width: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:active": { transform: "translateX(-1px) scale(0.98)" },
      }}
    >
      <Typography>
        {label}
      </Typography>
    </Button>
  );
};

export default BackButton;
