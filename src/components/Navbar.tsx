import { Github, Linkedin, Mail, Moon, Sun } from "lucide-react";
import { ReactNode } from "react";
import { useDarkMode } from "./DarkModeContext";

interface NavbarProps {
  children?: ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  return (
    <header className={`container mx-auto px-4 py-20 ${isDarkMode ? "text-white" : "text-black"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4">
          <a href="https://github.com/gomezag" className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
            <Github size={35} />
          </a>
          <a href="https://www.linkedin.com/in/agustin-gomez-mansilla/" className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
            <Linkedin size={35} />
          </a>
          <a href="mailto:agustin.gomez.mansilla@gmail.com" className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
            <Mail size={35} />
          </a>
          <div className="ml-auto flex items-center gap-4" id="right-buttons">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {isDarkMode ? <Moon size={45} /> : <Sun size={45} />}
            </button>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
