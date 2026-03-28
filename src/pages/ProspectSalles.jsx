import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProspectSalles = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simuler des salles (remplacer par appel API)
  const sallesMock = [
    {
      id: 1,
      nom: 'Fitness Park Châtelet',
      adresse: '15 Rue Saint-Denis, 75001 Paris',
      distance: 0.8,
      note: 4.5,
      avis: 234,
      horaires: '06:00 - 23:00',
      prix_abonnement: 29.99,
      coachs: 12
    },
    {
      id: 2,
      nom: 'Basic-Fit République',
      adresse: '23 Boulevard du Temple, 75003 Paris',
      distance: 1.2,
      note: 4.2,
      avis: 567,
      horaires: '06:00 - 22:00',
      prix_abonnement: 24.99,
      coachs: 8
    },
    {
      id: 3,
      nom: 'L\'Appart Fitness',
      adresse: '8 Rue de la Paix, 75002 Paris',
      distance: 1.5,
      note: 4.8,
      avis: 89,
      horaires: '07:00 - 22:00',
      prix_abonnement: 49.99,
      coachs: 5
    },
    {
      id: 4,
      nom: 'Neoness Montparnasse',
      adresse: '10 Rue de l\'Arrivée, 75014 Paris',
      distance: 2.3,
      note: 4.3,
      avis: 412,
      horaires: '06:00 - 23:00',
      prix_abonnement: 34.99,
      coachs: 15
    }
  ];

  // Récupérer la position et charger les salles
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        chargerSallesProches(location);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        setLocationError("Impossible d'obtenir votre position. Vérifiez les permissions.");
        setLocationLoading(false);
      }
    );
  }, []);

  // Charger les salles proches
  const chargerSallesProches = async (location) => {
    setLoading(true);
    
    try {
      // TODO: Appel API réel
      // const response = await fetch(
      //   `http://127.0.0.1:8000/api/salles/proches/?lat=${location.lat}&lng=${location.lng}&rayon=10`
      // );
      // const data = await response.json();
      // setSalles(data);
      
      // Simulation
      setTimeout(() => {
        setSalles(sallesMock.sort((a, b) => a.distance - b.distance));
        setLoading(false);
        setLocationLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erreur:', error);
      setLocationError("Impossible de charger les salles.");
      setLoading(false);
      setLocationLoading(false);
    }
  };

  // Formater la distance
  const formatDistance = (km) => {
    if (km < 1) return `${(km * 1000).toFixed(0)} m`;
    return `${km.toFixed(1)} km`;
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md px-8 py-6 border-b border-[#2D2D2D]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Salles de sport{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">
              proches
            </span>
          </h1>
          <p className="text-gray-400 mt-1">
            {userLocation 
              ? "📍 Salles dans un rayon de 10 km"
              : "📍 Activez la localisation pour voir les salles autour de vous"}
          </p>
        </div>
      </header>
      
      <div className="p-6 lg:p-8 space-y-8">
        {/* Section intro */}
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#FF6B00]/20 to-[#FF9E00]/20 text-[#FF6B00] flex items-center justify-center">
              <span className="material-icons-round text-3xl">location_on</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Découvrez les salles autour de vous</h2>
              <p className="text-gray-400">
                {userLocation 
                  ? `${salles.length} salle(s) trouvée(s) dans votre zone`
                  : "Activez votre position pour voir les salles les plus proches"}
              </p>
            </div>
          </div>
        </section>
        
        {/* Chargement */}
        {locationLoading && (
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mb-4"></div>
            <p className="text-white">Récupération de votre position...</p>
          </div>
        )}
        
        {/* Erreur */}
        {locationError && !locationLoading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center">
            <span className="material-icons-round text-4xl text-red-400 mb-3">location_off</span>
            <p className="text-red-300 font-medium">{locationError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
            >
              Réessayer
            </button>
          </div>
        )}
        
        {/* Liste des salles */}
        {!locationLoading && !locationError && (
          <>
            {loading ? (
              <div className="bg-[#1E1E1E] rounded-3xl p-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mb-4"></div>
                <p className="text-white">Chargement des salles...</p>
              </div>
            ) : salles.length === 0 ? (
              <div className="bg-[#1E1E1E] rounded-3xl p-10 text-center">
                <span className="material-icons-round text-6xl text-gray-600 mb-3">search_off</span>
                <p className="text-white font-medium">Aucune salle trouvée</p>
                <p className="text-gray-500 text-sm mt-2">Aucune salle dans un rayon de 10 km</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {salles.map((salle) => (
                  <div
                    key={salle.id}
                    className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] overflow-hidden hover:border-[#FF6B00]/40 transition-all"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-white text-xl">{salle.nom}</h3>
                          <p className="text-gray-400 text-sm mt-1">{salle.adresse}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <span className="material-icons-round text-[#FF6B00] text-sm">star</span>
                              <span className="text-white">{salle.note}</span>
                              <span className="text-gray-500 text-xs">({salle.avis} avis)</span>
                            </div>
                            <span className="text-gray-500">•</span>
                            <div className="flex items-center gap-1">
                              <span className="material-icons-round text-[#FF6B00] text-sm">directions_walk</span>
                              <span className="text-white">{formatDistance(salle.distance)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{salle.prix_abonnement}€</p>
                          <p className="text-gray-500 text-xs">/mois</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-[#181818] rounded-xl p-3 text-center">
                          <span className="material-icons-round text-[#FF6B00] text-sm">schedule</span>
                          <p className="text-white text-sm mt-1">{salle.horaires}</p>
                          <p className="text-gray-500 text-xs">Horaires</p>
                        </div>
                        <div className="bg-[#181818] rounded-xl p-3 text-center">
                          <span className="material-icons-round text-[#FF6B00] text-sm">people</span>
                          <p className="text-white text-xl font-bold">{salle.coachs}</p>
                          <p className="text-gray-500 text-xs">Coachs</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate('/prospect/dashboard', { state: { salleFiltre: salle.nom } })}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-semibold hover:shadow-lg transition-all"
                      >
                        Voir les coachs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ProspectSalles;