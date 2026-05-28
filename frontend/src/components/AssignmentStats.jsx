import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
} from '@mui/material';


const AssignmentStats = ({ tasks}) => {

    const getStatusColor = (status) => {
    switch (status) {
      case ASSIGNMENT_STATUSES.COMPLETED:
        return 'success';
      case ASSIGNMENT_STATUSES.IN_PROGRESS:
        return 'primary';
      case ASSIGNMENT_STATUSES.OVERDUE:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
    <Card sx={{ flex: 1.2 }}>
      <CardContent>
      <Stack direction="row" spacing={1}  sx={{
    alignItems: 'center'
  }}>
        <Typography variant="h6">
          Total: {tasks.length}
        </Typography>
      </Stack>
    </CardContent>
    </Card>

    {Object.values(ASSIGNMENT_STATUSES).map((status) => (
      <Card key={status}  sx={{ flex: 1 }}>
        <CardContent>
          <Stack direction="row" spacing={1}  sx={{
              alignItems: 'center'
            }}>
          <Chip 
            color={getStatusColor(status)}
            size="small"
            sx={{ mt: 1 }}
          />

          <Typography variant="h6">
            {status}: {tasks.filter((task) => task.status === status).length}
          </Typography>
          </Stack>
        </CardContent>
      </Card>
    ))}
  </Stack>
);
};

export default AssignmentStats;