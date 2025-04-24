import Link from "next/link";
import Image from "next/image";
import Menu from "../components/Menu";
import Navbar from "../components/Navbar";

export default function DashboardLayout({
    children,
    }: Readonly<{
    children: React.ReactNode;
    }>) {
    return (
        <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 bg-white shadow-lg border-r border-gray-200">
                <Link href="/" className="flex items-center justify-center mb-4">
                <Image src="/logo.png" alt="EduPlanEx Logo" width={100} height={32} />
                {/*<span className="hidden lg:block font-bold text-gray-800">Eduplanex</span>*/}
                </Link>    
                <Menu/>
            </div> 
            {/* Main content */}
            <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] flex flex-col">
                <Navbar/>
                {children}
            </div>
        </div>
    );
};
