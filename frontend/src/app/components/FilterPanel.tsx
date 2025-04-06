import { useEffect, useState } from 'react';
import { fetchDepartments, fetchCourses, fetchStaff } from '../lib/utils/fetch';

export type UserSex = 'MALE' | 'FEMALE';

export interface FilterOptions {
  departmentId?: number | null;
  sex?: UserSex | null;
  courseId?: number | null;
  moduleId?: number | null;
  staffId?: string | null;
  roomId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  entityType: 'staff' | 'student' | 'course' | 'module' | 'department' | 'event';
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
  const [selectedStaff, setSelectedStaff] = useState<string | null>(
    currentFilters.staffId || null
  );
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    currentFilters.startDate || null
  );
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(
    currentFilters.endDate || null
  );

  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch departments if needed
      if (['staff', 'student', 'course'].includes(entityType)) {
        fetchDepartments()
          .then(data => {
            if (data?.items) {
              setDepartments(data.items);
            } else if (Array.isArray(data)) {
              setDepartments(data);
            }
          })
          .catch(error => {
            console.error('Failed to load departments:', error);
          });
      }

      // Fetch courses if needed
      if (['student', 'course', 'module'].includes(entityType)) {
        fetchCourses()
          .then(data => {
            if (data?.items) {
              setCourses(data.items);
            } else if (Array.isArray(data)) {
              setCourses(data);
            }
          })
          .catch(error => {
            console.error('Failed to load courses:', error);
          });
      }

      if (['event'].includes(entityType)) {
        fetchStaff()
          .then(data => {
            if (data?.items) {
              setStaff(data.items);
            } else if (Array.isArray(data)) {
              setStaff(data);
            }
          })
          .catch(error => {
            console.error('Failed to load staff:', error);
          });
      }
    }
  }, [isOpen, entityType]);

  const handleApply = () => {
    const filters: FilterOptions = {};
    
    if (['staff', 'student', 'course'].includes(entityType)) {
      filters.departmentId = selectedDepartment;
    }
    
    if (['student', 'course', 'module'].includes(entityType)) {
      filters.courseId = selectedCourse;
    }
    
    if (['staff', 'student'].includes(entityType)) {
      filters.sex = selectedGender;
    }
    
    if (['event'].includes(entityType)) {
      filters.staffId = selectedStaff;
    }
    
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedDepartment(null);
    setSelectedCourse(null);
    setSelectedGender(null);
    setSelectedStaff(null); 
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    onApply({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md p-4 border border-gray-200 z-50 w-64">
      <div className="space-y-4">
        {['staff', 'student', 'course'].includes(entityType) && (
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
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {['student', 'course', 'module'].includes(entityType) && (
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
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {['staff', 'student'].includes(entityType) && (
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
        
        {['event'].includes(entityType) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Member
            </label>
            <select
  value={selectedStaff || ''}
  onChange={(e) => setSelectedStaff(e.target.value || null)}
  className="w-full rounded-md border border-gray-300 p-2 text-sm"
>
  <option value="">All Staff</option> {/* This option is missing */}
  {staff.map(staff => (
    <option key={staff.id} value={staff.id}>
      {staff.name}
    </option>
  ))}
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