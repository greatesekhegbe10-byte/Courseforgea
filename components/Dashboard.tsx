
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ebook } from '../types';

interface DashboardProps {
  projects: Ebook[];
  onSelectProject: (p: Ebook) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Creator</h2>
          <p className="text-slate-500">Transform your knowledge into high-impact digital assets.</p>
        </div>
        <Link 
          to="/create" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <i className="fa-solid fa-plus"></i>
          Create New Ebook
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Books</span>
              <span className="font-bold">{projects.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pro Credits</span>
              <span className="text-indigo-600 font-bold">12</span>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="col-span-3 h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-ghost text-4xl mb-4 opacity-20"></i>
            <p className="font-medium">No projects yet. Start your first masterpiece!</p>
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project.id}
              onClick={() => { onSelectProject(project); navigate(`/editor/${project.id}`); }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-400 hover:shadow-xl transition-all group"
            >
              <div className="h-48 bg-slate-100 flex items-center justify-center p-4">
                <div className="bg-white w-24 h-32 rounded shadow-lg border border-slate-200 flex flex-col p-2 text-[6px]">
                  <div className="h-1 w-full bg-slate-100 mb-1"></div>
                  <div className="h-1 w-2/3 bg-slate-100 mb-2"></div>
                  <div className="flex-1 bg-slate-50"></div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 truncate">{project.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Edited {new Date(project.createdAt).toLocaleDateString()}</p>
                <div className="mt-4 flex items-center justify-between">
                   <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{project.status}</span>
                   <i className="fa-solid fa-ellipsis-vertical text-slate-400"></i>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
