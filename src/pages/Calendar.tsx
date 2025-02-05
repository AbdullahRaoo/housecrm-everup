/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import { EventForm } from '../components/EventForm';
import { CalendarEvent, EventType } from '../types/calendar';
import { createStorageService, StorageKeys } from '../services/storage';

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'All'>('All');

  const eventStorage = createStorageService<CalendarEvent>(StorageKeys.EVENTS);

  useEffect(() => {
    const loadEvents = () => {
      const storedEvents = eventStorage.getAll();
      if (storedEvents.length === 0) {
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

        mockEvents.forEach(event => eventStorage.add(event));
        setEvents(mockEvents.map(event => ({
          ...event,
          id: Math.random().toString(36).substring(2, 9)
        })));
      } else {
        setEvents(storedEvents);
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

  const handleEventSubmit = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (selectedEvent) {
      // Update existing event
      const updatedEvent = eventStorage.update(selectedEvent.id, {
        ...eventData,
        id: selectedEvent.id
      });
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e));
    } else {
      // Add new event
      const newEvent = eventStorage.add(eventData);
      setEvents(prev => [...prev, newEvent]);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      eventStorage.delete(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  };

  const filteredEvents = events.filter(event =>
    filterType === 'All' || event.type === filterType
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventType | 'All')}
            className="rounded-lg border-gray-300 p-2"
          >
            <option value="All">All Events</option>
            <option value="Visit">Visits</option>
            <option value="Call">Calls</option>
            <option value="Email">Emails</option>
            <option value="Task">Tasks</option>
          </select>
          <button
            onClick={handleAddEvent}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
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
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedEvent ? 'Edit Event' : 'Add Event'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <EventForm
                event={selectedEvent}
                onSubmit={handleEventSubmit}
                onCancel={() => setShowEventModal(false)}
              />
              {selectedEvent && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleEventDelete(selectedEvent.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
