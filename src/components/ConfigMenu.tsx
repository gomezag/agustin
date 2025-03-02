import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { GravitySlider } from "./GravitySlider";
import { motion, AnimatePresence } from "framer-motion";

interface ConfigProps {
  G: number; setG: (value: number) => void; 
  k: number; setK: (value: number) => void;
  c: number; setC: (value: number) => void;
  R: number; setR: (value: number) => void;
  size: number; isDarkMode: boolean
}

export function ConfigMenu({ G, setG, k, setK, c, setC, R, setR, size, isDarkMode }: ConfigProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleReleased = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if(isOpen){
          setIsOpen(false);
        }
      }
    };
  
    window.addEventListener("keydown", handleReleased);
  
    return () => {
      window.removeEventListener("keydown", handleReleased);
    };
  }, [isOpen]);

  return (
    <div className="relative z-50">
      {/* Gear Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onTouchStart={() => setIsOpen(!isOpen)}
        className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}
      >
        <Settings size={size} />
      </button>

      {/* Popup Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative text-4xl bg-white backdrop-blur-md opacity-80 w-[90%] max-w-[500px] p-6 rounded-lg shadow-lg flex flex-col"
            >
              <button
                onClick={() => setIsOpen(false)}
                onTouchStart={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
              <h3 className="text-black mb-10 font-semibold">Settings</h3>
              <GravitySlider title="G:" G={G} setG={setG} min={0} max={300} step={5} />
              <GravitySlider title="K:" G={k} setG={setK} min={0} max={400} step={5} />
              <GravitySlider title="c:" G={c} setG={setC} min={0} max={400} step={5} />
              <GravitySlider title="R:" G={R} setG={setR} min={0} max={400} step={5} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}