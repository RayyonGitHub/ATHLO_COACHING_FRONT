import { useEffect, useState } from 'react';

const ClientList = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 3;

  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', date_naissance: '', telephone: '',
    poids: '', taille: '', objectifs_sportifs: '', pathologies_blessures: '',
    consentement_rgpd: false, tags: '', est_archive: false
  });
  const [successMessage, setSuccessMessage] = useState(false);

  const API_URL = 'http://127.0.0.1:8000/api/clients/';

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = () => {
    fetch(API_URL).then(res => res.json()).then(data => setClients(data));
  };

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase().trim();
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const reverseFullName = `${client.nom} ${client.prenom}`.toLowerCase();

    return (
      fullName.includes(search) ||
      reverseFullName.includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.telephone.includes(search)
    );
  });

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const validateForm = () => {
    let newErrors: any = {};
    const alphaRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;
    const today = new Date().toISOString().split('T')[0];

    if (!formData.prenom || !alphaRegex.test(formData.prenom)) newErrors.prenom = "Prénom invalide";
    if (!formData.nom || !alphaRegex.test(formData.nom)) newErrors.nom = "Nom invalide";
    if (!emailRegex.test(formData.email)) newErrors.email = "Email invalide";
    if (!phoneRegex.test(formData.telephone)) newErrors.telephone = "10 chiffres commençant par 0";
    if (Number(formData.poids) <= 0) newErrors.poids = "Doit être positif";
    if (Number(formData.taille) <= 0) newErrors.taille = "Doit être positif";
    if (!formData.date_naissance) newErrors.date_naissance = "La date est obligatoire";
    else if (formData.date_naissance > today) newErrors.date_naissance = "La date ne peut pas être dans le futur";
    if (!formData.objectifs_sportifs || formData.objectifs_sportifs.trim().length < 5) {
      newErrors.objectifs_sportifs = "Les objectifs sont obligatoires (min. 5 caractères)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const finalData = { ...formData, pathologies_blessures: formData.pathologies_blessures || "Aucune", tags: formData.tags || "Standard" };
    const method = editingClient ? 'PUT' : 'POST';
    const url = editingClient ? `${API_URL}${editingClient.id}/` : API_URL;
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalData) });
      if (response.ok) {
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
        closeModal();
        fetchClients();
      }
    } catch (error) { console.error(error); }
  };

  const openDeleteModal = (client: any) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      await fetch(`${API_URL}${clientToDelete.id}/`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      fetchClients();
    }
  };

  const openModal = (client: any = null) => {
    if (client) { setEditingClient(client); setFormData(client); }
    else {
      setEditingClient(null);
      setFormData({ nom: '', prenom: '', email: '', date_naissance: '', telephone: '', poids: '', taille: '', objectifs_sportifs: '', pathologies_blessures: '', consentement_rgpd: false, tags: 'Standard', est_archive: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingClient(null); setErrors({}); };

  const totalClients = clients.length;
  const poidsMoyen = totalClients > 0 ? (clients.reduce((acc, c) => acc + Number(c.poids || 0), 0) / totalClients).toFixed(1) : 0;
  const rgpdRate = totalClients > 0 ? Math.round((clients.filter(c => c.consentement_rgpd).length / totalClients) * 100) : 0;

  return (
    <div className="h-screen w-full flex flex-col animate-in fade-in duration-700 overflow-hidden bg-gray-50">
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      .font-sans { font-family: 'Inter', sans-serif !important; }
      .custom-scroll::-webkit-scrollbar { width: 6px; }
      .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      .custom-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
    `}</style>

      {/* NOTIFICATION */}
      <div className={`fixed bottom-10 right-5 z-[250] transform transition-all duration-500 ${successMessage ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="flex items-start sm:items-center p-4 text-sm text-green-800 rounded-2xl bg-green-50 border border-green-200 shadow-2xl" role="alert">
          <svg className="w-5 h-5 me-3 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          <div><span className="font-medium">L'opération a été enregistrée avec succès</span></div>
        </div>
      </div>

      {/* ZONE FIXE : TITRE ET DASHBOARD (shrink-0 empêche ce bloc de se réduire) */}
      <div className="px-8 pt-2 pb-4 shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">Gestion des Clients</h1>
            <button onClick={() => openModal()} className="bg-orange-500 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg transition-all active:scale-95">+ Ajouter un client</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-indigo-900 flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg mr-4 text-indigo-900"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg></div>
              <div><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Inscrits</p><p className="text-3xl font-black">{totalClients}</p></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-green-500 flex items-center">
              <div className="p-3 bg-green-50 rounded-lg mr-4 text-green-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg></div>
              <div><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Moyenne Poids</p><p className="text-3xl font-black">{poidsMoyen} kg</p></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-orange-500 flex items-center">
              <div className="p-3 bg-orange-50 rounded-lg mr-4 text-orange-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg></div>
              <div><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Santé RGPD</p><p className="text-3xl font-black">{rgpdRate}%</p></div>
            </div>
          </div>

          {/* BARRE DE RECHERCHE */}
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un client (Nom, Email, Téléphone...)"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-900 focus:border-indigo-900 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* [MODIFICATION] :  */}
      <div className="max-w-6xl w-full mx-auto px-8 flex-1 min-h-0 flex flex-col mb-4">
        {filteredClients.length > 0 ? (
          <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 custom-scroll">
              <table className="w-full min-w-full border-separate border-spacing-0">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4 text-left bg-gray-50 border-b border-gray-100">Client / Contact</th>
                    <th className="px-6 py-4 text-left bg-gray-50 border-b border-gray-100">Infos Perso</th>
                    <th className="px-6 py-4 text-left bg-gray-50 border-b border-gray-100">Sport & Santé</th>
                    <th className="px-6 py-4 text-left bg-gray-50 border-b border-gray-100">Statut</th>
                    <th className="px-6 py-4 text-right bg-gray-50 border-b border-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {currentClients.map((client) => (
                    <tr key={client.id} className={`hover:bg-blue-50/30 transition-all ${client.est_archive ? 'opacity-50 grayscale bg-gray-50' : ''}`}>
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 text-sm">{client.prenom} {client.nom}</div>
                        <div className="text-xs text-indigo-900 font-medium">{client.email}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{client.telephone}</div>
                      </td>
                      <td className="px-6 py-5 text-xs text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2 text-gray-400 font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                          <span>{client.date_naissance}</span>
                        </div>
                        <div className="text-sm font-bold text-gray-800">{client.poids}kg / {client.taille}cm</div>
                      </td>
                      <td className="px-6 py-5 text-[11px] font-bold space-y-1 uppercase tracking-tight">
                        <div className="text-gray-700 truncate max-w-[180px]">Objectif: {client.objectifs_sportifs}</div>
                        <div className="text-orange-500 truncate max-w-[180px]">Pathologie: {client.pathologies_blessures || "Néant"}</div>
                        <div className="text-indigo-900 tracking-tighter">Tag: {client.tags}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${client.consentement_rgpd ? 'text-green-600' : 'text-orange-500'}`}>{client.consentement_rgpd ? '● Conforme' : '○ En attente'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => openModal(client)} className="p-2 text-indigo-900 hover:bg-blue-50 rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                          <button onClick={() => openDeleteModal(client)} className="p-2 text-orange-600 hover:bg-red-50 rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Ce qui s'affiche si la liste est vide*/
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-inner">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>

            </div>
            <p className="text-gray-400 font-bold text-center">
              Aucun sportif ne correspond à <span className="text-indigo-900">"{searchTerm}"</span>
            </p>    </div>
        )}

        {/* ZONE PAGINATION  */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center py-4 space-x-2 shrink-0">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors">Précédent</button>
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>{i + 1}</button>
              ))}
            </div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors">Suivant</button>
          </div>
        )}
      </div>

      {/* MODALE FORMULAIRE */}
      <div
        className={`fixed inset-0 z-[110] flex items-center justify-center p-6 transition-all duration-300 ease-out ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
      >
        <div
          className={`absolute inset-0 bg-gray-950/40 backdrop-blur-sm transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={closeModal}
        ></div>

        <div
          className={`relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl p-10 overflow-hidden transform transition-all duration-300 ease-out ${isModalOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
            }`}
        >
          <h2 className="text-3xl font-black text-orange-500 mb-8">{editingClient ? 'Modifier le profil' : 'Nouveau sportif'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input placeholder="Prénom" className={`border-2 p-3.5 rounded-2xl w-full outline-none transition-all ${errors.prenom ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-indigo-900'}`} value={formData.prenom} onChange={e => { setFormData({ ...formData, prenom: e.target.value }); setErrors({ ...errors, prenom: null }) }} />
                    {errors.prenom && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.prenom}</p>}
                  </div>
                  <div>
                    <input placeholder="Nom" className={`border-2 p-3.5 rounded-2xl w-full outline-none transition-all ${errors.nom ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-indigo-900'}`} value={formData.nom} onChange={e => { setFormData({ ...formData, nom: e.target.value }); setErrors({ ...errors, nom: null }) }} />
                    {errors.nom && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.nom}</p>}
                  </div>
                </div>
                <div className="flex flex-col">
                  <input
                    type="email"
                    placeholder="Email"
                    className={`border-2 p-3.5 rounded-2xl w-full outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-indigo-900'}`}
                    value={formData.email}
                    onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: null }) }}
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><input placeholder="Tél" className={`border-2 p-3.5 rounded-2xl w-full outline-none ${errors.telephone ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} value={formData.telephone} onChange={e => { setFormData({ ...formData, telephone: e.target.value }); setErrors({ ...errors, telephone: null }) }} />{errors.telephone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.telephone}</p>}</div>
                  <div>
                    <input
                      type="date"
                      className={`border-2 p-3.5 rounded-2xl w-full outline-none ${errors.date_naissance ? 'border-red-500 bg-red-50' : 'border-gray-100 text-gray-500 focus:border-indigo-900'}`}
                      value={formData.date_naissance}
                      onChange={e => { setFormData({ ...formData, date_naissance: e.target.value }); setErrors({ ...errors, date_naissance: null }) }}
                    />
                    {errors.date_naissance && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.date_naissance}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><input type="number" placeholder="Poids" className={`border-2 p-3.5 rounded-2xl w-full outline-none ${errors.poids ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} value={formData.poids} onChange={e => { setFormData({ ...formData, poids: e.target.value }); setErrors({ ...errors, poids: null }) }} />{errors.poids && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.poids}</p>}</div>
                  <div><input type="number" placeholder="Taille" className={`border-2 p-3.5 rounded-2xl w-full outline-none ${errors.taille ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} value={formData.taille} onChange={e => { setFormData({ ...formData, taille: e.target.value }); setErrors({ ...errors, taille: null }) }} />{errors.taille && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.taille}</p>}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <textarea
                    placeholder="Objectifs sportifs..."
                    className={`border-2 p-3.5 rounded-2xl w-full h-24 resize-none outline-none ${errors.objectifs_sportifs ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-indigo-900'}`}
                    value={formData.objectifs_sportifs}
                    onChange={e => { setFormData({ ...formData, objectifs_sportifs: e.target.value }); setErrors({ ...errors, objectifs_sportifs: null }) }}
                  />
                  {errors.objectifs_sportifs && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.objectifs_sportifs}</p>}
                </div>
                <textarea placeholder="Pathologies" className="border-2 border-gray-100 p-3.5 rounded-2xl w-full h-24 resize-none outline-none" value={formData.pathologies_blessures} onChange={e => setFormData({ ...formData, pathologies_blessures: e.target.value })} />
                <input placeholder="Tags" className="border-2 border-gray-100 p-3.5 rounded-2xl w-full outline-none" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={formData.consentement_rgpd} onChange={e => setFormData({ ...formData, consentement_rgpd: e.target.checked })} className="w-5 h-5 accent-green-600" /><span className="text-xs font-bold text-gray-500 uppercase">RGPD</span></label>
                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={formData.est_archive} onChange={e => setFormData({ ...formData, est_archive: e.target.checked })} className="w-5 h-5 accent-red-600" /><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Archiver</span></label>
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={closeModal} className="text-sm font-bold text-gray-400">Annuler</button>
                <button type="submit" className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-orange-700 transition-all transform hover:-translate-y-1">Enregistrer</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* MODALE SUPPRESSION */}
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-0 transition-all duration-300 ease-out ${isDeleteModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
      >
        {/* Overlay (Fond gris flouté) */}
        <div
          className={`fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity duration-300 ${isDeleteModalOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setIsDeleteModalOpen(false)}
        ></div>

        {/* Boîte de dialogue */}
        <div
          className={`relative transform transition-all duration-300 ease-out bg-white rounded-2xl text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-lg ${isDeleteModalOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
            }`}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-center">
              {/* ICONE */}
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 text-red-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>

              {/* TEXTE */}
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-900 leading-6">Supprimer le client</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Supprimer définitivement <span className="text-red-600 font-bold">{clientToDelete?.prenom} {clientToDelete?.nom}</span> ?
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-2xl">
            <button
              onClick={confirmDelete}
              className="inline-flex w-full justify-center rounded-xl bg-red-600 px-6 py-2.5 text-sm font-black text-white hover:bg-red-500 sm:ml-3 sm:w-auto transition-all active:scale-95"
            >
              SUPPRIMER
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all"
            >
              ANNULER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientList;