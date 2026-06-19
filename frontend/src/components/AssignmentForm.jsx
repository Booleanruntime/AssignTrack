import { useState, useEffect } from 'react';

const empty = { title: '', description: '', deadline: '', subject: '' };

// teacher's create/edit form for an assignment. subject can only be one the
// teacher actually teaches, and there's no status field here - status lives on
// each student's instance, not the assignment itself.
const AssignmentForm = ({ editing, subjects, onSave, onCancel }) => {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || '',
        description: editing.description || '',
        deadline: editing.deadline?.slice(0, 10) || '',
        subject: editing.subject?._id || editing.subject || '',
      });
    } else {
      setForm(empty);
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.deadline || !form.subject) {
      alert('Please complete title, description, due date and subject.');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none';
  const labelClass = 'block font-label-md text-label-md text-on-surface mb-xs';

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <h3 className="font-title-lg text-title-lg text-primary mb-md">
        {editing ? 'Edit Assignment' : 'New Assignment'}
      </h3>

      <div className="space-y-md">
        <div>
          <label className={labelClass} htmlFor="a-title">Title</label>
          <input
            id="a-title"
            type="text"
            className={inputClass}
            placeholder="e.g. Database Architecture Project"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="a-desc">Description</label>
          <textarea
            id="a-desc"
            rows={3}
            className={inputClass}
            placeholder="What students need to do"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className={labelClass} htmlFor="a-deadline">Due Date</label>
            <input
              id="a-deadline"
              type="date"
              className={inputClass}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="a-subject">Subject</label>
            <select
              id="a-subject"
              className={inputClass}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              disabled={!!editing}
              required
            >
              <option value="" disabled>Select a subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            {editing && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Subject can't change after an assignment is set.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-sm mt-lg">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving…' : editing ? 'Update Assignment' : 'Create & Assign'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-outline-variant text-on-surface-variant font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
