import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react'; 
import demoService from '../services/demoService';
import { Link } from 'react-router-dom';

// === DONNÉES FICTIVES ===
const dataProgression = [
    { name: 'Lun', performance: 4000 },
    { name: 'Mar', performance: 3000 },
    { name: 'Mer', performance: 5000 },
    { name: 'Jeu', performance: 2780 },
    { name: 'Ven', performance: 1890 },
    { name: 'Sam', performance: 2390 },
    { name: 'Dim', performance: 3490 },
];

const DemoDashboard = () => {
    const [stats, setStats] = useState(null);
    const [exercices, setExercices] = useState([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsData = await demoService.getDemoStats();
                const exercicesData = await demoService.getPublicExercices();
                setStats(statsData);
                setExercices(exercicesData);
            } catch (err) {
                console.error("Erreur de chargement des données de démo:", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* === SECTION FIGÉE (STICKY) === */}
            <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm p-6 pb-4 border-b border-slate-200">

                {/* 1. Bandeau de Démo Orange*/}
                <div className="bg-orange-500 text-white p-5 rounded-lg mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg transition-all">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                            <Zap className="w-5 h-5 fill-white" /> Mode Démo Actif
                        </h2>
                        <p className="text-white/90 text-sm">
                            Explorez les fonctionnalités. Connectez-vous pour enregistrer vos propres performances.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="bg-white text-orange-500 hover:bg-gray-100 px-6 py-2.5 rounded-lg font-bold shadow-md transition-all active:scale-95"
                    >
                        Se connecter
                    </Link>
                </div>

                {/* 2. Cartes de Statistiques Compactes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Athlètes" value={stats?.utilisateurs_actifs || '127+'} color="border-green-500" />
                    <StatCard title="Programmes" value={stats?.programmes_crees || '450'} color="border-purple-500" />
                    <StatCard title="Bibliothèque" value={stats?.total_exercices || '0'} color="border-blue-500" />
                    <StatCard title="Experts" value={stats?.total_coachs || '3'} color="border-orange-500" />
                </div>
            </div>

            {/* === SECTION SCROLLABLE === */}
            <div className="p-6 pt-4">
                {/* 3. Graphique de Progression */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Progression de la Communauté</h3>
                            <p className="text-slate-400 text-sm">Illustration de la valeur ajoutée du suivi de performance</p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">+12.5% cette semaine</span>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataProgression}>
                                <defs>
                                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                    padding={{ left: 10, right: 10 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#ff6600', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="performance" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorPerf)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Bibliothèque d'Exercices */}
                <div className="mt-8 pb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-slate-800">
                            {showAll ? "Bibliothèque Complète" : "Bibliothèque d'Exercices (Aperçu)"}
                        </h3>
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-orange-600 font-bold hover:text-orange-700 transition-colors"
                        >
                            {showAll ? "Réduire" : "Voir tout"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(showAll ? exercices : exercices.slice(0, 3)).map((exo) => (
                            <div key={exo.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${exo.categorie === 'force' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {exo.categorie}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">{exo.nom}</h4>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                    {exo.description || "Aucune description disponible pour cet exercice."}
                                </p>

                                <a
                                    href={exo.demo_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full py-2 border-2 rounded-xl font-bold text-center block transition-colors ${exo.demo_url
                                        ? "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                        : "border-gray-300 text-gray-300 cursor-not-allowed"
                                        }`}
                                    onClick={(e) => !exo.demo_url && e.preventDefault()}
                                >
                                    {exo.demo_url ? "Voir la démo vidéo" : "Pas de vidéo"}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <div className={`bg-white px-4 py-3 rounded-xl shadow-sm border-l-4 ${color} flex flex-col justify-center`}>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mb-1">{title}</p>
        <p className="text-xl font-black text-slate-800 leading-none">{value}</p>
    </div>
);

export default DemoDashboard;