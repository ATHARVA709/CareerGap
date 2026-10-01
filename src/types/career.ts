export type SkillPriority = 'High' | 'Medium' | 'Low';

export interface SkillItem {
  id: string;
  name: string;
  currentLevel: number; // 0 - 10
  requiredLevel: number; // 1 - 10
  importance: number; // 1 - 10
  gap: number; // Math.max(0, requiredLevel - currentLevel)
  priority: SkillPriority;
  category?: string;
}

export interface UserProfile {
  targetCareer: string;
  currentSkills: { name: string; level: number }[];
  hoursPerDay: number; // e.g. 1.5
  timeRemaining: string; // e.g. "6 months", "12 weeks"
  experience: string; // e.g. "Computer Science student", "2 Python projects"
  projects: string; // e.g. "Simple CRUD app, Titanic dataset analysis"
  learningPreferences?: string; // e.g. "Hands-on projects", "Theory first"
}

export interface RoadmapPhase {
  id: string;
  name: string; // e.g. "Phase 1 — Foundations"
  duration: string; // e.g. "2 weeks"
  durationWeeks?: number;
  skills: string[];
  objectives: string[];
  practicalWork: string[];
  expectedOutcome: string;
  completed: boolean;
  progress: number; // 0 - 100
}

export interface Mission {
  id: string;
  title: string; // e.g. "Master Probability Distributions"
  timeMinutes: number; // e.g. 60
  why: string; // e.g. "Statistics is currently your largest gap and is important for your target career."
  tasks: string[];
  phaseId?: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  skillsDeveloped: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  whyItHelps: string;
  deliverable: string;
}

export interface RoadmapAdaptation {
  id: string;
  timestamp: string;
  title: string;
  whatChanged: string;
  whyItChanged: string;
  nextSteps: string;
  trigger: string;
}

export interface ProgressStats {
  completedMissionsCount: number;
  totalLearningHours: number;
  currentStreak: number;
  lastActiveDate: string;
  completedPhasesCount: number;
}

export interface CareerBlueprint {
  career: string;
  description: string;
  skills: {
    name: string;
    importance: number;
    required_level: number;
  }[];
  recommended_projects: string[];
  typical_learning_sequence: string[];
}

export interface CareerPlanState {
  profile: UserProfile;
  skills: SkillItem[];
  readinessScore: number;
  phases: RoadmapPhase[];
  currentMission: Mission | null;
  completedMissions: Mission[];
  suggestions: string[];
  projects: ProjectRecommendation[];
  lastAdaptation: RoadmapAdaptation | null;
  adaptationHistory: RoadmapAdaptation[];
  progress: ProgressStats;
  lastUpdated: string;
  isGenerated: boolean;
}
