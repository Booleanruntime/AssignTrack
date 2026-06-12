import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col antialiased">
      <main className="flex-grow flex items-center justify-center p-md md:p-lg">
        <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/5 duration-300 ease-in-out">
          <header className="text-center mb-xl">
            <div className="mb-lg flex justify-center">
              <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-title-lg">menu_book</span>
              </div>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">AssignTrack</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Create your account to get started.
            </p>
          </header>

          <form className="space-y-lg" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container text-on-error-container font-body-sm text-body-sm px-md py-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="fullName">
                Full Name
              </label>
              <input
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 outline-none"
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">
                University Email
              </label>
              <input
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 outline-none"
                id="email"
                name="email"
                type="email"
                placeholder="jane.doe@university.edu"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-md py-sm pr-10 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 outline-none"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-sm flex items-center text-outline hover:text-on-surface-variant focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-outline mt-xs">Must be at least 8 characters long.</p>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest cursor-pointer"
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                />
              </div>
              <label className="ml-sm font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="terms">
                I agree to the{' '}
                <a className="text-primary hover:underline font-medium" href="#">Terms and Conditions</a> and{' '}
                <a className="text-primary hover:underline font-medium" href="#">Privacy Policy</a>.
              </label>
            </div>

            <button
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-on-surface transition-colors duration-200 ease-in-out flex justify-center items-center gap-xs"
              type="submit"
            >
              <span>Create Account</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          <div className="mt-xl text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account?
              <Link className="font-label-md text-label-md text-primary hover:underline transition-all ml-xs" to="/login">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-lg px-lg flex flex-col md:flex-row justify-between items-center gap-md bg-surface border-t border-outline-variant">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline-sm text-headline-sm font-bold text-primary">AssignTrack</span>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
            © 2026 AssignTrack. Academic Excellence through Organization.
          </p>
        </div>
        <nav className="flex gap-md font-label-sm text-label-sm text-on-surface-variant">
          <a className="hover:text-primary underline transition-opacity duration-150" href="#">Privacy Policy</a>
          <a className="hover:text-primary underline transition-opacity duration-150" href="#">Terms of Service</a>
          <a className="hover:text-primary underline transition-opacity duration-150" href="#">Security</a>
          <a className="hover:text-primary underline transition-opacity duration-150" href="#">Help Center</a>
        </nav>
      </footer>
    </div>
  );
};

export default Register;
