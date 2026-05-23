
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography
} from '@mui/material';

const SubjectForm = ({
  formData,
  setFormData,
  handleCreateSubject
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Create Subject
        </Typography>

        <form onSubmit={handleCreateSubject}>
          <TextField
            label="Subject Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
            }
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value
              })
            }
            fullWidth
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Create Subject
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubjectForm;
