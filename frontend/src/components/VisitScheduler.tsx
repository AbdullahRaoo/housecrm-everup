import { useState } from 'react';

interface VisitSchedulerProps {
  propertyId: string;
  onSchedule: (visit: PropertyVisit) => void;
}

interface PropertyVisit {
  id: string;
  propertyId: string;
  date: string;
  time: string;
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

  const inputClasses = `mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200
    focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
    transition-colors duration-200 bg-white text-gray-800
    placeholder-gray-400 shadow-sm`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-[#e56e43] mb-6">Schedule a Visit</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Date</label>
            <input
              type="date"
              value={visitData.date}
              onChange={e => setVisitData(prev => ({ ...prev, date: e.target.value }))}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Time</label>
            <input
              type="time"
              value={visitData.time}
              onChange={e => setVisitData(prev => ({ ...prev, time: e.target.value }))}
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Client Name</label>
          <input
            type="text"
            value={visitData.clientName}
            onChange={e => setVisitData(prev => ({ ...prev, clientName: e.target.value }))}
            className={inputClasses}
            placeholder="Enter client's full name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Client Email</label>
            <input
              type="email"
              value={visitData.clientEmail}
              onChange={e => setVisitData(prev => ({ ...prev, clientEmail: e.target.value }))}
              className={inputClasses}
              placeholder="client@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Client Phone</label>
            <input
              type="tel"
              value={visitData.clientPhone}
              onChange={e => setVisitData(prev => ({ ...prev, clientPhone: e.target.value }))}
              className={inputClasses}
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Notes</label>
          <textarea
            value={visitData.notes}
            onChange={e => setVisitData(prev => ({ ...prev, notes: e.target.value }))}
            className={`${inputClasses} resize-none`}
            rows={3}
            placeholder="Add any additional notes or requirements"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#e56e43] text-white py-3 px-4 rounded-lg
            hover:bg-[#e56e43]/90 transition-colors duration-200
            font-medium shadow-sm"
        >
          Schedule Visit
        </button>
      </form>
    </div>
  );
}
