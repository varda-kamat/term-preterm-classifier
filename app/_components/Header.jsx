"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

export const Header = () => {

  const { user } = useAuth();

  return (
    <div className="w-full flex items-center justify-between p-4 inset-0 bg-gradient-to-r from-blue-300 via-blue-100 to-blue-300 opacity-90 shadow-md">
      <div className="flex items-center">
        <Image
          src={"/logo.png"}
          width={50}
          height={50}
          alt="Logo"
          className="rounded-full border-4 border-blue-400"
        />
        <h1 className="font-bold text-2xl ml-3 text-blue-800 transition-colors duration-300">
          Happy Pregnancy
        </h1>
      </div>

      {/* Right side: Button */}
      <div className="flex items-center">
        <a
          className="ml-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-300 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transform hover:scale-105 px-4 py-2"
          href={{user} ? "/dashboard" : "/sign-in"}
        >
          Get Started
        </a>
      </div>
    </div>
  );
};
