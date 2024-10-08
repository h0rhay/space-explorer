import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLoaderData } from '@remix-run/react';
import ApodImage from './ApodImage';

interface ApodTileProps {
  apods: ApodData[]; // Define the prop type for apods
}
interface ApodData {
  title: string;
  url: string;
  explanation: string;
}

interface LoaderData {
  apods: ApodData[];
}

// Define the functional component
const ApodTile: React.FC<ApodTileProps> = () => {
  const { apods } = useLoaderData<LoaderData>();
  const [activeIndex, setActiveIndex] = useState<number>(0); // Track active APOD
  const [revealedText, setRevealedText] = useState<string>(''); // Track text for typewriter effect
  const [typingActive, setTypingActive] = useState<boolean>(false); // Track if typewriter effect is active
  const [typingCompleted, setTypingCompleted] = useState<boolean>(false); // Track when typing has fully completed
  const typingInterval = useRef<NodeJS.Timeout | null>(null); // Ref to store typing interval
  const tileRef = useRef<HTMLDivElement | null>(null); // Ref to store the tile
  const [timeline, setTimeline] = useState(0); // Track scroll position

  const handleClick = (index: number) => {
    if (typingActive) {
      resetTypewriterEffect(); // Toggle off if typing is active
    } else if (!typingCompleted) {
      startTypewriterEffect(index); // Start typing if it's not completed
    } else {
      resetTypewriterEffect(); // Reset if already completed
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tileRef.current && !tileRef.current.contains(event.target as Node)) {
        resetTypewriterEffect(); // Reset typing if clicked outside the tile
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const startTypewriterEffect = (index: number) => {
    const explanation = apods[index].explanation;
    let currentIndex = 0;

    // Clear any existing typing interval to avoid overlapping intervals
    if (typingInterval.current) {
      clearInterval(typingInterval.current);
    }

    setRevealedText(''); // Reset text
    setTypingActive(true); // Mark typing as active
    setTypingCompleted(false); // Reset typing completion state

    typingInterval.current = setInterval(() => {
      currentIndex++;

      setRevealedText(explanation.slice(0, currentIndex)); // Show the correct slice of the text

      if (currentIndex === explanation.length) {
        clearInterval(typingInterval.current!); // Clear interval once typing is done
        setTypingActive(false); // Mark typing as inactive
        setTypingCompleted(true); // Mark typing as fully completed
      }
    }, 10); // Typing speed
  };

  const resetTypewriterEffect = () => {
    if (typingInterval.current) {
      clearInterval(typingInterval.current);
    }
    setRevealedText(''); // Clear the text only on explicit user action
    setTypingActive(false); // Disable typing
    setTypingCompleted(false); // Reset typing completed state
  };

  // Memoize the transform calculation to prevent unnecessary recalculations
  const calculateTransform = useMemo(() => (index: number) => {
    const baseScroll = index * 1000;
    const progress = (timeline - baseScroll) / 500;
  
    const scale = progress >= 0.5 ? 1.5 : Math.min(1.5, progress + 0.5);
    const opacity = progress >= 0 ? 1 : Math.max(0, 1 + progress);
  
    // Subtle skew effect to simulate the bottom-right corner being closer to the viewer
    const initialSkewX = -5; // Subtle skew on X-axis
    const initialSkewY = 3;  // Slight positive skew on Y-axis for perspective
    const skewX = initialSkewX * (1 - Math.min(1, Math.abs(progress))); // Skew decreases with scroll
    const skewY = initialSkewY * (1 - Math.min(1, Math.abs(progress))); // Adjust Y-skew subtly
  
    // Gentle floating effect: reduce randomness in translation for smoother movement
    const translateX = Math.sin(progress * Math.PI) * 10; // Gentle horizontal floating movement
    const translateY = Math.cos(progress * Math.PI) * 10; // Gentle vertical floating movement
  
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) skew(${skewX}deg, ${skewY}deg)`,
      opacity: opacity,
      transition: progress > 1 ? 'transform 0.1s ease-in, opacity 0.1s ease-in' : 'transform 0.1s ease-in-out, opacity 0.1s ease-in-out',
    };
  }, [timeline]);
  
  
  

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (!typingActive) {
        setTimeline((prev) => {
          const newTimeline = prev + e.deltaY * 1; // Adjust scroll sensitivity

          // Once the tile has flown past, reset the timeline for the next tile
          if (newTimeline > (activeIndex + 1) * 1000) {
            setActiveIndex((prevIndex) => (prevIndex + 1) % apods.length); // Move to the next APOD
            setTimeline((activeIndex + 1) * 1000); // Reset timeline for new tile
          }

          return newTimeline;
        });
      }
    };

    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [typingActive, activeIndex, apods.length]);

  const activeApod = apods[activeIndex]; // Render only the active APOD

  // Guard against empty apods array
  if (!apods || apods.length === 0) {
    return <div>No APOD data available.</div>;
  }

  return (
    <div className="scroll-container">
      <div className="wrapper">
        <div className="content">
          <div
            key={activeIndex}
            className={`apod apod-${activeIndex}`}
            style={calculateTransform(activeIndex)}
            onClick={() => handleClick(activeIndex)}
            tabIndex={0} // Make the element tabbable
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick(activeIndex); // Trigger click on Enter or Space key press
              }
            }}
            ref={tileRef}
            role="button"
          >
            <h2 className="text-2xl font-dosis font-bold text-white">{activeApod.title}</h2>
            <ApodImage title={activeApod.title} url={activeApod.url} />
            {revealedText && (
              <div className="description">
                <p className="font-dosis typing-effect text-left">{revealedText}</p> {/* Typewriter effect */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the component using React.memo to prevent unnecessary re-renders
export default React.memo(ApodTile);
