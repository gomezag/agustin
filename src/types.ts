
interface Link {
    url: string;
    text: string;
}

export interface BlogPostData{
    title: string;
    excerpt: string;
    date: string;
    imageUrl: string;
    tags: string[];
    radius: number;
    links: Link[];
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