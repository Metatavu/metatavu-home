import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, Grid, Typography } from "@mui/material";
import { GridRowId } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

interface VacationRequestsTableToolbarProps {
  selectedRows: GridRowId[];
}
const VacationRequestsTableToolbar = (props: VacationRequestsTableToolbarProps) => {
  const { selectedRows } = props;
  const [editorOpen, setEditorOpen] = useState<boolean>(false);

  useEffect(() => {
    if (selectedRows.length) {
      setEditorOpen(true);
    } else {
      setEditorOpen(false);
    }
  }, [selectedRows]);
  return (
    <Box
      sx={{
        border: "1px solid lightgrey",
        p: "15px",
        m: "0"
      }}
    >
      {editorOpen ? (
        <Grid container alignContent="space-around">
          {selectedRows.length === 1 ? (
            <Grid item xs={6}>
              <Button>
                <Edit />
                <Typography variant="h6">&nbsp;Edit</Typography>
              </Button>
            </Grid>
          ) : (
            <Grid item xs={6} />
          )}
          <Grid item xs={6}>
            <Button>
              <Delete />
              <Typography variant="h6">&nbsp;Delete</Typography>
            </Button>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="h6">My Vacation Requests</Typography>
      )}
    </Box>
  );
};

export default VacationRequestsTableToolbar;