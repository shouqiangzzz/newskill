import React from 'react';
import { 
  Flame, 
  Award, 
  Clock, 
  Plus, 
  Sparkles, 
  Network, 
  Radar, 
  Target, 
  ListFilter, 
  BarChart3,
  BookOpen
} from 'lucide-react';
import { DomainCategory, UserStats } from '../types';

interface HeaderProps {
  domains: DomainCategory[];
  activeDomainId: string;
  onSelectDomain: (id: string) => void;
  activeTab: 'tree' | 'radar' | 'milestones' | 'list' | 'analytics';
  onChangeTab: (tab: 'tree' | 'radar' | 'milestones' | 'list' | 'analytics') => void;
  userStats: UserStats;
  onOpenLogPractice: () => void;
  onOpenAddSkill: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  domains,
  activeDomainId,
  onSelectDomain,
  activeTab,
  onChangeTab,
  userStats,
  onOpenLogPractice,
  onOpenAddSkill,
}) => {
  const hoursPracticed = (userStats.totalMinutesPracticed / 60).toFixed(1);

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner / Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/60">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Skill<span className="text-indigo-400 font-extrabold">Matrix</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                  Mastery v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Skill Trees, Competency Matrix & Practice Tracker
              </p>
            </div>
          </div>

          {/* User Progress Stats Badges */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Streak */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">{userStats.currentStreakDays}</span>
                <span className="text-slate-400 ml-1 hidden md:inline">day streak</span>
              </div>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Award className="w-4 h-4 text-purple-400" />
              <div className="text-xs">
                <span className="font-bold text-purple-300">{userStats.totalXp.toLocaleString()}</span>
                <span className="text-slate-400 ml-1 hidden md:inline">XP</span>
              </div>
            </div>

            {/* Total Hours */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div className="text-xs">
                <span className="font-bold text-emerald-300">{hoursPracticed}</span>
                <span className="text-slate-400 ml-1">hrs logged</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogPractice}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Log Practice</span>
              </button>

              <button
                onClick={onOpenAddSkill}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-600 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Tabs & Domain Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 gap-3">
          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => onChangeTab('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'tree'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Skill Tree</span>
            </button>

            <button
              onClick={() => onChangeTab('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'radar'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Competency Radar</span>
            </button>

            <button
              onClick={() => onChangeTab('milestones')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'milestones'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Roadmap & Goals</span>
            </button>

            <button
              onClick={() => onChangeTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'list'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>All Skills Catalog</span>
            </button>

            <button
              onClick={() => onChangeTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Practice Analytics</span>
            </button>
          </nav>

          {/* Domain Category Selector (When in Tree or Radar mode) */}
          {(activeTab === 'tree' || activeTab === 'radar') && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden md:inline">
                Domain:
              </span>
              {domains.map((dom) => {
                const isActive = dom.id === activeDomainId;
                return (
                  <button
                    key={dom.id}
                    onClick={() => onSelectDomain(dom.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
                      isActive
                        ? 'bg-slate-800 text-white border-slate-600 font-semibold shadow-inner'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {dom.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
