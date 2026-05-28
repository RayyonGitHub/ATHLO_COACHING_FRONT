import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { TrendingUp, Award, Zap, Activity, Loader2, Info } from 'lucide-react';
// --- IMPORT DU SERVICE STRAVA ---
import stravaService from '../services/stravaService';

const COLORS = ['#FF6B00', '#FF9E00', '#4F46E5', '#10B981', '#6366f1'];
const STRAVA_ORANGE = '#FC4C02';

const AthleteStats = () => {
  const [stats, setStats] = useState(null);
  const [externalActivities, setExternalActivities] = useState([]); // Pour Strava
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        
        // 1. Récupération des stats Muscu
        const statsRes = await axios.get('http://127.0.0.1:8000/api/athlete/stats/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // 2. Récupération des activités Strava
        try {
          const stravaRes = await stravaService.getActivities();
          setExternalActivities(stravaRes);
        } catch (sErr) {
          console.error("Erreur Strava:", sErr);
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LOGIQUE DU GRAPHIQUE CARDIO ---
  const cardioChartData = useMemo(() => {
    return [...externalActivities]
      .reverse()
      .slice(-7)
      .map(act => ({
        name: new Date(act.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        km: parseFloat((act.distance_metres / 1000).toFixed(1)),
      }));
  }, [externalActivities]);

  const volumeChartData = useMemo(() => {
    return (stats?.volume_history || []).map((session) => ({
      ...session,
      day: session.day || session.date || session.titre || '',
      volume: Number(session.volume ?? session.volume_total ?? 0),
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="animate-pulse font-medium">Analyse de vos performances en cours...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Analyse de <span className="text-[#FF6B00]">Performance</span>
        </h2>
        <p className="text-gray-500 text-sm font-medium">Données réelles basées sur vos entraînements et vos objets connectés.</p>
      </div>

      {/* --- CARTES DE RÉSUMÉ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            icon={<TrendingUp className="text-[#FF6B00]"/>} 
            label="Séances Muscu" 
            value={stats?.summary.total_sessions || 0} 
            unit="sessions" 
        />
        <StatCard 
            icon={<Activity className="text-[#FC4C02]"/>} 
            label="Activités Cardio" 
            value={externalActivities.length} 
            unit="Strava" 
        />
        <StatCard 
            icon={<Zap className="text-yellow-400"/>} 
            label="Volume Total"
            value={stats?.summary?.total_volume || 0}
            unit="kg" 
        />
        <StatCard 
            icon={<Award className="text-purple-400"/>} 
            label="Distance Totale" 
            value={(externalActivities.reduce((acc, curr) => acc + curr.distance_metres, 0) / 1000).toFixed(1)} 
            unit="km" 
        />
      </div>

      {/* --- SECTION MUSCULATION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">Évolution Musculation (Tonnage)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeChartData}>
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

        <div className="lg:col-span-4 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <h3 className="text-white font-bold text-lg mb-6">Répartition</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.muscle_distribution || []} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {(stats?.muscle_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
             {(stats?.muscle_distribution || []).slice(0, 3).map((m, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-400">
                  <span>{m.name}</span>
                  <span className="text-white font-bold">{m.value} kg</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* --- NOUVELLE SECTION : PROGRESSION CARDIO (STRAVA) --- */}
      {externalActivities.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#FC4C02]/10 text-[#FC4C02] rounded-lg"><Activity size={20} /></div>
              <div>
                <h3 className="font-bold text-white tracking-wide">Volume Cardio (Strava)</h3>
                <p className="text-xs text-gray-500">Distance parcourue par sortie (km)</p>
              </div>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardioChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(252, 76, 2, 0.05)'}}
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #2D2D2D', borderRadius: '12px' }}
                  />
                  <Bar dataKey="km" fill={STRAVA_ORANGE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="lg:col-span-12 bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl overflow-hidden">
             <div className="p-6 border-b border-[#2D2D2D] bg-[#252525]">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Dernières sorties Strava</h3>
             </div>
             <div className="divide-y divide-[#2D2D2D]">
                {externalActivities.slice(0, 5).map((act) => (
                  <div key={act.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-[#FC4C02] bg-[#FC4C02]/5 p-2 rounded-lg"><Zap size={18} /></div>
                      <div>
                        <p className="text-sm font-bold text-white">{act.nom}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{act.type_activite} • {new Date(act.date_debut).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="text-right text-white font-black italic">
                      {(act.distance_metres / 1000).toFixed(2)} KM
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
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
