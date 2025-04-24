import Image from "next/image";

interface TableSearchProps {
    onSearch: (query: string) => void;
}

const TableSearch = ({ onSearch }: TableSearchProps) => {
    return (
        <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
            <Image src="/search.png" alt="Search" width={14} height={14} className="filter invert"/>
            <input type="text" placeholder="Search..." className="w-[200px] p-2 bg-transparent outline-none" onChange={(e) => onSearch(e.target.value)}/>
        </div>
    );
};

export default TableSearch;