import { Box, Button, Checkbox, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { userProfileAtom } from "src/atoms/auth";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { formatUsername } from "src/utils/oncall-utils";
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
  const loggedInEmail = userProfile?.email;

  // Identify rows where row matches logged in user
  const isLoggedIn = (email: string) => {
    return loggedInEmail && email && loggedInEmail.toLowerCase() === email.toLowerCase();
  };

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
          onClick={(e) => e.stopPropagation()}
          onChange={async () => {
            if (isAccountant) {
              await updatePaidStatus(selectedDate.year, params.row.week, params.value);
            }
          }}
          checked={params.value}
          disabled={!isAccountant}
          sx={{
            "&.Mui-checked": { color: "rgba(123, 209, 92, 0.3)" }
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
            fontWeight: isLoggedIn(params.row.email) ? "bold" : "normal",
            border: isLoggedIn(params.row.email) ? "2px solid black" : "none",
            borderRadius: 2,
            px: 1
          }}
        >
          {formatUsername(params.value)}
        </Typography>
      )
    },
    {
      field: "email",
      headerName: strings.userTable.email,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: true,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: isLoggedIn(params.value) ? "bold" : "normal"
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
    person: item.username ? item.username : strings.oncall.noUsernameOnCall,
    email: item.email ? item.email : "-"
  }));

  const listViewTypographyStyles = {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    px: 3,
    py: 2,
    fontWeight: "bold",
    color: "black",
    display: "inline-block",
    textAlign: "center",
    pointerEvents: "none"
  };

  const listViewButtonStyles = {
    textTransform: "none",
    padding: 0,
    minWidth: "unset",
    borderRadius: 4,
    boxShadow: "0 0 0 2px black",
    lineHeight: 0,
    backgroundColor: "transparent",
    mx: 1.5,

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    transition: "box-shadow 0.2s ease",

    "&:hover": {
      boxShadow: "0 0 0 3px black",
      "& .MuiTypography-root": {
        backgroundColor: "#c7c7c7"
      }
    },

    "&.Mui-disabled": {
      boxShadow: "0 0 0 2px #9e9e9e",
      "& .MuiTypography-root": {
        backgroundColor: "#f0f0f0",
        color: "#9e9e9e"
      }
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 3 }}>
        {/* Title */}
        <Typography variant="h4" className="button-text" sx={listViewTypographyStyles}>
          {strings.oncall.oncallShifts} {selectedDate.year}
        </Typography>

        {/* Buttons */}
        <Box sx={{ display: "flex" }}>
          <Button
            onClick={() => setSelectedDate(selectedDate.minus({ year: 1 }))}
            disabled={selectedDate.year === 2020}
            sx={listViewButtonStyles}
          >
            <Typography variant="h4" sx={listViewTypographyStyles}>
              {strings.oncall.previousYear}
            </Typography>
          </Button>
          <Button
            onClick={() => setSelectedDate(selectedDate.plus({ year: 1 }))}
            disabled={selectedDate.year === DateTime.now().year}
            sx={listViewButtonStyles}
          >
            <Typography variant="h4" sx={listViewTypographyStyles}>
              {strings.oncall.nextYear}
            </Typography>
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
          sx={{
            marginBottom: "60px",
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#eeeeee"
            },
            "& .MuiDataGrid-cell": { fontSize: 16, color: "black" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#cfc7c7"
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold"
            },
            "& .default-row": {
              backgroundColor: "#f5f5f5"
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
