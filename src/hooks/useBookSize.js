import { useEffect, useState } from "react";

const HEADER_HEIGHT = 60

export function useBookSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1470,
    height: typeof window !== 'undefined' ? window.innerHeight - HEADER_HEIGHT : 956,
  }));

  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight - HEADER_HEIGHT });
    }

    updateSize();

    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}
