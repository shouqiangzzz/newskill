import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { DomainCategory, SkillLevel, SkillNode } from '../types';
import { LEVEL_CONFIG, checkIsSkillUnlocked } from '../data/initialData';

interface SkillListViewProps {
  skills: SkillNode[];
  domains: DomainCategory[];
  onSelectSkill: (skill: SkillNode) => void;
  onLogPractice: (skill: SkillNode) => void;
  onQuickAddXp: (skillId: string, amount: number) => void;
}

export const SkillListView: React.FC<SkillListViewProps> = ({
  skills,
  domains,
  onSelectSkill,
  onLogPractice,
  onQuickAddXp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'xp-desc' | 'xp-asc' | 'time-desc' | 'name' | 'recent'>('xp-desc');

  const filteredSkills = useMemo(() => {
    return skills
      .filter((skill) => {
        const matchesSearch =
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDomain = selectedDomain === 'all' || skill.domainId === selectedDomain;
        const matchesTier = selectedTier === 'all' || skill.level === selectedTier;

        return matchesSearch && matchesDomain && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'xp-desc') return b.currentXp - a.currentXp;
        if (sortBy === 'xp-asc') return a.currentXp - b.currentXp;
        if (sortBy === 'time-desc') return b.totalTimeMinutes - a.totalTimeMinutes;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'recent') {
          return (b.lastPracticed || '').localeCompare(a.lastPracticed || '');
        }
        return 0;
      });
  }, [skills, searchTerm, selectedDomain, selectedTier, sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skills by name, framework, or concept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Domain Filter */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full md:w-48 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full md:w-40 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Tiers</option>
              {(['master', 'advanced', 'intermediate', 'apprentice', 'novice'] as SkillLevel[]).map((t) => (
                <option key={t} value={t}>
                  {LEVEL_CONFIG[t].label}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-44 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="xp-desc">Highest XP</option>
              <option value="xp-asc">Lowest XP</option>
              <option value="time-desc">Most Time Logged</option>
              <option value="recent">Recently Practiced</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Found {filteredSkills.length} skills</span>
          <span className="font-mono">
            Total XP: {filteredSkills.reduce((a, b) => a + b.currentXp, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grid of Skill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const isUnlocked = checkIsSkillUnlocked(skill, skills);
          const levelInfo = LEVEL_CONFIG[isUnlocked ? skill.level : 'locked'];
          const domain = domains.find((d) => d.id === skill.domainId);
          const nextTarget = LEVEL_CONFIG[skill.targetLevel]?.minXp || 2601;
          const pct = Math.min(100, Math.round((skill.currentXp / nextTarget) * 100));

          return (
            <div
              key={skill.id}
              onClick={() => onSelectSkill(skill)}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {domain?.name || skill.category}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    style={{
                      color: levelInfo.color,
                      borderColor: `${levelInfo.color}40`,
                      backgroundColor: `${levelInfo.color}15`,
                    }}
                  >
                    {levelInfo.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {skill.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{skill.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-indigo-400">
                    {skill.currentXp.toLocaleString()} XP
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {(skill.totalTimeMinutes / 60).toFixed(1)} hrs logged
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: levelInfo.color }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {skill.subSkills.filter((s) => s.completed).length} / {skill.subSkills.length} mastered
                    </span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogPractice(skill);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
                  >
                    + Practice
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
