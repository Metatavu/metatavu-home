import type { GridColDef } from "@mui/x-data-grid";
import strings from "src/localization/strings";
import LocalizationUtils from "src/utils/localization-utils";
import { formatDate } from "src/utils/time-utils";

/**
 * Vacation requests table columns component
 */
const VacationRequestsTableColumns = (): GridColDef[] => {
  /**
   * Define columns for data grid
   */
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
      editable: false
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
      renderCell: (params) => {
        if (!params.value) return "";
        return LocalizationUtils.getLocalizedVacationRequestStatus(params.value);
      },
      cellClassName: (params) => {
        if (params.value === null) {
          return "";
        }
        return params.value;
      },
      width: 120,
      editable: false
    }
  ];
  return columns;
};

export default VacationRequestsTableColumns;
