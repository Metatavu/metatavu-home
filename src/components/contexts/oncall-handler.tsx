import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Switch,
  Chip,
  Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DateTime } from "luxon";
import type { OnCallWeek } from "../../types";
import strings from "src/localization/strings";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  onCallEntry: OnCallWeek | undefined;
  updatePaidStatus: (year: number, week: number, paid: boolean) => Promise<void>;
  refreshOnCallData?: () => void;
}

const getWeekRange = (isoDate: string) => {
  const date = DateTime.fromISO(isoDate);
  const start = date.startOf("week").toFormat("dd.MM.yyyy");
  const end = date.endOf("week").toFormat("dd.MM.yyyy");
  return `${start} - ${end}`;
};

const OnCallHandler = ({
  open,
  setOpen,
  onCallEntry,
  updatePaidStatus,
  refreshOnCallData
}: Props) => {
  const [loading, setLoading] = useState(false);

  if (!onCallEntry) return null;

  const weekNumber = DateTime.fromISO(String(onCallEntry.date)).weekNumber;
  const year = DateTime.fromISO(String(onCallEntry.date)).year;
  const weekRange = getWeekRange(String(onCallEntry.date));

  const handleStatusChange = async () => {
    setLoading(true);
    await updatePaidStatus(year, weekNumber, onCallEntry.paid);
    setLoading(false);
    setOpen(false);
    if (refreshOnCallData) refreshOnCallData();
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {`${strings.oncall.updatePaidStatusForWeek} ${weekNumber}`}
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            <b>Person:</b> {onCallEntry.username}
          </Typography>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <b>Paid Status:</b>
            <Chip
              label={onCallEntry.paid ? strings.oncall.paid : strings.oncall.notPaid}
              color={onCallEntry.paid ? "success" : "default"}
              sx={{
                bgcolor: onCallEntry.paid ? "#7bd15c" : "#f44336",
                color: "#fff"
              }}
            />
          </Typography>
          <Typography variant="subtitle1">
            <b>Date:</b> {weekRange}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
          <Typography>
            {strings.oncall.notPaid}
          </Typography>
          <Switch
            checked={onCallEntry.paid}
            onChange={handleStatusChange}
            color="success"
            disabled={loading}
            inputProps={{ "aria-label": "Paid status switch" }}
          />
          <Typography>
            {strings.oncall.paid}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="inherit">
          {strings.tableToolbar.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OnCallHandler;
