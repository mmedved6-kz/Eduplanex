"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const schema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    credits: z.number().min(1, { message: "Credits is required" }),
    departmentId: z.string().min(1, { message: "Department ID is required" }),
});

type Inputs = z.infer<typeof schema>;

type TabType = "Course Details" | "Resources";

const generateCourseId = () => {
    const prefix = 'CRS';
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomSuffix}`;
}

const CourseForm = ({
    type,
    data,
    onClose
}: {
    type: "create" | "update";
    data?: any;
    onClose?: () => void;
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("Course Details");
    const router = useRouter();

    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                try {
                    const departmentsResponse = await fetch('http://localhost:5000/api/departments?pageSize=100');
                    if (departmentsResponse.ok) {
                        const departmentsData = await departmentsResponse.json();
                        setDepartments(departmentsData.items || []);
                    } else {
                        console.error("Error fetching departments:", departmentsResponse.status);
                    }
                } catch (departmentError) {
                    console.error("Error fetching departments:", departmentError);
                }
            } catch (error) {
                console.error('Error in fetchData:', error);
            }
        };

        fetchData();
    }, []);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
        defaultValues: {
            id: data?.id || generateCourseId(),
            name: data?.name || "",
            description: data?.description || "",
            credits: data?.credits || 1,
            departmentId: data?.departmentId || "",
        }
    });

    useEffect(() => {
        if (type === "update" && data) {
            setValue("id", data.id);
            setValue("name", data.name || "");
            setValue("description", data.description || "");
            setValue("credits", data.credits || 1);
            if (data.departmentId) setValue("departmentId", data.departmentId);
        }
    }, [type, data, setValue]);

    const onSubmit = async (formData: Inputs) => {
        setLoading(true);
        setError("");

        try {
            const url = type === "create" ? "http://localhost:5000/api/courses" : `http://localhost:5000/api/courses/${data?.id}`;
            const method = type === "create" ? "POST" : "PUT";

            const processedData = {
                id: formData.id,
                name: formData.name,
                description: formData.description,
                credits: formData.credits,
                departmentId: formData.departmentId,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(processedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || "An error occurred while saving the course.");
            }

            if (onClose) onClose();
            router.refresh();
        } catch (error: any) {
            setError(error.message || "An error occurred while saving the course.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
          <h1 className="text-xl font-semibold mb-4">
            {type === "create" ? "Create New Course" : "Update Course"}
          </h1>
    
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
    
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("Course Details")}
              className={`px-5 py-2 font-medium text-sm ${
                activeTab === "Course Details"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Course Details
            </button>
          </div>
    
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex-1 overflow-y-auto pr-2">
              {/* Course Details Tab */}
              {activeTab === "Course Details" && (
                <div className="space-y-5">
                  {/* Course ID */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Course ID</label>
                    <input
                      type="text"
                      {...register("id")}
                      className="border border-gray-300 p-2 rounded-md text-sm w-full bg-gray-100 cursor-not-allowed"
                      readOnly
                    />
                    {errors.id?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.id.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Unique ID for this course
                    </p>
                  </div>
    
                  {/* Course Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Course Name</label>
                    <input
                      type="text"
                      {...register("name")}
                      className="border border-gray-300 p-2 rounded-md text-sm w-full"
                    />
                    {errors.name?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
    
                  {/* Credits */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Credits</label>
                    <input
                      type="number"
                      {...register("credits", { valueAsNumber: true })}
                      className="border border-gray-300 p-2 rounded-md text-sm w-full"
                      min="1"
                      max="10"
                    />
                    {errors.credits?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.credits.message}
                      </p>
                    )}
                  </div>
    
                  {/* Department */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Department</label>
                    <select
                      className="border border-gray-300 p-2 rounded-md text-sm w-full"
                      {...register("departmentId")}
                    >
                      <option value="">Select Department</option>
                      {departments.map((department: any) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {errors.departmentId?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.departmentId.message}
                      </p>
                    )}
                  </div>
    
                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Description</label>
                    <textarea
                      {...register("description")}
                      className="border border-gray-300 p-2 rounded-md text-sm w-full min-h-[120px]"
                      placeholder="Course description"
                    ></textarea>
                    {errors.description?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
    
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              {Object.keys(errors).length > 0 && (
                <div className="text-red-500 text-sm mr-auto">
                  Please fix the errors before submitting.
                  <ul className="list-disc pl-5 mt-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>
                        {field}: {error?.message?.toString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Loading..." : type === "create" ? "Create" : "Update"}
              </button>
            </div>
          </form>
        </div>
      );
}

export default CourseForm;