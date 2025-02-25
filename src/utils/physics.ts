import { Position, Velocity, Vector } from '../types';
const MIN_DISTANCE=100;

export function getForce(G: number, pos1: Position, pos2: Position, m1: number, m2: number) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    let dist2 = dx * dx + dy * dy;
    if (dist2 < MIN_DISTANCE * MIN_DISTANCE) {
      dist2 = MIN_DISTANCE * MIN_DISTANCE;
    }
    return { m: (m1 * m2 * G) / dist2, a: Math.atan2(dy, dx) };
  }

  export function nuclearForce(G_eff: number, pos1: Position, pos2: Position) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);
  
    const A = 700; // Strength of repulsion
    const B = 200;   // Strength of attraction
    const lambda = 100; // Interaction range
  
    // Prevent division by zero (minimum distance threshold)
    const minDistance = MIN_DISTANCE;
    const distance = Math.max(r, minDistance);
  
    // Compute force magnitude
    const forceMag = -G_eff * ((A / Math.pow(distance, 10)) - B * Math.exp(-distance / lambda));
  
    // Compute force components
    return {
      m: forceMag,
      a: Math.atan2(dy, dx),
    };
  }
