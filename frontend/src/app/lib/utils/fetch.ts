export const fetchStaffData = async (page: number = 1, pageSize: number = 10, searchQuery: string = '', sortColumn: string = 's.name', sortOrder: string = 'ASC') => {
  try {
    const response = await fetch(`http://localhost:5000/api/staff?page=${page}&pageSize=${pageSize}&search=${searchQuery}&sortColumn=${sortColumn}&sortOrder=${sortOrder}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch staff data:', error);
    throw error;
  }
};