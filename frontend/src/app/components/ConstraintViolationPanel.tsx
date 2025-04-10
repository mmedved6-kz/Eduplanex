const ConstraintViolationPanel = ({ hardViolations = [], softWarnings = [], event, onSave, onCancel }: any) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Constraint Check Results</h2>
                
                {hardViolations.length === 0 && softWarnings.length === 0 ? (
                    <p className="text-green-600 mb-4">No constraints violated.</p>
                ) : (
                    <div>
                        {hardViolations.length > 0 && (
                            <div className="mb-4">
                                <p className="font-semibold mb-2 text-red-600">
                                    Hard Constraints Violated ({hardViolations.length}):
                                </p>
                                <ul className="list-disc pl-5">
                                    {hardViolations.map((v: any, i: number) => (
                                        <li key={i} className="text-red-600">
                                            {v.message}
                                        </li>
                                    ))}
                                </ul>
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
                                <ul className="list-disc pl-5">
                                    {softWarnings.map((v: any, i: number) => (
                                        <li key={i} className="text-amber-600">
                                            {v.message}
                                        </li>
                                    ))}
                                </ul>
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
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={hardViolations.length > 0}
                    >
                        {hardViolations.length > 0
                            ? 'Cannot Save' 
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