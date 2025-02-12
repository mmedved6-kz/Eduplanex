export const fetchStaffData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/staff'); // Ensure this URL is correct
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch staff data:', error);
    return [];
  }
};