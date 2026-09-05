'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  UploadCloud,
  Search,
  Filter,
  Sliders,
  Star,
  Download,
  UserCheck,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Code2,
  Building2,
  Mail,
  Phone,
  Eye,
  Save,
  FileSpreadsheet,
  Trash2,
  UserPlus,
  AlertTriangle,
  ChevronRight,
  Palette,
  Mic,
  Cpu,
  Terminal,
  Lock,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { OFFICIAL_150_SHORTLIST, ShortlistedStudent, enrichStudent } from '@/lib/students150';

function downloadExcelRecord(participantsList: Participant[], filenamePrefix = 'Binary_Club_Recruitment_Record') {
  if (!participantsList || participantsList.length === 0) return;

  const exportRows = participantsList.map((p, idx) => {
    const totalScore = p.finalResult?.totalScore ?? (p.avgPIScore ? Number(p.avgPIScore.toFixed(1)) : 0);
    return {
      'Rank': p.finalResult?.finalRank || idx + 1,
      'Name': p.name,
      'Roll Number': p.rollNo,
      'Marks': totalScore,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Recruitment Records');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}_${timestamp}.xlsx`);
}

function convertShortlistToParticipants(shortlist: ShortlistedStudent[]): Participant[] {
  return shortlist.map((s) => ({
    id: `student-${s.rollNo}`,
    name: s.name,
    rollNo: s.rollNo,
    gender: 'Unspecified',
    email: s.email || `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${s.rollNo.slice(-4)}@akgec.ac.in`,
    contactNo: s.contactNo || '',
    year: s.year || '2nd Year',
    branch: s.branch,
    section: s.section,
    residentialStatus: 'Hosteller',
    instagramId: s.instagramId || '',
    linkedinId: s.linkedinId || '',
    primaryDomain: s.primaryDomain,
    allDomainsList: s.allDomains,
    technicalSkills: s.technicalSkills || s.primaryDomain,
    projects: s.projects || `Project in ${s.primaryDomain}`,
    technicalExperience: s.technicalSkills || '',
    achievements: '',
    contributionStrengths: s.contributionStrengths || '',
    whyBinaryClub: s.whyBinaryClub || `Passionate about ${s.primaryDomain} and Binary Club.`,
    eventIdeas: s.eventIdeas || '',
    threeWords: s.threeWords || '',
    piCompleted: true,
    avgPIScore: s.score,
    piScores: [
      {
        technicalScore: Math.round(s.score * 0.25),
        communicationScore: Math.round(s.score * 0.25),
        projectScore: Math.round(s.score * 0.25),
        attitudeScore: Math.round(s.score * 0.25),
        overallScore: s.score,
        recommendation: s.rank <= 50 ? 'STRONGLY_RECOMMEND' : 'RECOMMEND',
      },
    ],
    finalResult: {
      totalScore: s.score,
      finalRank: s.rank,
      selectionStatus: 'SHORTLISTED',
      remarks: '',
    },
  }));
}

function mergeLocalDataWithParticipants(baseParticipants: Participant[]): Participant[] {
  let savedScores: Record<string, any> = {};
  let savedStatuses: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    try {
      const rawScores = localStorage.getItem('binary_rec_local_scores_v1');
      if (rawScores) savedScores = JSON.parse(rawScores);

      const rawStatuses = localStorage.getItem('binary_rec_local_status_v1');
      if (rawStatuses) savedStatuses = JSON.parse(rawStatuses);
    } catch (e) {
      console.error('Error reading localStorage data', e);
    }
  }

  const merged = baseParticipants.map((baseP) => {
    const enriched = enrichStudent(baseP as any) as any;
    const pKey = baseP.id || baseP.rollNo;
    const localScore = savedScores[pKey] || savedScores[baseP.rollNo] || savedScores[baseP.id];
    const localStatus = savedStatuses[pKey] || savedStatuses[baseP.rollNo] || savedStatuses[baseP.id];

    let avgPIScore = baseP.avgPIScore || enriched.score;
    let piScores = baseP.piScores || [];
    let finalResult = baseP.finalResult ? { ...baseP.finalResult } : {
      totalScore: avgPIScore || 0,
      finalRank: 0,
      selectionStatus: 'SHORTLISTED',
      remarks: '',
    };

    if (localScore) {
      avgPIScore = localScore.totalScore;
      piScores = [
        ...piScores,
        {
          technicalScore: localScore.techKnowledge,
          communicationScore: localScore.publicSpeaking,
          projectScore: localScore.project,
          attitudeScore: localScore.overall,
          overallScore: localScore.totalScore,
          interviewerNotes: localScore.interviewerNotes,
          recommendation: localScore.recommendation,
        },
      ];
      finalResult.totalScore = localScore.totalScore;
    }

    if (localStatus) {
      finalResult.selectionStatus = localStatus;
    }

    return {
      ...baseP,
      ...enriched,
      avgPIScore,
      piScores,
      finalResult,
    };
  });

  const sorted = [...merged].sort((a, b) => {
    const scoreA = a.finalResult?.totalScore ?? a.avgPIScore ?? 0;
    const scoreB = b.finalResult?.totalScore ?? b.avgPIScore ?? 0;
    return scoreB - scoreA;
  });

  return sorted.map((p, idx) => ({
    ...p,
    finalResult: {
      ...p.finalResult!,
      finalRank: idx + 1,
    },
  }));
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'INTERVIEWER';
}

interface Participant {
  id: string;
  name: string;
  rollNo: string;
  gender: string;
  email: string;
  contactNo: string;
  year: string;
  branch: string;
  section: string;
  residentialStatus: string;
  instagramId?: string;
  linkedinId?: string;
  primaryDomain: string;
  allDomainsList?: string[];
  technicalSkills: string;
  projects: string;
  technicalExperience: string;
  achievements: string;
  contributionStrengths: string;
  whyBinaryClub: string;
  eventIdeas: string;
  threeWords: string;
  piCompleted?: boolean;
  avgPIScore?: number;
  piScores?: any[];
  finalResult?: {
    totalScore: number;
    finalRank: number;
    selectionStatus: string;
    remarks: string;
  };
}

interface PIRound {
  id: string;
  roundName: string;
  roundNumber: number;
  description: string;
  maxScore: number;
  status: string;
  criteria?: any;
}

interface StatsData {
  totalApplicants: number;
  shortlistedCount: number;
  piPendingCount: number;
  piCompletedCount: number;
  selectedCount: number;
  rejectedCount: number;
  averagePIScore: number;
  topCandidates: Array<{
    id: string;
    name: string;
    rollNo: string;
    branch: string;
    domain: string;
    score: number;
    rank: number;
    status: string;
  }>;
  domainStats: Array<{ name: string; value: number }>;
  branchStats: Array<{ name: string; value: number }>;
  selectionStats: Array<{ name: string; value: number }>;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'candidates' | 'import' | 'scoring' | 'ranking'>('dashboard');
  const [themeMode, setThemeMode] = useState<'target' | 'cute' | 'sage' | 'purple' | 'gold'>('target');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Add Candidate Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    email: '',
    branch: 'CSE',
    section: 'A',
    year: '2nd Year',
    primaryDomain: 'Web Development',
    contactNo: '',
    technicalSkills: '',
    projects: '',
    whyBinaryClub: '',
  });
  const [addMsg, setAddMsg] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  // Delete Candidate Modal State
  const [studentToDelete, setStudentToDelete] = useState<Participant | null>(null);
  const [deletingStudent, setDeletingStudent] = useState(false);

  // Stats Data
  const [stats, setStats] = useState<StatsData | null>(null);

  // Participants Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<Participant | null>(null);

  // PI Rounds & Scoring State
  const [piRounds, setPiRounds] = useState<PIRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [evalCandidateId, setEvalCandidateId] = useState<string>('');
  const [scores, setScores] = useState({
    techKnowledge: 20,
    publicSpeaking: 20,
    project: 20,
    overall: 20,
  });
  const [interviewerNotes, setInterviewerNotes] = useState('');
  const [recommendation, setRecommendation] = useState('RECOMMEND');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoringMsg, setScoringMsg] = useState('');

  // Rankings & Auto-Select
  const [rankings, setRankings] = useState<any[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [topNCount, setTopNCount] = useState(5);
  const [sampleDataMsg, setSampleDataMsg] = useState('');
  const [seedingSample, setSeedingSample] = useState(false);

  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Check auth session
  const checkAuth = useCallback(async () => {
    try {
      setLoadingAuth(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Participants
  const fetchParticipants = useCallback(async () => {
    try {
      setLoadingParticipants(true);
      const params = new URLSearchParams();
      params.set('limit', '500');
      if (searchTerm) params.set('search', searchTerm);
      if (branchFilter !== 'ALL') params.set('branch', branchFilter);
      if (sectionFilter !== 'ALL') params.set('section', sectionFilter);
      if (domainFilter !== 'ALL') params.set('domain', domainFilter);
      if (statusFilter !== 'ALL') params.set('selectionStatus', statusFilter);
      if (yearFilter !== 'ALL') params.set('year', yearFilter);

      let fetchedList: Participant[] = [];
      let successfullyFetchedFromApi = false;
      try {
        const res = await fetch(`/api/participants?${params.toString()}`);
        const data = await res.json();
        if (Array.isArray(data.participants)) {
          fetchedList = data.participants;
          successfullyFetchedFromApi = true;
        }
      } catch {
        // network or serverless database fallback
      }

      if (!successfullyFetchedFromApi) {
        fetchedList = convertShortlistToParticipants(OFFICIAL_150_SHORTLIST);
      }

      let merged = mergeLocalDataWithParticipants(fetchedList);

      // Perform local search and filter on merged list to guarantee 100% working search across all fields
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        merged = merged.filter((p) =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.rollNo && p.rollNo.toLowerCase().includes(term)) ||
          (p.email && p.email.toLowerCase().includes(term)) ||
          (p.branch && p.branch.toLowerCase().includes(term)) ||
          (p.section && p.section.toLowerCase().includes(term)) ||
          (p.primaryDomain && p.primaryDomain.toLowerCase().includes(term)) ||
          (p.technicalSkills && p.technicalSkills.toLowerCase().includes(term)) ||
          (p.projects && p.projects.toLowerCase().includes(term)) ||
          (p.contactNo && p.contactNo.toLowerCase().includes(term))
        );
      }
      if (branchFilter !== 'ALL') {
        merged = merged.filter((p) => p.branch === branchFilter);
      }
      if (sectionFilter !== 'ALL') {
        merged = merged.filter((p) => p.section === sectionFilter);
      }
      if (domainFilter !== 'ALL') {
        merged = merged.filter((p) => p.primaryDomain === domainFilter);
      }
      if (statusFilter !== 'ALL') {
        merged = merged.filter((p) => (p.finalResult?.selectionStatus || 'SHORTLISTED') === statusFilter);
      }
      if (yearFilter !== 'ALL') {
        merged = merged.filter((p) => p.year === yearFilter);
      }

      // Always sort candidate list A-Z alphabetically by candidate name
      merged.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

      setParticipants(merged);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingParticipants(false);
    }
  }, [searchTerm, branchFilter, sectionFilter, domainFilter, statusFilter, yearFilter]);

  // Fetch PI Rounds
  const fetchPIRounds = useCallback(async () => {
    try {
      const res = await fetch('/api/pi-rounds');
      const data = await res.json();
      if (data.piRounds && data.piRounds.length > 0) {
        setPiRounds(data.piRounds);
        setSelectedRoundId(data.piRounds[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Rankings
  const fetchRankings = useCallback(async () => {
    try {
      setLoadingRankings(true);
      let fetchedRankings: any[] = [];
      try {
        const res = await fetch('/api/ranking');
        const data = await res.json();
        if (data.rankings && data.rankings.length > 0) {
          fetchedRankings = data.rankings;
        }
      } catch {
        // fallback
      }

      if (!fetchedRankings || fetchedRankings.length === 0) {
        const baseList = convertShortlistToParticipants(OFFICIAL_150_SHORTLIST);
        const mergedList = mergeLocalDataWithParticipants(baseList);
        fetchedRankings = mergedList.map((p) => ({
          id: p.id,
          participantId: p.id,
          name: p.name,
          rollNo: p.rollNo,
          branch: p.branch,
          section: p.section,
          primaryDomain: p.primaryDomain,
          totalScore: p.finalResult?.totalScore ?? (p.avgPIScore || 0),
          finalRank: p.finalResult?.finalRank || 1,
          selectionStatus: p.finalResult?.selectionStatus || 'SHORTLISTED',
          recommendation: p.piScores && p.piScores.length > 0 ? p.piScores[p.piScores.length - 1].recommendation : (p.finalResult?.finalRank && p.finalResult.finalRank <= 50 ? 'STRONGLY_RECOMMEND' : 'RECOMMEND'),
        }));
      }

      setRankings(fetchedRankings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRankings(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchStats();
    fetchParticipants();
    fetchPIRounds();
  }, [checkAuth, fetchStats, fetchParticipants, fetchPIRounds]);

  useEffect(() => {
    if (activeTab === 'candidates') fetchParticipants();
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'ranking') fetchRankings();
  }, [activeTab, fetchParticipants, fetchStats, fetchRankings]);

  // Auto load existing score when candidate is selected
  useEffect(() => {
    if (evalCandidateId) {
      const candidate = participants.find((p) => p.id === evalCandidateId || p.rollNo === evalCandidateId);
      if (candidate && candidate.piScores && candidate.piScores.length > 0) {
        const lastScore = candidate.piScores[candidate.piScores.length - 1];
        setScores({
          techKnowledge: lastScore.technicalScore ?? 20,
          publicSpeaking: lastScore.communicationScore ?? 20,
          project: lastScore.projectScore ?? 20,
          overall: lastScore.attitudeScore ?? 20,
        });
        if (lastScore.interviewerNotes) setInterviewerNotes(lastScore.interviewerNotes);
        if (lastScore.recommendation) setRecommendation(lastScore.recommendation);
      }
    }
  }, [evalCandidateId, participants]);

  // Handle Add Student Submit
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg('');
    if (!newStudent.name || !newStudent.rollNo) {
      setAddMsg('Please enter student name and roll number');
      return;
    }
    setAddingStudent(true);
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
      const data = await res.json();
      if (res.ok) {
        setAddMsg('✅ Student added successfully!');
        setNewStudent({
          name: '',
          rollNo: '',
          email: '',
          branch: 'CSE',
          section: 'A',
          year: '2nd Year',
          primaryDomain: 'Web Development',
          contactNo: '',
          technicalSkills: '',
          projects: '',
          whyBinaryClub: '',
        });
        setShowAddModal(false);
        fetchParticipants();
        fetchStats();
        fetchRankings();
      } else {
        setAddMsg(`❌ ${data.error || 'Failed to add student'}`);
      }
    } catch {
      setAddMsg('❌ Network error while adding student');
    } finally {
      setAddingStudent(false);
    }
  };

  // Handle Delete Student Confirm
  const handleDeleteStudentConfirm = async () => {
    if (!studentToDelete) return;
    setDeletingStudent(true);
    try {
      const res = await fetch(`/api/participants/${studentToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStudentToDelete(null);
        fetchParticipants();
        fetchStats();
        fetchRankings();
      } else {
        alert('Failed to delete student');
      }
    } catch {
      alert('Error deleting student');
    } finally {
      setDeletingStudent(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Invalid username or password');
      } else {
        setCurrentUser(data.user);
        setShowLoginModal(false);
        fetchStats();
        fetchParticipants();
        fetchRankings();
      }
    } catch {
      setLoginError('Server error during login');
    }
  };

  // Handle Logout (Automatically triggers Excel Sheet Record Download)
  const handleLogout = async () => {
    try {
      const currentList = participants && participants.length > 0
        ? participants
        : mergeLocalDataWithParticipants(convertShortlistToParticipants(OFFICIAL_150_SHORTLIST));
      downloadExcelRecord(currentList, 'Binary_Club_Recruitment_Logout_Record');
    } catch (err) {
      console.error('Error downloading Excel record on logout:', err);
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  // One-click seed sample data
  const seedSampleData = async () => {
    try {
      setSeedingSample(true);
      setSampleDataMsg('');
      const res = await fetch('/api/import/sample-data', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSampleDataMsg(`Success: ${data.message}`);
        fetchStats();
        fetchParticipants();
        fetchRankings();
      } else {
        setSampleDataMsg(`Error: ${data.error}`);
      }
    } catch {
      setSampleDataMsg('Error populating sample data');
    } finally {
      setSeedingSample(false);
    }
  };

  // Submit PI Evaluation Score (Saves to Local Storage Device & Syncs API)
  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalCandidateId) {
      setScoringMsg('Please select a candidate to evaluate.');
      return;
    }

    const computedTotal = (scores.techKnowledge || 0) + (scores.publicSpeaking || 0) + (scores.project || 0) + (scores.overall || 0);

    // Save directly to local device localStorage
    if (typeof window !== 'undefined') {
      try {
        const rawScores = localStorage.getItem('binary_rec_local_scores_v1');
        const savedScores = rawScores ? JSON.parse(rawScores) : {};

        const scoreObj = {
          participantId: evalCandidateId,
          techKnowledge: scores.techKnowledge,
          publicSpeaking: scores.publicSpeaking,
          project: scores.project,
          overall: scores.overall,
          totalScore: computedTotal,
          recommendation,
          interviewerNotes,
          updatedAt: new Date().toISOString(),
        };

        savedScores[evalCandidateId] = scoreObj;

        const cand = participants.find((p) => p.id === evalCandidateId || p.rollNo === evalCandidateId);
        if (cand?.rollNo) {
          savedScores[cand.rollNo] = scoreObj;
        }

        localStorage.setItem('binary_rec_local_scores_v1', JSON.stringify(savedScores));
      } catch (e) {
        console.error('Failed to save score on local device:', e);
      }
    }

    setSubmittingScore(true);
    setScoringMsg('');

    // Update state instantly with local merge
    setParticipants((prev) => mergeLocalDataWithParticipants(prev));

    try {
      const targetRoundId = selectedRoundId || piRounds[0]?.id || 'round-1';
      await fetch('/api/pi-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: evalCandidateId,
          piRoundId: targetRoundId,
          ...scores,
          interviewerNotes,
          recommendation,
        }),
      });
    } catch {
      // Backend API write optional (for Vercel link compatibility)
    } finally {
      setSubmittingScore(false);
      setScoringMsg('✅ PI Score saved successfully on your local device!');
      fetchParticipants();
      fetchStats();
      fetchRankings();
    }
  };

  // Quick Selection Status Update (Saves to Local Device localStorage)
  const updateSelectionStatus = async (participantId: string, status: string) => {
    if (typeof window !== 'undefined') {
      try {
        const rawStatuses = localStorage.getItem('binary_rec_local_status_v1');
        const savedStatuses = rawStatuses ? JSON.parse(rawStatuses) : {};
        savedStatuses[participantId] = status;

        const cand = participants.find((p) => p.id === participantId || p.rollNo === participantId);
        if (cand?.rollNo) {
          savedStatuses[cand.rollNo] = status;
        }

        localStorage.setItem('binary_rec_local_status_v1', JSON.stringify(savedStatuses));
      } catch (e) {
        console.error('Failed saving status to local device', e);
      }
    }

    setParticipants((prev) => mergeLocalDataWithParticipants(prev));

    try {
      await fetch('/api/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: [participantId],
          selectionStatus: status,
        }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      fetchParticipants();
      fetchStats();
      fetchRankings();
    }
  };

  // Auto-select Top N Candidates
  const handleAutoSelectTopN = async () => {
    try {
      const res = await fetch('/api/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'AUTO_SELECT_TOP_N',
          topN: topNCount,
          selectionStage: 'SELECTED',
        }),
      });
      if (res.ok) {
        fetchRankings();
        fetchParticipants();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate total score for current form
  const computedTotalScore = Object.values(scores).reduce((a, b) => Number(a) + Number(b), 0);

  // Dynamic Theme Helpers
  const isCute = themeMode === 'cute';
  const isTarget = themeMode === 'target';
  const isSage = themeMode === 'sage';
  const isPurple = themeMode === 'purple';

  // 1. Loading Screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#FFEBD3] flex flex-col items-center justify-center text-[#2D3748] space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#FFB6A6]/40 border border-[#FFB6A6] flex items-center justify-center animate-bounce shadow-lg">
          <Code2 className="w-6 h-6 text-[#2D3748]" />
        </div>
        <div className="flex items-center gap-2 text-sm font-extrabold tracking-wide">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FFB6A6]" />
          Loading Binary Club Recruitment Portal...
        </div>
      </div>
    );
  }

  // 2. Mandatory Login Screen — No Website Content Shown Without Login
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[#FFB6A6] selection:text-[#2D3748] transition-colors duration-300 ${
        isCute
          ? 'bg-gradient-to-br from-[#FFEBD3] via-[#FFF6ED] to-[#9BCEC1]/20 text-[#2D3748]'
          : isTarget
          ? 'bg-gradient-to-br from-[#1F151B] via-[#2D1D26] to-[#120B10] text-[#FFEDCE]'
          : isSage
          ? 'bg-gradient-to-br from-[#1E271F] via-[#2C362D] to-[#161F17] text-[#DAEBE3]'
          : isPurple
          ? 'bg-gradient-to-br from-[#2B1138] via-[#49225B] to-[#16081E] text-[#F5EBFA]'
          : 'bg-gradient-to-br from-black via-[#14213D] to-[#000000] text-white'
      }`}>
        
        {/* Floating Theme Selector (Top Right) */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
          <span className={`text-xs font-bold flex items-center gap-1 ${isCute ? 'text-[#2D3748]' : 'text-slate-300'}`}>
            <Palette className="w-4 h-4" /> Theme:
          </span>
          <div className={`flex items-center gap-1 p-1 rounded-xl border backdrop-blur-md ${
            isCute ? 'bg-white/80 border-[#9BCEC1]/60 shadow-sm' : 'bg-black/60 border-slate-700'
          }`}>
            <button
              onClick={() => setThemeMode('target')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${themeMode === 'target' ? 'bg-[#FF3737] text-white shadow-md glow-target font-black' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              Target Red 🎯
            </button>
            <button
              onClick={() => setThemeMode('cute')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${themeMode === 'cute' ? 'bg-[#FFB6A6] text-[#2D3748] shadow-sm font-black' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              Cute Pastel 🌸
            </button>
            <button
              onClick={() => setThemeMode('sage')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${themeMode === 'sage' ? 'bg-[#99CDD8] text-[#1E271F] font-black' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              Sage 🌿
            </button>
            <button
              onClick={() => setThemeMode('purple')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${themeMode === 'purple' ? 'bg-[#A56ABD] text-black font-black' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              Purple 💜
            </button>
            <button
              onClick={() => setThemeMode('gold')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${themeMode === 'gold' ? 'bg-[#FCA311] text-black font-black' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              Gold 👑
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <div className={`w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl border transition-all duration-300 ${
          isCute
            ? 'glass-panel-cute-card border-[#FFB6A6] glow-cute text-[#2D3748]'
            : isTarget
            ? 'glass-panel-target border-[#FF8383]/50 glow-target'
            : isSage
            ? 'glass-panel-sage border-[#99CDD8]/40 glow-aqua'
            : isPurple
            ? 'glass-panel-purple border-[#A56ABD]/40 glow-purple'
            : 'glass-panel-gold border-[#FCA311]/40 glow-gold'
        }`}>
          
          {/* Header Brand */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl border p-1 bg-white flex items-center justify-center mx-auto shadow-xl overflow-hidden">
              <img src="/logo.png" alt="Binary Club Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>
                Binary Club Recruitment 2026
              </h1>
              <p className={`text-xs font-semibold mt-1 ${isCute ? 'text-slate-600' : 'text-slate-300'}`}>
                Authorized Portal Access • Login Required
              </p>
            </div>
          </div>

          {/* Access Warning Banner */}
          <div className={`p-3.5 rounded-2xl text-xs font-semibold border flex items-start gap-3 ${
            isCute
              ? 'bg-[#FFEBD3] text-[#2D3748] border-[#FFB6A6]/60 shadow-inner'
              : isSage
              ? 'bg-[#1E271F] text-[#DAEBE3] border-[#99CDD8]/40'
              : isPurple
              ? 'bg-[#2B1138] text-[#E7DBEF] border-[#A56ABD]/40'
              : 'bg-black/60 text-slate-200 border-slate-700'
          }`}>
            <Lock className={`w-5 h-5 shrink-0 mt-0.5 ${isCute ? 'text-[#67A2C5]' : 'text-amber-400'}`} />
            <div className="leading-relaxed">
              <strong>Portal Locked:</strong> Candidate shortlists, response form details, PI score rubrics, and selection leaderboards are strictly protected.
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className={`block font-bold mb-1.5 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>
                Username or Email *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter authorized username..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className={`w-full rounded-xl p-3 text-xs focus:outline-none border shadow-inner font-semibold ${
                    isCute
                      ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400 focus:border-[#FFB6A6]'
                      : isSage
                      ? 'bg-[#1E271F] text-white border-[#99CDD8]/40 focus:border-[#99CDD8]'
                      : isPurple
                      ? 'bg-[#2B1138] text-white border-[#A56ABD]/40 focus:border-[#A56ABD]'
                      : 'bg-black text-white border-[#FCA311]/40 focus:border-[#FCA311]'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block font-bold mb-1.5 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full rounded-xl p-3 text-xs focus:outline-none border shadow-inner font-semibold ${
                    isCute
                      ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400 focus:border-[#FFB6A6]'
                      : isSage
                      ? 'bg-[#1E271F] text-white border-[#99CDD8]/40 focus:border-[#99CDD8]'
                      : isPurple
                      ? 'bg-[#2B1138] text-white border-[#A56ABD]/40 focus:border-[#A56ABD]'
                      : 'bg-black text-white border-[#FCA311]/40 focus:border-[#FCA311]'
                  }`}
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-800 text-xs font-bold rounded-xl text-center">
                ❌ {loginError}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 text-xs font-extrabold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 ${
                isCute
                  ? 'bg-[#FFB6A6] text-[#2D3748] hover:bg-[#FFB6A6]/80 glow-cute font-black'
                  : isSage
                  ? 'bg-[#99CDD8] text-[#1E271F] hover:bg-[#99CDD8]/80 glow-aqua'
                  : isPurple
                  ? 'bg-[#A56ABD] text-black hover:bg-[#A56ABD]/80 glow-purple'
                  : 'bg-[#FCA311] text-black hover:bg-[#FCA311]/80 glow-gold'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In to Binary Club Portal
            </button>
          </form>
        </div>

        <div className={`mt-6 text-[11px] text-center font-medium ${isCute ? 'text-slate-600' : 'text-slate-400'}`}>
          Binary Club Recruitment Management System 2026 • Strictly Confidential
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-[#FFB6A6] selection:text-[#2D3748] transition-colors duration-300 ${
      isCute
        ? 'bg-gradient-to-b from-[#FFEBD3] via-[#FFF6ED] to-[#EBF6F3] text-[#2D3748]'
        : isTarget
        ? 'bg-gradient-to-b from-[#1F151B] via-[#2D1D26] to-[#120B10] text-[#FFEDCE]'
        : isSage
        ? 'bg-gradient-to-b from-[#1E271F] via-[#2C362D] to-[#161F17] text-[#DAEBE3]'
        : isPurple
        ? 'bg-gradient-to-b from-[#2B1138] via-[#49225B] to-[#16081E] text-[#F5EBFA]'
        : 'bg-black text-[#E5E5E5]'
    }`}>
      
      {/* Top Banner Navigation */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 transition duration-300 ${
        isCute
          ? 'bg-[#FFEBD3]/95 border-[#9BCEC1]/60 shadow-md glow-cute text-[#2D3748]'
          : isTarget
          ? 'bg-[#2D1D26]/90 border-[#FF8383]/40 shadow-lg glow-target'
          : isSage
          ? 'bg-[#2C362D]/90 border-[#99CDD8]/40 shadow-lg glow-aqua'
          : isPurple
          ? 'bg-[#49225B]/90 border-[#A56ABD]/40 shadow-lg glow-purple'
          : 'bg-[#14213D]/90 border-[#FCA311]/30 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p-0.5 bg-white flex items-center justify-center shadow-lg overflow-hidden border">
              <img src="/logo.png" alt="Binary Club Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold tracking-tight ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>
                  BINARY CLUB <span className={isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}>RECRUITMENT</span>
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full border ${
                  isCute
                    ? 'bg-[#FFB6A6]/30 text-[#2D3748] border-[#FFB6A6]/60 shadow-sm'
                    : isTarget
                    ? 'bg-[#FF3737]/20 text-[#FF8383] border-[#FF8383]/50'
                    : isSage
                    ? 'bg-[#99CDD8]/20 text-[#99CDD8] border-[#99CDD8]/50'
                    : isPurple
                    ? 'bg-[#6E3482]/50 text-[#F5EBFA] border-[#A56ABD]/60'
                    : 'bg-[#FCA311]/20 text-[#FCA311] border-[#FCA311]/40'
                }`}>
                  {isCute ? 'CUTE PASTEL 🌸' : isTarget ? 'CORAL SUNSET RED' : isSage ? 'PASTEL SAGE' : isPurple ? 'PURPLE ELEGANCE' : 'BLACK & GOLD'}
                </span>
              </div>
              <p className={`text-xs ${isCute ? 'text-[#2D3748]/70 font-semibold' : 'text-[#FFEDCE]/80'}`}>Official 225 Shortlisted Candidates (2nd Year)</p>
            </div>
          </div>

          {/* User Auth & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* 5-Way Theme Selector */}
            <div className={`flex items-center p-1 rounded-lg border gap-1 ${
              isCute ? 'bg-white/90 border-[#9BCEC1]/60 shadow-sm' : isTarget ? 'bg-[#1F151B] border-[#FF8383]/40' : isSage ? 'bg-[#1E271F] border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] border-[#A56ABD]/40' : 'bg-black border-[#FCA311]/40'
            }`}>
              <Palette className={`w-3.5 h-3.5 ml-1 ${isCute ? 'text-[#FFB6A6]' : 'text-[#FF3737]'}`} />
              <button
                onClick={() => setThemeMode('cute')}
                className={`px-2 py-1 text-[11px] font-extrabold rounded transition ${themeMode === 'cute' ? 'bg-[#FFB6A6] text-[#2D3748] shadow-sm' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                Cute Pastel 🌸
              </button>
              <button
                onClick={() => setThemeMode('target')}
                className={`px-2 py-1 text-[11px] font-bold rounded transition ${themeMode === 'target' ? 'bg-[#FF3737] text-white' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                Sunset Red
              </button>
              <button
                onClick={() => setThemeMode('sage')}
                className={`px-2 py-1 text-[11px] font-bold rounded transition ${themeMode === 'sage' ? 'bg-[#99CDD8] text-[#1E271F]' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                Sage
              </button>
              <button
                onClick={() => setThemeMode('purple')}
                className={`px-2 py-1 text-[11px] font-bold rounded transition ${themeMode === 'purple' ? 'bg-[#A56ABD] text-black' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                Purple
              </button>
              <button
                onClick={() => setThemeMode('gold')}
                className={`px-2 py-1 text-[11px] font-bold rounded transition ${themeMode === 'gold' ? 'bg-[#FCA311] text-black' : isCute ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                Gold
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition duration-200 shadow-md ${
                isCute
                  ? 'bg-[#FFB6A6] hover:bg-[#FFB6A6]/80 text-[#2D3748] glow-cute'
                  : isTarget
                  ? 'bg-[#FF3737] hover:bg-[#FF3737]/80 text-white glow-target'
                  : isSage
                  ? 'bg-[#F3C3B2] hover:bg-[#F3C3B2]/80 text-[#1E271F] glow-coral'
                  : isPurple
                  ? 'bg-[#A56ABD] hover:bg-[#A56ABD]/80 text-black glow-purple'
                  : 'bg-[#FCA311] hover:bg-[#FCA311]/80 text-black glow-gold'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>

            <button
              onClick={seedSampleData}
              disabled={seedingSample}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg transition duration-200 ${
                isTarget
                  ? 'bg-[#2D1D26] text-[#FF8383] border-[#FF8383]/40 hover:bg-[#FF3737]/20'
                  : isSage
                  ? 'bg-[#2C362D] text-[#99CDD8] border-[#99CDD8]/40 hover:bg-[#99CDD8]/20'
                  : isPurple
                  ? 'bg-[#49225B] text-[#F5EBFA] border-[#A56ABD]/40 hover:bg-[#6E3482]/40'
                  : 'bg-[#14213D] text-[#FCA311] border-[#FCA311]/40 hover:bg-[#FCA311]/20'
              }`}
              title="Reset database to 225 official shortlisted candidates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seedingSample ? 'animate-spin' : ''}`} />
              {seedingSample ? 'Loading 225 Candidates...' : 'Reload 225 Shortlist'}
            </button>

            {currentUser ? (
              <div className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border transition shadow-md ${
                isCute
                  ? 'bg-white/90 border-[#9BCEC1]/60 text-[#2D3748]'
                  : isTarget
                  ? 'bg-[#1F151B]/90 border-[#FF8383]/40'
                  : isSage
                  ? 'bg-[#1E271F]/90 border-[#99CDD8]/40'
                  : isPurple
                  ? 'bg-[#2B1138]/90 border-[#A56ABD]/40'
                  : 'bg-black/80 border-[#FCA311]/30'
              }`}>
                <ShieldCheck className={`w-5 h-5 shrink-0 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF8383]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`} />
                <div className="text-left leading-snug">
                  <div className={`text-xs font-black ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>{currentUser.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[11px] font-mono font-medium select-all ${isCute ? 'text-slate-700' : 'text-slate-200'}`}>
                      {currentUser.email || 'binaryclub@akgec.ac.in'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(currentUser.email || 'binaryclub@akgec.ac.in')}
                      className={`p-1 rounded transition text-xs flex items-center gap-1 border ${
                        copiedEmail === (currentUser.email || 'binaryclub@akgec.ac.in')
                          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40 font-bold'
                          : isCute ? 'hover:bg-slate-100 text-slate-600 border-slate-300' : 'hover:bg-white/10 text-slate-300 border-slate-600'
                      }`}
                      title="Click to copy email address"
                    >
                      {copiedEmail === (currentUser.email || 'binaryclub@akgec.ac.in') ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>
                        </>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className={`text-[10px] font-extrabold uppercase tracking-wide mt-0.5 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FFC193]' : isSage ? 'text-[#F3C3B2]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>
                    {currentUser.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-slate-400 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-500/10"
                  title="Logout (Automatically downloads Excel sheet record)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border rounded-lg transition duration-200 shadow-md ${
                  isSage
                    ? 'bg-[#2C362D] text-[#99CDD8] border-[#99CDD8]/50 hover:bg-[#2C362D]/80'
                    : isPurple
                    ? 'bg-[#6E3482] text-white border-[#A56ABD]/50 hover:bg-[#6E3482]/80'
                    : 'bg-[#14213D] text-[#FCA311] border-[#FCA311]/40'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Admin / Interviewer Login
              </button>
            )}
          </div>
        </div>

        {sampleDataMsg && (
          <div className={`max-w-7xl mx-auto mt-2 text-xs rounded p-2 text-center border ${
            isSage
              ? 'text-[#99CDD8] bg-[#2C362D] border-[#99CDD8]/50'
              : isPurple
              ? 'text-[#E7DBEF] bg-[#49225B] border-[#A56ABD]/50'
              : 'text-[#FCA311] bg-[#14213D] border-[#FCA311]/50'
          }`}>
            {sampleDataMsg}
          </div>
        )}
      </header>

      {/* Main Navigation Tabs */}
      <div className={`border-b px-6 py-2 ${
        isCute ? 'bg-[#FFEBD3]/80 border-[#9BCEC1]/50' : isTarget ? 'bg-[#1F151B]/90 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F]/90 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138]/90 border-[#A56ABD]/30' : 'bg-black border-[#FCA311]/20'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard & Analytics', icon: BarChart3 },
            { id: 'candidates', label: 'Candidate Directory (225 Candidates — 2nd Year)', icon: Users },
            { id: 'import', label: 'Import PDF / Data', icon: UploadCloud },
            { id: 'scoring', label: 'PI Scoring Tool', icon: Sliders },
            { id: 'ranking', label: 'Rankings & Selection', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition duration-150 whitespace-nowrap ${
                  isActive
                    ? isCute
                      ? 'bg-[#FFB6A6] text-[#2D3748] shadow-[#FFB6A6]/50 shadow-md border border-[#FFB6A6] glow-cute font-black'
                      : isTarget
                      ? 'bg-[#FF3737] text-white shadow-[#FF3737]/50 shadow-md border border-[#FF8383] glow-target font-extrabold'
                      : isSage
                      ? 'bg-[#99CDD8] text-[#1E271F] shadow-[#99CDD8]/40 shadow-md border border-[#99CDD8] glow-aqua font-extrabold'
                      : isPurple
                      ? 'bg-[#6E3482] text-white shadow-[#6E3482]/50 shadow-md border border-[#A56ABD]/60 glow-purple'
                      : 'bg-[#FCA311] text-black shadow-[#FCA311]/30 shadow-md glow-gold'
                    : isCute
                    ? 'text-[#2D3748]/70 hover:text-[#2D3748] hover:bg-[#9BCEC1]/30'
                    : 'text-[#FFEDCE]/70 hover:text-white hover:bg-[#2D1D26]/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* TAB 1: DASHBOARD & ANALYTICS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className={`p-5 rounded-2xl border ${
                isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`}>Total Shortlisted</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCute ? 'bg-[#9BCEC1]/30 text-[#67A2C5]' : isSage ? 'bg-[#99CDD8]/20 text-[#99CDD8]' : isPurple ? 'bg-[#6E3482]/40 text-[#E7DBEF]' : 'bg-[#FCA311]/10 text-[#FCA311]'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className={`mt-3 text-3xl font-extrabold ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>{stats?.totalApplicants || 0}</div>
                <p className={`text-[11px] mt-1 ${isCute ? 'text-[#2D3748]/70' : 'text-[#DAEBE3]/70'}`}>Official Binary Club 2026</p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`}>PI Evaluated</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className={`mt-3 text-3xl font-extrabold ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>{stats?.piCompletedCount || 0}</div>
                <p className={`text-[11px] mt-1 ${isCute ? 'text-emerald-700 font-semibold' : 'text-emerald-300'}`}>{stats?.piPendingCount || 0} candidates pending PI</p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`}>Shortlisted / Selected</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCute ? 'bg-[#FFB6A6]/30 text-[#FFB6A6]' : isSage ? 'bg-[#F3C3B2]/20 text-[#F3C3B2]' : isPurple ? 'bg-[#6E3482]/40 text-[#E7DBEF]' : 'bg-[#FCA311]/10 text-[#FCA311]'}`}>
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className={`mt-3 text-3xl font-extrabold ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>
                  {(stats?.shortlistedCount || 0) + (stats?.selectedCount || 0)}
                </div>
                <p className={`text-[11px] mt-1 ${isCute ? 'text-[#FFB6A6] font-bold' : isSage ? 'text-[#F3C3B2]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`}>{stats?.selectedCount || 0} Final Selected</p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`}>Avg PI Score</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCute ? 'bg-[#9BCEC1]/30 text-[#67A2C5]' : isSage ? 'bg-[#99CDD8]/20 text-[#99CDD8]' : isPurple ? 'bg-[#6E3482]/40 text-[#E7DBEF]' : 'bg-[#FCA311]/10 text-[#FCA311]'}`}>
                    <Star className="w-4 h-4" />
                  </div>
                </div>
                <div className={`mt-3 text-3xl font-extrabold ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>{stats?.averagePIScore || 0}<span className={`text-sm font-normal ${isCute ? 'text-[#2D3748]/60' : 'text-[#DAEBE3]/60'}`}>/100</span></div>
                <p className={`text-[11px] mt-1 ${isCute ? 'text-[#2D3748]/70' : 'text-[#DAEBE3]/70'}`}>Across official candidate list</p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`}>Export Report</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCute ? 'bg-[#9BCEC1]/30 text-[#67A2C5]' : isSage ? 'bg-[#99CDD8]/20 text-[#99CDD8]' : isPurple ? 'bg-[#6E3482]/40 text-[#E7DBEF]' : 'bg-[#FCA311]/10 text-[#FCA311]'}`}>
                    <Download className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <a
                    href="/api/export?format=pdf"
                    download
                    className={`text-xs font-semibold hover:underline flex items-center gap-1 ${isCute ? 'text-[#67A2C5] font-bold' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Download PDF Report
                  </a>
                  <a
                    href="/api/export?format=excel"
                    download
                    className={`text-xs font-semibold hover:underline flex items-center gap-1 ${isCute ? 'text-emerald-700 font-bold' : 'text-emerald-300'}`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel Sheet
                  </a>
                </div>
              </div>
            </div>

            {/* Spotlight Top Ranked Candidates */}
            <div className={`rounded-2xl p-6 space-y-4 border ${
              isCute
                ? 'glass-panel-cute-card border-[#9BCEC1]/70 shadow-lg glow-cute'
                : isSage
                ? 'glass-panel-sage-card border-[#99CDD8]/40 shadow-xl glow-coral'
                : isPurple
                ? 'glass-panel-purple border-[#A56ABD]/40 shadow-xl glow-purple'
                : 'glass-panel-gold border-[#FCA311]/30'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-extrabold flex items-center gap-2 ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>
                    <Sparkles className={`w-5 h-5 ${isCute ? 'text-[#FFB6A6]' : isSage ? 'text-[#F3C3B2]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`} />
                    Top Ranked Candidates Spotlight
                  </h2>
                  <p className={`text-xs ${isCute ? 'text-[#2D3748]/80 font-medium' : 'text-[#DAEBE3]/80'}`}>Highest composite scoring candidates from official 225 shortlist</p>
                </div>
                <button
                  onClick={() => setActiveTab('ranking')}
                  className={`text-xs font-bold hover:underline flex items-center gap-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}
                >
                  View All Rankings <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {stats?.topCandidates && stats.topCandidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {stats.topCandidates.map((cand, idx) => (
                    <div key={cand.id} className={`rounded-xl p-4 flex flex-col justify-between space-y-3 border ${
                      isCute
                        ? 'bg-[#FFEBD3]/90 border-[#9BCEC1]/60 shadow-sm'
                        : isSage
                        ? 'bg-[#1E271F]/80 border-[#99CDD8]/30'
                        : isPurple
                        ? 'bg-[#49225B]/80 border-[#A56ABD]/40'
                        : 'bg-[#000000]/80 border-[#FCA311]/30'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                            isCute
                              ? 'bg-[#FFB6A6] text-[#2D3748]'
                              : isSage
                              ? 'bg-[#99CDD8] text-[#1E271F]'
                              : isPurple
                              ? 'bg-[#A56ABD] text-black'
                              : 'bg-[#FCA311] text-black'
                          }`}>
                            RANK #{cand.rank || (idx + 1)}
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`}>{cand.rollNo}</span>
                        </div>
                        <h3 className={`font-bold text-sm mt-2 leading-tight ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>{cand.name}</h3>
                        <div className={`text-xs mt-1 ${isCute ? 'text-[#2D3748]/70 font-semibold' : 'text-[#DAEBE3]/70'}`}>{cand.branch} • {cand.domain}</div>
                      </div>

                      <div className={`pt-2 border-t flex items-center justify-between ${isCute ? 'border-[#9BCEC1]/40' : isSage ? 'border-[#657166]' : isPurple ? 'border-[#6E3482]' : 'border-[#14213D]'}`}>
                        <span className={`text-xs font-extrabold ${isCute ? 'text-[#67A2C5] font-black' : isSage ? 'text-[#F3C3B2]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>{cand.score} pts</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          isCute
                            ? 'bg-[#9BCEC1]/30 text-[#2D3748] border-[#9BCEC1]'
                            : isSage
                            ? 'bg-[#99CDD8]/20 text-[#99CDD8] border-[#99CDD8]/30'
                            : isPurple
                            ? 'bg-[#6E3482]/40 text-[#E7DBEF] border-[#A56ABD]/40'
                            : 'bg-[#FCA311]/20 text-[#FCA311] border-[#FCA311]/30'
                        }`}>
                          {cand.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 text-sm rounded-xl border ${isCute ? 'text-slate-600 bg-white/60 border-[#9BCEC1]/40' : 'text-[#DAEBE3]/50 bg-black/40 border-[#99CDD8]/20'}`}>
                  No candidates found. Click &quot;Reload 225 Shortlist&quot; above!
                </div>
              )}
            </div>

            {/* Domain & Branch Breakdown Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Domain Breakdown */}
              <div className={`p-6 rounded-2xl border ${isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'}`}>
                <h3 className={`text-base font-bold mb-1 flex items-center gap-2 ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>
                  <Code2 className={`w-5 h-5 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`} /> Primary Technical Domains
                </h3>
                <p className={`text-xs mb-4 ${isCute ? 'text-[#2D3748]/80 font-medium' : 'text-[#DAEBE3]/70'}`}>Official candidate count across technical domains</p>
                
                {stats?.domainStats && stats.domainStats.length > 0 ? (
                  <div className="space-y-3">
                    {stats.domainStats.map((item) => {
                      const percentage = Math.round((item.value / (stats.totalApplicants || 1)) * 100);
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className={isCute ? 'text-[#2D3748]' : 'text-white'}>{item.name}</span>
                            <span className={isCute ? 'text-[#67A2C5] font-extrabold' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}>{item.value} candidates ({percentage}%)</span>
                          </div>
                          <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isCute ? 'bg-[#FFEBD3] border-[#9BCEC1]/50' : 'bg-black/60 border-[#99CDD8]/20'}`}>
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isCute ? 'bg-gradient-to-r from-[#FFB6A6] to-[#67A2C5] glow-cute' : isSage ? 'bg-gradient-to-r from-[#99CDD8] to-[#F3C3B2] glow-aqua' : isPurple ? 'bg-gradient-to-r from-[#6E3482] to-[#A56ABD] glow-purple' : 'bg-[#FCA311] glow-gold'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4">No domain data yet.</p>
                )}
              </div>

              {/* Branch Breakdown */}
              <div className={`p-6 rounded-2xl border ${isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'}`}>
                <h3 className={`text-base font-bold mb-1 flex items-center gap-2 ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>
                  <Building2 className={`w-5 h-5 ${isCute ? 'text-[#FFB6A6]' : isSage ? 'text-[#F3C3B2]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`} /> Academic Branches
                </h3>
                <p className={`text-xs mb-4 ${isCute ? 'text-[#2D3748]/80 font-medium' : 'text-[#DAEBE3]/70'}`}>Official candidate count by academic branch</p>
                
                {stats?.branchStats && stats.branchStats.length > 0 ? (
                  <div className="space-y-3">
                    {stats.branchStats.map((item) => {
                      const percentage = Math.round((item.value / (stats.totalApplicants || 1)) * 100);
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className={isCute ? 'text-[#2D3748]' : 'text-white'}>{item.name}</span>
                            <span className={isCute ? 'text-[#67A2C5] font-extrabold' : 'text-[#DAEBE3]'}>{item.value} candidates ({percentage}%)</span>
                          </div>
                          <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isCute ? 'bg-[#FFEBD3] border-[#9BCEC1]/50' : 'bg-black/60 border-[#99CDD8]/20'}`}>
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isCute ? 'bg-gradient-to-r from-[#9BCEC1] to-[#67A2C5]' : isSage ? 'bg-gradient-to-r from-[#657166] to-[#F3C3B2]' : isPurple ? 'bg-gradient-to-r from-[#49225B] to-[#E7DBEF]' : 'bg-gradient-to-r from-[#14213D] to-[#FCA311]'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4">No branch data yet.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CANDIDATES DIRECTORY */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">

            {/* Filter & Search Bar + Add Student Button */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'}`}>
              
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className={`w-4 h-4 absolute left-3 top-3 ${isCute ? 'text-[#FFB6A6]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`} />
                <input
                  type="text"
                  placeholder="Search name, roll no, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400 focus:border-[#FFB6A6]' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40 focus:border-[#99CDD8] placeholder-[#DAEBE3]/50' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40 focus:border-[#A56ABD] placeholder-[#DAEBE3]/50' : 'bg-black text-white border-[#FCA311]/40 focus:border-[#FCA311] placeholder-[#DAEBE3]/50'}`}
                />
              </div>

              {/* Filters & Add Button */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </div>

                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className={`rounded-lg text-xs px-3 py-1.5 focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                >
                  <option value="ALL">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="CSE-AIML">CSE-AIML</option>
                  <option value="CS">CS</option>
                  <option value="DS">DS</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="IoT">IoT</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className={`rounded-lg text-xs px-3 py-1.5 focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                >
                  <option value="ALL">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>

                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className={`rounded-lg text-xs px-3 py-1.5 focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                >
                  <option value="ALL">All Domains</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Competitive Programming">Competitive Programming</option>
                  <option value="Android Development">Android Development</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`rounded-lg text-xs px-3 py-1.5 focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SHORTLISTED">SHORTLISTED</option>
                  <option value="SELECTED">SELECTED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                <button
                  onClick={() => setShowAddModal(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-lg shadow-sm transition ml-auto md:ml-0 ${
                    isCute ? 'bg-[#FFB6A6] text-[#2D3748] hover:bg-[#FFB6A6]/80 glow-cute' : isSage ? 'bg-[#F3C3B2] text-[#1E271F] hover:bg-[#F3C3B2]/80 glow-coral' : isPurple ? 'bg-[#A56ABD] text-black hover:bg-[#A56ABD]/80 glow-purple' : 'bg-[#FCA311] text-black hover:bg-[#FCA311]/80 glow-gold'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Student
                </button>
              </div>

            </div>

            {/* Candidates List Table */}
            <div className={`rounded-2xl border overflow-hidden ${isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase tracking-wider font-bold border-b ${isCute ? 'bg-[#FFEBD3] text-[#67A2C5] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F]/90 text-[#99CDD8] border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138]/90 text-[#A56ABD] border-[#A56ABD]/40' : 'bg-black/90 text-[#FCA311] border-[#FCA311]/30'}`}>
                    <tr>
                      <th className="py-3.5 px-4">Candidate Name</th>
                      <th className="py-3.5 px-4">Roll No</th>
                      <th className="py-3.5 px-4">Branch & Section</th>
                      <th className="py-3.5 px-4">Primary Domain</th>
                      <th className="py-3.5 px-4">PI Score</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isCute ? 'divide-[#9BCEC1]/30' : isSage ? 'divide-[#99CDD8]/20' : isPurple ? 'divide-[#A56ABD]/20' : 'divide-[#FCA311]/10'}`}>
                    {loadingParticipants ? (
                      <tr>
                        <td colSpan={7} className={`text-center py-8 ${isCute ? 'text-slate-500' : 'text-[#DAEBE3]/60'}`}>Loading candidate directory...</td>
                      </tr>
                    ) : participants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={`text-center py-12 ${isCute ? 'text-slate-500' : 'text-[#DAEBE3]/50'}`}>
                          No candidates found. Click &quot;Add Student&quot; or &quot;Reload 225 Shortlist&quot;.
                        </td>
                      </tr>
                    ) : (
                      participants.map((p) => (
                        <tr key={p.id} className={`transition ${isCute ? 'hover:bg-[#FFEBD3]/50 text-[#1A202C]' : isTarget ? 'hover:bg-slate-800/50' : isSage ? 'hover:bg-[#657166]/30' : isPurple ? 'hover:bg-[#6E3482]/30' : 'hover:bg-[#14213D]/40'}`}>
                          <td className="py-3.5 px-4">
                            <div className={`font-bold text-sm ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>{p.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[11px] font-mono break-all select-all ${isCute ? 'text-slate-600 font-medium' : 'text-slate-300'}`}>{p.email}</span>
                              {p.email && (
                                <button
                                  onClick={() => copyToClipboard(p.email)}
                                  className="text-slate-400 hover:text-emerald-400 transition p-0.5"
                                  title="Copy Email"
                                >
                                  {copiedEmail === p.email ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className={`py-3.5 px-4 font-mono font-bold ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF4D6D]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>{p.rollNo}</td>
                          <td className={`py-3.5 px-4 ${isCute ? 'text-slate-700' : 'text-slate-200'}`}>
                            {p.branch} • Sec {p.section} • <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">{p.year || '2nd Year'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${isTarget ? 'bg-[#E11D48]/20 text-[#FF4D6D] border-[#E11D48]/40' : isSage ? 'bg-[#99CDD8]/20 text-[#99CDD8] border-[#99CDD8]/40' : isPurple ? 'bg-[#6E3482]/40 text-[#E7DBEF] border-[#A56ABD]/50' : 'bg-[#FCA311]/20 text-[#FCA311] border-[#FCA311]/30'}`}>
                              {p.primaryDomain}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 font-extrabold text-sm ${isTarget ? 'text-[#E11D48]' : isSage ? 'text-[#F3C3B2]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>
                            {p.finalResult?.totalScore ?? (p.avgPIScore ? p.avgPIScore.toFixed(1) : '-')} pts
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={p.finalResult?.selectionStatus || 'SHORTLISTED'}
                              onChange={(e) => updateSelectionStatus(p.id, e.target.value)}
                              className={`text-[11px] font-bold rounded px-2 py-1 focus:outline-none border ${isSage ? 'bg-[#1E271F] text-[#99CDD8] border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-[#E7DBEF] border-[#A56ABD]/40' : 'bg-black text-[#FCA311] border-[#FCA311]/40'}`}
                            >
                              <option value="SHORTLISTED">SHORTLISTED</option>
                              <option value="SELECTED">SELECTED</option>
                              <option value="PENDING">PENDING</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedCandidate(p)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded border transition ${isSage ? 'bg-[#2C362D] hover:bg-[#657166] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#49225B] hover:bg-[#6E3482] text-white border-[#A56ABD]/40' : 'bg-[#14213D] hover:bg-[#14213D]/80 text-[#E5E5E5] border-[#FCA311]/30'}`}
                            >
                              <Eye className="w-3 h-3 inline mr-1" /> Profile
                            </button>
                            <button
                              onClick={() => {
                                setEvalCandidateId(p.id);
                                setActiveTab('scoring');
                              }}
                              className={`px-2.5 py-1 text-[11px] font-extrabold rounded transition shadow-sm ${isSage ? 'bg-[#99CDD8] hover:bg-[#99CDD8]/80 text-[#1E271F]' : isPurple ? 'bg-[#A56ABD] hover:bg-[#A56ABD]/80 text-black' : 'bg-[#FCA311] hover:bg-[#FCA311]/80 text-black'}`}
                            >
                              <Sliders className="w-3 h-3 inline mr-1" /> Score
                            </button>
                            <button
                              onClick={() => setStudentToDelete(p)}
                              className="px-2 py-1 text-[11px] font-bold bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 rounded transition"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3 h-3 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: IMPORT PDF / SHEET DATA */}
        {activeTab === 'import' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className={`p-8 rounded-2xl border text-center space-y-6 ${isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/40' : isPurple ? 'glass-panel-purple border-[#A56ABD]/40' : 'glass-panel border-[#FCA311]/20'}`}>
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto ${isCute ? 'bg-[#FFB6A6]/20 border-[#FFB6A6]/60 text-[#FFB6A6] glow-cute' : isSage ? 'bg-[#99CDD8]/20 border-[#99CDD8]/50 text-[#99CDD8] glow-aqua' : isPurple ? 'bg-[#6E3482]/40 border-[#A56ABD]/50 text-[#E7DBEF] glow-purple' : 'bg-[#FCA311]/10 border-[#FCA311]/30 text-[#FCA311] glow-gold'}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h2 className={`text-xl font-extrabold ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>Import Recruitment Form PDF / Document</h2>
                <p className={`text-xs mt-1 ${isCute ? 'text-slate-600 font-medium' : 'text-[#DAEBE3]/70'}`}>
                  Upload PDF response summaries or Excel sheets to parse candidate profiles automatically
                </p>
              </div>

              {/* Upload Drop Zone */}
              <div className={`border-2 border-dashed p-8 rounded-xl transition flex flex-col items-center cursor-pointer ${isCute ? 'border-[#9BCEC1]/60 hover:border-[#FFB6A6] bg-white/80' : isSage ? 'border-[#99CDD8]/40 hover:border-[#99CDD8] bg-[#1E271F]/60' : isPurple ? 'border-[#A56ABD]/40 hover:border-[#A56ABD] bg-[#2B1138]/60' : 'border-[#FCA311]/30 hover:border-[#FCA311] bg-black/60'}`}>
                <FileText className={`w-10 h-10 mb-2 ${isCute ? 'text-[#FFB6A6]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`} />
                <span className={`text-sm font-bold ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>Click or Drag & Drop PDF response sheet</span>
                <span className={`text-xs mt-1 ${isCute ? 'text-slate-500' : 'text-[#DAEBE3]/60'}`}>Supports Google Form PDFs, Excel (.xlsx), CSV files</span>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.csv"
                  className="hidden"
                  onChange={() => alert('File upload handler ready! For quick testing, click "Reload 225 Shortlist" above.')}
                />
              </div>

              <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isCute ? 'border-[#9BCEC1]/40' : isSage ? 'border-[#99CDD8]/30' : isPurple ? 'border-[#A56ABD]/30' : 'border-[#FCA311]/20'}`}>
                <div className={`text-xs text-left ${isCute ? 'text-slate-600 font-medium' : 'text-slate-300'}`}>
                  <div className={`font-bold ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Official 225 Candidate Shortlist</div>
                  <div>Reload all 225 shortlisted candidates directly into the database.</div>
                </div>
                <button
                  onClick={seedSampleData}
                  disabled={seedingSample}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition shadow-md whitespace-nowrap ${isCute ? 'bg-[#FFB6A6] hover:bg-[#FFB6A6]/80 text-[#2D3748] glow-cute' : isSage ? 'bg-[#99CDD8] hover:bg-[#99CDD8]/80 text-[#1E271F] glow-aqua' : isPurple ? 'bg-[#A56ABD] hover:bg-[#A56ABD]/80 text-black glow-purple' : 'bg-[#FCA311] hover:bg-[#FCA311]/80 text-black glow-gold'}`}
                >
                  {seedingSample ? 'Loading...' : 'Reload 225 Shortlist'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PI SCORING TOOL */}
        {activeTab === 'scoring' && (() => {
          const selectedEvalCandidate = participants.find((p) => p.id === evalCandidateId);
          const computedTotalScore = (scores.techKnowledge || 0) + (scores.publicSpeaking || 0) + (scores.project || 0) + (scores.overall || 0);

          return (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`p-6 rounded-2xl border ${isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-md' : isSage ? 'glass-panel-sage border-[#99CDD8]/40' : isPurple ? 'glass-panel-purple border-[#A56ABD]/40' : 'glass-panel border-[#FF3737]/30'}`}>
                
                {/* Header & Live Score Meter */}
                <div className={`flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b mb-6 gap-4 ${isCute ? 'border-[#9BCEC1]/50' : isSage ? 'border-[#99CDD8]/30' : isPurple ? 'border-[#A56ABD]/30' : 'border-[#FF3737]/30'}`}>
                  <div>
                    <h2 className={`text-xl font-black flex items-center gap-2.5 ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>
                      <Sliders className={`w-6 h-6 ${isCute ? 'text-[#FFB6A6]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FF3737]'}`} /> 
                      Personal Interview (PI) Scoring Tool
                    </h2>
                    <p className={`text-xs mt-1 ${isCute ? 'text-[#2D3748]/70 font-semibold' : 'text-[#DAEBE3]/70'}`}>4-Category Rubric: Tech Knowledge, Public Speaking, Project & Overall (Max 25 pts each)</p>
                  </div>

                  {/* Big Calculated Score Display Card */}
                  <div className={`p-4 rounded-2xl border flex items-center gap-4 shadow-xl ${
                    isCute
                      ? 'bg-[#FFEBD3] border-[#FFB6A6]/60 text-[#2D3748]'
                      : isSage 
                      ? 'bg-[#1E271F] border-[#99CDD8]/40 text-[#99CDD8]' 
                      : isPurple 
                      ? 'bg-[#2B1138] border-[#A56ABD]/40 text-[#A56ABD]' 
                      : 'bg-gradient-to-r from-red-950/80 to-black border-[#FF3737]/50 text-[#FF8383]'
                  }`}>
                    <div className="text-right">
                      <div className={`text-[10px] font-extrabold uppercase tracking-widest ${isCute ? 'text-[#2D3748]/70' : 'text-[#DAEBE3]/70'}`}>Total Score</div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black tracking-tight ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>{computedTotalScore}</span>
                        <span className={`text-xs font-bold ${isCute ? 'text-[#2D3748]/60' : 'text-white/50'}`}>/ 100</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                      computedTotalScore >= 85
                        ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40 font-black'
                        : computedTotalScore >= 70
                        ? 'bg-blue-500/20 text-blue-700 border-blue-500/40 font-black'
                        : computedTotalScore >= 50
                        ? 'bg-amber-500/20 text-amber-700 border-amber-500/40 font-black'
                        : 'bg-red-500/20 text-red-700 border-red-500/40 font-black'
                    }`}>
                      {computedTotalScore >= 85 ? '⭐ Excellent' : computedTotalScore >= 70 ? '👍 Strong' : computedTotalScore >= 50 ? '⚡ Average' : '⚠️ Low'}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleScoreSubmit} className="space-y-6">
                  
                  {/* Candidate Selection Row */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FF8383]'}`}>
                      Select Candidate *
                    </label>
                    <select
                      value={evalCandidateId}
                      onChange={(e) => setEvalCandidateId(e.target.value)}
                      className={`w-full rounded-xl p-3 text-xs focus:outline-none border shadow-inner ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 focus:border-[#FFB6A6]' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40 focus:border-[#99CDD8]' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40 focus:border-[#A56ABD]' : 'bg-black text-white border-[#FF3737]/40 focus:border-[#FF3737]'}`}
                      required
                    >
                      <option value="">-- Choose Candidate to Evaluate --</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.rollNo} • {p.primaryDomain})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Candidate Info Quick Preview Card */}
                  {selectedEvalCandidate && (
                    <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${isCute ? 'bg-[#FFEBD3]/80 border-[#FFB6A6]/60 text-[#2D3748]' : isSage ? 'bg-[#1E271F]/80 border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138]/80 border-[#A56ABD]/40' : 'bg-red-950/20 border-[#FF3737]/30'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border ${isCute ? 'bg-[#FFB6A6]/30 text-[#FFB6A6] border-[#FFB6A6]/60' : isSage ? 'bg-[#99CDD8]/20 text-[#99CDD8] border-[#99CDD8]/40' : isPurple ? 'bg-[#A56ABD]/20 text-[#A56ABD] border-[#A56ABD]/40' : 'bg-[#FF3737]/20 text-[#FF8383] border-[#FF3737]/40'}`}>
                          {selectedEvalCandidate.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-extrabold text-sm md:text-base ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>{selectedEvalCandidate.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isCute ? 'bg-[#67A2C5]/20 text-[#67A2C5] border-[#67A2C5]/40 font-extrabold' : isSage ? 'bg-[#99CDD8]/10 text-[#99CDD8] border-[#99CDD8]/30' : isPurple ? 'bg-[#A56ABD]/10 text-[#A56ABD] border-[#A56ABD]/30' : 'bg-[#FF3737]/10 text-[#FF8383] border-[#FF3737]/30'}`}>
                              {selectedEvalCandidate.rollNo}
                            </span>
                          </div>
                          <div className={`text-xs flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 ${isCute ? 'text-[#2D3748]/80 font-semibold' : 'text-[#DAEBE3]/70'}`}>
                            <span>🎯 {selectedEvalCandidate.primaryDomain}</span>
                            <span>🎓 {selectedEvalCandidate.year} • {selectedEvalCandidate.branch}</span>
                            {selectedEvalCandidate.contactNo && <span>📞 {selectedEvalCandidate.contactNo}</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(selectedEvalCandidate)}
                        className={`px-3.5 py-2 text-xs font-extrabold rounded-lg border flex items-center gap-1.5 transition ${isCute ? 'bg-[#FFB6A6] text-[#2D3748] border-[#FFB6A6] hover:bg-[#FFB6A6]/80' : isSage ? 'bg-[#99CDD8]/10 text-[#99CDD8] border-[#99CDD8]/40 hover:bg-[#99CDD8]/20' : isPurple ? 'bg-[#A56ABD]/10 text-[#A56ABD] border-[#A56ABD]/40 hover:bg-[#A56ABD]/20' : 'bg-[#FF3737]/10 text-[#FF8383] border-[#FF3737]/40 hover:bg-[#FF3737]/20'}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile & Answers
                      </button>
                    </div>
                  )}

                  {/* 4 Rubric Evaluation Grid */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className={`text-xs font-black uppercase tracking-wider ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FF8383]'}`}>
                        Evaluation Rubric (4 Sections • Max 25 Points Each)
                      </h3>
                      <span className={`text-[11px] ${isCute ? 'text-slate-500 font-medium' : 'text-[#DAEBE3]/60'}`}>Use sliders or big number buttons to set score</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          key: 'techKnowledge',
                          title: 'Tech Knowledge',
                          desc: 'Technical concepts, coding aptitude & core domain fundamentals',
                          icon: Terminal,
                          badgeColor: isCute ? 'border-[#67A2C5]/50 text-[#67A2C5] bg-[#67A2C5]/10' : 'border-red-500/40 text-red-300 bg-red-500/10',
                        },
                        {
                          key: 'publicSpeaking',
                          title: 'Public Speaking',
                          desc: 'Communication clarity, confidence, articulation & presentation',
                          icon: Mic,
                          badgeColor: isCute ? 'border-[#FFB6A6]/60 text-[#FFB6A6] bg-[#FFB6A6]/10' : 'border-amber-500/40 text-amber-300 bg-amber-500/10',
                        },
                        {
                          key: 'project',
                          title: 'Project',
                          desc: 'Project implementation, practical skills & technical portfolio',
                          icon: Cpu,
                          badgeColor: isCute ? 'border-[#9BCEC1]/60 text-[#9BCEC1] bg-[#9BCEC1]/10' : 'border-orange-500/40 text-orange-300 bg-orange-500/10',
                        },
                        {
                          key: 'overall',
                          title: 'Overall',
                          desc: 'Team attitude, problem solving mindset & club contribution',
                          icon: Star,
                          badgeColor: isCute ? 'border-emerald-600/50 text-emerald-700 bg-emerald-500/10' : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
                        },
                      ].map((section) => {
                        const IconComp = section.icon;
                        const val = (scores as any)[section.key] || 0;

                        return (
                          <div
                            key={section.key}
                            className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition duration-200 hover:shadow-xl ${
                              isCute
                                ? 'bg-white/95 border-[#9BCEC1]/60 text-[#2D3748] hover:border-[#FFB6A6]/80'
                                : isSage
                                ? 'bg-[#1E271F]/80 border-[#99CDD8]/30 hover:border-[#99CDD8]/60'
                                : isPurple
                                ? 'bg-[#2B1138]/80 border-[#A56ABD]/30 hover:border-[#A56ABD]/60'
                                : 'bg-black/70 border-[#FF3737]/30 hover:border-[#FF3737]/60'
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl border ${section.badgeColor}`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className={`font-extrabold text-sm ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>{section.title}</h4>
                                  <p className={`text-[11px] line-clamp-1 ${isCute ? 'text-slate-500' : 'text-[#DAEBE3]/60'}`}>{section.desc}</p>
                                </div>
                              </div>
                            </div>

                            {/* Big Number & Increment Control Area */}
                            <div className={`p-3 rounded-xl border flex items-center justify-between ${
                              isCute ? 'bg-[#FFEBD3]/60 border-[#9BCEC1]/40' : isSage ? 'bg-[#2C362D]/60 border-[#99CDD8]/20' : isPurple ? 'bg-[#49225B]/60 border-[#A56ABD]/20' : 'bg-red-950/30 border-[#FF3737]/20'
                            }`}>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-4xl md:text-5xl font-black ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FF8383]'}`}>
                                  {val}
                                </span>
                                <span className={`text-xs font-extrabold ${isCute ? 'text-slate-500' : 'text-white/50'}`}>/ 25 pts</span>
                              </div>

                              {/* Quick - / + Buttons */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setScores({ ...scores, [section.key]: Math.max(0, val - 1) })}
                                  className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center border transition ${
                                    isCute
                                      ? 'bg-white text-[#2D3748] border-[#9BCEC1]/60 hover:bg-[#FFEBD3]'
                                      : isSage
                                      ? 'bg-[#1E271F] text-white border-[#99CDD8]/30 hover:bg-[#99CDD8]/20'
                                      : isPurple
                                      ? 'bg-[#2B1138] text-white border-[#A56ABD]/30 hover:bg-[#A56ABD]/20'
                                      : 'bg-black text-white border-[#FF3737]/30 hover:bg-[#FF3737]/20'
                                  }`}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setScores({ ...scores, [section.key]: Math.min(25, val + 1) })}
                                  className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center border transition ${
                                    isCute
                                      ? 'bg-[#FFB6A6] text-[#2D3748] border-[#FFB6A6] hover:bg-[#FFB6A6]/80'
                                      : isSage
                                      ? 'bg-[#99CDD8] text-black border-[#99CDD8] hover:bg-[#99CDD8]/80'
                                      : isPurple
                                      ? 'bg-[#A56ABD] text-black border-[#A56ABD] hover:bg-[#A56ABD]/80'
                                      : 'bg-[#FF3737] text-white border-[#FF3737] hover:bg-[#FF3737]/80'
                                  }`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Interactive Range Slider */}
                            <div className="space-y-1.5">
                              <input
                                type="range"
                                min={0}
                                max={25}
                                step={1}
                                value={val}
                                onChange={(e) => setScores({ ...scores, [section.key]: Number(e.target.value) })}
                                className={`w-full h-2.5 rounded-lg cursor-pointer transition ${
                                  isCute
                                    ? 'accent-[#67A2C5] bg-[#FFEBD3]'
                                    : isSage
                                    ? 'accent-[#99CDD8] bg-[#2C362D]'
                                    : isPurple
                                    ? 'accent-[#A56ABD] bg-[#49225B]'
                                    : 'accent-[#FF3737] bg-slate-900'
                                }`}
                              />
                              
                              {/* Preset Buttons for Quick Tapping */}
                              <div className={`flex items-center justify-between text-[10px] pt-1 ${isCute ? 'text-slate-500' : 'text-[#DAEBE3]/50'}`}>
                                {[0, 5, 10, 15, 20, 25].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setScores({ ...scores, [section.key]: preset })}
                                    className={`px-1.5 py-0.5 rounded font-bold border transition ${
                                      val === preset
                                        ? isCute
                                          ? 'bg-[#67A2C5] text-white border-[#67A2C5]'
                                          : isSage
                                          ? 'bg-[#99CDD8] text-black border-[#99CDD8]'
                                          : isPurple
                                          ? 'bg-[#A56ABD] text-black border-[#A56ABD]'
                                          : 'bg-[#FF3737] text-white border-[#FF3737]'
                                        : 'bg-transparent border-transparent hover:border-slate-300 hover:text-slate-800'
                                    }`}
                                  >
                                    {preset}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommendation & Notes */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className={`block text-xs font-bold mb-2 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FF8383]'}`}>
                        Interviewer Recommendation *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'STRONGLY_RECOMMEND', label: 'Strongly Recommend ⭐', color: isCute ? 'border-[#FFB6A6] text-[#2D3748] bg-[#FFB6A6]/30' : isSage ? 'border-[#99CDD8] text-[#99CDD8] bg-[#99CDD8]/20' : isPurple ? 'border-[#A56ABD] text-[#F5EBFA] bg-[#6E3482]/50' : 'border-[#FF3737] text-[#FF8383] bg-[#FF3737]/20' },
                          { id: 'RECOMMEND', label: 'Recommend 👍', color: 'border-emerald-500 text-emerald-700 bg-emerald-500/20' },
                          { id: 'MAYBE', label: 'Maybe / Borderline ⚡', color: 'border-amber-500 text-amber-800 bg-amber-500/20' },
                          { id: 'NOT_RECOMMENDED', label: 'Not Recommended ❌', color: 'border-red-500 text-red-700 bg-red-500/20' },
                        ].map((rec) => (
                          <button
                            key={rec.id}
                            type="button"
                            onClick={() => setRecommendation(rec.id)}
                            className={`px-3 py-2.5 text-xs font-extrabold rounded-xl border transition ${
                              recommendation === rec.id
                                ? `${rec.color} ring-2 ${isCute ? 'ring-[#FFB6A6]' : isSage ? 'ring-[#99CDD8]' : isPurple ? 'ring-[#A56ABD]' : 'ring-[#FF3737]'}`
                                : isCute
                                ? 'border-[#9BCEC1]/50 bg-white text-slate-600 hover:bg-[#FFEBD3]'
                                : isSage
                                ? 'border-[#99CDD8]/30 bg-[#1E271F] text-[#DAEBE3]/60 hover:bg-[#2C362D]'
                                : isPurple
                                ? 'border-[#A56ABD]/30 bg-[#2B1138] text-[#E7DBEF]/60 hover:bg-[#49225B]'
                                : 'border-[#FF3737]/30 bg-black text-slate-400 hover:bg-red-950/30'
                            }`}
                          >
                            {rec.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FF8383]'}`}>
                        Interviewer Feedback & Qualitative Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter detailed observations, specific strengths, or concerns during interview..."
                        value={interviewerNotes}
                        onChange={(e) => setInterviewerNotes(e.target.value)}
                        className={`w-full rounded-xl p-3 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400 focus:border-[#FFB6A6]' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40 focus:border-[#99CDD8] placeholder-slate-500' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40 focus:border-[#A56ABD] placeholder-slate-500' : 'bg-black text-white border-[#FF3737]/40 focus:border-[#FF3737] placeholder-slate-500'}`}
                      />
                    </div>
                  </div>

                  {scoringMsg && (
                    <div className={`p-3 rounded-xl text-xs font-bold border ${scoringMsg.includes('✅') ? (isCute ? 'bg-[#9BCEC1]/30 text-emerald-800 border-[#9BCEC1]' : isSage ? 'bg-[#2C362D] text-[#99CDD8] border-[#99CDD8]' : isPurple ? 'bg-[#49225B] text-[#F5EBFA] border-[#A56ABD]' : 'bg-red-950/60 text-[#FF8383] border-[#FF3737]') : 'bg-red-100 text-red-800 border-red-400'}`}>
                      {scoringMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingScore}
                    className={`w-full py-3.5 font-extrabold text-xs rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 ${isCute ? 'bg-[#FFB6A6] hover:bg-[#FFB6A6]/80 text-[#2D3748] glow-cute' : isSage ? 'bg-[#99CDD8] hover:bg-[#99CDD8]/80 text-[#1E271F] glow-aqua' : isPurple ? 'bg-[#A56ABD] hover:bg-[#A56ABD]/80 text-black glow-purple' : 'bg-[#FF3737] hover:bg-[#FF3737]/80 text-white glow-sunset-red'}`}
                  >
                    <Save className="w-4 h-4" />
                    {submittingScore ? 'Saving Evaluation...' : 'Submit Official PI Evaluation Score'}
                  </button>
                </form>
              </div>
            </div>
          );
        })()}

        {/* TAB 5: RANKINGS & SELECTION */}
        {activeTab === 'ranking' && (
          <div className="space-y-6">

            {/* Header & Quick Batch Control */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'}`}>
              <div>
                <h2 className={`text-lg font-extrabold flex items-center gap-2 ${isCute ? 'text-[#2D3748]' : 'text-white'}`}>
                  <Award className={`w-5 h-5 ${isCute ? 'text-[#FFB6A6]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`} /> Automated Candidate Composite Ranking
                </h2>
                <p className={`text-xs ${isCute ? 'text-slate-500 font-medium' : 'text-[#DAEBE3]/70'}`}>Official 225 shortlist ranks calculated dynamically based on score</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className={`flex items-center gap-2 p-1.5 rounded-lg border ${isCute ? 'bg-white border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] border-[#A56ABD]/40' : 'bg-black border-[#FCA311]/40'}`}>
                  <span className={`text-xs font-bold pl-2 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Top</span>
                  <input
                    type="number"
                    min={1}
                    max={225}
                    value={topNCount}
                    onChange={(e) => setTopNCount(Number(e.target.value))}
                    className={`w-14 rounded text-center text-xs font-bold py-1 border ${isCute ? 'bg-[#FFEBD3] text-[#2D3748] border-[#FFB6A6]/60' : isSage ? 'bg-[#2C362D] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#49225B] text-white border-[#A56ABD]/40' : 'bg-[#14213D] text-white border-[#FCA311]/40'}`}
                  />
                  <button
                    onClick={handleAutoSelectTopN}
                    className={`px-3 py-1 text-xs font-extrabold rounded transition ${isCute ? 'bg-[#FFB6A6] text-[#2D3748] hover:bg-[#FFB6A6]/80' : isSage ? 'bg-[#99CDD8] text-[#1E271F] hover:bg-[#99CDD8]/80' : isPurple ? 'bg-[#A56ABD] text-black hover:bg-[#A56ABD]/80' : 'bg-[#FCA311] text-black hover:bg-[#FCA311]/80'}`}
                  >
                    Auto Select Top {topNCount}
                  </button>
                </div>

                <a
                  href="/api/export?format=pdf"
                  download
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border ${isSage ? 'bg-[#2C362D] text-[#99CDD8] border-[#99CDD8]/40' : isPurple ? 'bg-[#49225B] text-[#F5EBFA] border-[#A56ABD]/40' : 'bg-[#14213D] text-[#FCA311] border-[#FCA311]/40'}`}
                >
                  <FileText className="w-3.5 h-3.5" /> Export PDF Report
                </a>
              </div>
            </div>

            {/* Rankings Table */}
            <div className={`rounded-2xl border overflow-hidden ${isCute ? 'glass-panel-cute border-[#9BCEC1]/60 shadow-sm' : isSage ? 'glass-panel-sage border-[#99CDD8]/30' : isPurple ? 'glass-panel-purple border-[#A56ABD]/30' : 'glass-panel border-[#FCA311]/20'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase tracking-wider font-bold border-b ${isCute ? 'bg-[#FFEBD3] text-[#67A2C5] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F]/90 text-[#99CDD8] border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138]/90 text-[#A56ABD] border-[#A56ABD]/40' : 'bg-black/90 text-[#FCA311] border-[#FCA311]/30'}`}>
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Branch & Sec</th>
                      <th className="py-3.5 px-4">Domain</th>
                      <th className="py-3.5 px-4 text-center">Total Score</th>
                      <th className="py-3.5 px-4">Recommendation</th>
                      <th className="py-3.5 px-4">Selection Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isCute ? 'divide-[#9BCEC1]/30' : isSage ? 'divide-[#99CDD8]/20' : isPurple ? 'divide-[#A56ABD]/20' : 'divide-[#FCA311]/10'}`}>
                    {loadingRankings ? (
                      <tr>
                        <td colSpan={7} className={`text-center py-8 ${isCute ? 'text-slate-500' : 'text-[#DAEBE3]/60'}`}>Calculating rankings...</td>
                      </tr>
                    ) : rankings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={`text-center py-12 ${isCute ? 'text-slate-500' : 'text-[#DAEBE3]/50'}`}>
                          No ranked candidates available. Click &quot;Reload 225 Shortlist&quot; to view live ranking!
                        </td>
                      </tr>
                    ) : (
                      rankings.map((r) => (
                        <tr key={r.id} className={`transition ${isCute ? 'hover:bg-[#FFEBD3]/50 text-[#1A202C]' : isSage ? 'hover:bg-[#657166]/30' : isPurple ? 'hover:bg-[#6E3482]/30' : 'hover:bg-[#14213D]/40'}`}>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-extrabold text-xs ${
                              r.finalRank === 1
                                ? isCute ? 'bg-[#FFB6A6] text-[#2D3748] shadow-md glow-cute font-black' : isSage ? 'bg-[#99CDD8] text-[#1E271F] shadow-lg glow-aqua font-extrabold' : isPurple ? 'bg-[#A56ABD] text-black shadow-lg glow-purple' : 'bg-[#FCA311] text-black shadow-lg glow-gold'
                                : r.finalRank === 2
                                ? 'bg-[#9BCEC1] text-[#2D3748] font-black'
                                : r.finalRank === 3
                                ? 'bg-[#FFEBD3] text-[#2D3748] font-black border border-[#FFB6A6]/50'
                                : isCute ? 'bg-white text-[#67A2C5] border border-[#9BCEC1]/60' : isSage ? 'bg-[#2C362D] text-[#99CDD8] border border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-[#A56ABD] border border-[#A56ABD]/40' : 'bg-[#14213D] text-[#FCA311] border border-[#FCA311]/30'
                            }`}>
                              #{r.finalRank}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className={`font-bold text-sm ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>{r.name}</div>
                            <div className={`text-[11px] font-mono ${isCute ? 'text-[#67A2C5] font-bold' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>{r.rollNo}</div>
                          </td>
                          <td className={`py-3.5 px-4 ${isCute ? 'text-slate-700 font-semibold' : 'text-white'}`}>{r.branch} ({r.section})</td>
                          <td className={`py-3.5 px-4 ${isCute ? 'text-slate-700 font-semibold' : 'text-white'}`}>{r.primaryDomain}</td>
                          <td className={`py-3.5 px-4 text-center font-extrabold text-base ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#F3C3B2]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>
                            {r.totalScore ? r.totalScore.toFixed(1) : '0'} pts
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              r.recommendation === 'STRONGLY_RECOMMEND'
                                ? isSage ? 'bg-[#99CDD8]/20 text-[#99CDD8] border border-[#99CDD8]/40' : isPurple ? 'bg-[#6E3482]/40 text-[#F5EBFA] border border-[#A56ABD]/50' : 'bg-[#FCA311]/20 text-[#FCA311] border border-[#FCA311]/30'
                                : r.recommendation === 'RECOMMEND'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : r.recommendation === 'MAYBE'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {r.recommendation}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={r.selectionStatus || 'SHORTLISTED'}
                              onChange={(e) => updateSelectionStatus(r.id, e.target.value)}
                              className={`text-[11px] font-bold rounded px-2.5 py-1 focus:outline-none border ${isSage ? 'bg-[#1E271F] text-[#99CDD8] border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-[#E7DBEF] border-[#A56ABD]/40' : 'bg-black text-[#FCA311] border-[#FCA311]/40'}`}
                            >
                              <option value="SHORTLISTED">SHORTLISTED</option>
                              <option value="SELECTED">SELECTED</option>
                              <option value="PENDING">PENDING</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl p-6 space-y-6 border ${isCute ? 'glass-panel-cute-card border-[#FFB6A6] shadow-2xl glow-cute text-[#2D3748]' : isSage ? 'glass-panel-sage-card border-[#99CDD8]/50 shadow-2xl glow-aqua' : isPurple ? 'glass-panel-purple border-[#A56ABD]/50 shadow-2xl glow-purple' : 'glass-panel-gold border-[#FCA311]/40'}`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isCute ? 'border-[#9BCEC1]/60' : isSage ? 'border-[#99CDD8]/30' : isPurple ? 'border-[#A56ABD]/30' : 'border-[#FCA311]/30'}`}>
              <h2 className={`text-lg font-extrabold flex items-center gap-2 ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>
                <UserPlus className={`w-5 h-5 ${isCute ? 'text-[#FFB6A6]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`} /> Add New Student Details
              </h2>
              <button onClick={() => setShowAddModal(false)} className={`p-1 ${isCute ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Student Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400 focus:border-[#FFB6A6]' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40 focus:border-[#99CDD8]' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40 focus:border-[#A56ABD]' : 'bg-black text-white border-[#FCA311]/40 focus:border-[#FCA311]'}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Roll Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2500330100999"
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400 focus:border-[#FFB6A6]' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40 focus:border-[#99CDD8]' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40 focus:border-[#A56ABD]' : 'bg-black text-white border-[#FCA311]/40 focus:border-[#FCA311]'}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Branch</label>
                  <select
                    value={newStudent.branch}
                    onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                  >
                    <option value="CSE">CSE</option>
                    <option value="CSE-AIML">CSE-AIML</option>
                    <option value="CS">CS</option>
                    <option value="DS">DS</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="IoT">IoT</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Section</label>
                  <select
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="2A">2A</option>
                    <option value="2B">2B</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Year</label>
                  <select
                    value={newStudent.year}
                    onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Primary Domain</label>
                  <select
                    value={newStudent.primaryDomain}
                    onChange={(e) => setNewStudent({ ...newStudent, primaryDomain: e.target.value })}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Competitive Programming">Competitive Programming</option>
                    <option value="Android Development">Android Development</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Email</label>
                  <input
                    type="email"
                    placeholder="student@binaryclub.org"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Technical Skills</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Python, TailwindCSS"
                  value={newStudent.technicalSkills}
                  onChange={(e) => setNewStudent({ ...newStudent, technicalSkills: e.target.value })}
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Projects / Portfolio</label>
                <textarea
                  rows={2}
                  placeholder="Enter project summary..."
                  value={newStudent.projects}
                  onChange={(e) => setNewStudent({ ...newStudent, projects: e.target.value })}
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60 placeholder-slate-400' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                />
              </div>

              {addMsg && (
                <div className={`p-2.5 rounded text-xs font-bold ${addMsg.includes('✅') ? (isCute ? 'bg-[#9BCEC1]/30 text-emerald-800' : isSage ? 'bg-[#2C362D] text-[#99CDD8]' : isPurple ? 'bg-[#49225B] text-[#F5EBFA]' : 'bg-[#14213D] text-[#FCA311]') : 'bg-red-100 text-red-800'}`}>
                  {addMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={addingStudent}
                className={`w-full py-2.5 font-extrabold text-xs rounded-lg shadow-md transition ${isCute ? 'bg-[#FFB6A6] hover:bg-[#FFB6A6]/80 text-[#2D3748] glow-cute' : isSage ? 'bg-[#99CDD8] hover:bg-[#99CDD8]/80 text-[#1E271F] glow-aqua' : isPurple ? 'bg-[#A56ABD] hover:bg-[#A56ABD]/80 text-black glow-purple' : 'bg-[#FCA311] hover:bg-[#FCA311]/80 text-black glow-gold'}`}
              >
                {addingStudent ? 'Adding Student...' : 'Save & Register Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 space-y-6 text-center border ${isSage ? 'glass-panel-sage border-red-500/50' : isPurple ? 'glass-panel-purple border-red-500/50' : 'glass-panel-gold border-red-500/40'}`}>
            <div className="w-14 h-14 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">Delete Student Details?</h3>
              <p className="text-xs text-slate-300 mt-2">
                Are you sure you want to permanently delete <span className={`font-bold ${isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>{studentToDelete.name}</span> (Roll No: <span className={`font-mono ${isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>{studentToDelete.rollNo}</span>)?
              </p>
              <p className="text-[11px] text-red-400 mt-1">This action cannot be undone.</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border ${isSage ? 'bg-[#2C362D] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#49225B] text-white border-[#A56ABD]/40' : 'bg-[#14213D] text-white border-[#FCA311]/30'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudentConfirm}
                disabled={deletingStudent}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-lg shadow-md transition"
              >
                {deletingStudent ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE DETAIL MODAL */}
      {selectedCandidate && (() => {
        const displayCand = enrichStudent(selectedCandidate as any) as any;
        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 space-y-6 border ${isCute ? 'glass-panel-cute-card border-[#FFB6A6] shadow-2xl glow-cute text-[#2D3748]' : isTarget ? 'glass-panel-target border-[#FF8383]/50 shadow-2xl glow-target' : isSage ? 'glass-panel-sage border-[#99CDD8]/50 shadow-2xl glow-aqua' : isPurple ? 'glass-panel-purple border-[#A56ABD]/50 shadow-2xl glow-purple' : 'glass-panel-gold border-[#FCA311]/40'}`}>
              
              <div className={`flex items-start justify-between border-b pb-4 ${isCute ? 'border-[#9BCEC1]/60' : isTarget ? 'border-[#FF8383]/30' : isSage ? 'border-[#99CDD8]/30' : isPurple ? 'border-[#A56ABD]/30' : 'border-[#FCA311]/30'}`}>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${isCute ? 'bg-[#FFB6A6]/30 text-[#2D3748] border-[#FFB6A6]/60 font-black' : isTarget ? 'bg-[#FF3737]/20 text-[#FF8383] border-[#FF8383]/40' : isSage ? 'bg-[#99CDD8]/20 text-[#99CDD8] border-[#99CDD8]/40' : isPurple ? 'bg-[#6E3482]/50 text-[#F5EBFA] border-[#A56ABD]/60' : 'bg-[#FCA311]/20 text-[#FCA311] border-[#FCA311]/40'}`}>
                    {displayCand.primaryDomain}
                  </span>
                  <h2 className={`text-xl font-extrabold mt-2 ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>{displayCand.name}</h2>
                  <p className={`text-xs ${isCute ? 'text-slate-600 font-medium' : 'text-[#FFEDCE]/80'}`}>{displayCand.rollNo} • {displayCand.branch} (Sec {displayCand.section}) • <span className={`font-bold ${isCute ? 'text-emerald-700' : 'text-emerald-300'}`}>{displayCand.year || '2nd Year'}</span></p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className={`p-1 ${isCute ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-xl border space-y-1 ${isCute ? 'bg-white border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B]/80 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F]/80 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138]/80 border-[#A56ABD]/30' : 'bg-black/80 border-[#FCA311]/20'}`}>
                  <div className={`font-bold flex items-center justify-between gap-1.5 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
                    {displayCand.email && (
                      <button
                        onClick={() => copyToClipboard(displayCand.email)}
                        className={`p-1 rounded text-xs flex items-center gap-1 border transition ${
                          copiedEmail === displayCand.email
                            ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                            : isCute ? 'hover:bg-slate-100 text-slate-600 border-slate-300' : 'hover:bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                        title="Copy Email Address"
                      >
                        {copiedEmail === displayCand.email ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className={`font-mono text-xs break-all select-all font-semibold ${isCute ? 'text-slate-700' : 'text-slate-200'}`}>{displayCand.email}</div>
                </div>
                <div className={`p-3 rounded-xl border space-y-1 ${isCute ? 'bg-white border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B]/80 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F]/80 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138]/80 border-[#A56ABD]/30' : 'bg-black/80 border-[#FCA311]/20'}`}>
                  <div className={`font-bold flex items-center gap-1.5 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}><Phone className="w-3.5 h-3.5" /> Contact</div>
                  <div className={`font-mono ${isCute ? 'text-slate-700' : 'text-slate-200'}`}>{displayCand.contactNo}</div>
                </div>
                <div className={`p-3 rounded-xl border space-y-1 ${isCute ? 'bg-white border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B]/80 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F]/80 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138]/80 border-[#A56ABD]/30' : 'bg-black/80 border-[#FCA311]/20'}`}>
                  <div className={`font-bold ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Instagram</div>
                  <div className={`font-mono truncate ${isCute ? 'text-[#FFB6A6] font-extrabold' : isTarget ? 'text-[#FF8383]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#E7DBEF]' : 'text-[#FCA311]'}`}>{displayCand.instagramId}</div>
                </div>
                <div className={`p-3 rounded-xl border space-y-1 ${isCute ? 'bg-white border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B]/80 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F]/80 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138]/80 border-[#A56ABD]/30' : 'bg-black/80 border-[#FCA311]/20'}`}>
                  <div className={`font-bold ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>LinkedIn</div>
                  <div className={`font-mono truncate ${isCute ? 'text-slate-700' : 'text-slate-200'}`}>{displayCand.linkedinId}</div>
                </div>
              </div>

              {displayCand.threeWords && (
                <div className={`p-2.5 rounded-xl text-center border ${isCute ? 'bg-[#FFB6A6]/20 border-[#FFB6A6]/60' : isTarget ? 'bg-[#FF3737]/10 border-[#FF8383]/30' : isSage ? 'bg-[#99CDD8]/10 border-[#99CDD8]/30' : isPurple ? 'bg-[#6E3482]/30 border-[#A56ABD]/40' : 'bg-[#FCA311]/10 border-[#FCA311]/30'}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Self Description: </span>
                  <span className={`text-xs font-extrabold ${isCute ? 'text-[#1A202C]' : 'text-white'}`}>“{displayCand.threeWords}”</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <div className={`font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Technical Skills & Experience</div>
                  <div className={`p-3 rounded-xl font-mono leading-relaxed border ${isCute ? 'bg-white text-slate-800 border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B] text-slate-300 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F] text-slate-300 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138] text-slate-300 border-[#A56ABD]/30' : 'bg-black text-slate-300 border-[#FCA311]/20'}`}>{displayCand.technicalSkills}</div>
                </div>

                {displayCand.contributionStrengths && (
                  <div>
                    <div className={`font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Contribution Strengths & Key Skills</div>
                    <div className={`p-3 rounded-xl leading-relaxed border ${isCute ? 'bg-white text-slate-800 border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B] text-slate-300 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F] text-slate-300 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138] text-slate-300 border-[#A56ABD]/30' : 'bg-black text-slate-300 border-[#FCA311]/20'}`}>{displayCand.contributionStrengths}</div>
                  </div>
                )}

                <div>
                  <div className={`font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Projects & Technical Work</div>
                  <div className={`p-3 rounded-xl leading-relaxed border ${isCute ? 'bg-white text-slate-800 border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B] text-slate-300 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F] text-slate-300 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138] text-slate-300 border-[#A56ABD]/30' : 'bg-black text-slate-300 border-[#FCA311]/20'}`}>{displayCand.projects}</div>
                </div>

                <div>
                  <div className={`font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Why Binary Club?</div>
                  <div className={`p-3 rounded-xl italic leading-relaxed border ${isCute ? 'bg-white text-slate-800 border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B] text-slate-300 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F] text-slate-300 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138] text-slate-300 border-[#A56ABD]/30' : 'bg-black text-slate-300 border-[#FCA311]/20'}`}>&quot;{displayCand.whyBinaryClub}&quot;</div>
                </div>

                {displayCand.eventIdeas && (
                  <div>
                    <div className={`font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isTarget ? 'text-[#FF3737]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Event Ideas & Suggestions</div>
                    <div className={`p-3 rounded-xl leading-relaxed border ${isCute ? 'bg-white text-slate-800 border-[#9BCEC1]/60' : isTarget ? 'bg-[#1F151B] text-slate-300 border-[#FF8383]/30' : isSage ? 'bg-[#1E271F] text-slate-300 border-[#99CDD8]/30' : isPurple ? 'bg-[#2B1138] text-slate-300 border-[#A56ABD]/30' : 'bg-black text-slate-300 border-[#FCA311]/20'}`}>{displayCand.eventIdeas}</div>
                  </div>
                )}
              </div>

            <div className={`pt-4 border-t flex justify-between items-center ${isCute ? 'border-[#9BCEC1]/60' : isTarget ? 'border-[#FF8383]/30' : isSage ? 'border-[#99CDD8]/30' : isPurple ? 'border-[#A56ABD]/30' : 'border-[#FCA311]/30'}`}>
              <button
                onClick={() => {
                  setStudentToDelete(selectedCandidate);
                  setSelectedCandidate(null);
                }}
                className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-300 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Student
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border ${isCute ? 'bg-white text-slate-700 border-[#9BCEC1]/60 hover:bg-[#FFEBD3]' : isTarget ? 'bg-[#2D1D26] text-white border-[#FF8383]/40' : isSage ? 'bg-[#2C362D] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#49225B] text-white border-[#A56ABD]/40' : 'bg-[#14213D] text-white border-[#FCA311]/30'}`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setEvalCandidateId(selectedCandidate.id);
                    setSelectedCandidate(null);
                    setActiveTab('scoring');
                  }}
                  className={`px-4 py-2 font-extrabold text-xs rounded-lg shadow-md ${isCute ? 'bg-[#FFB6A6] text-[#2D3748] glow-cute' : isTarget ? 'bg-[#FF3737] text-white glow-target' : isSage ? 'bg-[#99CDD8] text-[#1E271F] glow-aqua' : isPurple ? 'bg-[#A56ABD] text-black glow-purple' : 'bg-[#FCA311] text-black glow-gold'}`}
                >
                  Score in PI Round
                </button>
              </div>
            </div>

          </div>
        </div>
        );
      })()}

      {/* LOGIN / ROLE SWITCH MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 space-y-6 border ${isSage ? 'glass-panel-sage border-[#99CDD8]/40' : isPurple ? 'glass-panel-purple border-[#A56ABD]/40' : 'glass-panel-gold border-[#FCA311]/40'}`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isSage ? 'border-[#99CDD8]/30' : isPurple ? 'border-[#A56ABD]/30' : 'border-[#FCA311]/30'}`}>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`} /> Portal Login & Switch Role
              </h2>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Username or Email</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isCute ? 'text-[#67A2C5]' : isSage ? 'text-[#99CDD8]' : isPurple ? 'text-[#A56ABD]' : 'text-[#FCA311]'}`}>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none border ${isCute ? 'bg-white text-[#1A202C] border-[#9BCEC1]/60' : isSage ? 'bg-[#1E271F] text-white border-[#99CDD8]/40' : isPurple ? 'bg-[#2B1138] text-white border-[#A56ABD]/40' : 'bg-black text-white border-[#FCA311]/40'}`}
                  required
                />
              </div>

              {loginError && (
                <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 font-extrabold text-xs rounded-lg shadow-md transition ${isSage ? 'bg-[#99CDD8] text-[#1E271F] glow-aqua' : isPurple ? 'bg-[#A56ABD] text-black glow-purple' : 'bg-[#FCA311] text-black glow-gold'}`}
              >
                Sign In to Recruitment Portal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
