"use client";

import { Calendar, momentLocalizer, View, Views, SlotInfo, EventProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ConstraintViolationPanel from './ConstraintViolationPanel';

const localizer = momentLocalizer(moment);

// Define your custom event type
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room_id?: string;
  staff_id?: string;
  course_id?: string;
  student_count?: number;
  tag?: string;
  hasConstraintWarnings?: boolean;
  hasConstraintViolations?: boolean;
  timeslot_id?: string;
}

// Use type assertion to help TypeScript understand the DnD wrapper
const DnDCalendar = withDragAndDrop(Calendar as any) as any;

const BigCalendar = () => {
    const [view, setView] = useState<View>(Views.WORK_WEEK);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [hardViolations, setHardViolations] = useState<any[]>([]);
    const [softWarnings, setSoftWarnings] = useState<any[]>([]);
    const [showViolationPanel, setShowViolationPanel] = useState(false);
    const [pendingEvent, setPendingEvent] = useState<CalendarEvent | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchEvents = useCallback(async () => {
        try {
            console.log('Starting to fetch events...');
            
            const response = await fetch('http://localhost:5000/api/events/calendar');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fetched data:', data);
            
            const eventsArray = Array.isArray(data) ? data : (data.items || []);
            
            // Process events array
            const formattedEvents = eventsArray
                .map((event: any) => {
                    try {
                        let start, end;
                        
                        // Change to match the camelCase property names from backend
                        if (event.startTime && event.endTime) {
                            const datePart = event.eventDate?.split('T')[0] || event.event_date;
                            start = new Date(`${datePart}T${event.startTime}`);
                            end = new Date(`${datePart}T${event.endTime}`);
                            
                            // Add debugging
                            console.log(`Successfully parsed dates for ${event.title}:`, 
                                {datePart, startTime: event.startTime, endTime: event.endTime, start, end});
                        } else {
                            console.error('Event missing timeslot data:', event);
                            return null;
                        }
                        
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            console.error('Invalid date for event:', event);
                            return null;
                        }
                        
                        return {
                            id: String(event.id),
                            title: event.title,
                            start,
                            end,
                            room_id: event.room_id || event.roomId, // Also handle potential camelCase for room_id
                            staff_id: event.staff_id || event.staffId, // Also handle potential camelCase for staff_id
                            course_id: event.course_id || event.module_id || event.moduleId, // Handle variations
                            student_count: event.student_count || 0,
                            tag: event.tag || 'CLASS',
                            // Use the camelCase name from the backend DTO
                            timeslot_id: event.timeslotId // <-- CHANGE THIS LINE
                        };
                    } catch (error) {
                        console.error('Error processing event:', event, error);
                        return null;
                    }
                })
                .filter((event: unknown): event is CalendarEvent => event !== null);
            
            console.log('Formatted events for calendar:', formattedEvents);
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }, []);

    // Navigation functions
    const handleNextWeek = () => {
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setCurrentDate(nextWeek);
    };

    const handlePrevWeek = () => {
        const prevWeek = new Date(currentDate);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setCurrentDate(prevWeek);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const checkConstraints = async (event: CalendarEvent) => {
        try {
            const eventDate = event.start.toISOString().split('T')[0];
            const timeslotId = event.timeslot_id || "TS1"; // Add fallback here

            console.log('Checking constraints with:', {
                event_date: eventDate,
                timeslot_id: timeslotId, // Use the variable with fallback
                // ... other properties
            });

            const response = await fetch('http://localhost:5000/api/constraints/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...event,
                    event_date: eventDate,
                    timeslot_id: timeslotId, // Use the variable with fallback
                    // ... other properties
                }),
            });
            // ... rest of function
            // Get the response text regardless of status
            const responseText = await response.text();
            console.log('Constraint check response:', response.status, responseText);
            
            if (!response.ok) {
                throw new Error(`Failed to check constraints: ${response.status} ${responseText}`);
            }
            
            // Parse the response as JSON after confirming it's ok
            const result = JSON.parse(responseText);
            return result;
        } catch (error) {
            console.error('Error checking constraints:', error);
            // Rethrow the error so it can be handled by the caller
            throw error;
        }
    };

    const handleEventSelect = (event: CalendarEvent) => {
        console.log("Selected event:", event);
    };

    const handleSelectSlot = async (slotInfo: SlotInfo) => {
        const newEvent: CalendarEvent = {
            id: String(Math.random()),
            title: "New Event",
            start: slotInfo.start,
            end: slotInfo.end,
            course_id: "course_id",
            room_id: "room_id",
            staff_id: "staff_id",
            student_count: 0,
        };

        try {
            const constraintResult = await checkConstraints(newEvent);
            setHardViolations(constraintResult.hardViolations || []);
            setSoftWarnings(constraintResult.softWarnings || []);
            setShowViolationPanel(true);
            setPendingEvent(newEvent);
        } catch (error) {
            console.error('Error handling slot selection:', error);
            toast.error('Failed to check constraints');
        }
    };

    const handleOnChangeView = (selectedView: View) => {
        setView(selectedView);
    };
    
    const saveEvent = async (event: CalendarEvent) => {
        try {
            // Log event before formatting for API
            console.log("Event before API formatting:", event);

            const apiEvent = {
                id: event.id,
                title: event.title,
                event_date: event.start.toISOString().split('T')[0],
                timeslot_id: event.timeslot_id || "1", 
                start_time: event.start.toISOString(),
                end_time: event.end.toISOString(),
                // Use consistent property naming: either all camelCase or all snake_case
                // Backend seems to expect snake_case based on error messages
                room_id: event.room_id || "1",
                staff_id: event.staff_id || "1",
                module_id: event.course_id || "1",
                student_count: event.student_count || 0,
                tag: event.tag || 'CLASS'
            };

            // Log formatted API event
            console.log("Formatted API event:", apiEvent);

            await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiEvent)
            });
            
            // For now, manually update events array
            setEvents(prev => {
                const existingIndex = prev.findIndex(e => e.id === event.id);
                if (existingIndex >= 0) {
                    // Update existing event
                    return [
                        ...prev.slice(0, existingIndex),
                        event,
                        ...prev.slice(existingIndex + 1)
                    ];
                } else {
                    // Add new event
                    return [...prev, event];
                }
            });
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Failed to save event');
        }
    };

    // Use any type for the drag and drop handlers since the library typings are giving us trouble
    const moveEvent = useCallback((eventData: any) => {
        const { event, start, end } = eventData;
        
        // Find the original event with all properties from your events array
        const originalEvent = events.find(e => e.id === event.id);
        
        if (!originalEvent) {
            toast.error("Could not find original event data");
            return;
        }
        
        // Log the original event AND specifically its timeslot_id
        console.log("Original event found:", originalEvent);
        console.log("Original event timeslot_id:", originalEvent.timeslot_id); // <-- ADD THIS LOG
        
        // Create updated event by merging original event with new start/end times
        // AND ensure the required fields have default values if missing
        const updatedEvent = {
            ...originalEvent,
            start: new Date(start),
            end: new Date(end),
            room_id: originalEvent.room_id || "1",
            staff_id: originalEvent.staff_id || "1",
            course_id: originalEvent.course_id || "1",
            timeslot_id: originalEvent.timeslot_id // Explicitly add it
        };  
        
        // Log the merged event AND specifically its timeslot_id
        console.log("Updated event before checkConstraints:", updatedEvent);
        console.log("Updated event timeslot_id:", updatedEvent.timeslot_id); // <-- ADD THIS LOG
        
        toast.info("Checking constraints...");
        
        checkConstraints(updatedEvent)
            .then(result => {
                const violations = result.hardViolations || [];
                const warnings = result.softWarnings || [];
                
                console.log('Constraint check result:', { violations, warnings });
                
                if (violations.length > 0) {
                    toast.error("Cannot move event due to hard constraints");
                    // Refresh to original position
                    setEvents([...events]); 
                } else {
                    setEvents(prev => 
                        prev.map(ev => ev.id === event.id ? updatedEvent : ev)
                    );
                    
                    if (warnings.length > 0) {
                        toast.warning("Soft constraints violated");
                    } else {
                        toast.success("Event moved successfully");
                    }
                    
                    saveEvent(updatedEvent);
                }
            })
            .catch(error => {
                console.error('Error checking constraints:', error);
                toast.error(`Failed to check constraints: ${error.message}`);
                // Reset the event to its original position
                setEvents([...events]);
            });
    }, [events]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const style: React.CSSProperties = {
            backgroundColor: '#3174ad',
            borderRadius: '6px',
            opacity: 0.85,
            color: 'white',
            border: '1px solid rgba(0,0,0,0.2)',
            display: 'block',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.2)',
            marginRight: '2px',
            marginLeft: '2px',
            fontWeight: 500,
        };
        
        if (event.tag) {
            switch (event.tag.toUpperCase()) {
                case 'CLASS':
                    style.backgroundColor = '#4285F4';
                    style.borderLeft = '3px solid #1a73e8';
                    break;
                case 'EXAM':
                    style.backgroundColor = '#EA4335';
                    style.borderLeft = '3px solid #d93025';
                    break;
                case 'MEETING':
                    style.backgroundColor = '#FBBC05';
                    style.color = 'black';
                    style.borderLeft = '3px solid #f29900';
                    break;
                case 'EVENT':
                    style.backgroundColor = '#34A853';
                    style.borderLeft = '3px solid #1e8e3e';
                    break;
            }
        }
    
        if (event.hasConstraintWarnings) {
            style.borderLeft = '4px solid #F9A825';
        }
        
        if (event.hasConstraintViolations) {
            style.borderLeft = '4px solid #D32F2F';
        }
        
        return { style };
    };

    const EventComponent = ({ event }: EventProps<CalendarEvent>) => {
        return (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="text-xs font-semibold mb-1 truncate">{event.title}</div>
            {event.room_id && <div className="text-xs opacity-80 truncate">Room: {event.room_id}</div>}
          </div>
        );
      };

    return (
        <div className='relative'>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handlePrevWeek}
                        className="px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                        Prev
                    </button>
                    <button 
                        onClick={handleToday}
                        className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Today
                    </button>
                    <button 
                        onClick={handleNextWeek}
                        className="px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                        Next
                    </button>
                </div>
                <div className="text-lg font-medium">
                    {moment(currentDate).format('MMMM DD, YYYY')}
                </div>
            </div>
            
            <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={["work_week", "day"]}
                view={view}
                date={currentDate}
                onNavigate={setCurrentDate}
                style={{ height: "82vh", padding: "5px", borderRadius: "12px" }}
                onView={handleOnChangeView}
                min={new Date(2025, 1, 0, 8, 0, 0)}
                max={new Date(2025, 1, 0, 18, 0, 0)}
                selectable
                onSelectEvent={handleEventSelect}
                onSelectSlot={handleSelectSlot}
                onEventDrop={moveEvent}
                resizable
                onEventResize={moveEvent}
                eventPropGetter={eventStyleGetter}
                components={{
                    event: EventComponent
                }}
                dayLayoutAlgorithm="no-overlap"
            />

            {showViolationPanel && (
                <ConstraintViolationPanel 
                    hardViolations={hardViolations}
                    softWarnings={softWarnings}
                    event={pendingEvent}
                    onSave={() => {
                        if (pendingEvent) {
                            saveEvent(pendingEvent);
                        }
                        setShowViolationPanel(false);
                    }}
                    onCancel={() => {
                        setShowViolationPanel(false);
                        setEvents([...events]); // Refresh to original positions
                    }}
                />
            )}
        </div>
    );
};

export default BigCalendar;