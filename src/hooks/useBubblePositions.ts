import { useState, useEffect, useRef } from "react";
import { gravForce, nuclearForce, getCoulombForce, getVanDerWaalsForce, 
         checkWalls, bounce, clipVelocity, 
         mBall, mCursor, cBall} from "../utils/physics";
import { BlogPost, Position, BubblePositions, Vector } from "../types";


const MAX_FPS = 60; // Set the desired frame rate
const FRAME_TIME = 1000 / MAX_FPS; // Convert FPS to frame duration (ms)

interface DraggedBubble {
    id: number
    offsetX: number
    offsetY: number
}

export function useBubblePositions(
    POSTS: BlogPost[], 
    isAnimating: boolean,
    G: number,
    kCoulomb: number,
    cNuclear: number,
    rNuclear: number
    ) {
        const [bubblePositions, setBubblePositions] = useState<BubblePositions>({});
        const [draggedBubble, setDraggedBubble] = useState<DraggedBubble | null>(null);
        const [lastTouchPosition, setLastTouchPosition] = useState<Position | null>(null);
        const isDraggingRef = useRef(false);
        const velocitiesRef = useRef<{ [key: number]: { vx: number; vy: number } }>({});
        const animationFrameRef = useRef<number>(0);
        const dragFrameRef = useRef<number>(0);
        const dragTimeRef = useRef<number>(0);
        const prevTimeRef = useRef<number>();

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
                    setLastTouchPosition({ x: clientX, y: clientY }); // Store touch position
                }
            };
            const handleEnd = () => {
                isDraggingRef.current = false; // Stop touch loop
                setDraggedBubble(null);
            };

            const handleReleased = (e: KeyboardEvent) => {
                if(e.key==="Escape"){
                    if(draggedBubble) {
                    setDraggedBubble(null);
                    isDraggingRef.current = false;
                    }
                }
            };

            // Initialize positions and velocities if not created.
            POSTS.forEach((post) => {
                if (!bubblePositions[post.id]) {
                    bubblePositions[post.id] = {
                        x: Math.random() * (window.innerWidth-10),
                        y: Math.random() * (window.innerHeight-10),
                        charge: post.charge
                    };
                }

                if (!velocitiesRef.current[post.id]) {
                    const initVelocity = 20;
                    velocitiesRef.current[post.id] = {
                        vx: (Math.random()-0.5)*initVelocity,
                        vy: (Math.random()-0.5)*initVelocity,
                    };
                }
            });

            window.addEventListener("keydown", handleReleased);
            window.addEventListener("mousemove", handleDrag);
            window.addEventListener("mouseup", handleEnd);
            window.addEventListener("touchstart", handleDrag);
            window.addEventListener("touchmove", handleDrag);
            window.addEventListener("touchend", handleEnd);
    
            return () => {
                window.removeEventListener("keydown", handleReleased);
                window.removeEventListener("mousemove", handleDrag);
                window.removeEventListener("mouseup", handleEnd);
                window.removeEventListener("touchmove", handleDrag);
                window.removeEventListener("touchend", handleEnd);
                window.removeEventListener("touchstart", handleDrag);
            };
        }, []);

        useEffect(() => {
            setBubblePositions(prev => {
                const newPositions = { ...prev };

                return newPositions;
            });
        }, [POSTS]);

        useEffect(() => {
            const updateBubblePositions = (timestamp: number) => {
                const newPositions = { ...bubblePositions };

                if (!prevTimeRef.current) prevTimeRef.current = timestamp;
                const deltaTime = timestamp - prevTimeRef.current;
                const timeScale = Math.min(deltaTime / 16.667, 2);
                if(deltaTime > FRAME_TIME){
                    if(!isAnimating) return;
                    let distances:(Vector | null)[][] = Array.from({ length: POSTS.length }, 
                        () => Array(POSTS.length).fill(null)
                    );
                    POSTS.forEach((post1: BlogPost) => {
                        let totalForceX = 0;
                        let totalForceY = 0;
                        const curPos1 = newPositions[post1.id];
                        let pos1 = curPos1;
                        const curVel1 = velocitiesRef.current[post1.id];
                        let velocity1 = curVel1
                        if(!pos1 || !velocity1) return;
                        // Handle dragging.
                        if (draggedBubble && post1.id === draggedBubble.id){
                            return; 
                        }

                        POSTS.forEach((post2) => {
                            //No self interaction
                            if (post1.id === post2.id) return;
                            const curPos2 = newPositions[post2.id];
                            let pos2 = curPos2;
                            const curVel2 = velocitiesRef.current[post2.id];
                            let velocity2 = curVel2;
                            if(!pos2 || !velocity2 ) return;
                            
                        
                            const dx = pos2.x - pos1.x;
                            const dy = pos2.y - pos1.y;
                            const distanceSq = dx * dx + dy * dy;
                            const angleRadians = Math.atan2(dy,dx);
                            distances[post1.id][post2.id] = {
                                m: distanceSq,
                                a: angleRadians
                            }
                            const distance = Math.sqrt(distances[post1.id][post2.id]!.m);
                            const angle = distances[post1.id][post2.id]!.a;

                            //Resolve overlap and bounce. Don't interact if overlapping.
                            const minDistance = (post1.radius + post2.radius) / 2;
                            if (distance > 0 && distance < minDistance) {
                                const overlap = minDistance - distance;
                                bounce(pos1, pos2, velocity1, velocity2, overlap, angle);
                                newPositions[post1.id] = pos1;
                                newPositions[post2.id] = pos2;
                                velocitiesRef.current[post1.id] = velocity1;
                                velocitiesRef.current[post2.id] = velocity2;
                                return
                            }
                            
                            let force: Vector = {m: 0, a:distances[post1.id][post2.id]!.a};
                            const tags2Set = new Set(post2.tags);
                            if(post1.tags.some(tag => tags2Set.has(tag))){
                                const n = post1.tags.filter(item => tags2Set.has(item)).length; 
                                force.m += n*nuclearForce(cNuclear, rNuclear, distances[post1.id][post2.id]!).m;
                                force.m += gravForce(G, distances[post1.id][post2.id]!, mBall, mBall).m;
                                force.m += getCoulombForce(kCoulomb, distances[post1.id][post2.id]!, 10*post1.charge, -10*post2.charge).m;
                            } else {
                                force.m += getCoulombForce(kCoulomb, distances[post1.id][post2.id]!, 10*post1.charge, -10*post2.charge).m;
                                //force = nuclearForce(G_nuclear, distances[post1.id][post2.id]!)
                                force.m += gravForce(G, distances[post1.id][post2.id]!, mBall, mBall).m;
                                force.m += getVanDerWaalsForce(distances[post1.id][post2.id]!, post1.radius, post2.radius).m;
                                //force = {m: 0, a: 0}
                            }
                            totalForceX += Math.cos(force.a) * force.m;
                            totalForceY += Math.sin(force.m) * force.m;
                        });
                        
                        if(lastTouchPosition){
                            // Mouse pointer interaction
                            const dx = lastTouchPosition.x - pos1.x;
                            const dy = lastTouchPosition.y - pos1.y;
                            const distanceSq = dx * dx + dy * dy;
                            const angleRadians = Math.atan2(dy,dx);

                            const mouseDistance = {
                                m: distanceSq,
                                a: angleRadians
                            }

                            // Apply cursor force
                            const cursorForce = gravForce(G, mouseDistance, mCursor, mCursor);
                            //const cursorForce = nuclearForce(0.0001, mousePosition, corrPos1);

                            totalForceX += Math.cos(cursorForce.a) * cursorForce.m;
                            totalForceY += Math.sin(cursorForce.a) * cursorForce.m;
                        }
                        checkWalls(pos1, velocity1, post1.radius);
                        clipVelocity(velocity1);
                        newPositions[post1.id] = pos1;
                        velocitiesRef.current[post1.id] = velocity1;
                        // Update positions
                        newPositions[post1.id] = {
                            x: newPositions[post1.id].x + velocity1.vx* timeScale,
                            y: newPositions[post1.id].y + velocity1.vy* timeScale,
                            charge: bubblePositions[post1.id].charge
                        };
                        // Apply acceleration
                        velocity1.vx += totalForceX * timeScale;
                        velocity1.vy += totalForceY * timeScale;

                    });
                    prevTimeRef.current = timestamp;
                }
                setBubblePositions(newPositions);
                animationFrameRef.current = requestAnimationFrame(updateBubblePositions);
            };
            
            animationFrameRef.current = requestAnimationFrame(updateBubblePositions);

            return () => {
                cancelAnimationFrame(animationFrameRef.current);
            };
        }, [bubblePositions, isAnimating, lastTouchPosition]);

        useEffect(() => {

            const updateTouchPosition = (timestamp: number) => {
                if (isDraggingRef.current && lastTouchPosition && draggedBubble) {
                    setBubblePositions(prev => ({
                        ...prev,
                        [draggedBubble.id]: {
                            x: lastTouchPosition.x,
                            y: lastTouchPosition.y,
                            charge: prev[draggedBubble.id].charge
                        }
                    }));
                    if (!dragTimeRef.current) dragTimeRef.current = timestamp;
                    const deltaTime = timestamp - dragTimeRef.current;
                    const timeScale = Math.min(deltaTime / 16.667, 2);
                    dragTimeRef.current = timestamp;

                    const pos1 = bubblePositions[draggedBubble.id];
                    const velocity1 = velocitiesRef.current[draggedBubble.id]|| { vx: 0, vy: 0 };
                    velocity1.vx = (lastTouchPosition.x-pos1.x)/timeScale;
                    velocity1.vy = (lastTouchPosition.y-pos1.y)/timeScale;
                    // Stop things if they going too fast
                    clipVelocity(velocity1);
                    velocitiesRef.current[draggedBubble.id] = velocity1;
                }
                dragFrameRef.current = requestAnimationFrame(updateTouchPosition);
            };
        
            dragFrameRef.current = requestAnimationFrame(updateTouchPosition); // Start loop
            return () => cancelAnimationFrame(dragFrameRef.current); // Stop the loop when the component updates/unmounts
        }, [lastTouchPosition, draggedBubble]);

  return { bubblePositions, setDraggedBubble, isDraggingRef };
}