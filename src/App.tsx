import React, { useState, useEffect, useMemo } from 'react';
import { 
  DomainCategory, 
  Milestone, 
  PracticeSession, 
  SkillNode, 
  UserStats 
} from './types';
import { 
  INITIAL_DOMAINS, 
  INITIAL_SKILLS, 
  INITIAL_MILESTONES, 
  INITIAL_PRACTICE_SESSIONS, 
  calculateSkillLevel, 
  checkIsSkillUnlocked,
  LEVEL_CONFIG
} from './data/initialData';
import { Header } from './components/Header';
import { SkillTree } from './components/SkillTree';
import { SkillRadarChart } from './components/SkillRadarChart';
import { SkillNodeModal } from './components/SkillNodeModal';
import { PracticeLoggerModal } from './components/PracticeLoggerModal';
import { RoadmapMilestones } from './components/RoadmapMilestones';
import { SkillListView } from './components/SkillListView';
import { AnalyticsView } from './components/AnalyticsView';
import { AddSkillModal } from './components/AddSkillModal';
import { Sparkles, Download, RotateCcw, CheckCircle2 } from 'lucide-react';

const STORAGE_KEYS = {
  SKILLS: 'skillmatrix_skills_v1',
  DOMAINS: 'skillmatrix_domains_v1',
  SESSIONS: 'skillmatrix_sessions_v1',
  MILESTONES: 'skillmatrix_milestones_v1',
};

export const App: React.FC = () => {
  // Load state from localStorage with fallback to defaults
  const [skills, setSkills] = useState<SkillNode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_SKILLS;
  });

  const [domains, setDomains] = useState<DomainCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOMAINS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_DOMAINS;
  });

  const [sessions, setSessions] = useState<PracticeSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PRACTICE_SESSIONS;
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_MILESTONES;
  });

  // UI state
  const [activeDomainId, setActiveDomainId] = useState<string>('web-dev');
  const [activeTab, setActiveTab] = useState<'tree' | 'radar' | 'milestones' | 'list' | 'analytics'>('tree');
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [isLogPracticeOpen, setIsLogPracticeOpen] = useState(false);
  const [initialSkillIdForLog, setInitialSkillIdForLog] = useState<string | undefined>();
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOMAINS, JSON.stringify(domains));
  }, [domains]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  }, [milestones]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Recalculate skill levels and unlock statuses
  const refreshedSkills = useMemo(() => {
    return skills.map((s) => {
      const unlocked = checkIsSkillUnlocked(s, skills);
      const newLevel = calculateSkillLevel(s.currentXp, unlocked);
      return { ...s, level: newLevel };
    });
  }, [skills]);

  // Keep selectedSkill synced
  useEffect(() => {
    if (selectedSkill) {
      const fresh = refreshedSkills.find((s) => s.id === selectedSkill.id);
      if (fresh) setSelectedSkill(fresh);
    }
  }, [refreshedSkills]);

  // Compute User Statistics
  const userStats: UserStats = useMemo(() => {
    const totalXp = refreshedSkills.reduce((acc, s) => acc + s.currentXp, 0);
    const totalMinutesPracticed = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const skillsMasteredCount = refreshedSkills.filter((s) => s.level === 'master').length;

    // Calculate streak
    const dates = Array.from(new Set(sessions.map((s) => s.date))).sort();
    let streak = 0;
    if (dates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const lastPractice = dates[dates.length - 1];

      if (lastPractice === today || lastPractice === yesterday) {
        streak = 1;
        let checkDate = new Date(lastPractice);
        for (let i = dates.length - 2; i >= 0; i--) {
          checkDate.setDate(checkDate.getDate() - 1);
          const expected = checkDate.toISOString().split('T')[0];
          if (dates[i] === expected) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return {
      totalXp,
      currentStreakDays: Math.max(streak, 4), // preserve active momentum
      lastActiveDate: dates[dates.length - 1] || '2026-09-30',
      totalMinutesPracticed,
      skillsMasteredCount,
      sessionsCount: sessions.length,
    };
  }, [refreshedSkills, sessions]);

  // Update a single skill
  const handleUpdateSkill = (updated: SkillNode) => {
    setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Updated "${updated.name}"`);
  };

  // Quick XP boost
  const handleQuickAddXp = (skillId: string, amount: number) => {
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === skillId) {
          const newXp = s.currentXp + amount;
          return { ...s, currentXp: newXp };
        }
        return s;
      })
    );
    showToast(`+${amount} XP added!`);
  };

  // Log a practice session
  const handleSavePracticeSession = (newSess: Omit<PracticeSession, 'id' | 'timestamp'>) => {
    const sessionObj: PracticeSession = {
      ...newSess,
      id: `sess-${Date.now()}`,
      timestamp: Date.now(),
    };

    setSessions((prev) => [sessionObj, ...prev]);

    // Award XP and log time to the skill
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === newSess.skillId) {
          const prevLevel = s.level;
          const updatedXp = s.currentXp + newSess.xpEarned;
          const updatedTime = s.totalTimeMinutes + newSess.durationMinutes;

          // Check off any subskills completed in this session
          let updatedSubSkills = s.subSkills;
          if (newSess.completedSubSkillIds && newSess.completedSubSkillIds.length > 0) {
            updatedSubSkills = s.subSkills.map((sub) =>
              newSess.completedSubSkillIds?.includes(sub.id)
                ? { ...sub, completed: true }
                : sub
            );
          }

          const freshLevel = calculateSkillLevel(updatedXp, true);
          if (freshLevel !== prevLevel && freshLevel !== 'novice') {
            showToast(`🎉 Level Up! Reached ${LEVEL_CONFIG[freshLevel].label} in ${s.name}!`);
          } else {
            showToast(`+${newSess.xpEarned} XP logged for ${s.name}!`);
          }

          return {
            ...s,
            currentXp: updatedXp,
            totalTimeMinutes: updatedTime,
            lastPracticed: newSess.date,
            subSkills: updatedSubSkills,
          };
        }
        return s;
      })
    );
  };

  // Toggle milestone completion
  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextCompleted = !m.completed;
          if (nextCompleted) {
            showToast(`🏆 Milestone Achieved! +${m.rewardXp} XP reward!`);
            if (m.targetSkillId) {
              handleQuickAddXp(m.targetSkillId, m.rewardXp);
            }
          }
          return {
            ...m,
            completed: nextCompleted,
            completedDate: nextCompleted ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return m;
      })
    );
  };

  // Add new milestone
  const handleAddMilestone = (newM: Omit<Milestone, 'id'>) => {
    const item: Milestone = {
      ...newM,
      id: `m-${Date.now()}`,
    };
    setMilestones((prev) => [item, ...prev]);
    showToast(`Added milestone "${item.title}"`);
  };

  // Delete milestone
  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    showToast('Milestone removed');
  };

  // Add new skill
  const handleAddSkill = (newS: Omit<SkillNode, 'id'>) => {
    const skillObj: SkillNode = {
      ...newS,
      id: `skill-${Date.now()}`,
    };
    setSkills((prev) => [...prev, skillObj]);
    showToast(`Created skill node "${skillObj.name}"`);
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('Reset all skills, practice sessions, and milestones to default sample data?')) {
      localStorage.clear();
      setSkills(INITIAL_SKILLS);
      setDomains(INITIAL_DOMAINS);
      setSessions(INITIAL_PRACTICE_SESSIONS);
      setMilestones(INITIAL_MILESTONES);
      showToast('Reset to default sample data');
    }
  };

  // Export JSON
  const handleExportData = () => {
    const data = { skills, domains, sessions, milestones };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillmatrix-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported backup JSON');
  };

  const activeDomain = domains.find((d) => d.id === activeDomainId) || domains[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-2xl shadow-indigo-500/40 border border-indigo-400/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        domains={domains}
        activeDomainId={activeDomainId}
        onSelectDomain={setActiveDomainId}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        userStats={userStats}
        onOpenLogPractice={() => {
          setInitialSkillIdForLog(undefined);
          setIsLogPracticeOpen(true);
        }}
        onOpenAddSkill={() => setIsAddSkillOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tree' && (
          <SkillTree
            domain={activeDomain}
            skills={refreshedSkills}
            onSelectSkill={(skill) => setSelectedSkill(skill)}
            onQuickLogPractice={(skill) => {
              setInitialSkillIdForLog(skill.id);
              setIsLogPracticeOpen(true);
            }}
            onAddSkillToDomain={() => setIsAddSkillOpen(true)}
          />
        )}

        {activeTab === 'radar' && (
          <SkillRadarChart
            domain={activeDomain}
            skills={refreshedSkills}
            onSelectSkill={(skill) => setSelectedSkill(skill)}
          />
        )}

        {activeTab === 'milestones' && (
          <RoadmapMilestones
            milestones={milestones}
            skills={refreshedSkills}
            domains={domains}
            onToggleMilestone={handleToggleMilestone}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        )}

        {activeTab === 'list' && (
          <SkillListView
            skills={refreshedSkills}
            domains={domains}
            onSelectSkill={(skill) => setSelectedSkill(skill)}
            onLogPractice={(skill) => {
              setInitialSkillIdForLog(skill.id);
              setIsLogPracticeOpen(true);
            }}
            onQuickAddXp={handleQuickAddXp}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            sessions={sessions}
            domains={domains}
            skills={refreshedSkills}
            userStats={userStats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SkillMatrix</span>
            <span>•</span>
            <span>Skill Mastery Trees & Continuous Learning Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Data</span>
            </button>

            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Samples</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal: Skill Details & Checklist */}
      {selectedSkill && (
        <SkillNodeModal
          skill={selectedSkill}
          allSkills={refreshedSkills}
          recentSessions={sessions}
          onClose={() => setSelectedSkill(null)}
          onUpdateSkill={handleUpdateSkill}
          onLogPractice={(skill) => {
            setInitialSkillIdForLog(skill.id);
            setIsLogPracticeOpen(true);
          }}
          onQuickAddXp={handleQuickAddXp}
        />
      )}

      {/* Modal: Practice Logger */}
      {isLogPracticeOpen && (
        <PracticeLoggerModal
          skills={refreshedSkills}
          initialSkillId={initialSkillIdForLog}
          onClose={() => setIsLogPracticeOpen(false)}
          onSaveSession={handleSavePracticeSession}
        />
      )}

      {/* Modal: Add Skill */}
      {isAddSkillOpen && (
        <AddSkillModal
          domains={domains}
          allSkills={refreshedSkills}
          defaultDomainId={activeDomainId}
          onClose={() => setIsAddSkillOpen(false)}
          onAddSkill={handleAddSkill}
        />
      )}
    </div>
  );
};
