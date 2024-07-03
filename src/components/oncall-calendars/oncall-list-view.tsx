import { useAtomValue } from "jotai";
import { onCallAtom } from "../../atoms/oncall";
import { Box, Button, Checkbox, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { DateTime } from "luxon";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface Props {
  selectedDate: DateTime;
  setSelectedDate: (date: DateTime) => void;
  updatePaidStatus: (year: number, week: number, paid: boolean) => void;
}

/**
 * On call list view component
 * @param props component properties
 */
const OnCallListView = ({ selectedDate, setSelectedDate, updatePaidStatus }: Props) => {
  const onCallData = useAtomValue(onCallAtom);

  /**
   * Increases or decreases the selected year by 1
   * @param operation + or -
   */
  const incrementYear = (operation: string) => {
    if (operation === "+") setSelectedDate(selectedDate.plus({ year: 1 }));
    else setSelectedDate(selectedDate.minus({ year: 1 }));
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID" },
    {
      field: "paid",
      headerName: strings.oncall.paid,
      flex: 1,
      renderCell: (params) => (
        <Checkbox
          onChange={() => updatePaidStatus(selectedDate.year, params.row.week, params.value)}
          checked={params.value}
        />
      )
    },
    {
      field: "week",
      headerName: strings.timeExpressions.week,
      flex: 1,
      headerAlign: "center",
      align: "center"
    },
    {
      field: "person",
      headerName: strings.vacationRequest.person,
      flex: 1,
      headerAlign: "center",
      align: "center"
    }
  ];

  const rows = onCallData.map((item, idx) => {
    return { id: idx, paid: item.paid, week: item.week, person: item.person };
  });

  /**
   * Component render
   */
  return (
    <>
      <Box sx={{ display: "flex", my: "3%" }}>
        <Typography variant="h3" sx={{ flexGrow: 10, flexShrink: "1", flexBasis: "0%" }}>
          {strings.oncall.oncallShifts} {selectedDate.year}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Button
            onClick={() => incrementYear("-")}
            variant="outlined"
            disabled={selectedDate.year === 2020}
          >
            {strings.oncall.previousYear}
          </Button>
          <Button
            onClick={() => incrementYear("+")}
            variant="outlined"
            disabled={selectedDate.year === DateTime.now().year}
          >
            {strings.oncall.nextYear}
          </Button>
        </Box>
      </Box>
      <DataGrid
        sx={{ l: 10 }}
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        sortModel={[{ field: "week", sort: "desc" }]}
        hideFooter
        initialState={{
          columns: {
            columnVisibilityModel: {
              id: false
            }
          }
        }}
      />
    </>
  );
};

export default OnCallListView;
