import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Youtube, 
  Search, 
  Loader2, 
  Copy, 
  Check, 
  FileText, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Markdown from 'react-markdown';
import { generateYouTubeDescription } from '../services/gemini';
import { cn } from '../utils';

export function DescriptionGenerator() {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!url.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setDescription(null);

    try {
      const result = await generateYouTubeDescription(url);
      setDescription(result || 'Failed to generate description.');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze video URL.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!description) return;
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">YT Description Pro</h2>
          <p className="text-zinc-400">Generate high-converting, SEO-optimized descriptions from any URL.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          <Sparkles size={14} />
          AI Optimized
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <Youtube size={20} />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube video URL here..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !url.trim()}
            className={cn(
              "px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all whitespace-nowrap",
              isGenerating || !url.trim()
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Generate Description</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <FileText size={16} />
                Generated Description
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  copied 
                    ? "bg-emerald-500 text-black" 
                    : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                )}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <div className="p-8 prose prose-invert prose-emerald max-w-none">
              <div className="markdown-body">
                <Markdown>{description}</Markdown>
              </div>
            </div>
          </motion.div>
        )}

        {!description && !isGenerating && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <TipCard 
              title="SEO Optimized"
              description="Uses relevant keywords to help your videos rank higher in YouTube search results."
            />
            <TipCard 
              title="Engagement Focused"
              description="Includes clear calls to action to boost your subscriber count and likes."
            />
            <TipCard 
              title="Readable Structure"
              description="Organizes content into clean paragraphs and lists for better viewer experience."
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TipCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
      <h4 className="text-emerald-500 font-bold mb-2 text-sm uppercase tracking-widest">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
