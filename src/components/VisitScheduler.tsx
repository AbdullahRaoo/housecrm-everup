import { useState } from 'react';

interface VisitSchedulerProps {
  propertyId: string;
  onSchedule: (visit: PropertyVisit) => void;
}

interface PropertyVisit {
  id: string;
  propertyId: string;
  date: string;
  time: string; // Add this field
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export function VisitScheduler({ propertyId, onSchedule }: VisitSchedulerProps) {
  const [visitData, setVisitData] = useState<Omit<PropertyVisit, 'id'>>({
    propertyId,
    date: '',
    time: '',
    clientId: Math.random().toString(36).substring(2, 9),
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    status: 'Scheduled',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      ...visitData,
      id: Math.random().toString(36).substring(2, 9)
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Schedule a Visit</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={visitData.date}
              onChange={e => setVisitData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              value={visitData.time}
              onChange={e => setVisitData(prev => ({ ...prev, time: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            value={visitData.clientName}
            onChange={e => setVisitData(prev => ({ ...prev, clientName: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Email</label>
            <input
              type="email"
              value={visitData.clientEmail}
              onChange={e => setVisitData(prev => ({ ...prev, clientEmail: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Phone</label>
            <input
              type="tel"
              value={visitData.clientPhone}
              onChange={e => setVisitData(prev => ({ ...prev, clientPhone: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={visitData.notes}
            onChange={e => setVisitData(prev => ({ ...prev, notes: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Schedule Visit
        </button>
      </form>
    </div>
  );
}
