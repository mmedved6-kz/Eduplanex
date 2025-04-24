"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  type: z.enum(["HARD", "SOFT"], { message: "Type must be either HARD or SOFT" }),
  category: z.string().min(1, { message: "Category is required" }),
  weight: z.number().min(0).max(100).optional(),
  enabled: z.boolean().optional(),
  departmentSpecific: z.boolean().optional(),
  departmentId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const generateConstraintId = () => {
  const prefix = 'CONST';
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${randomSuffix}`;
};

const ConstraintForm = ({
  type,
  data,
  onClose,
}: {
  type: "create" | "update";
  data?: any;
  onClose?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/departments?pageSize=100');
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.items || []);
        } else {
          console.error("Failed to fetch departments:", response.status);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data?.id || generateConstraintId(),
      name: data?.name || "",
      description: data?.description || "",
      type: data?.type || "SOFT",
      category: data?.category || "",
      weight: data?.weight || 50,
      enabled: data?.enabled !== false, // Default to true if not specified
      departmentSpecific: data?.departmentSpecific || false,
      departmentId: data?.departmentId || "",
    },
  });

  useEffect(() => {
    if (type === "update" && data) {
      setValue("id", data.id);
      setValue("name", data.name || "");
      setValue("description", data.description || "");
      setValue("type", data.type || "SOFT");
      setValue("category", data.category || "");
      setValue("weight", data.weight || 50);
      setValue("enabled", data.enabled !== false);
      setValue("departmentSpecific", data.departmentSpecific || false);
      setValue("departmentId", data.departmentId || "");
    }
  }, [type, data, setValue]);

  const constraintType = watch("type");
  const isDepartmentSpecific = watch("departmentSpecific");

  const onSubmit = async (formData: Inputs) => {
    setLoading(true);
    setError("");

    try {
      // In a real implementation, you would send this to your backend
      // For now, let's just simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Form submitted:", formData);

      // Mock response for development
      const mockResponse = {
        success: true,
        data: {
          ...formData,
          id: type === "create" ? generateConstraintId() : formData.id,
        }
      };

      if (onClose) onClose();
      router.refresh();
    } catch (error: any) {
      setError(error.message || "An error occurred while saving the constraint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-semibold mb-4">
        {type === "create" ? "Create New Constraint" : "Update Constraint"}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex-1 overflow-y-auto pr-2 space-y-5">
          {/* Constraint ID */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Constraint ID</label>
            <input
              type="text"
              {...register("id")}
              className="border border-gray-300 p-2 rounded-md text-sm w-full bg-gray-100 cursor-not-allowed"
              readOnly
            />
            {errors.id?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.id.message}</p>
            )}
            <p className="text-xs text-gray-500">Unique identifier for this constraint</p>
          </div>

          {/* Constraint Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              {...register("name")}
              className="border border-gray-300 p-2 rounded-md text-sm w-full"
            />
            {errors.name?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Constraint Type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Type</label>
            <select
              {...register("type")}
              className="border border-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="SOFT">Soft Constraint</option>
              <option value="HARD">Hard Constraint</option>
            </select>
            {errors.type?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Hard constraints must be satisfied; soft constraints are preferences
            </p>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Category</label>
            <select
              {...register("category")}
              className="border border-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="">Select Category</option>
              <option value="ROOM">Room</option>
              <option value="STAFF">Staff</option>
              <option value="STUDENT">Student</option>
              <option value="TIME">Time</option>
              <option value="RESOURCE">Resource</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.category?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Weight (only for SOFT constraints) */}
          {constraintType === "SOFT" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Weight (0-100)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  {...register("weight", { valueAsNumber: true })}
                  className="flex-grow"
                />
                <span className="text-sm font-medium w-8 text-center">
                  {watch("weight") || 50}
                </span>
              </div>
              {errors.weight?.message && (
                <p className="text-xs text-red-500 mt-1">{errors.weight.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Higher weight means higher priority in optimization
              </p>
            </div>
          )}

          {/* Enabled */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              {...register("enabled")}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="enabled" className="text-sm text-gray-600">
              Enabled
            </label>
          </div>

          {/* Department Specific */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="departmentSpecific"
                {...register("departmentSpecific")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="departmentSpecific" className="text-sm text-gray-600">
                Apply to specific department only
              </label>
            </div>

            {isDepartmentSpecific && (
              <div className="ml-6 mt-2">
                <select
                  {...register("departmentId")}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.departmentId.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Description</label>
            <textarea
              {...register("description")}
              className="border border-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
              placeholder="Provide a detailed description of this constraint..."
            ></textarea>
            {errors.description?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          {Object.keys(errors).length > 0 && (
            <div className="text-red-500 text-sm mr-auto">
              Please fix the errors before submitting.
              <ul className="list-disc pl-5 mt-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{field}: {error?.message?.toString()}</li>
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
};

export default ConstraintForm;