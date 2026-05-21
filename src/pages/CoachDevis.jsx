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
  if (status === 'accepte') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'refuse') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
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
      const res = await api.post(`/coach/devis/${devisId}/traiter/`, { action });
      const newStatus = res?.data?.devis_statut;
      setDevis((prev) => prev.map((d) => (d.id === devisId ? { ...d, statut: newStatus } : d)));
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
              notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-8 py-6 border-b border-gray-200">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Devis <span className="text-orange-500">reçus</span>
        </h1>
        <p className="text-gray-600 mt-1">Approuvez ou refusez les demandes personnalisées des prospects.</p>
      </header>

      <div className="p-6 lg:p-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Total devis</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{devis.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">En attente</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <button
              onClick={fetchDevis}
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-2.5 font-semibold transition"
            >
              Rafraîchir
            </button>
          </div>
        </section>

        {loading && <div className="text-gray-600">Chargement des devis...</div>}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">{error}</div>
        )}

        {!loading && !error && devis.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-600 shadow-sm">
            Aucune demande de devis pour le moment.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {devis.map((item) => (
            <article key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.prenom} {item.nom}</h3>
                  <p className="text-sm text-gray-500 mt-1">Reçu le {formatDate(item.date_creation)}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${statusClass(item.statut)}`}>
                  {statusLabel(item.statut)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-gray-500">Email</p>
                  <p className="text-gray-900 break-all">{item.email || '-'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-gray-500">Téléphone</p>
                  <p className="text-gray-900">{item.telephone || '-'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-gray-500">Objectif</p>
                  <p className="text-gray-900">{item.objectif_sportif || '-'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-gray-500">Budget</p>
                  <p className="text-gray-900">{item.budget || '-'}</p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-gray-500 text-sm">Pathologies / blessures</p>
                <p className="text-gray-900 text-sm mt-1 whitespace-pre-wrap">{item.pathologies_blessures || 'Aucune information.'}</p>
              </div>

              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-gray-500 text-sm">Message prospect</p>
                <p className="text-gray-900 text-sm mt-1 whitespace-pre-wrap">{item.message || 'Aucun message.'}</p>
              </div>

              {item.statut === 'en_attente' && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => traiterDevis(item.id, 'accepter')}
                    disabled={processingId === item.id}
                    className="rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-2.5 font-semibold transition"
                  >
                    {processingId === item.id ? 'Traitement...' : 'Accepter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => traiterDevis(item.id, 'refuser')}
                    disabled={processingId === item.id}
                    className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white py-2.5 font-semibold transition"
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
