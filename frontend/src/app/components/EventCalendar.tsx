"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import Image from 'next/image';

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

const ClassCalendar = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setSelectedDate(new Date()); 
        setIsMounted(true);

        const fetchEvents = async () => {
            try {
              setLoading(true);
              const response = await fetch('http://localhost:5000/api/events/calendar');
              
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              
              const data = await response.json();
              // Transform API data to the format needed by the calendar
              if (data.items && Array.isArray(data.items)) {
                const formattedEvents = data.items.map((event: any) => ({
                  id: event.id,
                  title: event.title,
                  date: new Date(event.startTime || event.start_time),
                  time: `${new Date(event.startTime || event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                         ${new Date(event.endTime || event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                  description: event.description || "No description available"
                }));
                setEvents(formattedEvents);
                
                // Filter events for selected date (or today if none selected)
                const currentDate = selectedDate || new Date();
                const filteredEvents = formattedEvents.filter((event: Event) => 
                  formatDate(event.date) === formatDate(currentDate)
                );
                setFilteredEvents(filteredEvents);
              } else {
                throw new Error('Invalid response format');
              }
            } catch (error) {
              console.error('Error fetching events:', error);
              
              // Use hard-coded test events as fallback
              const testEvents = [
                {
                  id: 1,
                  title: "Test class 1", 
                  date: new Date(2025, 3, 10),
                  time: "10:00 AM - 11:00 AM",
                  description: "This is a test class",
                },
                {
                  id: 2,
                  title: "Test class 2",
                  date: new Date(2025, 3, 11),
                  time: "11:00 AM - 12:00 PM",
                  description: "This is a test class",
                },
                {
                  id: 3,
                  title: "Today's Class",
                  date: new Date(), // Today
                  time: "2:00 PM - 3:00 PM",
                  description: "This class is scheduled for today",
                }
              ];
              setEvents(testEvents);
              
              // Filter for selected date
              const currentDate = selectedDate || new Date();
              const filteredEvents = testEvents.filter(event => 
                formatDate(event.date) === formatDate(currentDate)
              );
              setFilteredEvents(filteredEvents);
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
                <h1 className="text-xl font-semibold my-4">Events</h1>
                <Image src="/exam.png" alt="Events Icon" width={20} height={20} />
            </div>
            <div className="flex-grow overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500">{error}</div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-3 border rounded-lg bg-blue-100 border-blue-400 hover:bg-blue-200 transition-colors"
                                >
                                    <h2 className="font-semibold text-gray-700">{event.title}</h2>
                                    <p className="text-sm">{event.time}</p>
                                    <p className="text-sm text-gray-500">{event.description}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <Image src="/calendar-empty.png" alt="No Events" width={48} height={48} className="opacity-50 mb-2" />
                                <p className="text-sm text-gray-400">No events for this date.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassCalendar;
