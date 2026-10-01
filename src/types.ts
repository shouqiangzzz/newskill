export type SkillLevel = 'locked' | 'novice' | 'apprentice' | 'intermediate' | 'advanced' | 'master';

export interface SkillLevelInfo {
  tier: SkillLevel;
  label: string;
  minXp: number;
  maxXp: number;
  color: string;
  badge: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'book' | 'course' | 'repo';
}

export interface SubSkillItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface SkillNode {
  id: string;
  name: string;
  tagline: string;
  description: string;
  domainId: string;
  category: string;
  iconName: string;
  currentXp: number;
  targetLevel: SkillLevel;
  level: SkillLevel;
  prerequisiteIds: string[]; // skill IDs that must be at least 'apprentice' to unlock
  subSkills: SubSkillItem[];
  resources: ResourceLink[];
  notes: string;
  lastPracticed?: string;
  totalTimeMinutes: number;
  position: { x: number; y: number }; // Relative coordinate on canvas
}

export interface DomainCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
}

export interface PracticeSession {
  id: string;
  skillId: string;
  skillName: string;
  domainId: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
  durationMinutes: number;
  xpEarned: number;
  intensity: 'light' | 'moderate' | 'deep' | 'breakthrough';
  notes: string;
  completedSubSkillIds?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  targetSkillId?: string;
  targetDomainId?: string;
  description: string;
  deadline?: string;
  completed: boolean;
  rewardXp: number;
  completedDate?: string;
}

export interface UserStats {
  totalXp: number;
  currentStreakDays: number;
  lastActiveDate: string;
  totalMinutesPracticed: number;
  skillsMasteredCount: number;
  sessionsCount: number;
}
