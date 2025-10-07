import { Card, FormControl, Grow, InputLabel, MenuItem, Select } from "@mui/material";
import { useAtomValue } from "jotai";
import { personsAtom } from "src/atoms/person";
import strings from "src/localization/strings";
import UserRoleUtils from "src/utils/user-role-utils";

// import SummaryTimEntriesCard from "./summary-time-entries-card";
// import SpecificTimeEntriesCard from "./specific-time-entries-card";

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
              <Select
                labelId="employee-select-label"
                id="employee-select"
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(Number(event.target.value))}
                label={strings.employeeSelect.employeeSelectlabel}
              >
                {persons.map((person) => (
                  <MenuItem key={person.id} value={person.id}>
                    {`${person.firstName} ${person.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Card>
        </Grow>
      )}
      {/* <SummaryTimEntriesCard selectedEmployeeId={selectedEmployeeId}/> */}
      <br />
      {/* <SpecificTimeEntriesCard selectedEmployeeId={selectedEmployeeId}/>  */}
      <br />
    </>
  );
};

export default TimebankContent;
