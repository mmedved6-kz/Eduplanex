import { useState } from 'react';

interface SortPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (column: string, order: string) => void;
  currentColumn: string;
  currentOrder: string;
  entityType: 'staff' | 'student' | 'course' | 'module';
}

const SortPanel = ({ isOpen, onClose, onApply, currentColumn, currentOrder, entityType }: SortPanelProps) => {
  const [selectedColumn, setSelectedColumn] = useState(currentColumn);
  const [selectedOrder, setSelectedOrder] = useState(currentOrder);

  if (!isOpen) return null;

  const columnOptions = {
    staff: [
      { value: 'staff.name', label: 'Name' },
      { value: 'department.name', label: 'Department' },
      { value: 'staff.email', label: 'Email' },
      { value: 'staff.phone', label: 'Phone' },
      { value: 'staff.surname', label: 'Surname' },
      { value: 'staff.id', label: 'Staff ID' },
    ],
    student: [
      { value: 'student.name', label: 'Name' },
      { value: 'course.name', label: 'Course' },
      { value: 'student.email', label: 'Email' },
      { value: 'student.phone', label: 'Phone' },
      { value: 'student.surname', label: 'Surname' },
      { value: 'student.id', label: 'Student ID' },
    ],
    course: [
      { value: 'course.name', label: 'Name' },
      { value: 'department.name', label: 'Department' },
      { value: 'course.code', label: 'Code' },
    ],
    module: [
      { value: 'module.name', label: 'Name' },
      { value: 'course.name', label: 'Course' },
      { value: 'module.code', label: 'Code' },
    ],
  };

  const orderOptions = [
    { value: 'ASC', label: 'Ascending' },
    { value: 'DESC', label: 'Descending' },
  ];

  const handleApply = () => {
    onApply(selectedColumn, selectedOrder);
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md p-4 border border-gray-200 z-50 w-64">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          >
            {columnOptions[entityType].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          >
            {orderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
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
  );
};

export default SortPanel;