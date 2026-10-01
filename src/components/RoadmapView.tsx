import React, { useState } from 'react';
import { Compass, Sparkles, CheckCircle2, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { CareerPlanState, RoadmapPhase } from '../types/career';

interface RoadmapViewProps {
  plan: CareerPlanState;
  onUpdatePhaseProgress: (phaseId: string, newProgress: number) => void;
  onOpenAdaptModal: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  plan,
  onUpdatePhaseProgress,
  onOpenAdaptModal,
}) => {
  const [expandedPhaseId, setExpandedPhaseId] = useState<string>(plan.phases[0]?.id || '');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Compass className="h-3.5 w-3.5" />
            <span>Structured Progression</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Personalized Career Roadmap
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Tailored to {plan.profile.hoursPerDay} hours/day study pace over {plan.profile.timeRemaining}.
            Sequential phases designed to close high-priority gaps.
          </p>
        </div>

        <button
          onClick={onOpenAdaptModal}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Adapt Timeline</span>
        </button>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        {plan.phases.map((phase, idx) => {
          const isExpanded = expandedPhaseId === phase.id;
          const isPhaseDone = phase.completed || phase.progress === 100;

          return (
            <div
              key={phase.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isPhaseDone
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : isExpanded
                  ? 'border-indigo-500/40 bg-zinc-900/80 shadow-lg'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
              }`}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedPhaseId(isExpanded ? '' : phase.id)}
                className="flex items-center justify-between p-5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold font-mono transition-colors ${
                      isPhaseDone
                        ? 'bg-emerald-500 text-black'
                        : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    {isPhaseDone ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {phase.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-indigo-400" />
                        {phase.duration}
                      </span>
                      <span>·</span>
                      <span className="text-zinc-300">{phase.skills.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-300 tabular-nums w-8 text-right">
                      {phase.progress}%
                    </span>
                  </div>

                  <div className="p-1 text-zinc-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="border-t border-zinc-800/80 p-5 sm:p-6 bg-zinc-950/40 space-y-6">
                  {/* Phase Progress Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="text-xs font-semibold text-zinc-300">
                      Phase Completion Status
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={phase.progress}
                        onChange={(e) => onUpdatePhaseProgress(phase.id, parseInt(e.target.value, 10))}
                        className="w-32 sm:w-44 accent-indigo-500 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-white tabular-nums w-10 text-right">
                        {phase.progress}%
                      </span>
                      <button
                        onClick={() =>
                          onUpdatePhaseProgress(phase.id, phase.progress === 100 ? 0 : 100)
                        }
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                          phase.progress === 100
                            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {phase.progress === 100 ? 'Mark Incomplete' : 'Mark Done'}
                      </button>
                    </div>
                  </div>

                  {/* Core Objectives */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                      Core Objectives
                    </h3>
                    <div className="space-y-2">
                      {phase.objectives.map((obj, oIdx) => {
                        const key = `${phase.id}-obj-${oIdx}`;
                        const isDone = Boolean(completedItems[key]);
                        return (
                          <button
                            key={oIdx}
                            onClick={() => toggleItem(key)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm transition-colors ${
                              isDone
                                ? 'border-zinc-800/60 bg-zinc-900/20 text-zinc-500 line-through'
                                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 text-zinc-200'
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                isDone
                                  ? 'border-emerald-500 bg-emerald-500 text-black'
                                  : 'border-zinc-600 bg-zinc-800'
                              }`}
                            >
                              {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="leading-relaxed">{obj}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Practical Work */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                      Practical Implementation Work
                    </h3>
                    <div className="space-y-2">
                      {phase.practicalWork.map((pw, pwIdx) => {
                        const key = `${phase.id}-pw-${pwIdx}`;
                        const isDone = Boolean(completedItems[key]);
                        return (
                          <button
                            key={pwIdx}
                            onClick={() => toggleItem(key)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm transition-colors ${
                              isDone
                                ? 'border-zinc-800/60 bg-zinc-900/20 text-zinc-500 line-through'
                                : 'border-indigo-500/20 bg-indigo-950/10 hover:border-indigo-500/40 text-zinc-200'
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                isDone
                                  ? 'border-emerald-500 bg-emerald-500 text-black'
                                  : 'border-indigo-500/60 bg-zinc-800'
                              }`}
                            >
                              {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="leading-relaxed">{pw}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expected Outcome */}
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                      Expected Phase Outcome
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                      {phase.expectedOutcome}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
