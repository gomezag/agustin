import { Position, Velocity, Vector } from '../types';
const MIN_DISTANCE=100;
const MAX_VELOCITY=15;
const energyLoss=0.9

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
    const B = 400;   // Strength of attraction
    const lambda = 50; // Interaction range

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

export function checkWalls(pos: Position, velocity: Velocity, radius: number){
    // Check Wall Constraints
    const bubbleSize = radius/2;
    if (pos.x < bubbleSize) {
        pos.x = bubbleSize+1;
        velocity.vx = Math.abs(velocity.vx) * energyLoss;
    } else if (pos.x > window.innerWidth - bubbleSize) {
        pos.x = window.innerWidth - bubbleSize-1;
        velocity.vx = -Math.abs(velocity.vx) * energyLoss;
    }
    // Same for Y coord
    //const headerHeight = document.querySelector('header')?.offsetHeight || 100;
    if (pos.y < bubbleSize) {
        pos.y = bubbleSize;
        velocity.vy = Math.abs(velocity.vy) * energyLoss;
    } else if (pos.y > window.innerHeight - bubbleSize) {
        pos.y = window.innerHeight - bubbleSize;
        velocity.vy = -Math.abs(velocity.vy) * energyLoss;
    }
};

export function bounce(pos1: Position, pos2: Position, velocity1: Velocity, velocity2: Velocity, overlap: number, angle: number){
    const pushX = Math.cos(angle)*overlap*1.05;
    const pushY = Math.sin(angle)*overlap*1.05;
    //Move balls out of an overlap
    pos1.x -= pushX;
    pos1.y -= pushY;
    pos2.x += pushX;
    pos2.y += pushY;
    // Swap velocities
    [velocity1.vx, velocity2.vx] = [velocity2.vx*energyLoss, velocity1.vx*energyLoss];
    [velocity1.vy, velocity2.vy] = [velocity2.vy*energyLoss, velocity1.vy*energyLoss];
}

export function clipVelocity(vel: Velocity) {
    // Stop things if they going too fast
    if(Math.abs(vel.vx) > MAX_VELOCITY) {
        vel.vx=Math.sign(vel.vx)*MAX_VELOCITY;
    }
    if(Math.abs(vel.vy) > MAX_VELOCITY) {
        vel.vy=Math.sign(vel.vy)*MAX_VELOCITY;
    }
}