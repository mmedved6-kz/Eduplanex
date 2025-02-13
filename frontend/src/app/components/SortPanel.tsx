import { useState } from 'react';

interface SortPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (column: string, order: string) => void;
  currentColumn: string;
  currentOrder: string;
}

const SortPanel = ({ isOpen, onClose, onApply, currentColumn, currentOrder }: SortPanelProps) => {
  const [selectedColumn, setSelectedColumn] = useState(currentColumn);
  const [selectedOrder, setSelectedOrder] = useState(currentOrder);

  if (!isOpen) return null;

  const columnOptions = [
    { value: 's.name', label: 'Name' },
    { value: 'd.name', label: 'Department' },
    { value: 's.email', label: 'Email' },
    { value: 's.phone', label: 'Phone' },
    { value: 's.surname', label: 'Surname' },
    { value: 's.id', label: 'Staff ID' },
  ];

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
            {columnOptions.map((option) => (
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