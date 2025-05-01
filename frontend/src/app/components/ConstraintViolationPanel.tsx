// ConstraintViolationPanel.tsx
interface Violation {
  constraintId?: string;
  message: string;
  type?: string;
}

interface ConstraintViolationPanelProps {
  hardViolations: Violation[];
  softWarnings: Violation[];
  event: any;
  onSave: () => void;
  onCancel: () => void;
}

const ConstraintViolationPanel = ({ 
  hardViolations = [], 
  softWarnings = [], 
  event, 
  onSave, 
  onCancel 
}: ConstraintViolationPanelProps) => {
  
  // Fix the grouping function with proper typing
  const groupViolationsByCategory = (violations: Violation[]) => {
    const grouped: Record<string, Violation[]> = {};
    
    violations.forEach(v => {
      // Handle case where constraintId might be undefined
      if (!v.constraintId) {
        if (!grouped['OTHER']) {
          grouped['OTHER'] = [];
        }
        grouped['OTHER'].push(v);
        return;
      }
      
      const parts = v.constraintId.split('-');
      const category = parts.length > 0 ? parts[0].toUpperCase() : 'OTHER';
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(v);
    });
    
    return grouped;
  };
  
  const hardViolationsByCategory = groupViolationsByCategory(hardViolations);
  const softWarningsByCategory = groupViolationsByCategory(softWarnings);
  
  // Fix the category styles function with proper typing
  const categoryStyles: Record<string, { color: string; icon: string }> = {
    'ROOM': { color: 'blue', icon: '🏢' },
    'STAFF': { color: 'purple', icon: '👨‍🏫' },
    'CONSECUTIVE': { color: 'orange', icon: '⏱️' },
    'BUILDING': { color: 'teal', icon: '🚶' },
    'LUNCH': { color: 'green', icon: '🍽️' },
    'BACK': { color: 'indigo', icon: '⏭️' },
    'OTHER': { color: 'gray', icon: '⚠️' }
  };
  
  const getCategoryStyles = (category: string) => {
    return categoryStyles[category] || { color: 'gray', icon: '⚠️' };
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Constraint Check Results</h2>
        
        {hardViolations.length === 0 && softWarnings.length === 0 ? (
          <p className="text-green-600 mb-4">No constraints violated.</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            {hardViolations.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2 text-red-600">
                  Hard Constraints Violated ({hardViolations.length}):
                </p>
                
                {Object.entries(hardViolationsByCategory).map(([category, violations]) => (
                  <div key={category} className="mb-3">
                    <p className="font-medium text-sm text-gray-700">
                      {getCategoryStyles(category).icon} {category} CONSTRAINTS
                    </p>
                    <ul className="list-disc pl-5">
                      {violations.map((v, i) => (
                        <li key={i} className="text-red-600 mb-1">
                          {v.constraintId ? (
                            <span className="font-medium">
                              {v.constraintId.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}:
                            </span>
                          ) : (
                            <span className="font-medium">Constraint Error:</span>
                          )} {v.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                <p className="text-sm text-red-600 mt-1">
                  These issues must be resolved before scheduling.
                </p>
              </div>
            )}
            
            {softWarnings.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2 text-amber-600">
                  Soft Constraints ({softWarnings.length}):
                </p>
                
                {Object.entries(softWarningsByCategory).map(([category, warnings]) => (
                  <div key={category} className="mb-3">
                    <p className="font-medium text-sm text-gray-700">
                      {getCategoryStyles(category).icon} {category} PREFERENCES
                    </p>
                    <ul className="list-disc pl-5">
                      {warnings.map((v, i) => (
                        <li key={i} className="text-amber-600 mb-1">
                          {v.constraintId ? (
                            <span className="font-medium">
                              {v.constraintId.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}:
                            </span>
                          ) : (
                            <span className="font-medium">Warning:</span>
                          )} {v.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                <p className="text-sm text-amber-600 mt-1">
                  These are recommendations that can be overridden.
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className={`px-4 py-2 text-white rounded hover:opacity-90 ${
              hardViolations.length > 0 
                ? 'bg-yellow-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {hardViolations.length > 0
              ? 'Save with Violations' 
              : softWarnings.length > 0 
                ? 'Save Anyway' 
                : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConstraintViolationPanel;