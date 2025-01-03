import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLoaderData, useFetcher } from '@remix-run/react'
import ApodImage from './ApodImage'
import { formatDate } from '../lib/formatDate'
interface ApodData {
  title: string
  date: string
  url: string
  explanation: string
}

interface LoaderData {
  apods: ApodData[]
}

const ApodTile: React.FC = () => {
  const { apods: initialApods } = useLoaderData<LoaderData>() // Get initial APODs via Remix loader
  const fetcher = useFetcher() // Use Remix fetcher for client-side data fetching

  const [apods, setApods] = useState<ApodData[]>(initialApods) // Store all loaded APODs
  const [activeIndex, setActiveIndex] = useState<number>(0) // Track which APOD is active
  const [revealedText, setRevealedText] = useState<string>('') // Store revealed text for typewriter effect
  const [typingActive, setTypingActive] = useState<boolean>(false) // Flag for active typing
  const [typingCompleted, setTypingCompleted] = useState<boolean>(false) // Flag for completed typing
  const typingInterval = useRef<NodeJS.Timeout | null>(null)
  const tileRef = useRef<HTMLDivElement | null>(null)
  const [timeline, setTimeline] = useState(0) // Track scroll timeline
  const [loadingMore, setLoadingMore] = useState<boolean>(false) // Flag for loading more APODs
  const [lastDate, setLastDate] = useState<string | null>(null) // Track the last loaded date

  // Start typewriter effect
  const startTypewriterEffect = useCallback((explanation: string) => {
    let currentIndex = 0

    if (typingInterval.current) {
      clearInterval(typingInterval.current)
    }

    setRevealedText('')
    setTypingActive(true)
    setTypingCompleted(false)

    typingInterval.current = setInterval(() => {
      currentIndex++
      setRevealedText(explanation.slice(0, currentIndex))

      if (currentIndex === explanation.length) {
        clearInterval(typingInterval.current!)
        setTypingActive(false)
        setTypingCompleted(true)
      }
    }, 10)
  }, [])

  // Reset typewriter effect
  const resetTypewriterEffect = useCallback(() => {
    if (typingInterval.current) {
      clearInterval(typingInterval.current)
    }
    setRevealedText('')
    setTypingActive(false)
    setTypingCompleted(false)
  }, [])

  // Handle click event for the tile
  const handleClick = useCallback(
    (index: number) => {
      if (typingActive) {
        resetTypewriterEffect()
      } else if (!typingCompleted) {
        startTypewriterEffect(apods[index].explanation)
      } else {
        resetTypewriterEffect()
      }
    },
    [
      typingActive,
      typingCompleted,
      apods,
      resetTypewriterEffect,
      startTypewriterEffect,
    ]
  )

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tileRef.current && !tileRef.current.contains(event.target as Node)) {
        resetTypewriterEffect()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [resetTypewriterEffect])

  // Set the last date based on initial APODs
  useEffect(() => {
    if (initialApods.length > 0) {
      setLastDate(initialApods[initialApods.length - 1].date)
    }
  }, [initialApods])

  // Function to load more APODs
const loadMoreApods = useCallback(() => {
  if (loadingMore || !lastDate || fetcher.state !== 'idle') return;

  // Calculate one day before the current lastDate
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() - 1);
  const nextDateFormatted = formatDate(nextDate);

  // Log the nextDate we're about to fetch
  console.log(`Fetching new APODs starting from: ${nextDateFormatted}`);
  
  fetcher.load(`/apod-loader?lastDate=${nextDateFormatted}`);
  setLoadingMore(true); // Prevent multiple requests while loading
}, [loadingMore, lastDate, fetcher]);


  // When activeIndex reaches 2 (scrolling past the second APOD), load more APODs
  useEffect(() => {
    if (activeIndex === 2 && !loadingMore && fetcher.state === 'idle') {
      loadMoreApods() // Fetch the next set of APODs when the user scrolls past the second one
    }
  }, [activeIndex, loadingMore, fetcher.state, loadMoreApods])

  // Append new APODs when they are fetched
  useEffect(() => {
    if (fetcher.data && fetcher.data.apods) {
      const newApods = fetcher.data.apods
      setApods((prev) => [...prev, ...newApods]) // Add new APODs to the existing state
      setLastDate(newApods[newApods.length - 1].date) // Update the lastDate with the latest APOD date
      setLoadingMore(false) // Reset the loading state
    }
  }, [fetcher.data])

  const updateTimeline = useCallback((delta: number) => {
    setTimeline(prev => {
      const newTimeline = prev + delta * 0.5;
      const currentBaseScroll = activeIndex * 1000;

      if (newTimeline > currentBaseScroll + 1000) {
        setActiveIndex(prev => (prev + 1) % apods.length);
        return (activeIndex + 1) * 1000;
      }

      return newTimeline;
    });
  }, [activeIndex, apods.length]);

  // Handle mouse wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaMode === 1 
      ? e.deltaY * 20  // Line mode
      : e.deltaY;      // Pixel mode
    
    updateTimeline(delta);
  }, [updateTimeline]);

  // Handle touch scroll
  const lastTouchY = useRef<number | null>(null);

  const handleTouch = useCallback((e: TouchEvent) => {
    const currentY = e.touches[0].clientY;
    
    if (lastTouchY.current !== null) {
      const delta = lastTouchY.current - currentY;
      updateTimeline(delta);
    }
    
    lastTouchY.current = currentY;
  }, [updateTimeline]);

  const handleTouchEnd = useCallback(() => {
    lastTouchY.current = null;
  }, []);

  // Add both event listeners
  useEffect(() => {
    const options = { passive: false };
    window.addEventListener('wheel', handleWheel, options);
    window.addEventListener('touchmove', handleTouch, options);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('wheel', handleWheel, options);
      window.removeEventListener('touchmove', handleTouch, options);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleTouch, handleTouchEnd]);

  // Memoize the transformation styles for performance
  const getTransformStyle = useCallback(
    (index: number) => {
      const baseScroll = index * 1000
      const progress = (timeline - baseScroll) / 500
      const scale = progress >= 0.5 ? 1.3 : Math.min(1.3, progress + 0.5)
      const fadeOutStart = 0.8
      const opacity =
        progress >= fadeOutStart
          ? Math.max(1 - (progress - fadeOutStart), 0)
          : 1

      const flyOffDistance = 500
      const smoothFlyOff = Math.min(
        flyOffDistance * (progress - fadeOutStart),
        flyOffDistance
      )
      const direction = index % 2 === 0 ? 1 : -1 // Even index flies right, odd index flies left

      const translateX = progress >= fadeOutStart ? smoothFlyOff * direction : 0 // Apply alternating direction
      const translateY = progress >= fadeOutStart ? 50 : 0

      return {
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        opacity: opacity,
        transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
      }
    },
    [timeline]
  )

  // Memoize activeApod to avoid unnecessary re-renders
  const activeApod = useMemo(() => apods[activeIndex], [apods, activeIndex])

  // Guard against an empty APOD array
  if (!apods || apods.length === 0) {
    return <div>No APOD data available.</div>
  }

  return (
    <div className="scroll-container">
      <div className="wrapper">
        <div className="content">
          <div
            key={activeIndex}
            className={`apod apod-${activeIndex}`}
            style={getTransformStyle(activeIndex)}
            onClick={() => handleClick(activeIndex)}
            tabIndex={0} // Make the element tabbable
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick(activeIndex)
              }
            }}
            ref={tileRef}
            role="button"
          >
            <div className="flex flex-row justify-between items-end mb-2">
              <h2 className="text-2xl font-dosis font-bold text-white">
                {activeApod.title}
              </h2>
              <p>{activeApod.date}</p>
            </div>
            <ApodImage title={activeApod.title} url={activeApod.url} />
            {revealedText && (
              <div className="description">
                <p className="font-dosis typing-effect text-left">
                  {revealedText}
                </p>
              </div>
            )}
          </div>
        </div>
        {loadingMore && <div className="fixed top-[90vh] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">Loading more APODs...</div>}{' '}
      </div>
    </div>
  )
}

export default React.memo(ApodTile)
