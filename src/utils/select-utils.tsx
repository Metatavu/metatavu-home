import { Select, MenuItem, type SelectChangeEvent, Box } from "@mui/material";
import type { OverridableStringUnion } from "@mui/types";
import type { Person } from "src/generated/client";

/**
 *  Select component properties
 */
interface Props {
  loading: boolean;
  selectedEmployeeId: number;
  persons: Person[];
  onChange: (event: SelectChangeEvent<any>) => void;
  sx?: object;
  label?: string;
  size?: OverridableStringUnion<"small" | "medium">;
}

/**
 * Renders the select
 */
export const renderSelect = ({
  loading,
  selectedEmployeeId,
  persons,
  onChange,
  sx = {},
  label,
  size = "medium"
}: Props) => (
  <Box sx={{ width: "40%", justifyContent: "center", ...sx }}>
    <Select
      size={size}
      label={label}
      fullWidth
      style={{
        borderRadius: "30px",
        float: "right"
      }}
      labelId="employee-select-label"
      id="employee-select"
      value={selectedEmployeeId}
      disabled={loading}
      onChange={onChange}
    >
      {persons.map((person) => (
        <MenuItem key={person.id} value={person.id}>
          {`${person.firstName} ${person.lastName}`}
        </MenuItem>
      ))}
    </Select>
  </Box>
);
