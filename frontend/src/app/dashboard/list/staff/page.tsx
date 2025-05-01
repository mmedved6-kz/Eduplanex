"use client";

import FilterPanel, { FilterOptions } from "@/app/components/FilterPanel";
import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import SortPanel from "@/app/components/SortPanel";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { fetchStaffData } from "@/app/lib/utils/fetch";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Staff {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  img: string;
  sex: string;
  position: string;
  departmentName: string;
}

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Staff ID",
    accessor: "staffId",
    className: "hidden md:table-cell",
  },
  {
    header: "Department",
    accessor: "department",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Position",
    accessor: "position",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const StaffListPage = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('staff.name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    departmentId: null,
    sex: null,
  });

  useEffect(() => {
    const getStaffData = async () => {
      try {
        const data = await fetchStaffData(currentPage, pageSize, searchQuery, sortColumn, sortOrder, filters);
        setStaff(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError("Failed to load staff data. Please try again later.");
      }
    };

    getStaffData();
  }, [currentPage, searchQuery, sortColumn, sortOrder, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); 
  };

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
    if (isSortPanelOpen) setIsSortPanelOpen(false);
  };

  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const toggleSortPanel = () => {
    setIsSortPanelOpen(!isSortPanelOpen);
    if (isFilterPanelOpen) setIsFilterPanelOpen(false);
  };

  const handleSortApply = (column: string, order: string) => {
    setSortColumn(column);
    setSortOrder(order);
    setCurrentPage(1); 
  };

  const refreshData = () => {
    const getStaffData = async () => {
      try {
        const data = await fetchStaffData(currentPage, pageSize, searchQuery, sortColumn, sortOrder, filters);
        setStaff(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError("Failed to load staff data. Please try again later.");
      }
    };

    getStaffData();
  }

  const renderInfoCell = (item: Staff) => (
    <div className="flex items-center gap-4 p-4">
      <Image
        src={item.img || "/avatar.png"} 
        alt="Image"
        width={40}
        height={40}
        className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold">
          {item.name} {item.surname}
        </h3>
        <p className="text-xs text-gray-400">{item.email}</p>
      </div>
    </div>
  );

  const renderActionsCell = (item: Staff) => (
    <div className="flex items-center gap-2">
      <FormModal table="staff" type="update" id={item.id} refreshData={refreshData} />
      <FormModal table="staff" type="delete" id={item.id} refreshData={refreshData} />
    </div>
  );

  const renderRow = (item: Staff) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td>{renderInfoCell(item)}</td>
      <td className="hidden md:table-cell">{item.id}</td>
      <td className="hidden md:table-cell">{item.departmentName || "N/A"}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.position || "Unassigned"}</td>
      <td>{renderActionsCell(item)}</td>
    </tr>
  );

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Staff</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end relative">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]"
              onClick={toggleFilterPanel}>
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <FilterPanel
              isOpen={isFilterPanelOpen}
              onClose={() => setIsFilterPanelOpen(false)}
              onApply={handleFilterApply}
              currentFilters={filters}
              entityType="staff"
            />
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
                entityType="staff"
              />
            </div>
            <FormModal table="staff" type="create" refreshData={refreshData}/>
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={staff} />
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

export default StaffListPage;
