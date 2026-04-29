import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import type { Skill, UsersSkills } from "src/generated/homeLambdasClient";
import strings from "../../../localization/strings";

interface EditUsersSkillsDialogProps {
  open: boolean;
  usersSkills: UsersSkills | null;
  skills: Skill[];
  loading: boolean;
  onClose: () => void;
  onSkillChange: (index: number, field: keyof Skill, value: string | number) => void;
  onSkillAdd: () => void;
  onSkillRemove: (index: number) => void;
  onSave: () => void;
  disableSave: boolean;
}

/** Available skill categories */
const SKILL_CATEGORIES = ["Programming", "Design", "Management", "DevOps", "QA", "Hobby", "Other"];

/**
 * Dialog component for editing skills for a user.
 *
 * Allows adding, editing, and removing individual skills.
 * The user's name and id are read-only and cannot be modified.
 *
 * @param open - Controls whether the dialog is open.
 * @param usersSkills - The user skills entry being edited.
 * @param loading - Loading state while saving.
 * @param onClose - Callback to close the dialog.
 * @param onSkillChange - Callback when a skill field changes.
 * @param onSkillAdd - Callback to add a new empty skill.
 * @param onSkillRemove - Callback to remove a skill by index.
 * @param onSave - Callback to save the updated skills.
 * @param disableSave - Whether the save button should be disabled.
 * @returns A MUI Dialog element or null if no usersSkills entry is provided.
 */
const EditUsersSkillsDialog = ({
  open,
  usersSkills,
  skills,
  loading,
  onClose,
  onSkillChange,
  onSkillAdd,
  onSkillRemove,
  onSave,
  disableSave
}: EditUsersSkillsDialogProps) => {
  if (!usersSkills) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {strings.usersSkills.editTitle}: {usersSkills.name}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {skills.length === 0 && (
            <Typography color="text.secondary" align="center">
              {strings.usersSkills.noSkills}
            </Typography>
          )}

          {skills.map((skill, index) => (
            <Box key={index}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {strings.usersSkills.skillNumber} {index + 1}
                </Typography>
                <Tooltip title={strings.usersSkills.removeSkill}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onSkillRemove(index)}
                    aria-label={`Remove skill ${index + 1}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label={strings.usersSkills.skillName}
                  value={skill.name}
                  onChange={(e) => onSkillChange(index, "name", e.target.value)}
                />
                <TextField
                  fullWidth
                  select
                  label={strings.usersSkills.skillCategory}
                  value={skill.category ?? ""}
                  onChange={(e) => onSkillChange(index, "category", e.target.value)}
                >
                  {SKILL_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label={strings.usersSkills.skillMonths}
                  type="number"
                  value={skill.months === 0 ? "" : skill.months}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) >= 0) {
                      onSkillChange(index, "months", value === "" ? 0 : Number(value));
                    }
                  }}
                />
              </Stack>

              {index < skills.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}

          <Button startIcon={<AddIcon />} variant="outlined" onClick={onSkillAdd} fullWidth>
            {strings.usersSkills.addSkill}
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {strings.label.cancel}
        </Button>
        <Button variant="contained" onClick={onSave} disabled={loading || disableSave}>
          {loading ? <CircularProgress size={24} /> : strings.label.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUsersSkillsDialog;
