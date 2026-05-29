import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const formatDate = (isoDate) => {
  if (!isoDate) return 'Date inconnue';
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? 'Date inconnue' : d.toLocaleString('fr-FR');
};

const statusLabel = (status) => {
  if (status === 'accepte') return 'Accepté';
  if (status === 'refuse') return 'Refusé';
  return 'En attente';
};

const statusClass = (status) => {
  if (status === 'accepte') return 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30';
  if (status === 'refuse') return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
  return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
};

const offerLabel = (type) => {
  if (type === 'pack') return 'Pack';
  if (type === 'abonnement') return 'Abonnement';
  return 'Séance individuelle';
};

const CoachDevis = () => {
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const pendingCount = useMemo(
    () => devis.filter((d) => d.statut === 'en_attente').length,
    [devis]
  );

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    window.setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const fetchDevis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/coach/devis/');
      setDevis(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Impossible de charger les devis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
  }, []);

  const traiterDevis = async (devisId, action) => {
    setProcessingId(devisId);
    try {
      const res = await api.post(`/coach/devis/${devisId}/traiter/`, {
        action,
      });
      const updatedDevis = res?.data?.devis;
      const newStatus = res?.data?.devis_statut;
      setDevis((prev) => prev.map((d) => (d.id === devisId ? { ...d, ...(updatedDevis || {}), statut: newStatus } : d)));
      showNotification('success', action === 'accepter' ? 'Devis accepté.' : 'Devis refusé.');
    } catch (e) {
      showNotification('error', e?.response?.data?.error || 'Erreur lors du traitement du devis.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      {notification.show && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`rounded-xl px-4 py-3 shadow-lg ${
              notification.type === 'success' ? 'bg-[#22C55E] text-white' : 'bg-[#EF4444] text-white'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 bg-[#0B0B0E]/80 backdrop-blur-md px-8 py-6 border-b border-[#2A2A32]">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#FCF8FE]">
          Devis <span className="text-[#FF6A00]">reçus</span>
        </h1>
        <p className="text-[#ACAAB0] mt-1">Approuvez ou refusez les demandes personnalisées des prospects.</p>
      </header>

      <div className="p-6 lg:p-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#131317] border border-[#2A2A32] rounded-2xl p-5 shadow-sm">
            <p className="text-[#ACAAB0] text-sm">Total devis</p>
            <p className="text-2xl font-bold text-[#FCF8FE] mt-1">{devis.length}</p>
          </div>
          <div className="bg-[#131317] border border-[#2A2A32] rounded-2xl p-5 shadow-sm">
            <p className="text-[#ACAAB0] text-sm">En attente</p>
            <p className="text-2xl font-bold text-[#F59E0B] mt-1">{pendingCount}</p>
          </div>
          <div className="bg-[#131317] border border-[#2A2A32] rounded-2xl p-5 shadow-sm">
            <button
              onClick={fetchDevis}
              className="w-full rounded-xl bg-[#FF6A00] hover:bg-[#e66000] text-white py-2.5 font-semibold transition"
            >
              Rafraîchir
            </button>
          </div>
        </section>

        {loading && <div className="text-[#ACAAB0]">Chargement des devis...</div>}
        {error && !loading && (
          <div className="bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] rounded-2xl p-4">{error}</div>
        )}

        {!loading && !error && devis.length === 0 && (
          <div className="bg-[#131317] border border-[#2A2A32] rounded-2xl p-6 text-[#ACAAB0] shadow-sm">
            Aucune demande de devis pour le moment.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {devis.map((item) => (
            <article key={item.id} className="bg-[#131317] border border-[#2A2A32] rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#FCF8FE]">{item.prenom} {item.nom}</h3>
                  <p className="text-sm text-[#ACAAB0] mt-1">Reçu le {formatDate(item.date_creation)}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${statusClass(item.statut)}`}>
                  {statusLabel(item.statut)}
                </span>
              </div>
              {item.prix_propose && (
                <div className="mt-4 rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/20 p-3 text-sm font-bold text-[#FF6A00]">
                  {offerLabel(item.offre_type)} • Prix proposé par le prospect : {Number(item.prix_propose).toFixed(2)} €
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-[#1F1F25] border border-[#2A2A32] rounded-xl p-3">
                  <p className="text-[#ACAAB0]">Type de devis</p>
                  <p className="text-[#FCF8FE]">{offerLabel(item.offre_type)}</p>
                </div>
                <div className="bg-[#1F1F25] border border-[#2A2A32] rounded-xl p-3">
                  <p className="text-[#ACAAB0]">Email</p>
                  <p className="text-[#FCF8FE] break-all">{item.email || '-'}</p>
                </div>
                <div className="bg-[#1F1F25] border border-[#2A2A32] rounded-xl p-3">
                  <p className="text-[#ACAAB0]">Téléphone</p>
                  <p className="text-[#FCF8FE]">{item.telephone || '-'}</p>
                </div>
                <div className="bg-[#1F1F25] border border-[#2A2A32] rounded-xl p-3">
                  <p className="text-[#ACAAB0]">Objectif</p>
                  <p className="text-[#FCF8FE]">{item.objectif_sportif || '-'}</p>
                </div>
                <div className="bg-[#1F1F25] border border-[#2A2A32] rounded-xl p-3">
                  <p className="text-[#ACAAB0]">Budget</p>
                  <p className="text-[#FCF8FE]">{item.budget || '-'}</p>
                </div>
              </div>

              <div className="mt-4 bg-[#1F1F25] border border-[#2A2A32] rounded-xl p-3">
                <p className="text-[#ACAAB0] text-sm">Pathologies / blessures</p>
                <p className="text-[#FCF8FE] text-sm mt-1 whitespace-pre-wrap">{item.pathologies_blessures || 'Aucune information.'}</p>
              </div>

              <div className="mt-4 bg-[#1F1F25] border border-[#2A2A32] rounded-xl p-3">
                <p className="text-[#ACAAB0] text-sm">Message prospect</p>
                <p className="text-[#FCF8FE] text-sm mt-1 whitespace-pre-wrap">{item.message || 'Aucun message.'}</p>
              </div>

              {item.statut === 'en_attente' && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => traiterDevis(item.id, 'accepter')}
                    disabled={processingId === item.id}
                    className="rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-70 text-white py-2.5 font-semibold transition"
                  >
                    {processingId === item.id ? 'Traitement...' : 'Accepter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => traiterDevis(item.id, 'refuser')}
                    disabled={processingId === item.id}
                    className="rounded-xl bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-70 text-white py-2.5 font-semibold transition"
                  >
                    {processingId === item.id ? 'Traitement...' : 'Refuser'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </>
  );
};

export default CoachDevis;
