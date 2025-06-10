// src/components/home/vacation-management-card.tsx
import React from 'react';
import { Paper, Typography, Button, Card, CardContent } from '@mui/material';
import { Person } from '@mui/icons-material'; 
import { Link } from 'react-router-dom';

/**
 * Component for the vacation management card on the admin page
 */
const VacationManagementCard: React.FC = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>User Vacation Management</Typography>
        <Typography variant="body1" paragraph>
          View and update individual user vacation day allocations and remaining days.
        </Typography>
        <Button
          component={Link}
          to="/admin/vacation-management"
          variant="contained"
          color="primary"
          startIcon={<Person />}
          fullWidth
          sx={{
            textTransform: 'uppercase',
            backgroundColor: 'rgba(0, 0, 0, 0.87)', // Dark background to match existing buttons
            borderRadius: '4px',
            padding: '8px 16px'
          }}
        >
          MANAGE USER VACATION DAYS
        </Button>
      </CardContent>
    </Card>
  );
};

export default VacationManagementCard;