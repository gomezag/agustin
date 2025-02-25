import { useState, useEffect, useRef } from "react";
import { getForce, nuclearForce } from "../utils/physics";
import { BlogPost, Position, BubblePositions } from "../types";

interface DraggedBubble {
    id: number
    offsetX: number
    offsetY: number
}

export function useBubblePositions(
    POSTS: BlogPost[], 
    isAnimating: boolean,
    G: number, 
    mousePosition: Position,
    ) {
        const [bubblePositions, setBubblePositions] = useState<BubblePositions>({});
        const draggedBubbleRef = useRef<DraggedBubble | null>(null);
        const velocitiesRef = useRef<{ [key: number]: { vx: number; vy: number } }>({});
        const animationFrameRef = useRef<number>(0);
        const prevTimeRef = useRef<number>();

        const MAX_VELOCITY=100;
        const M_ball = 1;
        const M_cursor = 5;
        const energyLoss = 0.9;
        const G_nuclear = 0.0001;

        function setDraggedBubble(bubble: DraggedBubble | null) {
            draggedBubbleRef.current = bubble;
            const draggedBubble = draggedBubbleRef.current;
            if (draggedBubble) {
                // Move the dragged bubble to follow the cursor
                setBubblePositions(prev => ({
                ...prev,
                [draggedBubble.id]: {
                    x: mousePosition.x,
                    y: mousePosition.y
                }
                }));
            }
        };
        
        useEffect(() => {
            const handleDrag = (e: MouseEvent | TouchEvent) => {
                let clientX: number | null = null;
                let clientY: number | null = null;
    
                if ("clientX" in e) {
                    clientX = e.clientX;
                    clientY = e.clientY;
                } else if ("touches" in e && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                    e.preventDefault(); // Prevent scroll interference
                }
    
                if (clientX !== null && clientY !== null) {
                    const draggedBubble = draggedBubbleRef.current;
                    if (draggedBubble) {
                        // Move the dragged bubble to follow the cursor
                        setBubblePositions(prev => ({
                            ...prev,
                            [draggedBubble.id]: {
                                x: clientX,
                                y: clientY
                            }
                        }));
                            velocitiesRef.current[draggedBubble.id] = { vx: 0, vy: 0 };
                    }
                }
            };  

            const handleEnd = (e: MouseEvent | TouchEvent ) => {
                setDraggedBubble(null);
            };

            const handleReleased = (e: KeyboardEvent) => {
                const draggedBubble = draggedBubbleRef.current;
                if(e.key==="Escape"){
                    if(draggedBubble) {
                    setDraggedBubble(null);
                    }
                }
            };

            window.addEventListener("keydown", handleReleased);
            window.addEventListener("mousemove", handleDrag);
            window.addEventListener("mouseup", handleEnd);
            window.addEventListener("touchmove", handleDrag);
            window.addEventListener("touchend", handleEnd);
    
            return () => {
                window.removeEventListener("keydown", handleReleased);
                window.removeEventListener("mousemove", handleDrag);
                window.removeEventListener("mouseup", handleEnd);
                window.removeEventListener("touchmove", handleDrag);
                window.removeEventListener("touchend", handleEnd);
            };
        }, []);

        useEffect(() => {
            setBubblePositions(prev => {
                const newPositions = { ...prev };

                return newPositions;
            });
        }, [POSTS]);

        useEffect(() => {

            POSTS.forEach((post) => {
                if (!bubblePositions[post.id]) {
                    bubblePositions[post.id] = {
                        x: Math.random() * (window.innerWidth - 100),
                        y: Math.random() * (window.innerHeight - 100),
                    };
                }

                if (!velocitiesRef.current[post.id]) {
                    velocitiesRef.current[post.id] = {
                        vx: 0,
                        vy: 0,
                    };
                }
            });

            const updateBubblePositions = (timestamp: number) => {

                const newPositions = { ...bubblePositions };

                if (!prevTimeRef.current) prevTimeRef.current = timestamp;
                const deltaTime = timestamp - prevTimeRef.current;
                const timeScale = Math.min(deltaTime / 16.667, 2);

                if(!isAnimating) return;
                
                POSTS.forEach((post1) => {
                let totalForceX = 0;
                let totalForceY = 0;
                const pos1 = newPositions[post1.id];
                const velocity1 = velocitiesRef.current[post1.id];

                if(!pos1 || !velocity1) return;

                const draggedBubble = draggedBubbleRef.current;
                // Handle dragging.
                if (draggedBubble && post1.id === draggedBubble.id){
                    velocity1.vx = (-pos1.x+mousePosition.x)/deltaTime;
                    velocity1.vy = (-pos1.y+mousePosition.y)/deltaTime;
                    pos1.x = mousePosition.x;
                    pos1.y = mousePosition.y;
                    return; 
                }
                const corrPos1 = {
                    x: pos1.x-post1.radius/2,
                    y: pos1.y-post1.radius/2
                        }
                POSTS.forEach((post2) => {
                    //No self interaction
                    if (post1.id === post2.id) return;

                    const pos2 = newPositions[post2.id];
                    const velocity2 = velocitiesRef.current[post2.id];
                    if(!pos2 || !velocity2 ) return;
                    
                    //Calculate pull with other balls
                    const dx = pos2.x - pos1.x;
                    const dy = pos2.y - pos1.y;
                    const distanceSq = dx * dx + dy * dy; 
                    const distance = Math.sqrt(distanceSq);
                    const minDistance = (post1.radius + post2.radius) / 2;
                    
                    //Resolve overlap and bounce
                    if (distance > 0 && distance < minDistance) {
                    const overlap = minDistance - distance;
                    const pushX = (dx/distance) * (overlap / 2);
                    const pushY = (dy/distance) * (overlap / 2);

                    //Move balls out of an overlap
                    pos1.x -= pushX;
                    pos1.y -= pushY;
                    pos2.x += pushX;
                    pos2.y += pushY;
                    // Swap velocities
                    let loss = Math.sqrt(energyLoss);
                    [velocity1.vx, velocity2.vx] = [velocity2.vx*loss, velocity1.vx*loss];
                    [velocity1.vy, velocity2.vy] = [velocity2.vy*loss, velocity1.vy*loss];
                    }
                    const corrPos2 = {
                    x: pos2.x-post2.radius/2,
                    y: pos2.y-post2.radius/2
                    }

                    //const force = getForce(G, corrPos2, corrPos1, M_ball, M_ball);
                    const force = nuclearForce(G_nuclear, corrPos2, corrPos1);
                    totalForceX -= Math.cos(force.a) * force.m;
                    totalForceY -= Math.sin(force.a) * force.m;
                });

                // Apply cursor force
                const cursorForce = getForce(G, mousePosition, newPositions[post1.id], M_cursor, M_ball);
                //const cursorForce = nuclearForce(0.0001, mousePosition, corrPos1);

                totalForceX -= Math.cos(cursorForce.a) * cursorForce.m;
                totalForceY -= Math.sin(cursorForce.a) * cursorForce.m;

                velocity1.vx += totalForceX * timeScale;
                velocity1.vy += totalForceY * timeScale;

                // Check constraints
                const bubbleSize = post1.radius;
                if (pos1.x < bubbleSize) {
                    pos1.x = bubbleSize;
                    velocity1.vx = Math.abs(velocity1.vx) * energyLoss;
                } else if (pos1.x > window.innerWidth - bubbleSize) {
                    pos1.x = window.innerWidth - bubbleSize;
                    velocity1.vx = -Math.abs(velocity1.vx) * energyLoss;
                }
                // Same for Y coord
                //const headerHeight = document.querySelector('header')?.offsetHeight || 100;
                if (pos1.y < bubbleSize) {
                    pos1.y = bubbleSize;
                    velocity1.vy = Math.abs(velocity1.vy) * energyLoss;
                } else if (pos1.y > window.innerHeight - bubbleSize) {
                    pos1.y = window.innerHeight - bubbleSize;
                    velocity1.vy = -Math.abs(velocity1.vy) * energyLoss;
                }

                // Stop things if they going too fast
                if(Math.abs(velocity1.vx) > MAX_VELOCITY) {
                    velocity1.vx=MAX_VELOCITY;
                }
                if(Math.abs(velocity1.vy) > MAX_VELOCITY) {
                velocity1.vy=MAX_VELOCITY;
                }

                newPositions[post1.id] = {
                    x: newPositions[post1.id].x + velocity1.vx* timeScale,
                    y: newPositions[post1.id].y + velocity1.vy* timeScale,
                };
                });


                setBubblePositions(newPositions);
                animationFrameRef.current = requestAnimationFrame(updateBubblePositions);
            };
          
        animationFrameRef.current = requestAnimationFrame(updateBubblePositions);

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
        };
        }, [bubblePositions, isAnimating]);


  return { bubblePositions, setDraggedBubble };
}