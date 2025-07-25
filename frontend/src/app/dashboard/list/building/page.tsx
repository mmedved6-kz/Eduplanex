"use client"

import FilterPanel, { FilterOptions } from "@/app/components/FilterPanel";
import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import SortPanel from "@/app/components/SortPanel";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { fetchBuildingData } from "@/app/lib/utils/fetch";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Building = {
  id: string;
  name: string;
  location: string;
  createdAt: string;
};

const columns = [
  {
    header: "Building",
    accessor: "building",
  },
  {
    header: "Location",
    accessor: "location",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const BuildingListPage = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('building.name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    const getBuildingData = async () => {
      try {
        const data = await fetchBuildingData(currentPage, pageSize, searchQuery, sortColumn, sortOrder, filters);
        setBuildings(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError("Failed to load building data. Please try again later.");
      }
    }

    getBuildingData();
  }, [currentPage, searchQuery, sortColumn, sortOrder, filters]);

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

  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
    if (isSortPanelOpen) setIsSortPanelOpen(false);
  };

  const toggleSortPanel = () => {
    setIsSortPanelOpen(!isSortPanelOpen);
    if (isFilterPanelOpen) setIsFilterPanelOpen(false);
  };

  // Render functions
  const renderBuildingCell = (item: Building) => (
    <div className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-xs text-gray-400">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );

  const renderActionsCell = (item: Building) => (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/list/building/${item.id}`}>
        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
          <Image src="/view.png" alt="View" width={14} height={14} />
        </button>
      </Link>
      <FormModal table="building" type="delete" id={item.id}/>
    </div>
  );

  const renderRow = (item: Building) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td>{renderBuildingCell(item)}</td>
      <td className="hidden md:table-cell">{item.location}</td>
      <td>{renderActionsCell(item)}</td>
    </tr>
  );

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Buildings</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end relative">
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]"
              onClick={toggleFilterPanel}
            >
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <FilterPanel
              isOpen={isFilterPanelOpen}
              onClose={() => setIsFilterPanelOpen(false)}
              onApply={handleFilterApply}
              currentFilters={filters}
              entityType="building"
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
                entityType="building"
              />
            </div>
            <FormModal table="building" type="create" />
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={buildings} />
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

export default BuildingListPage;
