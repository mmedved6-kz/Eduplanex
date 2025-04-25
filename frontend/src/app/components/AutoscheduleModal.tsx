"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import OptimizationChart from './OptimizationChart';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventToSchedule {
  id?: string | number; // Add optional ID
  title: string;
  moduleId: string;
  students?: string[]; // Array of student IDs
  student_count?: number; // Kept for backward compatibility
  durationMinutes: number;
  staffId?: string;
  roomId?: string;
  isExisting?: boolean; // Flag to differentiate
  // Add other properties from your fetched existing events if needed
  eventDate?: string;
  event_date?: string;
  timeslotStart?: string;
  startTime?: string;
  timeslotEnd?: string;
  endTime?: string;
  start?: string; // Add optional start property
  end?: string; // Add optional end property
  roomName?: string;
  staffName?: string;
  room_id?: string; // From snippet
  staff_id?: string;
}

interface SchedulingMetrics {
  resourceUtilization: number;
  staffWorkloadBalance: number;
  studentExperience: number;
  hardViolations: number;
  softViolations: number;
}

const AutoScheduleModal = ({ isOpen, onClose }: AutoScheduleModalProps) => {
  const [events, setEvents] = useState<EventToSchedule[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [step, setStep] = useState<'configure' | 'preferences' | 'results'>('configure');
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<{[key: number]: string[]}>({});
  const [studentSearch, setStudentSearch] = useState('');
  const [optimizationMetrics, setOptimizationMetrics] = useState<SchedulingMetrics | null>(null);
  const [existingEvents, setExistingEvents] = useState<any[]>([]);
  const [selectedExistingEventIds, setSelectedExistingEventIds] = useState<Set<string | number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Scheduling preferences
  const [preferences, setPreferences] = useState({
    timeRange: 'any',  // 'morning', 'afternoon', 'any'
    daysOfWeek: ['1', '2', '3', '4', '5'], // Monday to Friday
    maxEventsPerDay: 3,
    gapBetweenEvents: 15, // minutes
    optimizationFocus: 'balanced', // 'balanced', 'resource', 'staff', 'student'
  });

  useEffect(() => {
    // Reset state when modal is opened
    if (isOpen) {
      // setEvents([]); // Clear events initially
      setResults(null);
      setStep('configure');
      setOptimizationMetrics(null);
      setError(null);
      setSelectedStudents({});
      setSelectedExistingEventIds(new Set());

      const initializeEvents = async () => {
        setLoading(true); // Start loading
        let fetchedExistingEvents: EventToSchedule[] = [];
        try {
          // Fetch existing events from your calendar endpoint
          const response = await fetch('http://localhost:5000/api/events/calendar?pageSize=1000');
          if (response.ok) {
            const data = await response.json();
            // Map fetched events, add the isExisting flag, and ensure properties match
            fetchedExistingEvents = (data.items || []).map((evt: any) => ({
              ...evt,
              id: evt.id, 
              title: evt.title,
              eventDate: evt.start,
              timeslotStart: formatTime(evt.start),
              timeslotEnd: formatTime(evt.end),
              roomName: evt.roomName, 
              staffName: evt.staffName, 
              isExisting: true, 
            }));
            console.log("Fetched existing events:", fetchedExistingEvents);
          } else {
            console.error('Failed to fetch existing events:', response.status);
            setError(`Failed to load existing events (${response.status})`);
          }
        } catch (error) {
          console.error('Error fetching existing events:', error);
          setError('Error loading existing events.');
        } finally {
          // Set the main events state with existing events
          setEvents(fetchedExistingEvents);
          setLoading(false); // Stop loading after fetch
        }
      };

      initializeEvents();
      fetchData(); // Fetch modules, staff, rooms, students
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch modules for dropdown
      const modulesResponse = await fetch('http://localhost:5000/api/modules?pageSize=100');
      if (modulesResponse.ok) {
        const data = await modulesResponse.json();
        setModules(data.items || []);
      }

      // Fetch staff members
      const staffResponse = await fetch('http://localhost:5000/api/staff?pageSize=100');
      if (staffResponse.ok) {
        const data = await staffResponse.json();
        setStaff(data.items || []);
      }

      // Fetch rooms
      const roomsResponse = await fetch('http://localhost:5000/api/rooms?pageSize=100');
      if (roomsResponse.ok) {
        const data = await roomsResponse.json();
        setRooms(data.items || []);
      }
      
      // Fetch students
      const studentsResponse = await fetch('http://localhost:5000/api/students?pageSize=100');
      if (studentsResponse.ok) {
        const data = await studentsResponse.json();
        setStudents(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    const newEvent: EventToSchedule = {
      title: '',
      moduleId: '',
      // student_count: 0, // Let student selection handle this
      durationMinutes: 60,
      isExisting: false, // Mark as new
    };
    // Prepend the new event to the array using spread operator
    setEvents([newEvent, ...events]);
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleEventChange = (index: number, field: keyof EventToSchedule, value: any) => {
    const updatedEvents = [...events];
    
    if (field === 'moduleId' && modules.length > 0) {
      // If module is selected, auto-fill the title based on module name
      const selectedModule = modules.find(m => m.id === value);
      if (selectedModule) {
        updatedEvents[index] = {
          ...updatedEvents[index],
          [field]: value,
          title: `${selectedModule.name} Class`
        };
      } else {
        updatedEvents[index] = {
          ...updatedEvents[index],
          [field]: value
        };
      }
    } else {
      updatedEvents[index] = {
        ...updatedEvents[index],
        [field]: value
      };
    }
    
    setEvents(updatedEvents);
  };
  
  // Toggle selection of an existing event
  const handleExistingEventToggle = (eventId: string | number | undefined) => {
    if (eventId === undefined) return; // Should not happen if ID exists
  
    setSelectedExistingEventIds(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Handle student selection for a specific event
  const handleStudentSelect = (studentId: string) => {
    if (activeEventIndex === null) return;
    
    setSelectedStudents(prev => {
      const currentSelected = prev[activeEventIndex] || [];
      
      // Toggle selection
      const newSelected = currentSelected.includes(studentId)
        ? currentSelected.filter(id => id !== studentId)
        : [...currentSelected, studentId];
        
      // Update the event's student count
      const updatedEvents = [...events];
      updatedEvents[activeEventIndex] = {
        ...updatedEvents[activeEventIndex],
        students: newSelected,
        student_count: newSelected.length
      };
      setEvents(updatedEvents);
      
      return {
        ...prev,
        [activeEventIndex]: newSelected
      };
    });
  };
  
  // Apply the student selection and close the modal
  const applyStudentSelection = () => {
    setIsStudentModalOpen(false);
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setPreferences({
      ...preferences,
      [field]: value
    });
  };

  const handleDayToggle = (day: string) => {
    if (preferences.daysOfWeek.includes(day)) {
      setPreferences({
        ...preferences,
        daysOfWeek: preferences.daysOfWeek.filter(d => d !== day)
      });
    } else {
      setPreferences({
        ...preferences,
        daysOfWeek: [...preferences.daysOfWeek, day].sort()
      });
    }
  };

  const nextStep = () => {
    if (step === 'configure') setStep('preferences');
    else if (step === 'preferences') scheduleEvents();
  };

  const prevStep = () => {
    if (step === 'preferences') setStep('configure');
    else if (step === 'results') setStep('preferences');
  };

  const scheduleEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Filter out non-existing events for scheduling
      const newEventsToSchedule = events
        .filter(event => !event.isExisting)
        .map((event) => {
           // Find the original index in the full 'events' array to get selected students
           const originalIndex = events.findIndex(e => e === event);
           return {
             ...event,
             student_count: selectedStudents[originalIndex]?.length || event.student_count || 0,
             preferredRoomIds: event.roomId ? [event.roomId] : [],
             preferredStaffIds: event.staffId ? [event.staffId] : [],
             students: selectedStudents[originalIndex] || []
           };
        });

      // Filter existing events that are selected
      const selectedExistingEventsForContext = events.filter(event =>
        event.isExisting && event.id !== undefined && selectedExistingEventIds.has(event.id)
      ).map(e => ({ // Map to a simpler structure if needed by backend
          id: e.id,
          start: e.start,
          end: e.end,
          roomId: e.room_id || e.roomId, // Adjust based on actual property
          staffId: e.staff_id || e.staffId // Adjust based on actual property
      }));


      if (newEventsToSchedule.length === 0) {
         setError("No new events added to schedule.");
         setLoading(false);
         return;
      }

      console.log("Sending to scheduler API:", {
        events: newEventsToSchedule,
        preferences,
        existingEvents: selectedExistingEventsForContext // Send selected existing events
      });

      const response = await fetch('http://localhost:5000/api/scheduler/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: newEventsToSchedule,
          preferences: {
            ...preferences,
            optimizationFocus: preferences.optimizationFocus
          },
          // Send selected existing events for context
          existingEvents: selectedExistingEventsForContext
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Scheduling failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Scheduling results:', data);
      
      setResults(data);

      const metrics = data.metrics || {
        resourceUtilization: 0,
        staffWorkloadBalance: 0,
        studentExperience: 0,
        hardViolations: 0,
        softViolations: 0
      };

      setOptimizationMetrics(metrics);
      setStep('results');
    } catch (error: any) { // Catch specific error type if known
      console.error('Auto-scheduling error:', error);
      setError(error.message || 'An unexpected error occurred during scheduling.'); // Set error state
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Render optimization metrics
  const renderMetrics = () => {
    if (!optimizationMetrics) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Optimization Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-blue-600">{optimizationMetrics.resourceUtilization}%</span>
            </div>
            <p className="text-sm text-gray-600">Resource Utilization</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-green-600">{optimizationMetrics.staffWorkloadBalance}%</span>
            </div>
            <p className="text-sm text-gray-600">Staff Balance</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-purple-600">{optimizationMetrics.studentExperience}%</span>
            </div>
            <p className="text-sm text-gray-600">Student Experience</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between text-sm">
          <p className="text-gray-600">Hard Constraints: <span className={optimizationMetrics.hardViolations > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
            {optimizationMetrics.hardViolations === 0 ? "All Satisfied" : `${optimizationMetrics.hardViolations} Violations`}
          </span></p>
          
          <p className="text-gray-600">Soft Constraints: <span className="text-amber-600 font-medium">
            {optimizationMetrics.softViolations} Warnings
          </span></p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* 1. Add flex flex-col */}
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header (Title and Close Button) - Keep padding here */}
        <div className="flex justify-between items-center p-6 border-b"> {/* Added border-b, adjusted padding */}
          <h2 className="text-xl font-bold">Auto-Schedule Events</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Image src="/close.png" alt="Close" width={16} height={16} className="filter invert"/>
          </button>
        </div>

        {/* 2. Wrap scrollable content */}
        <div className="flex-1 overflow-y-auto p-6"> {/* Add padding here for content */}
          {error && (
            <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4'>
              {error}
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex items-center mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          
          <div className="flex justify-between w-full relative z-10">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                step === 'configure' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'
              }`}>
                1
              </div>
              <span className="text-xs font-medium">Configure Events</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                step === 'preferences' ? 'bg-blue-500 text-white' : 
                step === 'results' ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-xs font-medium">Set Preferences</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                step === 'results' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                3
              </div>
              <span className="text-xs font-medium">Review Results</span>
            </div>
          </div>
        </div>

          {/* Conditional Step Content (Configure, Preferences, Results) */}
          {step === 'configure' && (
            <>
              <div className="mb-4">
                <p className="text-gray-600 mb-4">Add events to be automatically scheduled. You'll be able to set scheduling preferences in the next step.</p>
                
                {existingEvents && existingEvents.length > 0 && (
                  <div className="mb-6 border p-4 rounded bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Events</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      New events will be scheduled around these existing events.
                    </p>
                  <div className="max-h-[150px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Time</th>
                      </tr>
                    </thead>
                  <tbody>
                  {existingEvents.slice(0, 5).map((event, idx) => (
                    <tr key={event.id} className="border-t">
                      <td className="p-2">{event.title}</td>
                      <td className="p-2">{formatDate(event.eventDate || event.event_date)}</td>
                      <td className="p-2">
                        {event.timeslotStart || event.startTime || "N/A"} - {event.timeslotEnd || event.endTime || "N/A"}
                      </td>
                    </tr>
                  ))}
                  {existingEvents.length > 5 && (
                    <tr>
                      <td colSpan={3} className="p-2 text-center text-gray-500">
                        And {existingEvents.length - 5} more events...
                      </td>
                    </tr>
                  )}
                  </tbody>
                  </table>
                  </div>
                </div>
              )}
                
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Event
                </button>
              </div>

              {/* Check loading state AND events length */}
              {loading ? (
                <div className="text-center p-8 text-gray-500">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="text-gray-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No existing events found and no new events added yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Add Event" to create events for auto-scheduling</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event.id || `new-${index}`} className="border p-4 rounded-lg bg-white shadow-sm">

                    {event.isExisting ? (
                    // Read-only view for existing events with checkbox
                      <div className={`relative p-4 rounded-lg border ${selectedExistingEventIds.has(event.id!) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}> {/* Conditional styling */}
                        <div className="absolute top-3 right-3"> {/* Checkbox top right */}
                          <input
                            type="checkbox"
                            checked={selectedExistingEventIds.has(event.id!)}
                            onChange={() => handleExistingEventToggle(event.id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-1 pr-8"> {/* Add padding-right to avoid overlap */}
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-gray-800">{event.title}</h3>
                            {/* <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">EXISTING</span> */}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Date:</span> {formatDate(event.eventDate || event.start || '')}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Time:</span>
                            {formatTime(event.start || event.eventDate || '')} - {formatTime(event.end || '')}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Room:</span> {event.roomName || event.room_id || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Staff:</span> {event.staffName || event.staff_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Form view for new events
                      <div>
                        <div className="flex justify-between mb-3">
                          {/* Calculate correct index for "New Event X" label */}
                          <h3 className="font-medium text-blue-600">New Event {index + 1 - events.filter(e => e.isExisting).length}</h3>
                          <button
                            onClick={() => handleRemoveEvent(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                            <select
                              value={event.moduleId}
                              onChange={(e) => handleEventChange(index, 'moduleId', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                              <option value="">Select Module</option>
                              {modules.map(module => (
                                <option key={module.id} value={module.id}>
                                  {module.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <select
                              value={event.durationMinutes}
                              onChange={(e) => handleEventChange(index, 'durationMinutes', parseInt(e.target.value))}
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                              <option value="30">30 minutes</option>
                              <option value="45">45 minutes</option>
                              <option value="60">1 hour</option>
                              <option value="90">1.5 hours</option>
                              <option value="120">2 hours</option>
                              <option value="180">3 hours</option>
                            </select>
                          </div>
                        
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student Selection</label>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveEventIndex(index);
                                setIsStudentModalOpen(true);
                              }}
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-left flex justify-between items-center bg-white"
                            >
                              <span>{selectedStudents[index]?.length || 0} students selected</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <p className="text-xs text-gray-500 mt-1">Click to select specific students</p>
                          </div>
                        
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={event.title}
                              onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                              placeholder="Auto-filled from module, can edit"
                            />
                          </div>
                        
                          {/* Optional preferred staff */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Staff (Optional)</label>
                            <select
                              value={event.staffId || ""}
                              onChange={(e) => handleEventChange(index, 'staffId', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                              <option value="">Any Available Staff</option>
                              {staff.map(staffMember => (
                                <option key={staffMember.id} value={staffMember.id}>
                                  {staffMember.name} {staffMember.surname}
                                </option>
                              ))}
                            </select>
                          </div>
                        
                          {/* Optional preferred room */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Room (Optional)</label>
                            <select
                              value={event.roomId || ""}
                              onChange={(e) => handleEventChange(index, 'roomId', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                              <option value="">Any Available Room</option>
                              {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                  {room.name} ({room.capacity} seats)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'preferences' && (
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">Set your scheduling preferences to optimize the auto-scheduling process.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Time Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time of Day</label>
                    <select
                      value={preferences.timeRange}
                      onChange={(e) => handlePreferenceChange('timeRange', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="any">Any Time</option>
                      <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Events Per Day</label>
                    <select
                      value={preferences.maxEventsPerDay}
                      onChange={(e) => handlePreferenceChange('maxEventsPerDay', parseInt(e.target.value))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="1">1 event per day</option>
                      <option value="2">2 events per day</option>
                      <option value="3">3 events per day</option>
                      <option value="4">4 events per day</option>
                      <option value="5">5 events per day</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Gap Between Events</label>
                    <select
                      value={preferences.gapBetweenEvents}
                      onChange={(e) => handlePreferenceChange('gapBetweenEvents', parseInt(e.target.value))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="0">No gap</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Optimization Focus</label>
                    <select
                      value={preferences.optimizationFocus}
                      onChange={(e) => handlePreferenceChange('optimizationFocus', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="balanced">Balanced</option>
                      <option value="resource">Resource Utilization</option>
                      <option value="staff">Staff Workload Balance</option>
                      <option value="student">Student Experience</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">What aspect to prioritize in optimization</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Days of Week</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: '1', label: 'Monday' },
                    { value: '2', label: 'Tuesday' },
                    { value: '3', label: 'Wednesday' },
                    { value: '4', label: 'Thursday' },
                    { value: '5', label: 'Friday' },
                    { value: '6', label: 'Saturday' },
                    { value: '0', label: 'Sunday' },
                  ].map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        preferences.daysOfWeek.includes(day.value)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {preferences.daysOfWeek.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">Please select at least one day</p>
                )}
              </div>
            </div>
          )}

          {step === 'results' && results && (
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">Scheduling Results</h3>
                <div className="flex space-x-4 mt-2">
                  <p className="text-green-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Successfully scheduled: {results.totalSuccess} events
                  </p>
                  {results.totalFailure > 0 && (
                    <p className="text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Failed to schedule: {results.totalFailure} events
                    </p>
                  )}
                </div>
              </div>
              
              {/* Show optimization metrics */}
              {renderMetrics()}

              {results.metrics && results.metrics.optimizationProgress && (
                <div className="mb-6">
                    <OptimizationChart progressData={results.metrics.optimizationProgress} />
                </div>
              )}
              
              <div className="space-y-4">
                {results.results.map((result: any, index: number) => (
                  <div 
                    key={index} 
                    className={`border p-4 rounded ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <h4 className="font-medium">{result.eventData.title}</h4>
                    {result.success ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <p><span className="font-medium">Date:</span> {formatDate(result.event.start || result.event.startTime)}</p>
                          <p><span className="font-medium">Time:</span> {formatTime(result.event.start || result.event.startTime)} - {formatTime(result.event.end || result.event.endTime)}</p>
                          <p><span className="font-medium">Room:</span> {result.event.roomName || rooms.find(r => r.id === result.event.roomId)?.name || result.event.roomId}</p>
                          <p><span className="font-medium">Staff:</span> {result.event.staffName || staff.find(s => s.id === result.event.staffId)?.name || result.event.staffId}</p>
                        </div>
                        
                        {result.softWarnings && result.softWarnings.length > 0 && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                            <p className="text-amber-600 font-medium text-sm">Warnings:</p>
                            <ul className="list-disc pl-5">
                              {result.softWarnings.map((warning: any, i: number) => (
                                <li key={i} className="text-amber-600 text-sm">{warning.message}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-600 mt-2">{result.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div> {/* End of scrollable wrapper */}


        {/* 3. Navigation Buttons - Make sticky */}
        <div className="sticky bottom-0 bg-white flex justify-between px-6 pb-6 pt-4 border-t"> {/* Adjusted classes */}
          {step !== 'configure' ? (
            <button
              onClick={prevStep}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <div></div> // Placeholder for flex alignment
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              {step === 'results' ? 'Close' : 'Cancel'}
            </button>

            {step !== 'results' && (
              <button
                onClick={nextStep}
                disabled={step === 'configure' && events.length === 0 || step === 'preferences' && preferences.daysOfWeek.length === 0 || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {step === 'configure' ? 'Next' : 'Schedule Events'}
              </button>
            )}
          </div>
        </div> {/* End of sticky button container */}

      </div> {/* End of main modal container */}

      {/* Student Selection Modal (remains the same) */}
      {isStudentModalOpen && activeEventIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Select Students</h3>
              <button 
                onClick={() => setIsStudentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center mb-4 relative">
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {selectedStudents[activeEventIndex]?.length || 0} students selected
              </span>
              <button
                onClick={() => setSelectedStudents(prev => ({...prev, [activeEventIndex]: []})) }
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Clear all
              </button>
            </div>
            
            {/* Student List */}
            <div className="flex-1 overflow-y-auto border rounded-md">
              {students.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No students found</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="py-2 px-4 text-left font-medium text-gray-500">Select</th>
                      <th className="py-2 px-4 text-left font-medium text-gray-500">Name</th>
                      <th className="py-2 px-4 text-left font-medium text-gray-500 hidden md:table-cell">Course</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(student => 
                        studentSearch === '' || 
                        `${student.name} ${student.surname}`.toLowerCase().includes(studentSearch.toLowerCase())
                      )
                      .map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 border-t">
                          <td className="py-2 px-4">
                            <input
                              type="checkbox"
                              checked={selectedStudents[activeEventIndex]?.includes(student.id) || false}
                              onChange={() => handleStudentSelect(student.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600"
                            />
                          </td>
                          <td className="py-2 px-4">{student.name} {student.surname}</td>
                          <td className="py-2 px-4 hidden md:table-cell">{student.courseName}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={applyStudentSelection}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoScheduleModal;