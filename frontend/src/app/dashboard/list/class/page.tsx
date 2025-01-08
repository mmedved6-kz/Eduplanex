import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { role, classData } from "@/app/lib/data";
import Image from "next/image";
import Link from "next/link";

type Class = {
  id: number;
  classId: string;
  name: string;
  course: string;
  modules: string[];
  staff: string[];
  capacity: number;
  room: string;
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Class ID",
    accessor: "classId",
    className: "hidden md:table-cell",
  },
  {
    header: "Course",
    accessor: "course",
    className: "hidden md:table-cell",
  },
  {
    header: "Modules",
    accessor: "modules",
    className: "hidden lg:table-cell",
  },
  {
    header: "Staff",
    accessor: "staff",
    className: "hidden lg:table-cell",
  },
  {
    header: "Room",
    accessor: "room",
    className: "hidden lg:table-cell",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ClassListPage = () => {
  const renderRow = (item: Class) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-400">{item.course}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.classId}</td>
      <td className="hidden md:table-cell">{item.course}</td>
      <td className="hidden lg:table-cell">{item.modules.join(", ")}</td>
      <td className="hidden lg:table-cell">{item.staff.join(", ")}</td>
      <td className="hidden lg:table-cell">{item.room}</td>
      <td className="hidden lg:table-cell">{item.capacity}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/list/class/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/view.png" alt="View" width={14} height={14} />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal table="class" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormModal table="class" type="create" />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={classData} />
      <div className="">
        <Pagination />
      </div>
    </div>
  );
};

export default ClassListPage;
