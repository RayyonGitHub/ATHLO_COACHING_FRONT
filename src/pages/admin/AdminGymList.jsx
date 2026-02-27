import React from 'react';
import { Dumbbell, MapPin, ChevronDown, X, Star, StarHalf, Smile } from 'lucide-react';

const AdminGymList = () => {
  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gym Management</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor all partner gym facilities and their affiliations.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#16161A] text-xs font-medium dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#262626] transition-colors">
          All Cities <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20 text-xs font-bold hover:bg-[#FF6A00]/20 transition-colors">
          Paris <X size={14} />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white focus:ring-0 cursor-pointer outline-none">
            <option>Latest Joined</option>
            <option>Name A-Z</option>
            <option>Most Coaches</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#16161A] rounded-xl border border-slate-200 dark:border-[#262626] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#262626]">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Gym Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Manager</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Coaches</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#262626]">
            <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center">
                    <Dumbbell size={18} className="text-[#FF6A00]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white">Iron Paradise Elite</p>
                    <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">ID: ATH-7821</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin size={14} />
                  <span className="text-sm font-medium">Paris, FR</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">Marcus Thorne</td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">12</span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-[#262626] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300">Details</button>
                  <button className="px-4 py-2 rounded-lg text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20">Suspend</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Analytics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-[#16161A] rounded-xl border border-slate-200 dark:border-[#262626] p-6 h-64 relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <h3 className="font-bold text-lg dark:text-white">Regional Distribution</h3>
              <p className="text-xs text-slate-500">Gym density across top operating cities</p>
            </div>
            <div className="flex gap-6 items-end">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-[#FF6A00] rounded-t-lg shadow-lg shadow-[#FF6A00]/20" style={{ height: "120px" }}></div>
                <span className="text-[10px] font-bold text-slate-400">PAR</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-[#FF6A00]/40 rounded-t-lg" style={{ height: "60px" }}></div>
                <span className="text-[10px] font-bold text-slate-400">LYO</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-[#FF6A00]/20 rounded-t-lg" style={{ height: "40px" }}></div>
                <span className="text-[10px] font-bold text-slate-400">BOR</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(#FF6A00_1.5px,transparent_1px)]" style={{ backgroundSize: "24px 24px" }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FF6A00] to-orange-600 rounded-xl p-6 flex flex-col justify-between overflow-hidden relative shadow-xl shadow-[#FF6A00]/20">
          <div className="relative z-10">
            <h3 className="text-white font-black text-2xl leading-tight">Partner Satisfaction</h3>
            <p className="text-white/80 text-sm mt-2 font-medium">Overall partner rating is up by 12% this quarter.</p>
          </div>
          <div className="relative z-10 flex items-center gap-3 mt-4">
            <span className="text-white font-black text-5xl">4.8</span>
            <div className="flex gap-1">
              <Star size={20} fill="currentColor" className="text-white" />
              <Star size={20} fill="currentColor" className="text-white" />
              <Star size={20} fill="currentColor" className="text-white" />
              <Star size={20} fill="currentColor" className="text-white" />
              <StarHalf size={20} fill="currentColor" className="text-white" />
            </div>
          </div>
          <Smile size={160} strokeWidth={1} className="absolute -right-6 -bottom-6 text-white/10 rotate-12" />
        </div>
      </div>
    </div>
  );
};

export default AdminGymList;