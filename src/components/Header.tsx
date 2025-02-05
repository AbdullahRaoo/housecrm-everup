function Header() {
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
      <div className="flex items-center">
        <button className="flex items-center text-gray-700 hover:text-[#e56e43] transition-colors duration-200">
          <span className="mx-2 font-medium">John Doe</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#e56e43]">
            <img
              className="w-full h-full object-cover"
              src="https://ui-avatars.com/api/?name=John+Doe&background=e56e43&color=fff"
              alt="Profile"
            />
          </div>
        </button>
      </div>
    </header>
  );
}

export default Header;
