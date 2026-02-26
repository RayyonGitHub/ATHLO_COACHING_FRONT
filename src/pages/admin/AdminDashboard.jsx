import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm">Real-time performance metrics and system alerts.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#262626] rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] rounded-lg text-sm font-bold text-white shadow-lg shadow-[#FF6A00]/20 hover:brightness-110 transition-all">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-green-500 text-xs font-bold">+12.5%</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">€452,102</p>
        </div>
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#FF6A00]/10 text-[#FF6A00] rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-green-500 text-xs font-bold">+3.2%</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Active Coaches</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">1,284</p>
        </div>
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <span className="text-green-500 text-xs font-bold">+5.7%</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Gym Partners</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">312</p>
        </div>
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
              <span className="material-symbols-outlined">video_library</span>
            </div>
            <span className="text-green-500 text-xs font-bold">+8.1%</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Content Library</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">5,021</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-[#16161A] rounded-xl border border-slate-200 dark:border-[#262626] h-96 flex items-center justify-center p-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A00]/5 via-transparent to-transparent opacity-50"></div>
          <div className="text-center z-10">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">analytics</span>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Performance Analytics Chart</h3>
            <p className="text-slate-500 text-sm">System activity visualization would render here.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#16161A] rounded-xl border border-slate-200 dark:border-[#262626] p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 bg-[#FF6A00] rounded-full ring-4 ring-[#FF6A00]/20"></div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">New coach approved</p>
                <p className="text-xs text-slate-500">Sarah Jenkins • 2 mins ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Payment threshold reached</p>
                <p className="text-xs text-slate-500">System Alert • 1 hour ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">New gym partnership</p>
                <p className="text-xs text-slate-500">The Powerhouse • 3 hours ago</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-8 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors border-t border-slate-200 dark:border-[#262626]">View All Logs</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;