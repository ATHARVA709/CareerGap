import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  Play,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldAlert,
  Zap,
  BookOpen,
  FolderGit2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { CareerPlanState, SkillPriority } from '../types/career';
import { calculateRoadmapProgress, formatGapLabel } from '../lib/readiness';

interface DashboardViewProps {
  plan: CareerPlanState;
  onStartMission: () => void;
  onCompleteMission: (hoursSpent?: number) => void;
  onOpenAdaptModal: () => void;
  onNavigateTab: (tab: 'roadmap' | 'skills' | 'progress' | 'projects' | 'profile') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  plan,
  onStartMission,
  onCompleteMission,
  onOpenAdaptModal,
  onNavigateTab,
}) => {
  const [skillFilter, setSkillFilter] = useState<'all' | 'high'>('all');
  const overallRoadmapProgress = calculateRoadmapProgress(plan.phases);

  const filteredSkills = plan.skills.filter((s) => {
    if (skillFilter === 'high') return s.priority === 'High';
    return true;
  });

  const highPriorityGapCount = plan.skills.filter((s) => s.priority === 'High').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP HERO BAR: Target Career, Time Remaining, Hours/Day */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Career Intelligence</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">Target Role</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {plan.profile.targetCareer}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {plan.profile.experience
                ? `${plan.profile.experience}. Tracking personalized milestones.`
                : 'Accelerating progression toward verified industry competency.'}
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
              <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[11px] font-medium text-zinc-400">Daily Study</div>
                <div className="font-mono text-sm font-bold text-white tabular-nums">
                  {plan.profile.hoursPerDay} hrs / day
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
              <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[11px] font-medium text-zinc-400">Time Remaining</div>
                <div className="font-mono text-sm font-bold text-white">
                  {plan.profile.timeRemaining}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAdaptModal}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 px-4 py-2.5 text-xs font-semibold text-indigo-200 transition-colors focus:outline-none"
              title="Adjust study constraints"
            >
              <Zap className="h-4 w-4 text-indigo-400" />
              <span>Adapt Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CAREER READINESS CARD */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Deterministic Assessment
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white tabular-nums">
                {plan.readinessScore}%
              </span>
              <span className="text-sm font-medium text-zinc-400">Career Readiness</span>
            </div>
            <div className="mt-3 w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${plan.readinessScore}%` }}
              />
            </div>
          </div>

          <div className="lg:col-span-8 border-t lg:border-t-0 lg:border-l border-zinc-800/80 pt-4 lg:pt-0 lg:pl-8">
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">
              Based on your current skills compared with the skills required for your target.
            </p>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              This is an estimate calculated directly from your declared skill levels against verified role benchmarks, not a guarantee of job readiness. Focus on high-priority gaps below to maximize readiness growth.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <strong className="text-zinc-200">{highPriorityGapCount}</strong> High Priority Gaps
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <strong className="text-zinc-200">{plan.progress.currentStreak} Day</strong> Streak
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <strong className="text-zinc-200">{plan.progress.totalLearningHours}h</strong> Study Logged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TODAY'S MISSION (Prominent Focal Anchor) */}
      {plan.currentMission && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-zinc-900/90 to-zinc-950 p-6 sm:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Today's Mission
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-400 font-mono">
                  {plan.currentMission.timeMinutes} minutes
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {plan.currentMission.title}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800">
                <strong className="text-indigo-400 font-semibold">Why this mission: </strong>
                {plan.currentMission.why}
              </p>

              {/* Tasks Checklist Preview */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Target Tasks
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {plan.currentMission.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-2.5 text-xs text-zinc-200"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-indigo-950 text-indigo-400 font-mono text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mission Actions */}
            <div className="flex flex-row md:flex-col gap-3 shrink-0 justify-end md:min-w-[170px]">
              <button
                onClick={onStartMission}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 focus:outline-none"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start Mission</span>
              </button>

              <button
                onClick={() => onCompleteMission()}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-4 py-3 text-xs font-semibold text-zinc-100 transition-colors focus:outline-none"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Mark Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SKILL GAP OVERVIEW DASHBOARD */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Skill Gap Overview</h2>
            <p className="text-xs text-zinc-400">
              Evaluated against requirements for {plan.profile.targetCareer}.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            <button
              onClick={() => setSkillFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                skillFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Skills ({plan.skills.length})
            </button>
            <button
              onClick={() => setSkillFilter('high')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                skillFilter === 'high'
                  ? 'bg-zinc-800 text-rose-300 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              High Priority ({highPriorityGapCount})
            </button>
          </div>
        </div>

        {/* Skill Gap Cards / Matrix */}
        <div className="space-y-3">
          {filteredSkills.map((skill) => {
            const gapLabel = formatGapLabel(skill.currentLevel, skill.requiredLevel);
            const isHigh = skill.priority === 'High';
            const currentPct = (skill.currentLevel / 10) * 100;
            const requiredPct = (skill.requiredLevel / 10) * 100;

            return (
              <div
                key={skill.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isHigh
                    ? 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50'
                    : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{skill.name}</span>
                    {isHigh && (
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                        High Priority
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-zinc-300 tabular-nums">
                      {skill.currentLevel}/10 →{' '}
                      <strong className="text-white">{skill.requiredLevel}/10</strong>
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span
                      className={`font-medium ${
                        skill.priority === 'High'
                          ? 'text-rose-400'
                          : skill.priority === 'Medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {gapLabel} Gap
                    </span>
                  </div>
                </div>

                {/* Progress bar visualizing current vs required */}
                <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden mt-1">
                  {/* Required level indicator target */}
                  <div
                    className="absolute top-0 bottom-0 bg-zinc-700/60 rounded-full"
                    style={{ width: `${requiredPct}%` }}
                  />
                  {/* Current level fill */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${
                      isHigh
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                    }`}
                    style={{ width: `${currentPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onNavigateTab('skills')}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <span>Open Skill Matrix & Level Sliders</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 5. ROADMAP PROGRESS SUMMARY */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Roadmap Progress</h2>
            <p className="text-xs text-zinc-400">
              Sequential phase completion towards job readiness.
            </p>
          </div>
          <span className="font-mono text-xl font-extrabold text-indigo-400 tabular-nums">
            {overallRoadmapProgress}%
          </span>
        </div>

        <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${overallRoadmapProgress}%` }}
          />
        </div>

        <div className="space-y-3">
          {plan.phases.map((phase, idx) => {
            const isCompleted = phase.completed || phase.progress === 100;
            return (
              <div
                key={phase.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono ${
                      isCompleted
                        ? 'bg-emerald-500 text-black'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{phase.name}</div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                      <span>{phase.duration}</span>
                      <span>·</span>
                      <span className="truncate max-w-[240px] sm:max-w-md">
                        {phase.skills.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-44 shrink-0">
                  <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-300 tabular-nums w-9 text-right">
                    {phase.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onNavigateTab('roadmap')}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <span>Explore Full Phase Curriculum & Tasks</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 6. AI SUGGESTIONS SECTION */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center gap-2 text-indigo-400 mb-4">
          <Sparkles className="h-4 w-4" />
          <h2 className="text-lg font-bold text-white tracking-tight">AI Suggestions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 text-xs sm:text-sm text-zinc-300 leading-relaxed flex flex-col justify-between"
            >
              <p>{suggestion}</p>
              <div className="mt-3 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-medium">
                Personalized for {plan.profile.hoursPerDay}h/day pacing
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. RECOMMENDED PROJECTS */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <FolderGit2 className="h-4 w-4" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Recommended Practical Projects
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="font-semibold text-indigo-300">{proj.difficulty}</span>
                  <span>Est. {proj.estimatedTime}</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight mb-2">
                  {proj.title}
                </h3>
                <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed mb-3">
                  {proj.whyItHelps}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80">
                <div className="text-[11px] font-semibold text-zinc-400 mb-1">Deliverable:</div>
                <div className="text-xs text-zinc-200 line-clamp-2">{proj.deliverable}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
