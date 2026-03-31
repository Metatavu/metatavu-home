import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import LabelIcon from "@mui/icons-material/Label";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Popover,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { DataGrid, type GridRenderCellParams, type GridRowParams } from "@mui/x-data-grid";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { questionnaireTagsAtom } from "src/atoms/questionnaire";
import { usersAtom } from "src/atoms/user";
import type { Questionnaire, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { DeleteItemType, QuestionnairePreviewMode } from "src/types/index";
import DeleteConfirmationDialog from "../contexts/delete-confirmation-dialog";

/**
 * Questionnaire Table Component
 *
 * @returns Questionnaires from DynamoDB rendered in a x-data-grid table
 */
const QuestionnaireTable = () => {
  const { adminMode } = useUserRole();
  const navigate = useNavigate();
  const [_, setMode] = useState<QuestionnairePreviewMode>();
  const { questionnairesApi } = useLambdasApi();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<Questionnaire[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [tagPopoverAnchor, setTagPopoverAnchor] = useState<HTMLElement | null>(null);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const setError = useSetAtom(errorAtom);
  const setQuestionnaireTagsAtom = useSetAtom(questionnaireTagsAtom);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const dataGridRef = useRef(null);
  const [deleteTitle, setDeleteTitle] = useState<string | undefined>(undefined);
  const theme = useTheme();

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      setLoading(true);
      try {
        const response = await questionnairesApi.listQuestionnaires();
        const processedQuestionnaires = response.map((question) => ({
          ...question,
          tags: question.tags || []
        }));

        setQuestionnaires(processedQuestionnaires);
        setFilteredQuestionnaires(processedQuestionnaires);
        const allTags = processedQuestionnaires.flatMap((q) => q.tags || []);
        const uniqueTags = [...new Set<string>(allTags)];
        setQuestionnaireTagsAtom(uniqueTags);
      } catch (error) {
        setError(`${strings.error.questionnaireLoadFailed}, ${error}`);
      }
      setLoading(false);
    };
    fetchQuestionnaires();
  }, [setQuestionnaireTagsAtom, setError, questionnairesApi]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredQuestionnaires(questionnaires);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = questionnaires.filter((questionnaire) => {
      const titleMatch = questionnaire.title?.toLowerCase().includes(lowerCaseSearchTerm);
      const tagMatch = questionnaire.tags?.some((tag) =>
        tag.toLowerCase().includes(lowerCaseSearchTerm)
      );
      return titleMatch || tagMatch;
    });

    setFilteredQuestionnaires(filtered);
  }, [searchTerm, questionnaires]);

  /**
   * Handler for search term change
   *
   * @param event input change event
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  /**
   * Handler for clearing the search term
   */
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  /**
   * Handler for tag "more" click to open popover
   *
   * @param event mouse event
   * @param tags all tags
   */
  const handleTagMoreClick = (event: React.MouseEvent<HTMLElement>, tags: string[]) => {
    event.stopPropagation();
    setTagPopoverAnchor(event.currentTarget);
    setCurrentTags(tags);
  };

  /**
   * Handler for closing the tag popover
   */
  const handleCloseTagPopover = () => {
    setTagPopoverAnchor(null);
  };

  /**
   * Handler for clicking a tag in the popover
   *
   * @param tag string
   */
  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    handleCloseTagPopover();
  };

  /**
   * Handler for opening the delete confirmation dialog
   *
   * @param id questionnaire id to delete
   * @param title questionnaire title
   */
  const handleOpenDialog = (id: string, title: string) => {
    setDeleteTitle(title);
    setDeleteId(id);
    setDialogOpen(true);
  };

  /**
   * Handler for closing the delete confirmation dialog
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDeleteId(null);
    setSelectedQuestionnaire(null);
  };

  /**
   * Handler for confirming deletion
   */
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await questionnairesApi.deleteQuestionnaires({ id: deleteId });
      const updatedQuestionnaires = questionnaires.filter(
        (questionnaire) => questionnaire.id !== deleteId
      );
      setQuestionnaires(updatedQuestionnaires);

      // Update tags atom after deletion
      const allTags = updatedQuestionnaires.flatMap((q) => q.tags || []);
      const uniqueTags = [...new Set<string>(allTags)];
      setQuestionnaireTagsAtom(uniqueTags);

      handleCloseDialog();
    } catch (error) {
      setError(`${strings.error.questionnaireDeleteFailed}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Handler for row click in non-admin mode
   *
   * @param params row parameters
   */
  const handleRowClick = (params: GridRowParams) => {
    setSelectedQuestionnaire(params.row as Questionnaire);
    setMode(QuestionnairePreviewMode.FILL);
    navigate(`/questionnaire/${params.row.id}`);
  };

  /**
   * Handler for edit button click in admin mode
   *
   * @param questionnaire questionnaire to edit
   */
  const handleEditClick = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setMode(QuestionnairePreviewMode.EDIT);
    navigate(`${questionnaire.id}/edit`);
  };

  /**
   * Function to render the status cell with appropriate icon
   *
   * @param params cell parameters
   * @returns JSX element representing the status
   */
  const renderStatusCell = (params: GridRenderCellParams) => {
    const userHasPassed = params.row.passedUsers?.includes(loggedInUser?.id);
    return userHasPassed ? (
      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
    ) : (
      <RadioButtonUncheckedIcon sx={{ color: theme.palette.text.secondary }} />
    );
  };

  /**
   * Function to render the tags cell with improved styling and overflow handling
   */
  const renderTagsCell = (params: GridRenderCellParams) => {
    const tags: string[] = Array.isArray(params.row.tags) ? params.row.tags : [];
    const MAX_VISIBLE_TAGS = 1;
    const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
    const hiddenTagsCount = Math.max(0, tags.length - MAX_VISIBLE_TAGS);

    const allTagsTooltip = tags.join(", ");

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          gap: 0.5,
          overflow: "hidden",
          alignItems: "center",
          width: "100%",
          height: "100%"
        }}
        title={allTagsTooltip}
      >
        {tags.length > 0 ? (
          <>
            {visibleTags.map((tag: string) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                icon={<LabelIcon />}
                variant="outlined"
                sx={{
                  margin: "1px",
                  maxWidth: "120px",
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm(tag);
                }}
              />
            ))}

            {hiddenTagsCount > 0 && (
              <Chip
                size="small"
                label={strings.formatString(strings.questionnaireTags.moreCount, hiddenTagsCount)}
                sx={{
                  flexShrink: 0,
                  backgroundColor: theme.palette.action.selected,
                  color: theme.palette.text.primary,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
                onClick={(e) => handleTagMoreClick(e, tags)}
              />
            )}
          </>
        ) : (
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {strings.questionnaireTags.noTags}
          </Typography>
        )}
      </Box>
    );
  };

  const columns = [
    { field: "title", headerName: `${strings.questionnaireTable.title}`, flex: 2 },
    { field: "description", headerName: `${strings.questionnaireTable.description}`, flex: 5 },
    {
      field: "tags",
      headerName: strings.questionnaireTags.title || "Tags",
      flex: 2,
      minWidth: 180,
      renderCell: renderTagsCell,
      sortable: false,
      filterable: true,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LabelIcon sx={{ mr: 0.5, fontSize: "1.25rem", color: theme.palette.text.primary }} />
          <Typography variant="subtitle2" color={theme.palette.text.primary}>
            {strings.questionnaireTags.title}
          </Typography>
        </Box>
      )
    },
    adminMode
      ? {
          field: "actions",
          headerName: `${strings.questionnaireTable.actions}`,
          flex: 2.5,
          renderCell: (params: GridRenderCellParams) => (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%"
              }}
            >
              <Button
                name="edit"
                variant="outlined"
                color="success"
                onClick={() => handleEditClick(params.row as Questionnaire)}
                sx={{
                  mr: 0.8,
                  minWidth: "100px",
                  width: "auto",
                  height: "auto",
                  fontSize: "0.80rem",
                  color: theme.palette.success.main,
                  borderColor: theme.palette.success.main,
                  "&:hover": { backgroundColor: theme.palette.action.hover }
                }}
              >
                <EditIcon sx={{ color: theme.palette.success.main, mr: 0.3 }} />
                {strings.questionnaireTable.edit}
              </Button>
              <Button
                name="delete"
                variant="contained"
                onClick={() => handleOpenDialog(params.row.id, params.row.title)}
                sx={{
                  minWidth: "85px",
                  width: "auto",
                  height: "auto",
                  fontSize: "0.80rem",
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.getContrastText(theme.palette.error.main),
                  "&:hover": { backgroundColor: theme.palette.error.dark }
                }}
              >
                <DeleteForeverIcon
                  sx={{ color: theme.palette.getContrastText(theme.palette.error.main), mr: 0.3 }}
                />
                {strings.questionnaireTable.delete}
              </Button>
            </Box>
          )
        }
      : {
          field: "status",
          headerName: `${strings.questionnaireTable.status}`,
          flex: 1,
          renderCell: renderStatusCell
        }
  ];

  const renderTagPopover = () => (
    <Popover
      open={Boolean(tagPopoverAnchor)}
      anchorEl={tagPopoverAnchor}
      onClose={handleCloseTagPopover}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center"
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center"
      }}
      slotProps={{
        paper: {
          sx: {
            maxWidth: "400px",
            p: 2,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary
          }
        }
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {strings.questionnaireTags.allTags} ({currentTags.length})
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {currentTags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            icon={<LabelIcon />}
            variant="outlined"
            onClick={() => handleTagClick(tag)}
            sx={{
              cursor: "pointer",
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
              "&:hover": {
                backgroundColor: theme.palette.action.hover
              }
            }}
          />
        ))}
      </Box>
    </Popover>
  );

  return (
    <>
      <Paper
        style={{
          minHeight: 500,
          maxHeight: "auto",
          width: "100%",
          overflow: "auto",
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          position: "relative"
        }}
      >
        {loading && (
          <CircularProgress
            size={50}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: theme.palette.primary.main
            }}
          />
        )}
        <Typography sx={{ margin: 2 }} variant="h4" justifyContent={"center"}>
          {selectedQuestionnaire
            ? selectedQuestionnaire.title
            : strings.questionnaireScreen.currentQuestionnaires}
        </Typography>

        <Box sx={{ px: 2, pb: 2 }}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={strings.questionnaireTags.searchPlaceholder}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.primary }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon sx={{ color: theme.palette.text.primary }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { color: theme.palette.text.primary }
            }}
            InputLabelProps={{ style: { color: theme.palette.text.primary } }}
          />
        </Box>

        <DataGrid
          ref={dataGridRef}
          rowHeight={60}
          sx={{
            margin: 0,
            "& .MuiDataGrid-cell": {
              padding: "8px",
              cursor: "pointer",
              maxHeight: "60px",
              color: theme.palette.text.primary
            },
            "& .MuiDataGrid-columnHeader": {
              padding: "0 8px",
              cursor: "pointer",
              color: theme.palette.text.primary
            },
            "& .MuiDataGrid-footerContainer": {
              color: theme.palette.text.primary,
              borderTop: `1px solid ${theme.palette.divider}`
            },
            backgroundColor: theme.palette.background.paper
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
            }
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>
      {renderTagPopover()}
      <DeleteConfirmationDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onConfirm={handleConfirmDelete}
        deleteType={DeleteItemType.QUESTIONNAIRE}
        deleteTitle={deleteTitle}
      />
    </>
  );
};

export default QuestionnaireTable;
