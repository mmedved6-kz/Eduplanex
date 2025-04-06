import Link from "next/link";
import Image from "next/image";
import { role } from "../lib/data";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/dashboard/staff",
        visible: ["admin", "staff", "student"],
      },
      {
        icon: "/staff.png",
        label: "Staff",
        href: "/dashboard/list/staff",
        visible: ["admin", "staff"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/dashboard/list/student",
        visible: ["admin", "staff"],
      },
      {
        icon: "/module.png",
        label: "Modules",
        href: "/dashboard/list/module",
        visible: ["admin"],
      },
      {
        icon: "/module.png",
        label: "Courses",
        href: "/dashboard/list/course",
        visible: ["admin", "staff"],
      },
      {
        icon: "/module.png",
        label: "Departments",
        href: "/dashboard/list/departments",
        visible: ["admin", "staff"],
      },
      {
        icon: "/event.png",
        label: "Events",
        href: "/dashboard/list/event",
        visible: ["admin", "staff", "student"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "staff", "student"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "staff", "student"],
      },
    ],
  },
];

const Menu = () => {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-blue-50"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
