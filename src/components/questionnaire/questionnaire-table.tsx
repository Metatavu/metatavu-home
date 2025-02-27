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
  IconButton,
  Popover
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
  
  // State for tag popover
  const [tagPopoverAnchor, setTagPopoverAnchor] = useState<HTMLElement | null>(null);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  
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
        
        setQuestionnaires(processedQuestionnaires);
        setFilteredQuestionnaires(processedQuestionnaires);
      } catch (error) {
        setError(`${strings.error.questionnaireLoadFailed}, ${error}`);
      }
      setLoading(false);
    };
    fetchQuestionnaires();
  }, []);

  //Search Functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredQuestionnaires(questionnaires);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    
    const filtered = questionnaires.filter((questionnaire) => {
      const titleMatch = questionnaire.title?.toLowerCase().includes(lowerCaseSearchTerm);
      const tagMatch = questionnaire.tags?.some(tag => 
        tag.toLowerCase().includes(lowerCaseSearchTerm)
      );
      return titleMatch || tagMatch;
    });
    
    setFilteredQuestionnaires(filtered);
  }, [searchTerm, questionnaires]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Tag popover handlers
  const handleTagMoreClick = (event: React.MouseEvent<HTMLElement>, tags: string[]) => {
    event.stopPropagation(); // Prevent row click
    setTagPopoverAnchor(event.currentTarget);
    setCurrentTags(tags);
  };

  const handleCloseTagPopover = () => {
    setTagPopoverAnchor(null);
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    handleCloseTagPopover();
  };

  const handleOpenDialog = (id: string, title: string) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDeleteId(null);
    setDeleteTitle(null);
    setSelectedQuestionnaire(null);
  };

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

  const handleRowClick = (params: GridRowParams) => {
    setSelectedQuestionnaire(params.row as EnhancedQuestionnaire);
    setMode(QuestionnairePreviewMode.FILL);
    navigate(`/questionnaire/${params.row.id}`);
  };

  const handleEditClick = (questionnaire: EnhancedQuestionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setMode(QuestionnairePreviewMode.EDIT);
    navigate(`${questionnaire.id}/edit`);
  };

  const renderStatusCell = (params: GridRenderCellParams) => {
    const userHasPassed = params.row.passedUsers?.includes(loggedInUser?.id);
    return userHasPassed ? (
      <CheckCircleIcon sx={{ color: "green" }} />
    ) : (
      <PendingIcon sx={{ color: "gray" }} />
    );
  };

  /**
   * Function to render the tags cell with improved styling and overflow handling
   */
  const renderTagsCell = (params: GridRenderCellParams) => {
    // Extra safe handling of tags property
    const tags = Array.isArray(params.row.tags) ? params.row.tags : [];
    
    // Determine if we should show all tags or use "+X more" pattern
    const MAX_VISIBLE_TAGS = 1;
    const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
    const hiddenTagsCount = Math.max(0, tags.length - MAX_VISIBLE_TAGS);
    
    // Create a tooltip text with all tags when there are hidden tags
    const allTagsTooltip = tags.join(', ');
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'nowrap',
          gap: 0.5,
          overflow: 'hidden',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
        title={allTagsTooltip}
      >
        {tags.length > 0 ? (
          <>
            {visibleTags.map((tag: string, index: number) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                icon={<LabelIcon />}
                variant="outlined"
                sx={{ 
                  margin: '1px',
                  maxWidth: '120px',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click
                  setSearchTerm(tag);  // Set search to this tag
                }}
              />
            ))}
            
            {/* Show "+X more" chip if there are hidden tags */}
            {hiddenTagsCount > 0 && (
              <Chip
                size="small"
                label={`+${hiddenTagsCount} more`}
                sx={{ 
                  flexShrink:0,
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.12)' 
                  }
                }}
                onClick={(e) => handleTagMoreClick(e, tags)}
              />
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {'No tags'}
          </Typography>
        )}
      </Box>
    );
  };

  // Column configuration with improved tags column
  const columns = [
    { field: "title", headerName: `${strings.questionnaireTable.title}`, flex: 3 },
    { field: "description", headerName: `${strings.questionnaireTable.description}`, flex: 5 },
    { 
      field: "tags", 
      headerName: "Tags",
      flex: 3,
      minWidth: 180,
      renderCell: renderTagsCell,
      sortable: false,
      filterable: true,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LabelIcon sx={{ mr: 0.5, fontSize: '1.25rem' }} />
          <Typography variant="subtitle2">Tags</Typography>
        </Box>
      )
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

  // Inline Tag Popover rendering - no need for separate component
  const renderTagPopover = () => (
    <Popover
      open={Boolean(tagPopoverAnchor)}
      anchorEl={tagPopoverAnchor}
      onClose={handleCloseTagPopover}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: { maxWidth: '400px', p: 2 }
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        All Tags ({currentTags.length})
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {currentTags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            icon={<LabelIcon />}
            variant="outlined"
            onClick={() => handleTagClick(tag)}
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)'
              }
            }}
          />
        ))}
      </Box>
    </Popover>
  );

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
          sx={{ 
            margin: 0,
            '& .MuiDataGrid-cell': {
              padding: '8px', // Add some padding to cells
            },
            '& .MuiDataGrid-columnHeader': {
              padding: '0 8px', // Add some padding to headers
            }
          }}
          rows={filteredQuestionnaires}
          columns={columns}
          pagination
          getRowId={(row) => row.id || ""}
          disableRowSelectionOnClick
          onRowClick={adminMode ? undefined : handleRowClick}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }
            },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>
      
      {/* Render the tag popover inline */}
      {renderTagPopover()}
      
      {renderConfirmDeleteDialog()}
    </>
  );
};

export default QuestionnaireTable;