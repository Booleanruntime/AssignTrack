import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import SubjectForm from '../components/SubjectForm';
import SubjectList from '../components/SubjectList';

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const subjectFormRef = useRef(null);

  useEffect(() => {
    if (!user?.token) {
      console.log('No user token yet');
      return;
    }
    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get('/subjects', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSubjects(response.data);
      } catch (error) {
        console.error('Failed to fetch subjects:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Failed to fetch subjects.');
      }
    };
    fetchSubjects();
  }, [user]);

  const handleDeleteSubject = async (subjectId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this subject?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axiosInstance.delete(`/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSubjects(subjects.filter((subject) => subject._id !== subjectId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete subject.');
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
        subjects.map((subject) => (subject._id === response.data._id ? response.data : subject))
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
      subjectFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Subject Catalog</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Manage the global list of academic subjects available for assignments.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSubject(null);
            openSubjectForm();
          }}
          className="inline-flex items-center justify-center gap-xs bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Subject
        </button>
      </div>

      {showSubjectForm && (
        <div ref={subjectFormRef} className="mb-lg">
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
    </>
  );
};

export default Subjects;
