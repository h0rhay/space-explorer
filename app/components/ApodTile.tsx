import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLoaderData } from '@remix-run/react'
import ApodImage from './ApodImage'

interface ApodTileProps {
  apods: ApodData[]
}

interface ApodData {
  title: string
  date: string
  url: string
  explanation: string
}

interface LoaderData {
  apods: ApodData[]
}

const ApodTile: React.FC<ApodTileProps> = () => {
  const { apods } = useLoaderData<LoaderData>()
  const [activeIndex, setActiveIndex] = useState<number>(0) // Track active APOD
  const [revealedText, setRevealedText] = useState<string>('') // Track text for typewriter effect
  const [typingActive, setTypingActive] = useState<boolean>(false) // Track if typing is active
  const [typingCompleted, setTypingCompleted] = useState<boolean>(false) // Track if typing has fully completed
  const typingInterval = useRef<NodeJS.Timeout | null>(null) // Ref to store typing interval
  const tileRef = useRef<HTMLDivElement | null>(null) // Ref for tile DOM element
  const [timeline, setTimeline] = useState(0) // Track scroll timeline

  // Start typewriter effect
  const startTypewriterEffect = useCallback((explanation: string) => {
    let currentIndex = 0

    // Clear any existing interval
    if (typingInterval.current) {
      clearInterval(typingInterval.current)
    }

    setRevealedText('') // Reset the revealed text
    setTypingActive(true) // Mark typing as active
    setTypingCompleted(false) // Reset typing completion state

    typingInterval.current = setInterval(() => {
      currentIndex++
      setRevealedText(explanation.slice(0, currentIndex)) // Update revealed text

      if (currentIndex === explanation.length) {
        clearInterval(typingInterval.current!) // Clear interval when done
        setTypingActive(false) // Typing is done
        setTypingCompleted(true) // Mark typing as completed
      }
    }, 10) // Typing speed
  }, [])

  // Reset typewriter effect
  const resetTypewriterEffect = useCallback(() => {
    if (typingInterval.current) {
      clearInterval(typingInterval.current) // Clear any ongoing interval
    }
    setRevealedText('') // Clear revealed text
    setTypingActive(false) // Reset typing state
    setTypingCompleted(false) // Reset typing completion state
  }, [])

  // Handle click event for the tile
  const handleClick = useCallback(
    (index: number) => {
      if (typingActive) {
        resetTypewriterEffect() // If typing is active, reset
      } else if (!typingCompleted) {
        startTypewriterEffect(apods[index].explanation) // If typing is not completed, start typing
      } else {
        resetTypewriterEffect() // If typing completed, reset
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
        resetTypewriterEffect() // Reset typing if clicked outside
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [resetTypewriterEffect])

  // Handle scroll effect directly, updating the timeline and transformations in real-time
  const handleScroll = useCallback(
    (e: WheelEvent) => {
      setTimeline((prev) => {
        const newTimeline = prev + e.deltaY * 0.5
        const currentBaseScroll = activeIndex * 1000

        if (newTimeline > currentBaseScroll + 1000) {
          setActiveIndex((prevIndex) => {
            const newIndex = (prevIndex + 1) % apods.length
            return newIndex
          })
          return (activeIndex + 1) * 1000
        }

        return newTimeline
      })
    },
    [activeIndex, apods.length]
  )

  useEffect(() => {
    window.addEventListener('wheel', handleScroll)
    return () => window.removeEventListener('wheel', handleScroll)
  }, [handleScroll])

  // Memoize transformation styles for better performance
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
      const translateX = progress >= fadeOutStart ? smoothFlyOff * 1 : 0
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

  // Guard against empty apods array
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
      </div>
    </div>
  )
}

export default React.memo(ApodTile)
