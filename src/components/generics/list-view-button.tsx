import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";

import GridViewIcon from "@mui/icons-material/GridView";
import { Button, type SxProps, type Theme, useTheme } from "@mui/material";

interface ListViewButtonProps {
  listView: boolean;
  setListView: (value: boolean) => void;
  styles?: SxProps<Theme>;
}

const ListViewButton = (props: ListViewButtonProps) => {
  const { listView, setListView, styles } = props;
  const theme = useTheme();

  return (
    <Button
      variant="contained"
      sx={{
        maxWidth: "32px",
        height: "55px",
        backgroundColor: theme.palette.background.paper,
        "&:hover": { backgroundColor: theme.palette.action.hover },
        ...styles
      }}
      size="small"
      onClick={() => setListView(!listView)}
    >
      {listView ? (
        <FormatListBulletedOutlinedIcon sx={{ color: theme.palette.text.primary }} />
      ) : (
        <GridViewIcon sx={{ color: theme.palette.text.primary }} />
      )}
    </Button>
  );
};

export default ListViewButton;
