import React, { useState, useEffect } from 'react';
import { useLoaderData } from '@remix-run/react';
import ApodImage from './ApodImage';

interface ApodData {
  title: string;
  url: string;
  explanation: string;
}

interface LoaderData {
  apods: ApodData[];
}

const ApodTile: React.FC = () => {
  const { apods } = useLoaderData<LoaderData>();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revealedText, setRevealedText] = useState<string>(''); // Track revealed text for the typing effect

  // React Hook (useEffect) should be called at the top level
  useEffect(() => {
    if (activeIndex !== null && apods[activeIndex]) { // Logic inside the hook, not conditional
      let currentIndex = 0;
      const explanation = apods[activeIndex].explanation;
      const interval = setInterval(() => {
        setRevealedText(explanation.slice(0, currentIndex + 1));
        currentIndex++;
        if (currentIndex === explanation.length) {
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval); // Clean up when unmounting
    } else {
      setRevealedText(''); // Reset when switching cards
    }
  }, [activeIndex, apods]); // Hook is always called, but logic is inside

  if (!apods || apods.length === 0) {
    return <div>No APOD data available.</div>;
  }

  const handleClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index); // Toggle visibility
  };

  return (
    <div className="ApodTile">
      {apods.map((apod, index) => (
        apod ? (
          <button key={index} className={`apod ${activeIndex === index ? 'active' : ''}`} onClick={() => handleClick(index)} >
            <h2 className="text-2xl font-dosis font-bold text-white" >{apod.title}</h2>
            
          <ApodImage title={apod.title} url={apod.url} /> {/* Use the ApodImage component */}
            <div className={`transition-all duration-700 overflow-hidden ${activeIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="font-dosis typing-effect text-left">
                {activeIndex === index ? revealedText : ''} {/* Typing effect */}
              </p>
            </div>
          </button>
        ) : (
          <div key={index} className="apod">Error loading APOD for this date.</div>
        )
      ))}
    </div>
  );
};

export default ApodTile;

