"use client";

import { useState } from 'react';
import BigCalendar from "@/app/components/BigCalendar";
import QuickLinks from "@/app/components/QuickLinks";
import Announcements from "@/app/components/Announcements";
import RequireAuth from "@/app/components/RequireAuth";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StaffPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('work_week');
  
  // Calendar navigation
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - (view === 'work_week' ? 7 : 1));
    setCurrentDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (view === 'work_week' ? 7 : 1));
    setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Format date for display
  const formatDate = () => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Format date range for the week view
  const formatDateRange = () => {
    // Find start of week (Monday)
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(diff);
    
    // Find end of week (Friday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4);
    
    const formatMonth = (date: Date) => date.toLocaleDateString('en-US', { month: 'long' });
    const startMonth = formatMonth(startOfWeek);
    const endMonth = formatMonth(endOfWeek);
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
    } else {
      return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
    }
  };
  
  // Handle view change
  const handleViewChange = (newView: string) => {
    setView(newView);
  };
  
  return (
    <RequireAuth allowedRoles={["admin", "staff"]}>
      <div className="flex-1 p-4 flex gap-4 h-screen overflow-hidden">
        {/* LEFT SIDE - Calendar */}
        <div className="w-full lg:w-3/4 h-full flex flex-col">
          <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-hidden">
            {/* Calendar Header - Replace "Schedule" with current date and use a single line */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold text-gray-800">
                {view === 'work_week' ? formatDateRange() : formatDate()}
              </h1>
              
              <div className="flex items-center gap-3">
                {/* Navigation buttons on the same line */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handlePrev} 
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={handleToday} 
                    className="px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded"
                  >
                    Today
                  </button>
                  <button 
                    onClick={handleNext} 
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Next
                  </button>
                </div>
                
                {/* View controls */}
                <div className="flex border rounded overflow-hidden">
                  <button 
                    onClick={() => handleViewChange('work_week')} 
                    className={`px-3 py-1 text-xs ${view === 'work_week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    Work Week
                  </button>
                  <button 
                    onClick={() => handleViewChange('day')} 
                    className={`px-3 py-1 text-xs ${view === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    Day
                  </button>
                </div>
              </div>
            </div>
            
            {/* Calendar Component - passing props to control it from here */}
            <div className="h-[calc(100%-60px)] overflow-hidden">
              <BigCalendar 
                hideToolbar={true}
                date={currentDate}
                view={view}
                onNavigate={setCurrentDate}
                onView={handleViewChange}
                showCurrentTimeIndicator={true}
                showDayHeaders={true}
                timeLabelsColor="text-gray-400 text-xs" // Making time labels more subtle
              />
            </div>
          </div>
        </div>
        
        {/* RIGHT SIDE - Widgets */} 
        <div className="hidden lg:flex lg:w-1/4 flex-col gap-4 overflow-y-auto">
          {/* QuickLinks Widget */}
          <QuickLinks />
          
          {/* Announcements Widget */}
          <Announcements />
        </div>
        
        {/* Toast Container for notifications */}
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </RequireAuth>
  );
}

export default StaffPage;