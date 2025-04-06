// app/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('user');

    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            setIsAuthenticated(true);


            if (user.role === 'admin') {
                router.push('/dashboard/staff');
            } else if (user.role === 'staff') {
                router.push('/dashboard/staff');
            } else if (user.role === 'student') {
                router.push('/dashboard/student');
            }
        } catch (error) {
            setIsAuthenticated(false);
        }
    } else {
        setIsAuthenticated(false);
    }

    setLoading(false);
  }, [router]);

  const handleLogin = () => {
    router.push('/login');
  };

  if (loading) {
    return (
        <div className='flex items-center justify-center h-screen bg-gray-50'>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
    )
  }

  if (isAuthenticated) {
    return (
        <div className='flex items-center justify-center h-screen bg-gray-50'>
            <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 borded-b-2 border-blue-500 mx-auto mb-4' />
                <p className='text-gray-600'>Redirecting to your dashboard...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Eduplanex</h1>
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            University Scheduling & Management System
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive platform for managing university courses, staff, students, and events.
          </p>
          <div className="mt-8">
            <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} Eduplanex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}