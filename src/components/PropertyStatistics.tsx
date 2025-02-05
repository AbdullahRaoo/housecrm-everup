import { Property } from '../types/property';

interface PropertyStatisticsProps {
  property: Property;
}

export function PropertyStatistics({ property }: PropertyStatisticsProps) {
  const visitsByStatus = property.visits.reduce((acc, visit) => {
    acc[visit.status] = (acc[visit.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-[#e56e43] mb-6">Property Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-4">Overview</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Views</span>
              <span className="font-medium text-[#e56e43]">{property.statistics.views}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Inquiries</span>
              <span className="font-medium text-[#e56e43]">{property.statistics.inquiries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Visits</span>
              <span className="font-medium text-[#e56e43]">{property.statistics.visits}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-4">Visits by Status</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Scheduled</span>
              <span className="font-medium text-[#e56e43]">{visitsByStatus['Scheduled'] || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium text-[#e56e43]">{visitsByStatus['Completed'] || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-medium text-[#e56e43]">{visitsByStatus['Cancelled'] || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-800 mb-4">Recent Activity</h4>
        <div className="space-y-4">
          {property.visits.slice(0, 5).map(visit => (
            <div key={visit.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{visit.clientName}</p>
                <p className="text-sm text-gray-500">{new Date(visit.date).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                visit.status === 'Completed'
                  ? 'bg-[#e56e43]/10 text-[#e56e43]'
                  : visit.status === 'Cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-[#e56e43]/10 text-[#e56e43]'
              }`}>
                {visit.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
