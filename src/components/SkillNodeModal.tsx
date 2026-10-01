import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Plus, 
  Clock, 
  Lock, 
  Unlock, 
  Award, 
  Trash2, 
  Edit3, 
  Save, 
  BookOpen, 
  FileText
} from 'lucide-react';
import { PracticeSession, SkillLevel, SkillNode } from '../types';
import { LEVEL_CONFIG, checkIsSkillUnlocked } from '../data/initialData';

interface SkillNodeModalProps {
  skill: SkillNode;
  allSkills: SkillNode[];
  recentSessions: PracticeSession[];
  onClose: () => void;
  onUpdateSkill: (updatedSkill: SkillNode) => void;
  onLogPractice: (skill: SkillNode) => void;
  onQuickAddXp: (skillId: string, amount: number) => void;
}

export const SkillNodeModal: React.FC<SkillNodeModalProps> = ({
  skill,
  allSkills,
  recentSessions,
  onClose,
  onUpdateSkill,
  onLogPractice,
  onQuickAddXp,
}) => {
  const isUnlocked = checkIsSkillUnlocked(skill, allSkills);
  const levelInfo = LEVEL_CONFIG[isUnlocked ? skill.level : 'locked'];

  const [activeTab, setActiveTab] = useState<'checklist' | 'resources' | 'notes' | 'history'>('checklist');
  const [newSubSkillText, setNewSubSkillText] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [notesDraft, setNotesDraft] = useState(skill.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Toggle subskill completion
  const handleToggleSubSkill = (subId: string) => {
    const updatedSubSkills = skill.subSkills.map((item) =>
      item.id === subId ? { ...item, completed: !item.completed } : item
    );
    onUpdateSkill({ ...skill, subSkills: updatedSubSkills });
  };

  // Add subskill
  const handleAddSubSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubSkillText.trim()) return;
    const newItem = {
      id: `sub-${Date.now()}`,
      title: newSubSkillText.trim(),
      completed: false,
    };
    onUpdateSkill({ ...skill, subSkills: [...skill.subSkills, newItem] });
    setNewSubSkillText('');
  };

  // Delete subskill
  const handleDeleteSubSkill = (subId: string) => {
    const updatedSubSkills = skill.subSkills.filter((item) => item.id !== subId);
    onUpdateSkill({ ...skill, subSkills: updatedSubSkills });
  };

  // Add resource
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
    const newRes = {
      id: `res-${Date.now()}`,
      title: newResourceTitle.trim(),
      url: newResourceUrl.trim(),
      type: 'article' as const,
    };
    onUpdateSkill({ ...skill, resources: [...skill.resources, newRes] });
    setNewResourceTitle('');
    setNewResourceUrl('');
  };

  // Save notes
  const handleSaveNotes = () => {
    onUpdateSkill({ ...skill, notes: notesDraft });
    setIsEditingNotes(false);
  };

  // Find prerequisite names
  const prereqSkills = skill.prerequisiteIds
    .map((id) => allSkills.find((s) => s.id === id))
    .filter(Boolean) as SkillNode[];

  // Filter sessions for this skill
  const skillSessions = recentSessions.filter((s) => s.skillId === skill.id);

  const completedCount = skill.subSkills.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900/90 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
              style={{
                color: levelInfo.color,
                borderColor: `${levelInfo.color}50`,
                backgroundColor: `${levelInfo.color}15`,
              }}
            >
              {levelInfo.badge}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">
              {skill.category}
            </span>
            {!isUnlocked && (
              <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <Lock className="w-3 h-3" /> Locked Prerequisite
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white">{skill.name}</h2>
          <p className="text-sm text-slate-400 mt-1">{skill.description}</p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Current XP</span>
              <div className="text-lg font-bold text-indigo-400 font-mono">
                {skill.currentXp.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Time Practiced</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {(skill.totalTimeMinutes / 60).toFixed(1)} hrs
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Checklist</span>
              <div className="text-lg font-bold text-purple-400 font-mono">
                {completedCount} / {skill.subSkills.length}
              </div>
            </div>
          </div>
        </div>

        {/* Prerequisites Info if any */}
        {prereqSkills.length > 0 && (
          <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-400">Prerequisites:</span>
            {prereqSkills.map((p) => {
              const pUnlocked = p.currentXp >= LEVEL_CONFIG.apprentice.minXp;
              return (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${
                    pUnlocked
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {pUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {p.name} ({p.currentXp} XP)
                </span>
              );
            })}
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sub-Skills & Checklist ({completedCount}/{skill.subSkills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Resources ({skill.resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Study Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Practice History ({skillSessions.length})</span>
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {skill.subSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No sub-skills added yet. Add one below!</p>
                ) : (
                  skill.subSkills.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleSubSkill(sub.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        sub.completed
                          ? 'bg-slate-950/60 border-indigo-500/30 text-slate-300'
                          : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {sub.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className={`text-xs font-medium ${sub.completed ? 'line-through text-slate-400' : ''}`}>
                          {sub.title}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubSkill(sub.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Subskill input */}
              <form onSubmit={handleAddSubSkill} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add a new milestone or sub-skill concept..."
                  value={newSubSkillText}
                  onChange={(e) => setNewSubSkillText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {skill.resources.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reference links added yet.</p>
                ) : (
                  skill.resources.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-200 truncate">{res.title}</span>
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold ml-2 flex-shrink-0"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))
                )}
              </div>

              {/* Add Resource */}
              <form onSubmit={handleAddResource} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-slate-300">Add Study Resource</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Resource Title (e.g. Official Docs)"
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="url"
                    placeholder="URL (https://...)"
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all"
                >
                  + Add Link
                </button>
              </form>
            </div>
          )}

          {/* TAB: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Personal Mastery Log & Insights</span>
                {isEditingNotes ? (
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <textarea
                  rows={6}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Record key breakthroughs, edge cases you mastered, or next areas of focus..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                />
              ) : (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed min-h-[100px]">
                  {skill.notes ? (
                    skill.notes
                  ) : (
                    <span className="text-slate-400 italic">No notes recorded yet. Click Edit to add key takeaways!</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {skillSessions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No practice sessions logged yet for this skill.</p>
              ) : (
                skillSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{sess.date}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                          {sess.intensity}
                        </span>
                      </div>
                      {sess.notes && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{sess.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-purple-400">+{sess.xpEarned} XP</div>
                      <div className="text-[10px] text-slate-400">{sess.durationMinutes} mins</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Quick XP boosters */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Boost:</span>
            <button
              onClick={() => onQuickAddXp(skill.id, 50)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-mono font-semibold border border-slate-700"
            >
              +50 XP
            </button>
            <button
              onClick={() => onQuickAddXp(skill.id, 100)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-mono font-semibold border border-slate-700"
            >
              +100 XP
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onLogPractice(skill);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Clock className="w-4 h-4" />
              <span>Log Practice Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
