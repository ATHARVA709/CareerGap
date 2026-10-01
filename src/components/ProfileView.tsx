import React, { useState } from 'react';
import { User, Sparkles, Plus, Trash2, Clock, Calendar, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types/career';
import { CAREER_PRESETS, POPULAR_CAREER_SUGGESTIONS } from '../lib/defaults';

interface ProfileViewProps {
  currentProfile: UserProfile;
  onSaveAndRegenerate: (newProfile: UserProfile) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentProfile,
  onSaveAndRegenerate,
}) => {
  const [targetCareer, setTargetCareer] = useState<string>(currentProfile.targetCareer);
  const [skills, setSkills] = useState<{ name: string; level: number }[]>(
    currentProfile.currentSkills || []
  );
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<number>(4);
  const [hoursPerDay, setHoursPerDay] = useState<number>(currentProfile.hoursPerDay || 1.5);
  const [timeRemaining, setTimeRemaining] = useState<string>(currentProfile.timeRemaining || '6 months');
  const [experience, setExperience] = useState<string>(currentProfile.experience || '');
  const [projects, setProjects] = useState<string>(currentProfile.projects || '');
  const [preferences, setPreferences] = useState<string>(currentProfile.learningPreferences || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
    setNewSkillLevel(4);
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleUpdateSkillLevel = (idx: number, level: number) => {
    setSkills(
      skills.map((s, i) => (i === idx ? { ...s, level } : s))
    );
  };

  const handleLoadPreset = (presetKey: string) => {
    const found = CAREER_PRESETS.find((p) => p.title.toLowerCase().includes(presetKey.toLowerCase()));
    if (found) {
      setTargetCareer(found.sampleProfile.targetCareer);
      setSkills(found.sampleProfile.currentSkills);
      setHoursPerDay(found.sampleProfile.hoursPerDay);
      setTimeRemaining(found.sampleProfile.timeRemaining);
      setExperience(found.sampleProfile.experience);
      setProjects(found.sampleProfile.projects);
      setPreferences(found.sampleProfile.learningPreferences || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCareer.trim()) {
      setError('Please enter a target career goal.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const updatedProfile: UserProfile = {
        targetCareer: targetCareer.trim(),
        currentSkills: skills,
        hoursPerDay,
        timeRemaining,
        experience,
        projects,
        learningPreferences: preferences,
      };
      await onSaveAndRegenerate(updatedProfile);
    } catch (err: any) {
      setError(err?.message || 'Failed to recalculate career plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <User className="h-3.5 w-3.5" />
          <span>Profile Configuration</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
          Career Profile & Goals
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
          Enter ANY reasonable target career. CareerGap analyzes industry benchmarks and constructs a personalized progression plan.
        </p>
      </div>

      {/* Preset Fast-Loader Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Quick Test Scenarios
          </span>
          <span className="text-[11px] text-zinc-500">1-Click Benchmark Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleLoadPreset('ML Engineer')}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-colors text-left"
          >
            <div>
              <div className="text-xs font-bold text-white">ML Engineer</div>
              <div className="text-[11px] text-zinc-400">Python 7, SQL 5, Stats 3, ML 3</div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
          </button>

          <button
            type="button"
            onClick={() => handleLoadPreset('Cybersecurity')}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-colors text-left"
          >
            <div>
              <div className="text-xs font-bold text-white">Cybersecurity Engineer</div>
              <div className="text-[11px] text-zinc-400">Linux 5, TCP/IP 4, Python 4</div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
          </button>

          <button
            type="button"
            onClick={() => handleLoadPreset('Game Developer')}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-colors text-left"
          >
            <div>
              <div className="text-xs font-bold text-white">Game Developer</div>
              <div className="text-[11px] text-zinc-400">C# 5, Unity 4, 3D Math 3</div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Target Career */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Target Career Goal
            </label>
            <input
              type="text"
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              placeholder="e.g. ML Engineer, Cybersecurity Engineer, Robotics Engineer, Cloud Architect..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white font-semibold placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="text-[11px] font-semibold text-zinc-500 mb-2">Popular Career Roles:</div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CAREER_SUGGESTIONS.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setTargetCareer(role)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    targetCareer.toLowerCase() === role.toLowerCase()
                      ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Current Skills & Levels */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Current Skills & Declared Proficiency (0–10)
            </label>
            <span className="text-xs text-zinc-500">{skills.length} skills listed</span>
          </div>

          <div className="space-y-3">
            {skills.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/70"
              >
                <span className="text-xs font-bold text-white w-40 truncate">{s.name}</span>

                <div className="flex items-center gap-3 flex-1 max-w-sm">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={s.level}
                    onChange={(e) => handleUpdateSkillLevel(idx, parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-white tabular-nums w-4 text-center">
                    {s.level}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add skill input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. SQL, Git, Linux, Docker)..."
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              min="0"
              max="10"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(parseInt(e.target.value, 10) || 0)}
              className="w-16 rounded-xl border border-zinc-800 bg-zinc-900 px-2 py-2 text-xs text-center font-mono font-bold text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 3: Time constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Daily Available Hours
              </span>
              <span className="font-mono text-indigo-300 tabular-nums font-bold">
                {hoursPerDay} hrs / day
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.25"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span>30m</span>
              <span>1.5h</span>
              <span>3.0h</span>
              <span>6.0h</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                Time Remaining to Goal
              </span>
            </div>
            <input
              type="text"
              value={timeRemaining}
              onChange={(e) => setTimeRemaining(e.target.value)}
              placeholder="e.g. 6 months, 16 weeks, 1 year"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              {['3 months', '6 months', '9 months', '1 year'].map((term) => (
                <button
                  type="button"
                  key={term}
                  onClick={() => setTimeRemaining(term)}
                  className={`text-[11px] px-2 py-1 rounded-lg border transition-colors ${
                    timeRemaining.toLowerCase() === term.toLowerCase()
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Experience, Projects & Preferences */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Current Education & Experience
            </label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. Computer Science student, or Self-taught programmer with 1 year experience"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Completed Projects
            </label>
            <input
              type="text"
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              placeholder="e.g. Built 2 Python CLI tools, 1 basic CRUD app, Titanic dataset analysis"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Learning Preferences (Optional)
            </label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. Hands-on coding with projects, rigorous mathematical intuition, video-based"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Career Blueprint & Roadmap with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Recalculate Career Plan & Roadmap</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
