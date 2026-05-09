import { useEffect, useState } from "react";

export function useBookSize() {
  const [size, setSize] = useState({
    width: 1470,
    height: 956,
  });

  useEffect(() => {
    function updateSize() {
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // MOBILE
        const width = window.innerWidth ;
        const height = window.innerHeight ;

        setSize({ width, height });
      } else {
        console.log("inner height", window.innerHeight);
        console.log("inner width", window.innerWidth);
        // DESKTOP
        const width = window.innerWidth;
        const height = window.innerHeight;


        setSize({ width, height });
      }
    }

    updateSize();

    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}