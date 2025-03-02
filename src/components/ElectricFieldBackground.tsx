import React, { useRef, useEffect } from "react";
import { getCoulombForce } from "../utils/physics";

interface ElectricFieldBackgroundProps {
  bubblePositions: Record<number, { x: number; y: number; charge: number }>;
  width: number;
  height: number;
  k: number;
}

export const ElectricFieldBackground: React.FC<ElectricFieldBackgroundProps> = ({ bubblePositions, width, height, k }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resolution = 40; // Higher = finer grid, Lower = better performance

    // Function to compute field at a given point
    const computeFieldIntensity = (x: number, y: number) => {
      let Ex = 0, Ey = 0;

      for (const key in bubblePositions) {
        const { x: qx, y: qy, charge: charge } = bubblePositions[key];

        const dx = x - qx;
        const dy = y - qy;
        const r2 = dx * dx + dy * dy;

        if (r2 < 1) continue; // Avoid singularities

        const d = {
            m: r2,
            a: Math.atan2(dy,dx)
        }
        const force = getCoulombForce(k, d, charge, 1); // Calculate field strength

        Ex += Math.cos(force.a)*force.m;
        Ey += Math.sin(force.a)*force.m;
      }

      return {
        m: Ex*Ex+Ey*Ey,
        a: Math.atan2(Ey,Ex)
      }; // Total field magnitude
    };

    // Create an off-screen buffer for smoother interpolation
    const bufferCanvas = document.createElement("canvas");
    const bufferCtx = bufferCanvas.getContext("2d");
    bufferCanvas.width = width / resolution;
    bufferCanvas.height = height / resolution;

    if (!bufferCtx) return;

    const imageData = bufferCtx.createImageData(bufferCanvas.width, bufferCanvas.height);
    const data = imageData.data;

    for (let x = 0; x < bufferCanvas.width; x++) {
        for (let y = 0; y < bufferCanvas.height; y++) {
          const fieldStrength = computeFieldIntensity(x * resolution, y * resolution).m; // Get electric field strength
      
          // Normalize intensity using logarithm for smooth color transitions
          const intensity = Math.min(1, Math.log(1 + fieldStrength) / 5); // Scale down to prevent oversaturation
      
          // Neon gradient mapping (pink for positive fields, yellow for negative)
          const rColor = Math.min(255, 255 * intensity); // Red channel scales with intensity
          const gColor = Math.min(255, 180 * intensity); // Green mix (avoiding pure white)
          const bColor = Math.min(255, 50 * (1 - intensity)); // Blue component fades out
      
          const index = (y * bufferCanvas.width + x) * 4;
          data[index] = rColor; // Red
          data[index + 1] = gColor; // Green
          data[index + 2] = bColor; // Blue
          data[index + 3] = 255; // Full opacity
        }
      }

    // Draw the computed field onto the buffer
    bufferCtx.putImageData(imageData, 0, 0);

    // Upscale and apply a blur to remove the grid-like effect
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(bufferCanvas, 0, 0, width, height);
    ctx.filter = "blur(12px)"; // Smooth out any remaining artifacts

  }, [bubblePositions, width, height, k]);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-5 w-full h-full" />
  );
};

export default ElectricFieldBackground;