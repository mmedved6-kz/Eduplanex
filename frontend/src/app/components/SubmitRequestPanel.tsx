import { useState } from "react";
import { toast } from "react-toastify";

interface SubmitRequestPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

type RequestType = 'availability' | 'room-change' | 'equipment' | 'support' | 'other';

const requestOptions = [
    { label: 'Submit Availability', value: 'availability' },
    { label: 'Request Room Change', value: 'room-change' },
    { label: 'Request Additional Equipment', value: 'equipment' },
    { label: 'Request Teaching Support', value: 'support' },
    { label: 'Other', value: 'other' },
];

const SubmitRequestPanel = ({ isOpen, onClose }: SubmitRequestPanelProps) => {
    const [requestType, setRequestType] = useState<RequestType>('availability');
    const [requestDetails, setRequestDetails] = useState('');
    const [loading, setLoading] = useState(false);

    if(!isOpen) return null;

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Mock API call - in real app, you would send to backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Request submitted:', {
              type: requestType,
              details: requestDetails
            });
            
            // Show success message
            toast.success('Your request has been submitted successfully');
            
            // Reset form and close modal
            setRequestDetails('');
            onClose();
          } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Failed to submit request. Please try again.');
          } finally {
            setLoading(false);
          }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Submit Request</h2>
                  <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Type
                    </label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value as RequestType)}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {requestOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Details
                    </label>
                    <textarea
                      value={requestDetails}
                      onChange={(e) => setRequestDetails(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                      placeholder="Please provide detailed information about your request..."
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
}

export default SubmitRequestPanel;