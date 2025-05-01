"use client"

import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import SortPanel from "@/app/components/SortPanel";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { fetchDepartmentData } from "@/app/lib/utils/fetch";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Department = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const columns = [
  {
    header: "Department",
    accessor: "department",
  },
  {
    header: "Created",
    accessor: "created",
    className: "hidden md:table-cell",
  },
  {
    header: "Updated",
    accessor: "updated",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const DepartmentListPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('department.name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);

  useEffect(() => {
    const getDepartmentData = async () => {
      try {
        const data = await fetchDepartmentData(currentPage, pageSize, searchQuery, sortColumn, sortOrder);
        setDepartments(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError("Failed to load department data. Please try again later.");
      }
    }

    getDepartmentData();
  }, [currentPage, searchQuery, sortColumn, sortOrder]);

  // Handler functions (same pattern as other list pages)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); 
  };

  const handleSortApply = (column: string, order: string) => {
    setSortColumn(column);
    setSortOrder(order);
    setCurrentPage(1); 
  };

  const toggleSortPanel = () => {
    setIsSortPanelOpen(!isSortPanelOpen);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render functions
  const renderDepartmentCell = (item: Department) => (
    <div className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-xs text-gray-400">ID: {item.id}</p>
      </div>
    </div>
  );

  const renderActionsCell = (item: Department) => (
    <div className="flex items-center gap-2">
      <FormModal table="department" type="delete" id={item.id}/>
    </div>
  );

  const renderRow = (item: Department) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td>{renderDepartmentCell(item)}</td>
      <td className="hidden md:table-cell">{formatDate(item.createdAt)}</td>
      <td className="hidden lg:table-cell">{formatDate(item.updatedAt)}</td>
      <td>{renderActionsCell(item)}</td>
    </tr>
  );

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Departments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end">
            <div className="relative">
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]" 
                onClick={toggleSortPanel}
              >
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              <SortPanel 
                isOpen={isSortPanelOpen}
                onClose={() => setIsSortPanelOpen(false)}
                onApply={handleSortApply}
                currentColumn={sortColumn}
                currentOrder={sortOrder}
                entityType="department"
              />
            </div>

          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={departments} />
      <div className="">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default DepartmentListPage;