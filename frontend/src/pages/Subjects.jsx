import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import SubjectForm from '../components/SubjectForm';
import SubjectList from '../components/SubjectList';



const Subjects = () => {
      const { user } = useAuth();
      const [subjects, setSubjects] = useState([]);
      const [formData, setFormData] = useState({
        name: '',
        description: ''
        });

        const [editingSubject, setEditingSubject] = useState(null);
        const [editDescription, setEditDescription] = useState('');
       
        useEffect(() => {
             if (!user?.token){     
                console.log('No user token yet');
                return;}
            const fetchSubjects = async () => {
                try {
                    const response = await axiosInstance.get('/api/subjects',{
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

        const handleCreateSubject = async (e) => {
            e.preventDefault();

            if (!formData.name) {
                alert('Subject name is required.');
                return;
            }

            try {
                const response = await axiosInstance.post('/api/subjects', formData, {
                headers: { Authorization: `Bearer ${user.token}` },
                });

                setSubjects([...subjects, response.data]);
                setFormData({ name: '', description: '' });
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to create subject.');
            }
        };

        const startEditingSubject = (subject) => {
        setEditingSubject(subject);
        setEditDescription(subject.description || '');
        };

        const handleUpdateSubject = async (subjectId) => {
        try {
            const response = await axiosInstance.put(
            `/api/subjects/${subjectId}`,
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

        const handleDeleteSubject = async (subjectId) => {
        const confirmDelete = window.confirm(
                'Are you sure you want to delete this subject?'
            );

            if (!confirmDelete) {
                return;
            }

            try {
                await axiosInstance.delete(`/api/subjects/${subjectId}`, {
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

        return (
            <div className="container mx-auto p-6">
            <h1>Subject Management</h1>
            <SubjectForm
                formData={formData}
                setFormData={setFormData}
                handleCreateSubject={handleCreateSubject}
            />
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
