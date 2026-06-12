import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      login(response.data);
      if (response.data.role === 'admin') {
        navigate('/subjects');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please check your email and password.');
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
              Welcome back. Please enter your details.
            </p>
          </header>

          <form className="space-y-lg" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container text-on-error-container font-body-sm text-body-sm px-md py-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">
                University Email
              </label>
              <input
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 outline-none"
                id="email"
                name="email"
                type="email"
                placeholder="student@university.edu"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 outline-none"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
                <label className="ml-sm font-body-sm text-body-sm text-on-surface-variant" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <button type="button" className="font-label-sm text-label-sm text-primary hover:underline transition-all">
                Forgot password?
              </button>
            </div>

            <button
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg hover:bg-on-surface transition-colors duration-200 ease-in-out flex justify-center items-center gap-xs"
              type="submit"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          <div className="mt-xl text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?
              <Link
                className="font-label-md text-label-md text-primary hover:underline transition-all ml-xs"
                to="/register"
              >
                Sign up
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
          <button type="button" className="hover:text-primary underline transition-opacity duration-150">Privacy Policy</button>
          <button type="button" className="hover:text-primary underline transition-opacity duration-150">Terms of Service</button>
          <button type="button" className="hover:text-primary underline transition-opacity duration-150">Security</button>
          <button type="button" className="hover:text-primary underline transition-opacity duration-150">Help Center</button>
        </nav>
      </footer>
    </div>
  );
};

export default Login;
