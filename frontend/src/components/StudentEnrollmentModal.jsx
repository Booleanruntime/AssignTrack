import { useState } from 'react';

// admin enrols students into a subject here. mirrors the teacher-assignment
// modal: starts with the current roster ticked, sends the whole id list back on
// save. enrolled students automatically receive the subject's assignments.
const StudentEnrollmentModal = ({ subject, allStudents, onSave, onClose }) => {
  const initiallyEnrolled = (subject.students || []).map((s) => s._id || s);
  const [selected, setSelected] = useState(initiallyEnrolled);
  const [saving, setSaving] = useState(false);

  const toggle = (studentId) => {
    setSelected((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(subject._id, selected);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-md" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-lg py-md border-b border-outline-variant">
          <h3 className="font-title-lg text-title-lg text-on-surface">Enrol Students</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{subject.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-lg py-md divide-y divide-outline-variant">
          {allStudents.length === 0 && (
            <p className="font-body-md text-body-md text-on-surface-variant py-md text-center">
              No student accounts yet.
            </p>
          )}
          {allStudents.map((student) => (
            <label key={student._id} className="flex items-center gap-sm py-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(student._id)}
                onChange={() => toggle(student._id)}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-body-md text-body-md text-on-surface">{student.name}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{student.email}</span>
            </label>
          ))}
        </div>

        <div className="px-lg py-md border-t border-outline-variant flex justify-between items-center gap-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant">{selected.length} enrolled</span>
          <div className="flex gap-sm">
            <button
              onClick={onClose}
              className="px-md py-xs rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-md py-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollmentModal;
