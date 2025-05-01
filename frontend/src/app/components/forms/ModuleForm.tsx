"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    courseId: z.string().min(1, { message: "Course is required" }), 
    // semester: z.number().int().min(1).max(2).optional(), 
});

type Inputs = z.infer<typeof schema>;

type TabType = "Module Details"; 

const generateModuleId = () => {
    const prefix = 'MOD'; 
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomSuffix}`;
}

const ModuleForm = ({
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
    const [activeTab, setActiveTab] = useState<TabType>("Module Details");
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]); 

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); 
            try {
                // Fetch Courses
                const coursesResponse = await fetch('http://localhost:5000/api/courses?pageSize=100'); 
                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    setCourses(coursesData.items || []);
                } else {
                    console.error("Error fetching courses:", coursesResponse.status);
                    setError("Failed to load courses."); 
                }
            } catch (fetchError) {
                console.error('Error fetching data:', fetchError);
                setError("Failed to load necessary data."); 
            } finally {
                setLoading(false); 
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
            id: data?.id || generateModuleId(),
            name: data?.name || "",
            description: data?.description || "",
            courseId: data?.courseId || "", 
            // semester: data?.semester || 1,
        }
    });

    useEffect(() => {
        if (type === "update" && data) {
            setValue("id", data.id);
            setValue("name", data.name || "");
            setValue("description", data.description || "");
            setValue("courseId", data.courseId || ""); 
            // setValue("semester", data.semester || 1); 
        }
        if (type === "create" || !data) {
             setValue("id", generateModuleId());
        }
    }, [type, data, setValue]);

    const onSubmit = async (formData: Inputs) => {
        setLoading(true);
        setError("");

        try {
            const url = type === "create" ? "http://localhost:5000/api/modules" : `http://localhost:5000/api/modules/${data?.id}`;
            const method = type === "create" ? "POST" : "PUT";

            const processedData = {
                id: formData.id,
                name: formData.name,
                description: formData.description,
                courseId: formData.courseId, 
                // semester: formData.semester, 
            };

            console.log("Submitting Module Data:", processedData);

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(processedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend Error:", errorData);
                setError(errorData.message || `Failed to ${type} module. Status: ${response.status}`);
                return;
            }

            router.refresh();
            if (onClose) onClose();

        } catch (error: any) {
            console.error(`Error during module ${type}:`, error);
            setError(error.message || `An unexpected error occurred while saving the module.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
          <h1 className="text-xl font-semibold mb-4">
            {type === "create" ? "Create New Module" : "Update Module"}
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {/* Tabs - Simplified as only one tab */}
          <div className="flex border-b mb-6">
            <button
              type="button"
              // onClick={() => setActiveTab("Module Details")} 
              className={`px-5 py-2 font-medium text-sm border-b-2 border-blue-500 text-blue-600`} // Always active style
            >
              Module Details
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex-1 overflow-y-auto pr-2">
              {/* Module Details Tab Content */}
              {/* activeTab === "Module Details" */}
                <div className="space-y-5">
                  {/* Module ID */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Module ID</label>
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
                      Unique ID for this module (Auto-generated for create)
                    </p>
                  </div>

                  {/* Module Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Module Name</label>
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

                  {/* Course Dropdown - Added */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Course</label>
                    <select
                      className="border border-gray-300 p-2 rounded-md text-sm w-full"
                      {...register("courseId")}
                      disabled={loading} 
                    >
                      <option value="">Select Course</option>
                      {courses.map((course: any) => (
                        <option key={course.id} value={course.id}>
                          {course.name} ({course.id})
                        </option>
                      ))}
                    </select>
                    {errors.courseId?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.courseId.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Description</label>
                    <textarea
                      {...register("description")}
                      className="border border-gray-300 p-2 rounded-md text-sm w-full min-h-[120px]"
                      placeholder="Module description"
                    ></textarea>
                    {errors.description?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Semester (1 or 2)</label>
                    <input
                      type="number"
                      {...register("semester", { valueAsNumber: true })}
                      className="border border-gray-300 p-2 rounded-md text-sm w-full"
                      min="1"
                      max="2"
                    />
                    {errors.semester?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.semester.message}
                      </p>
                    )}
                  </div> */}

                </div>
              {/* )} */}
            </div>

            {/* Submit/Cancel Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              {Object.keys(errors).length > 0 && (
                <div className="text-red-500 text-sm mr-auto">
                  Please fix the errors before submitting.
                </div>
              )}
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={loading || Object.keys(errors).length > 0} 
              >
                {loading ? "Loading..." : type === "create" ? "Create Module" : "Update Module"}
              </button>
            </div>
          </form>
        </div>
      );
}

export default ModuleForm;