"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Violation = {
  id: string;
  eventId: string;
  eventTitle: string;
  constraintType: string;
  severity: 'HARD' | 'SOFT';
  message: string;
  date: string;
};

const ConstraintViolationsWidget = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true);
        // This would need an API endpoint to get current violations
        const response = await fetch('http://localhost:5000/api/constraints/violations');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setViolations(data.violations || []);
      } catch (error) {
        console.error('Error fetching constraint violations:', error);
        // For demo purposes, create sample data
        setViolations([
          {
            id: "v1",
            eventId: "EVT1001",
            eventTitle: "Introduction to Computer Science",
            constraintType: "room-conflict",
            severity: "HARD",
            message: "Room R101 is already booked during this time",
            date: "2025-04-15"
          },
          // ... other sample violations
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchViolations();
  }, []);

  const hardViolations = violations.filter(v => v.severity === 'HARD');
  const softViolations = violations.filter(v => v.severity === 'SOFT');

  return (
    <div className="bg-white rounded-lg shadow p-5 h-full flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Constraint Violations</h2>
      <Link href="/dashboard/constraints" className="text-sm text-blue-500 hover:text-blue-700">
        View All
      </Link>
    </div>
      
    {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : error ? (
      <div className = "flex-grow flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-sm text-blue-500 hover:text-blue-700"> Try Again</button>
        </div>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-red-50 rounded p-3 text-center">
              <div className="flex justify-center items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-red-500 mr-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                <h3 className="text-red-700 font-medium">Hard Violations</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">{hardViolations.length}</p>
              <p className="text-xs text-red-600">Must be resolved</p>
            </div>
            
            <div className="bg-yellow-50 rounded p-3 text-center">
              <div className="flex justify-center items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-yellow-500 mr-2" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
                <h3 className="text-yellow-700 font-medium">Soft Warnings</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{softViolations.length}</p>
              <p className="text-xs text-yellow-600">Consider improving</p>
            </div>
          </div>
        
          <h3 className="text-sm font-medium text-gray-600 mt-4 mb-2">Recent Violations</h3>
          <div className="flex-grow overflow-y-auto">
            {violations.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-gray-500 text-center">No constraint violations found</p>
                <p className="text-xs text-gray-400 text-center mt-1">All your scheduling constraints are satisfied</p>
              </div>
            ) : (
              <div className="space-y-3">
                {violations.map(violation => (
                  <div key={violation.id} className={`p-3 rounded border-l-4 ${
                    violation.severity === 'HARD' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-yellow-500 bg-yellow-50'
                  }`}>
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{violation.eventTitle}</h4>
                      <span className="text-xs text-gray-500">{violation.date}</span>
                    </div>
                    <p className="text-xs my-1">{violation.message}</p>
                    <div className="flex justify-end">
                      <Link 
                        href={`/dashboard/list/event?edit=${violation.eventId}`}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Fix Issue
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConstraintViolationsWidget;