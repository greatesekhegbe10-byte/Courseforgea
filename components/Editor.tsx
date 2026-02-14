
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ebook, EbookPage, EbookElement, ElementType } from '../types';
import { generateAiImage, optimizeEbook } from '../geminiService';

interface EditorProps {
  project: Ebook | null;
  onSave: (p: Ebook) => void;
}

const Editor: React.FC<EditorProps> = ({ project, onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [localProject, setLocalProject] = useState<Ebook | null>(project);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // States
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project && id) {
      const saved = localStorage.getItem('courseforge_projects');
      if (saved) {
        const found = JSON.parse(saved).find((p: any) => p.id === id);
        if (found) setLocalProject(found);
      }
    }
  }, [id, project]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!localProject) return <div className="p-20 text-center">Loading project...</div>;

  const activePage = localProject.pages[activePageIndex];

  const handleUpdateElement = (elementId: string, updates: Partial<EbookElement>) => {
    const updatedPages = [...localProject.pages];
    const page = { ...updatedPages[activePageIndex] };
    page.elements = page.elements.map(el => el.id === elementId ? { ...el, ...updates } : el);
    updatedPages[activePageIndex] = page;
    const newProject = { ...localProject, pages: updatedPages };
    setLocalProject(newProject);
    onSave(newProject);
  };

  const addElement = (type: ElementType, content?: string) => {
    const newElement: EbookElement = {
      id: `el_${Date.now()}`,
      type,
      content: content || (type === ElementType.IMAGE ? 'https://picsum.photos/400/300' : 'New ' + type),
      x: 100, y: 100, w: type === ElementType.IMAGE ? 300 : 200, h: type === ElementType.IMAGE ? 300 : 50,
      style: { fontSize: 16, textAlign: 'left', color: '#000000' }
    };
    const updatedPages = [...localProject.pages];
    updatedPages[activePageIndex].elements.push(newElement);
    setLocalProject({ ...localProject, pages: updatedPages });
  };

  const handleGenerateImage = async (forCover: boolean = false) => {
    if (!imagePrompt && !forCover) return;
    setIsGeneratingImage(true);
    try {
      const prompt = forCover 
        ? `A professional and high-quality ebook cover for the book titled "${localProject.title}". Theme: ${localProject.subtitle || 'Modern knowledge'}. Style: Cinematic, high-quality illustration.`
        : imagePrompt;
      
      const imageUrl = await generateAiImage(prompt, forCover ? "9:16" : "1:1");
      
      if (forCover) {
        const updatedPages = [...localProject.pages];
        const coverPage = { ...updatedPages[0] };
        coverPage.elements = coverPage.elements.filter(el => el.type !== ElementType.IMAGE || el.w < 500);
        coverPage.elements.unshift({
          id: `cover_img_${Date.now()}`,
          type: ElementType.IMAGE,
          content: imageUrl,
          x: 0, y: 0, w: 600, h: 840,
          style: { borderRadius: 0 }
        });
        updatedPages[0] = coverPage;
        setLocalProject({ ...localProject, pages: updatedPages });
        setActivePageIndex(0);
      } else {
        addElement(ElementType.IMAGE, imageUrl);
      }
      setImagePrompt("");
      setShowAiPanel(false);
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleOptimizeForSale = async () => {
    setIsOptimizing(true);
    try {
      const optimized = await optimizeEbook(localProject);
      setLocalProject(optimized);
      onSave(optimized);
      alert("Your ebook has been optimized for commercial sale! Titles and content refined.");
    } catch (error) {
      console.error(error);
      alert("Optimization pass failed. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExport = (format: string) => {
    setShowExportMenu(false);
    setIsExporting(format);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(null);
      alert(`${format.toUpperCase()} export complete! Your file is ready.`);
    }, 2500);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-100">
      {(isOptimizing || isExporting) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="bg-white p-8 rounded-3xl text-slate-900 max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
               <i className={`fa-solid ${isOptimizing ? 'fa-sparkles' : 'fa-file-export'} text-3xl animate-pulse`}></i>
            </div>
            <h3 className="text-xl font-bold mb-2">{isOptimizing ? 'Optimizing for Sale' : `Exporting ${isExporting}`}</h3>
            <p className="text-slate-500 text-sm mb-6">
              {isOptimizing 
                ? 'Gemini AI is refining your copy, enhancing headlines, and preparing your ebook for the commercial market.' 
                : 'Packaging your assets and maintaining layout fidelity for final distribution.'}
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-indigo-600 h-full w-full animate-shimmer" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #6366f1 100%)', backgroundSize: '200% 100%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar - Elements */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 gap-6 custom-scrollbar overflow-y-auto">
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Add Elements</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Heading', icon: 'fa-heading', type: ElementType.HEADING },
              { label: 'Text', icon: 'fa-align-left', type: ElementType.PARAGRAPH },
              { label: 'Image', icon: 'fa-image', type: ElementType.IMAGE },
              { label: 'Quote', icon: 'fa-quote-left', type: ElementType.QUOTE },
            ].map(tool => (
              <button 
                key={tool.label}
                onClick={() => addElement(tool.type)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-500 hover:text-indigo-600 transition-all group"
              >
                <i className={`fa-solid ${tool.icon} mb-2 text-slate-400 group-hover:text-indigo-500`}></i>
                <span className="text-[10px] font-bold">{tool.label}</span>
              </button>
            ))}
            
            <button 
              onClick={() => setShowAiPanel(!showAiPanel)}
              className="col-span-2 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 hover:border-indigo-500 hover:bg-indigo-100 transition-all text-indigo-600 group"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span className="text-xs font-bold tracking-tight">AI Image Studio</span>
            </button>
          </div>
        </div>

        {showAiPanel && (
          <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
            <h5 className="text-[10px] font-black uppercase mb-3 tracking-widest opacity-80">Generate with AI</h5>
            <textarea 
              placeholder="Describe the image you want..."
              className="w-full h-24 p-3 rounded-xl bg-indigo-700/50 border border-indigo-400 text-xs text-white placeholder-indigo-300 outline-none focus:ring-2 focus:ring-white transition-all resize-none"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
            <button 
              disabled={isGeneratingImage || !imagePrompt}
              onClick={() => handleGenerateImage(false)}
              className="w-full mt-3 bg-white text-indigo-600 py-2 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all disabled:opacity-50"
            >
              {isGeneratingImage ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
              {isGeneratingImage ? 'Generating...' : 'Magic Generate'}
            </button>
          </div>
        )}

        <div className="flex-1">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Pages</h4>
          <div className="space-y-3">
            {localProject.pages.map((page, idx) => (
              <div 
                key={page.id}
                onClick={() => setActivePageIndex(idx)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${activePageIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-100 bg-white' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
              >
                 <div className="w-full aspect-[3/4] bg-white border border-slate-200 mb-2 overflow-hidden flex flex-col scale-75 origin-top relative">
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-slate-100"></div>
                 </div>
                 <p className="text-[10px] font-bold text-center text-slate-500">Page {idx + 1} {idx === 0 ? '(Cover)' : ''}</p>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-[10px] hover:border-indigo-300 hover:text-indigo-400 transition-all">
              + ADD PAGE
            </button>
          </div>
        </div>
      </aside>

      {/* Main Canvas Workspace */}
      <main className="flex-1 overflow-auto p-12 canvas-grid flex justify-center items-start custom-scrollbar">
        <div 
          className="bg-white shadow-2xl relative w-[600px] min-h-[840px] origin-top transition-all"
          style={{ backgroundColor: activePage.backgroundColor }}
        >
          {activePage.elements.map(el => (
             <ElementNode 
               key={el.id} 
               element={el} 
               isSelected={selectedElementId === el.id}
               onSelect={() => setSelectedElementId(el.id)}
               onUpdate={(updates) => handleUpdateElement(el.id, updates)}
             />
          ))}
        </div>
      </main>

      {/* Right Sidebar - Properties */}
      <aside className="w-72 bg-white border-l border-slate-200 p-6 custom-scrollbar overflow-y-auto">
        {selectedElementId ? (
          <div>
             <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">Properties</h3>
             <div className="space-y-6">
               <div>
                 <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Content</label>
                 <textarea 
                    className="w-full p-3 border rounded-lg text-sm bg-slate-50 resize-none h-32 outline-none focus:ring-1 focus:ring-indigo-500"
                    value={activePage.elements.find(e => e.id === selectedElementId)?.content}
                    onChange={(e) => handleUpdateElement(selectedElementId, { content: e.target.value })}
                 />
               </div>
               
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Typography</label>
                  <div className="flex gap-2">
                    <button className="flex-1 p-2 border rounded hover:bg-slate-50"><i className="fa-solid fa-bold"></i></button>
                    <button className="flex-1 p-2 border rounded hover:bg-slate-50"><i className="fa-solid fa-italic"></i></button>
                    <button className="flex-1 p-2 border rounded hover:bg-slate-50"><i className="fa-solid fa-underline"></i></button>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Alignment</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map(align => (
                       <button 
                         key={align}
                         onClick={() => handleUpdateElement(selectedElementId, { style: { ...activePage.elements.find(e => e.id === selectedElementId)?.style, textAlign: align as any } })}
                         className={`flex-1 p-2 border rounded hover:bg-slate-50 ${activePage.elements.find(e => e.id === selectedElementId)?.style?.textAlign === align ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : ''}`}
                       >
                         <i className={`fa-solid fa-align-${align}`}></i>
                       </button>
                    ))}
                  </div>
               </div>
               
               <button 
                onClick={() => {
                  const updatedPages = [...localProject.pages];
                  updatedPages[activePageIndex].elements = updatedPages[activePageIndex].elements.filter(e => e.id !== selectedElementId);
                  setLocalProject({ ...localProject, pages: updatedPages });
                  setSelectedElementId(null);
                }}
                className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 transition-all mt-10"
               >
                 DELETE ELEMENT
               </button>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <i className="fa-solid fa-arrow-pointer text-4xl mb-4"></i>
            <p className="text-xs font-bold uppercase tracking-widest text-center">Select an element<br/>to edit properties</p>
          </div>
        )}
      </aside>

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full flex items-center gap-10 shadow-2xl z-50">
          <div className="flex items-center gap-4 border-r border-slate-700 pr-10">
            <button onClick={() => navigate('/')} className="hover:text-indigo-400 transition-colors"><i className="fa-solid fa-house"></i></button>
            <span className="text-xs font-black uppercase tracking-widest max-w-[150px] truncate">{localProject.title}</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              disabled={isGeneratingImage}
              onClick={() => handleGenerateImage(true)}
              className="text-xs font-bold flex items-center gap-2 hover:text-indigo-400 transition-all disabled:opacity-50"
            >
              <i className={`fa-solid ${isGeneratingImage ? 'fa-spinner fa-spin' : 'fa-book-open'}`}></i> AI Cover
            </button>
            <button 
              onClick={handleOptimizeForSale}
              className="text-xs font-bold flex items-center gap-2 hover:text-indigo-400 transition-all"
            >
              <i className="fa-solid fa-rocket"></i> Optimize For Sale
            </button>
            
            <div className="relative" ref={exportMenuRef}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-xs font-bold flex items-center gap-2 hover:text-indigo-400 transition-all"
              >
                <i className="fa-solid fa-download"></i> Export <i className={`fa-solid fa-chevron-up text-[8px] transition-transform ${showExportMenu ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showExportMenu && (
                <div className="absolute bottom-full mb-4 left-0 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 w-48 animate-in slide-in-from-bottom-2 duration-200">
                  <h6 className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Format</h6>
                  <button 
                    onClick={() => handleExport('PDF')}
                    className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 rounded-xl flex items-center justify-between group transition-colors"
                  >
                    <span>PDF Document</span>
                    <i className="fa-solid fa-file-pdf text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </button>
                  <button 
                    onClick={() => handleExport('EPUB')}
                    className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 rounded-xl flex items-center justify-between group transition-colors"
                  >
                    <span>EPUB (E-Reader)</span>
                    <i className="fa-solid fa-tablet-screen-button text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </button>
                  <button 
                    onClick={() => handleExport('DOCX')}
                    className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 rounded-xl flex items-center justify-between group transition-colors"
                  >
                    <span>Word Document</span>
                    <i className="fa-solid fa-file-word text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => alert("Initiating Payment Gateway...")}
              className="bg-indigo-600 px-6 py-2 rounded-full text-xs font-black uppercase hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              Unlock Pro
            </button>
          </div>
      </div>
    </div>
  );
};

// Simplified Element Node with Drag Simulation
const ElementNode: React.FC<{ element: EbookElement, isSelected: boolean, onSelect: () => void, onUpdate: (u: Partial<EbookElement>) => void }> = ({ element, isSelected, onSelect, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setOffset({ x: e.clientX - element.x, y: e.clientY - element.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onUpdate({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset, onUpdate]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.w,
    height: element.h,
    fontSize: element.style?.fontSize,
    textAlign: element.style?.textAlign as any,
    color: element.style?.color,
    fontWeight: element.type === ElementType.TITLE || element.type === ElementType.HEADING ? 'bold' : 'normal',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    border: isSelected ? '2px solid #6366f1' : '1px transparent solid',
    padding: '4px',
    borderRadius: '4px',
    zIndex: isSelected ? 100 : 10,
    overflow: 'hidden'
  };

  if (element.type === ElementType.IMAGE) {
    return (
      <div style={style} onMouseDown={handleMouseDown} className="group overflow-hidden">
        <img src={element.content} className="w-full h-full object-cover rounded shadow-sm" alt="Page visual" draggable={false} />
        {isSelected && <div className="absolute inset-0 border-2 border-indigo-600 bg-indigo-500/10 pointer-events-none"></div>}
      </div>
    );
  }

  if (element.type === ElementType.QUOTE) {
    return (
      <div style={{ ...style, borderLeft: '4px solid #6366f1', paddingLeft: '12px', fontStyle: 'italic', background: '#f8fafc' }} onMouseDown={handleMouseDown}>
        {element.content}
      </div>
    );
  }

  return (
    <div style={style} onMouseDown={handleMouseDown} className="whitespace-pre-wrap leading-relaxed">
      {element.content}
    </div>
  );
};

export default Editor;
