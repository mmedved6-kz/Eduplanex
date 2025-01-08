import Image from "next/image";

const StaffPage = () => {
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
        {/* Left */}
        <div className="w-full xl:w-2/3">
            {/* Top */}
            <div className=" flex flex-col lg:flex-row gap-4">
                {/* Staff Info Card */} 
                <div className="bg-blue-100 py-6 px-4 rounded-md flex-1 flex gap-4">
                    <div className="w-1/3">
                        <Image src="/avatar.jpg" alt="" width={144} height={144} className="w-36 h-36 rounded-full object-cover" />
                    </div>
                    <div className="w-2/3 flex flex-col justify-between gap-4">
                        <h1 className="text-xl font-semibold">Medet Murzakhanov</h1>
                        <p className="text-sm text-gray-500">TEST DESCRIPTION</p>
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                               <Image src="/mail.png" alt="" width={14} height={14} />
                                <span>user@university.com</span> 
                            </div>
                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                               <Image src="/phone.png" alt="" width={14} height={14} />
                                <span>user@university.com</span> 
                            </div>
                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                               <Image src="/date.png" alt="" width={14} height={14} />
                                <span>user@university.com</span> 
                            </div>
                        </div>
                    </div>
                </div>
                {/* Staff Stat Cards */}
                <div className=""></div>
            </div>
            {/* Bottom */}
            <div className="">Schedule</div>
        </div>
        {/* Right */}
        <div className="w-full xl:w-1/3"></div>
    </div>
  );
};

export default StaffPage;