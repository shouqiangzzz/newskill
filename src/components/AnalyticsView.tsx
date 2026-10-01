import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  Award, 
  Calendar, 
  TrendingUp, 
  Zap,
  Activity
} from 'lucide-react';
import { PracticeSession, DomainCategory, SkillNode } from '../types';

interface AnalyticsViewProps {
  sessions: PracticeSession[];
  domains: DomainCategory[];
  skills: SkillNode[];
  userStats: {
    totalXp: number;
    currentStreakDays: number;
    totalMinutesPracticed: number;
  };
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sessions,
  domains,
  skills,
  userStats,
}) => {
  // Generate 35-day activity calendar
  const activityDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; count: number; minutes: number }[] = [];
    const today = new Date();

    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const matchingSessions = sessions.filter((s) => s.date === dateStr);
      const totalMins = matchingSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

      days.push({
        dateStr,
        dayNum: d.getDate(),
        count: matchingSessions.length,
        minutes: totalMins,
      });
    }
    return days;
  }, [sessions]);

  // Domain XP and Time distribution
  const domainDistributions = useMemo(() => {
    return domains.map((domain) => {
      const domainSkills = skills.filter((s) => s.domainId === domain.id);
      const totalXp = domainSkills.reduce((acc, s) => acc + s.currentXp, 0);
      const totalMins = domainSkills.reduce((acc, s) => acc + s.totalTimeMinutes, 0);
      return {
        ...domain,
        totalXp,
        totalMins,
      };
    });
  }, [domains, skills]);

  const maxDomainXp = Math.max(...domainDistributions.map((d) => d.totalXp), 1);

  // Intensity counts
  const intensityBreakdown = useMemo(() => {
    const counts = { light: 0, moderate: 0, deep: 0, breakthrough: 0 };
    sessions.forEach((s) => {
      counts[s.intensity] = (counts[s.intensity] || 0) + 1;
    });
    return counts;
  }, [sessions]);

  const avgSessionMins = sessions.length > 0 
    ? Math.round(userStats.totalMinutesPracticed / sessions.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {userStats.currentStreakDays} <span className="text-xs font-normal text-slate-400">days</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Mastery XP</div>
            <div className="text-2xl font-extrabold text-indigo-400 font-mono">
              {userStats.totalXp.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Practice Time</div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {(userStats.totalMinutesPracticed / 60).toFixed(1)} <span className="text-xs font-normal text-slate-400">hrs</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Avg Session</div>
            <div className="text-2xl font-extrabold text-purple-400 font-mono">
              {avgSessionMins} <span className="text-xs font-normal text-slate-400">mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* 35-Day Practice Activity Heatmap */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Daily Deliberate Practice Activity</h3>
          </div>
          <span className="text-xs text-slate-400">Past 35 Days</span>
        </div>

        {/* Heatmap blocks */}
        <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-7 gap-2 pt-2">
          {activityDays.map((day) => {
            let bgClass = 'bg-slate-950/80 border-slate-800/80';
            if (day.minutes > 0 && day.minutes < 45) {
              bgClass = 'bg-indigo-950 border-indigo-700/50 text-indigo-200';
            } else if (day.minutes >= 45 && day.minutes < 90) {
              bgClass = 'bg-indigo-700 border-indigo-500 text-white';
            } else if (day.minutes >= 90) {
              bgClass = 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/30';
            }

            return (
              <div
                key={day.dateStr}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${bgClass} hover:scale-105 select-none`}
                title={`${day.dateStr}: ${day.minutes} minutes (${day.count} sessions)`}
              >
                <span className="text-[10px] font-mono opacity-80">{day.dateStr.slice(5)}</span>
                <span className="text-xs font-bold font-mono mt-0.5">
                  {day.minutes > 0 ? `${day.minutes}m` : '—'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 text-[11px] text-slate-400 pt-2">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
            <div className="w-3 h-3 rounded bg-indigo-950 border border-indigo-700/50" />
            <div className="w-3 h-3 rounded bg-indigo-700 border border-indigo-500" />
            <div className="w-3 h-3 rounded bg-indigo-500 border border-indigo-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Competency by Domain</span>
            </h3>
            <span className="text-xs text-slate-400">Total XP Accumulated</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {domainDistributions.map((domain) => {
              const widthPct = Math.round((domain.totalXp / maxDomainXp) * 100);
              return (
                <div key={domain.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{domain.name}</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {domain.totalXp.toLocaleString()} XP ({((domain.totalMins) / 60).toFixed(1)} hrs)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%`, backgroundColor: domain.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intensity Breakdown & Recent Sessions */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Session Intensity Focus</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Light</span>
                <div className="text-lg font-bold text-sky-400 font-mono">{intensityBreakdown.light}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Moderate</span>
                <div className="text-lg font-bold text-emerald-400 font-mono">{intensityBreakdown.moderate}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Deep</span>
                <div className="text-lg font-bold text-indigo-400 font-mono">{intensityBreakdown.deep}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Breakthrough</span>
                <div className="text-lg font-bold text-purple-400 font-mono">{intensityBreakdown.breakthrough}</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Latest Practice Logs
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sessions.slice(0, 4).map((sess) => (
                <div
                  key={sess.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-white truncate block">{sess.skillName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{sess.date} • {sess.durationMinutes} mins</span>
                  </div>
                  <span className="text-purple-400 font-mono font-bold flex-shrink-0">
                    +{sess.xpEarned} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
