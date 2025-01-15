"use client";

import Image from "next/image";
import { JSX, useState } from "react";
import TeacherForm from "./forms/TeacherForm";

const forms:{
  [key:string]:(type:"create" | "update", data?:any) => JSX.Element;
} = {
  staff: (type, data) => <TeacherForm type={type} data={data} />,
};

const FormModal = ({
  table,
  type,
  data,
  id,
}: {
  table: "staff" | "student" | "module" | "course" | "class" | "department" | "room" | "building" | "event";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
    ? "bg-[#4aa8ff] text-white hover:bg-[#5abfff]"
    : type === "update"
    ? "bg-[#4a9fff] text-white hover:bg-[#6abfff]"
    : "bg-[#4b8fff] text-white hover:bg-[#7abfff]";

  const [open, setOpen] = useState(false);

  const Form = () => {
    return type === "delete" && id ? (
      <form action="" className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button
          type="submit"
          className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center"
        >
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](type, data)
    ) : (
      "Form not found"
    );
  };

  return (
    <>
      {/* Button to Open Modal */}
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {/* Modal Section */}
      {open && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            
            {/* Close Button */}
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>

            {/* Form Rendering Here */}
            <Form />
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
