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

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">{event ? 'Edit Event' : 'Add Event'}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as EventType }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Visit">Visit</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Task">Task</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start</label>
            <input
              type="datetime-local"
              value={formData.start}
              onChange={e => setFormData(prev => ({ ...prev, start: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End</label>
            <input
              type="datetime-local"
              value={formData.end}
              onChange={e => setFormData(prev => ({ ...prev, end: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isGoogleCalendarSync}
            onChange={e => setFormData(prev => ({ ...prev, isGoogleCalendarSync: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Sync with Google Calendar
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {event ? 'Update' : 'Add'} Event
        </button>
      </div>
    </form>
  );
}
