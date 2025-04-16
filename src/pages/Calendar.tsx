/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Calendar } from '../components/Calendar';
import { EventForm } from '../components/EventForm';
import { useAuth } from '../hooks/useAuth';
import { calendarApi } from '../services/api'; // Import API service
import { CalendarEvent, EventType } from '../types/calendar';

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'All'>('All');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    loadEvents();
  }, [token]);

  // Load events from API
  const loadEvents = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const fetchedEvents = await calendarApi.getEvents(token);
      // Transform MongoDB _id to id if needed
      const formattedEvents = fetchedEvents.map(event => ({
        ...event,
        id: event.id || event._id
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = (date?: Date) => {
    const defaultDate = date || new Date();
    const endDate = new Date(defaultDate);
    endDate.setHours(endDate.getHours() + 1);

    // Create an empty event with default values
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventSubmit = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!token) {
      alert('You must be logged in to save events');
      return;
    }

    try {
      if (selectedEvent) {
        // Update existing event
        const updatedEvent = await calendarApi.updateEvent(
          selectedEvent.id,
          eventData,
          token
        );
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...updatedEvent, id: updatedEvent.id || updatedEvent._id } : e));
      } else {
        // Add new event
        const newEvent = await calendarApi.addEvent(eventData, token);
        setEvents(prev => [...prev, { ...newEvent, id: newEvent.id || newEvent._id }]);
      }
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save the event. Please try again.');
    }
  };

  const handleEventDelete = async (eventId: string) => {
    if (!token) {
      alert('You must be logged in to delete events');
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarApi.deleteEvent(eventId, token);
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setShowEventModal(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete the event. Please try again.');
      }
    }
  };

  // Function to handle export
  const handleExport = async (format: 'excel' | 'csv') => {
    if (!user?.isAdmin) {
      alert('You need admin access to export calendar data.');
      return;
    }

    try {
      setIsExporting(true);

      if (!token) {
        throw new Error('Authentication token required');
      }

      // Get the blob using our API service
      let blob: Blob;
      if (format === 'excel') {
        blob = await calendarApi.exportExcel(token);
      } else {
        blob = await calendarApi.exportCsv(token);
      }

      // Create a download link for the blob
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar_events.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      alert(`Failed to export calendar as ${format}. Please try again.`);
      setIsExporting(false);
    }
  };

  const filteredEvents = events.filter(event =>
    filterType === 'All' || event.type === filterType
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>
        <div className="flex gap-3">
          {/* Export buttons - only visible to admins */}
          {user?.isAdmin && (
            <div className="flex gap-2 mr-4">
              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className={`${isExporting ? 'bg-green-400' : 'bg-green-600'} text-white px-4 py-2 rounded-lg
                  hover:bg-green-700 transition-colors duration-200
                  font-medium shadow-sm flex items-center gap-1`}
              >
                {isExporting ? (
                  <span className="animate-pulse">Exporting...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Excel
                  </>
                )}
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className={`${isExporting ? 'bg-blue-400' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg
                  hover:bg-blue-700 transition-colors duration-200
                  font-medium shadow-sm flex items-center gap-1`}
              >
                {isExporting ? (
                  <span className="animate-pulse">Exporting...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </>
                )}
              </button>
            </div>
          )}

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventType | 'All')}
            className="px-4 py-2 rounded-lg border border-gray-200
              focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
              transition-colors duration-200 bg-white text-gray-800
              shadow-sm appearance-none cursor-pointer"
          >
            <option value="All">All Events</option>
            <option value="Visit">Visits</option>
            <option value="Call">Calls</option>
            <option value="Email">Emails</option>
            <option value="Task">Tasks</option>
          </select>
          <button
            onClick={() => handleAddEvent()}
            className="bg-[#e56e43] text-white px-6 py-2 rounded-lg
              hover:bg-[#e56e43]/90 transition-colors duration-200
              font-medium shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Event
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-t-[#e56e43] border-r-[#e56e43]/30 border-b-[#e56e43]/30 border-l-[#e56e43]/30 rounded-full animate-spin"></div>
        </div>
      ) : (
        <Calendar
          events={filteredEvents}
          onEventClick={handleEventClick}
          onAddEvent={handleAddEvent}
        />
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedEvent ? 'Edit Event' : 'Add Event'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-700
                    transition-colors duration-200 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EventForm
                event={selectedEvent}
                onSubmit={handleEventSubmit}
                onCancel={() => setShowEventModal(false)}
              />
              {selectedEvent && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleEventDelete(selectedEvent.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg
                      hover:bg-red-600 transition-colors duration-200
                      font-medium shadow-sm"
                  >
                    Delete Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
