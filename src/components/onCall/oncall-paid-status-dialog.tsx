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
  Button,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DateTime } from "luxon";
import type { OnCallWeek } from "../../types";
import strings from "src/localization/strings";

/**
 * Props for OnCallPaidStatusDialog component
 */
interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  onCallEntry: OnCallWeek | undefined;
  updatePaidStatus: (year: number, week: number, paid: boolean) => Promise<void>;
  refreshOnCallData?: () => void;
}

/**
 * Returns formatted week range for a given ISO date
 * 
 * @param isoDate ISO date string
 * @returns Formatted week range string
 */
const getWeekRange = (isoDate: string): string => {
  const date = DateTime.fromISO(isoDate);
  const start = date.startOf("week").toFormat("dd.MM.yyyy");
  const end = date.endOf("week").toFormat("dd.MM.yyyy");
  return `${start} - ${end}`;
};

/**
 * Dialog component for updating paid status of an on-call week
 * 
 * @param open Whether the dialog is open
 * @param setOpen Function to set dialog open state
 * @param onCallEntry On-call week entry
 * @param updatePaidStatus Function to update paid status
 * @param refreshOnCallData Optional function to refresh on-call data
 */
const OnCallPaidStatusDialog = ({
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

  /**
   * Handles paid status change for the on-call week
   */
  const handlePaidStatusChange = async () => {
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
            <Typography component="span" fontWeight="bold" display="inline">
              {strings.oncall.person}:
            </Typography> {onCallEntry.username}
          </Typography>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography component="span" fontWeight="bold" display="inline">
              {strings.oncall.paidStatus}:
            </Typography>
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
            <Typography component="span" fontWeight="bold" display="inline">
              {strings.oncall.date}:
            </Typography> {weekRange}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
          <Typography>
            {strings.oncall.notPaid}
          </Typography>
          <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <Switch
              checked={onCallEntry.paid}
              onChange={handlePaidStatusChange}
              color="success"
              disabled={loading}
              inputProps={{ "aria-label": "Paid status switch" }}
            />
            {loading && (
              <CircularProgress size={32} sx={{ position: "absolute", left: 0, top: -4, zIndex: 1 }} />
            )}
          </Box>
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

export default OnCallPaidStatusDialog;
