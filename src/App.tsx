/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Search, BarChart3, FileText, ArrowRight, CheckCircle2, AlertCircle, Loader2, RefreshCw, Copy, Check, LogOut, Plus, Folder } from 'lucide-react';
import { API_URL, getAuthHeader } from './services/api';

interface User {
  id: number;
  email: string;
}

interface Project {
  id: number;
  name: string;
  created_at: string;
}

interface AnalysisResult {
  id: number;
  geo_score: number;
  entity_score: number;
  structure_score: number;
  citation_score: number;
  clarity_score: number;
  formatting_score: number;
  weaknesses: string[];
  strengths: string[];
  suggestions: string[];
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'analyzer'>('login');
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Dashboard State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Analyzer State
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rewrittenContent, setRewrittenContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (token) {
      setView('dashboard');
      fetchProjects();
    }
  }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        logout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setView('dashboard');
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Login failed');
    }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setView('dashboard');
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setView('login');
  };

  const createProject = async () => {
    if (!newProjectName) return;
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName })
      });
      if (res.ok) {
        setNewProjectName('');
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openProject = (project: Project) => {
    setCurrentProject(project);
    setView('analyzer');
    setResult(null);
    setContent('');
    setTopic('');
  };

  const handleAnalyze = async () => {
    if (!content.trim() || !topic.trim() || !currentProject) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setRewrittenContent(null);
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: currentProject.id,
          content, 
          topic 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to analyze content.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRewrite = async () => {
    if (!content || !topic || !result) return;

    setIsRewriting(true);
    try {
      const res = await fetch(`${API_URL}/analyze/rewrite`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          topic,
          suggestions: result.suggestions
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRewrittenContent(data.rewritten);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to rewrite content.");
    } finally {
      setIsRewriting(false);
    }
  };

  const copyToClipboard = () => {
    if (!rewrittenContent) return;
    navigator.clipboard.writeText(rewrittenContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-slate-200">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="bg-violet-600 p-2 rounded-lg">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">GEO Optimizer</span>
          </div>
          
          <h2 className="text-xl font-semibold mb-6 text-center">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={view === 'login' ? login : register} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-violet-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-violet-500 outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors">
              {view === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {view === 'login' ? (
              <p>Don't have an account? <button onClick={() => setView('register')} className="text-violet-600 font-medium">Sign up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setView('login')} className="text-violet-600 font-medium">Log in</button></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-violet-600 p-2 rounded-lg">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">GEO Optimizer</span>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-slate-900 flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Your Projects</h1>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Project Name"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500 outline-none"
              />
              <button 
                onClick={createProject}
                className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => openProject(project)}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-violet-500 cursor-pointer transition-all shadow-sm hover:shadow-md group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-violet-50 p-3 rounded-lg group-hover:bg-violet-100 transition-colors">
                    <Folder className="w-6 h-6 text-violet-600" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{project.name}</h3>
                <p className="text-slate-500 text-sm">Click to open analyzer</p>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                No projects yet. Create one to get started.
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-violet-600 p-2 rounded-lg">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">GEO Optimizer</span>
            <span className="text-slate-300 mx-2">/</span>
            <span className="font-medium text-slate-600">{currentProject?.name}</span>
          </div>
          <button onClick={() => setView('dashboard')} className="text-sm font-medium text-slate-500 hover:text-violet-600">
            Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Input Section */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Target Topic / Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Sustainable Coffee Brewing"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Content to Analyze
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your article, blog post, or product description here..."
                  className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none font-mono text-sm"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content || !topic}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:pl-8">
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-500 font-medium uppercase tracking-wider text-sm mb-1">GEO Score</h3>
                    <div className="text-5xl font-bold text-slate-900">{result.geo_score}/100</div>
                  </div>
                  <div className="h-20 w-20 rounded-full border-8 border-violet-100 flex items-center justify-center relative">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-violet-600"
                      style={{ clipPath: `inset(0 ${100 - result.geo_score}% 0 0)` }}
                    />
                    <BarChart3 className="w-8 h-8 text-violet-600" />
                  </div>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-sm text-slate-500">Entity Score</div>
                    <div className="text-xl font-bold text-slate-900">{result.entity_score}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-sm text-slate-500">Structure Score</div>
                    <div className="text-xl font-bold text-slate-900">{result.structure_score}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-sm text-slate-500">Citation Score</div>
                    <div className="text-xl font-bold text-slate-900">{result.citation_score}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-sm text-slate-500">Clarity Score</div>
                    <div className="text-xl font-bold text-slate-900">{result.clarity_score}</div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Strengths
                    </h3>
                    <ul className="space-y-3">
                      {result.strengths.map((item, i) => (
                        <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                    <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Improvements
                    </h3>
                    <ul className="space-y-3">
                      {result.weaknesses.map((item, i) => (
                        <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Plan */}
                <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100">
                  <h3 className="font-semibold text-violet-900 mb-4">Optimization Suggestions</h3>
                  <div className="space-y-4">
                    {result.suggestions.map((suggestion, i) => (
                      <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-violet-100 shadow-sm">
                        <div className="bg-violet-100 text-violet-700 font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm">
                          {i + 1}
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed pt-1">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {!rewrittenContent && (
                    <button
                      onClick={handleRewrite}
                      disabled={isRewriting}
                      className="mt-6 w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isRewriting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Rewriting Content...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Rewrite Content with AI
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Rewritten Content */}
                {rewrittenContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-violet-200 ring-4 ring-violet-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-violet-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        Optimized Content
                      </h3>
                      <button
                        onClick={copyToClipboard}
                        className="text-sm font-medium text-slate-500 hover:text-violet-600 flex items-center gap-1.5 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="prose prose-slate prose-sm max-w-none bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                        {rewrittenContent}
                      </pre>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <Sparkles className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Ready to Optimize</h3>
                <p className="max-w-md mx-auto">
                  Select a project and enter content to start analyzing.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}



