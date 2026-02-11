import { Box, Tooltip, useTheme } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { usersAtom } from "src/atoms/user";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import LocalizationUtils from "src/utils/localization-utils";
import { formatDate } from "src/utils/time-utils";
import { getFullUserName } from "src/utils/user-name-utils";
import { getVacationRequestStatusColor } from "src/utils/vacation-status-utils";
import UnreviewedIndicator from "./pending-vacation-indicator";
import StatusToolTipContent from "./vacation-request-status-tooltip";

/**
 * Vacation requests table columns component
 */
const VacationRequestsTableColumns = (): GridColDef[] => {
  const users = useAtomValue(usersAtom) || [];
  const { adminMode } = useUserRole();
  const theme = useTheme();

  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: strings.vacationRequest.type,
      width: 150,
      editable: false
    },
    {
      field: "personFullName",
      headerName: strings.vacationRequest.person,
      width: 160,
      editable: false,
      renderCell: (params) => {
        const user = users.find((u) => u.id === params.row.userId);
        return getFullUserName(user);
      }
    },
    {
      field: "updatedAt",
      headerName: strings.vacationRequest.updatedAt,
      renderCell: (params) => formatDate(params.row?.updatedAt, true),
      width: 150,
      editable: false
    },
    {
      field: "startDate",
      headerName: strings.vacationRequest.startDate,
      renderCell: (params) => formatDate(params.row?.startDate),
      width: 100,
      editable: false
    },
    {
      field: "endDate",
      headerName: strings.vacationRequest.endDate,
      renderCell: (params) => formatDate(params.row?.endDate),
      width: 100,
      editable: false
    },
    {
      field: "days",
      headerName: strings.vacationRequest.days,
      width: 60,
      editable: false
    },
    {
      field: "message",
      headerName: strings.vacationRequest.message,
      width: 180,
      editable: false
    },
    {
      field: "status",
      headerName: strings.vacationRequest.status,
      width: 120,
      editable: false,
      renderCell: (params) => {
        if (!params.value) return "";
        const vacationRequest = params.row.vacationRequest;
        const statuses = vacationRequest?.status || [];
        const currentStatus = params.value;
        const isUnreviewed = statuses.length === 1 && currentStatus === "PENDING";

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {adminMode && isUnreviewed && <UnreviewedIndicator />}
            <Tooltip title={<StatusToolTipContent statuses={statuses} />} arrow placement="top">
              <Box
                sx={{
                  color: getVacationRequestStatusColor(currentStatus, theme),
                  fontWeight: 600,
                  cursor: "help"
                }}
              >
                {LocalizationUtils.getLocalizedVacationRequestStatus(currentStatus)}
              </Box>
            </Tooltip>
          </Box>
        );
      },
      cellClassName: (params) => {
        if (params.value === null) {
          return "";
        }
        return params.value;
      }
    }
  ];
  return columns;
};

export default VacationRequestsTableColumns;
