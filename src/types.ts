export type FormatType = '2D' | '3D' | 'Stop motion' | 'IA';

export type ProjectCategory = 
  | 'Cortometraje' 
  | 'Largometraje' 
  | 'Serie' 
  | 'Tráiler' 
  | 'Publicidad' 
  | 'Musical' 
  | 'Tutorial';

export interface Episode {
  id: string;
  number: number;
  title: string;
  duration: string;
  thumbnailUrl: string;
  youtubeId: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  patreonUrl?: string;
  format: FormatType;
  genres: string[];
  year: number;
  category: ProjectCategory;
  thumbnailUrl: string;
  youtubeId: string;
  likes: number;
  favoritesCount: number;
  featured?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  seasons?: Season[];
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  category: 'Software' | 'Hardware' | 'Accesorios' | 'Equipamiento' | 'Cursos';
  description: string;
  price: string;
  affiliateUrl: string;
  imageUrl: string;
  tag?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: 'HERRAMIENTAS' | 'PROCESO' | 'COLABORACIONES' | 'INSPIRACIÓN';
  authorName: string;
  authorId: string;
  repliesCount: number;
  createdAt: string;
  content: string;
}