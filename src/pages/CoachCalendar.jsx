import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import calendarService from '../services/calendarService';
import { authService } from '../services/authService'; 
import { 
  Users, User, Clock, Target, 
  CalendarDays, ChevronLeft, ChevronRight, AlertTriangle 
} from 'lucide-react';

const CoachCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [seances, setSeances] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ÉTATS POUR LA SUPPRESSION
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [seanceToDelete, setSeanceToDelete] = useState(null);

    // PAGINATION (Max 3 par page)
    const [currentPage, setCurrentPage] = useState(1);
    const seancesPerPage = 3;

    const fetchSeances = async () => {
        try {
            setLoading(true);
            const data = await calendarService.getCoachCalendar();
            setSeances(data);
        } catch (err) {
            console.error("Erreur de récupération des séances", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeances();
    }, []);

    // LOGIQUE DE SUPPRESSION
    const handleDeleteClick = (seance) => {
        setSeanceToDelete(seance);
        setIsDeleteModalOpen(true);
    };



const confirmDelete = async () => {
    if (!seanceToDelete) return;

    try {
        const token = authService.getToken(); 
        
        if (!token) {
            return;
        }

        await axios.delete(`http://localhost:8000/api/seances/${seanceToDelete.id}/`, {
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        
      
        setSeances(prev => prev.filter(s => s.id !== seanceToDelete.id));
        setIsDeleteModalOpen(false);
        setSeanceToDelete(null);
                
    } catch (err) {
        console.error("Détails technique de l'erreur :", err.response?.data);
                setIsDeleteModalOpen(false);
    }
};

    const seancesDuJour = seances.filter(s => {
        const d = new Date(s.start);
        return d.getFullYear() === date.getFullYear() &&
               d.getMonth() === date.getMonth() &&
               d.getDate() === date.getDate();
    });

    const indexOfLastSeance = currentPage * seancesPerPage;
    const indexOfFirstSeance = indexOfLastSeance - seancesPerPage;
    const currentSeances = seancesDuJour.slice(indexOfFirstSeance, indexOfLastSeance);
    const totalPages = Math.ceil(seancesDuJour.length / seancesPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [date]);

    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatee = date.toLocaleDateString('fr-FR', optionsDate);

    return (
        <div className="bg-slate-50 min-h-screen p-8 font-sans overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                
                {/* BLOC CALENDRIER */}
                <div className="xl:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 self-start">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CalendarDays className="text-orange-500" size={20} />
                        Planning Mensuel
                    </h2>
                    <div className="modern-calendar-wrapper">
                        <Calendar 
                            onChange={setDate} 
                            value={date}
                            className="w-full border-none"
                            locale="fr-FR"
                            tileContent={({ date: tileDate, view }) => {
                                if (view === 'month') {
                                    const hasSeance = seances.some(s => {
                                        const dSeance = new Date(s.start);
                                        return dSeance.getFullYear() === tileDate.getFullYear() &&
                                               dSeance.getMonth() === tileDate.getMonth() &&
                                               dSeance.getDate() === tileDate.getDate();
                                    });
                                    return hasSeance ? (
                                        <div className="flex justify-center">
                                            <div className="h-1.5 w-1.5 bg-orange-500 rounded-full mt-1"></div>
                                        </div>
                                    ) : null;
                                }
                            }}
                        />
                    </div>
                </div>

                {/* BLOC LISTE DES SÉANCES */}
                <div className="xl:col-span-3 flex flex-col space-y-6">
                    <div className="bg-indigo-950 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
                        <div>
                            <span className="text-orange-300 text-[10px] font-black uppercase tracking-widest">Focus Journée</span>
                            <h2 className="text-2xl font-bold capitalize mt-1">{dateFormatee}</h2>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-indigo-800/40 px-6 py-3 rounded-xl text-center border border-indigo-700/50">
                                <div className="text-3xl font-black">{seancesDuJour.length}</div>
                                <div className="text-[10px] text-indigo-200 uppercase font-bold mt-1">Séances</div>
                            </div>
                            <div className="bg-orange-500 px-6 py-3 rounded-xl text-center shadow-lg">
                                <div className="text-3xl font-black">
                                    {seancesDuJour.filter(s => s.is_collective).length}
                                </div>
                                <div className="text-[10px] text-orange-100 uppercase font-bold mt-1">Collectives</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center p-20 text-slate-400 font-bold">Chargement de l'agenda...</div>
                        ) : (
                            <>
                                <div className="grid gap-6">
                                    {currentSeances.length > 0 ? currentSeances.map(s => (
                                        <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-6 hover:shadow-xl hover:border-orange-100 transition-all duration-300 group">
                                            <div className="flex items-center gap-5 flex-1">
                                                <div className={`p-4 rounded-2xl transition-colors ${s.is_collective ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white' : 'bg-indigo-50 text-indigo-900 group-hover:bg-indigo-900 group-hover:text-white'}`}>
                                                    {s.is_collective ? <Users size={28}/> : <User size={28}/>}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-black text-xl text-indigo-950 tracking-tight">{s.title}</h4>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.is_collective ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-800'}`}>
                                                            {s.is_collective ? "Collectif" : "Individuel"}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={16} className="text-slate-400" />
                                                            <span className="font-bold text-slate-800">
                                                                {s.start.includes('T') ? s.start.split('T')[1].substring(0, 5) : "Session"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Target size={16} className="text-slate-400" />
                                                            <span>Client : <span className="font-bold text-slate-800">{s.client_name}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users size={16} className="text-slate-400" />
                                                            <span>Capacité : <span className="font-black text-indigo-950">{s.capacity_label}</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-orange-600 transition-all">
                                                    Feedback
                                                </button>
                                                {/* BOUTON ANNULER CONNECTÉ */}
                                                <button 
                                                    onClick={() => handleDeleteClick(s)}
                                                    className="bg-white text-slate-400 px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-100 hover:text-red-500 hover:border-red-100 transition-all"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
                                            <CalendarDays size={48} className="text-slate-200 mb-4" />
                                            <div className="text-xl font-bold text-slate-400">Aucune séance planifiée</div>
                                        </div>
                                    )}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center py-6 space-x-2">
                                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-100 transition-all flex items-center gap-1">
                                            <ChevronLeft size={16} /> Précédent
                                        </button>
                                        <div className="flex items-center space-x-1">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-100 transition-all flex items-center gap-1">
                                            Suivant <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALE DE SUPPRESSION */}
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ease-out ${isDeleteModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsDeleteModalOpen(false)}></div>
                <div className={`relative transform transition-all duration-300 ease-out bg-white rounded-2xl text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-lg ${isDeleteModalOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-center">
                            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg font-bold text-gray-900">Supprimer la séance</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Voulez-vous vraiment supprimer la séance <span className="text-red-600 font-bold">{seanceToDelete?.title}</span> ?
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-2xl">
                        <button onClick={confirmDelete} className="inline-flex w-full justify-center rounded-xl bg-red-600 px-6 py-2.5 text-sm font-black text-white hover:bg-red-500 sm:ml-3 sm:w-auto transition-all active:scale-95">SUPPRIMER</button>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">ANNULER</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachCalendar;