import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl uppercase text-white">CRM</h1>
      </div>
      <div className="flex flex-col flex-1">
        <nav className="mt-5">
          <Link
            to="/"
            className={`flex items-center px-6 py-2 text-gray-100 ${
              location.pathname === '/' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <span className="mx-3">Dashboard</span>
          </Link>
          <Link
            to="/customers"
            className={`flex items-center px-6 py-2 text-gray-100 ${
              isActive('/customers') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <span className="mx-3">Customers</span>
          </Link>
          <Link
            to="/properties"
            className={`flex items-center px-6 py-2 text-gray-100 ${
              isActive('/properties') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <span className="mx-3">Properties</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
