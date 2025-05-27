"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";

export const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      <section
        className="relative h-[calc(100vh-80px)] bg-cover bg-center bg-fixed mt-[-2px]"
        style={{ backgroundImage: 'url("/hero-background.jpg")' }}
      >
        {/* Lighter reddish-pink overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-red-100 to-pink-200 opacity-90"></div>

        {/* Content */}
        <div className="relative flex items-center justify-center h-full mx-auto max-w-screen-xl px-4 lg:px-8 text-center">
          <div className="text-center">
            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-red-900 mb-4 animate-fadeInUp">
              Machine Learning based Prediction System for Gynaecologists.
            </h1>
            {/* Subtitle */}
            <strong className="block text-2xl md:text-3xl lg:text-4xl font-extrabold text-red-700 mb-6 animate-pulse delay-200">
              Custom patient care and much more
            </strong>
            {/* Description */}
            <p className="text-red-600 text-base md:text-lg lg:text-xl max-w-md mx-auto mb-8 animate-fadeInUp delay-400">
              Unlock accurate term-preterm diagnosis with advanced AI and Machine Learning technologies.
            </p>
            {/* Button */}
            <div className="mt-8 flex justify-center">
              <a
                className="cursor-pointer inline-block bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-pink-500 hover:to-red-600 font-semibold rounded-lg px-10 py-2 text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 animate-fadeInUp delay-600"
                href={user ? "/dashboard" : "/sign-in"}
              >
                Sign-In
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-600 {
          animation-delay: 0.6s;
        }

        /* Hide scrollbar */
        .overflow-hidden::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for all browsers */
        .overflow-hidden {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};
