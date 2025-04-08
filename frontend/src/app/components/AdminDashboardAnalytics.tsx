"use client";

import { useEffect, useState } from "react";

const DashboardStats = () => {
    const [stats, setStats] = useState({
      roomUtilization: 0,
      staffWorkload: 0,
      scheduledEvents: 0,
      constraintSatisfaction: 0
    });
    
    useEffect(() => {
      const fetchStats = async () => {
        try {
          const response = await fetch('/api/stats/dashboard');
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      };
      
      fetchStats();
    }, []);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Room Utilization</h3>
          <p className="text-2xl font-semibold">{stats.roomUtilization}%</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Staff Workload</h3>
          <p className="text-2xl font-semibold">{stats.staffWorkload} hrs/week</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Scheduled Events</h3>
          <p className="text-2xl font-semibold">{stats.scheduledEvents}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Constraint Satisfaction</h3>
          <p className="text-2xl font-semibold">{stats.constraintSatisfaction}%</p>
        </div>
      </div>
    );
  };

  export default DashboardStats;