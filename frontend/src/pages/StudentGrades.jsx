import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

// a student's read-only view of the grades teachers have given them. the /grades
// endpoint already scopes results to the logged-in student, so we just render
// whatever comes back.
const StudentGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    const fetchGrades = async () => {
      try {
        const response = await axiosInstance.get('/grades', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setGrades(response.data);
      } catch (error) {
        console.error('Failed to fetch grades:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [user]);

  return (
    <>
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">My Grades</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Marks and feedback from your teachers.
        </p>
      </div>

      {loading ? (
        <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
      ) : grades.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-lg py-xl text-center font-body-md text-body-md text-on-surface-variant">
          No grades yet. They appear here once a teacher marks a submitted assignment.
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {grades.map((grade) => (
            <div key={grade._id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <div className="flex items-start justify-between gap-md">
                <div>
                  <p className="font-title-lg text-title-lg text-on-surface">{grade.task?.title || 'Assignment'}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{grade.subject?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block font-label-lg text-label-lg px-md py-xs rounded-full ${
                    grade.passed ? 'bg-tertiary-fixed-dim/30 text-on-tertiary-container' : 'bg-error/10 text-error'
                  }`}>
                    {grade.label}
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{grade.score}/100</p>
                </div>
              </div>

              {grade.feedback?.summary && (
                <p className="font-body-md text-body-md text-on-surface mt-md">{grade.feedback.summary}</p>
              )}

              <div className="grid md:grid-cols-2 gap-md mt-md">
                {grade.feedback?.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-xs">Strengths</h4>
                    <ul className="list-disc list-inside font-body-sm text-body-sm text-on-surface space-y-1">
                      {grade.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {grade.feedback?.improvements?.length > 0 && (
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-xs">Areas to improve</h4>
                    <ul className="list-disc list-inside font-body-sm text-body-sm text-on-surface space-y-1">
                      {grade.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {grade.feedback?.rubric?.length > 0 && (
                <div className="mt-md border-t border-outline-variant pt-md">
                  <h4 className="font-label-md text-label-md text-on-surface-variant mb-sm">Rubric</h4>
                  <div className="flex flex-col gap-xs">
                    {grade.feedback.rubric.map((r, i) => (
                      <div key={i} className="flex items-center justify-between font-body-sm text-body-sm text-on-surface">
                        <span>{r.criterion}</span>
                        <span className="text-on-surface-variant">{r.score}/{r.outOf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default StudentGrades;
