import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { role, courseData } from "@/app/lib/data";
import Image from "next/image";
import Link from "next/link";

type Course = {
  id: number;
  courseId: string;
  name: string;
  duration: string;
  totalCredits: number;
  modules: string[];
};

const columns = [
  {
    header: "Course Name",
    accessor: "name",
  },
  {
    header: "Course ID",
    accessor: "courseId",
    className: "hidden md:table-cell",
  },
  {
    header: "Duration",
    accessor: "duration",
    className: "hidden md:table-cell",
  },
  {
    header: "Total Credits",
    accessor: "totalCredits",
    className: "hidden lg:table-cell",
  },
  {
    header: "Modules",
    accessor: "modules",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const CourseListPage = () => {
  const renderRow = (item: Course) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td className="p-4">{item.name}</td>
      <td className="hidden md:table-cell">{item.courseId}</td>
      <td className="hidden md:table-cell">{item.duration}</td>
      <td className="hidden lg:table-cell">{item.totalCredits}</td>
      <td className="hidden lg:table-cell">{item.modules.join(", ")}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/list/courses/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/view.png" alt="" width={14} height={14} />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal table="course" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Courses</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="course" type="create" />}
          </div>
        </div>
      </div>
      {/* List */}
      <Table columns={columns} renderRow={renderRow} data={courseData} />
      {/* Pagination */}
      <div className="">
        <Pagination />
      </div>
    </div>
  );
};

export default CourseListPage;
