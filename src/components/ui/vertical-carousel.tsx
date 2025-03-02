import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VerticalCarouselProps {
  children: React.ReactNode[];
  className?: string;
  autoScroll?: boolean;
  scrollSpeed?: number; // Time in ms per item
  visibleItems?: number;
}

export const VerticalCarousel = ({
  children,
  className,
  autoScroll = true,
  scrollSpeed = 3000,
  visibleItems = 3,
}: VerticalCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalItems = children.length;
  
  useEffect(() => {
    if (!autoScroll) return;
    
    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalItems);
    }, scrollSpeed);
    
    return () => clearInterval(intervalId);
  }, [autoScroll, scrollSpeed, totalItems]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const itemHeight = containerRef.current.clientHeight / visibleItems;
    containerRef.current.scrollTo({
      top: activeIndex * itemHeight,
      behavior: "smooth",
    });
  }, [activeIndex, visibleItems]);
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div 
        ref={containerRef}
        className="flex flex-col h-[90vh] transition-all duration-700 ease-in-out"
        style={{ overflow: "hidden" }}
      >
        {/* Duplicate items to create infinite scrolling effect */}
        {React.Children.map(children, (child, index) => (
          <div 
            key={index} 
            className="snap-center flex-shrink-0 transition-all duration-500 ease-in-out"
            style={{
              height: `calc(100% / ${visibleItems})`,
              opacity: Math.abs(activeIndex - index) < visibleItems ? 1 : 0.3,
              transform: `scale(${
                Math.abs(activeIndex - index) < visibleItems ? 1 : 0.9
              })`,
            }}
          >
            {child}
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={() => setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems)}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => setActiveIndex((prev) => (prev + 1) % totalItems)}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}; 