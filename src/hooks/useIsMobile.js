import { useState, useEffect } from 'react'

function getIsMobile(breakpoint) {
  if (typeof window === 'undefined') {
    return false
  }

  return window.innerWidth < breakpoint
}

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => getIsMobile(breakpoint))

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(getIsMobile(breakpoint))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}
