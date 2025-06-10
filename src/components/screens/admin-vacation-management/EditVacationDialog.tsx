import type React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import type { VacationDays, User } from '../../../types/index';

interface EditVacationDialogProps {
  open: boolean;
  user: User | null;
  vacationDays: VacationDays;
  loading: boolean;
  onClose: () => void;
  onChange: (year: string, field: 'total' | 'remaining', value: string) => void;
  onSave: () => void;
  disableSave: boolean; 
}

const EditVacationDialog: React.FC<EditVacationDialogProps> = ({
  open,
  user,
  vacationDays,
  loading,
  onClose,
  onChange,
  onSave,
  disableSave  // <-- add disableSave here
}) => {
  if (!user) return null;

  const years = Object.keys(vacationDays).filter(year => Number.parseInt(year) <= new Date().getFullYear());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Vacation Days: {user.firstName} {user.lastName}</DialogTitle>
      <DialogContent dividers>
        {years.map(year => (
          <Box key={year} sx={{ mb: 3 }}>
            <Typography variant="h6">{year}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TextField
                label="Total Days"
                type="number"
                value={vacationDays[year].total}
                onChange={(e) => onChange(year, 'total', e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
              <TextField
                label="Remaining Days"
                type="number"
                value={vacationDays[year].remaining}
                onChange={(e) => onChange(year, 'remaining', e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        {/* Disable Save if loading or disableSave is true */}
        <Button variant="contained" onClick={onSave} disabled={loading || disableSave}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVacationDialog;
