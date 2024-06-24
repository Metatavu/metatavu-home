import { Card, FormControl, Grow, InputLabel, type SelectChangeEvent } from "@mui/material";
import { useAtomValue } from "jotai";
import { personsAtom } from "src/atoms/person";
import UserRoleUtils from "src/utils/user-role-utils";
import SummaryTimEntriesCard from "./summary-time-entries-card";
import SpecificTimeEntriesCard from "./specific-time-entries-card";
import { renderSelect } from "src/utils/select-utils";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface Props {
  selectedEmployeeId: number | undefined;
  setSelectedEmployeeId: (selectedEmployeeId?: number) => void;
}

/**
 * Component that contains the entirety of Timebank content, such as charts
 *
 * @param props Component properties
 */
const TimebankContent = ({ selectedEmployeeId, setSelectedEmployeeId }: Props) => {
  const persons = useAtomValue(personsAtom);
  const isAdmin = UserRoleUtils.isAdmin();

  return (
    <>
      {isAdmin && (
        <Grow in>
          <Card sx={{ p: "1%", display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <FormControl fullWidth>
              <InputLabel id="employee-select-label">
                {strings.employeeSelect.employeeSelectlabel}
              </InputLabel>
              {renderSelect({
                loading: false,
                selectedEmployeeId: selectedEmployeeId ?? 0,
                persons,
                onChange: (event: SelectChangeEvent<any>) => {
                  setSelectedEmployeeId(Number(event.target.value));
                },
                sx: { width: "100%" },
                label: strings.employeeSelect.employeeSelectlabel
              })}
            </FormControl>
          </Card>
        </Grow>
      )}
      <SummaryTimEntriesCard selectedEmployeeId={selectedEmployeeId} />
      <br />
      <SpecificTimeEntriesCard selectedEmployeeId={selectedEmployeeId} />
      <br />
    </>
  );
};

export default TimebankContent;
