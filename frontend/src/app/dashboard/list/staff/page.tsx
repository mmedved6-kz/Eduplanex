"use client";

import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
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
  address: string;
  img: string;
  sex: string;
  createdAt: string;
  updatedAt: string;
  birthday: string;
  departmentId: number;
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
  const [staff, setStaff] = useState<Staff[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStaffData = async () => {
      try {
        const data = await fetchStaffData();
        setStaff(data);
      } catch (error) {
        setError("Failed to load staff data. Please try again later.");
      }
    };

    getStaffData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>
  }
  
  const renderInfoCell = (item: Staff) => (
    <div className="flex items-center gap-4 p-4">
      <Image
        src={item.img || "/avatar.png"} // Use a default image if img is empty
        alt="Image"
        width={40}
        height={40}
        className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name} {item.surname}</h3>
        <p className="text-xs text-gray-400">{item.email}</p>
      </div>
    </div>
  );

  const renderActionsCell = (item: Staff) => (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/list/staff/${item.id}`}>
        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#4aa8ff] hover:bg-[#5abfff]">
          <Image src="/view.png" alt="" width={14} height={14} />
        </button>
      </Link>
      <FormModal table="staff" type="delete" id={Number(item.id)}/>
    </div>
  );
  
  const renderRow = (item: Staff) => (
    <tr key={item.id} className="border-b border-gray-100 even:bg-gray-50 text-sm hover:bg-gray-100">
      <td>{renderInfoCell(item)}</td>
      <td className="hidden md:table-cell">{item.id}</td>
      <td className="hidden md:table-cell">{item.departmentName || "N/A"}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>{renderActionsCell(item)}</td>
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
            <FormModal table="staff" type="create" />
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={staff} />
      <div className="">
        <Pagination />
      </div>
    </div>
  );
};

export default StaffListPage;

