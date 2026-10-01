import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  Award, 
  Trash2, 
  Sparkles,
  Clock
} from 'lucide-react';
import { Milestone, SkillNode, DomainCategory } from '../types';

interface RoadmapMilestonesProps {
  milestones: Milestone[];
  skills: SkillNode[];
  domains: DomainCategory[];
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  onDeleteMilestone: (id: string) => void;
}

export const RoadmapMilestones: React.FC<RoadmapMilestonesProps> = ({
  milestones,
  skills,
  domains,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetSkillId, setTargetSkillId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rewardXp, setRewardXp] = useState(250);

  const filteredMilestones = milestones.filter((m) => {
    if (filter === 'active') return !m.completed;
    if (filter === 'completed') return m.completed;
    return true;
  });

  const completedCount = milestones.filter((m) => m.completed).length;
  const totalEarnedRewardXp = milestones
    .filter((m) => m.completed)
    .reduce((acc, m) => acc + m.rewardXp, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const skill = skills.find((s) => s.id === targetSkillId);

    onAddMilestone({
      title: title.trim(),
      description: description.trim(),
      targetSkillId: targetSkillId || undefined,
      targetDomainId: skill?.domainId,
      deadline: deadline || undefined,
      rewardXp: Number(rewardXp) || 200,
      completed: false,
    });

    setTitle('');
    setDescription('');
    setTargetSkillId('');
    setDeadline('');
    setRewardXp(250);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-purple-400"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Actionable Targets
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Roadmap Milestones</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Concrete target achievements with deadlines and completion bonuses to maintain learning momentum.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-right">
              <div className="text-xs text-slate-400">Milestones Done</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {completedCount} / {milestones.length}
              </div>
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Milestone Drawer / Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Define New Target Milestone</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Milestone Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ship Full-Stack Next.js Production App"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Associated Skill (Optional)
              </label>
              <select
                value={targetSkillId}
                onChange={(e) => setTargetSkillId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">General Milestone (No specific skill)</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Acceptance Criteria
            </label>
            <input
              type="text"
              placeholder="What proves this milestone is achieved?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reward Bonus XP
              </label>
              <input
                type="number"
                min="50"
                max="2000"
                step="50"
                value={rewardXp}
                onChange={(e) => setRewardXp(parseInt(e.target.value) || 200)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              Save Milestone
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({milestones.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'active'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({milestones.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'completed'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span>Earned: {totalEarnedRewardXp} XP</span>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        {filteredMilestones.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No milestones match this filter. Create one to set your targets!
          </div>
        ) : (
          filteredMilestones.map((m) => {
            const skill = skills.find((s) => s.id === m.targetSkillId);

            return (
              <div
                key={m.id}
                onClick={() => onToggleMilestone(m.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  m.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="pt-0.5 flex-shrink-0">
                    {m.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold ${
                          m.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {m.title}
                      </h4>

                      {skill && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                          {skill.name}
                        </span>
                      )}
                    </div>

                    {m.description && (
                      <p className="text-xs text-slate-400">{m.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 flex-wrap">
                      {m.deadline && (
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Target: {m.deadline}</span>
                        </span>
                      )}
                      {m.completed && m.completedDate && (
                        <span className="text-emerald-400 font-mono">
                          ✓ Achieved on {m.completedDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side reward & actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                  <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
                    <span className="text-[10px] uppercase font-semibold text-purple-400 block">
                      Reward
                    </span>
                    <span className="text-xs font-bold text-purple-300 font-mono">
                      +{m.rewardXp} XP
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMilestone(m.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
