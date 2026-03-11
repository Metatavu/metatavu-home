import { Grid, styled } from "@mui/material";
import type { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import ToolbarDeleteButton from "./toolbar-delete-button";
import FormToggleButton from "./toolbar-form-toggle-button";
import ToolbarSubmitButton from "./toolbar-submit-button";
import UpdateStatusButton from "./toolbar-update-status-button";

const ToolbarGridItem = styled(Grid)({
  padding: "10px"
});

const ToolbarGridContainer = styled(Grid)({
  alignContent: "space-around",
  alignItems: "center"
});

interface SelectionToolbarProps {
  selectedIdsSize: number;
  gridItemSize: number;
  adminMode: boolean;
  isDraftSelected: boolean;
  firstId: GridRowId | undefined;
  selectedRowIds: GridRowSelectionModel;
  setConfirmationHandlerOpen: (open: boolean) => void;
  handleEditButtonClick: () => void;
  handleSubmitForApproval: (id: string) => void;
  updateVacationRequestStatus: (status: VacationRequestStatuses, ids: GridRowId[]) => Promise<void>;
}

/**
 * Toolbar shown when one or more rows are selected
 *
 * @param props component properties
 */
const SelectionToolbar = ({
  selectedIdsSize,
  gridItemSize,
  adminMode,
  isDraftSelected,
  firstId,
  selectedRowIds,
  setConfirmationHandlerOpen,
  handleEditButtonClick,
  handleSubmitForApproval,
  updateVacationRequestStatus
}: SelectionToolbarProps) => (
  <ToolbarGridContainer container spacing={0}>
    <ToolbarGridItem size={{ sm: gridItemSize, xs: 4 }}>
      <ToolbarDeleteButton setConfirmationHandlerOpen={setConfirmationHandlerOpen} />
    </ToolbarGridItem>
    {selectedIdsSize === 1 && (
      <>
        <ToolbarGridItem size={{ sm: adminMode ? 3 : 4 }}>
          <FormToggleButton
            title={"Edit"}
            ButtonIcon={undefined}
            value={false}
            setValue={handleEditButtonClick}
            disabled={false}
          />
        </ToolbarGridItem>
        {isDraftSelected && !adminMode && (
          <ToolbarGridItem size={{ xs: 4 }}>
            <ToolbarSubmitButton onClick={() => handleSubmitForApproval(firstId as string)} />
          </ToolbarGridItem>
        )}
      </>
    )}
    {adminMode && (
      <>
        <ToolbarGridItem size={{ sm: 3, xs: 6 }}>
          <UpdateStatusButton
            updateVacationRequestStatus={updateVacationRequestStatus}
            buttonType={VacationRequestStatuses.APPROVED}
            selectedRowIds={selectedRowIds?.ids ? [...selectedRowIds.ids] : []}
          />
        </ToolbarGridItem>
        <ToolbarGridItem size={{ sm: 3, xs: 6 }}>
          <UpdateStatusButton
            updateVacationRequestStatus={updateVacationRequestStatus}
            buttonType={VacationRequestStatuses.DECLINED}
            selectedRowIds={selectedRowIds?.ids ? [...selectedRowIds.ids] : []}
          />
        </ToolbarGridItem>
      </>
    )}
  </ToolbarGridContainer>
);

export default SelectionToolbar;
