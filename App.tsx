
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import GeneratorWizard from './components/GeneratorWizard';
import { Ebook } from './types';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Ebook[]>([]);
  const [currentProject, setCurrentProject] = useState<Ebook | null>(null);

  // Load from "mock database" (localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('courseforge_projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    }
  }, []);

  const saveProject = (project: Ebook) => {
    const updated = projects.map(p => p.id === project.id ? project : p);
    if (!updated.find(p => p.id === project.id)) updated.push(project);
    setProjects(updated);
    localStorage.setItem('courseforge_projects', JSON.stringify(updated));
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Dashboard projects={projects} onSelectProject={setCurrentProject} />} />
            <Route path="/create" element={<GeneratorWizard onProjectCreated={(p) => { saveProject(p); setCurrentProject(p); }} />} />
            <Route path="/editor/:id" element={<Editor project={currentProject} onSave={saveProject} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
