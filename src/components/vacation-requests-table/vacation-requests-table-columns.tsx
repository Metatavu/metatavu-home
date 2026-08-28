import { Box, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { usersAtom } from "src/atoms/user";
import type { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import LocalizationUtils from "src/utils/localization-utils";
import { formatDate } from "src/utils/time-utils";
import { getFullUserName } from "src/utils/user-name-utils";
import { PillBadge } from "../generics/badges";
import StatusToolTipContent from "./vacation-request-status-tooltip";

/**
 * Vacation requests table columns component
 */
const VacationRequestsTableColumns = (): GridColDef[] => {
  const users = useAtomValue(usersAtom) || [];
  const { adminMode } = useUserRole();

  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: strings.vacationRequest.type,
      flex: 1,
      width: 145,
      editable: false
    },
    ...(adminMode
      ? [
          {
            field: "personFullName",
            headerName: strings.vacationRequest.person,
            width: adminMode ? 140 : 0,
            editable: false,
            renderCell: (params: { row: { userId: string } }) => {
              const user = users.find((u) => u.id === params.row.userId);
              return getFullUserName(user);
            }
          }
        ]
      : []),
    {
      field: "updatedAt",
      headerName: strings.vacationRequest.updatedAt,
      renderCell: (params) => formatDate(params.row?.updatedAt, true),
      flex: 1,
      width: 175,
      editable: false
    },
    {
      field: "startDate",
      headerName: strings.vacationRequest.startDate,
      renderCell: (params) => formatDate(params.row?.startDate),
      flex: 1,
      width: 125,
      editable: false
    },
    {
      field: "endDate",
      headerName: strings.vacationRequest.endDate,
      renderCell: (params) => formatDate(params.row?.endDate),
      flex: 1,
      width: 125,
      editable: false
    },
    {
      field: "days",
      headerName: strings.vacationRequest.days,
      flex: 1,
      width: 110,
      editable: false
    },
    {
      field: "message",
      headerName: strings.vacationRequest.message,
      flex: 1,
      width: 170,
      editable: false
    },
    {
      field: "status",
      headerName: strings.vacationRequest.status,
      flex: 1,
      width: 150,
      align: "center",
      editable: false,
      renderCell: (params) => {
        if (!params.value) return "";
        const vacationRequest = params.row.vacationRequest;
        const statuses = vacationRequest?.status || [];
        const currentStatus: VacationRequestStatuses = params.value;

        return (
          <PillBadge status={currentStatus} variant="approvalBadge">
            <Tooltip title={<StatusToolTipContent statuses={statuses} />} arrow placement="top">
              <Box
                sx={{
                  fontWeight: 400,
                  fontSize: 14,
                  cursor: "help"
                }}
              >
                {LocalizationUtils.getLocalizedVacationRequestStatus(currentStatus)}
              </Box>
            </Tooltip>
          </PillBadge>
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
