import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Clock, Target } from 'lucide-react';
import { Mission } from '../types/career';

interface MissionFocusModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (elapsedHours: number) => void;
}

export const MissionFocusModal: React.FC<MissionFocusModalProps> = ({
  mission,
  isOpen,
  onClose,
  onComplete,
}) => {
  const initialSeconds = (mission.timeMinutes || 60) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setSecondsRemaining((mission.timeMinutes || 60) * 60);
    setIsActive(true);
    setCheckedTasks({});
  }, [mission]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => Math.max(0, sec - 1));
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const toggleTask = (idx: number) => {
    setCheckedTasks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleFinish = () => {
    const elapsedSeconds = initialSeconds - secondsRemaining;
    const elapsedHours = Math.max(0.25, Math.round((elapsedSeconds / 3600) * 10) / 10);
    onComplete(elapsedHours);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          title="Minimize session"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Active Study Mission
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-xs text-zinc-400">{mission.timeMinutes} min target</span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">{mission.title}</h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
          <strong className="text-indigo-400">Why now:</strong> {mission.why}
        </p>

        {/* Timer display */}
        <div className="my-6 flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="font-mono text-4xl sm:text-5xl font-bold text-white tracking-tight tabular-nums">
            {formattedTime}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              {isActive ? (
                <>
                  <Pause className="h-3.5 w-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Resume
                </>
              )}
            </button>
            <button
              onClick={() => {
                setSecondsRemaining(initialSeconds);
                setIsActive(false);
              }}
              className="rounded-lg bg-zinc-800/60 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Task checklist */}
        <div className="mb-6">
          <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <Target className="h-3.5 w-3.5 text-indigo-400" />
            <span>Mission Deliverables</span>
          </div>
          <div className="space-y-2">
            {mission.tasks.map((task, idx) => {
              const done = Boolean(checkedTasks[idx]);
              return (
                <button
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`w-full flex items-start gap-3 rounded-lg p-2.5 text-left text-xs sm:text-sm transition-colors border ${
                    done
                      ? 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 line-through'
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      done
                        ? 'border-emerald-500 bg-emerald-500 text-black'
                        : 'border-zinc-600 bg-zinc-800'
                    }`}
                  >
                    {done && <CheckCircle2 className="h-3 w-3" />}
                  </div>
                  <span className="leading-snug">{task}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-lg px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Minimize
          </button>
          <button
            onClick={handleFinish}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Complete Mission</span>
          </button>
        </div>
      </div>
    </div>
  );
};
