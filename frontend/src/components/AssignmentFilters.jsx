import { ASSIGNMENT_STATUSES } from '../constants/assignmentStatuses';

import {
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';


const AssignmentFilters = ({ statusFilter, setStatusFilter, subjectFilter, setSubjectFilter, sortOrder, setSortOrder, subjects }) => {

return (
   <Stack direction="row" spacing={2} sx={{ width: '100%' }}>


  <FormControl sx={{ flex: 1 }}>
    <InputLabel id="status-filter-label">Filter by Status</InputLabel>
    <Select
      labelId="status-filter-label"
      value={statusFilter}
      label="Filter by Status"
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <MenuItem value="all">All Statuses</MenuItem>
      {Object.values(ASSIGNMENT_STATUSES).map((status) => (
        <MenuItem key={status} value={status}>
          {status}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl sx={{ flex: 1.7 }}>
    <InputLabel id="subject-filter-label">Filter by Subject</InputLabel>
    <Select
      labelId="subject-filter-label"
      value={subjectFilter}
      label="Filter by Subject"
      onChange={(e) => setSubjectFilter(e.target.value)}
    >
      <MenuItem value="all">All Subjects</MenuItem>
      {subjects.map((subject) => (
        <MenuItem key={subject._id} value={subject._id}>
          {subject.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl sx={{ flex: 1 }}>
    <InputLabel id="sort-order-label">Sort by Due Date</InputLabel>
    <Select
      labelId="sort-order-label"
      value={sortOrder}
      label="Sort by Due Date"
      onChange={(e) => setSortOrder(e.target.value)}
    >
      <MenuItem value="asc">Earliest First</MenuItem>
      <MenuItem value="desc">Latest First</MenuItem>
    </Select>
  </FormControl>


</Stack>
);
};

export default AssignmentFilters;