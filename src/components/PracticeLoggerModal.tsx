import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  CheckSquare
} from 'lucide-react';
import { PracticeSession, SkillNode } from '../types';

interface PracticeLoggerModalProps {
  skills: SkillNode[];
  initialSkillId?: string;
  onClose: () => void;
  onSaveSession: (session: Omit<PracticeSession, 'id' | 'timestamp'>) => void;
}

export const PracticeLoggerModal: React.FC<PracticeLoggerModalProps> = ({
  skills,
  initialSkillId,
  onClose,
  onSaveSession,
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(
    initialSkillId || (skills.length > 0 ? skills[0].id : '')
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'deep' | 'breakthrough'>('deep');
  const [notes, setNotes] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const selectedSkill = skills.find((s) => s.id === selectedSkillId);

  // Subskill completion within this session
  const [checkedSubSkills, setCheckedSubSkills] = useState<string[]>([]);

  const toggleSubSkill = (subId: string) => {
    setCheckedSubSkills((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  // Calculate XP multiplier
  const intensityMultiplier = {
    light: 1.0,
    moderate: 1.5,
    deep: 2.0,
    breakthrough: 2.5,
  }[intensity];

  // Base XP = minutes * 1.5 * intensity + bonus for checklist items (25 XP each)
  const baseMinutesXp = Math.round(durationMinutes * 1.5 * intensityMultiplier);
  const checklistBonusXp = checkedSubSkills.length * 30;
  const totalCalculatedXp = baseMinutesXp + checklistBonusXp;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;

    onSaveSession({
      skillId: selectedSkill.id,
      skillName: selectedSkill.name,
      domainId: selectedSkill.domainId,
      date: sessionDate,
      durationMinutes,
      xpEarned: totalCalculatedXp,
      intensity,
      notes,
      completedSubSkillIds: checkedSubSkills,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Log Practice Session</h2>
              <p className="text-xs text-slate-400">Record focused deliberate practice and earn mastery XP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Skill Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Skill
            </label>
            <select
              value={selectedSkillId}
              onChange={(e) => {
                setSelectedSkillId(e.target.value);
                setCheckedSubSkills([]);
              }}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Duration Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Practice Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="600"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[15, 30, 45, 60, 90, 120].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  durationMinutes === mins
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Intensity Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Focus & Intensity Depth
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'light', label: 'Light', mult: '1.0x', desc: 'Review / reading' },
                { id: 'moderate', label: 'Moderate', mult: '1.5x', desc: 'Guided practice' },
                { id: 'deep', label: 'Deep Focus', mult: '2.0x', desc: 'Uninterrupted flow' },
                { id: 'breakthrough', label: 'Breakthrough', mult: '2.5x', desc: 'Complex problem' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setIntensity(tier.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    intensity === tier.id
                      ? 'bg-indigo-600/20 border-indigo-500/60 ring-1 ring-indigo-500/40 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{tier.label}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">{tier.mult}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subskills Checklist if skill has pending subskills */}
          {selectedSkill && selectedSkill.subSkills.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mark Concepts Mastered Today (+30 XP bonus each)
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedSkill.subSkills.map((sub) => {
                  const isChecked = checkedSubSkills.includes(sub.id) || sub.completed;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => !sub.completed && toggleSubSkill(sub.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border ${
                        sub.completed
                          ? 'bg-slate-950/40 border-slate-900 text-slate-400 cursor-not-allowed'
                          : isChecked
                          ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isChecked ? 'text-indigo-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{sub.title}</span>
                      {sub.completed && (
                        <span className="text-[10px] text-slate-400 ml-auto">Already done</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Session Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Practice Notes & Reflections
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What specific problems did you solve? Key hurdles overcome?"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Live XP Calculator Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/30 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-bold text-white">Estimated XP Reward</span>
                <p className="text-[10px] text-slate-300">
                  {durationMinutes} mins × {intensityMultiplier}x intensity
                  {checkedSubSkills.length > 0 ? ` + ${checklistBonusXp} bonus` : ''}
                </p>
              </div>
            </div>
            <div className="text-xl font-extrabold text-indigo-300 font-mono">
              +{totalCalculatedXp} XP
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Log Session & Claim XP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
