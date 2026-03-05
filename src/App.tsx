import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  Sparkles, 
  Youtube, 
  Loader2, 
  ChevronRight,
  Play,
  Download,
  Copy,
  Check,
  PenTool,
  Mic,
  Image as ImageIcon,
  Workflow,
  TestTube
} from 'lucide-react';
import { VideoGenerator } from './components/VideoGenerator';
import { DescriptionGenerator } from './components/DescriptionGenerator';
import { ScriptGenerator } from './components/ScriptGenerator';
import { VoiceGenerator } from './components/VoiceGenerator';
import { ThumbnailGenerator } from './components/ThumbnailGenerator';
import { Automations } from './components/Automations';
import { cn } from './utils';
import { runAllTests } from './services/gemini';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

type Tab = 'dashboard' | 'script' | 'video' | 'voice' | 'thumbnail' | 'description' | 'automations';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleRunTests = async () => {
    setIsTesting(true);
    setTestResults(null);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (e: any) {
      setTestResults({ error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-zinc-800 bg-[#0A0A0A] z-50 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-bottom border-zinc-800">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">Faceless Studio</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<PenTool size={20} />} 
            label="Script Gen" 
            active={activeTab === 'script'} 
            onClick={() => setActiveTab('script')} 
          />
          <SidebarItem 
            icon={<Video size={20} />} 
            label="Veo Video Gen" 
            active={activeTab === 'video'} 
            onClick={() => setActiveTab('video')} 
          />
          <SidebarItem 
            icon={<Mic size={20} />} 
            label="Voice-Over" 
            active={activeTab === 'voice'} 
            onClick={() => setActiveTab('voice')} 
          />
          <SidebarItem 
            icon={<ImageIcon size={20} />} 
            label="Thumbnails" 
            active={activeTab === 'thumbnail'} 
            onClick={() => setActiveTab('thumbnail')} 
          />
          <SidebarItem 
            icon={<Youtube size={20} />} 
            label="YT Description" 
            active={activeTab === 'description'} 
            onClick={() => setActiveTab('description')} 
          />
          <SidebarItem 
            icon={<Workflow size={20} />} 
            label="Automations" 
            active={activeTab === 'automations'} 
            onClick={() => setActiveTab('automations')} 
          />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleOpenKeySelector}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white text-sm"
          >
            <Settings size={18} />
            <span>{hasApiKey ? 'API Key Configured' : 'Configure API Key'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen p-6 md:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <header>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Welcome, <span className="text-emerald-500">Creator</span>
                </h1>
                <p className="text-zinc-400 text-lg max-w-2xl">
                  Your all-in-one suite for building a high-impact faceless YouTube channel. 
                  Generate cinematic visuals and optimized metadata in seconds.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard 
                  title="Ideation & Scripting"
                  description="Brainstorm unique concepts and generate detailed scene-by-scene outlines."
                  icon={<PenTool className="w-6 h-6 text-emerald-500" />}
                  onClick={() => setActiveTab('script')}
                />
                <FeatureCard 
                  title="Veo Video Generation"
                  description="Create stunning 1080p cinematic videos from simple text prompts using Google's latest Veo model."
                  icon={<Video className="w-6 h-6 text-emerald-500" />}
                  onClick={() => setActiveTab('video')}
                />
                <FeatureCard 
                  title="AI Voice-Over"
                  description="Bring scripts to life with cinematic, natural-sounding AI voices using Gemini TTS."
                  icon={<Mic className="w-6 h-6 text-emerald-500" />}
                  onClick={() => setActiveTab('voice')}
                />
                <FeatureCard 
                  title="YT Description Pro"
                  description="Analyze any video URL to generate SEO-optimized, engaging descriptions that drive views."
                  icon={<Youtube className="w-6 h-6 text-emerald-500" />}
                  onClick={() => setActiveTab('description')}
                />
                <FeatureCard 
                  title="Thumbnail Generator"
                  description="Generate high-CTR, cinematic YouTube thumbnails from your script title."
                  icon={<ImageIcon className="w-6 h-6 text-emerald-500" />}
                  onClick={() => setActiveTab('thumbnail')}
                />
                <FeatureCard 
                  title="Publishing Automations"
                  description="Manage your automated pipeline from Google Drive to YouTube publishing."
                  icon={<Workflow className="w-6 h-6 text-emerald-500" />}
                  onClick={() => setActiveTab('automations')}
                />
              </div>

              <div className="mt-12 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <TestTube className="text-emerald-500" /> API Testing Suite
                    </h3>
                    <p className="text-zinc-400 text-sm">Run automated tests to verify Gemini API integrations.</p>
                  </div>
                  <button
                    onClick={handleRunTests}
                    disabled={isTesting || !hasApiKey}
                    className={cn(
                      "px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-all",
                      isTesting || !hasApiKey
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-emerald-500 text-black hover:bg-emerald-400"
                    )}
                  >
                    {isTesting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                    {isTesting ? "Running Tests..." : "Run Tests"}
                  </button>
                </div>

                {!hasApiKey && (
                  <p className="text-amber-500 text-sm mb-4">Please configure your API key first to run tests.</p>
                )}

                {testResults && (
                  <div className="bg-black rounded-xl p-4 overflow-auto max-h-96 border border-zinc-800">
                    <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {!hasApiKey && (
                <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ready to start generating?</h3>
                    <p className="text-zinc-400">You'll need to select a paid Gemini API key to use the Veo video model.</p>
                  </div>
                  <button 
                    onClick={handleOpenKeySelector}
                    className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                  >
                    Select API Key
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'script' && <ScriptGenerator key="script" />}
          {activeTab === 'video' && <VideoGenerator key="video" hasApiKey={hasApiKey} onOpenKey={handleOpenKeySelector} />}
          {activeTab === 'voice' && <VoiceGenerator key="voice" />}
          {activeTab === 'thumbnail' && <ThumbnailGenerator key="thumbnail" hasApiKey={hasApiKey} onOpenKey={handleOpenKeySelector} />}
          {activeTab === 'description' && <DescriptionGenerator key="description" />}
          {activeTab === 'automations' && <Automations key="automations" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-emerald-500/10 text-emerald-500" 
          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
      )}
    >
      <span className={cn("transition-transform duration-200", active && "scale-110")}>{icon}</span>
      <span className="font-medium">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
    </button>
  );
}

function FeatureCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-left hover:border-emerald-500/50 hover:bg-zinc-900 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
        {title}
        <ChevronRight size={18} className="text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </button>
  );
}
