"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import FormModal from "@/app/components/FormModal";
import exp from "constants";

interface Constraint {
  id: string;
  name: string;
  description: string;
  type: 'HARD' | 'SOFT';
  category: string;
  weight?: number;
  enabled?: boolean;
  departmentSpecific?: boolean;
  departmentId?: string;
}

interface Department {
  id: string;
  name: string;
}

const ConstraintsSettingsPage = () => {
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedWeights, setEditedWeights] = useState<Record<string, number>>({});
  const [editedStatus, setEditedStatus] = useState<Record<string, boolean>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  
  const router = useRouter();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch constraints
        const constraintsResponse = await fetch('http://localhost:5000/api/constraints');
        
        if (!constraintsResponse.ok) {
          throw new Error(`HTTP error! Status: ${constraintsResponse.status}`);
        }
        
        const constraintsData = await constraintsResponse.json();
        
        if (!Array.isArray(constraintsData)) {
          console.error('Expected array of constraints, got:', constraintsData);
          throw new Error('Invalid response format: expected array of constraints');
        }
        
        // Add default weights and enabled status if they don't exist
        const constraintsWithDefaults = constraintsData.map((constraint: any) => ({
          ...constraint,
          weight: constraint.weight ?? (constraint.type === 'HARD' ? 100 : 50),
          enabled: constraint.enabled !== false, // Default to true if undefined
        }));
        
        setConstraints(constraintsWithDefaults);
        
        // Initialize edited states
        const weights: Record<string, number> = {};
        const status: Record<string, boolean> = {};
        constraintsWithDefaults.forEach((c: Constraint) => {
          weights[c.id] = c.weight || 50;
          status[c.id] = c.enabled !== false; // Default to true if undefined
        });
        setEditedWeights(weights);
        setEditedStatus(status);

        // Fetch departments for department-specific constraints
        const departmentsResponse = await fetch('http://localhost:5000/api/departments?pageSize=100');
        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          setDepartments(departmentsData.items || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleWeightChange = (id: string, value: number) => {
    setEditedWeights(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleStatusChange = (id: string, checked: boolean) => {
    setEditedStatus(prev => ({
      ...prev,
      [id]: checked
    }));
  };
  
  const handleSave = async () => {
    try {
      setSaveMessage("Saving constraint configurations...");
      
      // In a real implementation, you would save this to your backend
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format the data for saving
      const configToSave = constraints.map(constraint => ({
        id: constraint.id,
        weight: editedWeights[constraint.id] || constraint.weight,
        enabled: editedStatus[constraint.id] ?? constraint.enabled
      }));
      
      console.log('Constraint config to save:', configToSave);
      
      // Update local state to reflect changes
      setConstraints(prevConstraints => 
        prevConstraints.map(constraint => ({
          ...constraint,
          weight: editedWeights[constraint.id] || constraint.weight,
          enabled: editedStatus[constraint.id] ?? constraint.enabled
        }))
      );
      
      setSaveMessage("Constraint configurations saved successfully!");
      
      // Clear the message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving constraint configurations:', error);
      setSaveMessage(`Error: Failed to save constraint configurations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const filterConstraintsByCategory = (constraints: Constraint[], category: string) => {
    if (category === "ALL") return constraints;
    return constraints.filter(constraint => constraint.category === category);
  };

  // Get unique categories
  const categories = ["ALL", ...Array.from(new Set(constraints.map(c => c.category)))];
  
  // Filter by the active tab
  const filteredConstraints = filterConstraintsByCategory(constraints, activeTab);
  
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow flex-1">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/list/constraints" className="text-blue-500 hover:underline flex items-center">
            <Image src="/arrow-left.png" alt="Back" width={16} height={16} className="mr-1 filter invert" />
            <span>Back to Constraints</span>
          </Link>
        </div>
        <div>
          <FormModal 
            table="constraint" 
            type="create"
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Constraint Configuration</h1>
      <p className="text-gray-600 mb-6">
        Configure scheduling constraints and their weights. Hard constraints must be satisfied, 
        while soft constraints are treated as preferences with customizable importance.
      </p>
      
      {saveMessage && (
        <div className={`p-3 mb-4 rounded-md ${saveMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {saveMessage}
        </div>
      )}

      {/* Category tabs */}
      <div className="border-b mb-4">
        <div className="flex flex-wrap -mb-px">
          {categories.map(category => (
            <button
              key={category}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                activeTab === category 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Wrap the constraints list in a scrollable container */}
      <div className="max-h-[70vh] overflow-y-auto pr-2"> 
        <div className="space-y-6">
          {filteredConstraints.map((constraint: Constraint) => (
            <div key={constraint.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{constraint.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{constraint.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    constraint.type === 'HARD'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {constraint.type}
                  </span>
                  <FormModal 
                    table="constraint" 
                    type="update" 
                    id={constraint.id} 
                    data={constraint}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Weight slider (for SOFT constraints) */}
                {constraint.type === 'SOFT' && (
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Weight: {editedWeights[constraint.id] || 50}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={editedWeights[constraint.id] || 50}
                        onChange={(e) => handleWeightChange(constraint.id, parseInt(e.target.value))}
                        className="w-full"
                        disabled={!(editedStatus[constraint.id] ?? true)}
                      />
                    </div>
                  </div>
                )}

                {/* Enabled toggle */}
                <div className="flex items-center">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={editedStatus[constraint.id] ?? true}
                      onChange={(e) => handleStatusChange(constraint.id, e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                      disabled={constraint.type === 'HARD'}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {constraint.type === 'HARD' 
                        ? 'Required (Hard constraints cannot be disabled)' 
                        : 'Enabled'}
                    </span>
                  </label>
                </div>

                {/* Category display */}
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    Category: <span className="font-medium">{constraint.category}</span>
                  </span>
                </div>
              </div>

              {/* Department-specific information if applicable */}
              {constraint.departmentSpecific && (
                <div className="mt-3 bg-gray-50 p-2 rounded text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Department:</span> {
                      departments.find(d => d.id === constraint.departmentId)?.name || 'Unknown'
                    }
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save Constraint Configuration
        </button>
      </div>
    </div>
  );
};

export default ConstraintsSettingsPage;