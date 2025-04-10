"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ActionItem = {
  id: string;
  title: string;
  type: 'unassigned' | 'conflict' | 'capacity' | 'allocation' | 'pending';
  entityId: string;
  entityType: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
};

const ActionItemsWidget = () => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'pending'>('all');

  useEffect(() => {
    const fetchActionItems = async () => {
      try {
        setLoading(true);
        // In a real implementation, fetch from your API
        // For demo, we'll use mock data
        setTimeout(() => {
          setActionItems([
            {
              id: 'act1',
              title: 'Room B301 double-booked',
              type: 'conflict',
              entityId: 'EVT1234',
              entityType: 'event',
              priority: 'high',
              createdAt: '2025-04-09',
            },
            {
              id: 'act2',
              title: 'Database Systems class needs staff assignment',
              type: 'unassigned',
              entityId: 'EVT2345',
              entityType: 'event',
              priority: 'high',
              createdAt: '2025-04-08',
            },
            {
              id: 'act3',
              title: 'Room capacity insufficient for AI Workshop',
              type: 'capacity',
              entityId: 'EVT3456',
              entityType: 'event',
              priority: 'medium',
              createdAt: '2025-04-07',
            },
            {
              id: 'act4',
              title: 'Student allocation pending for Mobile Dev course',
              type: 'allocation',
              entityId: 'CRS1001',
              entityType: 'course',
              priority: 'medium',
              createdAt: '2025-04-06',
            },
            {
              id: 'act5',
              title: 'Resource approval pending for CS Workshop',
              type: 'pending',
              entityId: 'EVT4567',
              entityType: 'event',
              priority: 'low',
              createdAt: '2025-04-05',
            },
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching action items:', error);
        setLoading(false);
      }
    };
    
    fetchActionItems();
  }, []);

  const filteredItems = actionItems.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return item.priority === 'high';
    if (activeTab === 'pending') return item.type === 'pending' || item.type === 'unassigned';
    return true;
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'conflict':
        return (
          <div className="rounded-full bg-red-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'unassigned':
        return (
          <div className="rounded-full bg-orange-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'capacity':
        return (
          <div className="rounded-full bg-yellow-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      case 'allocation':
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'pending':
        return (
          <div className="rounded-full bg-gray-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
    }
  };

  const getActionLink = (item: ActionItem) => {
    switch (item.entityType) {
      case 'event':
        return `/dashboard/list/event?edit=${item.entityId}`;
      case 'course':
        return `/dashboard/list/course?edit=${item.entityId}`;
      default:
        return '#';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 h-full flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Action Items</h2>
      <Link href="/dashboard/actions" className="text-sm text-blue-500 hover:text-blue-700">
        View All
      </Link>
    </div>

      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'critical'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('critical')}
        >
          Critical
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'pending'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
      </div>
      
      {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : (
        <div className="flex-grow overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No action items found</p>
              <p className="text-xs text-gray-400 mt-1">All tasks are completed or filtered out</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-start p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="mr-3 mt-1">
                    {getItemIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.title}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{item.createdAt}</span>
                      <Link 
                        href={getActionLink(item)}
                        className="text-xs px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors shadow-sm"
                      >
                        Resolve
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionItemsWidget;