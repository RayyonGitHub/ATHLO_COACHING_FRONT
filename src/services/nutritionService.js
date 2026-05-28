// src/services/nutritionService.js

const API_URL = "http://localhost:8000/api/nutrition";

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('authToken'); 
  
  const headers = {
    'Authorization': token ? `Bearer ${token}` : ''
  };

  // IMPORTANT : Si on envoie du FormData, le navigateur doit définir lui-même 
  // le Content-Type avec le "boundary". On ne le définit donc pas manuellement.
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const nutritionService = {
  getRecipes: async () => {
    try {
      const response = await fetch(`${API_URL}/recipes/`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
getAthletePlans: async () => {
    try {
      // On utilise simplement l'URL standard des plans
      const response = await fetch(`${API_URL}/plans/`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error("Erreur lors de la récupération des plans athlète");
      return await response.json();
      
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  saveRecipe: async (recipeData) => {
    try {
      const response = await fetch(`${API_URL}/recipes/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(recipeData)
      });
      
      if (response.status === 401) {
        throw new Error("Session expirée. Reconnectez-vous.");
      }

      if (!response.ok) throw new Error("Erreur lors de la création");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateRecipe: async (id, recipeData) => {
    const response = await fetch(`${API_URL}/recipes/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(recipeData)
    });
    if (!response.ok) throw new Error("Erreur lors de la modification");
    return await response.json();
  },

  deleteRecipe: async (id) => {
    const response = await fetch(`${API_URL}/recipes/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Erreur lors de la suppression");
  },

  getPlans: async () => {
    try {
      const response = await fetch(`${API_URL}/plans/`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des plans");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  savePlan: async (planData) => {
    try {
      // CHANGEMENT ICI : Utilisation de FormData pour supporter l'image
      const formData = new FormData();
      
      // On boucle sur les clés pour remplir le FormData
      Object.keys(planData).forEach(key => {
        if (key === 'recettes' && Array.isArray(planData.recettes)) {
          // Pour les listes (ManyToMany), Django attend plusieurs entrées pour la même clé
          planData.recettes.forEach(id => formData.append('recettes', id));
        } else if (planData[key] !== null && planData[key] !== undefined) {
          formData.append(key, planData[key]);
        }
      });

      const response = await fetch(`${API_URL}/plans/`, {
        method: 'POST',
        headers: getHeaders(true), // true indique qu'on utilise FormData (pas de JSON headers)
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Détails erreur Django:", errorData);
        throw new Error("Erreur lors de la création du plan");
      }
      
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updatePlan: async (id, planData) => {
    const formData = new FormData();
    Object.keys(planData).forEach(key => {
      if (key === 'recettes' && Array.isArray(planData.recettes)) {
        planData.recettes.forEach(id => formData.append('recettes', id));
      } else if (planData[key] !== null && planData[key] !== undefined) {
        formData.append(key, planData[key]);
      }
    });

    const response = await fetch(`${API_URL}/plans/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: formData
    });
    if (!response.ok) throw new Error("Erreur lors de la modification du plan");
    return await response.json();
  },

  deletePlan: async (id) => {
    const response = await fetch(`${API_URL}/plans/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Erreur lors de la suppression du plan");
  }
};

export default nutritionService;
