import React, { useMemo, useState } from 'react';
import { DomainCategory, SkillLevel, SkillNode } from '../types';
import { LEVEL_CONFIG } from '../data/initialData';
import { Award, Zap, Target, TrendingUp, Info } from 'lucide-react';

interface SkillRadarChartProps {
  domain: DomainCategory;
  skills: SkillNode[];
  onSelectSkill: (skill: SkillNode) => void;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  domain,
  skills,
  onSelectSkill,
}) => {
  const domainSkills = useMemo(() => {
    return skills.filter((s) => s.domainId === domain.id);
  }, [skills, domain.id]);

  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  // SVG Radar setup
  const size = 380;
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = Math.max(domainSkills.length, 3);
  const angleStep = (Math.PI * 2) / numAxes;

  // Maximum XP benchmark for the chart scale (e.g. 3000 XP)
  const maxBenchmarkXp = 3000;

  // Calculate polygon points for current XP
  const { currentPolygonPoints, vertexCoordinates } = useMemo(() => {
    const points: string[] = [];
    const coords: { x: number; y: number; skill: SkillNode; ratio: number }[] = [];

    domainSkills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const ratio = Math.min(1, Math.max(0.08, skill.currentXp / maxBenchmarkXp));
      const x = center + radius * ratio * Math.cos(angle);
      const y = center + radius * ratio * Math.sin(angle);
      points.push(`${x},${y}`);
      coords.push({ x, y, skill, ratio });
    });

    return {
      currentPolygonPoints: points.join(' '),
      vertexCoordinates: coords,
    };
  }, [domainSkills, angleStep, center, radius, maxBenchmarkXp]);

  // Tier distributions in this domain
  const tierCounts = useMemo(() => {
    const counts: Record<SkillLevel, number> = {
      locked: 0,
      novice: 0,
      apprentice: 0,
      intermediate: 0,
      advanced: 0,
      master: 0,
    };
    domainSkills.forEach((s) => {
      counts[s.level] = (counts[s.level] || 0) + 1;
    });
    return counts;
  }, [domainSkills]);

  const totalDomainXp = domainSkills.reduce((acc, s) => acc + s.currentXp, 0);

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className={`p-6 rounded-2xl bg-gradient-to-r ${domain.bgGradient} border border-slate-800`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: domain.color }}></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Competency Assessment
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{domain.name} Radar</h2>
            <p className="text-sm text-slate-300 mt-1">
              Multidimensional skill assessment matrix mapping depth across foundational and specialized competencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-right">
              <div className="text-xs text-slate-400">Domain Total XP</div>
              <div className="text-lg font-bold text-indigo-400 font-mono">
                {totalDomainXp.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SVG Radar Canvas */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Skill Balance Matrix</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Benchmark: 3,000 XP Master</span>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <svg width={size} height={size} className="overflow-visible select-none">
              {/* Radar concentric rings (20%, 40%, 60%, 80%, 100%) */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
                const ringRadius = radius * level;
                return (
                  <circle
                    key={`ring-${level}`}
                    cx={center}
                    cy={center}
                    r={ringRadius}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray={level === 1.0 ? undefined : '3,3'}
                    strokeOpacity={level === 1.0 ? 0.8 : 0.4}
                  />
                );
              })}

              {/* Radial spokes */}
              {domainSkills.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const endX = center + radius * Math.cos(angle);
                const endY = center + radius * Math.sin(angle);
                return (
                  <line
                    key={`spoke-${i}`}
                    x1={center}
                    y1={center}
                    x2={endX}
                    y2={endY}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeOpacity={0.6}
                  />
                );
              })}

              {/* Benchmark perimeter reference (Master tier 2600 XP) */}
              <polygon
                points={domainSkills
                  .map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const r = radius * (2600 / maxBenchmarkXp);
                    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="4,4"
                strokeOpacity="0.4"
              />

              {/* Current XP filled polygon */}
              {currentPolygonPoints && (
                <polygon
                  points={currentPolygonPoints}
                  fill="#6366f1"
                  fillOpacity="0.3"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
              )}

              {/* Interactive vertices */}
              {vertexCoordinates.map(({ x, y, skill }) => {
                const isHovered = hoveredSkillId === skill.id;
                const tierColor = LEVEL_CONFIG[skill.level]?.color || '#818cf8';

                return (
                  <g
                    key={`vertex-${skill.id}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredSkillId(skill.id)}
                    onMouseLeave={() => setHoveredSkillId(null)}
                    onClick={() => onSelectSkill(skill)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 7 : 4.5}
                      fill={tierColor}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />
                    {isHovered && (
                      <circle
                        cx={x}
                        cy={y}
                        r={12}
                        fill="none"
                        stroke={tierColor}
                        strokeWidth="1.5"
                        strokeOpacity="0.6"
                      />
                    )}
                  </g>
                );
              })}

              {/* Labels around perimeter */}
              {domainSkills.map((skill, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const labelRadius = radius + 28;
                const lx = center + labelRadius * Math.cos(angle);
                const ly = center + labelRadius * Math.sin(angle);
                const isHovered = hoveredSkillId === skill.id;

                let textAnchor: 'middle' | 'start' | 'end' = 'middle';
                if (Math.cos(angle) > 0.3) textAnchor = 'start';
                if (Math.cos(angle) < -0.3) textAnchor = 'end';

                return (
                  <text
                    key={`label-${skill.id}`}
                    x={lx}
                    y={ly + 4}
                    textAnchor={textAnchor}
                    className={`text-[11px] font-semibold transition-colors cursor-pointer select-none ${
                      isHovered ? 'fill-indigo-300 font-bold' : 'fill-slate-300'
                    }`}
                    onClick={() => onSelectSkill(skill)}
                    onMouseEnter={() => setHoveredSkillId(skill.id)}
                    onMouseLeave={() => setHoveredSkillId(null)}
                  >
                    {skill.name.split(' ')[0]}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hover on vertices to inspect. Click on any skill to open details.</span>
          </div>
        </div>

        {/* Right: Competency breakdown & Tier Summary */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Tier Counts Cards */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Mastery Tier Distribution
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['master', 'advanced', 'intermediate', 'apprentice', 'novice'] as SkillLevel[]).map((tier) => {
                const conf = LEVEL_CONFIG[tier];
                const count = tierCounts[tier] || 0;
                return (
                  <div
                    key={tier}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center text-center"
                  >
                    <span
                      className="text-lg font-extrabold font-mono"
                      style={{ color: conf.color }}
                    >
                      {count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">{conf.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill List in this domain with mini progress */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Skill Proficiency Breakdown
            </h3>
            <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
              {domainSkills.map((s) => {
                const conf = LEVEL_CONFIG[s.level];
                const isHovered = hoveredSkillId === s.id;
                const nextTierTarget = LEVEL_CONFIG[s.targetLevel]?.minXp || 2601;
                const pct = Math.min(100, Math.round((s.currentXp / nextTierTarget) * 100));

                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectSkill(s)}
                    onMouseEnter={() => setHoveredSkillId(s.id)}
                    onMouseLeave={() => setHoveredSkillId(null)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isHovered
                        ? 'bg-slate-800 border-indigo-500/50 shadow-md'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: conf.color }}></span>
                        <span className="text-xs font-bold text-white truncate">{s.name}</span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          color: conf.color,
                          backgroundColor: `${conf.color}15`,
                        }}
                      >
                        {conf.badge}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono">{s.currentXp.toLocaleString()} XP</span>
                      <span>{pct}% to next</span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: conf.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
