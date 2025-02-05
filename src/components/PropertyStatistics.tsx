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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-6">Property Statistics</h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-4">Overview</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Views</span>
              <span className="font-medium">{property.statistics.views}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Inquiries</span>
              <span className="font-medium">{property.statistics.inquiries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Visits</span>
              <span className="font-medium">{property.statistics.visits}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-4">Visits by Status</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Scheduled</span>
              <span className="font-medium">{visitsByStatus['Scheduled'] || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium">{visitsByStatus['Completed'] || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-medium">{visitsByStatus['Cancelled'] || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-500 mb-4">Recent Activity</h4>
        <div className="space-y-4">
          {property.visits.slice(0, 5).map(visit => (
            <div key={visit.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{visit.clientName}</p>
                <p className="text-sm text-gray-500">{new Date(visit.date).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${visit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  visit.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
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
