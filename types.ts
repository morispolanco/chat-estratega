
export enum OracleMode {
  AUTO = 'AUTO',
  TOPICA = 'TOPICA',
  ABDUCCION = 'ABDUCCION',
  PIVOTE = 'PIVOTE',
  COMBINATORIA = 'COMBINATORIA',
  KAIROS = 'KAIROS',
  // Writer Modes
  FACEBOOK = 'FACEBOOK',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  BLOG = 'BLOG'
}

export type OracleStyle = 'profesional' | 'académico' | 'serio' | 'formal' | 'informal' | 'amigable';

export interface UserProfile {
  name: string;
  bio: string;
  professionalGoal: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  mode?: OracleMode;
  style?: OracleStyle;
}

export interface CombinatoriaState {
  industry1: string;
  industry2: string;
  industry3: string;
}
