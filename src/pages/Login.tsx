import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SHA256 } from 'crypto-js';
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
        email: credentials.email,
        token: SHA256(credentials.email + new Date().getTime()).toString(),
        passwordHash: VALID_PASSWORD_HASH
      };

      login(authData); // Use the context's login function
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md
                  focus:outline-none focus:ring-[#e56e43] focus:border-[#e56e43] focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="current-password" className="sr-only">Password</label>
              <input
                id="current-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md
                  focus:outline-none focus:ring-[#e56e43] focus:border-[#e56e43] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent
                text-sm font-medium rounded-md text-white bg-[#e56e43] hover:bg-[#e56e43]/90
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e56e43]"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
