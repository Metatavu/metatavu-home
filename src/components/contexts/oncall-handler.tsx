import { useState } from "react";
import GenericDialog from "../generics/generic-dialog";
import { OnCallCalendarEntry } from "../../types";
import { Box, Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { DateTime } from "luxon";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  onCallEntry: OnCallCalendarEntry | undefined;
  updatePaidStatus: (year: number, week: number, paid: boolean) => void;
}

/**
 * On call handler component
 * @param props component properties
 */
const OnCallHandler = ({ open, setOpen, onCallEntry, updatePaidStatus }: Props) => {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const weekNumber = DateTime.fromISO(String(onCallEntry?.date)).weekNumber;
  const year = DateTime.fromISO(String(onCallEntry?.date)).year;

  if (!onCallEntry) return null;

  /**
   * Component render
   */
  return (
    <GenericDialog
      title={`${strings.timeExpressions.week} ${weekNumber}`}
      open={open}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
    >
      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <DialogContent>{strings.confirmationHandler.title}</DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              await updatePaidStatus(year, weekNumber, onCallEntry.paid);
              setConfirmationOpen(false);
              setOpen(false);
            }}
          >
            {strings.confirmationHandler.confirmButtonText}
          </Button>
          <Button onClick={() => setConfirmationOpen(false)}>
            {strings.confirmationHandler.cancelButtonText}
          </Button>
        </DialogActions>
      </Dialog>
      {strings.vacationRequest.person}: {onCallEntry.person}
      <br />
      {strings.vacationRequest.status}:{" "}
      {onCallEntry.paid ? strings.oncall.paid : strings.oncall.notPaid}
      <br />
      <Box sx={{ display: "flex", justifyContent: "center", mt: "16px" }}>
        <Button variant="outlined" onClick={() => setConfirmationOpen(true)}>
          {strings.form.update}
        </Button>
      </Box>
    </GenericDialog>
  );
};

export default OnCallHandler;
