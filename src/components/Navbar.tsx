import React from 'react';
import { LayoutDashboard, Compass, Layers, LineChart, FolderGit2, User, Sparkles } from 'lucide-react';

export type NavTab = 'dashboard' | 'roadmap' | 'skills' | 'progress' | 'projects' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  targetCareer: string;
  onOpenAdaptModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  targetCareer,
  onOpenAdaptModal,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'skills', label: 'Skills', icon: Layers },
    { id: 'progress', label: 'Progress', icon: LineChart },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left font-bold text-lg tracking-tight text-white hover:text-zinc-200 transition-colors focus:outline-none"
          >
            CareerGap
          </button>
          <span className="hidden sm:inline text-xs text-zinc-500" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-xs font-medium text-zinc-400 truncate max-w-[200px]">
            {targetCareer}
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors rounded-md focus:outline-none ${
                  isActive
                    ? 'text-white bg-zinc-800/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdaptModal}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm whitespace-nowrap"
            title="Adapt roadmap to updated hours or progress"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Adapt Roadmap</span>
            <span className="md:hidden">Adapt</span>
          </button>
        </div>
      </div>
    </header>
  );
};
