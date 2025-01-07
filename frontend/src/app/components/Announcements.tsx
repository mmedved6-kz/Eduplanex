const Announcements = () => {
    return (
        <div className="bg-white p-4 rounded-md">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Announcements</h1>
                <span className="text-xs text-gray-400">View All</span>
            </div>
            <div className="flex flex-col gap-4 mt-4">
                <div className="bg-blue-50 rounded-md p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium">Test Announcement</h2>
                        <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">2025-01-07</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Test description</p>
                </div>
                <div className="bg-blue-50 rounded-md p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium">Test Announcement 2</h2>
                        <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">2025-01-07</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Test description</p>
                </div>
                <div className="bg-blue-50 rounded-md p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium">Test Announcement 3</h2>
                        <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">2025-01-07</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Test description</p>
                </div>
            </div>
        </div>
    )
}

export default Announcements;