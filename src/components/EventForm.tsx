import { useState } from 'react';
import { CalendarEvent, EventType } from '../types/calendar';

interface EventFormProps {
  event?: CalendarEvent | null;
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>({
    title: event?.title || '',
    type: event?.type || 'Task',
    start: event?.start || '',
    end: event?.end || '',
    description: event?.description || '',
    propertyId: event?.propertyId || '',
    customerId: event?.customerId || '',
    status: event?.status || 'Pending',
    deadline: event?.deadline || '',
    isGoogleCalendarSync: event?.isGoogleCalendarSync || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = `mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200
  focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
  transition-colors duration-200 bg-white text-gray-800
  placeholder-gray-400 shadow-sm`;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold text-[#e56e43] mb-4">
        {event ? 'Edit Event' : 'Add Event'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Type</label>
          <select
            value={formData.type}
            onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as EventType }))}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            <option value="Visit">Visit</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Task">Task</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Start</label>
            <input
              type="datetime-local"
              value={formData.start}
              onChange={e => setFormData(prev => ({ ...prev, start: e.target.value }))}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">End</label>
            <input
              type="datetime-local"
              value={formData.end}
              onChange={e => setFormData(prev => ({ ...prev, end: e.target.value }))}
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className={`${inputClasses} resize-none`}
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isGoogleCalendarSync}
            onChange={e => setFormData(prev => ({ ...prev, isGoogleCalendarSync: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-[#e56e43]
            focus:ring-[#e56e43] focus:ring-offset-0"
          />
          <label className="ml-2 text-sm text-gray-700">
            Sync with Google Calendar
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50
          transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#e56e43] text-white rounded-lg
          hover:bg-[#e56e43]/90 transition-colors duration-200 font-medium"
        >
          {event ? 'Update' : 'Add'} Event
        </button>
      </div>
    </form>
  );
}
