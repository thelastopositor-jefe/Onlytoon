export interface Episode {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
}

export interface Project {
  id: string;
  title: string;
  synopsis: string;
  type: '3D' | '2D' | 'Stop Motion' | 'Experimental';
  genre: string[];
  year: number;
  creator: string;
  creatorAvatar: string;
  bannerUrl: string;
  episodes: Episode[];
  patreonUrl: string;
  likes: number;
  isSeries: boolean;
}

export interface CommunityTopic {
  id: string;
  category: 'Herramientas' | 'Proceso' | 'Colaboraciones' | 'Inspiración';
  title: string;
  author: string;
  authorInitials: string;
  content: string;
  date: string;
  readTime: string;
  repliesCount: number;
  likes: number;
  comments: { author: string; text: string; date: string }[];
}

export interface ProductItem {
  id: string;
  category: 'Software' | 'Hardware' | 'Accesorios' | 'Equipamiento';
  name: string;
  description: string;
  image: string;
  affiliateUrl: string;
}