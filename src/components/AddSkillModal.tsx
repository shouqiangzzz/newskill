import React, { useState } from 'react';
import { X, Plus, BookOpen } from 'lucide-react';
import { DomainCategory, SkillLevel, SkillNode } from '../types';

interface AddSkillModalProps {
  domains: DomainCategory[];
  allSkills: SkillNode[];
  defaultDomainId: string;
  onClose: () => void;
  onAddSkill: (skill: Omit<SkillNode, 'id'>) => void;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  domains,
  allSkills,
  defaultDomainId,
  onClose,
  onAddSkill,
}) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [domainId, setDomainId] = useState(defaultDomainId);
  const [category, setCategory] = useState('Specialization');
  const [targetLevel, setTargetLevel] = useState<SkillLevel>('master');
  const [selectedPrereqIds, setSelectedPrereqIds] = useState<string[]>([]);
  const [subSkillsText, setSubSkillsText] = useState('');

  // Available prereqs from same domain
  const potentialPrereqs = allSkills.filter((s) => s.domainId === domainId);

  const togglePrereq = (id: string) => {
    setSelectedPrereqIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Parse subskills (one per line)
    const subSkills = subSkillsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title,
        completed: false,
      }));

    // Find next position on canvas
    const domainExistingSkills = allSkills.filter((s) => s.domainId === domainId);
    let maxX = 100;
    domainExistingSkills.forEach((s) => {
      if (s.position.x > maxX) maxX = s.position.x;
    });

    onAddSkill({
      name: name.trim(),
      tagline: tagline.trim() || 'Custom skill mastery node',
      description: description.trim() || 'Detailed learning objectives and concepts to explore.',
      domainId,
      category: category.trim() || 'Specialization',
      iconName: 'BookOpen',
      currentXp: 0,
      targetLevel,
      level: 'novice',
      prerequisiteIds: selectedPrereqIds,
      subSkills,
      resources: [],
      notes: '',
      totalTimeMinutes: 0,
      position: { x: maxX + 220, y: 150 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Skill Node</h2>
              <p className="text-xs text-slate-400">Expand your learning matrix and skill tree</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Skill Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GraphQL & Apollo Federation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Domain Track
              </label>
              <select
                value={domainId}
                onChange={(e) => {
                  setDomainId(e.target.value);
                  setSelectedPrereqIds([]);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Core Logic, Framework, API"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tagline (Short Summary)
            </label>
            <input
              type="text"
              placeholder="e.g. Schemas, resolvers, mutations, and caching"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={2}
              placeholder="What core competencies define mastery in this skill?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Prerequisites */}
          {potentialPrereqs.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prerequisites (Must reach Apprentice to unlock)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                {potentialPrereqs.map((p) => {
                  const isSelected = selectedPrereqIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePrereq(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/60'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subskills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Initial Sub-Skills (One per line)
            </label>
            <textarea
              rows={3}
              placeholder="Schema design & SDL syntax&#10;Resolvers & N+1 DataLoader problem&#10;Subscriptions & WebSockets"
              value={subSkillsText}
              onChange={(e) => setSubSkillsText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Create Skill Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
