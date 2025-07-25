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
    {
      field: "paid",
      headerName: strings.oncall.paid,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Checkbox
          onChange={async () => {
            await updatePaidStatus(selectedDate.year, params.row.week, params.value);
          }}
          checked={params.value}
          sx={{
            color: params.value ? "#7bd15c" : "#f44336",
            "&.Mui-checked": {
              color: "#7bd15c"
            }
          }}
        />
      )
    },
    {
      field: "week",
      headerName: strings.timeExpressions.week,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: true
    },
    {
      field: "person",
      headerName: strings.vacationRequest.person,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: true
    }
  ];

  const rows = onCallData.map((item, idx) => ({
    id: idx,
    paid: item.paid,
    week: item.week,
    person: item.username
  }));

  /**
   * Component render
   */
  return (
    <>
      <Box sx={{ display: "flex", my: "3%" }}>
        <Typography variant="h3" sx={{ flexGrow: 10 }}>
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
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        hideFooter
        getRowClassName={(params) =>
          params.row.paid ? "paid-row" : "unpaid-row"
        }
        sx={{
          marginBottom: "60px",
          "& .paid-row": {
            backgroundColor: "#eafbe5"
          },
          "& .unpaid-row": {
            backgroundColor: "#ffeaea"
          },
          "& .MuiDataGrid-cell": {
            fontSize: 16
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            fontWeight: "bold"
          }
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: "week", sort: "asc" }]
          }
        }}
      />
    </>
  );
};

export default OnCallListView;
