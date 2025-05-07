import React, { useState, useEffect } from 'react';
import { Car, Plus, Edit, Trash2, Search } from 'lucide-react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, Vehicle } from '../lib/vehicles';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    model: '',
    year: new Date().getFullYear(),
    registration: '',
    type: 'Manuelle' as const,
    fuel: 'Essence' as const,
    image: '',
  });
  
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const openAddModal = () => {
    setCurrentVehicle(null);
    setFormData({
      model: '',
      year: new Date().getFullYear(),
      registration: '',
      type: 'Manuelle',
      fuel: 'Essence',
      image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    });
    setIsModalOpen(true);
  };
  
  const openEditModal = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData({
      model: vehicle.model,
      year: vehicle.year,
      registration: vehicle.registration,
      type: vehicle.type,
      fuel: vehicle.fuel,
      image: vehicle.image || '',
    });
    setIsModalOpen(true);
  };

  const checkRegistrationExists = async (registration: string, excludeId?: string) => {
    const query = supabase
      .from('vehicule')
      .select('id')
      .eq('registration', registration);

    if (excludeId) {
      query.neq('id', excludeId);
    }

    const { data, error } = await query.single();
    
    return !!data;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check if registration exists (excluding current vehicle when editing)
      const registrationExists = await checkRegistrationExists(
        formData.registration,
        currentVehicle?.id
      );

      if (registrationExists) {
        toast.error('Ce numéro d\'immatriculation existe déjà');
        return;
      }

      if (currentVehicle) {
        await updateVehicle(currentVehicle.id, {
          ...formData,
          status: currentVehicle.status
        });
        toast.success('Véhicule mis à jour avec succès');
      } else {
        await createVehicle({
          ...formData,
          status: 'available'
        });
        toast.success('Véhicule ajouté avec succès');
      }
      
      loadVehicles();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(currentVehicle ? 
        'Erreur lors de la mise à jour du véhicule' : 
        'Erreur lors de l\'ajout du véhicule'
      );
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        await deleteVehicle(id);
        toast.success('Véhicule supprimé avec succès');
        loadVehicles();
      } catch (error) {
        toast.error('Erreur lors de la suppression du véhicule');
      }
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Disponible</span>;
      case 'reserved':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Réservé</span>;
      case 'maintenance':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">Maintenance</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">Inconnu</span>;
    }
  };
  
  // Filter and search vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vehicle.registration.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Véhicules</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un véhicule..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48">
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="reserved">Réservé</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        
        <button
          className="btn-primary flex items-center justify-center gap-2"
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Ajouter</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-card">
            <img 
              src={vehicle.image || 'https://via.placeholder.com/400x300'} 
              alt={vehicle.model} 
              className="vehicle-image" 
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{vehicle.model}</h3>
                <div>
                  {getStatusBadge(vehicle.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                <div className="text-xs">
                  <span className="font-medium block">Immatriculation</span>
                  <span className="text-gray-600">{vehicle.registration}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium block">Année</span>
                  <span className="text-gray-600">{vehicle.year}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium block">Carburant</span>
                  <span className="text-gray-600">{vehicle.fuel}</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium block">Boîte</span>
                  <span className="text-gray-600">{vehicle.type}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => openEditModal(vehicle)}
                >
                  <Edit size={18} />
                </button>
                <button 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => handleDelete(vehicle.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add/Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {currentVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    className="input-field"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Année
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      className="input-field"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-1">
                      Immatriculation
                    </label>
                    <input
                      type="text"
                      id="registration"
                      name="registration"
                      className="input-field"
                      value={formData.registration}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type de boîte
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="input-field"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="Manuelle">Manuelle</option>
                      <option value="Automatique">Automatique</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1">
                      Carburant
                    </label>
                    <select
                      id="fuel"
                      name="fuel"
                      className="input-field"
                      value={formData.fuel}
                      onChange={handleInputChange}
                    >
                      <option value="Essence">Essence</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Électrique">Électrique</option>
                      <option value="Hybride">Hybride</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image
                  </label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    className="input-field"
                    value={formData.image}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {currentVehicle ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state for no results */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Aucun véhicule trouvé</h3>
          <p className="text-gray-500">Aucun véhicule ne correspond à vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;