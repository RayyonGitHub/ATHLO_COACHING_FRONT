import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { TrendingUp, Award, Zap, Target, Activity } from 'lucide-react';

// === DONNÉES SIMULÉES (MOCKS) ===
// Ces données seront bientôt remplacées par ton API Django
const dataVolume = [
  { day: 'Lun', volume: 1200 }, { day: 'Mar', volume: 1900 },
  { day: 'Mer', volume: 1500 }, { day: 'Jeu', volume: 2100 },
  { day: 'Ven', volume: 2800 }, { day: 'Sam', volume: 2400 },
  { day: 'Dim', volume: 0 },
];

const muscleData = [
  { name: 'Jambes', value: 45 }, { name: 'Pectoraux', value: 25 },
  { name: 'Dos', value: 20 }, { name: 'Épaules', value: 10 },
];

const COLORS = ['#FF6B00', '#FF9E00', '#4F46E5', '#10B981'];

const AthleteStats = () => {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Analyse de <span className="text-[#FF6B00]">Performance</span>
        </h2>
        <p className="text-gray-500 text-sm font-medium">Visualisez vos progrès et dépassez vos limites.</p>
      </div>

      {/* --- CARTES DE RÉSUMÉ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="text-[#FF6B00]"/>} label="Volume Hebdo" value="12.5k" unit="kg" />
        <StatCard icon={<Zap className="text-yellow-400"/>} label="Intensité Moy." value="82" unit="%" />
        <StatCard icon={<Award className="text-purple-400"/>} label="Nouveaux PR" value="4" unit="records" />
        <StatCard icon={<Activity className="text-blue-400"/>} label="Régularité" value="95" unit="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPHIQUE ÉVOLUTION VOLUME (AreaChart) */}
        <div className="lg:col-span-8 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            Progression du Volume <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2 py-1 bg-black/20 rounded-md">7 derniers jours</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataVolume}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #2D2D2D', borderRadius: '12px' }}
                  itemStyle={{ color: '#FF6B00' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RÉPARTITION MUSCULAIRE (PieChart) */}
        <div className="lg:col-span-4 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8 flex flex-col justify-center">
          <h3 className="text-white font-bold text-lg mb-6">Focus Musculaire</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={muscleData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {muscleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
            {muscleData.map((m, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-gray-400">{m.name}</span>
                </div>
                <span className="text-white font-bold">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit }) => (
  <div className="bg-[#1E1E1E] border border-[#2D2D2D] p-5 rounded-2xl hover:border-[#FF6B00]/40 transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-black/30 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black text-white italic">{value}</span>
      <span className="text-[10px] font-bold text-gray-500 uppercase">{unit}</span>
    </div>
    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

export default AthleteStats;