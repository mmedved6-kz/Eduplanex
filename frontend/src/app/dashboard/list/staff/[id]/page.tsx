import Announcements from "@/app/components/Announcements";
import BigCalendar from "@/app/components/BigCalendar";
import FormModal from "@/app/components/FormModal";
import Image from "next/image";
import Link from "next/link";

const StaffPage = () => {
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
        {/* Left */}
        <div className="w-full xl:w-2/3">
            {/* Top */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Staff Info Card */} 
                <div className="bg-blue-100 py-6 px-4 rounded-md flex-1 flex gap-4">
                    <div className="w-1/3">
                        <Image src="/avatar.jpg" alt="" width={144} height={144} className="w-36 h-36 rounded-full object-cover" />
                    </div>
                    <div className="w-2/3 flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold">Medet Murzakhanov</h1>
                        <FormModal table="staff" type="update" data={{}} />
                        <p className="text-sm text-gray-500">TEST DESCRIPTION</p>
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                            {/* lg:w-full 2xl:w-1/3 */}
                            <div className="w-full md:w-1/3 flex items-center gap-2">
                               <Image src="/mail.png" alt="" width={14} height={14} />
                                <span>user@university.com</span> 
                            </div>
                            <div className="w-full md:w-1/3 flex items-center gap-2">
                               <Image src="/phone.png" alt="" width={14} height={14} />
                                <span>user@university.com</span> 
                            </div>
                            <div className="w-full md:w-1/3 flex items-center gap-2">
                               <Image src="/date.png" alt="" width={14} height={14} />
                                <span>user@university.com</span> 
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                {/* Staff Stat Cards - Grouped Together */}
                <div className="flex-1 flex gap-4 flex-wrap">
                    {/* Attendance */}
                    <div className="bg-white p-4 rounded-md flex gap-4 w-[48%]">
                        <Image src="/calendar.png" alt="" width={24} height={24} className="w-6 h-6"/>
                        <div>
                            <h1 className="text-xl font-semibold">90%</h1>
                            <span className="text-sm text-gray-400">Attendance</span>
                        </div>
                    </div>

                    {/* Classes */}
                    <div className="bg-white p-4 rounded-md flex gap-4 w-[48%]">
                        <Image src="/calendar.png" alt="" width={24} height={24} className="w-6 h-6"/>
                        <div>
                            <h1 className="text-xl font-semibold">6</h1>
                            <span className="text-sm text-gray-400">Classes</span>
                        </div>
                    </div>

                    {/* Lessons */}
                    <div className="bg-white p-4 rounded-md flex gap-4 w-[48%]">
                        <Image src="/calendar.png" alt="" width={24} height={24} className="w-6 h-6"/>
                        <div>
                            <h1 className="text-xl font-semibold">6</h1>
                            <span className="text-sm text-gray-400">Lessons</span>
                        </div>
                    </div>

                    {/* Departments */}
                    <div className="bg-white p-4 rounded-md flex gap-4 w-[48%]">
                        <Image src="/calendar.png" alt="" width={24} height={24} className="w-6 h-6"/>
                        <div>
                            <h1 className="text-xl font-semibold">6</h1>
                            <span className="text-sm text-gray-400">Departments</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Bottom */}
            <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
                <h1>Teacher&apos;s Schedule</h1>
                <BigCalendar />
            </div>
        </div>
        {/* Right */}
        <div className="w-full xl:w-1/3 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-md">
                <h1 className="text-xl font-semibold">Shortcuts</h1>
                <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
                    <Link className="p-3 rounded-md bg-[#5abfff]" href="/">Teacher&apos;s Classes</Link>
                    <Link className="p-3 rounded-md bg-[#5abfff]" href="/">Teacher&apos;s Students</Link>
                    <Link className="p-3 rounded-md bg-[#5abfff]" href="/">Teacher&apos;s Lessons</Link>
                    <Link className="p-3 rounded-md bg-[#5abfff]" href="/">Teacher&apos;s Exams</Link>
                </div>
            </div>
            <Announcements />
        </div>
    </div>
  );
};

export default StaffPage;