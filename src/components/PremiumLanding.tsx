import React from 'react';
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { VerticalCarousel } from "@/components/ui/vertical-carousel";
import { cn } from "@/lib/utils";

// Gradient placeholders to use instead of images
const SUNSET_GRADIENTS = [
  {
    id: 1,
    css: "linear-gradient(to right, #ff7e5f, #feb47b)",
    name: "Warm Sunset",
    description: "Orange and pink sunset gradient"
  },
  {
    id: 2,
    css: "linear-gradient(to right, #0b486b, #f56217)",
    name: "Ocean Sunset",
    description: "Blue to orange transition"
  },
  {
    id: 3,
    css: "linear-gradient(to right, #614385, #516395)",
    name: "Purple Dusk",
    description: "Purple evening gradient"
  },
  {
    id: 4,
    css: "linear-gradient(to right, #eecda3, #ef629f)",
    name: "Pink Horizon",
    description: "Soft pink sunset"
  },
  {
    id: 5,
    css: "linear-gradient(to right, #ff512f, #f09819)",
    name: "Burning Sky",
    description: "Intense orange sunset"
  },
  {
    id: 6,
    css: "linear-gradient(to right, #4568dc, #b06ab3)",
    name: "Twilight Hour",
    description: "Blue to purple transition"
  },
  {
    id: 7,
    css: "linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)",
    name: "Sunset Trio",
    description: "Purple, pink and orange blend"
  },
  {
    id: 8,
    css: "linear-gradient(to right, #1a2980, #26d0ce)",
    name: "Ocean Blue",
    description: "Deep blue to teal transition"
  }
];

interface PremiumLandingProps {
  onGetStarted?: () => void;
}

const PremiumLanding: React.FC<PremiumLandingProps> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Hero Section with Animated Gradient Overlay */}
      <div className="relative min-h-screen flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 container mx-auto px-4">
          <div className="py-12 flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-6 text-gray-900">
              Discover Your Perfect <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-pink-600">Sunset Palette</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 font-light leading-relaxed">
              Transform your favorite sunset moments into stunning color gradients for your next design project
            </p>
            <div>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl font-light"
                onClick={onGetStarted}
              >
                Get Started
              </Button>
            </div>
          </div>
          
          {/* Vertical Carousel Section */}
          <div className="hidden md:block h-[80vh]">
            <VerticalCarousel 
              visibleItems={1}
              autoScroll={true}
              scrollSpeed={4000}
              className="h-full w-full"
            >
              {SUNSET_GRADIENTS.map((gradient) => (
                <div
                  key={gradient.id}
                  className={cn(
                    "h-full w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500",
                  )}
                >
                  <div 
                    className="h-full w-full flex items-center justify-center"
                    style={{ 
                      background: gradient.css,
                      borderRadius: '1rem',
                    }}
                  >
                    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg text-center max-w-xs">
                      <h3 className="text-2xl font-light text-white mb-2">{gradient.name}</h3>
                      <p className="text-sm text-white/80 font-light">{gradient.description}</p>
                      <button className="mt-4 px-5 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all text-sm text-white font-light">
                        Use This Gradient
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </VerticalCarousel>
          </div>
        </div>
      </div>
      
      {/* Mobile Horizontal Slider (shown only on mobile) */}
      <div className="py-16 px-4 md:hidden bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-light mb-12 text-center text-gray-900">
            Inspiring Sunset Collection
          </h2>
          
          <InfiniteSlider>
            {SUNSET_GRADIENTS.map((gradient) => (
              <div
                key={gradient.id}
                className={cn(
                  "h-[200px] w-[280px] flex-shrink-0 rounded-2xl",
                  "mx-4 overflow-hidden shadow-xl"
                )}
              >
                <div 
                  className="h-full w-full"
                  style={{ 
                    background: gradient.css,
                    borderRadius: '1rem',
                  }}
                >
                  <div className="flex h-full items-end p-4">
                    <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg w-full">
                      <h3 className="text-base font-light text-white">{gradient.name}</h3>
                      <p className="text-xs text-gray-300 font-light">{gradient.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light mb-12 text-center text-gray-900">
            Transform Sunsets Into Design Assets
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-900">Capture Sunset Colors</h3>
              <p className="text-gray-600 font-light">Upload your favorite sunset photos and extract the perfect color palette automatically.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-900">Create Gradients</h3>
              <p className="text-gray-600 font-light">Generate beautiful gradients from your sunset colors for websites, apps, and designs.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-900">Export & Share</h3>
              <p className="text-gray-600 font-light">Export your gradients as CSS, SVG, or PNG files and share them with your team.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLanding; 