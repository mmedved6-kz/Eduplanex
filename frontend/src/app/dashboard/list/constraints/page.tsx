"use client";

import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import Pagination from "@/app/components/Pagination";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import FormModal from "@/app/components/FormModal";

type Constraint = {
  id: string;
  name: string;
  description: string;
  type: 'HARD' | 'SOFT';
  category: string;
  enabled?: boolean;
  weight?: number;
};

const columns = [
  {
    header: "Constraint",
    accessor: "constraint",
  },
  {
    header: "Category",
    accessor: "category",
    className: "hidden md:table-cell",
  },
  {
    header: "Type",
    accessor: "type",
    className: "hidden md:table-cell",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ConstraintsListPage = () => {
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchConstraints = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/constraints');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Set data and mock pagination for now
        setConstraints(data || []);
        setTotalPages(Math.ceil(data.length / pageSize));
      } catch (error) {
        console.error('Error fetching constraints:', error);
        setError("Failed to load constraint data. Please try again later.");
      }
    };

    fetchConstraints();
  }, [currentPage, searchQuery, refreshKey]);

  // Handler functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); 
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleToggleStatus = async (constraint: Constraint) => {
    try {
      // In a real implementation, you would update this via API
      // For now, let's just log this action
      console.log(`Toggling constraint ${constraint.id} status to ${!constraint.enabled}`);
      
      // Optimistically update the UI
      setConstraints(prevConstraints => 
        prevConstraints.map(c => 
          c.id === constraint.id ? {...c, enabled: !c.enabled} : c
        )
      );
      
      // In a real implementation, you would do:
      // await fetch(`http://localhost:5000/api/constraints/${constraint.id}/toggle`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ enabled: !constraint.enabled })
      // });
      
    } catch (error) {
      console.error('Error toggling constraint status:', error);
      // Revert the optimistic update if the API call fails
      refreshData();
    }
  };

  // Render functions
  const renderConstraintCell = (item: Constraint) => (
    <div className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-xs text-gray-400">{item.description}</p>
      </div>
    </div>
  );

  const renderTypeCell = (type: string) => {
    const typeClass = type === 'HARD' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-yellow-100 text-yellow-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${typeClass}`}>
        {type}
      </span>
    );
  };

  const renderStatusCell = (item: Constraint) => {
    const isEnabled = item.enabled !== false; // Default to true if undefined
    const statusClass = isEnabled
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
        {isEnabled ? 'Enabled' : 'Disabled'}
      </span>
    );
  };

  const renderActionsCell = (item: Constraint) => (
    <div className="flex items-center gap-2">
      <button 
        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={() => handleToggleStatus(item)}
      >
        <Image 
          src={item.enabled !== false ? "/close.png" : "/check.png"} 
          alt={item.enabled !== false ? "Disable" : "Enable"} 
          width={14} 
          height={14} 
        />
      </button>
      
      <FormModal 
        table="constraint" 
        type="update" 
        id={item.id} 
        data={item}
        refreshData={refreshData}
      />
    </div>
  );

  const renderRow = (item: Constraint) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td>{renderConstraintCell(item)}</td>
      <td className="hidden md:table-cell">{item.category}</td>
      <td className="hidden md:table-cell">{renderTypeCell(item.type)}</td>
      <td className="hidden md:table-cell">{renderStatusCell(item)}</td>
      <td>{renderActionsCell(item)}</td>
    </tr>
  );

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Filter constraints based on search query
  const filteredConstraints = constraints.filter(constraint => 
    constraint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    constraint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    constraint.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate constraints
  const paginatedConstraints = filteredConstraints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white p-4 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Constraint Management</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end">
            <Link href="/dashboard/settings/constraints">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
                <Image src="/settings.png" alt="Configure" width={14} height={14} />
              </button>
            </Link>
            <FormModal 
              table="constraint" 
              type="create" 
              refreshData={refreshData}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4">
        <h2 className="text-sm font-medium text-blue-800">About Constraints</h2>
        <p className="text-xs text-blue-700 mt-1">
          Constraints define rules for scheduling events. Hard constraints must be satisfied, 
          while soft constraints are preferences that the system tries to optimize.
          You can create custom constraints or configure existing ones from this page.
        </p>
      </div>
      
      <Table 
        columns={columns} 
        renderRow={renderRow} 
        data={paginatedConstraints} 
      />
      
      <div className="">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(filteredConstraints.length / pageSize))}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ConstraintsListPage;