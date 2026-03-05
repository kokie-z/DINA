import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Loader2, Sparkles, Download, AlertCircle } from 'lucide-react';
import { generateThumbnail } from '../services/gemini';
import { cn } from '../utils';

interface ThumbnailGeneratorProps {
  hasApiKey: boolean;
  onOpenKey: () => void;
}

export function ThumbnailGenerator({ hasApiKey, onOpenKey }: ThumbnailGeneratorProps) {
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!hasApiKey) {
      onOpenKey();
      return;
    }

    if (!title.trim()) return;
    setIsGenerating(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateThumbnail(title);
      setImageUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate thumbnail.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Thumbnail Generator</h2>
          <p className="text-zinc-400">Generate high-CTR, cinematic YouTube thumbnails from your script title.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          <Sparkles size={14} />
          Gemini 3.1 Image
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Video Title</label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Silent Vault: Exploring Earth's Final Library..."
              className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim()}
            className={cn(
              "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
              isGenerating || !title.trim()
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            )}
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin" size={20} /> Generating...</>
            ) : (
              <><ImageIcon size={20} /> Generate Thumbnail</>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col items-center justify-center">
            {imageUrl ? (
              <>
                <img 
                  src={imageUrl} 
                  alt="Generated Thumbnail" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleDownload}
                  className="absolute bottom-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <Download size={20} />
                </button>
              </>
            ) : isGenerating ? (
              <div className="flex flex-col items-center gap-4 text-emerald-500">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="font-medium animate-pulse">Painting your masterpiece...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-600">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                  <ImageIcon size={32} />
                </div>
                <p className="font-medium">Thumbnail preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
