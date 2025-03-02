import React, { useState, useEffect } from 'react';
import AnimatedGradientBackground from './AnimatedGradientBackground';

// Helper function to create animation delay entries
const createAnimationDelay = (index: number, baseDelay = 0.5) => ({
  animationDelay: `${baseDelay + index * 0.2}s`
});

const LandingPage: React.FC = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  
  const navigateToApp = () => {
    setIsNavigating(true);
    // Add a small delay before navigation to allow for transition animation
    setTimeout(() => {
      window.location.hash = 'app';
    }, 300);
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Set up intersection observers for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all elements with the animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden bg-black transition-opacity duration-300 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Premium animated gradient background */}
      <AnimatedGradientBackground 
        Breathing={true}
        startingGap={145}
        gradientColors={[
          "#080808", 
          "#1E1E1E", 
          "#4A3AFF", 
          "#FF5757", 
          "#FF914D", 
          "#FFDE59"
        ]}
        gradientStops={[30, 45, 60, 75, 85, 100]}
        animationSpeed={0.01}
        breathingRange={8}
        topOffset={-35}
      />
      
      {/* Noise overlay for texture */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-10"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          filter: 'contrast(170%) brightness(1000%)',
        }}
      />

      <div className="container relative mx-auto px-6 py-24 z-20">
        <header className="flex justify-between items-center mb-16">
          <div 
            className={`flex items-center space-x-3 transition-all duration-800 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
            style={{ transitionDelay: '0.3s' }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white font-medium text-xl">Sunset Memories</span>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row items-center mt-12 mb-20">
          <div className="w-full lg:w-1/2 lg:pr-8">
            <h1 
              className={`text-4xl md:text-6xl font-bold mb-6 text-white leading-tight transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={createAnimationDelay(0)}
            >
              <span className="animated-text-gradient">Preserve Your Sunsets</span>
              <br />
              <span className="text-gray-300 text-3xl md:text-4xl font-light">Transform fleeting moments into lasting memories</span>
            </h1>
            
            <p 
              className={`text-gray-400 text-lg mb-8 max-w-lg transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={createAnimationDelay(1)}
            >
              Capture the unique colors of your most cherished sunset moments and transform them into beautiful gradient memories you can treasure forever.
            </p>
            
            <div 
              className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={createAnimationDelay(2)}
            >
              <button 
                onClick={navigateToApp}
                className="hero-button px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-lg hover:shadow-lg hover:shadow-indigo-500/30 transition duration-300"
              >
                Capture Your Memory
              </button>
              
              <a 
                href="#process"
                className="px-8 py-4 rounded-lg border-2 border-gray-700/40 text-gray-300 font-medium text-lg hover:border-gray-500 transition duration-300 text-center"
              >
                How It Works
              </a>
            </div>
          </div>
          
          <div 
            className={`w-full lg:w-1/2 mt-12 lg:mt-0 glass-card p-6 rounded-xl transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={createAnimationDelay(3)}
          >
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1618155213956-14d3d7b0d30d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Beautiful sunset over the ocean" 
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <span className="text-sm text-gray-300">Beautiful Memories</span>
                <h3 className="text-xl text-white font-medium">Malibu Sunset, May 2023</h3>
              </div>
            </div>
          </div>
        </div>

        <section 
          id="process"
          className="py-20 animate-on-scroll opacity-0 transition-opacity duration-1000"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our process transforms your sunset photos into beautiful gradients that capture the essence of your memories.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📸",
                title: "Upload Your Photo",
                description: "Share a sunset photo that holds special meaning to you.",
              },
              {
                icon: "✨",
                title: "Extract Colors",
                description: "Our AI analyzes and extracts the unique color palette from your sunset.",
              },
              {
                icon: "🎨",
                title: "Keep Your Memory",
                description: "Save your gradient or transform it into physical keepsakes.",
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="glass-card p-8 rounded-xl text-center animate-on-scroll opacity-0 transition-all duration-500"
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section 
          className="py-20 animate-on-scroll opacity-0 transition-opacity duration-1000"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">People who have preserved their sunset memories with us.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "I captured the sunset from the day my husband proposed. Now I have that exact gradient as a canvas in our bedroom. It's our own little time capsule.",
                author: "Sarah M.",
                location: "California"
              },
              {
                quote: "The sunset from my last evening with my grandfather is now preserved forever. The gradient perfectly captured the warmth of that memory.",
                author: "Marcus J.",
                location: "Florida"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="glass-card p-8 rounded-xl animate-on-scroll opacity-0 transition-all duration-500"
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <blockquote className="text-gray-300 italic mb-6">"{testimonial.quote}"</blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.author[0]}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-medium">{testimonial.author}</p>
                    <p className="text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div 
          className="py-16 text-center animate-on-scroll opacity-0 transition-opacity duration-1000"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Ready to preserve your sunset?</h2>
          <button 
            onClick={navigateToApp}
            className="hero-button px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-lg hover:shadow-lg hover:shadow-indigo-500/30 transition duration-300 mx-auto"
          >
            Capture Your Memory Now
          </button>
        </div>
      </div>

      <footer className="relative z-20 py-8 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2023 Sunset Memories. All rights reserved.</p>
            <p className="text-gray-500 text-sm">Creating lasting memories from fleeting moments.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 