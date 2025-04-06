"use client";


import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long!" })
    .optional()
    .or(z.literal('')),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone number is required!" }),
  departmentId: z.string().min(1, { message: "Department is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  position: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const StaffForm = ({
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
        if (!response.ok) throw new Error('Failed to fetch departments');
        const data = await response.json();
        setDepartments(data.items || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      password: '',
      name: data?.name || '',
      surname: data?.surname || '',
      phone: data?.phone || '',
      departmentId: data?.departmentId?.toString() || '',
      sex: data?.sex || 'MALE',
      position: data?.position || '',
    }
  });

  const onSubmit = async (formData: Inputs) => {
    setLoading(true);
    setError("");

    try {
      const url = type === "create" ? "http://localhost:5000/api/staff" : `http://localhost:5000/api/staff/${data?.id}`;

      const method = type === "create" ? "POST" : "PUT";

      if (type === "update" && (!formData.password || formData.password === '')) {
        delete formData.password;
      }

      const response = await fetch(url, {
        method, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save staff member");
      }

      if (onClose) onClose();
      router.refresh();
    } catch (error: any) {
      setError(error.message || "An error occurred while saving staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6 p-4" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add new Staff Member" : "Update Staff Member"}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cold-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="Username"
            register={register}
            name="username"
            error={errors.departmentId}
            />

          <InputField
            label="Email"
            register={register}
            name="email"
            type="email"
            error={errors.email}
            />

          <InputField
            label="Password"
            register={register}
            name="password"
            type="password"
            error={errors.password}
            inputProps={{
              placeholder: type === "update" ? "Leave blank to keep current password" : "Enter password"
            }}
            />

          <InputField
            label="First Name"
            register={register}
            name="name"
            error={errors.name}
            />

          <InputField
            label="Last Name"
            register={register}
            name="surname"
            error={errors.surname}
            />

          <InputField
            label="Phone"
            register={register}
            name="phone"
            error={errors.phone}
            />

          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Department</label>
            <select 
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("departmentId")}
              >
                <option value=""> Select Department</option>
                {departments.map((department: any) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            {errors.departmentId?.message && (
              <p className="text-xs text-red-400">{errors.departmentId.message.toString()}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Sex</label>
            <select 
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" 
              {...register("sex")}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.sex?.message && (
              <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>
            )}
          </div>

          <InputField
            label="Position"
            register={register}
            name="position"
            error={errors.position}
            />
        </div>

        <div className="flex justify-end gap-3 mt-4">
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
  );
}

export default StaffForm;