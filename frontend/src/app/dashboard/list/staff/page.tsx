import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { role, staffData } from "@/app/lib/data";
import Image from "next/image";
import Link from "next/link";

type Staff = {
  id: number;
  staffId: string;
  name: string;
  email?: string;
  photo: string;
  phone: string;
  department: string;
  modules: string[];
  address: string;
};

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
    header: "Modules Taught",
    accessor: "modules",
    className: "hidden lg:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const StaffListPage = () => {
  const renderRow = (item: Staff) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />

        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-400">{item.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.staffId}</td>
      <td className="hidden md:table-cell">{item.department}</td>
      <td className="hidden lg:table-cell">{item.modules.join(", ")}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/list/staff/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/view.png" alt="" width={14} height={14} />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal table="staff" type="delete" id={item.id}/>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Staff</h1>
        <div className=" flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormModal table="staff" type="create" />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={staffData} />
      <div className="">
        <Pagination />
      </div>
    </div>
  );
};

export default StaffListPage;

