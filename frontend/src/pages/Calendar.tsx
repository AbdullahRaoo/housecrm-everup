/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { EventForm } from '../components/EventForm';
import { useAuth } from '../hooks/useAuth';
import { calendarApi } from '../services/api'; // Import API service
import { CalendarEvent, EventType } from '../types/calendar';
import { Customer } from '../types/customer';

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'All'>('All');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'all' | 'byCustomer'>('all');
  const { user, token } = useAuth();

  useEffect(() => {
    loadEvents();
    loadCustomers();
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

  // Load customers for filtering events
  const loadCustomers = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const fetchedCustomers = await response.json();
        // Ensure each customer has an id property (convert MongoDB _id if needed)
        const processedCustomers = fetchedCustomers.map((customer: any) => ({
          ...customer,
          id: customer.id || customer._id
        }));
        setCustomers(processedCustomers);
        console.log("Loaded customers:", processedCustomers);
      } else {
        console.error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleAddEvent = (status?: string, customerId?: string) => {
    // Create an empty event with default values and optional status/customer
    setSelectedEvent({
      id: '',
      title: '',
      type: 'Task',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(), // +1 hour
      status: (status as "Pending" | "Completed" | "Cancelled") || "Pending",
      customerId: customerId
    });
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
      if (selectedEvent?.id) {
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
    (filterType === 'All' || event.type === filterType)
  );

  // Group events by status
  const eventsByStatus = useMemo(() => {
    const grouped = {
      Requested: filteredEvents.filter(event => event.status === 'Pending' && !event.customerId),
      InProgress: filteredEvents.filter(event => event.status === 'Pending' && event.customerId),
      InReview: filteredEvents.filter(event => event.status === 'Pending' && new Date(event.deadline || '') < new Date()),
      Completed: filteredEvents.filter(event => event.status === 'Completed')
    };
    return grouped;
  }, [filteredEvents]);

  // Group events by customer
  const eventsByCustomer = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};

    customers.forEach(customer => {
      const customerEvents = filteredEvents.filter(event =>
        event.customerId === customer.id
      );
      if (customerEvents.length > 0) {
        grouped[customer.id] = customerEvents;
      }
    });

    // Add unassigned events group
    const unassignedEvents = filteredEvents.filter(event => !event.customerId);
    if (unassignedEvents.length > 0) {
      grouped['unassigned'] = unassignedEvents;
    }

    return grouped;
  }, [filteredEvents, customers]);

  // Find customer name by ID
  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'Sin asignar';
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Cliente desconocido';
  };

  // Get priority class based on deadline
  const getPriorityClass = (event: CalendarEvent) => {
    if (!event.deadline) return 'bg-gray-200 text-gray-800';

    const deadlineDate = new Date(event.deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-500 text-white';
    if (diffDays < 3) return 'bg-orange-500 text-white';
    if (diffDays < 7) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  // Get event icon
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'Visit':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'Call':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'Email':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  // Render task card
  const renderTaskCard = (event: CalendarEvent) => {
    const icon = getEventIcon(event.type);
    const date = new Date(event.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const priorityClass = getPriorityClass(event);
    const isCompleted = event.status === 'Completed';

    return (
      <div
        key={event.id}
        onClick={() => handleEventClick(event)}
        className="bg-white rounded-lg shadow p-4 mb-3 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {isCompleted && (
                <span className="mr-2 text-green-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              <h3 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {event.title}
              </h3>
            </div>
            {event.customerId && (
              <div className="text-sm text-gray-500 mb-2">
                {getCustomerName(event.customerId)}
              </div>
            )}
            <div className="flex items-center text-xs text-gray-500">
              <span className="flex items-center mr-3">
                {icon}
                <span className="ml-1">{event.type}</span>
              </span>
              {date && <span>{date}</span>}
            </div>
          </div>
          <div className="ml-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${priorityClass}`}>
              {event.deadline ? new Date(event.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Sin fecha límite'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render column for Kanban view
  const renderColumn = (title: string, events: CalendarEvent[], status: string) => {
    return (
      <div className="flex-1 min-w-[300px] max-w-[400px] bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            {title}
            <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {events.length}
            </span>
          </h2>
          <button
            onClick={() => handleAddEvent(status)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {events.map(event => renderTaskCard(event))}
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay tareas en esta columna
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render customer column for Customers view
  const renderCustomerColumn = (customerId: string, events: CalendarEvent[]) => {
    const customerName = getCustomerName(customerId);

    return (
      <div key={customerId} className="flex-1 min-w-[300px] max-w-[400px] bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            {customerName}
            <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {events.length}
            </span>
          </h2>
          <button
            onClick={() => handleAddEvent("Pending", customerId === 'unassigned' ? undefined : customerId)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {events.map(event => renderTaskCard(event))}
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay tareas para este cliente
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de tareas</h1>
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
                  <span className="animate-pulse">Exportando...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Excel
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
                  <span className="animate-pulse">Exportando...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar CSV
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveView('all')}
              className={`px-4 py-2 text-sm font-medium ${activeView === 'all'
                ? 'bg-[#e56e43] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Por estado
            </button>
            <button
              onClick={() => setActiveView('byCustomer')}
              className={`px-4 py-2 text-sm font-medium ${activeView === 'byCustomer'
                ? 'bg-[#e56e43] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Por cliente
            </button>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventType | 'All')}
            className="px-4 py-2 rounded-lg border border-gray-200
              focus:border-[#e56e43] focus:ring-2 focus:ring-[#e56e43]/20
              transition-colors duration-200 bg-white text-gray-800
              shadow-sm appearance-none cursor-pointer"
          >
            <option value="All">Todas las tareas</option>
            <option value="Visit">Visitas</option>
            <option value="Call">Llamadas</option>
            <option value="Email">Emails</option>
            <option value="Task">Tareas</option>
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
            Agregar tarea
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-t-[#e56e43] border-r-[#e56e43]/30 border-b-[#e56e43]/30 border-l-[#e56e43]/30 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {activeView === 'all' ? (
            <div className="flex gap-4 overflow-x-auto pb-6">
              {renderColumn('Solicitadas', eventsByStatus.Requested, 'Pending')}
              {renderColumn('En progreso', eventsByStatus.InProgress, 'Pending')}
              {renderColumn('En revisión', eventsByStatus.InReview, 'Pending')}
              {renderColumn('Completadas', eventsByStatus.Completed, 'Completed')}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-6">
              {Object.entries(eventsByCustomer).map(([customerId, events]) =>
                renderCustomerColumn(customerId, events)
              )}
            </div>
          )}
        </>
      )}

      {/* Modal container with improved overflow handling */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedEvent?.id ? 'Editar tarea' : 'Agregar tarea'}
              </h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700
                  transition-colors duration-200 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <EventForm
                event={selectedEvent}
                onSubmit={handleEventSubmit}
                onCancel={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                customers={customers}
              />
            </div>
            {selectedEvent?.id && (
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => handleEventDelete(selectedEvent.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg
                    hover:bg-red-600 transition-colors duration-200
                    font-medium shadow-sm"
                >
                  Eliminar tarea
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
