import { DataGrid, type GridRowId, type GridRowSelectionModel } from "@mui/x-data-grid";
import { useMemo, useRef, useState } from "react";
import { Box, styled } from "@mui/material";
import TableToolbar from "./vacation-requests-table-toolbar/vacation-requests-table-toolbar";
import type { VacationsDataGridRow } from "src/types";
import SkeletonTableRows from "./skeleton-table-rows/skeleton-table-rows";
import { languageAtom } from "src/atoms/language";
import { useAtomValue } from "jotai";
import VacationRequestsTableColumns from "./vacation-requests-table-columns";
import strings from "src/localization/strings";
import { Inventory } from "@mui/icons-material";
import { displayedVacationRequestsAtom } from "src/atoms/vacation";
import { type VacationRequest, VacationRequestStatuses } from "src/generated/homeLambdasClient";
import {
  getTotalVacationRequestStatus,
  getVacationRequestStatusColor
} from "src/utils/vacation-status-utils";
import { DateTime } from "luxon";
import LocalizationUtils from "src/utils/localization-utils";
import { getVacationRequestPersonFullName } from "src/utils/vacation-request-utils";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";

/**
 * Component properties
 */
interface Props {
  isUpcoming: boolean;
  toggleIsUpcoming: () => void;
  deleteVacationRequests: (
    selectedRowIds: GridRowId[],
    rows: VacationsDataGridRow[]
  ) => Promise<void>;
  createVacationRequest: (vacationRequestData: VacationRequest) => Promise<void>;
  updateVacationRequest: (
    vacationRequestData: VacationRequest,
    vacationRequestId: string
  ) => Promise<void>;
  updateVacationRequestStatus: (
    updatedVacationRequestStatus: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => Promise<void>;
  loading: boolean;
}

/**
 * Vacation requests table component
 *
 * @param props component properties
 */
const VacationRequestsTable = ({
  isUpcoming,
  toggleIsUpcoming,
  deleteVacationRequests,
  createVacationRequest,
  updateVacationRequest,
  updateVacationRequestStatus,
  loading
}: Props) => {
  const vacationRequests = useAtomValue(displayedVacationRequestsAtom);
  const containerRef = useRef(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [rows, setRows] = useState<VacationsDataGridRow[]>([]);
  const language = useAtomValue(languageAtom);
  const columns = VacationRequestsTableColumns();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const dataGridHeight = 700;
  const dataGridRowHeight = 52;
  const dataGridColumnHeaderHeight = 56;

  /**
   * Create a single vacation request data grid row
   *
   * @param vacationRequest vacation request
   * @returns dataGridRow
   */
  const createDataGridRow = (vacationRequest: VacationRequest) => {
    const user = users.find((user) => user.id === vacationRequest.userId);
    const usersFullName = user
      ? `${user.firstName} ${user.lastName}`
      : strings.vacationRequest.noPersonFullName;

    const row: VacationsDataGridRow = {
      id: vacationRequest.id,
      type: LocalizationUtils.getLocalizedVacationRequestType(vacationRequest.type),
      personFullName: usersFullName,
      updatedAt: DateTime.fromJSDate(vacationRequest.updatedAt),
      startDate: DateTime.fromJSDate(vacationRequest.startDate),
      endDate: DateTime.fromJSDate(vacationRequest.endDate),
      days: vacationRequest.days,
      message: strings.vacationRequest.noMessage,
      status: VacationRequestStatuses.PENDING
    };
    return row;
  };

  /**
   * Create vacation requests data grid rows
   *
   * @param vacationRequests vacation requests
   */
  const createDataGridRows = (vacationRequests: VacationRequest[]) => {
    const rows: VacationsDataGridRow[] = [];
    if (vacationRequests.length) {
      vacationRequests.forEach((vacationRequest) => {
        const row = createDataGridRow(vacationRequest);
        row.status = vacationRequest.status?.length
          ? getTotalVacationRequestStatus(vacationRequest.status)
          : VacationRequestStatuses.PENDING;

        if (vacationRequest.message?.length) {
          row.message = vacationRequest.message;
        }

        if (vacationRequest.userId) {
          row.personFullName = getVacationRequestPersonFullName(
            vacationRequest,
            users,
            userProfile
          );
        }
        rows.push(row);
      });
    }
    return rows;
  };

  /**
   * Set selected data grid rows
   */
  useMemo(() => {
    setSelectedRowIds([]);
  }, [deleteVacationRequests]);

  /**
   * Set data grid rows
   */
  useMemo(() => {
    setRows(createDataGridRows(vacationRequests));
  }, [vacationRequests, formOpen, language]);

  /**
   * Styled grid overlay component
   */
  const StyledGridOverlay = styled("div")(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%"
  }));

  /**
   * Custom no rows overlay component
   */
  const CustomNoRowsOverlay = () => (
    <StyledGridOverlay>
      <Inventory />
      <Box sx={{ mt: 1 }}>{strings.dataGrid.noRows}</Box>
    </StyledGridOverlay>
  );

  /**
   * Custom skeleton table rows component
   */
  const CustomSkeletonTableRows = () => (
    <SkeletonTableRows
      dataGridHeight={dataGridHeight}
      dataGridRowHeight={dataGridRowHeight}
      dataGridColumnHeaderHeight={dataGridColumnHeaderHeight}
    />
  );

  return (
    <Box
      sx={{
        "& .APPROVED": {
          color: `${getVacationRequestStatusColor(VacationRequestStatuses.APPROVED)}`
        },
        "& .DECLINED": {
          color: `${getVacationRequestStatusColor(VacationRequestStatuses.DECLINED)}`
        },
        "& .PENDING": {
          color: `${getVacationRequestStatusColor(VacationRequestStatuses.PENDING)}`
        }
      }}
      ref={containerRef}
    >
      <TableToolbar
        isUpcoming={isUpcoming}
        toggleIsUpcoming={toggleIsUpcoming}
        deleteVacationRequests={deleteVacationRequests}
        createVacationRequest={createVacationRequest}
        updateVacationRequest={updateVacationRequest}
        updateVacationRequestStatus={updateVacationRequestStatus}
        setFormOpen={setFormOpen}
        formOpen={formOpen}
        selectedRowIds={selectedRowIds}
        rows={rows}
        setSelectedRowIds={setSelectedRowIds}
      />
      <DataGrid
        sx={{ height: dataGridHeight }}
        rowHeight={dataGridRowHeight}
        columnHeaderHeight={dataGridColumnHeaderHeight}
        autoPageSize
        onRowSelectionModelChange={(index: GridRowSelectionModel) => {
          setSelectedRowIds(index);
        }}
        rows={rows}
        loading={loading && !rows.length}
        slots={{
          loadingOverlay: CustomSkeletonTableRows,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        columns={columns}
        checkboxSelection
        rowSelectionModel={selectedRowIds}
        isRowSelectable={() => !formOpen}
        initialState={{
          sorting: {
            sortModel: [{ field: "updatedAt", sort: "asc" }]
          }
        }}
      />
    </Box>
  );
};

export default VacationRequestsTable;
