"use client"

import FilterPanel, { FilterOptions } from "@/app/components/FilterPanel";
import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import SortPanel from "@/app/components/SortPanel";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { fetchRoomData } from "@/app/lib/utils/fetch";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Room = {
  id: string;
  name: string;
  roomType: string;
  capacity: number;
  buildingId: string;
  buildingName: string;
  equipment: string;
};

const columns = [
  {
    header: "Room",
    accessor: "room",
  },
  {
    header: "Room Type",
    accessor: "type",
    className: "hidden md:table-cell",
  },
  {
    header: "Building",
    accessor: "building",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const RoomListPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('room.name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    buildingId: null,
  });

  useEffect(() => {
    const getRoomData = async () => {
      try {
        const data = await fetchRoomData(currentPage, pageSize, searchQuery, sortColumn, sortOrder, filters);
        setRooms(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError("Failed to load room data. Please try again later.");
      }
    }

    getRoomData();
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
  const renderRoomCell = (item: Room) => (
    <div className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-xs text-gray-400">Capacity: {item.capacity}</p>
      </div>
    </div>
  );

  const renderActionsCell = (item: Room) => (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/list/room/${item.id}`}>
        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
          <Image src="/view.png" alt="View" width={14} height={14} />
        </button>
      </Link>
      <FormModal table="room" type="delete" id={item.id}/>
    </div>
  );

  const renderRow = (item: Room) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td>{renderRoomCell(item)}</td>
      <td className="hidden md:table-cell">{item.roomType}</td>
      <td className="hidden md:table-cell">{item.buildingName}</td>
      <td>{renderActionsCell(item)}</td>
    </tr>
  );

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Rooms</h1>
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
              entityType="room"
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
                entityType="room"
              />
            </div>
            <FormModal table="room" type="create" />
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={rooms} />
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

export default RoomListPage;