import { useState, useEffect, useCallback } from 'react'

const SpaceFontHeading = ({ children }: { children: string }) => {
  const [isScrolled, setIsScrolled] = useState(false)

  const handleWheel = useCallback((e: WheelEvent) => {
    const delta = e.deltaMode === 1 
      ? e.deltaY * 20  // Line mode
      : e.deltaY      // Pixel mode
    
    if (delta > 0) {
      setIsScrolled(true)
    }
  }, [])

  const handleTouch = useCallback((e: TouchEvent) => {
    const currentY = e.touches[0].clientY
    const startY = e.touches[0].screenY
    
    if (currentY < startY) {
      setIsScrolled(true)
    }
  }, [])

  useEffect(() => {
    const options: AddEventListenerOptions = { passive: true }
    
    window.addEventListener('wheel', handleWheel, options)
    window.addEventListener('touchmove', handleTouch, options)
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', handleTouch)
    }
  }, [handleWheel, handleTouch])

  return (
    <div className="w-full text-center fixed top-0 left-0 z-50">
      <h1 className="relative text-[clamp(3rem,6vw,8rem)] uppercase font-bold tracking-narrownpm run decoration-violet-50 font-MachineStd">
        <span className="absolute inset-0 text-transparent" style={{ textShadow: '-1px -1px 0 #22d3ee, 1px -1px 0 #22d3ee, -1px 1px 0 #22d3ee, 1px 1px 0 #22d3ee, -1px 0 0 #22d3ee, 1px 0 0 #22d3ee, 0 -1px 0 #22d3ee, 0 1px 0 #22d3ee' }}>
          {children}
        </span>
        <span className="relative" style={{ backgroundImage: 'linear-gradient(180deg, #ef4444, #f97316, #fde047)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', display: 'inline-block' }}>
          {children}
        </span>
      </h1>
      <div className={isScrolled ? "animated" : ""}>
        <p>A simple app that uses a NASA API to fetch and display images from the Astronomy Picture of the Day.</p>
        <p>You can scroll down, travel through time, and explore the universe.</p>
      </div>
    </div>
  )
}

export default SpaceFontHeading
