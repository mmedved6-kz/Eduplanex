"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const schema = z.object({
  id: z.string().min(1, { message: "Staff ID is required!" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone number is required!" }),
  departmentId: z.string().min(1, { message: "Department is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  position: z.string().optional(),
  img: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

type TabType = "Staff Details" | "Resources";

const generateStaffId = () => {
  const prefix = "STAFF-";
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${randomSuffix}`;
};

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
  const [activeTab, setActiveTab] = useState<TabType>("Staff Details");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(data?.img || null);
  const router = useRouter();

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const departmentResponse = await fetch(
            "http://localhost:5000/api/departments?pageSize=100"
          );
          if (departmentResponse.ok) {
            const departmentData = await departmentResponse.json();
            setDepartments(departmentData.items || []);
          } else {
            console.error(
              "Failed to fetch departments:",
              departmentResponse.status
            );
          }
        } catch (departmentError) {
          console.error("Error fetching departments:", departmentError);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
      id: data?.id || generateStaffId(),
      username: data?.username || "",
      email: data?.email || "",
      password: "",
      name: data?.name || "",
      surname: data?.surname || "",
      phone: data?.phone || "",
      departmentId: data?.departmentId?.toString() || "",
      sex: data?.sex || "MALE",
      position: data?.position || "",
      img: data?.img || "",
    },
  });

  useEffect(() => {
    if (type === "update" && data) {
      setValue("id", data.id);
      setValue("username", data.username);
      setValue("name", data.name);
      setValue("surname", data.surname);
      setValue("username", data.username);
      setValue("email", data.email);
      setValue("phone", data.phone);
      setValue("position", data.position);

      if (data.img) {
        setValue("img", data.img);
        setImageUrl(data.img);
        setPreviewUrl(data.img);
      }

      if (data.departmentId) setValue("departmentId", data.departmentId);
    }
  }, [type, data, setValue]);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true); 
    setError(""); 

    const formData = new FormData();
    formData.append('image', file); 

    try {
        const response = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Image upload failed');
        }

        const result = await response.json();
        const imageUrl = result.imageUrl; 

        setValue('img', imageUrl, { shouldValidate: true }); 

        setPreviewUrl(imageUrl);

    } catch (uploadError: any) {
        console.error("Image upload error:", uploadError);
        setError(uploadError.message || "Failed to upload image.");
        // Optional clear preview if upload fails
        // setPreviewUrl(null);
        // setValue('img', '', { shouldValidate: true });
    } finally {
        setLoading(false); 
    }
};

  const onSubmit = async (formData: Inputs) => {
    setLoading(true);
    setError("");

    try {
      const url =
        type === "create"
          ? "http://localhost:5000/api/staff"
          : `http://localhost:5000/api/staff/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

      const processedData = {
        id: formData.id,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        position: formData.position,
        departmentId: formData.departmentId, 
        img: formData.img || null, 
        sex: formData.sex,
      };

      if (
        type === "update" &&
        (!formData.password || formData.password === "")
      ) {
        delete processedData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
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
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-semibold mb-4">
        {type === "create" ? "Create New Staff" : "Update Staff"}
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
          onClick={() => setActiveTab("Staff Details")}
          className={`px-5 py-2 font-medium text-sm ${
            activeTab === "Staff Details"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Staff Details
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Staff Details Tab */}
          {activeTab === "Staff Details" && (
            <div className="space-y-5">
              {/* Staff ID */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Staff ID</label>
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
                  Unique ID for this staff member
                </p>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Username</label>
                <input
                  type="text"
                  {...register("username")}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                />
                {errors.username?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                />
                {errors.email?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Profile Image */}
              <div className="flex flex-col gap-1 mb-6">
                <label className="text-sm text-gray-600">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Profile Preview"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">Profile</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={loading}
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {isUploading ? "Uploading..." : "Upload Image"}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a profile image (optional)
                    </p>
                  </div>
                  <input type="hidden" {...register("img")} />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  {type === "create"
                    ? "Password"
                    : "Password (leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                />
                {errors.password?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Name and Surname */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">First Name</label>
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

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Last Name</label>
                  <input
                    type="text"
                    {...register("surname")}
                    className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  />
                  {errors.surname?.message && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.surname.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Phone Number</label>
                <input
                  type="text"
                  {...register("phone")}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                />
                {errors.phone?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.phone.message}
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

              {/* Sex */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Sex</label>
                <select
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("sex")}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                {errors.sex?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.sex.message}
                  </p>
                )}
              </div>

              {/* Position */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Position (Optional)
                </label>
                <input
                  type="text"
                  {...register("position")}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  placeholder="e.g., Professor, Teaching Assistant"
                />
                {errors.position?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.position.message}
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
};

export default StaffForm;
