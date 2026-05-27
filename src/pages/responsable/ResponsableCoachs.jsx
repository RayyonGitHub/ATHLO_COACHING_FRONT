import React, { useEffect, useState } from 'react';
import { responsableService } from '../../services/responsableService';
import api from '../../services/api';

const ResponsableCoachs = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCoach, setEditingCoach] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await responsableService.getCoachSupervision();
        const coachs = (response.coachs || []).filter((user) => user.role === 'coach');
        setData({
          ...response,
          coachs,
          kpis: {
            ...response.kpis,
            total_coachs: coachs.length,
          },
        });
      } catch (err) {
        setError("Impossible de charger les données de supervision.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = async (coach) => {
    try {
      const res = await api.get(`/responsable/coachs/${coach.id}/`);
      setEditForm(res.data);
      setEditingCoach(coach.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      await api.patch(`/responsable/coachs/${editingCoach}/`, editForm);
      setEditingCoach(null);
      const response = await responsableService.getCoachSupervision();
      const coachs = (response.coachs || []).filter((user) => user.role === 'coach');
      setData({
        ...response,
        coachs,
        kpis: {
          ...response.kpis,
          total_coachs: coachs.length,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (coachId) => {
    try {
      await api.delete(`/responsable/coachs/${coachId}/`);
      setShowDeleteModal(null);
      const response = await responsableService.getCoachSupervision();
      const coachs = (response.coachs || []).filter((user) => user.role === 'coach');
      setData({
        ...response,
        coachs,
        kpis: {
          ...response.kpis,
          total_coachs: coachs.length,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-[#ff915a] animate-pulse font-bold">Chargement de la supervision...</div>;
  if (error) return <div className="p-8 text-[#ff7351]">{error}</div>;

  const { kpis, coachs, salle_nom } = data;

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1600px] text-[#fcf8fe]">
      
      {/* Header */}
      <div className="space-y-1">
        <span className="text-sm uppercase tracking-[0.2em] text-[#acaab0] font-bold">Supervision des Coachs - {salle_nom}</span>
        <h3 className="text-3xl font-black tracking-tight">Performances & Activité</h3>
      </div>

      {/* OVERVIEW BENTO GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#131317] p-6 rounded-xl relative overflow-hidden group border border-[#48474c]/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl">groups</span>
          </div>
          <p className="text-[#acaab0] text-xs uppercase tracking-widest font-bold mb-2">Coachs Affiliés</p>
          <h3 className="text-3xl font-black text-[#fcf8fe]">{kpis.total_coachs}</h3>
        </div>

        <div className="bg-[#131317] p-6 rounded-xl relative overflow-hidden group border border-[#48474c]/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl">bolt</span>
          </div>
          <p className="text-[#acaab0] text-xs uppercase tracking-widest font-bold mb-2">Actifs Aujourd'hui</p>
          <h3 className="text-3xl font-black text-[#fcf8fe]">{kpis.coachs_actifs_jour}</h3>
        </div>

        <div className="bg-[#131317] p-6 rounded-xl relative overflow-hidden group border border-[#48474c]/20 lg:col-span-2">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl">payments</span>
          </div>
          <p className="text-[#acaab0] text-xs uppercase tracking-widest font-bold mb-2">Revenus Générés (Mois en cours)</p>
          <h3 className="text-3xl font-black text-[#ff915a]">{kpis.total_commissions.toLocaleString('fr-FR')} €</h3>
        </div>
      </section>

      {/* COACH SUPERVISION TABLE */}
      <section className="bg-[#131317] rounded-xl overflow-hidden border border-[#48474c]/20">
        <div className="p-8 flex justify-between items-center">
          <div>
            <h4 className="text-xl font-bold text-[#fcf8fe]">Supervision Active</h4>
            <p className="text-[#acaab0] text-sm mt-1">Données filtrées pour la salle uniquement. Les données privées sont masquées.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1f1f25]/50 text-[10px] uppercase tracking-[0.2em] font-black text-[#acaab0]">
                <th className="px-8 py-5 border-b border-[#48474c]/20">Coach</th>
                <th className="px-8 py-5 border-b border-[#48474c]/20">Charge (Mois)</th>
                <th className="px-8 py-5 border-b border-[#48474c]/20">Indice d'Activité</th>
                <th className="px-8 py-5 border-b border-[#48474c]/20 text-right">Revenus Générés</th>
                <th className="px-8 py-5 border-b border-[#48474c]/20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#48474c]/10">
              
              {coachs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-6 text-center text-[#acaab0]">Aucun coach affilié à cette salle.</td>
                </tr>
              ) : (
                coachs.map((coach, idx) => (
                  <tr key={coach.id} className="hover:bg-[#1f1f25]/50 transition-colors">
                    <td className="px-8 py-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1f1f25] flex items-center justify-center font-bold text-[#ff915a]">
                        {coach.nom.charAt(0)}
                      </div>
                      <span className="font-bold text-[#fcf8fe]">{coach.nom}</span>
                    </td>
                    
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[#fcf8fe] font-bold">{coach.seances_mois} Séances</span>
                        <div className="w-32 h-1 bg-[#25252b] rounded-full mt-2 overflow-hidden">
                          {/* Barre visuelle basée sur l'occupation moyenne */}
                          <div className="bg-[#ff915a] h-full" style={{ width: `${coach.taux_occupation}%` }}></div>
                        </div>
                      </div>
                    </td>
                    
                    <td className={`px-8 py-6 font-bold ${coach.index_color}`}>
                      {coach.index_text}
                    </td>
                    
                    <td className="px-8 py-6 text-right font-black text-[#fcf8fe]">
                      {coach.revenus_generes.toLocaleString('fr-FR')} €
                    </td>
                    
                    <td className="px-8 py-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(coach)} className="px-3 py-1.5 bg-[#ff915a] text-white rounded-lg text-xs font-bold hover:bg-[#ff915a]/80 transition">
                          Éditer
                        </button>
                        <button onClick={() => setShowDeleteModal(coach.id)} className="px-3 py-1.5 bg-[#ff7351] text-white rounded-lg text-xs font-bold hover:bg-[#ff7351]/80 transition">
                          Retirer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </section>
      
      {editingCoach && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setEditingCoach(null)}>
          <div className="bg-[#1f1f25] rounded-2xl p-8 max-w-lg w-full m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-[#fcf8fe] mb-6">Éditer le Coach</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Prénom" value={editForm.prenom || ''} onChange={(e) => setEditForm({...editForm, prenom: e.target.value})} className="w-full bg-[#131317] border border-[#48474c]/20 rounded-xl px-4 py-3 text-white" />
              <input type="text" placeholder="Nom" value={editForm.nom || ''} onChange={(e) => setEditForm({...editForm, nom: e.target.value})} className="w-full bg-[#131317] border border-[#48474c]/20 rounded-xl px-4 py-3 text-white" />
              <input type="tel" placeholder="Téléphone" value={editForm.telephone || ''} onChange={(e) => setEditForm({...editForm, telephone: e.target.value})} className="w-full bg-[#131317] border border-[#48474c]/20 rounded-xl px-4 py-3 text-white" />
              <input type="text" placeholder="Ville" value={editForm.ville || ''} onChange={(e) => setEditForm({...editForm, ville: e.target.value})} className="w-full bg-[#131317] border border-[#48474c]/20 rounded-xl px-4 py-3 text-white" />
              <input type="text" placeholder="Spécialité" value={editForm.specialite || ''} onChange={(e) => setEditForm({...editForm, specialite: e.target.value})} className="w-full bg-[#131317] border border-[#48474c]/20 rounded-xl px-4 py-3 text-white" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-[#ff915a] text-white py-3 rounded-xl font-bold hover:bg-[#ff915a]/80 transition">Enregistrer</button>
              <button onClick={() => setEditingCoach(null)} className="px-6 bg-[#48474c] text-white py-3 rounded-xl font-bold hover:bg-[#48474c]/80 transition">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(null)}>
          <div className="bg-[#1f1f25] rounded-2xl p-8 max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-[#ff7351] mb-4">⚠️ Retrait Définitif</h3>
            <p className="text-[#fcf8fe] mb-2 font-bold">Cette action est IRRÉVERSIBLE.</p>
            <p className="text-[#acaab0] mb-6">Ce coach sera banni de votre salle et ne pourra plus JAMAIS y être réaffecté. Êtes-vous sûr de vouloir continuer ?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 bg-[#ff7351] text-white py-3 rounded-xl font-bold hover:bg-[#ff7351]/80 transition">Retirer Définitivement</button>
              <button onClick={() => setShowDeleteModal(null)} className="px-6 bg-[#48474c] text-white py-3 rounded-xl font-bold hover:bg-[#48474c]/80 transition">Annuler</button>
            </div>
          </div>
        </div>
      )}
      
      {/* FOOTER INFO / DATA PRIVACY POLICY */}
      <footer className="pt-8 flex flex-col items-center gap-4">
        <p className="text-[10px] uppercase font-bold text-[#acaab0]/40 tracking-widest">
          © ATHLO Performance. Les données personnelles des coachs sont cryptées et invisibles pour la direction.
        </p>
      </footer>
    </div>
  );
};

export default ResponsableCoachs;
