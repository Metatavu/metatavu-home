import { Box } from "@mui/material";
import type { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import { type Dispatch, type SetStateAction, useState } from "react";
import EditConfirmationDialog from "src/components/contexts/edit-confirmation-dialog";
import type { Tab } from "src/components/generics/tabBar";
import type { VacationRequest, VacationRequestStatuses } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import type { ToolbarFormModes, VacationsDataGridRow } from "src/types";
import type { FilterType } from "src/utils/vacation-filter-type";
import VacationRequestForm from "../vacation-request-form/vacation-request-form";
import DefaultToolbar from "./DefaultToolbar";

/**
 * Component properties
 */
interface Props {
  toggleIsUpcoming: () => void;
  handleDeleteRow: (id: GridRowId) => void;
  createVacationRequest: (VacationRequest: VacationRequest) => Promise<void>;
  updateVacationRequest: (
    VacationRequest: VacationRequest,
    vacationRequestId: string
  ) => Promise<void>;
  updateVacationRequestStatus: (
    vacationRequestStatus: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => Promise<void>;
  setFormOpen: (formOpen: boolean) => void;
  formOpen: boolean;
  selectedRowIds: GridRowSelectionModel;
  rows: VacationsDataGridRow[];
  setSelectedRowIds: (selectedRowIds: GridRowSelectionModel) => void;
  filter: FilterType[];
  setFilter: React.Dispatch<React.SetStateAction<FilterType[]>>;
  toolbarFormMode: ToolbarFormModes;
  setToolbarFormMode: Dispatch<SetStateAction<ToolbarFormModes>>;
  tabs: Tab[];
  currentTab: string;
  setCurrentTab: Dispatch<SetStateAction<string>>;
}

/**
 * Table toolbar component
 *
 * @param props component properties
 */
const EMPTY_SELECTION: GridRowSelectionModel = { type: "include", ids: new Set([]) };

const TableToolbar = ({
  toggleIsUpcoming,
  createVacationRequest,
  updateVacationRequest,
  updateVacationRequestStatus,
  handleDeleteRow,
  setFormOpen,
  formOpen,
  selectedRowIds,
  rows,
  setSelectedRowIds,
  filter,
  setFilter,
  toolbarFormMode,
  setToolbarFormMode,
  tabs,
  currentTab,
  setCurrentTab
}: Props) => {
  const [editConfirmationHandlerOpen, setEditConfirmationHandlerOpen] = useState(false);
  const [editVacationsData, setEditVacationsData] = useState<VacationRequest | null>(null);
  const { adminMode } = useUserRole();

  /**
   * Handler for saving updated vacation request data
   *
   * @param data vacation request data
   */
  const handleSaveClick = (data: VacationRequest) => {
    setEditVacationsData(data);
    setEditConfirmationHandlerOpen(true);
  };

  /**
   * Handler for confirming edit to vacation request
   */
  const handleEditConfirm = async () => {
    if (!editVacationsData?.id) return;

    await updateVacationRequest(editVacationsData, editVacationsData.id);
    setSelectedRowIds(EMPTY_SELECTION);
    setFormOpen(false);
  };

  const handleUpdateVacationRequestStatus = async (buttonType: VacationRequestStatuses) => {
    await updateVacationRequestStatus(buttonType, [...selectedRowIds.ids]);
    setFormOpen(false);
  };

  return (
    <Box>
      <EditConfirmationDialog
        open={editConfirmationHandlerOpen}
        setOpen={setEditConfirmationHandlerOpen}
        isAdmin={adminMode}
        onConfirm={handleEditConfirm}
        setFormOpen={setFormOpen}
      />
      <DefaultToolbar
        formOpen={formOpen}
        adminMode={adminMode}
        filter={filter}
        setFilter={setFilter}
        toggleIsUpcoming={toggleIsUpcoming}
        setFormOpen={setFormOpen}
        tabs={tabs}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setToolbarFormMode={setToolbarFormMode}
      />
      <VacationRequestForm
        formOpen={formOpen}
        setFormOpen={setFormOpen}
        updateVacationRequest={updateVacationRequest}
        createVacationRequest={createVacationRequest}
        selectedRowIds={selectedRowIds?.ids ? [...selectedRowIds.ids] : []}
        rows={rows}
        toolbarFormMode={toolbarFormMode}
        setToolbarFormMode={setToolbarFormMode}
        setSelectedRowIds={(ids: GridRowId[]) =>
          setSelectedRowIds({ type: "include", ids: new Set(ids) })
        }
        handleDeleteRow={handleDeleteRow}
        handleUpdateVacationRequestStatus={handleUpdateVacationRequestStatus}
        onSaveClick={handleSaveClick}
      />
    </Box>
  );
};

export default TableToolbar;
