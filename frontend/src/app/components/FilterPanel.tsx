import { useEffect, useState } from 'react';
import { fetchDepartments, fetchCourses } from '../lib/utils/fetch';

export type UserSex = 'MALE' | 'FEMALE';

export interface FilterOptions {
  departmentId?: number | null;
  sex?: UserSex | null;
  courseId?: number | null;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  entityType: 'staff' | 'student' | 'course' | 'module'; 
}


const FilterPanel = ({ isOpen, onClose, onApply, currentFilters, entityType }: FilterPanelProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    currentFilters.departmentId || null
  );
  const [selectedCourse, setSelectedCourse] = useState<number | null>(
    currentFilters.courseId || null
  );
  const [selectedGender, setSelectedGender] = useState<UserSex | null>(
    currentFilters.sex || null
  );

  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const data = await fetchDepartments();
        setDepartments(data);
      } catch (error) {
        console.error('Failed to load departments:', error);
      }
    };

    const getCourses = async() => {
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch(error) {
        console.error('Failed to load courses:', error);
      }
    };

    if (isOpen) {
      if (entityType === 'staff' || entityType === 'student') {
        getDepartments();
      }
      if (entityType === 'student' || entityType === 'course') {
        getCourses();
      }
    }
  }, [isOpen, entityType]);

  const handleApply = () => {
    const filters: FilterOptions = {};
    if (entityType === 'staff' || entityType === 'student') {
      filters.departmentId = selectedDepartment;
    }
    if (entityType === 'student' || entityType === 'course') {
      filters.courseId = selectedCourse;
    }
    if (entityType === 'staff' || entityType === 'student') {
      filters.sex = selectedGender ? selectedGender.toUpperCase() as UserSex : null;
    }
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedDepartment(null);
    setSelectedCourse(null);
    setSelectedGender(null);
    onApply({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md p-4 border border-gray-200 z-50 w-64">
      <div className="space-y-4">
        {(entityType === 'staff' || entityType === 'student') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment || ''}
              onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {(entityType === 'student' || entityType === 'course') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {(entityType === 'staff' || entityType === 'student') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={selectedGender || ''}
              onChange={(e) => setSelectedGender(e.target.value as UserSex || null)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            >
              <option value="">All</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        )}
        <div className="flex justify-between pt-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            Reset
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1.5 text-sm bg-[#4aa8ff] text-white rounded-md hover:bg-[#5abfff]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;