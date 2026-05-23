import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Stack
} from '@mui/material';

const SubjectList = ({
  subjects,
  editingSubject,
  editDescription,
  setEditDescription,
  startEditingSubject,
  handleUpdateSubject,
  handleDeleteSubject,
  setEditingSubject
}) => {
  return (
    <>
      {subjects.map((subject) => (
        <Card key={subject._id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">
              {subject.name}
            </Typography>

            {editingSubject?._id === subject._id ? (
              <>
                <TextField
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  fullWidth
                  margin="normal"
                />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleUpdateSubject(subject._id)}
                  >
                    Save
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingSubject(null);
                      setEditDescription('');
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography variant="body1">
                  {subject.description || 'No description'}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => startEditingSubject(subject)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteSubject(subject._id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default SubjectList;
