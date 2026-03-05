import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Workflow, 
  HardDrive, 
  Trello, 
  Image as ImageIcon, 
  Youtube, 
  CalendarClock, 
  Slack,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Play,
  Loader2,
  Tag
} from 'lucide-react';
import { cn } from '../utils';
import { generateTags } from '../services/gemini';

export function Automations() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [topic, setTopic] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSimulateUpload = async () => {
    if (!topic.trim()) return;
    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);
    setGeneratedTags([]);

    try {
      const tags = await generateTags(topic);
      setGeneratedTags(tags);
      
      // Simulate YouTube API Upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploadSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to simulate upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const steps = [
    {
      id: 'trigger',
      type: 'trigger',
      title: 'Google Drive',
      description: 'New approved script in /Scripts/Approved',
      icon: <HardDrive size={20} />,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20'
    },
    {
      id: 'action1',
      type: 'action',
      title: 'Project Board',
      description: 'Create task in "Production" with due date = next batch slot',
      icon: <Trello size={20} />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 'action2',
      type: 'action',
      title: 'Thumbnail Generator',
      description: 'Input = script title; Output = /Assets/Thumbnails/{video_id}.png',
      icon: <ImageIcon size={20} />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      id: 'action3',
      type: 'action',
      title: 'YouTube API',
      description: 'Upload draft video metadata with auto-generated tags from top 10 keywords',
      icon: <Youtube size={20} />,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20'
    },
    {
      id: 'action4',
      type: 'action',
      title: 'Scheduler',
      description: 'Schedule publish at calendar slot; post short clip to Shorts channel 24h later',
      icon: <CalendarClock size={20} />,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Automations</h2>
          <p className="text-zinc-400">Manage your faceless channel publishing pipeline.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          <CheckCircle2 size={14} />
          Pipeline Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 relative">
          {/* Connecting Line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-zinc-800 z-0" />

          {steps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10 flex items-start gap-6"
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg backdrop-blur-xl", step.bg, step.border, step.color)}>
                {step.icon}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {step.type === 'trigger' ? 'Trigger' : `Action ${index}`}
                  </span>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                
                {step.id === 'action3' && (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter video topic to generate tags & upload..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <button
                        onClick={handleSimulateUpload}
                        disabled={isUploading || !topic.trim()}
                        className={cn(
                          "w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm transition-all",
                          isUploading || !topic.trim()
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                        )}
                      >
                        {isUploading ? (
                          <><Loader2 className="animate-spin" size={16} /> Uploading Metadata...</>
                        ) : (
                          <><Play size={16} fill="currentColor" /> Run YouTube API Upload</>
                        )}
                      </button>

                      {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <p>{error}</p>
                        </div>
                      )}

                      {uploadSuccess && generatedTags.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-3"
                        >
                          <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                            <CheckCircle2 size={16} />
                            Draft Uploaded Successfully
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                              <Tag size={12} /> Auto-generated Top 10 Tags:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {generatedTags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700">
                                  #{tag.replace(/^#/, '')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Failure Mitigation
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-400 font-medium mb-1">Retry Logic</p>
                <p className="text-xs text-amber-500/70">If API call fails, retry 3x with exponential backoff.</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center gap-3">
                <Slack size={20} className="text-zinc-400" />
                <div>
                  <p className="text-sm text-white font-medium">Notify Slack</p>
                  <p className="text-xs text-zinc-500">Channel: #yt-ops</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <h3 className="text-emerald-500 font-bold mb-2 flex items-center gap-2">
              <Workflow size={18} />
              System Status
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              The publishing pipeline is currently monitoring the Google Drive folder for new approved scripts.
            </p>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Last checked:</span>
              <span className="text-emerald-500">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
