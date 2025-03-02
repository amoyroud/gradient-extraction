"use client"

import { useEffect, useState, useRef, memo } from "react"
import { motion, stagger, useAnimate } from "framer-motion"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { ShimmerButton } from "@/components/ui/shimmer-button"

// Updated with local gradients including the new one
const gradientImages = [
  {
    url: "/images/gradient-linear-to-bottom-1740899561667.png",
    title: "Linear Gradient To Bottom",
    location: {
      city: "Santorini",
      coordinates: "36.3932° N, 25.4615° E",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    url: "/images/gradient-linear-to-bottom-(emphasized)-1740899492765.png",
    title: "Emphasized Linear Gradient",
    location: {
      city: "Malibu",
      coordinates: "34.0259° N, 118.7798° W",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  },
  {
    url: "/images/gradient-linear-to-bottom-1740899359648.png",
    title: "Linear Gradient Variation",
    location: {
      city: "Bali",
      coordinates: "8.3405° S, 115.0920° E",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1) // 1 hour ago
  },
  {
    url: "/images/gradient-linear-to-bottom-1740899674440.png",
    title: "New Linear Gradient",
    location: {
      city: "Cape Town",
      coordinates: "33.9249° S, 18.4241° E",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  // Add duplicates of the same images for filling out the layout
  {
    url: "/images/gradient-linear-to-bottom-1740899561667.png",
    title: "Linear Gradient To Bottom",
    location: {
      city: "Amalfi Coast",
      coordinates: "40.6333° N, 14.6029° E",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
  },
  {
    url: "/images/gradient-linear-to-bottom-(emphasized)-1740899492765.png",
    title: "Emphasized Linear Gradient",
    location: {
      city: "Sydney",
      coordinates: "33.8688° S, 151.2093° E",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  },
  {
    url: "/images/gradient-linear-to-bottom-1740899359648.png",
    title: "Linear Gradient Variation",
    location: {
      city: "Positano",
      coordinates: "40.6280° N, 14.4851° E",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
  },
  {
    url: "/images/gradient-linear-to-bottom-1740899674440.png",
    title: "New Linear Gradient",
    location: {
      city: "Big Sur",
      coordinates: "36.2704° N, 121.8081° W",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
  },
  {
    url: "/images/gradient-linear-to-bottom-1740899561667.png",
    title: "Linear Gradient To Bottom",
    location: {
      city: "Maui",
      coordinates: "20.7984° N, 156.3319° W",
    },
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  },
]

// Memoized version of FloatingElement to prevent unnecessary re-renders
const MemoizedFloatingElement = memo(FloatingElement);

// Helper function to format time difference as "X hours/minutes ago"
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;
  
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
};

// Memoized Image component
const FloatingImage = memo(({ 
  src, 
  alt, 
  className, 
  location, 
  generatedAt 
}: { 
  src: string; 
  alt: string; 
  className: string;
  location?: { city: string; coordinates: string };
  generatedAt?: Date;
}) => {
  // Loading state for image
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="relative flex flex-col">
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />
      {location && generatedAt && (
        <div className="absolute bottom-[-24px] left-0 right-0 text-center">
          <p className="text-[10px] text-gray-500 bg-white/80 backdrop-blur-sm py-1 px-2 rounded-sm shadow-sm max-w-fit mx-auto">
            {location.city} - {location.coordinates} - generated {formatTimeAgo(generatedAt)}
          </p>
        </div>
      )}
    </div>
  );
});

FloatingImage.displayName = 'FloatingImage';

interface FloatingGradientLandingProps {
  onGetStarted: () => void;
}

const FloatingGradientLanding: React.FC<FloatingGradientLandingProps> = ({ onGetStarted }) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    // Simplified animation for better performance
    animate("img", { opacity: [0, 1] }, { duration: 0.3, delay: stagger(0.1) });
  }, [animate]);

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <div
        className="flex w-full h-full min-h-screen justify-center items-center overflow-hidden"
        ref={scope}
      >
        <motion.div
          className="z-50 text-center space-y-6 items-center flex flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-5xl md:text-7xl z-50 text-gray-900 font-light">
            Gradient Experiment
          </h1>
          <ShimmerButton 
            onClick={onGetStarted}
            shimmerColor="rgba(255, 255, 255, 0.4)"
            shimmerSize="0.05em"
            shimmerDuration="2.5s"
            background="rgba(0, 0, 0, 0.9)"
            borderRadius="8px"
            className="text-sm font-medium cursor-pointer px-8 py-3 z-50"
          >
            Get Started
          </ShimmerButton>
        </motion.div>

        <Floating sensitivity={-0.5} className="overflow-hidden">
          {/* Strategically placed floating elements with optimized rendering */}
          <MemoizedFloatingElement depth={0.3} className="top-[8%] left-[11%]">
            <FloatingImage
              src={gradientImages[0].url}
              alt={gradientImages[0].title}
              className="w-32 h-32 md:w-48 md:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[0].location}
              generatedAt={gradientImages[0].generatedAt}
            />
          </MemoizedFloatingElement>
          
          <MemoizedFloatingElement depth={0.6} className="top-[10%] left-[32%]">
            <FloatingImage
              src={gradientImages[1].url}
              alt={gradientImages[1].title}
              className="w-40 h-40 md:w-56 md:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[1].location}
              generatedAt={gradientImages[1].generatedAt}
            />
          </MemoizedFloatingElement>
          
          <MemoizedFloatingElement depth={0.8} className="top-[2%] left-[53%]">
            <FloatingImage
              src={gradientImages[2].url}
              alt={gradientImages[2].title}
              className="w-56 h-56 md:w-80 md:h-80 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[2].location}
              generatedAt={gradientImages[2].generatedAt}
            />
          </MemoizedFloatingElement>
          
          <MemoizedFloatingElement depth={0.5} className="top-[0%] left-[83%]">
            <FloatingImage
              src={gradientImages[3].url}
              alt={gradientImages[3].title}
              className="w-48 h-48 md:w-64 md:h-64 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[3].location}
              generatedAt={gradientImages[3].generatedAt}
            />
          </MemoizedFloatingElement>

          <MemoizedFloatingElement depth={0.4} className="top-[40%] left-[2%]">
            <FloatingImage
              src={gradientImages[4].url}
              alt={gradientImages[4].title}
              className="w-56 h-56 md:w-72 md:h-72 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[4].location}
              generatedAt={gradientImages[4].generatedAt}
            />
          </MemoizedFloatingElement>
          
          <MemoizedFloatingElement depth={0.7} className="top-[70%] left-[77%]">
            <FloatingImage
              src={gradientImages[5].url}
              alt={gradientImages[5].title}
              className="w-56 h-56 md:w-72 md:h-72 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[5].location}
              generatedAt={gradientImages[5].generatedAt}
            />
          </MemoizedFloatingElement>

          <MemoizedFloatingElement depth={0.9} className="top-[73%] left-[15%]">
            <FloatingImage
              src={gradientImages[6].url}
              alt={gradientImages[6].title}
              className="w-64 h-64 md:w-88 md:h-88 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[6].location}
              generatedAt={gradientImages[6].generatedAt}
            />
          </MemoizedFloatingElement>
          
          <MemoizedFloatingElement depth={0.5} className="top-[80%] left-[50%]">
            <FloatingImage
              src={gradientImages[7].url}
              alt={gradientImages[7].title}
              className="w-48 h-48 md:w-64 md:h-64 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[7].location}
              generatedAt={gradientImages[7].generatedAt}
            />
          </MemoizedFloatingElement>
          
          <MemoizedFloatingElement depth={0.6} className="top-[45%] left-[60%]">
            <FloatingImage
              src={gradientImages[8].url}
              alt={gradientImages[8].title}
              className="w-40 h-40 md:w-56 md:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-md"
              location={gradientImages[8].location}
              generatedAt={gradientImages[8].generatedAt}
            />
          </MemoizedFloatingElement>
        </Floating>
      </div>
    </div>
  );
};

export default memo(FloatingGradientLanding); 