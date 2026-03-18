import { Divider } from "@mui/material";
import { DateTime } from "luxon";
import strings from "src/localization/strings";
import GenericDialog from "../generics/generic-dialog";
import { CustomDatePicker } from "../work-hours/timebank-daterange-picker";

/**
 * Component properties
 */
interface Props {
  syncStartDate: DateTime;
  setSyncStartDate: (syncStartDate: DateTime) => void;
  syncHandlerOpen: boolean;
  setSyncHandlerOpen: (syncHandlerOpen: boolean) => void;
  synchronizeTimeEntries: () => void;
}

/**
 * SyncHandler component
 *
 * @param props component properties
 */
const SyncDialog = ({
  syncStartDate,
  setSyncStartDate,
  syncHandlerOpen,
  setSyncHandlerOpen,
  synchronizeTimeEntries
}: Props) => {
  /**
   * Component render
   */
  return (
    <GenericDialog
      open={syncHandlerOpen}
      onClose={() => {
        setSyncHandlerOpen(false);
      }}
      onCancel={() => {
        setSyncHandlerOpen(false);
      }}
      onConfirm={() => {
        synchronizeTimeEntries();
        setSyncHandlerOpen(false);
      }}
      cancelButtonText={strings.syncDialog.cancel}
      confirmButtonText={strings.syncDialog.sync}
      title={strings.syncDialog.title}
    >
      <CustomDatePicker
        label={strings.syncDialog.label}
        maxDate={DateTime.now()}
        minDate={DateTime.now().set({ year: 2021, month: 7, day: 31 })}
        value={syncStartDate}
        onChange={(newValue: DateTime | null) => newValue && setSyncStartDate(newValue)}
      />
      <Divider />
    </GenericDialog>
  );
};

export default SyncDialog;
