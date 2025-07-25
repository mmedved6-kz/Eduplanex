"use client";

import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    roomUtilization: 0,
    staffWorkload: 0,
    scheduledEvents: 0,
    constraintSatisfaction: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/stats/dashboard');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Dashboard stats response:", data); // Debug log
        
        if (!data || 
            typeof data.roomUtilization === 'undefined' || 
            typeof data.staffWorkload === 'undefined' || 
            typeof data.scheduledEvents === 'undefined' || 
            typeof data.constraintSatisfaction === 'undefined') {
          throw new Error('Invalid response format: missing expected statistics');
        }

        setStats({
          roomUtilization: data.roomUtilization,
          staffWorkload: data.staffWorkload,
          scheduledEvents: data.scheduledEvents,
          constraintSatisfaction: data.constraintSatisfaction
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(`Failed to load dashboard statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg shadow h-24 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 text-sm mb-4">
        <p className="font-medium mb-1">Error loading dashboard statistics</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Room Utilization */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center">
        <div className="w-16 h-16 mr-4">
          <CircularProgressbar
            value={stats.roomUtilization}
            text={`${stats.roomUtilization}%`}
            styles={buildStyles({
              textSize: "24px",
              pathColor: "#4aa8ff",
              textColor: "#4aa8ff",
            })}
          />
        </div>
        <div>
          <h3 className="text-gray-600 text-sm font-medium">
            Room Utilization
          </h3>
          <p className="text-xs text-gray-500 mt-1">Available space usage</p>
        </div>
      </div>

      {/* Staff Workload */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center">
        <div className="w-16 h-16 mr-4">
          <CircularProgressbar
            value={Math.min(100, (stats.staffWorkload / 20) * 100)}
            text={`${stats.staffWorkload}h`}
            styles={buildStyles({
              textSize: "24px",
              pathColor: "#4aa8ff",
              textColor: "#4aa8ff",
            })}
          />
        </div>
        <div>
          <h3 className="text-gray-600 text-sm font-medium">Staff Workload</h3>
          <p className="text-xs text-gray-500 mt-1">Average hours per week</p>
        </div>
      </div>

      {/* Scheduled Events */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center">
        <div className="w-16 h-16 mr-4">
          <CircularProgressbar
            value={Math.min(100, (stats.scheduledEvents / 100) * 100)}
            text={`${stats.scheduledEvents}`}
            styles={buildStyles({
              textSize: "24px",
              pathColor: "#4aa8ff",
              textColor: "#4aa8ff",
            })}
          />
        </div>
        <div>
          <h3 className="text-gray-600 text-sm font-medium">
            Scheduled Events
          </h3>
          <p className="text-xs text-gray-500 mt-1">Total upcoming events</p>
        </div>
      </div>

      {/* Constraint Satisfaction */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center">
        <div className="w-16 h-16 mr-4">
          <CircularProgressbar
            value={stats.constraintSatisfaction}
            text={`${stats.constraintSatisfaction}%`}
            styles={buildStyles({
              textSize: "24px",
              pathColor:
                stats.constraintSatisfaction > 80 ? "#10b981" : "#f59e0b",
              textColor:
                stats.constraintSatisfaction > 80 ? "#10b981" : "#f59e0b",
            })}
          />
        </div>
        <div>
          <h3 className="text-gray-600 text-sm font-medium">
            Constraint Status
          </h3>
          <p className="text-xs text-gray-500 mt-1">Scheduling satisfaction</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;