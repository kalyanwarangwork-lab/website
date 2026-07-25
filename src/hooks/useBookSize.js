import { useEffect, useState } from "react";

const HEADER_HEIGHT = 60

function getSize() {
  if (typeof window === 'undefined') return { width: 1470, height: 896 }
  return {
    width: window.innerWidth,
    height: window.innerHeight - HEADER_HEIGHT,
  }
}

export function useBookSize() {
  const [size, setSize] = useState(getSize)

  useEffect(() => {
    function updateSize() {
      setSize(getSize())
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return size
}
