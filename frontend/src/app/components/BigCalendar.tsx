"use client";

import { Calendar, momentLocalizer, View, Views, SlotInfo } from 'react-big-calendar';
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
            
            const response = await fetch('/api/events');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fetched data:', data);
            
            // Check if data has the expected structure
            if (!data || !data.items || !Array.isArray(data.items)) {
                console.error('Unexpected data format - missing items array');
                return;
            }
            
            // Process normal response with items array
            const formattedEvents = data.items
                .map((event: any) => {
                    try {
                        // Handle date parsing safely
                        const start = new Date(event.startTime || event.start_time || event.start);
                        const end = new Date(event.endTime || event.end_time || event.end);
                        
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            console.error('Invalid date for event:', event);
                            return null;
                        }
                        
                        return {
                            id: String(event.id),
                            title: event.title,
                            start,
                            end,
                            room_id: event.roomId,
                            staff_id: event.staffId,
                            course_id: event.moduleId,
                            student_count: event.student_count || 0,
                            tag: event.tag
                        };
                    } catch (error) {
                        console.error('Error processing event:', event, error);
                        return null;
                    }
                })
                .filter((event: unknown): event is CalendarEvent => event !== null); // Type guard
            
            console.log('Formatted events for calendar:', formattedEvents);
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            
            // Use test events as fallback
            const testEvents: CalendarEvent[] = [
                {
                    id: '1',
                    title: 'Today Event',
                    start: new Date(),
                    end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                    tag: 'EVENT'
                }
            ];
            setEvents(testEvents);
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
        // Temporary test data
        const testEvents: CalendarEvent[] = [
            {
                id: '1',
                title: 'Test Event 1',
                start: new Date(2025, 3, 5, 10, 0), // April 5, 2025, 10:00 AM
                end: new Date(2025, 3, 5, 12, 0),   // April 5, 2025, 12:00 PM
                tag: 'CLASS'
            },
            {
                id: '2',
                title: 'Test Event 2',
                start: new Date(2025, 3, 6, 14, 0), // April 6, 2025, 2:00 PM
                end: new Date(2025, 3, 6, 16, 0),   // April 6, 2025, 4:00 PM
                tag: 'EXAM'
            },
            {
                id: '3',
                title: 'Today Event',
                start: new Date(), // Now
                end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
                tag: 'EVENT'
            }
        ];
        
        setEvents(testEvents);
        
        // Comment out the API fetch for now
        // fetchEvents();
    }, []);

    const checkConstraints = async (event: CalendarEvent) => {
        try {
            const response = await fetch('/api/constraints/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });
            
            if (!response.ok) {
                throw new Error('Failed to check constraints');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error checking constraints:', error);
            return { hardViolations: [], softWarnings: [] };
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
            await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
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
        
        const updatedEvent = { 
            ...event, 
            start: new Date(start), 
            end: new Date(end) 
        };
        
        checkConstraints(updatedEvent)
            .then(result => {
                const violations = result.hardViolations || [];
                
                if (violations.some((v: any) => v.severity === 'HARD')) {
                    toast.error("Cannot move event due to hard constraints");
                    // Refresh to original position
                    setEvents([...events]); 
                } else {
                    setEvents(prev => 
                        prev.map(ev => ev.id === event.id ? updatedEvent : ev)
                    );
                    
                    if (violations.length > 0) {
                        toast.warning("Soft constraints violated");
                    }
                    
                    saveEvent(updatedEvent);
                }
            })
            .catch(error => {
                console.error('Error checking constraints:', error);
                toast.error('Failed to check constraints');
            });
    }, [events]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const style: React.CSSProperties = {
            backgroundColor: '#3174ad',
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
          }; // default blue
        
          if (event.tag) {
            switch (event.tag.toUpperCase()) {
              case 'CLASS':
                style.backgroundColor = '#4285F4'; // blue
                break;
              case 'EXAM':
                style.backgroundColor = '#EA4335'; // red
                break;
              case 'MEETING':
                style.backgroundColor = '#FBBC05'; // yellow
                break;
              case 'EVENT':
                style.backgroundColor = '#34A853'; // green
                break;
            }
          }

          if (event.hasConstraintWarnings) {
            style.borderLeft = '4px solid #F9A825'; 
          }
          
          if (event.hasConstraintViolations) {
            style.borderLeft = '4px solid #D32F2F'; 
          }
        
        return {
            style
        };
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