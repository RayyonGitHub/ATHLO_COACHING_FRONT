import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProspectSalles = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [sallesProches, setSallesProches] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setSallesProches([
          {
            id: 1,
            nom: 'Fitness Park',
            distance: '1.2 km',
            adresse: 'Centre Commercial',
            ville: 'Paris',
          },
          {
            id: 2,
            nom: 'Basic-Fit',
            distance: '2.5 km',
            adresse: 'Rue de la République',
            ville: 'Paris',
          },
          {
            id: 3,
            nom: "L'Appart Fitness",
            distance: '3.0 km',
            adresse: 'Avenue Jean Jaurès',
            ville: 'Paris',
          },
        ]);
      },
      () => {
        setLocationError("Impossible d'obtenir votre position.");
      }
    );
  }, []);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md px-8 py-6 border-b border-[#2D2D2D]">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Salles de sport{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">
            proches
          </span>
        </h1>
        <p className="text-gray-400 mt-1">
          Découvrez rapidement les salles autour de vous
        </p>
      </header>

      <div className="p-6 lg:p-8 space-y-8">
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B00]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#FF6B00]/20 to-[#FF9E00]/20 text-[#FF6B00] flex items-center justify-center mb-5">
              <span className="material-icons-round text-3xl">location_on</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Repérer les salles accessibles autour de vous
            </h2>

            <p className="text-gray-400 leading-relaxed">
              Utilisez votre position actuelle pour découvrir les salles les plus proches
              et identifier rapidement les lieux où pratiquer.
            </p>
          </div>
        </section>

        {locationError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-4">
            {locationError}
          </div>
        )}

        {userLocation && (
          <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold mb-1">Position détectée</h2>
              <p className="text-sm text-gray-400">
                Latitude : {userLocation.lat.toFixed(4)} • Longitude :{' '}
                {userLocation.lng.toFixed(4)}
              </p>
            </div>

            <div className="bg-[#181818] border border-[#2D2D2D] rounded-2xl px-4 py-3 text-sm text-gray-300 inline-flex items-center gap-2">
              <span className="material-icons-round text-[#FF6B00] text-base">fitness_center</span>
              {sallesProches.length} salle{sallesProches.length > 1 ? 's' : ''} trouvée{sallesProches.length > 1 ? 's' : ''}
            </div>
          </section>
        )}

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Salles disponibles</h2>
            <p className="text-sm text-gray-400 mt-1">
              Une vue simple pour repérer les lieux proches rapidement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sallesProches.map((salle) => (
              <div
                key={salle.id}
                className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#2D2D2D] hover:border-[#FF6B00]/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{salle.nom}</h3>
                    <p className="text-gray-500 text-sm mt-1">{salle.ville}</p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                    {salle.distance}
                  </span>
                </div>

                <div className="bg-[#181818] border border-[#2D2D2D] rounded-2xl p-4 mb-5">
                  <p className="text-sm text-gray-400">Adresse</p>
                  <p className="text-gray-200 mt-1">{salle.adresse}</p>
                </div>

                <button
                  onClick={() => navigate('/prospect/dashboard')}
                  className="w-full py-3 rounded-xl border border-[#2D2D2D] text-gray-300 hover:bg-[#2D2D2D] transition-colors"
                >
                  Explorer les coachs
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default ProspectSalles;