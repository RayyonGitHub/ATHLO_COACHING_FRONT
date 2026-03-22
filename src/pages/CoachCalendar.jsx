import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import calendarService from '../services/calendarService';
import { authService } from '../services/authService'; 
import axios from 'axios';
import { CalendarDays, AlertTriangle, PlusCircle, X, Edit3, Trash2, Link } from 'lucide-react';

// --- UTILITAIRES DE DATES (PURIFIÉS DES FUSEAUX HORAIRES) ---
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

// LA FONCTION MAGIQUE : Elle coupe tout ce qui dépasse 19 caractères pour forcer l'heure locale
const sanitizeDate = (dateStr) => {
    if (!dateStr) return null;
    return dateStr.substring(0, 19); 
};

const buildPayload = (type, data) => {
    // MAINTENANT TOUT LE MONDE UTILISE LE MÊME FORMAT !
    const basePayload = {
        titre: data.titre || (type === 'conge' ? 'Congé' : type === 'indisponibilite' ? 'Indisponible' : 'Nouvelle séance'),
        jour_prevu: data.jour,
        heure_debut: data.heure_debut + ':00', // On ajoute les secondes pour Django
        heure_fin: data.heure_fin + ':00'
    };

    if (type === 'indisponibilite' || type === 'conge') {
        return {
            ...basePayload,
            est_conge: type === 'conge'
        };
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

    const initialFormState = { type: 'individuelle', titre: '', capacite_max: 1, jour: '', heure_debut: '', heure_fin: '' };
    
    // 👇 ON A RENTRÉ LES DEUX LIGNES ICI 👇
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportUrl, setExportUrl] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState(initialFormState);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editFormData, setEditFormData] = useState(initialFormState);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

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

    // --- EXPORT GOOGLE CALENDAR ---
    const handleExportCalendar = async () => {
        try {
            const url = await calendarService.getExportUrl();
            setExportUrl(url); // On sauvegarde le lien
            
            // On copie le lien en silence dans le presse-papier
            await navigator.clipboard.writeText(url);
            
            // On ouvre ta magnifique modale animée !
            setIsExportModalOpen(true);
        } catch (error) {
            alert("Impossible de générer le lien d'export.");
        }
    };

    useEffect(() => {
        fetchSeances();
    }, []);

    // --- 1. CRÉATION ---
    const handleDateSelect = (selectInfo) => {
        const start = new Date(selectInfo.startStr);
        const end = new Date(selectInfo.endStr);
        setAddFormData({ type: 'individuelle', titre: '', capacite_max: 1, jour: toDateInput(start), heure_debut: toTimeInput(start), heure_fin: toTimeInput(end) });
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

    // --- 2. ÉDITION ---
    const handleEventClick = (clickInfo) => {
        const eventData = clickInfo.event.extendedProps.originalSeance;
        const start = new Date(clickInfo.event.start);
        const end = clickInfo.event.end ? new Date(clickInfo.event.end) : new Date(start.getTime() + 60*60*1000);

        setSelectedEvent({ ...eventData, db_id: eventData.db_id });
        setEditFormData({
            type: eventData.type || 'individuelle',
            titre: eventData.title || eventData.titre || '',
            capacite_max: eventData.capacite_max || 1,
            jour: toDateInput(start),
            heure_debut: toTimeInput(start),
            heure_fin: toTimeInput(end)
        });
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
            alert("Impossible de modifier l'événement. Vérifiez les horaires.");
        }
    };

    // --- 3. DRAG & DROP ET REDIMENSIONNEMENT ---
    const handleEventDropOrResize = async (changeInfo) => {
        const eventData = changeInfo.event.extendedProps.originalSeance;
        const newStart = new Date(changeInfo.event.start);
        const newEnd = changeInfo.event.end ? new Date(changeInfo.event.end) : new Date(newStart.getTime() + 60*60*1000);
        
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
            alert("Impossible de déplacer. L'événement est peut-être verrouillé.");
        }
    };

    // --- 4. SUPPRESSION ---
    const triggerDelete = () => {
        setEventToDelete(selectedEvent);
        setIsEditModalOpen(false); 
        setIsDeleteModalOpen(true); 
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;
        try {
            const token = authService.getToken(); 
            if (!token) return;

            const isIndispo = eventToDelete.type === 'indisponibilite' || eventToDelete.type === 'conge';
            const endpoint = isIndispo ? `/indisponibilites/${eventToDelete.db_id}/` : `/seances/${eventToDelete.db_id}/`;

            await axios.delete(`http://localhost:8000/api${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchSeances();
            setIsDeleteModalOpen(false);
            setEventToDelete(null);
        } catch (err) {
            alert("Impossible de supprimer l'événement.");
        }
    };

    // --- FORMATTAGE POUR LE CALENDRIER ---
    const events = seances.map(s => {
        let bgColor = '#4f46e5'; 
        if (s.is_collective) bgColor = '#f97316'; 
        else if (s.type === 'indisponibilite') bgColor = '#9ca3af'; 
        else if (s.type === 'conge') bgColor = '#10b981'; 

        let displayTitle = s.title;
        if (s.client_name) displayTitle += ` (${s.client_name})`;
        if (s.capacity_label) displayTitle += ` [${s.capacity_label}]`;

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

    return (
        <div className="bg-slate-50 min-h-screen p-8 font-sans flex flex-col">
            <div className="flex justify-between items-end mb-6 shrink-0">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <CalendarDays className="text-orange-500" size={32} /> Mon Agenda
                </h1>
                
                {/* LE NOUVEAU BOUTON D'EXPORT  */}
                <button 
                    onClick={handleExportCalendar} 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-900 transition-colors shadow-sm cursor-pointer"
                >
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
                    .fc-event { cursor: pointer; border-radius: 4px; padding: 4px; font-weight: 600; font-size: 0.75rem; border: none; transition: transform 0.1s; }
                    .fc-highlight { background-color: #f97316 !important; opacity: 0.2 !important; } 
                `}</style>

                {loading ? <div className="text-center py-20">Chargement...</div> : (
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        locales={[frLocale]} locale="fr"
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                        events={events}
                        selectable={true} selectMirror={true} select={handleDateSelect}
                        editable={true} 
                        eventDrop={handleEventDropOrResize} 
                        eventResize={handleEventDropOrResize} 
                        eventClick={handleEventClick}
                        height="100%" slotMinTime="06:00:00" slotMaxTime="22:00:00" allDaySlot={false} nowIndicator={true}
                    />
                )}
            </div>

            {/* MODALE AJOUT */}
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isAddModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                <div className={`relative bg-white rounded-2xl shadow-2xl sm:max-w-md w-full transition-all duration-300 ${isAddModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="flex justify-between items-center p-6 border-b border-slate-100"><h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><PlusCircle className="text-orange-500" size={24} /> Nouvel Événement</h3><button onClick={() => setIsAddModalOpen(false)}><X size={24} className="text-slate-400"/></button></div>
                    <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Type d'événement</label>
                            <select value={addFormData.type} onChange={(e) => setAddFormData({...addFormData, type: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3">
                                <option value="individuelle">Séance Individuelle</option><option value="collective">Séance Collective</option><option value="indisponibilite">Indisponibilité</option><option value="conge">Congé</option>
                            </select>
                        </div>
                        <div><label className="block text-sm font-bold text-slate-700 mb-2">Titre (optionnel)</label><input type="text" value={addFormData.titre} onChange={(e) => setAddFormData({...addFormData, titre: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-2">Date</label><input type="date" value={addFormData.jour} onChange={(e) => setAddFormData({...addFormData, jour: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" required /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Début</label><input type="time" value={addFormData.heure_debut} onChange={(e) => setAddFormData({...addFormData, heure_debut: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" required /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Fin</label><input type="time" value={addFormData.heure_fin} onChange={(e) => setAddFormData({...addFormData, heure_fin: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" required /></div>
                        </div>
                        {addFormData.type === 'collective' && (<div><label className="block text-sm font-bold text-slate-700 mb-2">Capacité max</label><input type="number" min="2" value={addFormData.capacite_max} onChange={(e) => setAddFormData({...addFormData, capacite_max: parseInt(e.target.value)})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" /></div>)}
                        <div className="pt-6 flex justify-end gap-2"><button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl">Annuler</button><button type="submit" className="px-4 py-2 text-sm font-black text-white bg-indigo-600 rounded-xl">Enregistrer</button></div>
                    </form>
                </div>
            </div>

            {/* MODALE ÉDITION */}
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isEditModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                <div className={`relative bg-white rounded-2xl shadow-2xl sm:max-w-md w-full transition-all duration-300 ${isEditModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl"><h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Edit3 className="text-indigo-500" size={24} /> Modifier</h3><button onClick={() => setIsEditModalOpen(false)}><X size={24} className="text-slate-400"/></button></div>
                    <form onSubmit={handleUpdateEvent} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Type d'événement</label>
                            <select value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3">
                                <option value="individuelle">Séance Individuelle</option><option value="collective">Séance Collective</option><option value="indisponibilite">Indisponibilité</option><option value="conge">Congé</option>
                            </select>
                        </div>
                        <div><label className="block text-sm font-bold text-slate-700 mb-2">Titre</label><input type="text" value={editFormData.titre} onChange={(e) => setEditFormData({...editFormData, titre: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-2">Date</label><input type="date" value={editFormData.jour} onChange={(e) => setEditFormData({...editFormData, jour: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" required /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Début</label><input type="time" value={editFormData.heure_debut} onChange={(e) => setEditFormData({...editFormData, heure_debut: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" required /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Fin</label><input type="time" value={editFormData.heure_fin} onChange={(e) => setEditFormData({...editFormData, heure_fin: e.target.value})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" required /></div>
                        </div>
                        {editFormData.type === 'collective' && (<div><label className="block text-sm font-bold text-slate-700 mb-2">Capacité max</label><input type="number" min="2" value={editFormData.capacite_max} onChange={(e) => setEditFormData({...editFormData, capacite_max: parseInt(e.target.value)})} className="w-full border-slate-200 rounded-xl focus:border-indigo-500 p-3" /></div>)}
                        <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                            <button type="button" onClick={triggerDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100"><Trash2 size={18} /> Supprimer</button>
                            <div className="flex gap-2"><button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl">Annuler</button><button type="submit" className="px-4 py-2 text-sm font-black text-white bg-indigo-600 rounded-xl">Mettre à jour</button></div>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODALE D'EXPORT design personnalisé */}
            <div className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ${isExportModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Couche invisible pour fermer en cliquant à côté */}
                <div className="absolute inset-0" onClick={() => setIsExportModalOpen(false)}></div>
                
                <div className={`relative m-4 p-6 w-2/5 min-w-[40%] max-w-[40%] rounded-lg bg-white shadow-xl transition-all duration-300 ${isExportModalOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-28 scale-90'}`}>
                    
                    <div className="flex shrink-0 items-center pb-4 text-xl font-bold text-slate-800 gap-3 border-b border-slate-100">
                        <Link className="text-indigo-600" size={24} /> 
                        Synchronisation Calendrier
                    </div>
                    
                    <div className="relative py-6 leading-normal text-slate-600 font-light">
                        <p className="mb-4 text-emerald-600 font-bold flex items-center gap-2">
                             Lien d'export copié dans le presse-papier !
                        </p>
                        <p className="text-sm">
                            Vous pouvez le coller dans Google Calendar (<em>Ajouter un agenda &gt; À partir de l'URL</em>) ou Apple Calendar. Les modifications faites ici se mettront à jour automatiquement sur votre téléphone.
                        </p>
                        
                        {/* Champ en lecture seule montrant le lien pour faire pro */}
                        <input 
                            type="text" 
                            readOnly 
                            value={exportUrl} 
                            className="mt-4 w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 focus:outline-none" 
                        />
                    </div>
                    
                    <div className="flex shrink-0 flex-wrap items-center pt-4 justify-end border-t border-slate-100">
                        <button 
                            onClick={() => setIsExportModalOpen(false)} 
                            className="rounded-md border border-transparent py-2 px-4 text-center text-sm transition-all text-slate-600 hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100 cursor-pointer" 
                            type="button"
                        >
                            Fermer
                        </button>
                        <button 
                            onClick={() => { window.open(exportUrl, '_blank'); setIsExportModalOpen(false); }} 
                            className="rounded-md bg-indigo-600 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg hover:bg-indigo-700 ml-2 font-bold cursor-pointer" 
                            type="button"
                        >
                            Télécharger le fichier .ics
                        </button>
                    </div>

                </div>
            </div>

            {/* MODALE SUPPRESSION */}
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isDeleteModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                <div className={`relative bg-white rounded-2xl text-left shadow-2xl sm:max-w-lg w-full transition-all duration-300 ${isDeleteModalOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="p-6"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0"><AlertTriangle className="h-6 w-6" /></div><div><h3 className="text-lg font-bold text-slate-900">Supprimer l'événement</h3><p className="text-sm text-slate-500 mt-1">Voulez-vous vraiment supprimer cet événement : <span className="text-red-600 font-bold">{eventToDelete?.title || eventToDelete?.titre}</span> ?</p></div></div></div>
                    <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl"><button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">ANNULER</button><button onClick={confirmDelete} className="px-4 py-2 text-sm font-black text-white bg-red-600 rounded-xl hover:bg-red-500 shadow-lg shadow-red-500/30">OUI, SUPPRIMER</button></div>
                </div>
            </div>
        </div>
    );
};

export default CoachCalendar;