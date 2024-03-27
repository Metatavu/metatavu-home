import { Add, Cancel, Edit } from "@mui/icons-material";
import { Box, Collapse, Grid, Typography, styled } from "@mui/material";
import { useEffect, useState } from "react";
import ToolbarForm from "./toolbar-form/toolbar-form";
import { GridRowId } from "@mui/x-data-grid";
import { VacationsDataGridRow, ToolbarFormModes, VacationData } from "../../../types";
import ToolbarDeleteButton from "./toolbar-delete-button";
import FormToggleButton from "./toolbar-form-toggle-button";
import ConfirmationHandler from "../../contexts/confirmation-handler";
import strings from "../../../localization/strings";
import { getToolbarTitle } from "../../../utils/toolbar-utils";
import { useAtomValue } from "jotai";
import { languageAtom } from "../../../atoms/language";
import { useLocation } from "react-router-dom";
import { VacationRequestStatuses } from "../../../generated/client";
import UpdateStatusButton from "./toolbar-update-status-button";
import UserRoleUtils from "../../../utils/user-role-utils";

/**
 * Component properties
 */
interface Props {
  deleteVacationRequests: (
    selectedRowIds: GridRowId[],
    rows: VacationsDataGridRow[]
  ) => Promise<void>;
  createVacationRequest: (vacationData: VacationData) => Promise<void>;
  updateVacationRequest: (vacationData: VacationData, vacationRequestId: string) => Promise<void>;
  setFormOpen: (formOpen: boolean) => void;
  formOpen: boolean;
  selectedRowIds: GridRowId[];
  rows: VacationsDataGridRow[];
  setSelectedRowIds: (selectedRowIds: GridRowId[]) => void;
  updateVacationRequestStatuses: (
    newStatus: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => Promise<void>;
}

/**
 * Table toolbar component
 *
 * @param props component properties
 */
const TableToolbar = ({
  deleteVacationRequests,
  createVacationRequest,
  updateVacationRequest,
  setFormOpen,
  formOpen,
  selectedRowIds,
  rows,
  setSelectedRowIds,
  updateVacationRequestStatuses
}: Props) => {
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [toolbarFormMode, setToolbarFormMode] = useState<ToolbarFormModes>(ToolbarFormModes.NONE);
  const [confirmationHandlerOpen, setConfirmationHandlerOpen] = useState(false);
  const [title, setTitle] = useState(strings.tableToolbar.myRequests);
  const language = useAtomValue(languageAtom);
  const adminMode = UserRoleUtils.adminMode();
  const { pathname } = useLocation();
  const disableEditButton = rows.find((request: VacationsDataGridRow) => request.id === selectedRowIds[0])?.status !== VacationRequestStatuses.PENDING;

  useEffect(() => {
    setTitle(getToolbarTitle(toolbarFormMode));
    if (adminMode && toolbarFormMode === ToolbarFormModes.NONE) {
      setTitle(strings.tableToolbar.manageRequests);
    }
  }, [toolbarFormMode, language, pathname]);

  useEffect(() => {
    toggleToolbarOpenOnSelectedRowIds(selectedRowIds);
  }, [selectedRowIds]);

  /**
   * Toggle toolbar open on selected row ids
   *
   * @param selectedRowIds selected row ids
   */
  const toggleToolbarOpenOnSelectedRowIds = (selectedRowIds: GridRowId[]) => {
    if (selectedRowIds) {
      setToolbarOpen(true);
    } else {
      setToolbarOpen(false);
    }
  };

  /**
   * Delete vacation requests and statuses
   */
  const deleteVacationsData = async () => {
    await deleteVacationRequests(selectedRowIds, rows);
  };

  /**
   * Toolbar grid item component
   */
  const ToolbarGridItem = styled(Grid)({
    padding: "10px"
  });

  /**
   * Toolbar grid container component
   */
  const ToolbarGridContainer = styled(Grid)({
    alignContent: "space-around",
    alignItems: "center"
  });

  return (
    <Box>
      <ConfirmationHandler
        open={confirmationHandlerOpen}
        setOpen={setConfirmationHandlerOpen}
        deleteVacationsData={deleteVacationsData}
      />
      {toolbarOpen && !formOpen && selectedRowIds?.length ? (
        <ToolbarGridContainer container>
          <ToolbarGridItem
            item
            sm={selectedRowIds?.length === 1 ? (adminMode ? 3 : 6) : adminMode ? 6 : 12}
            xs={6}
          >
            <ToolbarDeleteButton setConfirmationHandlerOpen={setConfirmationHandlerOpen} />
          </ToolbarGridItem>
          {selectedRowIds?.length === 1  &&          
            <ToolbarGridItem item sm={adminMode ? 3 : 6} xs={6}>
              <FormToggleButton
                title={strings.tableToolbar.edit}
                ButtonIcon={Edit}
                value={formOpen}
                setValue={setFormOpen}
                disabled={disableEditButton}
              />
            </ToolbarGridItem>
          }
          {adminMode && (
            <>
              <ToolbarGridItem item sm={3} xs={6}>
                <UpdateStatusButton
                  buttonType={VacationRequestStatuses.APPROVED}
                  updateVacationRequestStatuses={updateVacationRequestStatuses}
                  selectedRowIds={selectedRowIds}
                />
              </ToolbarGridItem>
              <ToolbarGridItem item sm={3} xs={6}>
                <UpdateStatusButton
                  buttonType={VacationRequestStatuses.DECLINED}
                  updateVacationRequestStatuses={updateVacationRequestStatuses}
                  selectedRowIds={selectedRowIds}
                />
              </ToolbarGridItem>
            </>
          )}
        </ToolbarGridContainer>
      ) : (
        <ToolbarGridContainer container>
          <ToolbarGridItem item xs={6}>
            <Typography variant="h6">{title}</Typography>
          </ToolbarGridItem>
          <ToolbarGridItem item xs={6}>
            {formOpen ? (
              <FormToggleButton
                title={strings.tableToolbar.cancel}
                ButtonIcon={Cancel}
                value={formOpen}
                setValue={setFormOpen}
                buttonVariant="outlined"
              />
            ) : (
              !adminMode && (
                <FormToggleButton
                  value={formOpen}
                  setValue={setFormOpen}
                  title={strings.tableToolbar.create}
                  ButtonIcon={Add}
                />
              )
            )}
          </ToolbarGridItem>
        </ToolbarGridContainer>
      )}
      <Collapse in={formOpen}>
        <ToolbarForm
          formOpen={formOpen}
          setFormOpen={setFormOpen}
          createVacationRequest={createVacationRequest}
          updateVacationRequest={updateVacationRequest}
          selectedRowIds={selectedRowIds}
          rows={rows}
          toolbarFormMode={toolbarFormMode}
          setToolbarFormMode={setToolbarFormMode}
          setSelectedRowIds={setSelectedRowIds}
        />
      </Collapse>
    </Box>
  );
};

export default TableToolbar;
