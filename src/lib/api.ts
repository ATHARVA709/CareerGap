import { UserProfile, CareerPlanState, CareerBlueprint } from '../types/career';

export async function fetchCareerBlueprint(career: string): Promise<CareerBlueprint> {
  const res = await fetch('/api/career/blueprint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ career }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch blueprint: ${res.statusText}`);
  }

  return res.json();
}

export async function generateCareerPlan(profile: UserProfile): Promise<any> {
  const res = await fetch('/api/career/analyze-and-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate career plan: ${res.statusText}`);
  }

  return res.json();
}

export async function adaptCareerRoadmap(
  currentPlan: CareerPlanState,
  updatedProfile: UserProfile,
  changeReason: string
): Promise<any> {
  const res = await fetch('/api/career/adapt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPlan, updatedProfile, changeReason }),
  });

  if (!res.ok) {
    throw new Error(`Failed to adapt career roadmap: ${res.statusText}`);
  }

  return res.json();
}
