import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CalendarEvent } from '../types/calendar';

// Extended CalendarEvent type with read status and update tracking
interface NotificationEvent extends CalendarEvent {
  isRead?: boolean;
  isUpdated?: boolean;
  lastUpdated?: Date;
  updatedAt?: string;
  _id?: string;
  changeType?: 'added' | 'edited' | 'deleted' | 'status_changed';
  changedFields?: string[];
}

function Header() {
  const { logout, user, token } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [taskNotifications, setTaskNotifications] = useState<NotificationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Store task IDs and their updatedAt timestamps
  const taskUpdatesRef = useRef<Record<string, string>>({});

  // Load read status from localStorage on mount
  const readNotificationIdsRef = useRef<Set<string>>(new Set());

  // Fetch recent tasks to show as notifications
  const fetchTaskNotifications = useCallback(async (checkForUpdates = false) => {
    if (!token) return;

    // Add debouncing to prevent rapid refetching
    const currentTime = Date.now();
    if (checkForUpdates && currentTime - lastUpdateTime < 5000) {
      // Skip if last update was less than 5 seconds ago
      return;
    }

    try {
      if (!checkForUpdates) {
        setIsLoading(true);
      }

      // Fetch events from the API
      const response = await axios.get('/api/calendar/events?limit=15', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data) return;

      const fetchTime = new Date();
      const tasksWithReadStatus = response.data.map((task: {
        _id: string;
        updatedAt?: string;
        title: string;
        type: string;
        status: string;
        start: string;
        description: string;
        changeType?: 'added' | 'edited' | 'deleted' | 'status_changed';
        changedFields?: string[];
      }) => {
        // Store current timestamps for comparison on next fetch
        taskUpdatesRef.current[task._id] = task.updatedAt || new Date().toISOString();

        // Check if this notification has already been seen
        const isRead = readNotificationIdsRef.current.has(task._id);

        return {
          id: task._id,
          title: task.title,
          type: task.type,
          status: task.status,
          start: task.start,
          description: task.description,
          lastUpdated: task.updatedAt ? new Date(task.updatedAt) : null,
          isRead: isRead,
          isUpdated: !isRead && (task.changeType === 'edited' || task.changeType === 'status_changed'),
          changeType: task.changeType,
          changedFields: task.changedFields || []
        };
      });

      // Use functional update to ensure we're working with the most recent state
      setTaskNotifications(prevTasks => {
        // Only update if there are actual changes
        let hasChanges = tasksWithReadStatus.length !== prevTasks.length;

        if (!hasChanges) {
          for (const task of tasksWithReadStatus) {
            const existingTask = prevTasks.find(t => t.id === task.id);
            if (!existingTask ||
              existingTask.status !== task.status ||
              existingTask.isRead !== task.isRead ||
              existingTask.changeType !== task.changeType) {
              hasChanges = true;
              break;
            }
          }
        }

        if (hasChanges) {
          // Update the last update time
          setLastUpdateTime(Date.now());
          return tasksWithReadStatus;
        }

        return prevTasks;
      });

      setLastFetchTime(fetchTime);
    } catch (error) {
      console.error('Error fetching task notifications:', error);
    } finally {
      if (!checkForUpdates) {
        setIsLoading(false);
      }
    }
  }, [token, lastUpdateTime]);

  // Load persisted read notification IDs from localStorage
  useEffect(() => {
    try {
      const storedReadIds = localStorage.getItem('readNotificationIds');
      if (storedReadIds) {
        const parsedIds = JSON.parse(storedReadIds);
        if (Array.isArray(parsedIds)) {
          readNotificationIdsRef.current = new Set(parsedIds);
        }
      }
    } catch (error) {
      console.error('Error loading read notifications from localStorage:', error);
    }
  }, []);

  // Save read status to localStorage whenever it changes
  const persistReadStatus = (updatedTasks: NotificationEvent[]) => {
    try {
      // Update our in-memory Set with the IDs of read notifications
      updatedTasks.forEach(task => {
        if (task.isRead) {
          readNotificationIdsRef.current.add(task.id);
        }
      });

      // Save the Set to localStorage as an array
      localStorage.setItem(
        'readNotificationIds',
        JSON.stringify(Array.from(readNotificationIdsRef.current))
      );
    } catch (error) {
      console.error('Error saving read notifications to localStorage:', error);
    }
  };

  // Fetch task notifications when the component mounts and set up polling
  useEffect(() => {
    if (token) {
      fetchTaskNotifications();

      // Poll for updates every 30 seconds
      const intervalId = setInterval(() => {
        fetchTaskNotifications(true);
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [token, fetchTaskNotifications]);

  // Toggle notification dropdown with preventing event propagation
  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationsOpen(!notificationsOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Prevent closing if clicking on the notification button itself
      if (notificationButtonRef.current && notificationButtonRef.current.contains(event.target as Node)) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event propagation

    const updatedTasks = taskNotifications.map(task => ({
      ...task,
      isRead: true,
      isUpdated: false
    }));

    setTaskNotifications(updatedTasks);
    persistReadStatus(updatedTasks);
  };

  // Mark a single notification as read
  const markAsRead = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event propagation

    const updatedTasks = taskNotifications.map(task =>
      task.id === taskId ? { ...task, isRead: true } : task
    );

    setTaskNotifications(updatedTasks);
    persistReadStatus(updatedTasks);
  };

  // Determine if a task is new (within last 24 hours)
  const isTaskNew = (task: NotificationEvent) => {
    if (task.isRead) return false;

    const taskDate = new Date(task.start);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return taskDate >= yesterday;
  };

  // Generate name for avatar URL
  const avatarName = user?.name ? encodeURIComponent(user.name) : 'User';

  // Calculate notifications that need attention (new or updated tasks)
  const unreadCount = taskNotifications.filter(task =>
    isTaskNew(task) || (task.isUpdated && !task.isRead)
  ).length;

  return (
    <header className="flex items-center justify-end px-6 py-4 bg-white border-b border-gray-100">
      {/* Notifications bell */}
      <div className="relative mr-4" ref={notificationRef}>
        <button
          ref={notificationButtonRef}
          className="text-gray-600 hover:text-[#e56e43] transition-colors duration-200 relative"
          onClick={toggleNotifications}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications dropdown */}
        {notificationsOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
            onClick={e => e.stopPropagation()}>
            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-800">Notificaciones de tareas</h3>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-[#e56e43] hover:text-[#e56e43]/80"
                  onClick={e => markAllAsRead(e)}
                >
                  Marcar todo como leído
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  Cargando tareas...
                </div>
              ) : taskNotifications.length > 0 ? (
                taskNotifications.map(task => {
                  const isNew = isTaskNew(task);
                  const taskType = task.type;
                  const taskDate = new Date(task.start).toLocaleDateString();

                  // Get color based on task type
                  const getTaskTypeClass = () => {
                    switch (taskType) {
                      case 'Visit': return 'bg-[#e56e43]/10 text-[#e56e43]';
                      case 'Call': return 'bg-blue-100 text-blue-800';
                      case 'Email': return 'bg-yellow-100 text-yellow-800';
                      case 'Task': return 'bg-purple-100 text-purple-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  // Get notification badge based on status
                  const getNotificationBadge = () => {
                    if (isNew) return 'Nuevo';
                    if (task.isUpdated && !task.isRead) return 'Actualizado';
                    return null;
                  };

                  const notificationBadge = getNotificationBadge();

                  return (
                    <div
                      key={task.id}
                      className={`px-4 py-2 border-b border-gray-50 hover:bg-gray-50 cursor-pointer
                        ${(isNew || (task.isUpdated && !task.isRead)) ? 'bg-[#e56e43]/5' : ''}`}
                      onClick={(e) => markAsRead(task.id, e)}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-700 font-medium">{task.title}</p>
                        <div className="flex items-center gap-2">
                          {notificationBadge && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
                              {notificationBadge}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getTaskTypeClass()}`}>
                            {taskType}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>{task.status} · {taskDate}</span>
                        {task.isUpdated && !task.isRead && (
                          <span className="italic">
                            {task.changeType === 'status_changed' ? 'Estado cambiado' : 'Editado'}
                          </span>
                        )}
                      </div>
                      {task.changedFields && task.changedFields.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Campos cambiados: {task.changedFields.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No hay notificaciones de tareas
                </div>
              )}

              {lastFetchTime && (
                <div className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
                  Última actualización: {lastFetchTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center text-gray-700 hover:text-[#e56e43] transition-colors duration-200"
        >
          <span className="mx-2 font-medium">{user?.name || 'Usuario'}</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#e56e43]">
            <img
              className="w-full h-full object-cover"
              src={`https://ui-avatars.com/api/?name=${avatarName}&background=e56e43&color=fff`}
              alt="Profile"
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg
            border border-gray-100 py-1 z-50"
            onClick={e => e.stopPropagation()}>
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">Perfil</p>
              <p className="text-sm text-gray-600">Conectado como</p>
              <p className="text-sm font-medium text-gray-800">{user?.email || 'Sin correo'}</p>
              {user?.role && (
                <p className="text-xs text-gray-500 mt-1">{user.role}</p>
              )}
            </div>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50
                hover:text-[#e56e43] transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
