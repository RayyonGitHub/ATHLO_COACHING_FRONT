import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { CreditCard, Download, Search, Filter, ExternalLink } from 'lucide-react';

const AdminFinance = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      const res = await adminAPI.getFinanceHistory();
      setTransactions(res.data);
    } catch (error) {
      console.error("Erreur finance", error);
    } finally {
      setLoading(false);
    }
  };

  // Sécurisation du filtre de recherche (pour éviter les erreurs nulles)
  const filteredTransactions = transactions.filter(t => {
    const matchClient = t.client_name ? t.client_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchOrder = t.order_number ? t.order_number.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return matchClient || matchOrder;
  });

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Trésorerie & Flux</h1>
          <p className="text-slate-500">Historique des transactions et facturation légale.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une transaction..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-lg text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#26262B]">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Commande</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Client</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Date</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Montant TTC</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-center">Statut</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right">Facture</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#26262B]">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chargement des transactions...</td></tr>
            ) : filteredTransactions.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">Aucune transaction trouvée.</td></tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-500">
                      {/* CORRECTION ICI : on vérifie que order_number existe */}
                      #{t.order_number ? t.order_number.substring(0, 8) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold dark:text-white">{t.client_name}</p>
                    <p className="text-[10px] text-slate-400">{t.offre || "Non défini"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black dark:text-white">{t.montant} €</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      t.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {t.has_invoice && t.invoice_url ? (
                      <a 
                        href={`http://localhost:8000${t.invoice_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#FF6A00] hover:underline text-xs font-bold"
                      >
                        <Download size={14} /> PDF
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[10px]">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFinance;