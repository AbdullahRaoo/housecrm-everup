import { SHA256 } from 'crypto-js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const VALID_EMAIL = 'admin@gmail.com';
  const VALID_PASSWORD = 'admin123';
  const VALID_PASSWORD_HASH = SHA256(VALID_PASSWORD).toString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (credentials.email === VALID_EMAIL &&
      SHA256(credentials.password).toString() === VALID_PASSWORD_HASH) {
      const authData = {
        token: SHA256(credentials.email + new Date().getTime()).toString(),
        user: {
          id: '1',
          name: 'Admin User',
          email: credentials.email,
          isAdmin: true,
          role: 'admin'
        }
      };

      login(authData);
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e56e43] to-[#f8c4b4] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl space-y-8 p-10">
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-48 mb-6"
          />
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border
                  border-gray-300 rounded-md placeholder-gray-500 text-gray-900
                  focus:outline-none focus:ring-[#e56e43] focus:border-[#e56e43] focus:z-10
                  sm:text-sm transition-colors duration-200"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="current-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border
                  border-gray-300 rounded-md placeholder-gray-500 text-gray-900
                  focus:outline-none focus:ring-[#e56e43] focus:border-[#e56e43] focus:z-10
                  sm:text-sm transition-colors duration-200"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent
                text-sm font-medium rounded-md text-white bg-[#e56e43] hover:bg-[#e56e43]/90
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e56e43]
                transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-[#e56e43]/40 group-hover:text-[#e56e43]/30"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              Sign in
            </button>
          </div>

          <div className="text-center text-sm mt-4 text-gray-600">
            <p>Demo credentials:</p>
            <p><strong>Email:</strong> admin@gmail.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
