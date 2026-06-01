import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

import {
  TextField,
  Button
} from '@mui/material';


const emptyFormData = { name: '', description: '' };
const SubjectForm = ({ subjects, setSubjects, setShowSubjectForm }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(emptyFormData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Subject name is required.');
      return;
    }

    try {
      const response = await axiosInstance.post('/subjects', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSubjects([...subjects, response.data]);
      setFormData(emptyFormData);
      setShowSubjectForm(false);

    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create subject.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
    
        <h1 className="text-2xl font-bold mb-4">
          Create Subject
        </h1>

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

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <Button
            type="submit"
          variant="contained"
          sx={{ backgroundColor: '#2e67e4', '&:hover': { backgroundColor: '#2457c5' } }}
          fullWidth
          >
            Create Subject
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {                              
            setFormData(emptyFormData);  
            setShowSubjectForm(false);                            
            }}
           >
              Cancel
          </Button>
       </div>
      
    </form>
  );
};

export default SubjectForm;
