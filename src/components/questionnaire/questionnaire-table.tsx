import {
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import { useState, useEffect } from "react";
import type { Questionnaire } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import UserRoleUtils from "src/utils/user-role-utils";
import { DataGrid, type GridRowParams, type GridRenderCellParams } from "@mui/x-data-grid";
import { useLambdasApi } from "src/hooks/use-api";
import { useAtomValue, useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";
import { QuestionnairePreviewMode } from "src/types/index";
import { useNavigate } from "react-router";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import type { User } from "src/generated/homeLambdasClient";

/**
 * Questionnaire Table Component
 *
 * @returns Questionnaires from DynamoDB rendered in a x-data-grid table
 */
const QuestionnaireTable = () => {
  const adminMode = UserRoleUtils.adminMode();
  const navigate = useNavigate();
  const [_, setMode] = useState<QuestionnairePreviewMode>();
  const { questionnairesApi } = useLambdasApi();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string | null>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const setError = useSetAtom(errorAtom);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  

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
    setSelectedQuestionnaire(null);
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
   * Function to handle select Questionnaire from x-data-grid as a row
   *
   * @param params
   */
  const handleRowClick = (params: GridRowParams) => {
    setSelectedQuestionnaire(params.row as Questionnaire);
    setMode(QuestionnairePreviewMode.FILL);
    navigate(`/questionnaire/${params.row.id}`);
  };

  /**
   * Function to handle open editor for Questionnaire
   *
   * @param questionnaire - Questionnaire to edit
   */
  const handleEditClick = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setMode(QuestionnairePreviewMode.EDIT);
    navigate(`${questionnaire.id}/edit`);
  };

  /**
   * Function to render the status cell to check if LoggerInUser has passed the questionnaire
   *
   * @param params
   */
  const renderStatusCell = (params: GridRenderCellParams) => {
    const userHasPassed = params.row.passedUsers?.includes(loggedInUser?.id);

    return userHasPassed ? (
      <CheckCircleIcon sx={{ color: "green" }} />
    ) : (
      <PendingIcon sx={{ color: "gray" }} />
    );
  };

  /**
   * Function to render the confirm delete dialog
   */
  const renderConfirmDeleteDialog = () => (
    <Dialog open={dialogOpen} onClose={handleCloseDialog}>
      <DialogTitle>
        {strings.formatString(strings.questionnaireTable.confirmDeleteTitle, deleteTitle ?? "")}
      </DialogTitle>
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
              <Button
                name="edit"
                variant="outlined"
                color="success"
                onClick={() => handleEditClick(params.row as Questionnaire)}
                sx={{ mr: 1 }}
              >
                <EditIcon sx={{ color: "success.main", mr: 1 }} />
                {strings.questionnaireTable.edit}
              </Button>
              <Button
                name="delete"
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
          renderCell: renderStatusCell
        }
  ];

  return (
    <>
      <Paper style={{ minHeight: 500, maxHeight: "auto", width: "100%", overflow: "auto" }}>
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
        <Typography sx={{ margin: 2 }} variant="h4" justifyContent={"center"}>
          {selectedQuestionnaire
            ? selectedQuestionnaire.title
            : strings.questionnaireScreen.currentQuestionnaires}
        </Typography>
        <DataGrid
          sx={{ margin: 0 }}
          rows={questionnaires}
          columns={columns}
          pagination
          getRowId={(row) => row.id || ""}
          disableRowSelectionOnClick
          onRowClick={adminMode ? undefined : handleRowClick}
        />
      </Paper>
      {renderConfirmDeleteDialog()}
    </>
  );
};

export default QuestionnaireTable;
