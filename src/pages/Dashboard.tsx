function Dashboard() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h3 className="text-gray-800 text-3xl font-semibold">Dashboard</h3>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <h4 className="text-gray-600 font-medium">Total Customers</h4>
            <div className="flex items-center pt-4">
              <span className="text-3xl font-bold text-[#e56e43]">256</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <h4 className="text-gray-600 font-medium">Active Deals</h4>
            <div className="flex items-center pt-4">
              <span className="text-3xl font-bold text-[#e56e43]">45</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <h4 className="text-gray-600 font-medium">Total Revenue</h4>
            <div className="flex items-center pt-4">
              <span className="text-3xl font-bold text-[#e56e43]">$23,456</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <h4 className="text-gray-600 font-medium">Pending Tasks</h4>
            <div className="flex items-center pt-4">
              <span className="text-3xl font-bold text-[#e56e43]">15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
