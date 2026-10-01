import React, { useState } from 'react';
import { X, Sparkles, Clock, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { UserProfile } from '../types/career';

interface AdaptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onAdapt: (newHours: number, newTimeRemaining: string, customReason?: string) => Promise<void>;
}

export const AdaptModal: React.FC<AdaptModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onAdapt,
}) => {
  const [hours, setHours] = useState<number>(currentProfile.hoursPerDay || 1.5);
  const [timeRemaining, setTimeRemaining] = useState<string>(currentProfile.timeRemaining || '6 months');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onAdapt(hours, timeRemaining, reason);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to adapt roadmap. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickPresets = [
    { label: 'Time Crunch (45 min/day)', hours: 0.75, note: 'Exams or heavy workload' },
    { label: 'Standard Pace (1.5 hrs/day)', hours: 1.5, note: 'Balanced progression' },
    { label: 'Accelerated Sprint (3.0 hrs/day)', hours: 3.0, note: 'Intensive immersion' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Adaptive Intelligence</span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Adapt Career Roadmap</h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          CareerGap keeps your roadmap aligned with your real-world schedule and skill progression.
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Quick preset buttons */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Quick Schedule Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setHours(preset.hours);
                    setReason(preset.note);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors text-xs ${
                    hours === preset.hours
                      ? 'border-indigo-500 bg-indigo-950/30 text-white'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="font-semibold">{preset.hours}h / day</div>
                  <div className="text-[11px] text-zinc-400">{preset.note}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily hours slider & input */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Available Study Time Per Day
              </span>
              <span className="font-mono text-indigo-300 font-bold tabular-nums">
                {hours} {hours === 1 ? 'hour' : 'hours'} / day
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.25"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span>30 mins</span>
              <span>2 hours</span>
              <span>4 hours</span>
              <span>6 hours</span>
            </div>
          </div>

          {/* Time remaining */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                Time Remaining to Goal
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {['2 months', '4 months', '6 months', '9 months'].map((term) => (
                <button
                  type="button"
                  key={term}
                  onClick={() => setTimeRemaining(term)}
                  className={`py-2 px-2.5 rounded-lg border text-center text-xs font-medium transition-colors ${
                    timeRemaining.toLowerCase() === term.toLowerCase()
                      ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={timeRemaining}
              onChange={(e) => setTimeRemaining(e.target.value)}
              placeholder="Or type custom time (e.g. 14 weeks)"
              className="w-full mt-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Optional reason / context */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Context for AI (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Reduced study hours due to semester finals, or already finished basic python"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Adapting with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Update & Adapt Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
