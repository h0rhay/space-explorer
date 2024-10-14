import React, { useState, useRef, useCallback, useEffect } from 'react'

interface TypeEffectProps {
  text: string
  isActive: boolean // <-- This prop will control whether the effect is active or not
}

const TypeEffect: React.FC<TypeEffectProps> = ({ text, isActive }) => {
  const [revealedText, setRevealedText] = useState<string>('') // Local state for revealed text
  const typingInterval = useRef<NodeJS.Timeout | null>(null) // Ref for the typing interval
  const [typingActive, setTypingActive] = useState<boolean>(false) // State to track if typing is currently active

  // Start typewriter effect
  const startTypewriterEffect = useCallback(() => {
    let currentIndex = 0
    if (typingInterval.current) {
      clearInterval(typingInterval.current)
    }

    setRevealedText('') // Reset revealed text
    setTypingActive(true) // Mark typing as active

    typingInterval.current = setInterval(() => {
      currentIndex++
      setRevealedText(text.slice(0, currentIndex)) // Reveal characters one by one

      if (currentIndex === text.length) {
        clearInterval(typingInterval.current!)
        setTypingActive(false) // Mark typing as complete
      }
    }, 10)
  }, [text])

  // Stop typewriter effect
  const stopTypewriterEffect = useCallback(() => {
    if (typingInterval.current) {
      clearInterval(typingInterval.current)
    }
    setTypingActive(false)
    setRevealedText('') // Reset the revealed text when stopped
  }, [])

  // Cleanup on unmount or when effect changes
  useEffect(() => {
    return () => {
      if (typingInterval.current) {
        clearInterval(typingInterval.current)
      }
    }
  }, [])

  // Trigger the typewriter effect when isActive is true
  useEffect(() => {
    if (isActive) {
      startTypewriterEffect()
    } else {
      stopTypewriterEffect() // Stop the effect and reset the text when inactive
    }
  }, [isActive, startTypewriterEffect, stopTypewriterEffect])

  return (
    <div className="description">
      <p className="font-dosis typing-effect text-left">
        {revealedText}
      </p>
    </div>
  )
}

export default TypeEffect
