import { SkillItem, SkillPriority, RoadmapPhase } from '../types/career';

/**
 * Deterministic Career Readiness calculation:
 * Compares current skill levels to required levels, weighted by skill importance.
 * No Bayesian estimation or stochastic models.
 */
export function calculateReadiness(skills: SkillItem[]): number {
  if (!skills || skills.length === 0) return 0;

  let totalWeightedRatio = 0;
  let totalWeights = 0;

  for (const skill of skills) {
    const required = Math.max(1, Math.min(10, skill.requiredLevel || 1));
    const current = Math.max(0, Math.min(10, skill.currentLevel || 0));
    const importance = Math.max(1, Math.min(10, skill.importance || 5));

    // Ratio capped at 1.0 (exceeding required level doesn't artificially inflate beyond mastery)
    const ratio = Math.min(1, current / required);

    totalWeightedRatio += ratio * importance;
    totalWeights += importance;
  }

  if (totalWeights === 0) return 0;
  const percentage = Math.round((totalWeightedRatio / totalWeights) * 100);
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Calculates deterministic priority for a skill gap.
 */
export function determinePriority(
  current: number,
  required: number,
  importance: number
): SkillPriority {
  const gap = Math.max(0, required - current);
  if (gap === 0) return 'Low';
  if (gap >= 4 && importance >= 6) return 'High';
  if (gap >= 3 && importance >= 7) return 'High';
  if (gap >= 2 || importance >= 8) return 'Medium';
  return 'Low';
}

/**
 * Formats gap magnitude text
 */
export function formatGapLabel(current: number, required: number): 'Small' | 'Medium' | 'High' | 'Mastered' {
  const gap = Math.max(0, required - current);
  if (gap === 0) return 'Mastered';
  if (gap <= 2) return 'Small';
  if (gap <= 4) return 'Medium';
  return 'High';
}

/**
 * Calculates overall roadmap progress percentage across all phases.
 */
export function calculateRoadmapProgress(phases: RoadmapPhase[]): number {
  if (!phases || phases.length === 0) return 0;
  const sum = phases.reduce((acc, p) => acc + (p.progress || 0), 0);
  return Math.round(sum / phases.length);
}

/**
 * Parses time remaining into rough total weeks/hours available.
 */
export function estimateTotalAvailableHours(
  timeRemainingStr: string,
  hoursPerDay: number
): number {
  const lower = timeRemainingStr.toLowerCase();
  let days = 90; // default 3 months

  if (lower.includes('month')) {
    const match = lower.match(/(\d+(\.\d+)?)/);
    const months = match ? parseFloat(match[1]) : 3;
    days = Math.round(months * 30);
  } else if (lower.includes('week')) {
    const match = lower.match(/(\d+(\.\d+)?)/);
    const weeks = match ? parseFloat(match[1]) : 12;
    days = Math.round(weeks * 7);
  } else if (lower.includes('year')) {
    const match = lower.match(/(\d+(\.\d+)?)/);
    const years = match ? parseFloat(match[1]) : 1;
    days = Math.round(years * 365);
  } else if (lower.includes('day')) {
    const match = lower.match(/(\d+(\.\d+)?)/);
    days = match ? parseInt(match[1]) : 60;
  }

  // Assuming 6 study days per week
  const studyDays = Math.round(days * (6 / 7));
  return Math.round(studyDays * hoursPerDay);
}
