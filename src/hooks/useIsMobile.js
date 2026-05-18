import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Set initial state on client mount
    setIsMobile(window.innerWidth < breakpoint)
    setIsHydrated(true)

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  // Return false until hydrated to avoid mismatch
  return isHydrated ? isMobile : false
}
