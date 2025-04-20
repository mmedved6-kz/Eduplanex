"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Announcement {
  id: string;
  title: string;
  date: string;
  description: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Test Announcement',
      date: '2025-01-07',
      description: 'Test description'
    },
    {
      id: '2',
      title: 'Test Announcement 2',
      date: '2025-01-07',
      description: 'Test description'
    },
    {
      id: '3',
      title: 'Test Announcement 3',
      date: '2025-01-07',
      description: 'Test description'
    }
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 pb-3 border-b flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">Announcements</h2>
        <Link href="/announcements" className="text-xs text-blue-500 hover:underline">View All</Link>
      </div>
      
      <div className="p-4 space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-gray-800">{announcement.title}</h3>
              <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                {formatDate(announcement.date)}
              </span>
            </div>
            <p className="text-xs text-gray-600">{announcement.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;