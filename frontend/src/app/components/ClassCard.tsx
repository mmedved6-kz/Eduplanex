import Image from "next/image";

// src/app/dashboard/components/ClassCard.tsx
const ClassCard = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="flex items-center bg-white border border-gray-300 shadow-lg p-6 rounded-lg hover:shadow-xl transition duration-300">
            {/* Icon Section */}
            <div className="flex-shrink-0 bg-gray-300 p-4 rounded-md mr-4">
                <Image src="/class.png" alt="Class Icon" width={32} height={32}/>
            </div>

            {/* Text Content Section */}
            <div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    );
};

export default ClassCard;
