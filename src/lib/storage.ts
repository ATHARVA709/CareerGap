import { CareerPlanState } from '../types/career';
import { getDefaultMLPlan } from './defaults';

const STORAGE_KEY = 'careergap_app_state_v2';

export function loadCareerPlan(): CareerPlanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = getDefaultMLPlan();
      saveCareerPlan(defaultState);
      return defaultState;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.profile || !parsed.skills) {
      const defaultState = getDefaultMLPlan();
      saveCareerPlan(defaultState);
      return defaultState;
    }
    return parsed as CareerPlanState;
  } catch (err) {
    console.error('Failed to load CareerGap state from localStorage:', err);
    return getDefaultMLPlan();
  }
}

export function saveCareerPlan(state: CareerPlanState): void {
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist CareerGap state to localStorage:', err);
  }
}

export function clearCareerPlan(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear CareerGap state:', err);
  }
}
