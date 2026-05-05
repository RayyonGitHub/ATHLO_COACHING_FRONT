import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, CheckCircle, Flame, TrendingUp, Loader2, CalendarDays, DollarSign } from 'lucide-react';
import coachService from '../services/coachService';


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-indigo-900 border border-indigo-800 p-3 shadow-2xl rounded-xl">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <p className="text-white font-black text-xs">
                        {payload[0].value} {payload[0].value > 1 ? 'Séances' : 'Séance'}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const CoachAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const result = await coachService.getAnalytics();
                setData(result);
            } catch (err) {
                console.error("Erreur Analytics:", err);
                setError("Impossible de charger les statistiques.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="mt-4 text-slate-500 font-medium">Analyse des performances en cours...</p>
            </div>
        );
    }

    return (
    <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        {/* LA LIGNE IMPORTANTE EST ICI : grid-cols-3 au lieu de grid-cols-2 */}
        <div className="grid grid-cols-3 gap-3 flex-none">
            <KPICard
                title="Athlètes"
                value={data?.total_athletes}
                icon={<Users className="w-4 h-4 text-indigo-900" />}
                borderColor="border-indigo-900"
            />
            <KPICard
                title="Assiduité"
                value={`${data?.completion_rate}%`}
                icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                borderColor="border-green-500"
            />
            <KPICard
                title="Revenus (CA)"
                value={`${data?.total_volume || 0} €`}
                icon={<DollarSign className="w-4 h-4 text-orange-600" />}
                borderColor="border-orange-500"
            />
        </div>

            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col flex-1 min-h-0">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-2">
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-slate-700" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800  tracking-tighter">Historique de complétion</h2>
                </div>

                {/* Zone de rendu du graphique */}
                
                <div className="flex-1 w-full mt-2 h-64 min-h-[200px]"> {/* <- AJOUTE h-64 et min-h-[200px] ICI */}
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.chart_data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sessions"
                                stroke="#f97316"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSessions)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </main>
    );
};

const KPICard = ({ title, value, icon, borderColor }) => (
    <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${borderColor} flex items-center gap-4 transition-transform hover:scale-[1.02]`}>
        <div className="p-3 bg-slate-50 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
            <p className="text-xl font-black text-slate-800 leading-none mt-1">{value}</p>
        </div>
    </div>
);

export default CoachAnalytics;