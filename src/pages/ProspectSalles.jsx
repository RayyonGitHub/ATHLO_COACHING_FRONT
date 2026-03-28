import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProspectSalles = () => {
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);

  const chargerSallesProches = async (location) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/prospects/salles/?lat=${location.lat}&lng=${location.lng}&rayon=10`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des salles');
      }

      const data = await response.json();

      setSalles(data);
      setLoading(false);
      setLocationLoading(false);
    } catch (error) {
      console.error('Erreur chargement salles :', error);
      setLocationError("Impossible de charger les salles.");
      setLoading(false);
      setLocationLoading(false);
    }
  };
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
        setLocationError(null);
        chargerSallesProches(location);
      },
      (error) => {
        console.error('Erreur géolocalisation :', error);
        setLocationError("Impossible d'obtenir votre position. Vérifiez les permissions.");
        setLocationLoading(false);
      }
    );
  }, []);

  const formatDistance = (km) => {
    if (km == null) return 'Distance inconnue';
    if (km < 1) return `${Math.round(km * 1000)} m`;
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
              ? '📍 Salles trouvées autour de votre position'
              : '📍 Activez la localisation pour voir les salles proches'}
          </p>
        </div>
      </header>

      <div className="p-6 lg:p-8 space-y-8">
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#FF6B00]/20 to-[#FF9E00]/20 text-[#FF6B00] flex items-center justify-center">
              <span className="material-icons-round text-3xl">location_on</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Découvrez les salles autour de vous
              </h2>
              <p className="text-gray-400">
                {userLocation
                  ? `${salles.length} salle(s) trouvée(s) près de vous`
                  : 'Votre position permet de trier les salles par proximité'}
              </p>
            </div>
          </div>
        </section>

        {locationLoading && (
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mb-4"></div>
            <p className="text-white">Récupération de votre position...</p>
          </div>
        )}

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
                <p className="text-gray-500 text-sm mt-2">
                  Aucune salle n’a été trouvée dans le rayon demandé.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {salles.map((salle) => (
                  <div
                    key={salle.id}
                    className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] overflow-hidden hover:border-[#FF6B00]/40 transition-all"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-white text-xl">{salle.nom}</h3>
                          <p className="text-gray-500 text-sm mt-1">{salle.ville}</p>
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                          {formatDistance(salle.distance_km)}
                        </span>
                      </div>

                      <div className="bg-[#181818] rounded-2xl p-4 mb-5 border border-[#2D2D2D]">
                        <p className="text-sm text-gray-400">Adresse</p>
                        <p className="text-gray-200 mt-1">{salle.adresse}</p>
                      </div>

                      <button
                        onClick={() =>
                          navigate('/prospect/dashboard', {
                            state: { salleFiltree: salle.nom, villeFiltree: salle.ville },
                          })
                        }
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-semibold hover:shadow-lg transition-all"
                      >
                        Explorer les coachs
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