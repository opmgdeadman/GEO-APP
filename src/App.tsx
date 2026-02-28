/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Search, BarChart3, FileText, ArrowRight, CheckCircle2, AlertCircle, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { analyzeContentForGeo, rewriteContentForGeo, GeoAnalysisResult } from './services/gemini';

const SAMPLE_TOPIC = "How to make cold brew coffee";
const SAMPLE_CONTENT = `
Cold brew coffee is really popular these days. It is different from iced coffee because you don't use hot water. You just let the grounds sit in water for a long time.

To make it, you need coffee beans. Grind them up but not too fine. Put them in a jar with water. Leave it on the counter or in the fridge for like 12 to 24 hours. Then strain it.

It tastes smoother than regular coffee because it has less acid. You can add milk or sugar if you want. It keeps in the fridge for a while.
`;

export default function App() {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [result, setResult] = useState<GeoAnalysisResult | null>(null);
  const [rewrittenContent, setRewrittenContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadSample = () => {
    setTopic(SAMPLE_TOPIC);
    setContent(SAMPLE_CONTENT);
    setResult(null);
    setRewrittenContent(null);
  };

  const handleAnalyze = async () => {
    if (!content.trim() || !topic.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setRewrittenContent(null);
    try {
      const data = await analyzeContentForGeo(content, topic);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRewrite = async () => {
    if (!content || !topic || !result) return;

    setIsRewriting(true);
    try {
      const rewritten = await rewriteContentForGeo(content, topic, result.suggestions);
      setRewrittenContent(rewritten);
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
          <div className="flex items-center gap-4">
            <button 
              onClick={loadSample}
              className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Load Sample Content
            </button>
            <div className="text-sm font-medium text-slate-500 hidden sm:block">
              Generative Engine Optimization
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Input Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight text-slate-900">
                Optimize for the AI Era
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Traditional SEO isn't enough. Analyze your content to see how well it performs with AI search engines like Gemini, ChatGPT, and Perplexity.
              </p>
            </div>

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
                    Analyzing Structure & Authority...
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
                    <div className="text-5xl font-bold text-slate-900">{result.score}/100</div>
                  </div>
                  <div className="h-20 w-20 rounded-full border-8 border-violet-100 flex items-center justify-center relative">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-violet-600"
                      style={{ clipPath: `inset(0 ${100 - result.score}% 0 0)` }}
                    />
                    <BarChart3 className="w-8 h-8 text-violet-600" />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    Analysis Summary
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {result.summary}
                  </p>
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
                  Enter your content and target topic to see how AI engines interpret your work.
                </p>
                <button 
                  onClick={loadSample}
                  className="mt-6 text-violet-600 font-medium hover:underline"
                >
                  Try with a sample topic
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


