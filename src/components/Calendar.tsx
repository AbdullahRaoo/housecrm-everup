import { useCallback, useMemo, useState } from 'react';
import { CalendarEvent, ViewType } from '../types/calendar';

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: (date: Date) => void;
}

export function Calendar({ events, onEventClick, onAddEvent }: CalendarProps) {
  const [view, setView] = useState<ViewType>('Week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation functions
  const navigateToday = () => setCurrentDate(new Date());

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(current => {
      const newDate = new Date(current);
      switch (view) {
        case 'Day':
          newDate.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
          break;
        case 'Week':
          newDate.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'Month':
          newDate.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
          break;
      }
      return newDate;
    });
  }, [view]);

  // Calculate days to display based on view
  const daysToShow = useMemo(() => {
    const days = [];
    const startDate = new Date(currentDate);

    if (view === 'Day') {
      days.push(new Date(startDate));
    } else if (view === 'Week') {
      startDate.setDate(currentDate.getDate() - currentDate.getDay());
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        days.push(day);
      }
    } else if (view === 'Month') {
      startDate.setDate(1);
      const monthStart = new Date(startDate);
      monthStart.setDate(1 - monthStart.getDay());

      for (let i = 0; i < 42; i++) {
        const day = new Date(monthStart);
        day.setDate(monthStart.getDate() + i);
        days.push(day);
      }
    }
    return days;
  }, [currentDate, view]);

  // Time slots for day view
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 8; i < 20; i++) { // 8 AM to 8 PM
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Group events by day
  const eventsByDay = useMemo(() => {
    return daysToShow.map(day => ({
      date: day,
      events: events.filter(event => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getDate() === day.getDate() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getFullYear() === day.getFullYear()
        );
      }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    }));
  }, [events, daysToShow]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Visit':
        return 'bg-[#e56e43]/10 border-l-4 border-[#e56e43] text-[#e56e43]';
      case 'Call':
        return 'bg-green-100 border-l-4 border-green-500 text-green-800';
      case 'Email':
        return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800';
      case 'Task':
        return 'bg-purple-100 border-l-4 border-purple-500 text-purple-800';
      default:
        return 'bg-gray-100 border-l-4 border-gray-500 text-gray-800';
    }
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    // Clamp hours to working hours (8 AM to 8 PM)
    const startHour = Math.max(8, Math.min(20, start.getHours()));
    const endHour = Math.max(8, Math.min(20, end.getHours()));

    // Calculate percentages within working hours
    const workingHours = 12; // 8 AM to 8 PM
    const topPercentage = ((startHour - 8) / workingHours) * 100;

    // Calculate height based on duration, but cap it
    const durationHours = (endHour - startHour);
    const heightPercentage = Math.min((durationHours / workingHours) * 100, 100 - topPercentage);

    return {
      top: `${topPercentage}%`,
      height: `${heightPercentage}%`,
    };
  };



  const handleTimeSlotClick = (date: Date, hour: number) => {
    const clickedDate = new Date(date);
    clickedDate.setHours(hour, 0, 0, 0);
    onAddEvent(clickedDate);
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {daysToShow.map((day, index) => (
        <div
          key={day.toISOString()}
          className={`min-h-[120px] bg-white p-2 ${day.getMonth() === currentDate.getMonth() ? '' : 'bg-gray-50'
            }`}
          onClick={() => handleTimeSlotClick(day, 9)}
        >
          <div className={`text-sm ${day.toDateString() === new Date().toDateString()
            ? 'bg-[#e56e43] text-white rounded-full w-7 h-7 flex items-center justify-center'
            : ''
            }`}>
            {day.getDate()}
          </div>
          <div className="mt-2 space-y-1">
            {eventsByDay[index].events.map(event => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                className={`${getEventColor(event.type)} p-1 text-xs rounded truncate cursor-pointer`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderWeekView = () => (
    <div className="grid grid-cols-8 divide-x divide-gray-200">
      <div className="sticky left-0 bg-white z-10">
        <div className="h-16 border-b"></div>
        {timeSlots.map(time => (
          <div key={time} className="h-12 border-b flex items-center justify-center">
            <span className="text-xs text-gray-500">{time}</span>
          </div>
        ))}
      </div>

      {eventsByDay.map(({ date, events }) => (
        <div key={date.toISOString()} className="relative">
          <div className="h-16 border-b sticky top-0 bg-white z-10 flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500">
              {date.toLocaleString('default', { weekday: 'short' })}
            </div>
            <div className={`text-xl font-semibold ${date.toDateString() === new Date().toDateString() ? 'text-[#e56e43]' : ''
              }`}>
              {date.getDate()}
            </div>
          </div>

          <div className="relative" style={{ height: 'calc(12 * 12 * 4px)' }}> {/* 12 hours * 12 segments * 4px */}
            {timeSlots.map((time, i) => (
              <div
                key={time}
                className="h-12 border-b relative group cursor-pointer"
                onClick={() => handleTimeSlotClick(date, Math.floor(i + 8))} // Add 8 to start from 8 AM
              >
                <div className="absolute inset-0 group-hover:bg-blue-50/50 transition-colors"></div>
              </div>
            ))}

            {events.map(event => {
              const { top, height } = getEventPosition(event);
              return (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className={`absolute left-1 right-1 rounded-sm shadow-sm cursor-pointer transition-all hover:shadow-md ${getEventColor(event.type)}`}
                  style={{
                    top,
                    height,
                    minHeight: '24px',
                    maxHeight: '100%',
                    zIndex: 10
                  }}
                >
                  <div className="p-1 overflow-hidden">
                    <div className="font-medium text-xs truncate">{event.title}</div>
                    <div className="text-xs opacity-75 truncate">
                      {new Date(event.start).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
       <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-[#e56e43] to-[#e56e43]/90">
        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
            {(['Day', 'Week', 'Month'] as ViewType[]).map(viewType => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-4 py-2 rounded-md transition-all ${view === viewType
                  ? 'bg-white text-[#e56e43] shadow'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                {viewType}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-white">
            <button
              onClick={() => navigate('prev')}
              className="hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={navigateToday}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-all"
            >
              Today
            </button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {currentDate.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
                ...(view === 'Day' && { day: 'numeric' })
              })}
            </span>
            <button
              onClick={() => navigate('next')}
              className="hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={() => onAddEvent(currentDate)}
          className="flex items-center gap-2 bg-white text-[#e56e43] px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Event
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {view === 'Month' ? renderMonthView() : renderWeekView()}
      </div>
    </div>
  );
}
