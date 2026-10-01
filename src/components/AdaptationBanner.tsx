import React from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { RoadmapAdaptation } from '../types/career';

interface AdaptationBannerProps {
  adaptation: RoadmapAdaptation | null;
  onDismiss: () => void;
  onViewRoadmap: () => void;
}

export const AdaptationBanner: React.FC<AdaptationBannerProps> = ({
  adaptation,
  onDismiss,
  onViewRoadmap,
}) => {
  if (!adaptation) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-indigo-950/30 p-4 sm:p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Roadmap Updated</span>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs text-zinc-400">Adaptive Intelligence</span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-zinc-200 font-medium">
              {adaptation.whatChanged}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              <span className="text-zinc-300 font-medium">Why:</span> {adaptation.whyItChanged}
            </p>
            {adaptation.nextSteps && (
              <div className="mt-2 text-xs text-indigo-300 flex items-center gap-1.5 font-medium">
                <span>Next step:</span>
                <span>{adaptation.nextSteps}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onViewRoadmap}
            className="flex items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            <span>View Timeline</span>
            <ArrowRight className="h-3 w-3" />
          </button>
          <button
            onClick={onDismiss}
            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
