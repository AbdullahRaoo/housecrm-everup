function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center">
        <input
          className="w-64 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none"
          type="search"
          placeholder="Search..."
        />
      </div>
      <div className="flex items-center">
        <button className="flex items-center text-gray-500 hover:text-gray-600">
          <span className="mx-2">John Doe</span>
          <img
            className="w-8 h-8 rounded-full"
            src="https://ui-avatars.com/api/?name=John+Doe"
            alt="Profile"
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
