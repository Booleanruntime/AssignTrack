import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: response.data.name,
          email: response.data.email,
          university: response.data.university || '',
          address: response.data.address || '',
        });
      } catch (error) {
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none';
  const labelClass = 'block font-label-md text-label-md text-on-surface mb-xs';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-xl text-on-surface-variant font-body-md text-body-md">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Your Profile</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Update your personal and academic details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
        <div>
          <label className={labelClass} htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            type="email"
            placeholder="you@university.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="profile-university">University</label>
          <input
            id="profile-university"
            type="text"
            placeholder="University name"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="profile-address">Address</label>
          <input
            id="profile-address"
            type="text"
            placeholder="Your address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:opacity-90 transition-opacity"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </>
  );
};

export default Profile;
