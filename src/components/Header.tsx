import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center">
        <input
          className="w-64 px-4 py-2 text-gray-800 bg-gray-50 rounded-lg
            placeholder-gray-400 border border-gray-200
            focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
            transition-colors duration-200"
          type="search"
          placeholder="Search..."
        />
      </div>

      <div className="flex items-center relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center text-gray-700 hover:text-[#e56e43] transition-colors duration-200"
        >
          <span className="mx-2 font-medium">John Doe</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#e56e43]">
            <img
              className="w-full h-full object-cover"
              src="https://ui-avatars.com/api/?name=John+Doe&background=e56e43&color=fff"
              alt="Profile"
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg
            border border-gray-100 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="text-sm font-medium text-gray-800">admin@example.com</p>
            </div>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50
                hover:text-[#e56e43] transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
