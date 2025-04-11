"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../InputField";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
  id: z.string().min(1, { message: "Student ID is required!" }),
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
  courseId: z.string().min(1, { message: "Course is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  year: z.number().int().min(1, { message: "Year must be at least 1" }).max(6, { message: "Year must be at most 6" }),
  img: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

type TabType = "Student Details" | "Course Information";

const generateStudentId = () => {
  const prefix = "STU-";
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${randomSuffix}`;
};

const StudentForm = ({
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
  const [activeTab, setActiveTab] = useState<TabType>("Student Details");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const coursesResponse = await fetch(
            "http://localhost:5000/api/courses?pageSize=100"
          );
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            setCourses(coursesData.items || []);
          } else {
            console.error(
              "Failed to fetch courses:",
              coursesResponse.status
            );
          }
        } catch (courseError) {
          console.error("Error fetching courses:", courseError);
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
      id: data?.id || generateStudentId(),
      username: data?.username || "",
      email: data?.email || "",
      password: "",
      name: data?.name || "",
      surname: data?.surname || "",
      phone: data?.phone || "",
      courseId: data?.courseId?.toString() || "",
      sex: data?.sex || "MALE",
      year: data?.year || 1,
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
      setValue("year", data.year || 1);

      if (data.img) {
        setValue("img", data.img);
        setImageUrl(data.img);
      }

      if (data.courseId) setValue("courseId", data.courseId);
    }
  }, [type, data, setValue]);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    
    setIsUploading(true);
    
    try {
      // Replace with your actual image upload endpoint
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      const data = await response.json();
      setImageUrl(data.imageUrl);
      setValue("img", data.imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (formData: Inputs) => {
    setLoading(true);
    setError("");

    try {
      const url =
        type === "create"
          ? "http://localhost:5000/api/students"
          : `http://localhost:5000/api/students/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

      const processedData = {
        id: formData.id,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        year: formData.year,
        courseId: formData.courseId,
        sex: formData.sex,
        img: formData.img || null,
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
        throw new Error(errorData.message || "Failed to save student");
      }

      if (onClose) onClose();
      router.refresh();
    } catch (error: any) {
      setError(error.message || "An error occurred while saving student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-semibold mb-4">
        {type === "create" ? "Create New Student" : "Update Student"}
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
          onClick={() => setActiveTab("Student Details")}
          className={`px-5 py-2 font-medium text-sm ${
            activeTab === "Student Details"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Student Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Course Information")}
          className={`px-5 py-2 font-medium text-sm ${
            activeTab === "Course Information"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Course Information
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Student Details Tab */}
          {activeTab === "Student Details" && (
            <div className="space-y-5">
              {/* Student ID */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Student ID</label>
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
                  Unique ID for this student
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
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
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
            </div>
          )}

          {/* Course Information Tab */}
          {activeTab === "Course Information" && (
            <div className="space-y-5">
              {/* Course */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Course</label>
                <select
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("courseId")}
                >
                  <option value="">Select Course</option>
                  {courses.map((course: any) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.courseId.message}
                  </p>
                )}
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Year of Study</label>
                <input
                  type="number"
                  {...register("year", { valueAsNumber: true })}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  min="1"
                  max="6"
                />
                {errors.year?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.year.message}
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

export default StudentForm;