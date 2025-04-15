"use client"

import FilterPanel, { FilterOptions } from "@/app/components/FilterPanel";
import SortPanel from "@/app/components/SortPanel";
import EventTag from "@/app/components/EventTag";
import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { fetchEventData } from "@/app/lib/utils/fetch";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AutoScheduleModal from "@/app/components/AutoscheduleModal";

type Event = {
  id: string | number;
  title: string;
  eventDate: string; 
  timeslotId: string;
  timeslotStart: string;
  timeslotEnd: string;
  duration: number;
  moduleName: string;
  roomName: string;
  staffName: string;
  student_count: number;
  tag: string;
};

const columns = [
  {
    header: "Event",
    accessor: "event",
  },
  {
    header: "Module",
    accessor: "module",
    className: "hidden md:table-cell",
  },
  {
    header: "Time",
    accessor: "time",
    className: "hidden md:table-cell",
  },
  {
    header: "Type",
    accessor: "tag", 
    className: "hidden md:table-cell",
  },
  {
    header: "Room",
    accessor: "room",
    className: "hidden lg:table-cell",
  },
  {
    header: "Staff",
    accessor: "staff",
    className: "hidden lg:table-cell",
  },
  {
    header: "Students",
    accessor: "students",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const EventListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState('event.event_date'); 
  const [sortOrder, setSortOrder] = useState('ASC');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    moduleId: null,
    staffId: null,
  });
  const [isAutoScheduleModalOpen, setIsAutoScheduleModalOpen] = useState(false);

  useEffect(() => {
    const getEventData = async () => {
      try {
        console.log("Fetching event data with filters:", filters);
        const data = await fetchEventData(currentPage, pageSize, searchQuery, sortColumn, sortOrder, filters);
        console.log("Received events:", data.items);
        setEvents(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError("Failed to load event data. Please try again later.");
      }
    }
  
    getEventData();
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
    // Force re-fetch of event data
    const getEventData = async () => {
      try {
        const data = await fetchEventData(currentPage, pageSize, searchQuery, sortColumn, sortOrder, filters);
        setEvents(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError("Failed to load event data. Please try again later.");
      }
    };
    
    getEventData();
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "N/A";
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr;
    }
  };

  const renderEventCell = (item: Event) => (
    <div className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{item.title}</h3>
          <EventTag tag={item.tag} />
        </div>
        <p className="text-xs text-gray-400">
          {formatDateForDisplay(item.eventDate)} • {item.timeslotStart} - {item.timeslotEnd}
        </p>
      </div>
    </div>
  );

  const renderActionsCell = (item: Event) => (
    <div className="flex items-center gap-2">
      <FormModal table="event" type="update" id={item.id} data={item} refreshData={refreshData}/>
      <FormModal table="event" type="delete" id={item.id} refreshData = {refreshData}/>
    </div>
  );

  const renderRow = (item: Event) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td>{renderEventCell(item)}</td>
      <td className="hidden md:table-cell">{item.moduleName || "N/A"}</td>
      <td className="hidden md:table-cell">
        {item.timeslotStart} - {item.timeslotEnd}
      </td>
      <td className="hidden md:table-cell">
        <EventTag tag={item.tag} />
      </td>
      <td className="hidden lg:table-cell">{item.roomName || "N/A"}</td>
      <td className="hidden lg:table-cell">{item.staffName || "Unassigned"}</td>
      <td className="hidden lg:table-cell">{item.student_count || 0}</td>
      <td>{renderActionsCell(item)}</td>
    </tr>
  );

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end relative">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]" onClick={toggleFilterPanel}>
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
              <FilterPanel
                        isOpen={isFilterPanelOpen}
                        onClose={() => setIsFilterPanelOpen(false)}
                        onApply={handleFilterApply}
                        currentFilters={filters}
                        entityType="event"
                        />
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]" onClick={toggleSortPanel}>
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            <SortPanel 
                            isOpen={isSortPanelOpen}
                            onClose={() => setIsSortPanelOpen(false)}
                            onApply={handleSortApply}
                            currentColumn={sortColumn}
                            currentOrder={sortOrder}
                            entityType="event"
                          />
            <div className="flex items-center gap-4 self-end relative">
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]"
                onClick={() => setIsAutoScheduleModalOpen(true)}
                >
                  <Image src="/auto-schedule.png" alt="Auto-Schedule" width={14} height={14} />
                </button>
                <FormModal table="event" type="create" refreshData={refreshData}/>
            </div>
            <AutoScheduleModal
              isOpen={isAutoScheduleModalOpen}
              onClose={() => setIsAutoScheduleModalOpen(false)}
              />
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={events} />
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

export default EventListPage;