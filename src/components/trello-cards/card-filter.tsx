import React from "react";
import { Card, TextField } from "@mui/material";
import strings from "src/localization/strings";

/**
 * Interface for CardFilter component
 * 
 * @param filterQuery the text used to filter cards
 * @param onFilterChange callback that handles updates to the filter
 */
interface FilterProps {
  filterQuery: string;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * CardFilter component for filtering cards based on a query
 */
const CardFilter = ({ filterQuery, onFilterChange }: FilterProps ) => {
  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <TextField
        label={strings.cardScreen.filterCards}
        value={filterQuery}
        onChange={onFilterChange}
        fullWidth
      />
    </Card>
  );
};

export default CardFilter;