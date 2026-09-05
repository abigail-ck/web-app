export type PhotoStyleId = 'vintage' | 'bw' | 'original' | 'rose' | 'olive';

export interface PhotoStyleConfig {
  id: PhotoStyleId;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  filterClass: string;
  contrast: number;
  saturate: number;
  sepia: number;
  hueRotate: number;
  brightness: number;
  grainIntensity: number;
  tintRgb?: [number, number, number, number];
}

export interface EventPhoto {
  id: string;
  url: string;
  originalUrl: string;
  author: string;
  caption?: string;
  timestamp: string;
  formattedTime: string;
  style: PhotoStyleId;
  likes: number;
  hasLiked?: boolean;
  tag?: string;
  rotationDeg: number;
  location?: string;
}

export interface Contributor {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  photoCount: number;
  role?: string;
  lastActive: string;
}

export interface EventConfig {
  title: string;
  subtitle: string;
  dateOrigin: string; // e.g. "ES.2026"
  welcomeTitle: string;
  welcomeSubtitle: string;
  heroWord: string; // letters scattered over the splash photo
  timeLeftDisplay: string;
  timeLeftSeconds: number;
  totalMoments: number;
  totalPeople: number;
  watermarkText: string;
}

export type ActiveScreen = 'splash' | 'dashboard' | 'camera' | 'style-selector';
