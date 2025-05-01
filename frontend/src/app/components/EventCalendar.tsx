"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import Image from 'next/image';
import Link from "next/link";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type Event = {
    id: number | string;
    title: string;
    time: string;
    description: string;
    date: Date;
};

const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];  // "YYYY-MM-DD"
};

const EventCalendar = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        const fetchEvents = async () => {
            try {
              setLoading(true);
              const response = await fetch('http://localhost:5000/api/events/calendar');
              
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
              }
              
              const data = await response.json();
              console.log("Calendar events response:", data);
              
              let formattedEvents: Event[] = [];

              if (data.items && Array.isArray(data.items)) {
                formattedEvents = data.items.map((event: any) => {
                  let eventDate: Date;
                  let timeRange: string;
                  
                  if (event.eventDate || event.event_date) {
                    eventDate = new Date(event.eventDate || event.event_date);
                    timeRange = `${event.timeslotStart || event.start_time || ''} - ${event.timeslotEnd || event.end_time || ''}`;
                  } else {
                    const startTime = new Date(event.startTime || event.start_time || event.start);
                    const endTime = new Date(event.endTime || event.end_time || event.end);
                    eventDate = startTime;
                    timeRange = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                  }
                  
                  return {
                    id: event.id,
                    title: event.title,
                    date: eventDate,
                    time: timeRange,
                    description: event.description || "No description available"
                  };
                });
              }

              setEvents(formattedEvents);
                
              // Filter events for selected date (or today if none selected)
              const currentDate = new Date();
              setSelectedDate(currentDate);
              const filteredEvents = formattedEvents.filter((event: Event) => 
                formatDate(event.date) === formatDate(currentDate)
              );
              setFilteredEvents(filteredEvents);
            } catch (error) {
              console.error('Error fetching events:', error);
              setError(`Failed to fetch calendar events: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
              setLoading(false);
            }
          };
        fetchEvents();
    }, []);
    
    // Handle date change and filter events
    const handleDateChange = (value: Value) => {
        if (value instanceof Date) {
            setSelectedDate(value);
            const matchedEvents = events.filter(event =>
                formatDate(event.date) === formatDate(value)
            );
            setFilteredEvents(matchedEvents);
        }
    };

    // Prevent SSR date mismatch by rendering only after mounting
    if (!isMounted) {
        return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>;
    }

    const displayedEvents = filteredEvents.slice(0, 2);
    const hasMoreEvents = filteredEvents.length > 2;
    const additionalEventsCount = filteredEvents.length - 2;

    return (
        <div className="bg-white p-5 rounded-md h-full flex flex-col shadow">
            <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="w-full mb-4"
                tileContent={({ date }) =>
                    events.some(event => formatDate(event.date) === formatDate(date)) ? (
                        <div className="flex justify-center items-center">
                            <span className="text-blue-500 font-bold translate-y-1 text-sm">●</span>
                        </div>
                    ) : null
                }
            />
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold my-2">Events</h1>
                <Link href="/dashboard/list/event">
                    <Image src="/event.png" alt="Events Icon" width={18} height={18}  className="cursor-pointer hover:opacity-80 filter invert" />
                </Link>
            </div>
            <div className="flex-grow overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-3 text-red-500">{error}</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredEvents.length > 0 ? (
                            <>
                                {displayedEvents.map((event) => (
                                    <div key={event.id} className="p-2 border rounded-lg bg-blue-100 border-blue-400 hover:bg-blue-200 transition-colors">
                                        <h2 className="font-semibold text-gray-700 text-sm">{event.title}</h2>
                                        <p className="text-xs">{event.time}</p>
                                        <p className="text-xs text-gray-500">{event.description}</p>
                                    </div>
                                ))}
                                {hasMoreEvents && (
                                    <Link href="/dashboard/list/event">
                                        <div className="text-center p-1 text-blue-500 hover:text-blue-700 cursor-pointer">
                                        View all {filteredEvents.length} events
                                        </div>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 h-full">
                                <Image src="/calendar-empty.png" alt="No Events" width={48} height={48} className="opacity-50 mb-2 filter invert" />
                                <p className="text-sm text-gray-400">No events for this date.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCalendar;
