import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Award, Zap, Activity, Loader2 } from 'lucide-react';

const COLORS = ['#FF6B00', '#FF9E00', '#4F46E5', '#10B981', '#6366f1'];

const AthleteStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/api/athlete/stats/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des stats :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="animate-pulse font-medium">Calcul de vos performances en cours...</p>
      </div>
    );
  }

  // Si aucune donnée n'est encore enregistrée
  if (!stats || stats.volume_history.length === 0) {
    return (
      <div className="text-center py-20 bg-[#1E1E1E] rounded-3xl border border-dashed border-[#2D2D2D] m-6">
        <Activity size={48} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-white font-bold text-xl">Aucune donnée disponible</h3>
        <p className="text-gray-500 mt-2">Commencez et validez votre première séance pour voir vos graphiques !</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Analyse de <span className="text-[#FF6B00]">Performance</span>
        </h2>
        <p className="text-gray-500 text-sm font-medium">Données réelles basées sur vos derniers entraînements.</p>
      </div>

      {/* --- CARTES DE RÉSUMÉ RÉELLES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            icon={<TrendingUp className="text-[#FF6B00]"/>} 
            label="Séances Total" 
            value={stats.summary.total_sessions} 
            unit="sessions" 
        />
        <StatCard 
            icon={<Zap className="text-yellow-400"/>} 
            label="Répétitions" 
            value={stats.summary.total_reps} 
            unit="reps" 
        />
        <StatCard 
            icon={<Award className="text-purple-400"/>} 
            label="Volume Max" 
            value={Math.max(...stats.volume_history.map(d => d.volume))} 
            unit="kg" 
        />
        <StatCard 
            icon={<Activity className="text-blue-400"/>} 
            label="Régularité" 
            value="100" 
            unit="%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPHIQUE ÉVOLUTION VOLUME RÉEL */}
        <div className="lg:col-span-8 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            Évolution du Tonnage <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2 py-1 bg-black/20 rounded-md">7 derniers jours</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.volume_history}>
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
                  formatter={(value) => [`${value} kg`, 'Volume']}
                />
                <Area type="monotone" dataKey="volume" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RÉPARTITION MUSCULAIRE RÉELLE */}
        <div className="lg:col-span-4 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8 flex flex-col justify-center">
          <h3 className="text-white font-bold text-lg mb-6">Répartition Catégories</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.muscle_distribution} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={8} 
                  dataKey="value"
                >
                  {stats.muscle_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} reps`, 'Répétitions']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
            {stats.muscle_distribution.map((m, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
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