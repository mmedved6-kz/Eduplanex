import Announcements from "@/app/components/Announcements";
import BigCalendar from "@/app/components/BigCalendar";
import EventCalendar from "@/app/components/EventCalendar";
import RequireAuth from "@/app/components/RequireAuth";

const StudentPage = () => {
    return (
        <RequireAuth allowedRoles={["admin", "student"]}>
        <div className="p-4 flex gap-4 flex-col xl:flex-row">
            {/* LEFT SIDE */}
            <div className="h-screen w-full flex flex-col justify-between bg-white p-2 rounded-lg shadow-sm overflow-hidden">
                <h1 className="text-lg font-semibold mb-2">Schedule</h1>
                <div className="flex-1 overflow-hidden">
                    <BigCalendar />
                </div>
            </div>
            {/* RIGHT SIDE */} 
            <div className="w-full xl:w-1/3 flex flex-col gap-8">
                <EventCalendar />
                <Announcements />
            </div>
        </div>
        </RequireAuth>
    );
}

export default StudentPage;