import React, { useState, useEffect, useRef } from 'react';
import calendarService from '../services/calendarService';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, ChevronLeft, ChevronRight, AlertTriangle, PlusCircle, X, Edit3, Trash2, Link, Users, Info, UserX, CheckCircle, XCircle, Check, Dumbbell } from 'lucide-react';

// Constantes pour la grille moderne
const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6:00 à 00:00 (minuit)
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// --- UTILITAIRES ---
const toDateInput = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};

const toTimeInput = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
};

const sanitizeDate = (dateStr) => {
    if (!dateStr) return null;
    return dateStr.substring(0, 19);
};

const buildPayload = (type, data) => {
    const basePayload = {
        titre: data.titre || (type === 'conge' ? 'Congé' : type === 'indisponibilite' ? 'Indisponible' : 'Nouvelle séance'),
        jour_prevu: data.jour,
        heure_debut: data.heure_debut + ':00',
        heure_fin: data.heure_fin + ':00',
        est_completee: data.est_completee || false
    };

    if (type === 'indisponibilite' || type === 'conge') {
        return { ...basePayload, est_conge: type === 'conge' };
    } else {
        const payload = {
            ...basePayload,
            est_collective: type === 'collective',
            capacite_max: type === 'collective' ? data.capacite_max : 1
        };

        payload.salle = data.salle_id ? parseInt(data.salle_id, 10) : null;

        return payload;
    }
};

const CoachCalendar = () => {
    const navigate = useNavigate();
    const [seances, setSeances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    
    // État pour la navigation de semaine
    const [currentDate, setCurrentDate] = useState(new Date());

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportUrl, setExportUrl] = useState('');

    const initialFormState = { type: 'individuelle', titre: '', capacite_max: 1, jour: '', heure_debut: '', heure_fin: '', est_completee: false, salle_id: '' };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState(initialFormState);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editFormData, setEditFormData] = useState(initialFormState);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });
    const [coachSalles, setCoachSalles] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');

    // Refs pour synchroniser le scroll
    const timeLabelsRef = useRef(null);
    const calendarGridRef = useRef(null);

    const [isRemoveParticipantModalOpen, setIsRemoveParticipantModalOpen] = useState(false);
    const [participantToRemove, setParticipantToRemove] = useState(null);

    const fetchSeances = async () => {
        try {
            setLoading(true);
            const data = await calendarService.getCoachCalendar();
            setSeances(data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des séances:", err);
            setSeances([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchSeances();
        fetchCoachSalles();
        fetchClients();
    }, []);

    const fetchCoachSalles = async () => {
        try {
            const res = await api.get('/coach/salles-disponibles/', {
                headers: { 'Authorization': `Bearer ${authService.getToken()}` }
            });
            setCoachSalles(res.data || []);
        } catch (err) {
            console.error('Erreur chargement salles coach', err);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients/', {
                headers: { 'Authorization': `Bearer ${authService.getToken()}` }
            });
            setClients(res.data || []);
        } catch (err) {
            console.error('Erreur chargement clients coach', err);
        }
    };

    const todayDate = new Date();
    const todayStr = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + String(todayDate.getDate()).padStart(2, '0');
    const currentTimeStr = String(todayDate.getHours()).padStart(2, '0') + ':' + String(todayDate.getMinutes()).padStart(2, '0');

    const handleExportCalendar = async () => {
        try {
            const url = await calendarService.getExportUrl();
            setExportUrl(url);
            await navigator.clipboard.writeText(url);
            setIsExportModalOpen(true);
        } catch (error) {
            alert("Impossible de générer le lien d'export.");
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = buildPayload(addFormData.type, addFormData);
            if (addFormData.type === 'indisponibilite' || addFormData.type === 'conge') {
                await calendarService.createIndisponibilite(payload);
            } else {
                await calendarService.createSeance(payload);
            }
            await fetchSeances(); // Attendre la fin du fetch
            setIsAddModalOpen(false);
        } catch (error) {
            const errorMsg = error.response?.data?.horaire_conflit || "Erreur lors de la création.";
            setErrorModal({ show: true, message: errorMsg });
        }
    };

    const handleEventClick = (clickInfo) => {
        const eventData = clickInfo.event.extendedProps.originalSeance;
        const start = new Date(clickInfo.event.start);
        const end = clickInfo.event.end ? new Date(clickInfo.event.end) : new Date(start.getTime() + 60 * 60 * 1000);

        setSelectedEvent(eventData);
        setEditFormData({
            type: eventData.type || (eventData.is_collective ? 'collective' : 'individuelle'),
            titre: eventData.title || eventData.titre || '',
            capacite_max: eventData.capacite_max || 1,
            jour: toDateInput(start),
            heure_debut: toTimeInput(start),
            heure_fin: toTimeInput(end),
            est_completee: eventData.completed || false,
            salle_id: eventData.salle_id || eventData.salle ? String(eventData.salle_id || eventData.salle) : ''
        });
        setSelectedClientId('');
        setActiveTab('details');
        setIsEditModalOpen(true);
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        try {
            const token = authService.getToken();
            if (!token) return;

            const oldFamily = (selectedEvent.type === 'indisponibilite' || selectedEvent.type === 'conge') ? 'indispo' : 'seance';
            const newFamily = (editFormData.type === 'indisponibilite' || editFormData.type === 'conge') ? 'indispo' : 'seance';
            const payload = buildPayload(editFormData.type, editFormData);

            if (oldFamily === newFamily) {
                const endpoint = oldFamily === 'indispo' ? `/indisponibilites/${selectedEvent.db_id}/` : `/seances/${selectedEvent.db_id}/`;
                await api.patch(endpoint, payload, { headers: { 'Authorization': `Bearer ${token}` } });
            } else {
                const deleteEndpoint = oldFamily === 'indispo' ? `/indisponibilites/${selectedEvent.db_id}/` : `/seances/${selectedEvent.db_id}/`;
                await api.delete(deleteEndpoint, { headers: { 'Authorization': `Bearer ${token}` } });

                if (newFamily === 'indispo') {
                    await calendarService.createIndisponibilite(payload);
                } else {
                    await calendarService.createSeance(payload);
                }
            }
            fetchSeances();
            setIsEditModalOpen(false);
        } catch (err) {
            const errorMsg = err.response?.data?.horaire_conflit || "Erreur lors de la modification.";
            setErrorModal({ show: true, message: errorMsg });
        }
    };

    const handleEventDropOrResize = async (changeInfo) => {
        const eventData = changeInfo.event.extendedProps.originalSeance;
        const newStart = new Date(changeInfo.event.start);
        const newEnd = changeInfo.event.end ? new Date(changeInfo.event.end) : new Date(newStart.getTime() + 60 * 60 * 1000);

        try {
            const token = authService.getToken();
            if (!token) { changeInfo.revert(); return; }

            const isIndispo = eventData.type === 'indisponibilite' || eventData.type === 'conge';
            const endpoint = isIndispo ? `/indisponibilites/${eventData.db_id}/` : `/seances/${eventData.db_id}/`;

            const payload = {
                jour_prevu: toDateInput(newStart),
                heure_debut: toTimeInput(newStart) + ':00',
                heure_fin: toTimeInput(newEnd) + ':00'
            };

            await api.patch(endpoint, payload, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchSeances();
        } catch (error) {
            changeInfo.revert();
            let errorMsg = "Impossible de déplacer cette séance sur ce créneau.";
            
            if (error.response && error.response.data) {
                const data = error.response.data;
                // On vérifie les clés d'erreurs possibles définies dans ton serializers.py
                if (data.horaire_conflit) {
                    errorMsg = data.horaire_conflit[0] || data.horaire_conflit; // Gère les tableaux et les strings
                } else if (data.jour_prevu) {
                    errorMsg = data.jour_prevu[0] || data.jour_prevu;
                } else if (data.heure_debut) {
                    errorMsg = data.heure_debut[0] || data.heure_debut;
                } else if (data.detail) {
                    errorMsg = data.detail;
                }
            }
            
            // 3. On déclenche TA belle modale au lieu de l'alert() Chrome !
            setErrorModal({ show: true, message: errorMsg });
        }
    };

    const triggerDelete = () => {
        setEventToDelete(selectedEvent);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;
        try {
            const token = authService.getToken();
            const isIndispo = eventToDelete.type === 'indisponibilite' || eventToDelete.type === 'conge';
            const endpoint = isIndispo ? `/indisponibilites/${eventToDelete.db_id}/` : `/seances/${eventToDelete.db_id}/`;

            await api.delete(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchSeances();
            setIsDeleteModalOpen(false);
        } catch (err) {
            alert("Erreur lors de la suppression.");
        }
    };

    const triggerRemoveParticipant = (participant) => {
        setParticipantToRemove(participant);
        setIsRemoveParticipantModalOpen(true);
    };

    const confirmRemoveParticipant = async () => {
        if (!participantToRemove) return;

        try {
            const token = authService.getToken();
            if (!token) return;

            // 1. Suppression du participant
            await api.delete(`/inscriptions/${participantToRemove.id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 2. Promotion du premier en liste d'attente → CONFIRME en BDD
            let promotedId = null;
            if (participantToRemove.statut === 'CONFIRME') {
                const firstWaiting = selectedEvent?.participants?.find(
                    p => p.statut === 'ATTENTE' && p.id !== participantToRemove.id
                );
                if (firstWaiting) {
                    await api.patch(
                        `/inscriptions/${firstWaiting.id}/status/`,
                        { statut: 'CONFIRME' },
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    promotedId = firstWaiting.id;
                }
            }

            // 3. Mise à jour immédiate de selectedEvent pour la modale
            setSelectedEvent(prev => {
                let newParticipants = prev.participants.filter(p => p.id !== participantToRemove.id);
                // Si quelqu'un a été promu, on met à jour son statut aussi
                if (promotedId) {
                    newParticipants = newParticipants.map(p =>
                        p.id === promotedId ? { ...p, statut: 'CONFIRME' } : p
                    );
                }
                return { ...prev, participants: newParticipants };
            });

            // 4. Fermeture de la modale
            setIsRemoveParticipantModalOpen(false);
            setParticipantToRemove(null);

            // 5. Rechargement en arrière-plan pour sync
            fetchSeances();

        } catch (error) {
            alert("Erreur lors du retrait du participant.");
        }
    };

    const handleAttendance = async (inscriptionId, newStatus) => {
        try {
            const token = authService.getToken();
            if (!token) return;

            await api.patch(`/inscriptions/${inscriptionId}/status/`, { statut: newStatus }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            fetchSeances();

            setSelectedEvent(prev => {
                const updatedParticipants = prev.participants.map(p =>
                    p.id === inscriptionId ? { ...p, statut: newStatus } : p
                );
                return { ...prev, participants: updatedParticipants };
            });
        } catch (error) {
            alert("Erreur lors de la mise à jour de l'appel.");
        }
    };

    const handleAddParticipant = async () => {
        if (!selectedEvent?.db_id || !selectedClientId) return;
        try {
            const token = authService.getToken();
            if (!token) return;

            await api.post(
                `/inscriptions/coach/inscrire/${selectedEvent.db_id}/`,
                { client_id: selectedClientId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const refreshed = await calendarService.getCoachCalendar();
            setSelectedClientId('');
            setSeances(refreshed);
            setSelectedEvent(refreshed.find(s => s.db_id === selectedEvent.db_id) || selectedEvent);
        } catch (error) {
            setErrorModal({
                show: true,
                message: error.response?.data?.erreur || "Impossible d'ajouter ce participant."
            });
        }
    };

    // --- FONCTIONS POUR LA GRILLE MODERNE ---
    const getWeekDates = () => {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff); // Mettre start au lundi
        
        const dates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });
        
        return dates;
    };

    const weekDates = getWeekDates();

    const formatWeekRange = () => {
        const start = weekDates[0];
        const end = weekDates[6];
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
    };

    const previousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const getSeancePosition = (seance) => {
        // Gérer les deux formats de données : jour_prevu ou start
        let jour, heureDebut, heureFin;
        
        if (seance.jour_prevu && seance.heure_debut) {
            // Format API direct
            jour = seance.jour_prevu;
            heureDebut = seance.heure_debut;
            heureFin = seance.heure_fin;
        } else if (seance.start) {
            // Format avec start/end
            const startDate = new Date(seance.start);
            
            // Vérifier que la date est valide
            if (isNaN(startDate.getTime())) {
                console.warn('Date invalide pour séance:', seance);
                return null;
            }
            
            // Extraire jour et heure EN HEURE LOCALE (pas UTC)
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');
            jour = `${year}-${month}-${day}`;
            
            const hours = String(startDate.getHours()).padStart(2, '0');
            const minutes = String(startDate.getMinutes()).padStart(2, '0');
            heureDebut = `${hours}:${minutes}`;
            
            if (seance.end) {
                const endDate = new Date(seance.end);
                if (!isNaN(endDate.getTime())) {
                    const endHours = String(endDate.getHours()).padStart(2, '0');
                    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
                    heureFin = `${endHours}:${endMinutes}`;
                }
            }
        } else {
            return null;
        }
        
        if (!jour || !heureDebut) return null;
        
        const seanceDate = new Date(jour);
        const dayIndex = weekDates.findIndex(d => 
            d.getDate() === seanceDate.getDate() && 
            d.getMonth() === seanceDate.getMonth() && 
            d.getFullYear() === seanceDate.getFullYear()
        );
        
        if (dayIndex === -1) {
            return null;
        }

        const [hours, minutes] = heureDebut.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const topPosition = ((startMinutes - 360) / 60) * 80; // 360 = 6:00 AM en minutes, 80px par heure

        let duration = 60;
        if (heureFin) {
            const [endHours, endMinutes] = heureFin.split(':').map(Number);
            const endTotalMinutes = endHours * 60 + endMinutes;
            duration = endTotalMinutes - startMinutes;
        }
        const height = (duration / 60) * 80;

        return { dayIndex, top: topPosition, height, heureDebut, heureFin };
    };

    const getSeanceColor = (seance) => {
        const aUnAbsent = seance.participants && seance.participants.some(p => p.statut === 'ABSENT');
        
        if (seance.completed || seance.est_completee) {
            return { bg: 'bg-slate-500/20', border: 'border-slate-500', label: 'text-slate-500' };
        } else if (seance.type === 'conge' || seance.est_conge) {
            return { bg: 'bg-emerald-500/20', border: 'border-emerald-500', label: 'text-emerald-500' };
        } else if (seance.type === 'indisponibilite') {
            return { bg: 'bg-gray-400/20', border: 'border-gray-400', label: 'text-gray-400' };
        } else if (seance.is_collective || seance.est_collective) {
            return { bg: 'bg-orange-500/20', border: 'border-orange-500', label: 'text-orange-500' };
        }
        return { bg: 'bg-[#FF6A00]/20', border: 'border-[#FF6A00]', label: 'text-[#FF6A00]' };
    };

    const todayIndex = weekDates.findIndex(d => {
        const today = new Date();
        return d.getDate() === today.getDate() && 
               d.getMonth() === today.getMonth() && 
               d.getFullYear() === today.getFullYear();
    });

    const handleSeanceClick = (seance) => {
        // Construire les dates start et end à partir des données de la séance
        let startDate, endDate;
        
        if (seance.jour_prevu && seance.heure_debut) {
            startDate = new Date(seance.jour_prevu + 'T' + seance.heure_debut);
            endDate = seance.heure_fin ? new Date(seance.jour_prevu + 'T' + seance.heure_fin) : new Date(startDate.getTime() + 60 * 60 * 1000);
        } else if (seance.start) {
            startDate = new Date(seance.start);
            endDate = seance.end ? new Date(seance.end) : new Date(startDate.getTime() + 60 * 60 * 1000);
        } else {
            return; // Pas de date valide
        }
        
        // Simuler la structure d'événement attendue par handleEventClick
        const fakeEvent = {
            event: {
                extendedProps: { originalSeance: seance },
                start: startDate,
                end: endDate
            }
        };
        handleEventClick(fakeEvent);
    };

    const openAddModal = () => {
        const now = new Date();
        const roundedHour = new Date(now);
        roundedHour.setMinutes(0, 0, 0);
        const nextHour = new Date(roundedHour.getTime() + 60 * 60 * 1000);
        
        setAddFormData({
            type: 'individuelle',
            titre: '',
            capacite_max: 1,
            jour: toDateInput(roundedHour),
            heure_debut: toTimeInput(roundedHour),
            heure_fin: toTimeInput(nextHour),
            est_completee: false,
            salle_id: ''
        });
        setIsAddModalOpen(true);
    };

    // Synchronisation du scroll entre les heures et la grille
    const handleGridScroll = (e) => {
        if (timeLabelsRef.current) {
            timeLabelsRef.current.scrollTop = e.target.scrollTop;
        }
    };

    // FIX 2 : Le vrai compte pour la petite bulle orange
    const trueParticipantCount = selectedEvent?.participants?.filter(p => ['CONFIRME', 'PRESENT', 'ABSENT'].includes(p.statut)).length || 0;

    return (
        <div className="h-screen flex flex-col bg-[#0B0B0E] overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center px-8 py-4 bg-[#0B0B0E]/80 backdrop-blur-xl border-b border-[#2A2A32]">
                <div className="flex items-center gap-8">
                    <h2 className="font-headline text-xl uppercase tracking-widest text-[#FCF8FE] font-black flex items-center gap-3">
                        <Calendar className="text-[#FF6A00]" size={28} /> ATHLO AGENDA
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportCalendar} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#ACAAB0] bg-[#131317] border border-[#2A2A32] rounded-xl hover:bg-[#1F1F25] transition-colors cursor-pointer">
                        <Link size={18} /> Exporter
                    </button>
                    <button onClick={openAddModal} className="px-6 py-2 bg-[#FF6A00] text-white font-bold rounded-xl active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
                        <PlusCircle size={18} /> Nouvelle Séance
                    </button>
                </div>
            </header>

            {/* Sub-Header */}
            <section className="flex items-center justify-between px-8 py-4 border-b border-[#2A2A32]">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={previousWeek} className="p-2 bg-[#1F1F25] rounded-xl hover:text-[#FF6A00] transition-colors cursor-pointer">
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-xl font-bold tracking-tight uppercase text-[#FCF8FE]">{formatWeekRange()}</h3>
                        <button onClick={nextWeek} className="p-2 bg-[#1F1F25] rounded-xl hover:text-[#FF6A00] transition-colors cursor-pointer">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Calendar Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-[#0B0B0E]/80 backdrop-blur-[2px] z-[50] flex items-center justify-center">
                        <div className="px-6 py-3 bg-[#131317] rounded-2xl shadow-xl border border-[#2A2A32] flex items-center gap-3 font-bold text-[#FF6A00]">
                            <svg className="animate-spin h-5 w-5 text-[#FF6A00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Mise à jour...
                        </div>
                    </div>
                )}

                {/* Time Labels */}
                <div className="w-20 border-r border-[#2A2A32] flex flex-col pt-[53px] overflow-hidden">
                    <div ref={timeLabelsRef} className="flex-1 overflow-y-scroll no-scrollbar" style={{ pointerEvents: 'none' }}>
                        {HOURS.map(hour => (
                            <div key={hour} className="h-20 flex items-start justify-center text-[10px] font-bold text-[#ACAAB0]/50 pt-1">
                                {hour === 24 ? '00:00' : hour.toString().padStart(2, '0') + ':00'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-[#2A2A32]">
                        {weekDates.map((date, i) => (
                            <div 
                                key={i} 
                                className={`p-4 text-center ${i === todayIndex ? 'bg-[#1F1F25]' : ''}`}
                            >
                                <span className={`block text-[10px] font-bold uppercase tracking-widest ${i === todayIndex ? 'text-[#FF6A00]' : 'text-[#ACAAB0]'}`}>
                                    {DAYS[i]}
                                </span>
                                <span className={`text-xl font-bold ${i === todayIndex ? 'text-[#FF6A00]' : 'text-[#FCF8FE]'}`}>
                                    {date.getDate()}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Scrolling Grid */}
                    <div ref={calendarGridRef} onScroll={handleGridScroll} className="flex-1 overflow-y-auto no-scrollbar relative" id="calendar-grid">
                        {/* Background Grid */}
                        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none" style={{ height: `${HOURS.length * 80}px` }}>
                            {weekDates.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`border-r border-[#2A2A32]/30 ${i === todayIndex ? 'bg-[#FF6A00]/5' : ''}`}
                                    style={{ height: '100%' }}
                                />
                            ))}
                        </div>

                        {/* Time Grid Lines */}
                        <div className="relative w-full">
                            {HOURS.map((hour, i) => (
                                <div 
                                    key={hour} 
                                    className="h-20 w-full border-b border-[#2A2A32]/10"
                                    style={{ height: '80px' }}
                                />
                            ))}

                            {/* Floating Sessions */}
                            {seances.map((seance, idx) => {
                                const position = getSeancePosition(seance);
                                if (!position) {
                                    return null;
                                }

                                const colors = getSeanceColor(seance);
                                const { dayIndex, top, height } = position;
                                const leftPercent = (dayIndex / 7) * 100;

                                let displayTitle = seance.titre || seance.title || "Sans titre";
                                if (seance.est_collective || seance.is_collective) {
                                    const trueCount = seance.participants ? seance.participants.filter(p => ['CONFIRME', 'PRESENT', 'ABSENT'].includes(p.statut)).length : (seance.nombre_inscrits || 0);
                                    displayTitle += ` (${trueCount}/${seance.capacite_max || 1})`;
                                }

                                // Adapter l'affichage selon la hauteur
                                const isVerySmall = height < 50;
                                const isSmall = height >= 50 && height < 80;
                                const isNormal = height >= 80;

                                return (
                                    <div
                                        key={seance.id || seance.db_id}
                                        className="absolute px-1 pointer-events-none"
                                        style={{
                                            left: `${leftPercent}%`,
                                            width: `${100 / 7}%`,
                                            top: `${top}px`,
                                            height: `${height}px`,
                                            minHeight: '40px'
                                        }}
                                    >
                                        <div 
                                            className={`pointer-events-auto h-full ${colors.bg} border-l-4 ${colors.border} ${isVerySmall ? 'p-1' : isSmall ? 'p-2' : 'p-3'} rounded-r-xl shadow-lg hover:brightness-110 cursor-pointer transition-all overflow-hidden`}
                                            onClick={() => handleSeanceClick(seance)}
                                        >
                                            {isVerySmall ? (
                                                // Très petite carte : juste titre ultra compact
                                                <div className="font-bold text-[9px] leading-tight text-[#FCF8FE] truncate">
                                                    {displayTitle}
                                                </div>
                                            ) : isSmall ? (
                                                // Petite carte : type + titre compact
                                                <>
                                                    <div className={`text-[8px] font-bold uppercase ${colors.label} truncate`}>
                                                        {seance.est_collective || seance.is_collective ? 'Collectif' : 
                                                         seance.type === 'conge' ? 'Congé' :
                                                         seance.type === 'indisponibilite' ? 'Indispo' : 'Individuel'}
                                                    </div>
                                                    <div className="font-bold text-[10px] leading-tight mt-0.5 text-[#FCF8FE] line-clamp-1">
                                                        {displayTitle}
                                                    </div>
                                                </>
                                            ) : (
                                                // Carte normale : tout afficher
                                                <>
                                                    <div className={`text-[10px] font-bold uppercase ${colors.label}`}>
                                                        {seance.est_collective || seance.is_collective ? 'Collectif' : 
                                                         seance.type === 'conge' ? 'Congé' :
                                                         seance.type === 'indisponibilite' ? 'Indispo' : 'Individuel'}
                                                    </div>
                                                    <div className="font-bold text-sm leading-tight mt-1 text-[#FCF8FE] line-clamp-2">
                                                        {displayTitle}
                                                    </div>
                                                    {seance.salle_nom && (
                                                        <div className="text-[10px] mt-1 text-[#ACAAB0] flex items-center gap-1 truncate">
                                                            {seance.salle_nom}
                                                        </div>
                                                    )}
                                                    {(seance.est_completee || seance.completed) && (
                                                        <div className="text-[10px] mt-1 font-bold text-emerald-500">✓ Terminé</div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Current Time Indicator */}
                            {todayIndex !== -1 && (() => {
                                const now = new Date();
                                const minutes = now.getHours() * 60 + now.getMinutes();
                                const topPosition = ((minutes - 360) / 60) * 80;
                                
                                if (topPosition >= 0 && topPosition <= HOURS.length * 80) {
                                    return (
                                        <div 
                                            className="absolute w-full border-t-2 border-[#FF6A00] z-10 pointer-events-none flex items-center"
                                            style={{ top: `${topPosition}px` }}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-[#FF6A00] -ml-1"></div>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="w-80 bg-[#131317] border-l border-[#2A2A32] flex flex-col overflow-y-auto">
                    <div className="p-6">
                        <h4 className="text-xs font-bold text-[#ACAAB0] uppercase tracking-[0.2em] mb-6">
                            Séances Aujourd'hui
                        </h4>
                        <div className="space-y-4">
                            {seances
                                .filter(s => {
                                    let seanceDate;
                                    if (s.jour_prevu) {
                                        seanceDate = new Date(s.jour_prevu);
                                    } else if (s.start) {
                                        seanceDate = new Date(s.start);
                                    } else {
                                        return false;
                                    }
                                    
                                    const today = new Date();
                                    return seanceDate.getDate() === today.getDate() &&
                                           seanceDate.getMonth() === today.getMonth() &&
                                           seanceDate.getFullYear() === today.getFullYear();
                                })
                                .slice(0, 5)
                                .map(seance => {
                                    const colors = getSeanceColor(seance);
                                    const position = getSeancePosition(seance);
                                    const heureDebut = position?.heureDebut || seance.heure_debut?.substring(0, 5) || '--:--';
                                    
                                    return (
                                        <div 
                                            key={seance.id || seance.db_id}
                                            className="glass-panel p-4 rounded-2xl border border-[#2A2A32] group cursor-pointer hover:border-[#FF6A00]/50 transition-all bg-[#1F1F25]/80 backdrop-blur-sm"
                                            onClick={() => handleSeanceClick(seance)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`${colors.bg} ${colors.label} text-[10px] font-black px-2 py-0.5 rounded`}>
                                                    {heureDebut}
                                                </span>
                                            </div>
                                            <h5 className="font-bold text-sm text-[#FCF8FE]">
                                                {seance.titre || seance.title || 'Sans titre'}
                                            </h5>
                                            <p className="text-xs text-[#ACAAB0] mt-1">
                                                {seance.salle_nom || 'Aucune salle'}
                                            </p>
                                        </div>
                                    );
                                })}
                            
                            {seances.filter(s => {
                                let seanceDate;
                                if (s.jour_prevu) {
                                    seanceDate = new Date(s.jour_prevu);
                                } else if (s.start) {
                                    seanceDate = new Date(s.start);
                                } else {
                                    return false;
                                }
                                const today = new Date();
                                return seanceDate.getDate() === today.getDate() &&
                                       seanceDate.getMonth() === today.getMonth() &&
                                       seanceDate.getFullYear() === today.getFullYear();
                            }).length === 0 && (
                                <p className="text-sm text-[#ACAAB0] italic">Aucune séance prévue aujourd'hui</p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .glass-panel { background: rgba(19, 19, 23, 0.8); backdrop-filter: blur(12px); }
            `}</style>

            {/* MODALE AJOUT */}
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isAddModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-[#0B0B0E]/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                <div className={`relative bg-[#131317] rounded-2xl shadow-2xl sm:max-w-md w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${isAddModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="flex justify-between items-center p-6 border-b border-[#2A2A32]"><h3 className="text-xl font-black text-[#FCF8FE] flex items-center gap-2"><PlusCircle className="text-[#FF6A00]" size={24} /> Nouvelle Séance</h3><button className="cursor-pointer" onClick={() => setIsAddModalOpen(false)}><X size={24} className="text-[#ACAAB0] hover:text-[#FCF8FE]" /></button></div>
                    <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                        <select value={addFormData.type} onChange={(e) => setAddFormData({ ...addFormData, type: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                            <option value="individuelle">Séance Individuelle</option><option value="collective">Séance Collective</option><option value="indisponibilite">Indisponibilité</option><option value="conge">Congé</option>
                        </select>
                        <input type="text" placeholder="Titre de la séance..." value={addFormData.titre} onChange={(e) => setAddFormData({ ...addFormData, titre: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2"><input type="date" value={addFormData.jour} min={todayStr} onChange={(e) => setAddFormData({ ...addFormData, jour: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] cursor-pointer" required /></div>
                            <input type="time" value={addFormData.heure_debut} min={addFormData.jour === todayStr ? currentTimeStr : "00:00"} onChange={(e) => setAddFormData({ ...addFormData, heure_debut: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] cursor-pointer" required />
                            <input type="time" value={addFormData.heure_fin} onChange={(e) => setAddFormData({ ...addFormData, heure_fin: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] cursor-pointer" required />
                        </div>
                        {(addFormData.type === 'individuelle' || addFormData.type === 'collective') && (
                            <select
                                value={addFormData.salle_id}
                                onChange={(e) => setAddFormData({ ...addFormData, salle_id: e.target.value })}
                                className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="">-- Associer une salle --</option>
                                {coachSalles.map((salle) => (
                                    <option key={salle.id} value={salle.id}>{salle.nom} - {salle.ville}</option>
                                ))}
                            </select>
                        )}
                        {addFormData.type === 'collective' && <input type="number" min="2" placeholder="Capacité max" value={addFormData.capacite_max} onChange={(e) => setAddFormData({ ...addFormData, capacite_max: parseInt(e.target.value) })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE]" />}
                        <div className="pt-4 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 font-bold text-[#ACAAB0] hover:bg-[#1F1F25] rounded-xl transition-all cursor-pointer">Annuler</button>
                            <button type="submit" className="px-5 py-2.5 font-black text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer">Créer</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODALE ÉDITION AVEC ONGLETS */}
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isEditModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-[#0B0B0E]/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                <div className={`relative bg-[#131317] rounded-3xl shadow-2xl sm:max-w-lg w-full max-h-[90vh] overflow-y-auto transition-all duration-300 overflow-hidden ${isEditModalOpen ? 'scale-100' : 'scale-95'}`}>

                    <div className="flex justify-between items-center p-6 bg-[#1F1F25] border-b border-[#2A2A32]">
                        <h3 className="text-xl font-black text-[#FCF8FE] flex items-center gap-2">
                            {activeTab === 'details' ? <Edit3 className="text-indigo-500" size={24} /> : <Users className="text-[#FF6A00]" size={24} />}
                            {activeTab === 'details' ? "Modifier la séance" : (editFormData.est_completee ? "Appel des présences" : "Gestion des participants")}
                        </h3>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-[#ACAAB0] hover:text-[#FCF8FE] transition-colors cursor-pointer"><X size={24} /></button>
                    </div>

                    {!(selectedEvent?.type === 'indisponibilite' || selectedEvent?.type === 'conge') && (
                        <div className="flex border-b border-[#2A2A32]">
                            <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-[#ACAAB0] hover:bg-[#1F1F25]'}`}>
                                <Info size={18} /> Détails
                            </button>
                            <button onClick={() => setActiveTab('participants')} className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'participants' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30' : 'text-[#ACAAB0] hover:bg-[#1F1F25]'}`}>
                                <Users size={18} /> {editFormData.est_completee ? "Appel" : "Participants"}
                                {trueParticipantCount > 0 && <span className="ml-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full">{trueParticipantCount}</span>}
                            </button>
                        </div>
                    )}

                    <div className="p-6 overflow-y-auto">
                        {activeTab === 'details' ? (
                            <form onSubmit={handleUpdateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-[#ACAAB0] uppercase tracking-wider mb-1">Type d'événement</label>
                                    <select value={editFormData.type} onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                                        <option value="individuelle">Séance Individuelle</option><option value="collective">Séance Collective</option><option value="indisponibilite">Indisponibilité</option><option value="conge">Congé</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[#ACAAB0] uppercase tracking-wider mb-1">Titre</label>
                                    <input type="text" value={editFormData.titre} onChange={(e) => setEditFormData({ ...editFormData, titre: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2"><label className="block text-xs font-black text-[#ACAAB0] uppercase tracking-wider mb-1">Date</label><input type="date" value={editFormData.jour} min={todayStr} onChange={(e) => setEditFormData({ ...editFormData, jour: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] cursor-pointer" required /></div>
                                    <div><label className="block text-xs font-black text-[#ACAAB0] uppercase tracking-wider mb-1">Début</label><input type="time" value={editFormData.heure_debut} min={editFormData.jour === todayStr ? currentTimeStr : "00:00"} onChange={(e) => setEditFormData({ ...editFormData, heure_debut: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] cursor-pointer" required /></div>
                                    <div><label className="block text-xs font-black text-[#ACAAB0] uppercase tracking-wider mb-1">Fin</label><input type="time" value={editFormData.heure_fin} onChange={(e) => setEditFormData({ ...editFormData, heure_fin: e.target.value })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] cursor-pointer" required /></div>
                                </div>
                                {(editFormData.type === 'individuelle' || editFormData.type === 'collective') && (
                                    <div>
                                        <label className="block text-xs font-black text-[#ACAAB0] uppercase tracking-wider mb-1">Salle</label>
                                        <select
                                            value={editFormData.salle_id}
                                            onChange={(e) => setEditFormData({ ...editFormData, salle_id: e.target.value })}
                                            className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                        >
                                            <option value="">-- Associer une salle --</option>
                                            {coachSalles.map((salle) => (
                                                <option key={salle.id} value={salle.id}>{salle.nom} - {salle.ville}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {editFormData.type === 'collective' && (
                                    <div><label className="block text-xs font-black text-[#ACAAB0] uppercase tracking-wider mb-1">Capacité maximale</label><input type="number" min="2" value={editFormData.capacite_max} onChange={(e) => setEditFormData({ ...editFormData, capacite_max: parseInt(e.target.value) })} className="w-full border-[#2A2A32] rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE]" /></div>
                                )}

                                {selectedEvent && !(editFormData.type === 'indisponibilite' || editFormData.type === 'conge') && (
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-[#1F1F25] rounded-2xl border border-[#2A2A32] text-sm">
                                        <div><span className="block text-xs font-black text-[#ACAAB0] uppercase">Athlète(s)</span><span className="font-bold text-[#FCF8FE]">{selectedEvent.client_name || 'En attente'}</span></div>
                                        <div><span className="block text-xs font-black text-[#ACAAB0] uppercase">Salle associée</span><span className="font-bold text-[#FCF8FE]">{selectedEvent.salle_nom || 'Non associée'}</span></div>
                                    </div>
                                )}

                                {!(editFormData.type === 'indisponibilite' || editFormData.type === 'conge') && (
                                    <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl border ${editFormData.est_completee ? 'bg-emerald-50 border-emerald-200' : 'bg-[#1F1F25] border-[#2A2A32]'}`}>
                                        <input type="checkbox" id="est_completee" checked={editFormData.est_completee} onChange={(e) => setEditFormData({ ...editFormData, est_completee: e.target.checked })} className="w-5 h-5 accent-emerald-600 rounded cursor-pointer" />
                                        <label htmlFor="est_completee" className={`font-bold cursor-pointer flex items-center gap-2 ${editFormData.est_completee ? 'text-emerald-700' : 'text-[#ACAAB0]'}`}>
                                            <CheckCircle size={18} /> Marquer la séance comme terminée
                                        </label>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-[#2A2A32]">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <button
                                            type="button"
                                            onClick={triggerDelete}
                                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20 cursor-pointer sm:w-auto"
                                        >
                                            <Trash2 size={18} />
                                            Supprimer
                                        </button>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                            {!(editFormData.type === 'indisponibilite' || editFormData.type === 'conge') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditModalOpen(false);
                                                        // On redirige vers le Builder en passant l'ID de la séance dans l'URL
                                                        navigate(`/builder?seance_id=${selectedEvent.db_id}`);
                                                    }}
                                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 text-sm font-bold text-[#FF6A00] transition-all hover:bg-[#FF6A00]/20 cursor-pointer sm:w-auto"
                                                >
                                                    <Dumbbell size={18} />
                                                    Ajouter des exercices
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setIsEditModalOpen(false)}
                                                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#2A2A32] px-4 text-sm font-bold text-[#ACAAB0] transition-all hover:bg-[#1F1F25] cursor-pointer sm:w-auto"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-950/20 transition-all hover:bg-indigo-700 cursor-pointer sm:w-auto"
                                            >
                                                Mettre à jour
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            // ... Le reste du contenu (Participants) ne change pas, j'ai juste ajouté des cursor-pointer ci-dessous
                            <div className="space-y-6">
                                {!editFormData.est_completee && (
                                    <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
                                        <label className="block text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Ajouter un athlète</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={selectedClientId}
                                                onChange={(e) => setSelectedClientId(e.target.value)}
                                                className="min-w-0 flex-1 border border-indigo-100 rounded-xl p-3 bg-[#0B0B0E] text-[#FCF8FE] outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Sélectionner un client...</option>
                                                {clients
                                                    .filter(c => !selectedEvent?.participants?.some(p => p.client_id === c.id))
                                                    .map(c => {
                                                        // Afficher le type de contrat pour les abonnements
                                                        const displayInfo = c.contrat?.valide && c.contrat?.type === 'ABONNEMENT'
                                                            ? `Abonnement actif`
                                                            : c.contrat?.valide && c.contrat?.type === 'PACK'
                                                            ? `Pack - ${c.seances_restantes || 0} séance(s)`
                                                            : `${c.seances_restantes || 0} séance(s)`;
                                                        
                                                        return (
                                                            <option key={c.id} value={c.id}>
                                                                {`${c.prenom || ''} ${c.nom || ''}`.trim() || c.email} ({displayInfo})
                                                            </option>
                                                        );
                                                    })}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleAddParticipant}
                                                disabled={!selectedClientId}
                                                className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-black disabled:opacity-50 cursor-pointer"
                                            >
                                                Ajouter
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* Jauge de capacité modifiée pour utiliser le vrai compte */}
                                {selectedEvent?.est_collective && !editFormData.est_completee && (
                                    <div className="bg-[#1F1F25] p-4 rounded-2xl border border-[#2A2A32]">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-[#ACAAB0] uppercase tracking-tight">Remplissage de la séance</span>
                                            <span className="text-sm font-black text-indigo-600">{trueParticipantCount} / {selectedEvent.capacite_max}</span>
                                        </div>
                                        <div className="w-full bg-[#2A2A32] h-2.5 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-500 ${trueParticipantCount >= selectedEvent.capacite_max ? 'bg-[#FF6A00]' : 'bg-indigo-600'}`} style={{ width: `${(trueParticipantCount / selectedEvent.capacite_max) * 100}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-[#ACAAB0] uppercase tracking-widest px-1">
                                        {editFormData.est_completee ? "Appel des présences" : "Participants confirmés"}
                                    </h4>

                                    {selectedEvent?.participants?.filter(p => ['CONFIRME', 'PRESENT', 'ABSENT'].includes(p.statut)).length > 0 ? (
                                        selectedEvent.participants.filter(p => ['CONFIRME', 'PRESENT', 'ABSENT'].includes(p.statut)).map(p => {
                                            const visualStatut = editFormData.est_completee ? p.statut : 'CONFIRME';

                                            return (
                                                <div key={p.id} className={`flex items-center justify-between p-3 border rounded-2xl transition-all ${visualStatut === 'PRESENT' ? 'bg-emerald-50 border-emerald-100' : visualStatut === 'ABSENT' ? 'bg-red-50 border-red-100' : 'bg-[#131317] border-[#2A2A32] hover:border-indigo-200'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${visualStatut === 'PRESENT' ? 'bg-emerald-200 text-emerald-700' : visualStatut === 'ABSENT' ? 'bg-red-200 text-red-700' : 'bg-indigo-100 text-indigo-600'}`}>
                                                            {p.client_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#FCF8FE]">{p.client_name}</p>
                                                            {editFormData.est_completee ? (
                                                                <p className="text-xs text-[#ACAAB0] flex items-center mt-1">
                                                                    {visualStatut === 'PRESENT' ? (
                                                                        <span className="flex items-center text-emerald-600 font-bold"><Check size={14} className="mr-1" /> Présent</span>
                                                                    ) : visualStatut === 'ABSENT' ? (
                                                                        <span className="flex items-center text-red-600 font-bold"><X size={14} className="mr-1" /> Absent</span>
                                                                    ) : 'En attente d\'appel...'}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-[#ACAAB0] mt-1">Inscrit le {p.date_inscription ? new Date(p.date_inscription).toLocaleDateString() : ''}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {editFormData.est_completee ? (
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => handleAttendance(p.id, 'PRESENT')} className={`cursor-pointer p-2 rounded-lg transition-all ${visualStatut === 'PRESENT' ? 'bg-emerald-200 text-emerald-700' : 'text-[#ACAAB0] hover:bg-emerald-100 hover:text-emerald-600'}`}><CheckCircle size={24} /></button>
                                                            <button type="button" onClick={() => handleAttendance(p.id, 'ABSENT')} className={`cursor-pointer p-2 rounded-lg transition-all ${visualStatut === 'ABSENT' ? 'bg-red-200 text-red-700' : 'text-[#ACAAB0] hover:bg-red-100 hover:text-red-600'}`}><XCircle size={24} /></button>
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => triggerRemoveParticipant(p)} className="p-2 text-[#ACAAB0] hover:text-red-500 transition-all cursor-pointer"><UserX size={20} /></button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : <p className="text-sm text-[#ACAAB0] px-1 py-4">Aucun client n'est encore inscrit à cette séance.</p>}
                                </div>

                                {!editFormData.est_completee && selectedEvent?.participants?.filter(p => p.statut === 'ATTENTE').length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-dashed border-[#2A2A32]">
                                        <h4 className="text-xs font-black text-[#FF6A00] uppercase tracking-widest px-1">En liste d'attente</h4>
                                        {selectedEvent.participants.filter(p => p.statut === 'ATTENTE').map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black">{p.client_name?.charAt(0)}</div>
                                                    <div><p className="text-sm font-bold text-[#FCF8FE]">{p.client_name}</p><p className="text-xs text-orange-600 font-medium">Position dans la file : #1</p></div>
                                                </div>
                                                <button type="button" onClick={() => triggerRemoveParticipant(p)} className="p-2 text-[#ACAAB0] hover:text-red-500 transition-all cursor-pointer"><UserX size={20} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALES EXPORT / SUPPRESSION */}
            {/* (J'ai ajouté cursor-pointer aux boutons) */}
            <div className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ${isExportModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0" onClick={() => setIsExportModalOpen(false)}></div>
                <div className={`relative m-4 p-6 w-2/5 min-w-[40%] max-w-[40%] rounded-lg bg-[#131317] shadow-xl transition-all duration-300 ${isExportModalOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-28 scale-90'}`}>
                    <div className="flex shrink-0 items-center pb-4 text-xl font-bold text-[#FCF8FE] gap-3 border-b border-[#2A2A32]"><Link className="text-indigo-600" size={24} /> Synchronisation Calendrier</div>
                    <div className="relative py-6 leading-normal text-[#ACAAB0] font-light"><p className="mb-4 text-emerald-600 font-bold">✅ Lien d'export copié !</p><p className="text-sm">Collez ce lien dans Google Calendar. Les mises à jour sont automatiques.</p><input type="text" readOnly value={exportUrl} className="mt-4 w-full p-3 text-xs bg-[#1F1F25] border border-[#2A2A32] rounded-lg text-[#ACAAB0] focus:outline-none" /></div>
                    <div className="flex justify-end pt-4 border-t border-[#2A2A32]"><button onClick={() => setIsExportModalOpen(false)} className="py-2 px-4 text-sm font-bold text-[#ACAAB0] cursor-pointer">Fermer</button><button onClick={() => { window.open(exportUrl, '_blank'); setIsExportModalOpen(false); }} className="rounded-md bg-indigo-600 py-2 px-4 text-sm text-white font-bold ml-2 cursor-pointer">Télécharger .ics</button></div>
                </div>
            </div>

            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isDeleteModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-[#0B0B0E]/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                <div className={`relative bg-[#131317] rounded-2xl text-left shadow-2xl sm:max-w-lg w-full transition-all duration-300 ${isDeleteModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="p-6"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0"><AlertTriangle className="h-6 w-6" /></div><div><h3 className="text-lg font-bold text-[#FCF8FE]">Supprimer l'événement</h3><p className="text-sm text-[#ACAAB0] mt-1">Voulez-vous vraiment supprimer cet événement ?</p></div></div></div>
                    <div className="bg-[#1F1F25] px-6 py-4 flex gap-3 justify-end rounded-b-2xl"><button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[#ACAAB0] bg-[#131317] border border-[#2A2A32] rounded-xl cursor-pointer">Annuler</button><button onClick={confirmDelete} className="px-4 py-2 text-sm font-black text-white bg-red-600 rounded-xl cursor-pointer">Oui, supprimer</button></div>
                </div>
            </div>

            <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 transition-all duration-300 ${isRemoveParticipantModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-[#0B0B0E]/80 backdrop-blur-sm" onClick={() => setIsRemoveParticipantModalOpen(false)}></div>
                <div className={`relative bg-[#131317] rounded-2xl text-left shadow-2xl sm:max-w-lg w-full transition-all duration-300 ${isRemoveParticipantModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="p-6">
                        <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0"><UserX className="h-6 w-6" /></div><div><h3 className="text-lg font-bold text-[#FCF8FE]">Retirer un participant</h3><p className="text-sm text-[#ACAAB0] mt-1">Voulez-vous vraiment retirer <span className="text-red-600 font-bold">{participantToRemove?.client_name}</span> de cette séance ? {participantToRemove?.statut === 'CONFIRME' && selectedEvent?.participants.some(p => p.statut === 'ATTENTE') && (<span className="block mt-2 text-orange-600 font-medium text-xs bg-orange-50 p-2 rounded-lg">Le premier client en liste d'attente prendra automatiquement sa place.</span>)}</p></div></div>
                    </div>
                    <div className="bg-[#1F1F25] px-6 py-4 flex gap-3 justify-end rounded-b-2xl"><button onClick={() => setIsRemoveParticipantModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[#ACAAB0] bg-[#131317] border border-[#2A2A32] rounded-xl hover:bg-[#1F1F25] cursor-pointer">Annuler</button><button onClick={confirmRemoveParticipant} className="px-4 py-2 text-sm font-black text-white bg-red-600 rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-700 cursor-pointer">Oui, le retirer</button></div>
                </div>
            </div>
            {/* MODALE D'ERREUR CALENDRIER */}
      <div className={`fixed inset-0 z-[1000] grid place-items-center bg-[#0B0B0E]/60 backdrop-blur-sm transition-all duration-300 ${errorModal.show ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className={`relative bg-[#131317] p-8 w-full max-w-sm rounded-3xl shadow-2xl border border-red-100 text-center transform transition-all duration-300 ${errorModal.show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          <div className="w-20 h-20 mx-auto bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-[#FCF8FE] mb-2">Impossible</h3>
          <p className="text-[#ACAAB0] mb-8 font-medium">
            {errorModal.message}
          </p>
          <button 
            onClick={() => setErrorModal({ show: false, message: '' })}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
        </div>
    );
};

export default CoachCalendar;
