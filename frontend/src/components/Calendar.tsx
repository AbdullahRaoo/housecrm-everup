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
        return {
          className: 'bg-[#e56e43]/10 border-l-4 border-[#e56e43] text-[#e56e43] hover:bg-[#e56e43]/20',
          icon: (
            <svg className="w-3 h-3 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        };
      case 'Call':
        return {
          className: 'bg-blue-100 border-l-4 border-blue-500 text-blue-800 hover:bg-blue-200',
          icon: (
            <svg className="w-3 h-3 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          )
        };
      case 'Email':
        return {
          className: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 hover:bg-yellow-200',
          icon: (
            <svg className="w-3 h-3 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        };
      case 'Task':
        return {
          className: 'bg-purple-100 border-l-4 border-purple-500 text-purple-800 hover:bg-purple-200',
          icon: (
            <svg className="w-3 h-3 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )
        };
      default:
        return {
          className: 'bg-gray-100 border-l-4 border-gray-500 text-gray-800 hover:bg-gray-200',
          icon: (
            <svg className="w-3 h-3 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const getEventPosition = (event: CalendarEvent, eventsInSameTimeSlot = 1, eventIndex = 0) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    // Get hours and minutes for more precise positioning
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();

    // Clamp hours to working hours (8 AM to 8 PM)
    const clampedStartHour = Math.max(8, Math.min(20, startHour));
    const clampedEndHour = Math.max(8, Math.min(20, endHour));

    // Calculate percentages within working hours (including minutes)
    const workingHours = 12; // 8 AM to 8 PM
    const startPercentage = ((clampedStartHour - 8) + (startMinute / 60)) / workingHours * 100;

    // Calculate end percentage including minutes
    const endPercentage = ((clampedEndHour - 8) + (endMinute / 60)) / workingHours * 100;

    // Calculate height based on duration
    const heightPercentage = Math.max(4, Math.min(endPercentage - startPercentage, 100 - startPercentage));

    // Handle overlapping events by adjusting width and left position
    const width = eventsInSameTimeSlot > 1 ? `${90 / eventsInSameTimeSlot}%` : '95%';
    const left = eventsInSameTimeSlot > 1 ? `${(90 / eventsInSameTimeSlot) * eventIndex}%` : '2.5%';

    return {
      top: `${startPercentage}%`,
      height: `${heightPercentage}%`,
      width,
      left
    };
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const clickedDate = new Date(date);
    clickedDate.setHours(hour, 0, 0, 0);
    onAddEvent(clickedDate);
  };

  const renderMonthView = () => (
    <>
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {daysToShow.map((day, index) => (
          <div
            key={day.toISOString()}
            className={`min-h-[120px] bg-white p-1 ${day.getMonth() === currentDate.getMonth()
              ? 'bg-white'
              : 'bg-gray-50 text-gray-400'
              } hover:bg-gray-50 transition-colors`}
            onClick={() => handleTimeSlotClick(day, 9)}
          >
            {/* Day number with today highlight */}
            <div className="flex justify-between items-center mb-1">
              <div className={`w-7 h-7 flex items-center justify-center rounded-full ${day.toDateString() === new Date().toDateString()
                  ? 'bg-[#e56e43] text-white font-medium'
                  : ''
                }`}>
                {day.getDate()}
              </div>

              {/* Add event button shown on hover */}
              <button
                className="w-5 h-5 bg-gray-100 rounded-full text-gray-500 hover:bg-[#e56e43] hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTimeSlotClick(day, 9);
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Events list */}
            <div className="space-y-1 overflow-y-auto max-h-[90px]">
              {eventsByDay[index].events.slice(0, 3).map(event => {
                const eventStyle = getEventColor(event.type);
                const startTime = new Date(event.start).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });

                return (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`${eventStyle.className} p-1 text-xs rounded cursor-pointer group transition-all`}
                  >
                    <div className="flex items-center">
                      {eventStyle.icon}
                      <span className="truncate flex-1">{event.title}</span>
                    </div>
                    <div className="text-xs opacity-60 pl-4 pt-0.5">
                      {startTime}
                    </div>
                  </div>
                );
              })}

              {/* Show count if there are more events */}
              {eventsByDay[index].events.length > 3 && (
                <div
                  className="text-xs text-center p-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    // When clicked, we could show a modal with all events
                    const moreEvents = eventsByDay[index].events.slice(3);
                    // For now, just show the first one as if clicked
                    if (moreEvents.length > 0) {
                      onEventClick(moreEvents[0]);
                    }
                  }}
                >
                  +{eventsByDay[index].events.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderWeekView = () => {
    // Group overlapping events to manage their positioning
    const processEventsForWeekView = (dayEvents: CalendarEvent[]) => {
      // Group events by time range
      const timeGroups: { [key: string]: CalendarEvent[] } = {};

      dayEvents.forEach(event => {
        const startHour = new Date(event.start).getHours();
        const key = `hour-${startHour}`;
        if (!timeGroups[key]) {
          timeGroups[key] = [];
        }
        timeGroups[key].push(event);
      });

      // Process each event with its position info
      return dayEvents.map(event => {
        const startHour = new Date(event.start).getHours();
        const key = `hour-${startHour}`;
        const eventsInSameSlot = timeGroups[key].length;
        const eventIndex = timeGroups[key].indexOf(event);

        return {
          event,
          position: getEventPosition(event, eventsInSameSlot, eventIndex)
        };
      });
    };

    return (
      <div className="grid grid-cols-8 divide-x divide-gray-200">
        {/* Time labels column */}
        <div className="sticky left-0 bg-white z-10">
          <div className="h-16 border-b"></div>
          {timeSlots.map(time => (
            <div key={time} className="h-12 border-b flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500">{time}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {eventsByDay.map(({ date, events }) => {
          const processedEvents = processEventsForWeekView(events);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div key={date.toISOString()} className="relative">
              {/* Day header */}
              <div className={`h-16 border-b sticky top-0 z-10 ${isToday ? 'bg-orange-50' : 'bg-white'} flex flex-col items-center justify-center`}>
                <div className="text-sm font-medium text-gray-500">
                  {date.toLocaleString('default', { weekday: 'short' })}
                </div>
                <div className={`text-xl font-semibold ${isToday ? 'text-[#e56e43]' : 'text-gray-800'}`}>
                  {date.getDate()}
                </div>
              </div>

              {/* Time slots and events container */}
              <div className="relative" style={{ height: 'calc(12 * 12 * 4px)' }}>
                {/* Time slot backgrounds */}
                {timeSlots.map((time, i) => {
                  const hour = i + 8;
                  const isCurrentHour = new Date().getHours() === hour && date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={time}
                      className={`h-12 border-b relative group cursor-pointer ${isCurrentHour ? 'bg-orange-50/30' : ''}`}
                      onClick={() => handleTimeSlotClick(date, hour)}
                    >
                      <div className="absolute inset-0 group-hover:bg-blue-50/40 transition-colors"></div>
                    </div>
                  );
                })}

                {/* Current time indicator (red line) */}
                {date.toDateString() === new Date().toDateString() && (
                  <div
                    className="absolute left-0 right-0 border-t border-red-500 z-20 pointer-events-none"
                    style={{
                      top: `${((new Date().getHours() - 8) + (new Date().getMinutes() / 60)) / 12 * 100}%`
                    }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full absolute -left-1 -top-1"></div>
                  </div>
                )}

                {/* Events */}
                {processedEvents.map(({ event, position }) => {
                  const eventStyle = getEventColor(event.type);
                  const startTime = new Date(event.start).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const duration = Math.floor((new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60));
                  const showFullDetails = parseInt(position.height) > 10; // Only show details if event is tall enough

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`absolute rounded shadow-sm cursor-pointer transition-all hover:shadow-md ${eventStyle.className}`}
                      style={{
                        top: position.top,
                        height: position.height,
                        width: position.width,
                        left: position.left,
                        minHeight: '18px',
                        zIndex: 10
                      }}
                    >
                      <div className="p-1 h-full overflow-hidden">
                        {/* Event title with icon */}
                        <div className="flex items-center flex-nowrap">
                          {eventStyle.icon}
                          <span className="font-medium text-xs truncate flex-1">{event.title}</span>
                        </div>

                        {/* Show time and duration if event is tall enough */}
                        {showFullDetails && (
                          <div className="text-xs opacity-75 mt-0.5">
                            <div>{startTime}</div>
                            {duration >= 30 && (
                              <div className="text-xs opacity-60">({duration} min)</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
