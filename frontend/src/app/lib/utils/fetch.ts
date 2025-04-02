import { FilterOptions } from "@/app/components/FilterPanel";

export const fetchStaffData = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = "",
  sortColumn: string = "staff.name",
  sortOrder: string = "ASC",
  filters: FilterOptions = {}
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search: searchQuery,
      sortColumn,
      sortOrder,
    });

    // Add filter params if they exist and are not null
    if (filters?.departmentId !== null && filters?.departmentId !== undefined) {
      params.append('departmentId', filters.departmentId.toString());
    }
    
    if (filters?.sex !== null && filters?.sex !== undefined) {
      params.append('sex', filters.sex);
    }

    console.log('Request URL:', `http://localhost:5000/api/staff?${params}`);

    const response = await fetch(`http://localhost:5000/api/staff?${params}`);

    if (!response.ok) {
      // Log more detailed error information
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch staff data:", error);
    throw error;
  }
};

export const fetchStudentData = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = "",
  sortColumn: string = "student.name",
  sortOrder: string = "ASC",
  filters: FilterOptions = {}
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search: searchQuery,
      sortColumn,
      sortOrder,
    });
     // Add filter params if they exist and are not null
    if (filters?.courseId !== null && filters?.courseId !== undefined) {
      params.append('courseId', filters.courseId.toString());
    }
    
    if (filters?.sex !== null && filters?.sex !== undefined) {
      params.append('sex', filters.sex);
    }

    console.log('Request URL:', `http://localhost:5000/api/students?${params}`);

    const response = await fetch(`http://localhost:5000/api/students?${params}`);

    if (!response.ok) {
      // Log more detailed error information
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch student data:", error);
    throw error;
  }
};

export const fetchDepartments = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/departments');
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Failed to fetch departments: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export const fetchCourses = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/courses');
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Failed to fetch courses: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};