import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardData } from '../data/dashboardService';
import { DashboardStats, PropertyPerformance, TaskProgress } from '../data/types';
import { CalendarEvent } from '../types/calendar';
import { Customer } from '../types/customer';
import { Property } from '../types/property';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [latestProperties, setLatestProperties] = useState<Property[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<CalendarEvent[]>([]);
  const [activeClients, setActiveClients] = useState<Customer[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeDeals: 0,
    totalRevenue: 0,
    pendingTasks: 0,
    propertyStats: {
      available: 0,
      sold: 0,
      rented: 0
    },
    monthlyComparison: {
      customers: 0,
      deals: 0,
      revenue: 0,
      tasks: 0
    }
  });
  const [, setTaskProgress] = useState<TaskProgress[]>([]);
  const [propertyPerformance, setPropertyPerformance] = useState<PropertyPerformance[]>([]);
  const [timeRange, setTimeRange] = useState('7');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await getDashboardData();
        setStats(data.stats);
        setLatestProperties(data.latestProperties);
        setActiveClients(data.activeClients);
        setUpcomingTasks(data.upcomingTasks);
        setTaskProgress(data.taskProgress);
        setPropertyPerformance(data.propertyPerformance);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#e56e43]"></div>
      </div>
    );
  }

  const renderStatsCard = (
    title: string,
    value: string | number,
    change: number,
    icon: React.ReactNode
  ) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all group">
      <h4 className="text-gray-600 font-medium flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="flex items-center justify-between pt-4">
        <span className="text-3xl font-bold text-[#e56e43] group-hover:scale-105 transition-transform">
          {value}
        </span>
        <div className="flex flex-col items-end">
          <span className={`text-sm flex items-center gap-1 ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-blue-500'
            }`}>
            {change > 0 ? '↑' : change < 0 ? '↓' : '−'}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <h3 className="text-gray-800 text-3xl font-semibold">Dashboard</h3>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderStatsCard(
            "Total Customers",
            stats.totalCustomers,
            stats.monthlyComparison.customers,
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}

          {renderStatsCard(
            "Active Deals",
            stats.activeDeals,
            stats.monthlyComparison.deals,
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}

          {renderStatsCard(
            "Total Revenue",
            `$${stats.totalRevenue.toLocaleString()}`,
            stats.monthlyComparison.revenue,
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}

          {renderStatsCard(
            "Pending Tasks",
            stats.pendingTasks,
            stats.monthlyComparison.tasks,
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          )}
        </div>
      </div>

      {/* Property Status and Performance Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-6">Property Status</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{
              available: stats.propertyStats.available,
              sold: stats.propertyStats.sold,
              rented: stats.propertyStats.rented
            }]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="available" fill="#10B981" />
              <Bar dataKey="sold" fill="#3B82F6" />
              <Bar dataKey="rented" fill="#e56e43" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-semibold text-gray-800">Property Performance</h4>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={propertyPerformance}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#e56e43" strokeWidth={2} />
              <Line type="monotone" dataKey="inquiries" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-gray-800">Recent Properties</h4>
          <Link to="/properties" className="text-[#e56e43] hover:text-[#e56e43]/80">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestProperties.map(property => {
            // Handle image source correctly - it might be a CloudinaryImage object or a string
            const imageSource = property.media?.images?.[0];
            const imageUrl = typeof imageSource === 'string' ? imageSource : imageSource?.url || '';

            // Ensure we have a valid property ID
            const propertyId = property.id || property._id;

            return (
              <Link
                key={propertyId}
                to={`/properties/${propertyId}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
                data-discover="true"
              >
                <img
                  src={imageUrl}
                  alt={property.title || 'Property image'}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h5 className="font-semibold text-gray-800">{property.title}</h5>
                  <p className="text-gray-600 text-sm mt-1">{property.location?.address || 'Address not available'}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[#e56e43] font-bold">${(property.price || 0).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${property.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {property.status || 'Status unknown'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md divide-y">
          {upcomingTasks.map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-800">{task.title}</h5>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${task.type === 'Visit'
                  ? 'bg-[#e56e43]/10 text-[#e56e43]'
                  : 'bg-blue-100 text-blue-800'
                  }`}>
                  {task.type}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {new Date(task.start).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Clients */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-gray-800">Active Clients</h4>
          <Link to="/customers" className="text-[#e56e43] hover:text-[#e56e43]/80">View all</Link>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {activeClients.map(client => (
              <div key={client.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}`}
                    alt={client.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {client.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {client.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last active: {new Date(client.lastInteraction || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {client.propertiesViewed || 0}
                      </span>
                      <p className="text-xs text-gray-500">Properties</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
