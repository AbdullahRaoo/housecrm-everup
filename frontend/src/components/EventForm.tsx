import { useEffect, useState } from 'react';
import { CalendarEvent, EventType } from '../types/calendar';
import { Customer } from '../types/customer';

interface EventFormProps {
  event?: CalendarEvent | null;
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => void;
  onCancel: () => void;
  customers?: Customer[];
}

export function EventForm({ event, onSubmit, onCancel, customers = [] }: EventFormProps) {
  // Format a date string or Date object to the format required by datetime-local input
  const formatDateForInput = (dateStr?: string | Date): string => {
    if (!dateStr) return '';

    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    // Check if it's a valid date
    if (isNaN(date.getTime())) return '';

    // Format to YYYY-MM-DDThh:mm
    return date.toISOString().slice(0, 16);
  };

  // Format a date string or Date object to the format required by date input
  const formatDateOnlyForInput = (dateStr?: string | Date): string => {
    if (!dateStr) return '';

    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    // Check if it's a valid date
    if (isNaN(date.getTime())) return '';

    // Format to YYYY-MM-DD
    return date.toISOString().slice(0, 10);
  };

  // Generate default end time (1 hour after start time)
  const getDefaultEndTime = (): Date => {
    const defaultEnd = new Date();
    defaultEnd.setHours(defaultEnd.getHours() + 1);
    return defaultEnd;
  };

  // Generate default deadline (3 days from now)
  const getDefaultDeadline = (): Date => {
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 3);
    return defaultDeadline;
  };

  // Log the customers prop to verify it's properly populated
  useEffect(() => {
    console.log('Customers data:', customers);
  }, [customers]);

  // Debug customer data on component mount
  useEffect(() => {
    if (customers && customers.length > 0) {
      console.log('Available customers in EventForm:', customers);
    }
  }, [customers]);

  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>({
    title: event?.title || '',
    type: event?.type || 'Task',
    start: event?.start || new Date().toISOString(),
    end: event?.end || getDefaultEndTime().toISOString(),
    description: event?.description || '',
    propertyId: event?.propertyId || undefined,
    customerId: event?.customerId || undefined,
    status: event?.status || 'Pending',
    deadline: event?.deadline || getDefaultDeadline().toISOString(),
    isGoogleCalendarSync: event?.isGoogleCalendarSync || false
  });

  // Format the dates for display in the form inputs
  const [startDateInput, setStartDateInput] = useState(formatDateForInput(event?.start || new Date()));
  const [endDateInput, setEndDateInput] = useState(formatDateForInput(event?.end || getDefaultEndTime()));
  const [deadlineInput, setDeadlineInput] = useState(formatDateOnlyForInput(event?.deadline || getDefaultDeadline()));

  // Update the form when the selected event changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        type: event.type || 'Task',
        start: event.start || new Date().toISOString(),
        end: event.end || getDefaultEndTime().toISOString(),
        description: event.description || '',
        propertyId: event.propertyId || undefined,
        customerId: event.customerId || undefined,
        status: event.status || 'Pending',
        deadline: event.deadline || getDefaultDeadline().toISOString(),
        isGoogleCalendarSync: event.isGoogleCalendarSync || false
      });

      setStartDateInput(formatDateForInput(event.start));
      setEndDateInput(formatDateForInput(event.end));
      setDeadlineInput(formatDateOnlyForInput(event.deadline || getDefaultDeadline()));
    } else {
      // New event - set default values
      const now = new Date();
      const end = new Date(now);
      end.setHours(end.getHours() + 1);
      const deadline = getDefaultDeadline();

      setFormData({
        title: '',
        type: 'Task',
        start: now.toISOString(),
        end: end.toISOString(),
        description: '',
        propertyId: undefined,
        customerId: undefined,
        status: 'Pending',
        deadline: deadline.toISOString(),
        isGoogleCalendarSync: false
      });

      setStartDateInput(formatDateForInput(now));
      setEndDateInput(formatDateForInput(end));
      setDeadlineInput(formatDateOnlyForInput(deadline));
    }
  }, [event]);

  // Debug the formData state changes
  useEffect(() => {
    console.log('Current formData:', formData);
  }, [formData]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setStartDateInput(dateValue);

    if (dateValue) {
      // Convert local datetime-local value to ISO string
      const date = new Date(dateValue);
      setFormData(prev => ({ ...prev, start: date.toISOString() }));

      // If end date is before start date, update end date
      const endDate = new Date(formData.end);
      if (endDate < date) {
        const newEndDate = new Date(date);
        newEndDate.setHours(date.getHours() + 1);
        setEndDateInput(formatDateForInput(newEndDate));
        setFormData(prev => ({ ...prev, end: newEndDate.toISOString() }));
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setEndDateInput(dateValue);

    if (dateValue) {
      // Convert local datetime-local value to ISO string
      const date = new Date(dateValue);
      setFormData(prev => ({ ...prev, end: date.toISOString() }));
    }
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setDeadlineInput(dateValue);

    if (dateValue) {
      // Convert local date value to ISO string
      const date = new Date(dateValue);
      setFormData(prev => ({ ...prev, deadline: date.toISOString() }));
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('Customer selected:', value);

    // If value is empty, set to undefined
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        customerId: undefined
      }));
      return;
    }

    // Otherwise, set the customer ID directly
    setFormData(prev => ({
      ...prev,
      customerId: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that end date is after start date
    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);

    if (endDate <= startDate) {
      alert('End time must be after start time');
      return;
    }

    // Log the form data before submitting
    console.log('Submitting form data:', formData);
    onSubmit(formData);
  };

  const inputClasses = `mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200
  focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
  transition-colors duration-200 bg-white text-gray-800
  placeholder-gray-400 shadow-sm`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className={inputClasses}
          required
          placeholder="Task title"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Type</label>
          <select
            value={formData.type}
            onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as EventType }))}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            <option key="visit-type" value="Visit">Visit</option>
            <option key="call-type" value="Call">Call</option>
            <option key="email-type" value="Email">Email</option>
            <option key="task-type" value="Task">Task</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as "Pending" | "Completed" | "Cancelled" }))}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            <option key="pending-status" value="Pending">Pending</option>
            <option key="completed-status" value="Completed">Completed</option>
            <option key="cancelled-status" value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Customer</label>
        <select
          value={formData.customerId || ''}
          onChange={handleCustomerChange}
          className={`${inputClasses} appearance-none cursor-pointer`}
        >
          <option key="unassigned-customer" value="">Unassigned</option>
          {customers.map((customer, index) => (
            <option
              key={`customer-index-${index}`}
              value={customer.id || ''}
            >
              {customer.name || 'Unnamed Customer'}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Start</label>
          <input
            type="datetime-local"
            value={startDateInput}
            onChange={handleStartDateChange}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">End</label>
          <input
            type="datetime-local"
            value={endDateInput}
            onChange={handleEndDateChange}
            className={inputClasses}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Deadline</label>
        <input
          type="date"
          value={deadlineInput}
          onChange={handleDeadlineChange}
          className={inputClasses}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={`${inputClasses} resize-none`}
          rows={2}
          placeholder="Add description or notes"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.isGoogleCalendarSync}
          onChange={e => setFormData(prev => ({ ...prev, isGoogleCalendarSync: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-300 text-[#e56e43]
          focus:ring-[#e56e43] focus:ring-offset-0"
          id="googleSync"
        />
        <label htmlFor="googleSync" className="ml-2 text-sm text-gray-700 select-none">
          Sync with Google Calendar
        </label>
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
          {event?.id ? 'Update' : 'Add'} Task
        </button>
      </div>
    </form>
  );
}
