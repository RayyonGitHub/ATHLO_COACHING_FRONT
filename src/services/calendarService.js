import api from './api';

const calendarService = {
    getCoachCalendar: async () => {
        try {
            const me = await api.get('/coach/me/');
            const coachId = me.data.id;
            if (!coachId) throw new Error("ID du coach introuvable.");

            // Double appel : séances ET indisponibilités (comme dans ta branche métier)
            const [seancesRes, indisposRes] = await Promise.all([
                api.get(`/calendar/coach/${coachId}/`),
                api.get('/indisponibilites/')
            ]);

            // Formatage des indispos pour qu'elles aient la même forme que les séances
            const indisposFormatted = indisposRes.data.map(i => ({
                id: `indispo-${i.id}`,
                db_id: i.id,
                title: i.titre,
                titre: i.titre,
                jour_prevu: i.jour_prevu,
                heure_debut: i.heure_debut,
                heure_fin: i.heure_fin,
                start: i.heure_debut ? `${i.jour_prevu}T${i.heure_debut}` : i.jour_prevu,
                end: i.heure_fin   ? `${i.jour_prevu}T${i.heure_fin}`   : null,
                type: i.est_conge ? 'conge' : 'indisponibilite',
                est_conge: i.est_conge,
                is_collective: false,
                est_collective: false,
                completed: false,
                est_completee: false,
                capacite_max: 1,
                nombre_inscrits: 0,
                participants: []
            }));

            return [...seancesRes.data, ...indisposFormatted];
        } catch (error) {
            console.error("Erreur calendrier", error);
            throw error;
        }
    },

    getExportUrl: async () => {
        try {
            const me = await api.get('/coach/me/');
            if (!me.data.id) throw new Error("ID du coach introuvable.");
            return `http://localhost:8000/api/calendar/export/${me.data.id}/`;
        } catch (error) {
            console.error("Erreur récupération URL d'export", error);
            throw error;
        }
    },

    createSeance: async (seanceData) => {
        try {
            const response = await api.post('/seances/', seanceData);
            return response.data;
        } catch (error) {
            console.error("Erreur création séance", error);
            throw error;
        }
    },

    createIndisponibilite: async (indispoData) => {
        try {
            const response = await api.post('/indisponibilites/', indispoData);
            return response.data;
        } catch (error) {
            console.error("Erreur création indisponibilité", error);
            throw error;
        }
    }
};

export default calendarService;