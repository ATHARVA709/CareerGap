import React, { useState } from 'react';
import {
  LineChart,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  Compass,
} from 'lucide-react';
import { CareerPlanState } from '../types/career';
import { calculateRoadmapProgress } from '../lib/readiness';

interface ProgressViewProps {
  plan: CareerPlanState;
  onLogStudyHours: (hours: number) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ plan, onLogStudyHours }) => {
  const [logInput, setLogInput] = useState<number>(1);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const overallRoadmapProgress = calculateRoadmapProgress(plan.phases);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (logInput > 0) {
      onLogStudyHours(logInput);
      setShowLogModal(false);
      setLogInput(1);
    }
  };

  const completedPhasesCount = plan.phases.filter((p) => p.completed || p.progress === 100).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <LineChart className="h-3.5 w-3.5" />
            <span>Progress Intelligence</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Learning Momentum & Verification
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Tracking completed missions, structured phase completion, and cumulative focus hours towards {plan.profile.targetCareer}.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log Study Session</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Progress</span>
            <Compass className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white tabular-nums">
            {overallRoadmapProgress}%
          </div>
          <div className="mt-2 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${overallRoadmapProgress}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Focus Time</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white tabular-nums">
            {plan.progress.totalLearningHours} <span className="text-lg font-normal text-zinc-400">hrs</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Cumulative verified study hours</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Streak</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white tabular-nums flex items-baseline gap-1.5">
            {plan.progress.currentStreak} <span className="text-lg font-normal text-zinc-400">days</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Consecutive daily study habit</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Missions Done</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white tabular-nums">
            {plan.progress.completedMissionsCount}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {completedPhasesCount} of {plan.phases.length} phases completed
          </p>
        </div>
      </div>

      {/* Phase Breakdown Visual */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4">
          Phase-by-Phase Completion
        </h2>
        <div className="space-y-4">
          {plan.phases.map((phase, idx) => {
            const isCompleted = phase.completed || phase.progress === 100;
            return (
              <div key={phase.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200 flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <span className="font-mono text-zinc-500">#{idx + 1}</span>
                    )}
                    {phase.name}
                  </span>
                  <span className="font-mono text-zinc-400 tabular-nums font-bold">
                    {phase.progress}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Missions History */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4">
          Completed Mission Log
        </h2>
        {plan.completedMissions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No completed missions yet. Start Today's Mission from the Dashboard to record your first milestone!
          </div>
        ) : (
          <div className="space-y-3">
            {plan.completedMissions.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">{m.title}</div>
                    <div className="text-zinc-400">{m.why}</div>
                  </div>
                </div>
                <div className="font-mono text-zinc-400 shrink-0">
                  {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : 'Completed'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Log Study Session</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Record hours spent coding or studying for {plan.profile.targetCareer}.
            </p>

            <form onSubmit={handleLog} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Hours Spent
                </label>
                <input
                  type="number"
                  min="0.25"
                  max="12"
                  step="0.25"
                  value={logInput}
                  onChange={(e) => setLogInput(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
                >
                  Record Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
