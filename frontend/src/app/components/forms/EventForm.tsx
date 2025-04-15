"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ConstraintViolationPanel from "../ConstraintViolationPanel";

const schema = z.object({
  id: z.string().min(1, { message: "Event ID is required!" }),
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long!" })
    .max(50, { message: "Title must be at most 50 characters long!" }),
  description: z.string().optional(),
  event_date: z.string().min(1, { message: "Date is required!" }),
  timeslot_id: z.string().min(1, { message: "Time slot is required!" }),
  course_id: z.string().min(1, { message: "Course is required!" }),
  module_id: z.string().optional(),
  room_id: z.string().min(1, { message: "Room is required!" }),
  staff_id: z.string().min(1, { message: "Staff member is required!" }),
  students: z.array(z.string()).optional(),
  student_count: z.union([
    z.string().transform(val => parseInt(val, 10)),
    z.number()
  ]).refine(val => !isNaN(val) && val >= 0, {
    message: "Student count must be a positive number!"
  }),
  event_type: z.enum(["CLASS", "EXAM", "MEETING", "OTHER"], { message: "Event type is required!" }),
});

type Inputs = z.infer<typeof schema>;

type TabType = "Event Details" | "Resources" | "Students";

type Timeslot = {
  id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

const generateEventId = () => {
  const prefix = 'EVT';
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${randomSuffix}`;
}

const EventForm = ({
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
  const [activeTab, setActiveTab] = useState<TabType>("Event Details");
  const router = useRouter();
  const [showViolationPanel, setShowViolationPanel] = useState(false);
  const [hardViolations, setHardViolations] = useState<any[]>();
  const [softViolations, setSoftViolations] = useState<any[]>();
  const [pendingEvent, setPendingEvent] = useState<any>(null);
  
  // Data states
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState<Timeslot | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        try {
          const coursesResponse = await fetch('http://localhost:5000/api/courses?pageSize=100');
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            setCourses(coursesData.items || []);
          } else {
            console.error('Failed to fetch courses:', coursesResponse.status);
          }
        } catch (courseError) {
          console.error('Error fetching courses:', courseError);
        }

        // Fetch modules
        try {
          const modulesResponse = await fetch('http://localhost:5000/api/modules?pageSize=100');
          if (modulesResponse.ok) {
            const modulesData = await modulesResponse.json();
            setModules(modulesData.items || []);
          } else {
            console.error('Failed to fetch modules:', modulesResponse.status);
          }
        } catch (moduleError) {
          console.error('Error fetching modules:', moduleError);
        }

        // Fetch rooms
        try {
          const roomsResponse = await fetch('http://localhost:5000/api/rooms?pageSize=100');
          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json();
            setRooms(roomsData.items || []);
          } else {
            console.error('Failed to fetch rooms:', roomsResponse.status);
          }
        } catch (roomError) {
          console.error('Error fetching rooms:', roomError);
        }

        // Fetch staff members
        try {
          const staffResponse = await fetch('http://localhost:5000/api/staff?pageSize=100');
          if (staffResponse.ok) {
            const staffData = await staffResponse.json();
            setStaff(staffData.items || []);
          } else {
            console.error('Failed to fetch staff:', staffResponse.status);
          }
        } catch (staffError) {
          console.error('Error fetching staff:', staffError);
        }

        // Fetch students
        try {
          const studentsResponse = await fetch('http://localhost:5000/api/students?pageSize=100');
          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            setStudents(studentsData.items || []);
          } else {
            console.error('Failed to fetch students:', studentsResponse.status);
          }
        } catch (studentError) {
          console.error('Error fetching students:', studentError);
        }

        try {
          const timeslotsResponse = await fetch('http://localhost:5000/api/timeslots?pageSize=100');
          if (timeslotsResponse.ok) {
            const timeslotsData = await timeslotsResponse.json();
            setTimeslots(timeslotsData.items || []);
          }
          else {
            console.error('Failed to fetch timeslots:', timeslotsResponse.status);
          }
        } catch (timeslotError) {
          console.error('Error fetching timeslots:', timeslotError);
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
    watch,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data?.id || generateEventId(),
      title: data?.title || "",
      description: data?.description || "",
      event_date: data?.event_date || "",
      timeslot_id: data?.timeslot_id || "",
      course_id: data?.course_id?.toString() || "",
      module_id: data?.module_id?.toString() || "",
      room_id: data?.room_id?.toString() || "",
      staff_id: data?.staff_id?.toString() || "",
      student_count: data?.student_count?.toString() || "0",
      students: data?.students || [],
      event_type: data?.tag || "CLASS",
    }
  });

  const selectedTimeslotId = watch("timeslot_id");

  useEffect(() => {
    if (selectedTimeslotId) {
      const timeslot = timeslots.find(t => t.id === selectedTimeslotId);
      setSelectedTimeslot(timeslot || null);
    } else {
      setSelectedTimeslot(null);
    }
  }, [selectedTimeslotId, timeslots]);

  useEffect(() => {
    if (type === "update" && data) {
      console.log("Setting form values for update mode:", data);
      
      // Set the id field
      setValue("id", data.id);
      
      // Set basic event details
      setValue("title", data.title || "");
      setValue("description", data.description || "");
      
      // Set date and timeslot
      if (data.event_date) {
        setValue("event_date", data.event_date);
      }
      if (data.timeslot_id) {
        setValue("timeslot_id", data.timeslot_id);
      }
      
      // Set resources
      if (data.courseId || data.course_id) setValue("course_id", data.courseId || data.course_id);
      if (data.moduleId || data.module_id) setValue("module_id", data.moduleId || data.module_id);
      if (data.roomId || data.room_id) setValue("room_id", data.roomId || data.room_id);
      if (data.staffId || data.staff_id) setValue("staff_id", data.staffId || data.staff_id);
      
      // Set event type
      if (data.tag) setValue("event_type", data.tag);
      
      // Set student count and array
      if (data.student_count !== undefined) {
        setValue("student_count", data.student_count.toString());
      }
      
      // If students are available as an array, set selected students
      const fetchEventStudents = async () => {
        try {
          console.log(`Fetching students for event ID: ${data.id}`);
          const response = await fetch(`http://localhost:5000/api/events/${data.id}/students`);
          
          if (response.ok) {
            const studentData = await response.json();
            console.log(`Retrieved ${studentData.length} students for event`);
            // Set the selected students from the fetched data
            setSelectedStudents(studentData.map((student: any) => student.id));
          } else {
            // Get error details
            const errorText = await response.text();
            console.error(`Failed to fetch students: ${response.status} ${response.statusText}`);
            console.error(`Error details: ${errorText}`);
          }
        } catch (error) {
          console.error("Error fetching event students:", error);
        }
      };
      
      fetchEventStudents();
    }
  }, [type, data, setValue]);

  const courseId = watch("course_id");

  // Filter modules based on selected course
  const filteredModules = courseId 
    ? modules.filter((module: any) => module.courseId.toString() === courseId)
    : modules;

  // Handle student selection
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => {
      const isSelected = prev.includes(studentId);
      
      if (isSelected) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Update student count and students array when selection changes
  useEffect(() => {
    // Set the count as a number, not a string
    setValue("student_count", selectedStudents.length);
    setValue("students", selectedStudents);
  }, [selectedStudents, setValue]);

  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return "";

    try {
      const [hours, minutes] = timeString.split(":").map(Number);

      const date = new Date();
      date.setHours(hours, minutes, 0);

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  }

  const onSubmit = async (formData: Inputs) => {
    console.log("Form submitted with data:", formData);
    setLoading(true);
    setError("");

    try {
      const processedData = {
        id: formData.id,  
        title: formData.title,
        description: formData.description || "",
        event_date: formData.event_date,
        timeslot_id: formData.timeslot_id,
        courseId: formData.course_id,
        moduleId: formData.module_id || null,
        roomId: formData.room_id,
        staffId: formData.staff_id,
        student_count: selectedStudents.length,
        tag: formData.event_type,
        recurring: false,
        students: selectedStudents
      };

      console.log("Checking constraints for event:", processedData);

      const constraintsResponse = await fetch("http://localhost:5000/api/constraints/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      if (!constraintsResponse.ok) {
        const errorData = await constraintsResponse.json();
        console.error("Constraint check failed:", errorData);
        throw new Error(errorData.error || "Failed to check constraints");
      }

      const constraintsResults = await constraintsResponse.json();
      console.log("Constraint check results:", constraintsResults);

      setPendingEvent(processedData);
      setHardViolations(constraintsResults.hardViolations || []);
      setSoftViolations(constraintsResults.softWarnings || []);

      if (constraintsResults.hardViolations.length > 0 || constraintsResults.softWarnings.length > 0) {
        setShowViolationPanel(true);
        setLoading(false);
        return;
      }

      await saveEvent(processedData);

    } catch (error: any) {
      setError(error.message || "An error occurred while saving the event");
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (processedData: any) => {
    try {
      const url = type === "create" ? "http://localhost:5000/api/events" : `http://localhost:5000/api/events/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

      console.log("Submitting event data:", processedData);

      const response = await fetch(url, {
        method, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save event");
      }

      if (onClose) onClose();
      router.refresh();
    } catch (error: any) {
      setError(error.message || "An error occurred while saving the event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-semibold mb-4">
        {type === "create" ? "Create New Event" : "Update Event"}
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
          onClick={() => setActiveTab("Event Details")}
          className={`px-5 py-2 font-medium text-sm ${
            activeTab === "Event Details" 
              ? "border-b-2 border-blue-500 text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Event Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Resources")}
          className={`px-5 py-2 font-medium text-sm ${
            activeTab === "Resources" 
              ? "border-b-2 border-blue-500 text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Resources
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Students")}
          className={`px-5 py-2 font-medium text-sm ${
            activeTab === "Students" 
              ? "border-b-2 border-blue-500 text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Students
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Event Details Tab */}
          {activeTab === "Event Details" && (
            <div className="space-y-5">
              {/* Event ID */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Event ID</label>
                <input
                  type="text"
                  {...register("id")}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full bg-gray-100 cursor-not-allowed"
                  readOnly
                />
                {errors.id?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.id.message}</p>
                )}
                <p className="text-xs text-gray-500">Unique ID for this event</p>
              </div>
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Title</label>
                <input
                  type="text"
                  {...register("title")}
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                />
                {errors.title?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Event Type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Event Type</label>
                <select 
                  className="border border-gray-300 p-2 rounded-md text-sm w-full" 
                  {...register("event_type")}
                >
                  <option value="CLASS">Class</option>
                  <option value="EXAM">Exam</option>
                  <option value="MEETING">Meeting</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.event_type?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.event_type.message}</p>
                )}
              </div>

              {/* Date and Timeslot Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Date</label>
                  <input
                    type="date"
                    className="border border-gray-300 p-2 rounded-md text-sm w-full"
                    {...register("event_date")}
                  />
                  {errors.event_date?.message && (
                    <p className="text-xs text-red-500 mt-1">{errors.event_date.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Time</label>
                  <select
                    className="border border-gray-300 p-2 rounded-md text-sm w-full"
                    {...register("timeslot_id")}
                  >
                    <option value="">Select a Timeslot</option>
                    {timeslots.map((timeslot) => (
                      <option key={timeslot.id} value={timeslot.id}>
                        {formatTimeForDisplay(timeslot.start_time)} - {formatTimeForDisplay(timeslot.end_time)} ({timeslot.duration_minutes} min)
                      </option>
                    ))}
                  </select>
                  {errors.timeslot_id?.message && (
                    <p className="text-xs text-red-500 mt-1">{errors.timeslot_id.message}</p>
                  )}
                </div>
              </div>

              {/* Timeslot Details (if selected) */}
              {selectedTimeslot && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Selected Timeslot Details</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Start Time:</span>
                      <p>{formatTimeForDisplay(selectedTimeslot.start_time)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">End Time:</span>
                      <p>{formatTimeForDisplay(selectedTimeslot.end_time)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Duration:</span>
                      <p>{selectedTimeslot.duration_minutes} minutes</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Description (Optional)</label>
                <textarea
                  className="border border-gray-300 p-2 rounded-md text-sm w-full min-h-[120px]"
                  placeholder="Event description"
                  {...register("description")}
                ></textarea>
                {errors.description?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "Resources" && (
            <div className="space-y-5">
              {/* Course */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Course</label>
                <select
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("course_id")}
                >
                  <option value="">Select Course</option>
                  {courses.map((course: any) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.course_id?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.course_id.message}</p>
                )}
              </div>

              {/* Module (filtered by course) */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Module (Optional)</label>
                <select
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("module_id")}
                  disabled={!courseId}
                >
                  <option value="">Select Module</option>
                  {filteredModules.map((module: any) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
                {errors.module_id?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.module_id.message}</p>
                )}
                {!courseId && (
                  <p className="text-xs text-amber-500 mt-1">Select a course first</p>
                )}
              </div>

              {/* Room */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Room</label>
                <select
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("room_id")}
                >
                  <option value="">Select Room</option>
                  {rooms.map((room: any) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.roomType || room.room_type} ({room.capacity} seats)
                    </option>
                  ))}
                </select>
                {errors.room_id?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.room_id.message}</p>
                )}
              </div>

              {/* Staff */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Staff Member</label>
                <select
                  className="border border-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("staff_id")}
                >
                  <option value="">Select Staff Member</option>
                  {staff.map((staffMember: any) => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.name} {staffMember.surname}
                    </option>
                  ))}
                </select>
                {errors.staff_id?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.staff_id.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "Students" && (
            <div className="space-y-4">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">Select Students</p>
                <p className="text-sm text-gray-500">
                  Selected: {selectedStudents.length} students
                </p>
              </div>

              {/* Search input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="border border-gray-300 p-2 pl-8 rounded-md text-sm w-full"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <div className="absolute left-2 top-2.5">
                  <Image src="/search.png" alt="Search" width={14} height={14} />
                </div>
              </div>

              {/* Students list with checkboxes */}
              <div className="max-h-[320px] overflow-y-auto border rounded-md">
                {students.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No students found</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Select</th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 hidden md:table-cell">Course</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter((student: any) => 
                          studentSearch === '' || 
                          `${student.name} ${student.surname}`.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((student: any) => (
                          <tr key={student.id} className="hover:bg-gray-50 border-t">
                            <td className="py-2 px-4">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => handleStudentSelect(student.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                              />
                            </td>
                            <td className="py-2 px-4">{student.name} {student.surname}</td>
                            <td className="py-2 px-4 hidden md:table-cell">{student.courseName}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Hidden field for student count */}
              <input type="hidden" {...register("student_count")} />
            </div>
          )}
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

        {/* Constraint Violation Panel */}
        {showViolationPanel && (
          <ConstraintViolationPanel
          hardViolations={hardViolations}
          softViolations={softViolations}
          event={pendingEvent}
          onSave={() => {
            if (pendingEvent) {
              saveEvent(pendingEvent);
            }
            setShowViolationPanel(false);
          }}
          onCancel={() => {
            setShowViolationPanel(false);
            setLoading(false);
          }}
          />
        )}
      </form>
    </div>
  );
};

export default EventForm;