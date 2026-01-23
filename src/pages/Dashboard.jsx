import { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">Erreur : {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard - Liste des Clients</h1>
      {clients.length === 0 ? (
        <p>Aucun client trouvé</p>
      ) : (
        <ul className="space-y-2">
          {clients.map((client) => (
            <li key={client.id} className="border p-2 rounded">
              {client.nom} - {client.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;