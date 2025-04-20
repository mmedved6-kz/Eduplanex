"use client";

import { useState } from 'react';
import Link from 'next/link';

const StudentQuickLinks = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 pb-3 border-b">
        <h2 className="text-base font-semibold text-gray-800">Quick Links</h2>
      </div>
      
      {/* Grid layout for quick links with consistent icon styling */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* View Grades Link */}
        <Link href="/dashboard/grades" className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">View Grades</span>
        </Link>
        
        {/* Course Materials Link */}
        <Link href="/dashboard/materials" className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Course Materials</span>
        </Link>
        
        {/* Library Search Link */}
        <Link href="/dashboard/library" className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Library Search</span>
        </Link>
        
        {/* Book Advisor Meeting Link */}
        <Link href="/dashboard/book-advisor" className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Book Advisor</span>
        </Link>
      </div>
      
      {/* My Statistics */}
      <div className="p-4 pt-0">
        <h3 className="text-sm font-medium text-gray-700 mb-2">My Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Current GPA */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Current GPA</p>
            <p className="text-lg font-bold">3.8</p>
          </div>
          
          {/* Course Completion */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Course Completion</p>
            <p className="text-lg font-bold">75%</p>
          </div>
          
          {/* Events This Week */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Events This Week</p>
            <p className="text-lg font-bold">8</p>
          </div>
          
          {/* Days to Next Exam */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Days to Next Exam</p>
            <p className="text-lg font-bold">12</p>
          </div>
        </div>
      </div>
      
      {/* Resources Section */}
      <div className="p-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Resources</h3>
        <div className="space-y-2">
          <a href="/resources/student-handbook" className="flex gap-2 items-center text-blue-500 hover:underline text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Student Handbook
          </a>
          <a href="/resources/it-support" className="flex gap-2 items-center text-blue-500 hover:underline text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
            IT Support
          </a>
          <a href="/resources/career-services" className="flex gap-2 items-center text-blue-500 hover:underline text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            Career Services
          </a>
          <a href="/resources/counseling" className="flex gap-2 items-center text-blue-500 hover:underline text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            Counseling Services
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentQuickLinks;