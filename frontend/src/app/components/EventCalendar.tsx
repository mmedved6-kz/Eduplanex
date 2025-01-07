"use client"

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import Image from 'next/image';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

// TEST

// Define a simpler type for events (direct date comparison)
type Event = {
    id: number;
    title: string;
    time: string;
    description: string;
    date: Date;
};

const events = [
    {
        id: 1,
        title: "Test class 1", 
        date: new Date(2025, 0, 7),
        time: "10:00 AM - 11:00 AM",
        description: "This is a test class",
    },
    {
        id: 2,
        title: "Test class 2",
        date: new Date(2025, 0, 10),
        time: "11:00 AM - 12:00 PM",
        description: "This is a test class",
    }
];


const ClassCalendar = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    
    useEffect(() => {
        setSelectedDate(new Date());
    }, []);

    // Handle date change and filter events
    const handleDateChange = (value: Value) => {
        if (value instanceof Date) {
            setSelectedDate(value);
            const matchedEvents = events.filter(event =>
                event.date.toDateString() === value.toDateString()
            );
            setFilteredEvents(matchedEvents);
        }
    };

  return (
    <div className="bg-white p-5 rounded-md">
        <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={({ date }) =>
                    events.some(event => event.date.toDateString() === date.toDateString()) ? (
                        <div className="flex justify-center items-center">
                            <span className="text-blue-500 font-bold translate-y-1 text-sm">●</span>
                        </div>
                    ) : null
                }
            />
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold my-4">Events</h1>
            <Image src="/logo.png" alt="" width={20} height={20} />
        </div>
        <div className="flex flex-col gap-4 mt-4">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className="p-4 border rounded-lg bg-blue-100 border-blue-400"
                        >
                            <h2 className="font-semibold text-gray-700">{event.title}</h2>
                            <p className="text-sm">{event.time}</p>
                            <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-400">No events for this date.</p>
                )}
            </div>
    </div>
  );
};

export default ClassCalendar;