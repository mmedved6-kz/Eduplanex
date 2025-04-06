"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "staff" | "student";

interface User {
  id: string;
  name: string;
  role: UserRole;
}

export default function RequireAuth({ 
  children,
  allowedRoles = [] 
}: { 
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
        router.push("/unauthorized");
      }
    } else {
      router.push("/login");
    }
    
    setLoading(false);
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}