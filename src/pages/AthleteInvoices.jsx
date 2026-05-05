import React, { useState, useEffect } from 'react';
import { FileText, Download, CreditCard, Calendar, CheckCircle } from 'lucide-react';
import prospectService from '../services/prospectService';

const AthleteInvoices = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await prospectService.getCommandeHistory();
                setCommandes(data);
            } catch (err) {
                console.error("Erreur chargement factures:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    if (loading) return <div className="p-10 text-center text-white">Chargement...</div>;
    const forceDownload = async (e, fileUrl) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Facture_Athlo.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Erreur de téléchargement", error);
            window.open(fileUrl, '_blank');
        }
    };
    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    Mes <span className="text-[#FF6B00]">Factures</span>
                </h2>
                <p className="text-gray-400 mt-1">Consultez l'historique de vos achats et téléchargez vos justificatifs.</p>
            </div>

            <div className="grid gap-4">
                {commandes.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-[#2D2D2D] rounded-3xl text-center text-gray-500">
                        Aucun achat enregistré pour le moment.
                    </div>
                ) : (
                    commandes.map((cmd) => (
                        <div key={cmd.id} className="bg-[#1E1E1E] border border-[#2D2D2D] p-6 rounded-2xl flex items-center justify-between hover:border-[#FF6B00]/50 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-[#FF6B00] flex items-center justify-center">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{cmd.offre_label}</h4>
                                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(cmd.date_commande).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 font-bold text-white">{cmd.montant_ttc} €</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20">
                                    {cmd.status === 'PAID' ? 'Payée' : cmd.status}
                                </span>
                                {cmd.facture && cmd.facture.pdf_file && (
                                       <a 
                                            href={`http://127.0.0.1:8000${cmd.facture.pdf_file}`} 
                                            onClick={(e) => forceDownload(e, `http://127.0.0.1:8000${cmd.facture.pdf_file}`)}
                                            className="p-2.5 bg-[#2D2D2D] text-white rounded-xl hover:bg-[#FF6B00] transition-colors cursor-pointer flex items-center justify-center"
                                            title="Télécharger"
                                        >
                                            <Download size={18} />
                                        </a>
                                    )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AthleteInvoices;