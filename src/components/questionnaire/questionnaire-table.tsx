import {
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useState, useEffect } from "react";
import type { Questionnaire } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import UserRoleUtils from "src/utils/user-role-utils";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { useLambdasApi } from "src/hooks/use-api";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";

/**
 * Questionnaire Table Component
 *
 * @returns Questionnaires from DynamoDB rendered in a x-data-grid table
 */
const QuestionnaireTable = () => {
  const adminMode = UserRoleUtils.adminMode();
  const { questionnairesApi } = useLambdasApi();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string | null>(null);
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      setLoading(true);
      try {
        const questionnaires = await questionnairesApi.listQuestionnaires();
        setQuestionnaires(questionnaires);
      } catch (error) {
        setError(`${strings.error.questionnaireLoadFailed}, ${error}`);
      }
      setLoading(false);
    };
    fetchQuestionnaires();
  }, []);

  /**
   * Function to open the dialog for deleting the questionnaire
   *
   * @param id - Questionnaire ID
   * @param title - Questionnaire Title
   */
  const handleOpenDialog = (id: string, title: string) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setDialogOpen(true);
  };

  /**
   * Function to close the dialog for deleting the questionnaire
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDeleteId(null);
    setDeleteTitle(null);
  };

  /**
   * Function to delete the questionnaire
   */
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await questionnairesApi.deleteQuestionnaires({ id: deleteId });
      setQuestionnaires((prevQuestionnaires: Questionnaire[]) =>
        prevQuestionnaires.filter((questionnaire: Questionnaire) => questionnaire.id !== deleteId)
      );
      handleCloseDialog();
    } catch (error) {
      setError(`${strings.error.questionnaireDeleteFailed}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Function to render the confirm delete dialog
   */
  const renderConfirmDeleteDialog = () => (
    <Dialog open={dialogOpen} onClose={handleCloseDialog}>
      <DialogTitle>{strings.formatString(strings.questionnaireTable.confirmDeleteTitle, deleteTitle ?? "")}</DialogTitle>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          {strings.questionnaireTable.cancel}
        </Button>
        <Button onClick={handleConfirmDelete} color="secondary" variant="contained">
          {strings.questionnaireTable.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const columns = [
    { field: "title", headerName: `${strings.questionnaireTable.title}`, flex: 3 },
    { field: "description", headerName: `${strings.questionnaireTable.description}`, flex: 5 },
    adminMode
      ? {
          field: "actions",
          headerName: `${strings.questionnaireTable.actions}`,
          flex: 2.5,
          renderCell: (params: GridRenderCellParams) => (
            <>
              <Button variant="outlined" color="success" sx={{ mr: 1 }} disabled>
                <EditIcon sx={{ color: "success.main", mr: 1 }} />
                {strings.questionnaireTable.edit}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleOpenDialog(params.row.id, params.row.title)}
              >
                <DeleteForeverIcon sx={{ color: "red", mr: 1 }} />
                {strings.questionnaireTable.delete}
              </Button>
            </>
          )
        }
      : {
          field: "status",
          headerName: `${strings.questionnaireTable.status}`,
          flex: 1,
          TODO: "Here we should render the status of the questionnaire: Users should be able to see if they have completed the questionnaire or not. Admin should be able to see the status of each questionnaire, including the number of employees who have already passed the current questionnaire."
        }
  ];

  return (
    <>
      <Paper style={{ height: 500, width: "100%" }}>
        {loading && (
          <CircularProgress
            size={50}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          />
        )}
        <DataGrid
          rows={questionnaires}
          columns={columns}
          pagination
          getRowId={(row) => row.id || ""}
          disableRowSelectionOnClick
        />
      </Paper>
      {renderConfirmDeleteDialog()}
    </>
  );
};

export default QuestionnaireTable;
