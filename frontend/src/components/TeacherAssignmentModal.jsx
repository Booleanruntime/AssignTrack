import { useState } from 'react';

// admin picks who teaches a subject here. starts with the current lot ticked,
// sends the whole id list back on save.
const TeacherAssignmentModal = ({ subject, allTeachers, onSave, onClose }) => {
  const initiallyAssigned = (subject.teachers || []).map((t) => t._id || t);
  const [selected, setSelected] = useState(initiallyAssigned);
  const [saving, setSaving] = useState(false);

  const toggle = (teacherId) => {
    setSelected((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-md">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="px-lg py-md border-b border-outline-variant">
          <h3 className="font-title-lg text-title-lg text-on-surface">Assign Teachers</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{subject.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-lg py-md divide-y divide-outline-variant">
          {allTeachers.length === 0 && (
            <p className="font-body-md text-body-md text-on-surface-variant py-md text-center">
              No teacher accounts yet. Create one first.
            </p>
          )}
          {allTeachers.map((teacher) => (
            <label
              key={teacher._id}
              className="flex items-center gap-sm py-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(teacher._id)}
                onChange={() => toggle(teacher._id)}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-body-md text-body-md text-on-surface">{teacher.name}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{teacher.email}</span>
            </label>
          ))}
        </div>

        <div className="px-lg py-md border-t border-outline-variant flex justify-end gap-sm">
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
  );
};

export default TeacherAssignmentModal;
