import { FormControl, MenuItem, Select } from "@mui/material";
import strings from "src/localization/strings";
import { STATUS } from "../constants";

/**
 * Component properties
 */
interface Props {
  setFilter: (string: string) => void;
}

/**
 * Filters tasks by status categories
 *
 * @param props Component properties
 */
export const TaskStatusFilter = ({ setFilter }: Props) => {
  const statusFilters = [
    { key: 1, value: STATUS.TODO, label: strings.sprint.toDo },
    { key: 2, value: STATUS.INPROGRESS, label: strings.sprint.inProgress },
    { key: 3, value: STATUS.DONE, label: strings.sprint.completed },
    { key: 4, value: STATUS.ALL, label: strings.sprint.allTasks }
  ];

  return (
    <FormControl size="small" style={{ width: "200px", float: "right" }}>
      <Select
        defaultValue={strings.sprint.allTasks}
        style={{
          borderRadius: "30px",
          float: "right"
        }}
      >
        {statusFilters.map((filter) => (
          <MenuItem key={filter.key} value={filter.label} onClick={() => setFilter(filter.value)}>
            {filter.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
