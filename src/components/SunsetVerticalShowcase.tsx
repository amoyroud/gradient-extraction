import React from "react";
import { VerticalCarousel } from "./ui/vertical-carousel";
import { cn } from "@/lib/utils";

const SUNSET_GRADIENTS = [
  "linear-gradient(to right, #ff8c42, #ffd460, #FF6B6B)",
  "linear-gradient(to right, #5d4954, #fd99ff, #ff7c7c)",
  "linear-gradient(to right, #093028, #237A57, #86C9B5)",
  "linear-gradient(to right, #4B1248, #F0C27B, #FF4E50)",
  "linear-gradient(to right, #141E30, #243B55, #647DEE)",
  "linear-gradient(to right, #2d3436, #fd79a8, #636e72)",
  "linear-gradient(to right, #2c3e50, #fd746c, #ff9068)",
  "linear-gradient(to right, #3f2b96, #a8c0ff, #7F7FD5)",
];

export function SunsetVerticalShowcase() {
  return (
    <div className="w-full flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-2">
          Sunset Collection
        </h2>
        <p className="text-gray-500 max-w-md mx-auto font-light">
          Explore our collection of sunset-inspired gradients for your next design project
        </p>
      </div>
      
      <div className="w-full max-w-3xl mx-auto">
        <VerticalCarousel 
          className="shadow-xl rounded-xl border border-gray-100"
          visibleItems={1}
          autoScroll={false}
        >
          {SUNSET_GRADIENTS.map((gradient, index) => (
            <div
              key={index}
              className={cn(
                "w-full h-full rounded-lg p-5 flex items-center justify-center relative",
              )}
              style={{ background: gradient }}
            >
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-lg" />
              <div className="relative text-white text-center">
                <p className="text-xl font-medium mb-2">Sunset Palette {index + 1}</p>
                <p className="text-sm opacity-80 font-light">{gradient}</p>
                <button className="mt-4 px-5 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all text-sm font-light">
                  Use This Gradient
                </button>
              </div>
            </div>
          ))}
        </VerticalCarousel>
      </div>
    </div>
  );
}

export default SunsetVerticalShowcase; 