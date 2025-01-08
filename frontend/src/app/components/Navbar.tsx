import Image from 'next/image';

const Navbar = () => {
    return (
        <div className="flex items-center justify-between p-4 bg-white">
            {/* Search Section */}
            <div className="hidden md:flex items-center gap-2 text-xs rounded-full border border-gray-300 px-2">
                <Image src="/search.png" alt="Search" width={14} height={14} />
                <input
                    type="text"
                    placeholder="Search..."
                    className='w-[200px] p-2 bg-transparent outline-none text-gray-700'
                />
            </div>

            {/* User Actions Section */}
            <div className='flex items-center gap-6 justify-end w-full'>
                {/* Messages Icon */}
                <div className='bg-gray-100 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-blue-100'>
                    <Image src="/message.png" alt="Messages" width={20} height={20} />
                </div>

                {/* Announcements Icon with Badge */}
                <div className='bg-gray-100 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-blue-100 relative'>
                    <Image src="/announcement.png" alt="Announcements" width={20} height={20} />
                    <div className='absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs'>
                        3
                    </div>
                </div>

                {/* User Info */}
                <div className='flex flex-col text-right'>
                    <span className='text-xs leading-3 font-medium text-gray-700'>Medet Murzakhanov</span>
                    <span className='text-[10px] text-gray-500'>Admin</span>
                </div>

                {/* User Avatar */}
                <Image src="/avatar.jpg" alt="User Avatar" width={36} height={36} className='rounded-full border border-gray-300 object-cover w-9 h-9' />
            </div>
        </div>
    )
}

export default Navbar;
