"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);


    try {
        // For now, hardcoded values for quick development
        // Replace this with actual API calls later
        if (email === "admin@edu.com" && password === "password123") {
          // Store user info
          localStorage.setItem("user", JSON.stringify({
            id: 1,
            email: "admin@edu.com",
            role: "admin"
          }));
          router.push("/dashboard/staff");
        } else if (email === "staff@edu.com" && password === "password123") {
          localStorage.setItem("user", JSON.stringify({
            id: 2,
            email: "staff@edu.com",
            role: "staff"
          }));
          router.push("/dashboard/staff");
        } else if (email === "student@edu.com" && password === "password123") {
          localStorage.setItem("user", JSON.stringify({
            id: 3,
            email: "student@edu.com",
            role: "student"
          }));
          router.push("/dashboard/student");
        } else {
          setError("Invalid email or password");
        }
      } catch (error) {
        setError("An error occurred during login");
      } finally {
        setLoading(false);
      }
    };
  


    /** 
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();
      
      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Navigate based on role
      if (data.user.role === "admin") {
        router.push("/dashboard/staff");
      } else if (data.user.role === "staff") {
        router.push("/dashboard/staff");
      } else {
        router.push("/dashboard/student");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Eduplanex</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}