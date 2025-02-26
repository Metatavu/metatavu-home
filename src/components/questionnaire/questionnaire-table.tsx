import {
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Chip,
  Box,
  TextField,
  InputAdornment,
  IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import LabelIcon from "@mui/icons-material/Label";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useState, useEffect, useRef } from "react";
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

// Define an interface that extends Questionnaire to ensure tags property
interface EnhancedQuestionnaire extends Questionnaire {
  tags?: string[];
}

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
  const [questionnaires, setQuestionnaires] = useState<EnhancedQuestionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<EnhancedQuestionnaire[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string | null>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<EnhancedQuestionnaire | null>(null);
  const setError = useSetAtom(errorAtom);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const dataGridRef = useRef(null);
  

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      setLoading(true);
      try {
        const response = await questionnairesApi.listQuestionnaires();
        
        // Process the response to ensure each questionnaire has a tags property
        const processedQuestionnaires = response.map(q => ({
          ...q,
          tags: q.tags || [] // Ensure tags property exists
        }));
        
        console.log("Processed questionnaires:", processedQuestionnaires);
        setQuestionnaires(processedQuestionnaires);
        setFilteredQuestionnaires(processedQuestionnaires);
      } catch (error) {
        setError(`${strings.error.questionnaireLoadFailed}, ${error}`);
      }
      setLoading(false);
    };
    fetchQuestionnaires();
  }, []);

  /**
   * Debug function to identify issues with tags
   */
  useEffect(() => {
    if (questionnaires.length > 0) {
      console.log("Questionnaires after processing:", questionnaires);
      const anyHasTags = questionnaires.some(q => Array.isArray(q.tags) && q.tags.length > 0);
      console.log("Any questionnaire has tags?", anyHasTags);
      
      if (questionnaires.length > 0) {
        console.log("First questionnaire:", questionnaires[0]);
        console.log("First questionnaire tags:", questionnaires[0].tags);
      }
    }
  }, [questionnaires]);

  /**
   * Function to filter questionnaires based on search term
   * Filters by title and tags
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search is empty, show all questionnaires
      setFilteredQuestionnaires(questionnaires);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    
    const filtered = questionnaires.filter((questionnaire) => {
      // Check if title matches search term
      const titleMatch = questionnaire.title?.toLowerCase().includes(lowerCaseSearchTerm);
      
      // Check if any tag matches search term
      const tagMatch = questionnaire.tags?.some(tag => 
        tag.toLowerCase().includes(lowerCaseSearchTerm)
      );
      
      // Return true if either title or tags match
      return titleMatch || tagMatch;
    });
    
    setFilteredQuestionnaires(filtered);
  }, [searchTerm, questionnaires]);

  /**
   * Handle search input change
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  /**
   * Clear search input
   */
  const handleClearSearch = () => {
    setSearchTerm("");
  };

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
      setQuestionnaires((prevQuestionnaires) =>
        prevQuestionnaires.filter((questionnaire) => questionnaire.id !== deleteId)
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
    setSelectedQuestionnaire(params.row as EnhancedQuestionnaire);
    setMode(QuestionnairePreviewMode.FILL);
    navigate(`/questionnaire/${params.row.id}`);
  };

  /**
   * Function to handle open editor for Questionnaire
   *
   * @param questionnaire - Questionnaire to edit
   */
  const handleEditClick = (questionnaire: EnhancedQuestionnaire) => {
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
   * Function to render the tags cell
   * 
   * @param params
   */
  const renderTagsCell = (params: GridRenderCellParams) => {
    // Extra safe handling of tags property
    const tags = Array.isArray(params.row.tags) ? params.row.tags : [];
    
    console.log(`Rendering tags for row ${params.row.id}:`, tags);
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {tags.length > 0 ? (
          tags.map((tag: string, index: number) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              icon={<LabelIcon />}
              variant="outlined"
              sx={{ margin: '2px' }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                setSearchTerm(tag); // Set search to this tag
              }}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            {'No tags'}
          </Typography>
        )}
      </Box>
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

  // Use string literal for the tags header name since it's not in our localization file
  const columns = [
    { field: "title", headerName: `${strings.questionnaireTable.title}`, flex: 3 },
    { field: "description", headerName: `${strings.questionnaireTable.description}`, flex: 5 },
    { 
      field: "tags", 
      headerName: "Tags", // Fixed: Using string literal instead of missing localized string
      flex: 3,
      renderCell: renderTagsCell 
    },
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
                onClick={() => handleEditClick(params.row as EnhancedQuestionnaire)}
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

  // Added direct DOM checking code to debug if the tags column is actually being rendered
  useEffect(() => {
    setTimeout(() => {
      // Check the DOM after the component has rendered
      const headers = document.querySelectorAll('[role="columnheader"]');
      console.log("DataGrid headers found:", headers.length);
      headers.forEach((header, index) => {
        console.log(`Header ${index} text:`, header.textContent);
      });

      // Check if any cells with tags are being rendered
      const cells = document.querySelectorAll('[role="cell"]');
      console.log("DataGrid cells found:", cells.length);
    }, 1000); // Give the DataGrid time to render
  }, [filteredQuestionnaires]);

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
        
        {/* Search Bar */}
        <Box sx={{ px: 2, pb: 2 }}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by title or tags..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <DataGrid
          ref={dataGridRef}
          sx={{ margin: 0 }}
          rows={filteredQuestionnaires}
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