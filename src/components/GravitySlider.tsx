import React from "react";
import { Sliders } from "lucide-react";

interface GravitySliderProps {
  G: number;
  setG: (value: number) => void;
  title: string;
  min: number;
  max: number;
  step: number;
}

export const GravitySlider: React.FC<GravitySliderProps> = ({ G, setG, title, min, max, step }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setG(Number(e.target.value));
  };

  const handleTouch = (e: React.TouchEvent<HTMLInputElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    setG(Number(e.currentTarget.value));
  };

  return (
    <div className="flex flex-col items-center w-full">
      <label className="slider-label text-black font-semibold mb-2">{title} {G}</label>
      <div className="slider-container w-full flex items-center gap-2">
        <Sliders className="text-gray-500" size={20} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={G}
          onChange={handleChange}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          className="slider-input w-full accent-pink-500 cursor-pointer touch-auto"
        />
      </div>
    </div>
  );
};

export default GravitySlider;
