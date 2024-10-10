

// import React, { useState, useEffect, useRef, useCallback } from 'react'
// import { useLoaderData } from '@remix-run/react'
// import ApodImage from './ApodImage'

// interface ApodTileProps {
//   apods: ApodData[]
// }

// interface ApodData {
//   title: string
//   url: string
//   explanation: string
// }

// interface LoaderData {
//   apods: ApodData[]
// }

// const ApodTile: React.FC<ApodTileProps> = () => {
//   const { apods } = useLoaderData<LoaderData>()
//   const [activeIndex, setActiveIndex] = useState<number>(0) // Track active APOD
//   const [revealedText, setRevealedText] = useState<string>('') // Track text for typewriter effect
//   const [flyOffDirection, setFlyOffDirection] = useState<number>(1) // Track the direction of fly-off, starting with right
//   const [verticalMoveDirection, setVerticalMoveDirection] = useState<number>(1) // Track up or down movement
//   const tileRef = useRef<HTMLDivElement | null>(null) // Ref for tile DOM element
//   const [timeline, setTimeline] = useState(0) // Track scroll timeline
//   const requestRef = useRef<number | null>(null) // Track animation frame requests

//   // Start typewriter effect (memoized)
//   const startTypewriterEffect = useCallback((index: number) => {
//     const explanation = apods[index].explanation
//     let currentIndex = 0

//     setRevealedText('') // Reset text

//     const typingInterval = setInterval(() => {
//       currentIndex++
//       setRevealedText(explanation.slice(0, currentIndex))
//       if (currentIndex === explanation.length) {
//         clearInterval(typingInterval) // Clear the interval when typing is done
//       }
//     }, 10)
//   }, [apods])

//   // Handle the click event with ability to complete typing effect on click
//   const handleClick = useCallback((index: number) => {
//     startTypewriterEffect(index) // Trigger typing effect on click
//   }, [startTypewriterEffect])

//   // Restore scroll timeline behavior with gradual fly-out and slower APOD change
//   const handleScroll = useCallback((e: WheelEvent) => {
//     setTimeline((prev) => {
//       const newTimeline = prev + e.deltaY * 0.1 // Slowed down the scroll speed
//       const currentBaseScroll = activeIndex * 1000

//       // Once the APOD fades out (progress exceeds 1), move to next APOD
//       if (newTimeline > currentBaseScroll + 1000) {
//         setActiveIndex((prevIndex) => {
//           const newIndex = (prevIndex + 1) % apods.length
//           setFlyOffDirection(newIndex % 2 === 0 ? 1 : -1) // Alternate direction for new APOD
//           setVerticalMoveDirection(Math.random() > 0.5 ? 1 : -1) // Randomly move up or down
//           return newIndex
//         })
//         return (activeIndex + 1) * 1000 // Reset timeline for new APOD
//       }

//       return newTimeline
//     })
//   }, [activeIndex, apods.length])

//   // Cleanup animation frame requests on unmount
//   useEffect(() => {
//     return () => {
//       if (requestRef.current) {
//         cancelAnimationFrame(requestRef.current)
//       }
//     }
//   }, [])

//   // Add event listener for smooth scroll
//   useEffect(() => {
//     window.addEventListener('wheel', handleScroll)
//     return () => window.removeEventListener('wheel', handleScroll)
//   }, [handleScroll])

//   // CSS transitions for smooth animations and opacity control
//   const getTransformStyle = (index: number) => {
//     const baseScroll = index * 1000
//     const progress = (timeline - baseScroll) / 500

//     // Scaling stops growing after opacity drops below 0.5
//     let scale = progress >= 0.5 ? 1.3 : Math.min(1.3, progress + 0.5)
//     const fadeOutStart = 0.8
//     const opacity = progress >= fadeOutStart ? Math.max(1 - (progress - fadeOutStart), 0) : 1

//     if (opacity <= 0.5) {
//       scale = 1.3 // Stop growing when opacity is less than 0.5
//     }

//     // Slow down fly-off effect as the tile fades out
//     const flyOffDistance = 500 // Reduce fly-off speed by reducing the distance
//     const smoothFlyOff = Math.min(flyOffDistance * (progress - fadeOutStart), flyOffDistance)
//     const translateX = progress >= fadeOutStart ? smoothFlyOff * flyOffDirection : 0
//     const translateY = progress >= fadeOutStart ? verticalMoveDirection * 50 : 0

//     return {
//       transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
//       opacity: opacity,
//       transition: 'transform 0.6s ease-in-out, opacity 0.6s ease-out', // Smooth transition
//     }
//   }

//   const activeApod = apods[activeIndex]

//   // Guard against empty apods array
//   if (!apods || apods.length === 0) {
//     return <div>No APOD data available.</div>
//   }

//   return (
//     <div className="scroll-container">
//       <div className="wrapper">
//         <div className="content">
//           <div
//             key={activeIndex}
//             className={`apod apod-${activeIndex}`}
//             style={getTransformStyle(activeIndex)}
//             onClick={() => handleClick(activeIndex)}
//             tabIndex={0}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' || e.key === ' ') {
//                 handleClick(activeIndex)
//               }
//             }}
//             ref={tileRef} // Apply ref to the tile
//             role="button"
//           >
//             <h2 className="text-2xl mb-2 font-dosis font-bold text-white">
//               {activeApod.title}
//             </h2>
//             <ApodImage title={activeApod.title} url={activeApod.url} />
//             {revealedText && (
//               <div className="description">
//                 <p className="font-dosis typing-effect text-left">
//                   {revealedText}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default React.memo(ApodTile)


import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLoaderData } from '@remix-run/react'
import ApodImage from './ApodImage'

interface ApodTileProps {
  apods: ApodData[]
}

interface ApodData {
  title: string
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
  const [flyOffDirection, setFlyOffDirection] = useState<number>(1) // Track the direction of fly-off, starting with right
  const [verticalMoveDirection, setVerticalMoveDirection] = useState<number>(1) // Track up or down movement
  const tileRef = useRef<HTMLDivElement | null>(null) // Ref for tile DOM element
  const [timeline, setTimeline] = useState(0) // Track scroll timeline

  // Start typewriter effect (memoized)
  const startTypewriterEffect = useCallback((index: number) => {
    const explanation = apods[index].explanation
    let currentIndex = 0

    setRevealedText('') // Reset text

    const typingInterval = setInterval(() => {
      currentIndex++
      setRevealedText(explanation.slice(0, currentIndex))
      if (currentIndex === explanation.length) {
        clearInterval(typingInterval) // Clear the interval when typing is done
      }
    }, 10)
  }, [apods])

  // Handle the click event with ability to complete typing effect on click
  const handleClick = useCallback((index: number) => {
    startTypewriterEffect(index) // Trigger typing effect on click
  }, [startTypewriterEffect])

  // Handle scroll effect directly, updating the timeline and transformations in real-time
  const handleScroll = useCallback((e: WheelEvent) => {
    setTimeline((prev) => {
      const newTimeline = prev + e.deltaY * 0.5 // Make scroll feedback faster and smoother
      const currentBaseScroll = activeIndex * 1000

      // Once the APOD fades out (progress exceeds 1), move to next APOD
      if (newTimeline > currentBaseScroll + 1000) {
        setActiveIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % apods.length
          setFlyOffDirection(newIndex % 2 === 0 ? 1 : -1) // Alternate direction for new APOD
          setVerticalMoveDirection(Math.random() > 0.5 ? 1 : -1) // Randomly move up or down
          return newIndex
        })
        return (activeIndex + 1) * 1000 // Reset timeline for new APOD
      }

      return newTimeline
    })
  }, [activeIndex, apods.length])

  // Add event listener for smooth scroll
  useEffect(() => {
    window.addEventListener('wheel', handleScroll)
    return () => window.removeEventListener('wheel', handleScroll)
  }, [handleScroll])

  // Calculate the style directly based on the real-time scroll timeline
  const getTransformStyle = (index: number) => {
    const baseScroll = index * 1000
    const progress = (timeline - baseScroll) / 500

    // Scale stops growing after opacity drops below 0.5
    let scale = progress >= 0.5 ? 1.3 : Math.min(1.3, progress + 0.5)
    const fadeOutStart = 0.8
    const opacity = progress >= fadeOutStart ? Math.max(1 - (progress - fadeOutStart), 0) : 1

    if (opacity <= 0.5) {
      scale = 1.3 // Stop growing when opacity is less than 0.5
    }

    // Fly-off effect as the tile fades out
    const flyOffDistance = 500 // Reduced fly-off speed by reducing the distance
    const smoothFlyOff = Math.min(flyOffDistance * (progress - fadeOutStart), flyOffDistance)
    const translateX = progress >= fadeOutStart ? smoothFlyOff * flyOffDirection : 0
    const translateY = progress >= fadeOutStart ? verticalMoveDirection * 50 : 0

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      opacity: opacity,
      transition: 'transform 0.1s ease-out, opacity 0.1s ease-out', // Fast and responsive feedback
    }
  }

  const activeApod = apods[activeIndex]

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
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick(activeIndex)
              }
            }}
            ref={tileRef} // Apply ref to the tile
            role="button"
          >
            <h2 className="text-2xl mb-2 font-dosis font-bold text-white">
              {activeApod.title}
            </h2>
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
