import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
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
      <InputLabel disableAnimation={false}>{strings.sprint.taskStatus}</InputLabel>
      <Select
        data-testid="status-filter"
        defaultValue={strings.sprint.allTasks}
        style={{
          borderRadius: "30px",
          marginBottom: "15px",
          float: "right"
        }}
        label={strings.sprint.taskStatus}
      >
        {statusFilters.map((filter) => (
          <MenuItem data-testid="status-options" key={filter.key} value={filter.label} onClick={() => setFilter(filter.value)}>
            {filter.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
