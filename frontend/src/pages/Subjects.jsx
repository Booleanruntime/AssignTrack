import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import SubjectForm from '../components/SubjectForm';
import SubjectList from '../components/SubjectList';
import { Typography, Button, Box } from '@mui/material';


const Subjects = () => {
      const { user } = useAuth();
      const [subjects, setSubjects] = useState([]);
      const [editingSubject, setEditingSubject] = useState(null);
      const [editDescription, setEditDescription] = useState('');
      const [showSubjectForm, setShowSubjectForm] = useState(false);
      const subjectFormRef = useRef(null);
        
        useEffect(() => {
             if (!user?.token){     
                console.log('No user token yet');
                return;}
            const fetchSubjects = async () => {
                try {
                    const response = await axiosInstance.get('/subjects',{
                        headers: { Authorization: `Bearer ${user.token}` },
                    });
                    console.log('Subjects response:', response.data);
                    setSubjects(response.data);
                } catch (error) { 
                    //alert('Failed to fetch subjects.');
                    console.error('Failed to fetch subjects:', error.response?.data || error.message);
                    alert(error.response?.data?.message || 'Failed to fetch subjects.');
            };
        }
        fetchSubjects();
        }, [user]);

         const handleDeleteSubject = async (subjectId) => {
        const confirmDelete = window.confirm(
                'Are you sure you want to delete this subject?'
            );

            if (!confirmDelete) {
                return;
            }

            try {
                await axiosInstance.delete(`/subjects/${subjectId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
                });

                setSubjects(
                subjects.filter((subject) => subject._id !== subjectId)
                );
            } catch (error) {
                alert(
                error.response?.data?.message ||
                'Failed to delete subject.'
                );
            }
        };

const startEditingSubject = (subject) => {
        setEditingSubject(subject);
        setEditDescription(subject.description || '');
        };

        const handleUpdateSubject = async (subjectId) => {
        try {
            const response = await axiosInstance.put(
            `/subjects/${subjectId}`,
            { description: editDescription },
            {
                headers: { Authorization: `Bearer ${user.token}` },
            }
            );

            setSubjects(
            subjects.map((subject) =>
                subject._id === response.data._id ? response.data : subject
            )
            );

                setEditingSubject(null);
                setEditDescription('');
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to update subject.');
            }
        };

        

        
        const openSubjectForm = () => {
            setShowSubjectForm(true);

            setTimeout(() => {
                subjectFormRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
                });
            }, 100);
        };

        return (
            <div className="max-w-7xl mx-auto p-6">
                 <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }}>
                <Typography  variant="h4" sx={{fontWeight: 700}}>Subject Management</Typography>

                <Button
                    variant="contained"
                    sx={{ backgroundColor: '#2e67e4', '&:hover': { backgroundColor: '#2457c5' } }}
                    onClick={() => {
                        setEditingSubject(null);
                        openSubjectForm();
                    }}
                >
                    + Create Subject
                </Button>  
                </Box>
                {showSubjectForm && (
                    <div ref={subjectFormRef}>
                        <SubjectForm
                            subjects={subjects}
                            setSubjects={setSubjects}
                            editingSubject={editingSubject}
                            setEditingSubject={setEditingSubject}
                            setShowSubjectForm={setShowSubjectForm}
                        />
                    </div>
                )}

                <SubjectList
                subjects={subjects}

                editingSubject={editingSubject}
                editDescription={editDescription}
                setEditDescription={setEditDescription}
                startEditingSubject={startEditingSubject}
                handleUpdateSubject={handleUpdateSubject}
                handleDeleteSubject={handleDeleteSubject}
                setEditingSubject={setEditingSubject}
                />
                
            </div>
        );
      
};
export default Subjects;
