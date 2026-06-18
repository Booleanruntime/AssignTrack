import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

// quick form for spinning up a teacher account. posts to /auth/users with the
// role already set to teacher.
const CreateTeacherForm = ({ onCreated, onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axiosInstance.post(
        '/auth/users',
        { ...form, role: 'teacher' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      onCreated(response.data);
      setForm({ name: '', email: '', password: '' });
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none';

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm">
      <h3 className="font-title-lg text-title-lg text-on-surface mb-md">Create Teacher Account</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className={inputClass}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Temporary password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className={inputClass}
        />
        <div className="flex justify-end gap-sm">
          <button
            type="button"
            onClick={onClose}
            className="px-md py-xs rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-md py-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeacherForm;
