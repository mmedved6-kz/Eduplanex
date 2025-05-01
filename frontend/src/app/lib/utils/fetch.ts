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
    const response = await fetch('http://localhost:5000/api/departments?pageSize=100');
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const fetchCourses = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/courses?pageSize=100');
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

export const fetchEventData = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = "",
  sortColumn: string = "event.title",
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

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (user?.profileId) {
      if (user.role === 'staff') {
        params.append('staffId', user.profileId);
      } else if (user.role === 'student') {
        params.append('studentId', user.profileId);
      }
    }

    // Add filter params if they exist and are not null
    if (filters?.staffId !== null && filters?.staffId !== undefined) {
      params.append('staffId', filters.staffId.toString());
    }

    console.log('Request URL:', `http://localhost:5000/api/events?${params}`);

    const response = await fetch(`http://localhost:5000/api/events?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch event data:", error);
    throw error;
  }
};

export const fetchModules = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/modules');
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Failed to fetch modules: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

export const fetchRooms = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/rooms?pageSize=100');
    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

export const fetchModuleData = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = "",
  sortColumn: string = "module.name",
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

    console.log('Request URL:', `http://localhost:5000/api/modules?${params}`);

    const response = await fetch(`http://localhost:5000/api/modules?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch module data:", error);
    throw error;
  }
};

export const fetchCourseData = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = "",
  sortColumn: string = "course.name",
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

    console.log('Request URL:', `http://localhost:5000/api/courses?${params}`);

    const response = await fetch(`http://localhost:5000/api/courses?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch course data:", error);
    throw error;
  }
};

export const fetchDepartmentData = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = "",
  sortColumn: string = "department.name",
  sortOrder: string = "ASC"
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search: searchQuery,
      sortColumn,
      sortOrder,
    });

    console.log('Request URL:', `http://localhost:5000/api/departments?${params}`);

    const response = await fetch(`http://localhost:5000/api/departments?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch department data:", error);
    throw error;
  }
};

export const fetchStaff = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/staff?pageSize=100');
    if (!response.ok) {
      throw new Error('Failed to fetch staff');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
};