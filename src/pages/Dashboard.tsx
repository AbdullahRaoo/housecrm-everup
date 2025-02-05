function Dashboard() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h3 className="text-gray-700 text-3xl font-medium">Dashboard</h3>

      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-gray-500">Total Customers</h4>
            <div className="flex items-center pt-4">
              <span className="text-3xl font-bold text-gray-700">256</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-gray-500">Active Deals</h4>
            <div className="flex items-center pt-4">
              <span className="text-3xl font-bold text-gray-700">45</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-gray-500">Total Revenue</h4>
            <div className="flex items-center pt-4">
              <span className="text-3xl font-bold text-gray-700">$23,456</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-gray-500">Pending Tasks</h4>
            <div className="flex items-center pt-4">
              <span className="text-3xl font-bold text-gray-700">15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
