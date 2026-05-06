import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import GridViewIcon from "@mui/icons-material/GridView";
import { Button, type SxProps, type Theme, useTheme } from "@mui/material";

/**
 * ListViewButton properties
 *
 * @param props.listView - Current view state (true for list view, false for grid view)
 * @param props.setListView - Function to update the view state
 * @param props.styles - Optional MUI sx styles to extend or override default styles
 */
interface ListViewButtonProps {
  listView: boolean;
  setListView: (value: boolean) => void;
  styles?: SxProps<Theme>;
}
/**
 * Button component for toggling between list and grid view
 * @param props.listView - Current view state (true for list view, false for grid view)
 * @param props.setListView - Function to update the view state
 * @param props.styles - Optional MUI sx styles to extend or override default styles
 */
const ListViewButton = ({ listView, setListView, styles }: ListViewButtonProps) => {
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
