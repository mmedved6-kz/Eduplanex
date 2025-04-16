const Announcements = () => {
    return (
        <div className="bg-white p-3 rounded-md">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Announcements</h1>
                <span className="text-xs text-gray-400 hover:text-blue-500 cursor-pointer">View All</span>
            </div>
            <div className="flex flex-col gap-2 mt-3">
                <div className="bg-blue-50 rounded-md p-2">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium text-sm">Test Announcement</h2>
                        <span className="text-xs text-gray-400 bg-white rounded-md px-1">2025-01-07</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Test description</p>
                </div>
                <div className="bg-blue-50 rounded-md p-2">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium text-sm">Test Announcement 2</h2>
                        <span className="text-xs text-gray-400 bg-white rounded-md px-1">2025-01-07</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Test description</p>
                </div>
                <div className="bg-blue-50 rounded-md p-2">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium text-sm">Test Announcement 3</h2>
                        <span className="text-xs text-gray-400 bg-white rounded-md px-1">2025-01-07</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Test description</p>
                </div>
            </div>
        </div>
    )
}

export default Announcements;