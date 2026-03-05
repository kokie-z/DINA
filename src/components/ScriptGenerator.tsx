import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PenTool, Loader2, Sparkles, FileText, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateConcepts, generateScriptOutline, suggestKeywords } from '../services/gemini';
import { cn } from '../utils';

export function ScriptGenerator() {
  const [keywords, setKeywords] = useState('');
  const [theme, setTheme] = useState('');
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<{keyword: string, explanation: string}[] | null>(null);
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [concepts, setConcepts] = useState<{title: string, description: string}[] | null>(null);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);
  
  const [selectedConcept, setSelectedConcept] = useState('');
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [outline, setOutline] = useState<string | null>(null);
  
  const [copiedConcepts, setCopiedConcepts] = useState(false);
  const [copiedOutline, setCopiedOutline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateConcepts = async () => {
    if (!keywords.trim() || !theme.trim()) return;
    setIsGeneratingConcepts(true);
    setError(null);
    setSelectedConceptIndex(null);
    try {
      const result = await generateConcepts(keywords, theme);
      setConcepts(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate concepts.');
    } finally {
      setIsGeneratingConcepts(false);
    }
  };

  const handleSuggestKeywords = async () => {
    setIsSuggestingKeywords(true);
    setError(null);
    try {
      const result = await suggestKeywords(theme);
      setKeywordSuggestions(result);
      setKeywords(result.map((r: any) => r.keyword).join(', '));
    } catch (err: any) {
      setError(err.message || 'Failed to suggest keywords.');
    } finally {
      setIsSuggestingKeywords(false);
    }
  };

  const handleGenerateOutline = async () => {
    if (!selectedConcept.trim()) return;
    setIsGeneratingOutline(true);
    setError(null);
    try {
      const result = await generateScriptOutline(selectedConcept);
      setOutline(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate outline.');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const copyToClipboard = (text: string | {title: string, description: string}[], type: 'concepts' | 'outline') => {
    if (type === 'concepts' && Array.isArray(text)) {
      const formatted = text.map(c => `### ${c.title}\n${c.description}`).join('\n\n');
      navigator.clipboard.writeText(formatted);
      setCopiedConcepts(true);
      setTimeout(() => setCopiedConcepts(false), 2000);
    } else if (type === 'outline' && typeof text === 'string') {
      navigator.clipboard.writeText(text);
      setCopiedOutline(true);
      setTimeout(() => setCopiedOutline(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Ideation & Scripting</h2>
          <p className="text-zinc-400">Brainstorm concepts and generate detailed scene-by-scene outlines.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          <Sparkles size={14} />
          AI Ideation
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Concepts */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-zinc-800 pb-4">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 text-xs">1</span>
          Concept Generation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Keywords</label>
              <button
                onClick={handleSuggestKeywords}
                disabled={isSuggestingKeywords}
                className="text-xs flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSuggestingKeywords ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Suggest SEO Keywords
              </button>
            </div>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., cyberpunk, AI, future cities"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Theme</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., human-machine interaction"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {keywordSuggestions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-4">
            <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} /> SEO Insights
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {keywordSuggestions.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <span className="font-bold text-white whitespace-nowrap md:w-1/3">{item.keyword}</span>
                  <span className="text-sm text-zinc-400 md:w-2/3">{item.explanation}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <button
          onClick={handleGenerateConcepts}
          disabled={isGeneratingConcepts || !keywords.trim() || !theme.trim()}
          className={cn(
            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
            isGeneratingConcepts || !keywords.trim() || !theme.trim()
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          )}
        >
          {isGeneratingConcepts ? (
            <><Loader2 className="animate-spin" size={20} /> Generating Concepts...</>
          ) : (
            <><PenTool size={20} /> Generate Concepts</>
          )}
        </button>

        {concepts && concepts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <FileText size={16} /> Generated Concepts (Click to select)
              </div>
              <button
                onClick={() => copyToClipboard(concepts, 'concepts')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                {copiedConcepts ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copiedConcepts ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {concepts.map((concept, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedConceptIndex(idx);
                    setSelectedConcept(`${concept.title}\n\n${concept.description}`);
                  }}
                  className={cn(
                    "text-left p-6 rounded-2xl border transition-all duration-200",
                    selectedConceptIndex === idx
                      ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                  )}
                >
                  <h4 className={cn("font-bold text-lg mb-2", selectedConceptIndex === idx ? "text-emerald-500" : "text-white")}>
                    {concept.title}
                  </h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{concept.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Step 2: Outline */}
      <div className="space-y-6 pt-6">
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-zinc-800 pb-4">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 text-xs">2</span>
          Script Outlining
        </h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Selected Concept</label>
          <textarea
            value={selectedConcept}
            onChange={(e) => setSelectedConcept(e.target.value)}
            placeholder="Paste one of the generated concepts here to create a full scene-by-scene outline..."
            className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
          />
        </div>

        <button
          onClick={handleGenerateOutline}
          disabled={isGeneratingOutline || !selectedConcept.trim()}
          className={cn(
            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
            isGeneratingOutline || !selectedConcept.trim()
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          )}
        >
          {isGeneratingOutline ? (
            <><Loader2 className="animate-spin" size={20} /> Generating Outline...</>
          ) : (
            <><FileText size={20} /> Generate Script Outline</>
          )}
        </button>

        {outline && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <FileText size={16} /> Scene-by-Scene Outline
              </div>
              <button
                onClick={() => copyToClipboard(outline, 'outline')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                {copiedOutline ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copiedOutline ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-6 prose prose-invert prose-emerald max-w-none markdown-body">
              <Markdown>{outline}</Markdown>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
