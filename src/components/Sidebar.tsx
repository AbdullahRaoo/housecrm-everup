import { Link, useLocation } from 'react-router-dom';
import logo from "../assets/logo.png";
import { useAuth } from '../hooks/useAuth';

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-[#e56e43] border-r">
      <div className="flex items-center justify-center p-3">
        <figure className='w-full'>
          <img src={logo} alt="logo" className='w-full' />
        </figure>
      </div>

      <div className="flex flex-col flex-1 py-6">
        <nav className="space-y-1">
          <Link
            to="/"
            className={`flex items-center px-6 py-3 transition-colors ${location.pathname === '/'
              ? 'bg-white text-[#e56e43] font-medium'
              : 'text-white hover:bg-white/10'
              }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/customers"
            className={`flex items-center px-6 py-3 transition-colors ${isActive('/customers')
              ? 'bg-white text-[#e56e43] font-medium'
              : 'text-white hover:bg-white/10'
              }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>Customers</span>
          </Link>

          <Link
            to="/properties"
            className={`flex items-center px-6 py-3 transition-colors ${isActive('/properties')
              ? 'bg-white text-[#e56e43] font-medium'
              : 'text-white hover:bg-white/10'
              }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>Properties</span>
          </Link>

          <Link
            to="/opportunities"
            className={`flex items-center px-6 py-3 transition-colors ${isActive('/opportunities')
              ? 'bg-white text-[#e56e43] font-medium'
              : 'text-white hover:bg-white/10'
              }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span>Opportunities</span>
          </Link>

          <Link
            to="/sheets"
            className={`flex items-center px-6 py-3 transition-colors ${isActive('/sheets')
              ? 'bg-white text-[#e56e43] font-medium'
              : 'text-white hover:bg-white/10'
              }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Sheets</span>
          </Link>

          <Link
            to="/calendar"
            className={`flex items-center px-6 py-3 transition-colors ${isActive('/calendar')
              ? 'bg-white text-[#e56e43] font-medium'
              : 'text-white hover:bg-white/10'
              }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Calendar</span>
          </Link>

          {/* Show Users management only to admins */}
          {user?.isAdmin && (
            <Link
              to="/users"
              className={`flex items-center px-6 py-3 transition-colors ${isActive('/users')
                ? 'bg-white text-[#e56e43] font-medium'
                : 'text-white hover:bg-white/10'
                }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Users</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
