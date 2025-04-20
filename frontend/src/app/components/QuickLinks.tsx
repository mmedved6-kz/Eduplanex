"use client";

import { useState } from 'react';
import Link from 'next/link';
import SubmitRequestPanel from './SubmitRequestPanel';

const QuickLinks = () => {
  const [isRequestPanelOpen, setIsRequestPanelOpen] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 pb-3 border-b">
        <h2 className="text-base font-semibold text-gray-800">Quick Links</h2>
      </div>
      
      {/* Grid layout for quick links with consistent icon styling */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Submit Request Button */}
        <button 
          onClick={() => setIsRequestPanelOpen(true)}
          className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Submit Request</span>
        </button>
        
        {/* My Schedule Link */}
        <Link href="/dashboard/list/event" className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">My Schedule</span>
        </Link>
        
        {/* Staff Directory Link */}
        <Link href="/dashboard/list/staff" className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Staff Directory</span>
        </Link>
        
        {/* Resources Link */}
        <Link href="/resources" className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Resources</span>
        </Link>
      </div>
      
      {/* My Statistics */}
      <div className="p-4 pt-0">
        <h3 className="text-sm font-medium text-gray-700 mb-2">My Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Teaching Hours */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Teaching Hours</p>
            <p className="text-lg font-bold">16 hrs</p>
          </div>
          
          {/* Assigned Modules */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Assigned Modules</p>
            <p className="text-lg font-bold">4</p>
          </div>
          
          {/* Events This Week */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Events This Week</p>
            <p className="text-lg font-bold">8</p>
          </div>
          
          {/* Room Utilization */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Room Utilization</p>
            <p className="text-lg font-bold">86%</p>
          </div>
        </div>
      </div>
      
      {/* Resources Section */}
      <div className="p-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Resources</h3>
        <div className="space-y-2">
          <a href="/resources/teaching" className="flex gap-2 items-center text-blue-500 hover:underline text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Teaching Guidelines
          </a>
          <a href="/resources/it-support" className="flex gap-2 items-center text-blue-500 hover:underline text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
            IT Support
          </a>
          <a href="/resources/policies" className="flex gap-2 items-center text-blue-500 hover:underline text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            University Policies
          </a>
          <a href="/resources/forms" className="flex gap-2 items-center text-blue-500 hover:underline text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            Forms & Documents
          </a>
        </div>
      </div>
      
      {/* Submit Request Panel */}
      <SubmitRequestPanel 
        isOpen={isRequestPanelOpen} 
        onClose={() => setIsRequestPanelOpen(false)} 
      />
    </div>
  );
};

export default QuickLinks;