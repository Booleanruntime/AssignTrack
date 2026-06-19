import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import AssignmentForm from '../components/AssignmentForm';
import ConfirmDialog from '../components/ConfirmDialog';

// teacher's authoring workspace: the assignments they've set, how each is
// tracking across the class, and the form to create or edit one. creating an
// assignment fans it out to every student enrolled in the subject.
const TeacherAssignments = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const formRef = useRef(null);

  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  const loadAssignments = async () => {
    const res = await axiosInstance.get('/assignments', authHeader);
    setAssignments(res.data);
  };

  useEffect(() => {
    if (!user?.token) return;
    const load = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          axiosInstance.get('/assignments', authHeader),
          axiosInstance.get('/subjects', authHeader),
        ]);
        setAssignments(aRes.data);
        // only subjects this teacher runs can have work set on them
        setSubjects(sRes.data.filter((s) => (s.teachers || []).some((t) => (t._id || t) === user.id)));
      } catch (error) {
        console.error('Failed to load assignments:', error.response?.data || error.message);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // sidebar "New Assignment" routes here with this flag
  useEffect(() => {
    if (location.state?.openForm) openForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const openForm = () => {
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await axiosInstance.put(`/assignments/${editing._id}`, payload, authHeader);
      } else {
        await axiosInstance.post('/assignments', payload, authHeader);
      }
      await loadAssignments();
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save assignment.');
    }
  };

  const deleteAssignment = async (id) => {
    try {
      await axiosInstance.delete(`/assignments/${id}`, authHeader);
      setAssignments(assignments.filter((a) => a._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete assignment.');
    }
  };

  const askDelete = (a) =>
    setConfirm({
      title: 'Delete assignment?',
      message: `"${a.title}" and every student's copy will be removed. This can't be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'delete',
      onConfirm: () => deleteAssignment(a._id),
    });

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Assignments</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Work you've set for the subjects you teach.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); openForm(); }}
          disabled={subjects.length === 0}
          className="inline-flex items-center justify-center gap-xs bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Assignment
        </button>
      </div>

      {subjects.length === 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-lg py-md mb-lg font-body-md text-body-md text-on-surface-variant">
          You're not assigned to any subjects yet. An admin needs to add you to a subject before you can set work.
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="mb-lg">
          <AssignmentForm
            editing={editing}
            subjects={subjects}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm divide-y divide-outline-variant">
        {assignments.length === 0 ? (
          <div className="px-lg py-xl text-center font-body-md text-body-md text-on-surface-variant">
            No assignments yet. Create one to set work for your students.
          </div>
        ) : (
          assignments.map((a) => (
            <div key={a._id} className="flex items-center justify-between px-lg py-md hover:bg-surface-bright transition-colors gap-md">
              <div className="min-w-0">
                <p className="font-title-lg text-title-lg text-on-surface truncate">{a.title}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {a.subject?.name} · due {new Date(a.deadline).toLocaleDateString()}
                </p>
                <div className="flex gap-xs mt-xs">
                  <span className="font-label-sm text-label-sm px-2 py-[2px] rounded-full bg-surface-variant text-on-surface-variant">
                    {a.counts?.total || 0} assigned
                  </span>
                  <span className="font-label-sm text-label-sm px-2 py-[2px] rounded-full bg-primary/10 text-primary">
                    {a.counts?.submitted || 0} submitted
                  </span>
                  <span className="font-label-sm text-label-sm px-2 py-[2px] rounded-full bg-tertiary-fixed-dim/30 text-on-tertiary-container">
                    {a.counts?.graded || 0} graded
                  </span>
                </div>
              </div>
              <div className="flex gap-sm shrink-0">
                <button
                  onClick={() => { setEditing(a); openForm(); }}
                  title="Edit assignment"
                  className="p-xs rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => askDelete(a)}
                  title="Delete assignment"
                  className="p-xs rounded-lg border border-outline-variant text-error hover:bg-error-container hover:border-error transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
    </>
  );
};

export default TeacherAssignments;
