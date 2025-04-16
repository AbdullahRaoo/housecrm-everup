/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Calendar } from '../components/Calendar';
import { EventForm } from '../components/EventForm';
import { useAuth } from '../hooks/useAuth';
import { calendarApi } from '../services/api'; // Import API service
import { createStorageService, StorageKeys } from '../services/storage';
import { CalendarEvent, EventType } from '../types/calendar';

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'All'>('All');
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const eventStorage = createStorageService<CalendarEvent>(StorageKeys.EVENTS);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const storedEvents = await eventStorage.getAll();
        if (Array.isArray(storedEvents) && storedEvents.length > 0) {
          setEvents(storedEvents);
        } else {
          // Add some mock events if none exist
          const mockEvents: Omit<CalendarEvent, 'id'>[] = [
            {
              title: 'Property Viewing',
              type: 'Visit',
              start: new Date(2024, 1, 15, 10, 0).toISOString(),
              end: new Date(2024, 1, 15, 11, 0).toISOString(),
              description: 'Show luxury apartment to potential client',
              status: 'Pending',
              propertyId: '1',
              isGoogleCalendarSync: true
            },
            {
              title: 'Client Call',
              type: 'Call',
              start: new Date(2024, 1, 15, 14, 0).toISOString(),
              end: new Date(2024, 1, 15, 14, 30).toISOString(),
              description: 'Follow up on property inquiry',
              status: 'Pending',
              customerId: '1',
              isGoogleCalendarSync: false
            }
          ];

          for (const event of mockEvents) {
            await eventStorage.add(event);
          }

          setEvents(mockEvents.map(event => ({
            ...event,
            id: Math.random().toString(36).substring(2, 9)
          })));
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]); // Fallback to an empty array in case of error
      }
    };

    loadEvents();
  }, []);

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventSubmit = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const updatedEvent = await eventStorage.update(selectedEvent.id, {
          ...eventData,
          id: selectedEvent.id
        });
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      } else {
        // Add new event
        const newEvent = await eventStorage.add(eventData);
        setEvents(prev => [...prev, newEvent]);
      }
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save the event. Please try again.');
    }
  };

  const handleEventDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventStorage.delete(eventId);
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

      // In a production app, you would get the token from your auth system
      const token = 'admin-token'; // Mock admin token

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
            onClick={handleAddEvent}
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

      <Calendar
        events={filteredEvents}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
      />

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
