import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  Sparkles, 
  Loader2, 
  Play, 
  Download, 
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { startVideoGeneration, pollVideoOperation, fetchVideoBlob } from '../services/gemini';
import { cn } from '../utils';

interface VideoGeneratorProps {
  hasApiKey: boolean;
  onOpenKey: () => void;
}

export function VideoGenerator({ hasApiKey, onOpenKey }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const handleGenerate = async () => {
    if (!hasApiKey) {
      onOpenKey();
      return;
    }

    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing generation...');
    setProgress(10);

    try {
      const operation = await startVideoGeneration(prompt, aspectRatio);
      setStatus('Processing video (this may take a few minutes)...');
      setProgress(30);

      pollInterval.current = setInterval(async () => {
        try {
          const updatedOp = await pollVideoOperation(operation);
          
          if (updatedOp.done) {
            if (pollInterval.current) clearInterval(pollInterval.current);
            
            if (updatedOp.error) {
              throw new Error((updatedOp.error as any).message || 'Generation failed');
            }

            const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
              setStatus('Finalizing video...');
              setProgress(90);
              const blob = await fetchVideoBlob(downloadLink);
              const url = URL.createObjectURL(blob);
              setVideoUrl(url);
              setIsGenerating(false);
              setStatus('');
              setProgress(100);
            }
          } else {
            // Update progress slightly while waiting
            setProgress(prev => Math.min(prev + 2, 85));
          }
        } catch (err: any) {
          if (pollInterval.current) clearInterval(pollInterval.current);
          setError(err?.message || 'Failed to poll operation');
          setIsGenerating(false);
        }
      }, 10000);

    } catch (err: any) {
      setError(err?.message || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `veo-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Veo Video Generation</h2>
          <p className="text-zinc-400">Transform your ideas into cinematic 1080p visuals.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          <Sparkles size={14} />
          Powered by Veo 3.1
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic drone shot of a neon-lit cyberpunk city in the rain..."
              className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                  aspectRatio === '16:9' 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                <div className="w-8 h-4.5 border-2 border-current rounded-sm" />
                <span className="text-xs font-bold tracking-widest">16:9 LANDSCAPE</span>
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                  aspectRatio === '9:16' 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                <div className="w-4.5 h-8 border-2 border-current rounded-sm" />
                <span className="text-xs font-bold tracking-widest">9:16 PORTRAIT</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={cn(
              "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
              isGenerating || !prompt.trim()
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Generating Video...</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>Generate Video</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <div className={cn(
            "relative w-full aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col items-center justify-center",
            aspectRatio === '9:16' && "aspect-[9/16] max-w-[350px] mx-auto"
          )}>
            {videoUrl ? (
              <>
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
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
              <div className="flex flex-col items-center gap-6 p-8 text-center">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video size={24} className="text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-white">{status}</p>
                  <p className="text-zinc-500 text-sm max-w-xs">
                    Great videos take time. Feel free to explore other tools while we work.
                  </p>
                </div>
                <div className="w-full max-w-xs bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest">
                  <Clock size={12} />
                  Est. Time: 2-4 mins
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-600">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                  <Play size={32} />
                </div>
                <p className="font-medium">Video preview will appear here</p>
              </div>
            )}
          </div>

          {videoUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3 text-emerald-400"
            >
              <CheckCircle2 size={20} />
              <span className="text-sm font-medium">Generation complete! Your cinematic masterpiece is ready.</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
