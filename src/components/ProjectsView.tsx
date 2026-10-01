import React, { useState } from 'react';
import { FolderGit2, Sparkles, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { CareerPlanState } from '../types/career';

interface ProjectsViewProps {
  plan: CareerPlanState;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ plan }) => {
  const [projectStatus, setProjectStatus] = useState<Record<string, 'not_started' | 'in_progress' | 'completed'>>({});

  const toggleStatus = (id: string) => {
    setProjectStatus((prev) => {
      const current = prev[id] || 'not_started';
      if (current === 'not_started') return { ...prev, [id]: 'in_progress' };
      if (current === 'in_progress') return { ...prev, [id]: 'completed' };
      return { ...prev, [id]: 'not_started' };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>Practical Portfolio</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            High-Impact Practical Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Resume-worthy, demonstrable projects engineered specifically for {plan.profile.targetCareer} interviews.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.projects.map((proj, idx) => {
          const status = projectStatus[proj.id] || 'not_started';

          return (
            <div
              key={proj.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-colors ${
                status === 'completed'
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : status === 'in_progress'
                  ? 'border-indigo-500/40 bg-zinc-900/80 shadow-lg'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-400">{proj.difficulty}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {proj.estimatedTime}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : status === 'in_progress'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white tracking-tight mb-2">
                  {proj.title}
                </h2>

                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {proj.skillsDeveloped.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] font-medium text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-zinc-300">Why it accelerates hiring: </span>
                    <span className="text-zinc-400 leading-relaxed">{proj.whyItHelps}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60">
                    <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5" />
                      Concrete Deliverable
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-mono">
                      {proj.deliverable}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {status === 'completed'
                    ? 'Deliverable verified'
                    : status === 'in_progress'
                    ? 'Currently building'
                    : 'Ready to start'}
                </span>
                <button
                  onClick={() => toggleStatus(proj.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    status === 'completed'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : status === 'in_progress'
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white'
                  }`}
                >
                  {status === 'completed'
                    ? 'Mark Incomplete'
                    : status === 'in_progress'
                    ? 'Mark Completed'
                    : 'Start Building'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
