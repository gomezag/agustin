import React, { useEffect, useRef, useState } from 'react';
import styles from './BarComponent.module.css';
import BlogPost from '../components/BlogPost';
import { blogPosts } from '../data/blogPosts';

interface BarProps {
  name: string;
  width: string;
  color: string;
  introduration: string;
  isFocused: boolean;
  isOut: boolean;
  onClick: () => void;
}

const BarComponent: React.FC<BarProps> = ({ name, width, color, introduration, isFocused, isOut, onClick }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const wasFocusedRef = useRef(false); 
  const filteredPosts = blogPosts.filter((post) => post.tags.includes(name));
  
  useEffect(() => {
    if (barRef.current) {
        
      const bar = barRef.current;
      const parent = bar.parentElement; // Get parent element
      if(parent){
      const parentRect = parent.getBoundingClientRect(); // Get parent's bounding box
      const barRect = bar.getBoundingClientRect(); // Get bar's bounding box
      
      const relativeTop = barRect.top - parentRect.top; // Position relative to parent
      bar.style.setProperty('--yposition', `-${relativeTop}px`);
      }
      bar.style.setProperty('--iniwidth', width);
      bar.style.setProperty('--introduration', introduration);
      bar.style.setProperty('background-color', color);
      
    }
    

    // Add the intro class for first load, then remove it
    setTimeout(() => {
      setHasLoaded(true);
    }, parseFloat(introduration) * 1000); // Remove after the intro animation duration
  }, [width, color, introduration]);

  useEffect(() => {
    
    console.log(barRef?.current?.classList, 'focus:', isFocused, 'was:', wasFocusedRef.current, 'out:', isOut);
    
    if(isFocused) {
      wasFocusedRef.current = true;
    } else{
      if(wasFocusedRef){
        wasFocusedRef.current = false;
    }};
  }, [isFocused])

  return (
    <div
      ref={barRef}
      className={`${styles.bar}
                  ${isFocused ? styles.focus : ( 
                    wasFocusedRef.current ? styles.unfocus : (
                      isOut ? styles.inagain :
                        styles.out
                  ))}
                `}
      data-class={`${styles.bar}
                ${isFocused ? styles.focus : ( 
                  wasFocusedRef.current ? styles.unfocus : (
                    isOut ? styles.inagain :
                      styles.out
                ))}
              `}
      data-bar-name={name}
      onClick={onClick}
    >
      {isFocused ? 
      <div >
      <div className="" style={{'height': '80px'}}>
      </div>
      <div>
                {filteredPosts.map((post) => (
                  <BlogPost key={post.id} {...post} />
                ))}
      </div>
      </div>
      : <></>}
    </div>
  );
};

export default BarComponent;
