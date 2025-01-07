const AssignmentCard = () => {
    // TEST
    const assignments = [
        {title: "Database Project", dueDate: "Jan 15", status: "Pending"},
        {title: "AI Research Paper", dueDate: "Jan 20", status: "In Progress"},
        {title: "Web Development Lab", dueDate: "Jan 25", status: "Completed"},
    ];
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Upcoming Assignments</h3>
            <ul className="space-y-4">
                {assignments.map((assignment, index) => (
                    <li
                        key={index}
                        className={`flex justify-between p-4 border rounded-lg ${
                            assignment.status === "Pending"
                            ? "bg-red-100 border-red-400 text-red-700"
                            : assignment.status === "In Progress"
                            ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                            : "bg-green-100 border-green-400 text-green-700"
                        }`}
                    >
                        <div>
                            <p className="font-bold">{assignment.title}</p>
                            <p className="text-sm">{assignment.dueDate}</p>
                        </div>
                        <span className="text-sm font-semibold">
                            {assignment.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssignmentCard;