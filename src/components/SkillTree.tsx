import React, { useMemo } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  Plus, 
  Sparkles,
  Info
} from 'lucide-react';
import { DomainCategory, SkillLevel, SkillNode } from '../types';
import { LEVEL_CONFIG, checkIsSkillUnlocked } from '../data/initialData';

interface SkillTreeProps {
  domain: DomainCategory;
  skills: SkillNode[];
  onSelectSkill: (skill: SkillNode) => void;
  onQuickLogPractice: (skill: SkillNode) => void;
  onAddSkillToDomain: () => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  domain,
  skills,
  onSelectSkill,
  onQuickLogPractice,
  onAddSkillToDomain,
}) => {
  const domainSkills = useMemo(() => {
    return skills.filter((s) => s.domainId === domain.id);
  }, [skills, domain.id]);

  // Compute connections between prerequisites and children
  const connections = useMemo(() => {
    const list: { from: SkillNode; to: SkillNode; isUnlocked: boolean }[] = [];
    domainSkills.forEach((child) => {
      child.prerequisiteIds.forEach((parentPrereqId) => {
        const parent = domainSkills.find((s) => s.id === parentPrereqId);
        if (parent) {
          const isUnlocked = checkIsSkillUnlocked(child, skills);
          list.push({ from: parent, to: child, isUnlocked });
        }
      });
    });
    return list;
  }, [domainSkills, skills]);

  // Calculate canvas dimensions based on max position
  const canvasBounds = useMemo(() => {
    let maxX = 900;
    let maxY = 450;
    domainSkills.forEach((s) => {
      if (s.position.x + 280 > maxX) maxX = s.position.x + 280;
      if (s.position.y + 240 > maxY) maxY = s.position.y + 240;
    });
    return { width: Math.max(maxX, 960), height: Math.max(maxY, 520) };
  }, [domainSkills]);

  return (
    <div className="space-y-6">
      {/* Domain Header Card */}
      <div className={`rounded-2xl p-6 bg-gradient-to-r ${domain.bgGradient} border border-slate-800 relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: domain.color }}></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Track & Skill Tree</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{domain.name}</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">{domain.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-right">
              <div className="text-xs text-slate-400">Total Skills</div>
              <div className="text-lg font-bold text-white">{domainSkills.length}</div>
            </div>
            <button
              onClick={onAddSkillToDomain}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Add Node</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tree View Canvas */}
      <div className="relative bg-slate-950/80 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl skill-grid-bg min-h-[540px]">
        {/* Helper info bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-sm">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any node to view milestones, checklist & practice history</span>
        </div>

        {/* Tree Container with fixed coordinate layout */}
        <div 
          className="relative p-8"
          style={{ width: `${canvasBounds.width}px`, height: `${canvasBounds.height}px` }}
        >
          {/* SVG Connection Lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: `${canvasBounds.width}px`, height: `${canvasBounds.height}px` }}
          >
            <defs>
              <linearGradient id="lineGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="lineGradLocked" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {connections.map((conn, idx) => {
              // Calculate center right of parent and center left of child
              const startX = conn.from.position.x + 240;
              const startY = conn.from.position.y + 75;
              const endX = conn.to.position.x;
              const endY = conn.to.position.y + 75;

              // Cubic bezier curve path
              const dx = Math.abs(endX - startX) * 0.55;
              const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

              return (
                <g key={`conn-${idx}`}>
                  {/* Outer glow stroke for unlocked paths */}
                  {conn.isUnlocked && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="5"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Main connection line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={conn.isUnlocked ? 'url(#lineGradActive)' : 'url(#lineGradLocked)'}
                    strokeWidth={conn.isUnlocked ? '2.5' : '1.5'}
                    strokeDasharray={conn.isUnlocked ? undefined : '5,5'}
                    strokeLinecap="round"
                  />
                  {/* Node junction dots */}
                  <circle cx={startX} cy={startY} r="3" fill={conn.isUnlocked ? '#818cf8' : '#64748b'} />
                  <circle cx={endX} cy={endY} r="3" fill={conn.isUnlocked ? '#c084fc' : '#475569'} />
                </g>
              );
            })}
          </svg>

          {/* Skill Nodes */}
          {domainSkills.map((skill) => {
            const isUnlocked = checkIsSkillUnlocked(skill, skills);
            const levelInfo = LEVEL_CONFIG[isUnlocked ? skill.level : 'locked'];
            const completedSubCount = skill.subSkills.filter((s) => s.completed).length;
            const totalSubCount = skill.subSkills.length;
            
            // Progress toward next level
            const nextLevelTargetXp = LEVEL_CONFIG[skill.targetLevel]?.minXp || 2601;
            const progressPercent = Math.min(100, Math.round((skill.currentXp / nextLevelTargetXp) * 100));

            return (
              <div
                key={skill.id}
                onClick={() => onSelectSkill(skill)}
                className={`absolute w-[240px] rounded-xl border transition-all duration-200 cursor-pointer select-none group shadow-lg ${
                  isUnlocked
                    ? 'bg-slate-900/95 hover:bg-slate-800/95 border-slate-700/80 hover:border-indigo-500/80 hover:shadow-indigo-500/10 hover:-translate-y-1'
                    : 'bg-slate-950/80 border-slate-800/80 opacity-70 hover:opacity-90'
                }`}
                style={{
                  left: `${skill.position.x}px`,
                  top: `${skill.position.y}px`,
                }}
              >
                {/* Node Card Header */}
                <div className="p-3.5 pb-2">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-slate-400">
                      {skill.category}
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

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {skill.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {skill.tagline}
                  </p>
                </div>

                {/* Progress & Stats Bar */}
                <div className="px-3.5 py-2 border-t border-slate-800/80 bg-slate-950/50">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400 font-mono">
                      {isUnlocked ? `${skill.currentXp.toLocaleString()} XP` : 'Prereq Required'}
                    </span>
                    <span className="text-slate-400 font-semibold text-[10px]">
                      {isUnlocked ? `${progressPercent}%` : 'Locked'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: isUnlocked ? `${progressPercent}%` : '0%',
                        backgroundColor: levelInfo.color,
                      }}
                    />
                  </div>

                  {/* Subskills & Quick Actions */}
                  <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      <span>{completedSubCount}/{totalSubCount} items</span>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickLogPractice(skill);
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold px-1.5 py-0.5 rounded hover:bg-indigo-950/60 transition-colors"
                      >
                        + Log XP
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-amber-400/80">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Legend & Guide */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">Mastery Tiers:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {(['novice', 'apprentice', 'intermediate', 'advanced', 'master'] as SkillLevel[]).map((tier) => {
            const conf = LEVEL_CONFIG[tier];
            return (
              <div key={tier} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.color }}></span>
                <span className="text-slate-300 font-medium">{conf.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">({conf.minXp}+ XP)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
