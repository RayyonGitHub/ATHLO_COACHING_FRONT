import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import calendarService from '../services/calendarService';
import { authService } from '../services/authService';
import axios from 'axios';
import { CalendarDays, AlertTriangle, PlusCircle, X, Edit3, Trash2, Link, Users, Info, UserX, CheckCircle, XCircle, Check } from 'lucide-react';

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
        return {
            ...basePayload,
            est_collective: type === 'collective',
            capacite_max: type === 'collective' ? data.capacite_max : 1
        };
    }
};

const CoachCalendar = () => {
    const calendarRef = useRef(null);
    const [seances, setSeances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportUrl, setExportUrl] = useState('');

    const initialFormState = { type: 'individuelle', titre: '', capacite_max: 1, jour: '', heure_debut: '', heure_fin: '', est_completee: false };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState(initialFormState);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editFormData, setEditFormData] = useState(initialFormState);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    const [isRemoveParticipantModalOpen, setIsRemoveParticipantModalOpen] = useState(false);
    const [participantToRemove, setParticipantToRemove] = useState(null);

    const fetchSeances = async () => {
        try {
            setLoading(true);
            const data = await calendarService.getCoachCalendar();
            setSeances(data);
        } catch (err) {
            console.error("Erreur", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeances();
    }, []);

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

    const handleDateSelect = (selectInfo) => {
        const start = new Date(selectInfo.startStr);
        const end = new Date(selectInfo.endStr);
        setAddFormData({ type: 'individuelle', titre: '', capacite_max: 1, jour: toDateInput(start), heure_debut: toTimeInput(start), heure_fin: toTimeInput(end), est_completee: false });
        setIsAddModalOpen(true);
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
            fetchSeances();
            setIsAddModalOpen(false);
            calendarRef.current.getApi().unselect();
        } catch (error) {
            alert("Erreur lors de la création.");
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
            est_completee: eventData.completed || false
        });
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
                await axios.patch(`http://localhost:8000/api${endpoint}`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
            } else {
                const deleteEndpoint = oldFamily === 'indispo' ? `/indisponibilites/${selectedEvent.db_id}/` : `/seances/${selectedEvent.db_id}/`;
                await axios.delete(`http://localhost:8000/api${deleteEndpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });

                if (newFamily === 'indispo') {
                    await calendarService.createIndisponibilite(payload);
                } else {
                    await calendarService.createSeance(payload);
                }
            }
            fetchSeances();
            setIsEditModalOpen(false);
        } catch (err) {
            alert("Erreur lors de la modification.");
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

            await axios.patch(`http://localhost:8000/api${endpoint}`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchSeances();
        } catch (error) {
            changeInfo.revert();
            alert("Erreur lors du déplacement.");
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

            await axios.delete(`http://localhost:8000/api${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
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

            await axios.delete(`http://localhost:8000/api/inscriptions/${participantToRemove.id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            fetchSeances();

            setSelectedEvent(prev => {
                const isConfirmed = participantToRemove.statut === 'CONFIRME';
                let newParticipants = prev.participants.filter(p => p.id !== participantToRemove.id);
                let newNombreInscrits = isConfirmed ? prev.nombre_inscrits - 1 : prev.nombre_inscrits;

                if (isConfirmed && newNombreInscrits < prev.capacite_max) {
                    const firstWaitingIndex = newParticipants.findIndex(p => p.statut === 'ATTENTE');
                    if (firstWaitingIndex !== -1) {
                        const promotedParticipant = { ...newParticipants[firstWaitingIndex], statut: 'CONFIRME' };
                        newParticipants = [
                            ...newParticipants.slice(0, firstWaitingIndex),
                            promotedParticipant,
                            ...newParticipants.slice(firstWaitingIndex + 1)
                        ];
                        newNombreInscrits += 1;
                    }
                }
                return { ...prev, participants: newParticipants, nombre_inscrits: newNombreInscrits };
            });

            setIsRemoveParticipantModalOpen(false);
            setParticipantToRemove(null);
        } catch (error) {
            alert("Erreur lors du retrait du participant.");
        }
    };

    const handleAttendance = async (inscriptionId, newStatus) => {
        try {
            const token = authService.getToken();
            if (!token) return;

            await axios.patch(`http://localhost:8000/api/inscriptions/${inscriptionId}/status/`, { statut: newStatus }, {
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

    // --- RENDU DES ÉVÉNEMENTS ---
    const events = seances.map(s => {
        let bgColor = s.completed ? '#64748b' : '#4f46e5';
        if (!s.completed && s.is_collective) bgColor = '#f97316';
        else if (!s.completed && s.type === 'indisponibilite') bgColor = '#9ca3af';
        else if (!s.completed && s.type === 'conge') bgColor = '#10b981';

        let displayTitle = s.title;
        if (s.completed) displayTitle = "[Terminé] " + displayTitle;
        
        // FIX 1 : On compte le "vrai" nombre de participants (Confirmés + Présents + Absents)
        if (s.is_collective) {
            const trueCount = s.participants ? s.participants.filter(p => ['CONFIRME', 'PRESENT', 'ABSENT'].includes(p.statut)).length : (s.nombre_inscrits || 0);
            displayTitle += ` (${trueCount}/${s.capacite_max || 1})`;
        }

        return {
            id: s.id,
            title: displayTitle,
            start: sanitizeDate(s.start),
            end: sanitizeDate(s.end),
            backgroundColor: bgColor,
            borderColor: bgColor,
            extendedProps: { originalSeance: s }
        };
    });

    // FIX 2 : Le vrai compte pour la petite bulle orange
    const trueParticipantCount = selectedEvent?.participants?.filter(p => ['CONFIRME', 'PRESENT', 'ABSENT'].includes(p.statut)).length || 0;

    return (
        <div className="bg-slate-50 min-h-screen p-8 font-sans flex flex-col">
            <div className="flex justify-between items-end mb-6 shrink-0">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <CalendarDays className="text-orange-500" size={32} /> Mon Agenda
                </h1>
                <button onClick={handleExportCalendar} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer">
                    <Link size={18} /> Synchroniser (Google Calendar / ICS)
                </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 h-[700px] flex flex-col">
                <style>{`
                    .fc .fc-toolbar-title { font-size: 1.5rem; font-weight: 900; color: #1e1b4b; text-transform: capitalize; }
                    .fc-button-primary { background-color: #f97316 !important; border-color: #f97316 !important; font-weight: bold !important; border-radius: 0.5rem !important; }
                    .fc-button-primary:hover { background-color: #ea580c !important; }
                    .fc-button-active { background-color: #1e1b4b !important; border-color: #1e1b4b !important; }
                    .fc-theme-standard th { padding: 10px 0; background-color: #f8fafc; font-size: 0.8rem; text-transform: uppercase; color: #64748b; }
                    .fc-event { cursor: pointer; border-radius: 8px; padding: 6px; font-weight: 600; font-size: 0.75rem; border: none; transition: transform 0.1s; }
                    .fc-highlight { background-color: #f97316 !important; opacity: 0.2 !important; } 
                `}</style>

                {loading ? <div className="text-center py-20 font-bold text-slate-400">Chargement de l'agenda...</div> : (
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        locales={[frLocale]} locale="fr"
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                        events={events}
                        selectable={true} selectMirror={true} select={handleDateSelect}
                        editable={true} eventDrop={handleEventDropOrResize} eventResize={handleEventDropOrResize} eventClick={handleEventClick}
                        height="100%" slotMinTime="06:00:00" slotMaxTime="22:00:00" allDaySlot={false} nowIndicator={true}
                    />
                )}
            </div>

            {/* MODALE AJOUT (Simple) */}
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isAddModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                <div className={`relative bg-white rounded-2xl shadow-2xl sm:max-w-md w-full transition-all duration-300 ${isAddModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="flex justify-between items-center p-6 border-b border-slate-100"><h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><PlusCircle className="text-orange-500" size={24} /> Nouvelle Séance</h3><button onClick={() => setIsAddModalOpen(false)}><X size={24} className="text-slate-400" /></button></div>
                    <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                        <select value={addFormData.type} onChange={(e) => setAddFormData({ ...addFormData, type: e.target.value })} className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                            <option value="individuelle">Séance Individuelle</option><option value="collective">Séance Collective</option><option value="indisponibilite">Indisponibilité</option><option value="conge">Congé</option>
                        </select>
                        <input type="text" placeholder="Titre de la séance..." value={addFormData.titre} onChange={(e) => setAddFormData({ ...addFormData, titre: e.target.value })} className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2"><input type="date" value={addFormData.jour} onChange={(e) => setAddFormData({ ...addFormData, jour: e.target.value })} className="w-full border-slate-200 rounded-xl p-3" required /></div>
                            <input type="time" value={addFormData.heure_debut} onChange={(e) => setAddFormData({ ...addFormData, heure_debut: e.target.value })} className="w-full border-slate-200 rounded-xl p-3" required />
                            <input type="time" value={addFormData.heure_fin} onChange={(e) => setAddFormData({ ...addFormData, heure_fin: e.target.value })} className="w-full border-slate-200 rounded-xl p-3" required />
                        </div>
                        {addFormData.type === 'collective' && <input type="number" min="2" placeholder="Capacité max" value={addFormData.capacite_max} onChange={(e) => setAddFormData({ ...addFormData, capacite_max: parseInt(e.target.value) })} className="w-full border-slate-200 rounded-xl p-3" />}
                        <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Annuler</button><button type="submit" className="px-5 py-2.5 font-black text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">Créer</button></div>
                    </form>
                </div>
            </div>

            {/* MODALE ÉDITION AVEC ONGLETS */}
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isEditModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                <div className={`relative bg-white rounded-3xl shadow-2xl sm:max-w-lg w-full transition-all duration-300 overflow-hidden ${isEditModalOpen ? 'scale-100' : 'scale-95'}`}>

                    <div className="flex justify-between items-center p-6 bg-slate-50 border-b border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            {activeTab === 'details' ? <Edit3 className="text-indigo-500" size={24} /> : <Users className="text-orange-500" size={24} />}
                            {activeTab === 'details' ? "Modifier la séance" : (editFormData.est_completee ? "Appel des présences" : "Gestion des participants")}
                        </h3>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                    </div>

                    {!(selectedEvent?.type === 'indisponibilite' || selectedEvent?.type === 'conge') && (
                        <div className="flex border-b border-slate-100">
                            <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <Info size={18} /> Détails
                            </button>
                            <button onClick={() => setActiveTab('participants')} className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'participants' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <Users size={18} /> {editFormData.est_completee ? "Appel" : "Participants"}
                                {/* FIX 2 : Application du vrai compte pour la bulle */}
                                {trueParticipantCount > 0 && <span className="ml-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full">{trueParticipantCount}</span>}
                            </button>
                        </div>
                    )}

                    <div className="p-6">
                        {activeTab === 'details' ? (
                            <form onSubmit={handleUpdateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Type d'événement</label>
                                    <select value={editFormData.type} onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })} className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="individuelle">Séance Individuelle</option><option value="collective">Séance Collective</option><option value="indisponibilite">Indisponibilité</option><option value="conge">Congé</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Titre</label>
                                    <input type="text" value={editFormData.titre} onChange={(e) => setEditFormData({ ...editFormData, titre: e.target.value })} className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2"><label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Date</label><input type="date" value={editFormData.jour} onChange={(e) => setEditFormData({ ...editFormData, jour: e.target.value })} className="w-full border-slate-200 rounded-xl p-3" required /></div>
                                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Début</label><input type="time" value={editFormData.heure_debut} onChange={(e) => setEditFormData({ ...editFormData, heure_debut: e.target.value })} className="w-full border-slate-200 rounded-xl p-3" required /></div>
                                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Fin</label><input type="time" value={editFormData.heure_fin} onChange={(e) => setEditFormData({ ...editFormData, heure_fin: e.target.value })} className="w-full border-slate-200 rounded-xl p-3" required /></div>
                                </div>
                                {editFormData.type === 'collective' && (
                                    <div><label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Capacité maximale</label><input type="number" min="2" value={editFormData.capacite_max} onChange={(e) => setEditFormData({ ...editFormData, capacite_max: parseInt(e.target.value) })} className="w-full border-slate-200 rounded-xl p-3" /></div>
                                )}

                                {!(editFormData.type === 'indisponibilite' || editFormData.type === 'conge') && (
                                    <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl border ${editFormData.est_completee ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                                        <input
                                            type="checkbox"
                                            id="est_completee"
                                            checked={editFormData.est_completee}
                                            onChange={(e) => setEditFormData({ ...editFormData, est_completee: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                                        />
                                        <label htmlFor="est_completee" className={`font-bold cursor-pointer flex items-center gap-2 ${editFormData.est_completee ? 'text-emerald-700' : 'text-slate-600'}`}>
                                            <CheckCircle size={18} /> Marquer la séance comme terminée
                                        </label>
                                    </div>
                                )}

                                <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                                    <button type="button" onClick={triggerDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /> Supprimer</button>
                                    <div className="flex gap-2"><button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Annuler</button><button type="submit" className="px-5 py-2.5 font-black text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Mettre à jour</button></div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {/* Jauge de capacité modifiée pour utiliser le vrai compte */}
                                {selectedEvent?.est_collective && !editFormData.est_completee && (
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Remplissage de la séance</span>
                                            <span className="text-sm font-black text-indigo-600">{trueParticipantCount} / {selectedEvent.capacite_max}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-500 ${trueParticipantCount >= selectedEvent.capacite_max ? 'bg-orange-500' : 'bg-indigo-600'}`} style={{ width: `${(trueParticipantCount / selectedEvent.capacite_max) * 100}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                                        {editFormData.est_completee ? "Appel des présences" : "Participants confirmés"}
                                    </h4>

                                    {selectedEvent?.participants?.filter(p => ['CONFIRME', 'PRESENT', 'ABSENT'].includes(p.statut)).length > 0 ? (
                                        selectedEvent.participants.filter(p => ['CONFIRME', 'PRESENT', 'ABSENT'].includes(p.statut)).map(p => {
                                            
                                            // FIX 3 : Le "Trompe-l'œil" : Si décoché, on fait semblant que tout le monde est juste 'CONFIRME'
                                            const visualStatut = editFormData.est_completee ? p.statut : 'CONFIRME';

                                            return (
                                                <div key={p.id} className={`flex items-center justify-between p-3 border rounded-2xl transition-all ${visualStatut === 'PRESENT' ? 'bg-emerald-50 border-emerald-100' : visualStatut === 'ABSENT' ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${visualStatut === 'PRESENT' ? 'bg-emerald-200 text-emerald-700' : visualStatut === 'ABSENT' ? 'bg-red-200 text-red-700' : 'bg-indigo-100 text-indigo-600'}`}>
                                                            {p.client_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{p.client_name}</p>
                                                            
                                                            {editFormData.est_completee ? (
                                                                <p className="text-xs text-slate-500 flex items-center mt-1">
                                                                    {visualStatut === 'PRESENT' ? (
                                                                        <span className="flex items-center text-emerald-600 font-bold"><Check size={14} className="mr-1" /> Présent</span>
                                                                    ) : visualStatut === 'ABSENT' ? (
                                                                        <span className="flex items-center text-red-600 font-bold"><X size={14} className="mr-1" /> Absent</span>
                                                                    ) : 'En attente d\'appel...'}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    Inscrit le {p.date_inscription ? new Date(p.date_inscription).toLocaleDateString() : ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {editFormData.est_completee ? (
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => handleAttendance(p.id, 'PRESENT')} className={`p-2 rounded-lg transition-all ${visualStatut === 'PRESENT' ? 'bg-emerald-200 text-emerald-700' : 'text-slate-300 hover:bg-emerald-100 hover:text-emerald-600'}`}><CheckCircle size={24} /></button>
                                                            <button type="button" onClick={() => handleAttendance(p.id, 'ABSENT')} className={`p-2 rounded-lg transition-all ${visualStatut === 'ABSENT' ? 'bg-red-200 text-red-700' : 'text-slate-300 hover:bg-red-100 hover:text-red-600'}`}><XCircle size={24} /></button>
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => triggerRemoveParticipant(p)} className="p-2 text-slate-300 hover:text-red-500 transition-all cursor-pointer"><UserX size={20} /></button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : <p className="text-sm text-slate-400 italic px-1 py-4">Aucun client n'est encore inscrit à cette séance.</p>}
                                </div>

                                {!editFormData.est_completee && selectedEvent?.participants?.filter(p => p.statut === 'ATTENTE').length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-dashed border-slate-200">
                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest px-1">En liste d'attente</h4>
                                        {selectedEvent.participants.filter(p => p.statut === 'ATTENTE').map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black">{p.client_name?.charAt(0)}</div>
                                                    <div><p className="text-sm font-bold text-slate-900">{p.client_name}</p><p className="text-xs text-orange-600 font-medium">Position dans la file : #1</p></div>
                                                </div>
                                                <button type="button" onClick={() => triggerRemoveParticipant(p)} className="p-2 text-slate-300 hover:text-red-500 transition-all cursor-pointer"><UserX size={20} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ${isExportModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0" onClick={() => setIsExportModalOpen(false)}></div>
                <div className={`relative m-4 p-6 w-2/5 min-w-[40%] max-w-[40%] rounded-lg bg-white shadow-xl transition-all duration-300 ${isExportModalOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-28 scale-90'}`}>
                    <div className="flex shrink-0 items-center pb-4 text-xl font-bold text-slate-800 gap-3 border-b border-slate-100"><Link className="text-indigo-600" size={24} /> Synchronisation Calendrier</div>
                    <div className="relative py-6 leading-normal text-slate-600 font-light"><p className="mb-4 text-emerald-600 font-bold">✅ Lien d'export copié !</p><p className="text-sm">Collez ce lien dans Google Calendar. Les mises à jour sont automatiques.</p><input type="text" readOnly value={exportUrl} className="mt-4 w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 focus:outline-none" /></div>
                    <div className="flex justify-end pt-4 border-t border-slate-100"><button onClick={() => setIsExportModalOpen(false)} className="py-2 px-4 text-sm font-bold text-slate-600">Fermer</button><button onClick={() => { window.open(exportUrl, '_blank'); setIsExportModalOpen(false); }} className="rounded-md bg-indigo-600 py-2 px-4 text-sm text-white font-bold ml-2">Télécharger .ics</button></div>
                </div>
            </div>

            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isDeleteModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                <div className={`relative bg-white rounded-2xl text-left shadow-2xl sm:max-w-lg w-full transition-all duration-300 ${isDeleteModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="p-6"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0"><AlertTriangle className="h-6 w-6" /></div><div><h3 className="text-lg font-bold text-slate-900">Supprimer l'événement</h3><p className="text-sm text-slate-500 mt-1">Voulez-vous vraiment supprimer cet événement ?</p></div></div></div>
                    <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl"><button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl">Annuler</button><button onClick={confirmDelete} className="px-4 py-2 text-sm font-black text-white bg-red-600 rounded-xl">Oui, supprimer</button></div>
                </div>
            </div>

            <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 transition-all duration-300 ${isRemoveParticipantModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRemoveParticipantModalOpen(false)}></div>
                <div className={`relative bg-white rounded-2xl text-left shadow-2xl sm:max-w-lg w-full transition-all duration-300 ${isRemoveParticipantModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="p-6">
                        <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0"><UserX className="h-6 w-6" /></div><div><h3 className="text-lg font-bold text-slate-900">Retirer un participant</h3><p className="text-sm text-slate-500 mt-1">Voulez-vous vraiment retirer <span className="text-red-600 font-bold">{participantToRemove?.client_name}</span> de cette séance ? {participantToRemove?.statut === 'CONFIRME' && selectedEvent?.participants.some(p => p.statut === 'ATTENTE') && (<span className="block mt-2 text-orange-600 font-medium text-xs bg-orange-50 p-2 rounded-lg">Le premier client en liste d'attente prendra automatiquement sa place.</span>)}</p></div></div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl"><button onClick={() => setIsRemoveParticipantModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Annuler</button><button onClick={confirmRemoveParticipant} className="px-4 py-2 text-sm font-black text-white bg-red-600 rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-700">Oui, le retirer</button></div>
                </div>
            </div>
        </div>
    );
};

export default CoachCalendar;