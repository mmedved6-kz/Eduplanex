"use client";

import Image from "next/image";
import { JSX, useCallback, useEffect, useState } from "react";

import StaffForm from "./forms/StaffForm";
import EventForm from "./forms/EventForm";
import CourseForm from "./forms/CourseForm";
import StudentForm from "./forms/StudentForm";


type TableType = "staff" | "student" | "module" | "course" | "class" | "department" | "room" | "building" | "event";
type FormType = "create" | "update" | "delete";

const forms:{
  [key:string]:(type:"create" | "update", data?:any, onClose?: () => void) => JSX.Element;
} = {
  staff: (type, data, onClose) => <StaffForm type={type} data={data} onClose={onClose} />,
  event: (type, data, onClose) => <EventForm type={type} data={data} onClose={onClose} />,
  student: (type, data, onClose) => <StudentForm type={type} data={data} onClose={onClose} />,
  course: (type, data, onClose) => <CourseForm type={type} data={data} onClose={onClose} />,
};

const FormModal = ({
  table,
  type,
  data,
  id,
  refreshData,
}: {
  table: TableType;
  type: FormType;
  data?: any;
  id?: string | number;
  refreshData?: () => void;
}) => {

  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const buttonConfig = {
    create: {
      size: "w-8 h-8",
      bgColor: "bg-[#4aa8ff] text-white hover:bg-[#5abfff]",
    },
    update: {
      size: "w-7 h-7",
      bgColor: "bg-[#4a9fff] text-white hover:bg-[#6abfff]",
    },
    delete: {
      size: "w-7 h-7",
      bgColor: "bg-[#4b8fff] text-white hover:bg-[#7abfff]",
    },
  };

  const { size, bgColor } = buttonConfig[type];



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleOpen = useCallback(() => setOpen(true), []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      if (refreshData) {
          setTimeout(() => refreshData(), 300);
      }
    }, 300);
  }, [refreshData]);

  const handleDelete = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);

    try {
      console.log(`Deleting ${table} with ID: ${id}`);
      const apiEndpoint = `http://localhost:5000/api/${table}s/${id}`;

      const response = await fetch(apiEndpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${table}`);
      }

      console.log(`Successfully deleted ${table} with ID: ${id}`);

      if (refreshData) refreshData();
      handleClose();
    } catch (error) {
      console.error(`Error deleting ${table}:`, error);
    } finally {
      setIsDeleting(false);
    }
  }, [id, table, handleClose, refreshData]);

  const renderForm = () => {
    if (type === "delete" && id !== undefined) {
      return (
      <form onSubmit={handleDelete} className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button
          type="submit"
          className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </form>
      );
    };

    if ((type === "create" || type === "update") && forms[table]) {
      console.log(`Rendering form for ${table} with data: `, data);

      if (type === "update") {
        return forms[table](type, data || {id}, handleClose);
      }
      
      return forms[table](type, data, handleClose);  
    }

    return <div className="p-4 text-red-500">Form not found</div>
  };

  return (
    <>
      {/* Button to Open Modal */}
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
        aria-label={`${type} ${table}`}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {/* Modal Section */}
      {open && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center transition-opacity duration-300" style={{ opacity: isClosing ? 0 : 1 }} role="dialog"> 
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] transition=-all duration-300" style={{ transform: isClosing ? "scale(0.9)" : "scale(1)", opacity: isClosing ? 0 : 1 }}>               
            
            {/* Close Button */}
            <div
              className="absolute top-4 right-4 cursor-pointer transition-transform duration-200 hover:scale-110"
              onClick={handleClose}
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>

            {/* Form Rendering Here */}
            {renderForm()}
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
