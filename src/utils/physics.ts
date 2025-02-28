import { Position, Velocity, Vector } from '../types';
const MIN_DISTANCE=100;

export function getForce(G: number, v: Vector, m1: number, m2: number) {
    let dist2 = v.m;
    if (dist2 < MIN_DISTANCE * MIN_DISTANCE) {
      dist2 = MIN_DISTANCE * MIN_DISTANCE;
    }
    return { m: -(m1 * m2 * G) / dist2, a: v.a };
  }

export function nuclearForce(G_eff: number, v: Vector) {
    let dist2 = v.m;
    if (dist2 < MIN_DISTANCE * MIN_DISTANCE) {
        dist2 = MIN_DISTANCE * MIN_DISTANCE;
    }
    let dist = Math.sqrt(v.m);

    const A = 400; // Strength of repulsion
    const B = 80;   // Strength of attraction
    const lambda = 30; // Interaction range

    // Prevent division by zero (minimum distance threshold)
    const minDistance = MIN_DISTANCE;
    const distance = Math.max(dist, minDistance);

    // Compute force magnitude
    const forceMag = -(G_eff^2) * (A*(Math.exp(-distance/lambda)/dist2) + B * Math.exp(-distance / lambda)/distance);

    // Compute force components
    return {
        m: forceMag,
        a: v.a
    }
}

export function getCoulombForce(k: number, v: Vector, q1: number, q2: number){
    return {
        m: -k*q1*q2/v.m,
        a: v.a
    }
}

export function getVanDerWaalsForce(v: Vector, r1: number, r2: number) {
    const A = 1;
    return {
        m: -(A*r1*r2)/((r1+r2)*6*v.m),
        a: v.a
    }
}