import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

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

  const inputClass =
    'w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none';

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <h3 className="font-title-lg text-title-lg text-primary mb-md">Create Subject</h3>

      <div className="space-y-md">
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="subject-name">
            Subject Name
          </label>
          <input
            id="subject-name"
            type="text"
            className={inputClass}
            placeholder="e.g. Computer Science 101"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="subject-description">
            Description
          </label>
          <textarea
            id="subject-description"
            rows={3}
            className={inputClass}
            placeholder="What does this subject cover?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-sm mt-lg">
        <button
          type="submit"
          className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:opacity-90 transition-opacity"
        >
          Create Subject
        </button>
        <button
          type="button"
          onClick={() => {
            setFormData(emptyFormData);
            setShowSubjectForm(false);
          }}
          className="flex-1 border border-outline-variant text-on-surface-variant font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
