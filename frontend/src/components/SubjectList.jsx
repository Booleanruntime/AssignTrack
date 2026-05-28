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
            <Stack
                direction="row"
                spacing={2}
                 sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
              >
              <div style={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {subject.name}
              </Typography>
              </div>

          <div style={{ flex: 2 }}>
            {editingSubject?._id === subject._id ? (
                <TextField
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  fullWidth
                  size="small"
                />
              ) : (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.9 }}>
                      Description
                    </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 540 }}>
                  {subject.description || 'No description'}
                  </Typography>
                   </>
              )}
          </div>
          <Stack direction="row" spacing={1}>
                {editingSubject?._id === subject._id ? (
                  <>
                  <Button
                    variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#2e67e4',
                        '&:hover': { backgroundColor: '#2457c5' },
                        py: 0,
                        px: 1,
                        minHeight: 28,
                        height: 30,
                        minWidth: 54,
                        fontSize: '0.82rem'
                      }}
                    onClick={() => handleUpdateSubject(subject._id)}
                  >
                    Save
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                      sx={{
                        py: 0,
                        px: 1,
                        minHeight: 28,
                        height: 30,
                        minWidth: 54,
                        fontSize: '0.82rem'
                      }}
                    onClick={() => {
                      setEditingSubject(null);
                      setEditDescription('');
                    }}
                  >
                    Cancel
                  </Button>
               
              </>
            ) : (
              <>              
                  <Button
                    variant="outlined"
                    size="small"
                      sx={{
                        py: 0,
                        px: 1,
                        minHeight: 28,
                        height: 30,
                        minWidth: 54,
                        fontSize: '0.82rem'
                      }}
                    onClick={() => startEditingSubject(subject)}
                  >
                    Edit
                  </Button>              
                  <Button
                    variant="outlined"
                    color="error"
                      size="small"
                      sx={{
                        py: 0,
                        px: 1,
                        minHeight: 28,
                        height: 30,
                        minWidth: 54,
                        fontSize: '0.82rem'
                      }}
                    onClick={() => handleDeleteSubject(subject._id)}
                  >
                    Delete
                  </Button>
                 </>
                 )}
                </Stack>
              </Stack>            
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default SubjectList;
