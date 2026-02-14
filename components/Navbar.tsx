
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <i className="fa-solid fa-book-sparkles text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">CourseForge</h1>
          <p className="text-[10px] font-medium uppercase text-slate-400 tracking-widest leading-none">Studio AI</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Projects</Link>
        <Link to="/templates" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Templates</Link>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
          Upgrade Pro
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden cursor-pointer border border-slate-300">
          <img src="https://picsum.photos/seed/user/100/100" alt="User" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
