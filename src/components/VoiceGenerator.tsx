import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, Loader2, Sparkles, Play, Download, AlertCircle } from 'lucide-react';
import { generateVoiceOver } from '../services/gemini';
import { cn } from '../utils';

const VOICES = [
  { id: 'Puck', name: 'Puck', description: 'Warm, engaging, conversational' },
  { id: 'Charon', name: 'Charon', description: 'Deep, authoritative, cinematic' },
  { id: 'Kore', name: 'Kore', description: 'Clear, professional, informative' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Intense, dramatic, mysterious' },
  { id: 'Zephyr', name: 'Zephyr', description: 'Energetic, fast-paced, dynamic' },
];

export function VoiceGenerator() {
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[1].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const url = await generateVoiceOver(script, selectedVoice);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate voice-over.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voiceover-${selectedVoice}-${Date.now()}.wav`;
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
          <h2 className="text-3xl font-bold tracking-tight mb-2">AI Voice-Over</h2>
          <p className="text-zinc-400">Bring your scripts to life with cinematic, natural-sounding AI voices.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          <Sparkles size={14} />
          Gemini TTS
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex justify-between">
              <span>Script Text</span>
              <span className="text-zinc-600">{script.length} chars</span>
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Paste your scene script here..."
              className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !script.trim()}
            className={cn(
              "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
              isGenerating || !script.trim()
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            )}
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin" size={20} /> Generating Audio...</>
            ) : (
              <><Mic size={20} /> Generate Voice-Over</>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Select Voice</label>
            <div className="space-y-3">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={cn(
                    "w-full flex flex-col items-start p-4 rounded-xl border transition-all text-left",
                    selectedVoice === voice.id
                      ? "bg-emerald-500/10 border-emerald-500"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  <span className={cn(
                    "font-bold mb-1",
                    selectedVoice === voice.id ? "text-emerald-500" : "text-white"
                  )}>
                    {voice.name}
                  </span>
                  <span className="text-xs text-zinc-500">{voice.description}</span>
                </button>
              ))}
            </div>
          </div>

          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4"
            >
              <div className="flex items-center gap-3 text-emerald-500 font-medium pb-4 border-b border-zinc-800">
                <Play size={20} />
                Audio Ready
              </div>
              <audio controls src={audioUrl} className="w-full h-10" />
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-xl bg-zinc-800 text-white font-medium flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
              >
                <Download size={18} /> Download WAV
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
