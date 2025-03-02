
interface Link {
    url: string;
    text: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface Velocity {
    vx: number;
    vy: number;
}

export interface Vector {
    m: number;
    a: number;
}

export type BubblePositions = {
    [key: string]: { x: number; y: number, charge: number };
  };

export interface BlogPostData{
    title: string;
    excerpt: string;
    date: string;
    imageUrl: string;
    tags: string[];
    links: Link[];
    radius: number;
    charge: number;
  }

  export interface BlogPost extends BlogPostData {
    id: number;
  }

  export interface Point {
    x: number;
    y: number;
    originalX: number;
    originalY: number;
    velocityX: number;
    velocityY: number;
  }