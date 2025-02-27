import { useState, useEffect } from "react";
import { Position } from '../types';

export function useMouseTracking() {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX: number | undefined;
      let clientY: number | undefined;

      if ("clientX" in e) {
        // MouseEvent
        clientX = e.clientX;
        clientY = e.clientY;
      } else if ("touches" in e && e.touches.length > 0) {
        // TouchEvent
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault(); // Prevent scroll interference
      }

      if (clientX !== undefined && clientY !== undefined) {
        setMousePosition(() => ({ x: clientX!, y: clientY! }));
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return { mousePosition };
}
