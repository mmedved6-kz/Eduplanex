"use client";

import EventCalendar from "@/app/components/EventCalendar";
import Announcements from "@/app/components/Announcements";
import RequireAuth from "@/app/components/RequireAuth";
import DashboardStats from "@/app/components/AdminDashboardAnalytics";
import ConstraintViolationsWidget from "@/app/components/AdminDashboardConstraintsWidget";
import ActionItemsWidget from "@/app/components/AdminActionItemWIdget";
import { useEffect, useState } from "react";
import Link from "next/link";

const AdminPage = () => {
  return (
    <RequireAuth allowedRoles={["admin"]}>
      <div className="p-4 flex flex-col gap-3 h-full">
        <h1 className="text-2xl font-bold mb-1">Dashboard Overview</h1>
        
        {/* Main Content Area - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
          {/* Left Column - Stats, Violations, Action Items */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Dashboard Stats Panel */}
            <DashboardStats />
            
            {/* Two Column Layout for Constraint Violations and Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
              {/* Constraint Violations Widget - using CSS Grid to fill space */}
              <div className="flex flex-col h-full">
                <ConstraintViolationsWidget />
              </div>
              
              {/* Action Items Widget - using CSS Grid to fill space */}
              <div className="flex flex-col h-full">
                <ActionItemsWidget />
              </div>
            </div>
          </div>
          
          {/* Right Column - Calendar & Announcements */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Expanded calendar height */}
            <div className="flex-grow">
              <EventCalendar />
            </div>
            <div>
              <Announcements />
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

export default AdminPage;