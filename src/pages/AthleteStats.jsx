import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Target, Award } from 'lucide-react';
import axios from 'axios';

// Données fictives en attendant le branchement API réel
const dataVolume = [
  { date: '01/03', volume: 1200 },
  { date: '05/03', volume: 1500 },
  { date: '10/03', volume: 1400 },
  { date: '15/03', volume: 2100 },
  { date: '20/03', volume: 2500 },
];

const dataMuscles = [
  { name: 'Jambes', value: 400 },
  { name: 'Pectoraux', value: 300 },
  { name: 'Dos', value: 300 },
  { name: 'Cardio', value: 200 },
];

const COLORS = ['#FF6B00', '#FF9E00', '#3D3D3D', '#6366f1'];

const AthleteStats = () => {
  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-700">
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
        Mes <span className="text-[#FF6B00]">Performances</span>
      </h2>

      {/* --- CARTES DE RÉSUMÉ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="text-[#FF6B00]"/>} label="Volume Total" value="+15%" subLabel="vs mois dernier" />
        <StatCard icon={<Activity className="text-blue-400"/>} label="Fréquence" value="4.2" subLabel="séances / semaine" />
        <StatCard icon={<Target className="text-green-500"/>} label="Objectif" value="85%" subLabel="du programme complété" />
        <StatCard icon={<Award className="text-purple-500"/>} label="Records" value="12" subLabel="battus ce mois" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* GRAPHE D'ÉVOLUTION DU VOLUME */}
        <div className="lg:col-span-8 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            Évolution du Volume <span className="text-xs text-gray-500 font-normal uppercase tracking-widest">(kg soulevés)</span>
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataVolume}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #2D2D2D', borderRadius: '12px' }}
                  itemStyle={{ color: '#FF6B00', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#FF6B00" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RÉPARTITION MUSCULAIRE */}
        <div className="lg:col-span-4 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8 flex flex-col">
          <h3 className="text-white font-bold text-lg mb-6">Répartition par Muscle</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataMuscles} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {dataMuscles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {dataMuscles.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-gray-400">{m.name}</span>
                </div>
                <span className="text-white font-bold">{m.value} reps</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subLabel }) => (
  <div className="bg-[#1E1E1E] border border-[#2D2D2D] p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
    </div>
    <div className="text-2xl font-black text-white mb-1">{value}</div>
    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</div>
    <div className="text-[10px] text-gray-600 mt-2 font-medium">{subLabel}</div>
  </div>
);

export default AthleteStats;