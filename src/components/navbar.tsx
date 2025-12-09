"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Navbar() {
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem("tinaai_user_email") || "demo@tinaai.com";
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tinaai_auth");
    localStorage.removeItem("tinaai_user_email");
    router.push("/sign-in");
  };

  return (
    <div className="fixed inset-x-0 top-0 bg-slate-100  z-[10] h-fit  py-4 ">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto">
        <div className="flex flex-row gap-3 justify-center">
          <Link href={"/dashboard"} className="flex items-center gap-2">
            <p className="px-2 py-1 text-2xl font-bold text-black">
              Tina<span className="text-indigo-600">AI</span>{" "}
              <span className="text-[8px]">Beta</span>
            </p>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
