import { Box, Button, Checkbox, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { userProfileAtom } from "src/atoms/auth";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { onCallAtom } from "../../atoms/oncall";

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
 *
 * @param props component properties
 */
const OnCallListView = ({ selectedDate, setSelectedDate, updatePaidStatus }: Props) => {
  const onCallData = useAtomValue(onCallAtom);
  const { isAccountant } = useUserRole();
  const userProfile = useAtomValue(userProfileAtom);

  // Identify the current on-call person for the current week
  const currentWeekUsername = onCallData.find((item) => {
    const now = DateTime.now();
    return item.week === now.weekNumber && item.year === now.year;
  })?.username;

  const columns: GridColDef[] = [
    {
      field: "paid",
      headerName: strings.oncall.paid,
      headerAlign: "center",
      align: "center",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Checkbox
          onChange={async () => {
            if (isAccountant) {
              await updatePaidStatus(selectedDate.year, params.row.week, params.value);
            }
          }}
          checked={params.value}
          disabled={!isAccountant}
          sx={{
            color: params.value ? "#7bd15c" : "#f44336",
            "&.Mui-checked": { color: "#7bd15c" }
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
      sortable: true,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight:
              params.value === currentWeekUsername || userProfile?.username === params.value
                ? "bold"
                : "normal"
          }}
        >
          {params.value}
        </Typography>
      )
    }
  ];

  const rows = onCallData.map((item, idx) => ({
    id: idx,
    paid: item.paid,
    week: item.week,
    person: item.username ? item.username : strings.oncall.noUsernameOnCall
  }));

  return (
    <>
      <Box sx={{ display: "flex", my: "3%" }}>
        <Typography variant="h3" sx={{ flexGrow: 10 }}>
          {strings.oncall.oncallShifts} {selectedDate.year}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Button
            onClick={() => setSelectedDate(selectedDate.minus({ year: 1 }))}
            variant="outlined"
            disabled={selectedDate.year === 2020}
          >
            {strings.oncall.previousYear}
          </Button>
          <Button
            onClick={() => setSelectedDate(selectedDate.plus({ year: 1 }))}
            variant="outlined"
            disabled={selectedDate.year === DateTime.now().year}
          >
            {strings.oncall.nextYear}
          </Button>
        </Box>
      </Box>

      {rows.length === 0 ? (
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            py: 6,
            fontSize: 24,
            fontWeight: "bold",
            color: "#bdbdbd",
            border: "1px solid #eee",
            borderRadius: 4,
            background: "#fafafa",
            mt: 2
          }}
        >
          No Data for this year
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          hideFooter
          getRowClassName={(params) =>
            params.row.person === currentWeekUsername ? "current-oncall-row" : "default-row"
          }
          sx={{
            marginBottom: "60px",
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#eeeeee"
            },
            "& .MuiDataGrid-cell": { fontSize: 16, color: "black" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#cfc7c7ff"
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold"
            },
            "& .default-row": {
              backgroundColor: "#f5f5f5" // all rows grey
            },
            "& .current-oncall-row": {
              backgroundColor: "#f5f5f5",
              boxShadow: "inset 0 0 0 4px rgba(123, 209, 92, 0.3)",
              fontWeight: "bold"
            }
          }}
          initialState={{
            sorting: { sortModel: [{ field: "week", sort: "asc" }] }
          }}
        />
      )}
    </>
  );
};

export default OnCallListView;
