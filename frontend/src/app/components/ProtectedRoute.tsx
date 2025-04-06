"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ 
  children,
  allowedRoles = [] 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, hasRole, loading, router, allowedRoles]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null; // Will redirect to unauthorized
  }

  return <>{children}</>;
}