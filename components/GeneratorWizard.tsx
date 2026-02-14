
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateOutline, generatePageLayout } from '../geminiService';
import { GenerationConfig, Ebook, EbookPage, ElementType } from '../types';

interface GeneratorWizardProps {
  onProjectCreated: (p: Ebook) => void;
}

const GeneratorWizard: React.FC<GeneratorWizardProps> = ({ onProjectCreated }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [config, setConfig] = useState<GenerationConfig>({
    topic: '',
    audience: '',
    tone: 'Professional',
    length: 'medium',
    style: 'Modern'
  });

  const handleStartGeneration = async () => {
    setLoading(true);
    try {
      setLoadingText("Architecting your ebook structure...");
      const outline = await generateOutline(config);
      
      setLoadingText("Expanding content and arranging layout...");
      const pages: EbookPage[] = [];
      
      // Generate a cover page first
      pages.push({
        id: 'page_0',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'el_title',
            type: ElementType.TITLE,
            content: outline.title,
            x: 50, y: 100, w: 400, h: 80,
            style: { fontSize: 42, fontWeight: 'bold', textAlign: 'center', color: '#1e293b' }
          },
          {
            id: 'el_subtitle',
            type: ElementType.HEADING,
            content: outline.subtitle,
            x: 100, y: 190, w: 300, h: 40,
            style: { fontSize: 18, textAlign: 'center', color: '#64748b' }
          }
        ]
      });

      // Just mock generating 2 more pages for speed in demo
      for (let i = 0; i < Math.min(2, outline.chapters.length); i++) {
        setLoadingText(`Designing Chapter ${i+1}: ${outline.chapters[i].title}...`);
        const layout = await generatePageLayout(outline.chapters[i], i + 1);
        pages.push({
          id: `page_${i+1}`,
          backgroundColor: layout.backgroundColor || '#ffffff',
          elements: layout.elements.map((el: any, idx: number) => ({
            ...el,
            id: `el_${i+1}_${idx}`
          }))
        });
      }

      const newProject: Ebook = {
        id: `project_${Date.now()}`,
        title: outline.title,
        subtitle: outline.subtitle,
        author: "Me",
        pages,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };

      onProjectCreated(newProject);
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong with AI generation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-[100]">
        <div className="w-24 h-24 mb-8">
          <div className="w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2 animate-pulse">Forging Your Vision...</h2>
        <p className="text-slate-300 font-medium tracking-wide">{loadingText}</p>
        <div className="mt-12 flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-3xl shadow-xl mt-12 border border-slate-100">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-3">Create Magic</h2>
        <p className="text-slate-500">Tell us what you want to teach, and CourseForge AI will build the rest.</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Ebook Topic</label>
          <input 
            type="text" 
            placeholder="e.g. Master React in 30 Days"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
            value={config.topic}
            onChange={(e) => setConfig({...config, topic: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Target Audience</label>
            <input 
              type="text" 
              placeholder="e.g. Busy Software Engineers"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={config.audience}
              onChange={(e) => setConfig({...config, audience: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Tone of Voice</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={config.tone}
              onChange={(e) => setConfig({...config, tone: e.target.value})}
            >
              <option>Professional</option>
              <option>Conversational</option>
              <option>Authoritative</option>
              <option>Inspirational</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Visual Style Preference</label>
          <div className="grid grid-cols-3 gap-4">
            {['Modern', 'Corporate', 'Creative'].map(style => (
              <button 
                key={style}
                onClick={() => setConfig({...config, style})}
                className={`py-4 rounded-2xl border-2 transition-all font-bold ${config.style === style ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-400'}`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleStartGeneration}
          disabled={!config.topic}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          GENERATE FULL EBOOK
        </button>
      </div>
    </div>
  );
};

export default GeneratorWizard;
