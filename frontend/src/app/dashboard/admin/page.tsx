import ClassCard from "@/app/components/AdminDashboardAnalytics"
import AssignmentCard from "@/app/components/AssingmentCard";
import EventCalendar from "@/app/components/EventCalendar";
import Announcements from "@/app/components/Announcements";
import RequireAuth from "@/app/components/RequireAuth";
import DashboardStats from "@/app/components/AdminDashboardAnalytics";

const AdminPage = () => {
    return (
        <RequireAuth allowedRoles={["admin"]}>
        <div className="p-4 flex gap-4 flex-col md:flex-row">
            {/* Left */}
            <div className="w-full lg:w-2/3">
                {/* Class Card */}
                <div className="p-6 space-y-6">
                <DashboardStats />
                </div>

                <div className="w-1/2 p-6 space-y-6">
                <AssignmentCard />

                </div>
            </div>
            {/* Right */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
                {/* Calendar */}
                <EventCalendar />
                <Announcements />
            </div>
        </div>
        </RequireAuth>
    );
}

export default AdminPage;