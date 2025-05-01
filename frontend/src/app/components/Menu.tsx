"use client";

import Link from "next/link";
import Image from "next/image";
import { role } from "../lib/data";
import { useEffect, useState } from "react";

const handleLogout = () => {
  localStorage.removeItem('user');
};

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/dashboard/admin",
        visible: ["admin"],
      },
      {
        icon: "/home.png",
        label: "Home",
        href: "/dashboard/staff",
        visible: ["staff"],
      },
      {
        icon: "/home.png",
        label: "Home",
        href: "/dashboard/student",
        visible: ["student"],
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
        icon: "/course.png",
        label: "Courses",
        href: "/dashboard/list/course",
        visible: ["admin", "staff"],
      },
      {
        icon: "/department.png",
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
      {
        icon: "/constraint.png",
        label: "Constraints",
        href: "/dashboard/list/constraints",
        visible: ["admin", "staff"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/settings.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "staff", "student"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        onClick: handleLogout,
        href: "/login",
        visible: ["admin", "staff", "student"],
      },
    ],
  },
];

const Menu = () => {
  const [userRole, setUserRole] = useState("staff") // Default role, replace with actual role fetching logic

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserRole(user.role);
      } catch (error) {
        console.error("Failed to parse user role:", error);
      }
    }
  }, []);

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(userRole)) {
              return (
                <Link
                  href={item.href || '#'}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-blue-50"
                  onClick={item.onClick}
                  >
                  <Image src={item.icon} alt="" width={20} height={20} className="filter invert"/>
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
