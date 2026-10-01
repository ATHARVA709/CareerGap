/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RoadmapView } from './components/RoadmapView';
import { SkillsView } from './components/SkillsView';
import { ProgressView } from './components/ProgressView';
import { ProjectsView } from './components/ProjectsView';
import { ProfileView } from './components/ProfileView';
import { AdaptationBanner } from './components/AdaptationBanner';
import { AdaptModal } from './components/AdaptModal';
import { MissionFocusModal } from './components/MissionFocusModal';
import { CareerPlanState, UserProfile, SkillItem, RoadmapPhase, Mission } from './types/career';
import { loadCareerPlan, saveCareerPlan } from './lib/storage';
import { calculateReadiness, determinePriority } from './lib/readiness';
import { generateCareerPlan, adaptCareerRoadmap } from './lib/api';

export default function App() {
  const [plan, setPlan] = useState<CareerPlanState>(() => loadCareerPlan());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage whenever plan changes
  useEffect(() => {
    saveCareerPlan(plan);
  }, [plan]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Start mission focus mode
  const handleStartMission = () => {
    setIsFocusModalOpen(true);
  };

  // Mark current mission complete
  const handleCompleteMission = (elapsedHours?: number) => {
    if (!plan.currentMission) return;

    const hoursToAdd = elapsedHours || Math.round((plan.currentMission.timeMinutes / 60) * 10) / 10;
    const completedMission: Mission = {
      ...plan.currentMission,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = plan.progress.lastActiveDate !== today;
    const newStreak = isNewDay ? plan.progress.currentStreak + 1 : plan.progress.currentStreak;

    // Advance current phase progress slightly
    const updatedPhases = plan.phases.map((phase) => {
      if (phase.id === plan.currentMission?.phaseId || (!plan.currentMission?.phaseId && phase.progress < 100)) {
        const nextProgress = Math.min(100, (phase.progress || 0) + 25);
        return {
          ...phase,
          progress: nextProgress,
          completed: nextProgress === 100,
        };
      }
      return phase;
    });

    // Pick next mission or synthesize follow-up task
    const nextMission: Mission = {
      id: `mission-${Date.now()}`,
      title: `Applied Practice: Implement Capstone Exercise for ${plan.profile.targetCareer}`,
      timeMinutes: Math.round(plan.profile.hoursPerDay * 60) || 60,
      why: 'Solidify concepts learned in the previous session with hands-on coding exercises.',
      tasks: [
        'Write automated integration tests covering the implemented logic',
        'Profile latency and handle potential failure states',
        'Commit code to GitHub with descriptive documentation',
      ],
      phaseId: plan.phases[0]?.id,
      completed: false,
    };

    setPlan((prev) => ({
      ...prev,
      currentMission: nextMission,
      completedMissions: [completedMission, ...prev.completedMissions],
      phases: updatedPhases,
      progress: {
        ...prev.progress,
        completedMissionsCount: prev.progress.completedMissionsCount + 1,
        totalLearningHours: Math.round((prev.progress.totalLearningHours + hoursToAdd) * 10) / 10,
        currentStreak: newStreak,
        lastActiveDate: today,
        completedPhasesCount: updatedPhases.filter((p) => p.completed).length,
      },
    }));

    showToast(`Mission completed! +${hoursToAdd}h study time logged.`);
  };

  // Adapt roadmap using Gemini
  const handleAdaptRoadmap = async (
    newHours: number,
    newTimeRemaining: string,
    customReason?: string
  ) => {
    const updatedProfile: UserProfile = {
      ...plan.profile,
      hoursPerDay: newHours,
      timeRemaining: newTimeRemaining,
    };

    const changeReason = customReason
      ? `Student updated study time to ${newHours}h/day, ${newTimeRemaining}. Context: ${customReason}`
      : `Study time adjusted from ${plan.profile.hoursPerDay}h/day to ${newHours}h/day over ${newTimeRemaining}.`;

    const res = await adaptCareerRoadmap(plan, updatedProfile, changeReason);

    if (res && res.adaptationNotice) {
      const newAdaptation = {
        id: `adapt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: res.adaptationNotice.title || 'Roadmap Updated',
        whatChanged: res.adaptationNotice.whatChanged,
        whyItChanged: res.adaptationNotice.whyItChanged,
        nextSteps: res.adaptationNotice.nextSteps,
        trigger: changeReason,
      };

      setPlan((prev) => ({
        ...prev,
        profile: updatedProfile,
        phases: res.updatedPhases || prev.phases,
        currentMission: res.updatedMission || prev.currentMission,
        suggestions: res.updatedSuggestions || prev.suggestions,
        lastAdaptation: newAdaptation,
        adaptationHistory: [newAdaptation, ...prev.adaptationHistory],
      }));

      showToast('Roadmap adapted successfully with Gemini.');
    }
  };

  // Recalculate full career plan from Profile
  const handleSaveAndRegenerate = async (newProfile: UserProfile) => {
    const res = await generateCareerPlan(newProfile);

    // Merge returned skills with user declared skills
    const rawSkills = res.requiredSkills || [];
    const skillItems: SkillItem[] = rawSkills.map((rs: any, idx: number) => {
      const userMatch = (newProfile.currentSkills || []).find(
        (cs) => cs.name.toLowerCase() === rs.name.toLowerCase()
      );
      const currentLevel = userMatch ? userMatch.level : 1;
      const requiredLevel = rs.requiredLevel || 7;
      const importance = rs.importance || 8;

      return {
        id: `skill-${idx + 1}`,
        name: rs.name,
        currentLevel,
        requiredLevel,
        importance,
        gap: Math.max(0, requiredLevel - currentLevel),
        priority: determinePriority(currentLevel, requiredLevel, importance),
        category: rs.category || 'Core',
      };
    });

    const readinessScore = calculateReadiness(skillItems);

    const newPhases: RoadmapPhase[] = (res.phases || []).map((p: any, idx: number) => ({
      id: p.id || `phase-${idx + 1}`,
      name: p.name,
      duration: p.duration,
      skills: p.skills || [],
      objectives: p.objectives || [],
      practicalWork: p.practicalWork || [],
      expectedOutcome: p.expectedOutcome || '',
      completed: false,
      progress: 0,
    }));

    const newCurrentMission: Mission = {
      id: res.currentMission?.id || `mission-1`,
      title: res.currentMission?.title || `Foundations for ${newProfile.targetCareer}`,
      timeMinutes: res.currentMission?.timeMinutes || Math.round(newProfile.hoursPerDay * 60),
      why: res.currentMission?.why || 'Essential starting mission.',
      tasks: res.currentMission?.tasks || ['Study core concepts', 'Write code implementation', 'Verify tests'],
      phaseId: newPhases[0]?.id,
      completed: false,
    };

    const newProjects = res.projectRecommendations || [];
    const newSuggestions = res.suggestions || [];

    setPlan({
      profile: newProfile,
      skills: skillItems,
      readinessScore,
      phases: newPhases,
      currentMission: newCurrentMission,
      completedMissions: [],
      suggestions: newSuggestions,
      projects: newProjects,
      lastAdaptation: null,
      adaptationHistory: [],
      progress: {
        completedMissionsCount: 0,
        totalLearningHours: 0,
        currentStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        completedPhasesCount: 0,
      },
      lastUpdated: new Date().toISOString(),
      isGenerated: true,
    });

    setActiveTab('dashboard');
    showToast(`Career plan generated for ${newProfile.targetCareer}!`);
  };

  // Skill matrix updates
  const handleUpdateSkillLevel = (skillId: string, newLevel: number) => {
    setPlan((prev) => {
      const updatedSkills = prev.skills.map((s) => {
        if (s.id === skillId) {
          const gap = Math.max(0, s.requiredLevel - newLevel);
          return {
            ...s,
            currentLevel: newLevel,
            gap,
            priority: determinePriority(newLevel, s.requiredLevel, s.importance),
          };
        }
        return s;
      });

      const readinessScore = calculateReadiness(updatedSkills);
      return {
        ...prev,
        skills: updatedSkills,
        readinessScore,
        profile: {
          ...prev.profile,
          currentSkills: updatedSkills.map((s) => ({ name: s.name, level: s.currentLevel })),
        },
      };
    });
  };

  const handleAddSkill = (name: string, level: number, requiredLevel = 8) => {
    setPlan((prev) => {
      const newSkill: SkillItem = {
        id: `skill-${Date.now()}`,
        name,
        currentLevel: level,
        requiredLevel,
        importance: 8,
        gap: Math.max(0, requiredLevel - level),
        priority: determinePriority(level, requiredLevel, 8),
      };
      const updatedSkills = [...prev.skills, newSkill];
      const readinessScore = calculateReadiness(updatedSkills);
      return {
        ...prev,
        skills: updatedSkills,
        readinessScore,
        profile: {
          ...prev.profile,
          currentSkills: updatedSkills.map((s) => ({ name: s.name, level: s.currentLevel })),
        },
      };
    });
    showToast(`Skill "${name}" added.`);
  };

  const handleRemoveSkill = (skillId: string) => {
    setPlan((prev) => {
      const updatedSkills = prev.skills.filter((s) => s.id !== skillId);
      const readinessScore = calculateReadiness(updatedSkills);
      return {
        ...prev,
        skills: updatedSkills,
        readinessScore,
        profile: {
          ...prev.profile,
          currentSkills: updatedSkills.map((s) => ({ name: s.name, level: s.currentLevel })),
        },
      };
    });
  };

  // Adapt with updated skill proficiencies
  const handleAdaptWithUpdatedSkills = async () => {
    const changeReason = `Student updated their declared skill proficiencies. Reassess roadmap to skip mastered concepts and prioritize remaining gaps.`;
    await handleAdaptRoadmap(plan.profile.hoursPerDay, plan.profile.timeRemaining, changeReason);
  };

  // Update phase progress directly
  const handleUpdatePhaseProgress = (phaseId: string, newProgress: number) => {
    setPlan((prev) => {
      const updatedPhases = prev.phases.map((p) => {
        if (p.id === phaseId) {
          return {
            ...p,
            progress: newProgress,
            completed: newProgress === 100,
          };
        }
        return p;
      });
      return {
        ...prev,
        phases: updatedPhases,
        progress: {
          ...prev.progress,
          completedPhasesCount: updatedPhases.filter((p) => p.completed).length,
        },
      };
    });
  };

  // Manual study hour logging
  const handleLogStudyHours = (hours: number) => {
    setPlan((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        totalLearningHours: Math.round((prev.progress.totalLearningHours + hours) * 10) / 10,
      },
    }));
    showToast(`Logged ${hours} study hours.`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetCareer={plan.profile.targetCareer}
        onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Adaptive Roadmap Notification Banner */}
        <AdaptationBanner
          adaptation={plan.lastAdaptation}
          onDismiss={() => setPlan((prev) => ({ ...prev, lastAdaptation: null }))}
          onViewRoadmap={() => setActiveTab('roadmap')}
        />

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView
            plan={plan}
            onStartMission={handleStartMission}
            onCompleteMission={handleCompleteMission}
            onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            plan={plan}
            onUpdatePhaseProgress={handleUpdatePhaseProgress}
            onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsView
            plan={plan}
            onUpdateSkillLevel={handleUpdateSkillLevel}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onAdaptWithUpdatedSkills={handleAdaptWithUpdatedSkills}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView plan={plan} onLogStudyHours={handleLogStudyHours} />
        )}

        {activeTab === 'projects' && <ProjectsView plan={plan} />}

        {activeTab === 'profile' && (
          <ProfileView
            currentProfile={plan.profile}
            onSaveAndRegenerate={handleSaveAndRegenerate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-zinc-300">CareerGap</span>
            <span className="mx-2">·</span>
            <span>From Career Goal to Career Readiness</span>
          </div>
          <div>Personalized AI Career Intelligence & Progression</div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {plan.currentMission && (
        <MissionFocusModal
          mission={plan.currentMission}
          isOpen={isFocusModalOpen}
          onClose={() => setIsFocusModalOpen(false)}
          onComplete={handleCompleteMission}
        />
      )}

      <AdaptModal
        isOpen={isAdaptModalOpen}
        onClose={() => setIsAdaptModalOpen(false)}
        currentProfile={plan.profile}
        onAdapt={handleAdaptRoadmap}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/95 px-4 py-3 text-xs font-medium text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
