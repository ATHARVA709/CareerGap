import React, { useState } from 'react';
import { Layers, Plus, Trash2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CareerPlanState, SkillItem } from '../types/career';
import { formatGapLabel, calculateReadiness, determinePriority } from '../lib/readiness';

interface SkillsViewProps {
  plan: CareerPlanState;
  onUpdateSkillLevel: (skillId: string, newLevel: number) => void;
  onAddSkill: (name: string, level: number, requiredLevel?: number) => void;
  onRemoveSkill: (skillId: string) => void;
  onAdaptWithUpdatedSkills: () => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  plan,
  onUpdateSkillLevel,
  onAddSkill,
  onRemoveSkill,
  onAdaptWithUpdatedSkills,
}) => {
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<number>(3);
  const [filter, setFilter] = useState<'all' | 'high' | 'mastered'>('all');

  const currentReadiness = calculateReadiness(plan.skills);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    onAddSkill(newSkillName.trim(), newSkillLevel, Math.min(10, newSkillLevel + 3));
    setNewSkillName('');
    setNewSkillLevel(3);
  };

  const filteredSkills = plan.skills.filter((s) => {
    if (filter === 'high') return s.priority === 'High';
    if (filter === 'mastered') return s.currentLevel >= s.requiredLevel;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with live readiness metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Layers className="h-3.5 w-3.5" />
            <span>Skill Matrix & Gaps</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Target Skill Profile
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Adjust your declared proficiency levels (0–10). CareerGap continuously recalculates your readiness and adapts the roadmap accordingly.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-right">
            <div className="text-[11px] text-zinc-400 font-semibold uppercase">Career Readiness</div>
            <div className="font-mono text-2xl font-extrabold text-white tabular-nums">
              {currentReadiness}%
            </div>
          </div>

          <button
            onClick={onAdaptWithUpdatedSkills}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm whitespace-nowrap"
            title="Recalculate roadmap based on updated skill proficiencies"
          >
            <Sparkles className="h-4 w-4" />
            <span>Re-evaluate Roadmap</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Skills ({plan.skills.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'high'
                ? 'bg-zinc-800 text-rose-300 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            High Priority ({plan.skills.filter((s) => s.priority === 'High').length})
          </button>
          <button
            onClick={() => setFilter('mastered')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'mastered'
                ? 'bg-zinc-800 text-emerald-300 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mastered ({plan.skills.filter((s) => s.currentLevel >= s.requiredLevel).length})
          </button>
        </div>
      </div>

      {/* Skills Matrix Table / Card List */}
      <div className="space-y-3">
        {filteredSkills.map((skill) => {
          const isMastered = skill.currentLevel >= skill.requiredLevel;
          const isHigh = skill.priority === 'High';
          const gapLabel = formatGapLabel(skill.currentLevel, skill.requiredLevel);
          const currentPct = (skill.currentLevel / 10) * 100;
          const requiredPct = (skill.requiredLevel / 10) * 100;

          return (
            <div
              key={skill.id}
              className={`rounded-xl border p-4 sm:p-5 transition-colors ${
                isMastered
                  ? 'border-emerald-500/20 bg-emerald-950/10'
                  : isHigh
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{skill.name}</span>
                      {isMastered ? (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Mastered
                        </span>
                      ) : isHigh ? (
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                          High Priority Gap
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-zinc-400 uppercase">
                          {skill.priority} Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">Level:</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {skill.currentLevel}/10
                    </span>
                    <span className="text-zinc-600">→</span>
                    <span className="text-zinc-400">Required:</span>
                    <span className="font-mono font-bold text-indigo-300 tabular-nums">
                      {skill.requiredLevel}/10
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveSkill(skill.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Remove skill"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Dual level visual indicator */}
              <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden mb-3">
                <div
                  className="absolute top-0 bottom-0 bg-zinc-700/60 rounded-full"
                  style={{ width: `${requiredPct}%` }}
                />
                <div
                  className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ${
                    isMastered
                      ? 'bg-emerald-500'
                      : isHigh
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${currentPct}%` }}
                />
              </div>

              {/* Slider to adjust level in real-time */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-[11px] font-medium text-zinc-400">
                  Update proficiency:
                </span>
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={skill.currentLevel}
                    onChange={(e) =>
                      onUpdateSkillLevel(skill.id, parseInt(e.target.value, 10))
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-white tabular-nums w-4 text-center">
                    {skill.currentLevel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Custom Skill Card */}
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="flex-1">
          <input
            type="text"
            placeholder="Add custom skill (e.g. Docker, PyTorch, GraphQL, AWS)..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Level:</span>
            <input
              type="number"
              min="0"
              max="10"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(parseInt(e.target.value, 10) || 0)}
              className="w-14 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-2 text-center text-xs font-mono font-bold text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Skill</span>
          </button>
        </div>
      </form>
    </div>
  );
};
