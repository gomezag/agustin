import React from "react";
import "./GravitySlider.css";

interface GravitySliderProps {
  G: number;
  setG: (value: number) => void;
}

export const GravitySlider: React.FC<GravitySliderProps> = ({ G, setG }) => {


  return (
    <div className="gravity-slider">
      <label className="slider-label">Gravity (G): {G}</label>
      <div className="slider-container">
        <div className="slider-wrapper">
          <input
            type="range"
            min="50"
            max="700"
            step="10"
            value={G}
            onChange={(e) => setG(Number(e.target.value))}
            className="slider-input"
          />
        </div>
      </div>
    </div>
  );
};

export default GravitySlider;
