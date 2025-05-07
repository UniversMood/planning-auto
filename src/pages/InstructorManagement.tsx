import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  Phone,
  Calendar,
} from 'lucide-react';
import {
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  Instructor,
} from '../lib/instructors';
import toast from 'react-hot-toast';

const InstructorManagement = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialty: '',
    years_experience: 0,
  });

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      const data = await getInstructors();
      setInstructors(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des moniteurs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const openAddModal = () => {
    setCurrentInstructor(null);
    setTemporaryPassword(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      specialty: '',
      years_experience: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (instructor: Instructor) => {
    setCurrentInstructor(instructor);
    setTemporaryPassword(null);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone || '',
      address: instructor.address || '',
      specialty: instructor.specialty || '',
      years_experience: instructor.years_experience || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const instructorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        specialty: formData.specialty || null,
        years_experience: Number(formData.years_experience) || 0,
      };

      if (currentInstructor) {
        await updateInstructor(currentInstructor.id, instructorData);
        toast.success('Moniteur mis à jour avec succès');
        setIsModalOpen(false);
      } else {
        const result = await createInstructor(instructorData);
        setTemporaryPassword(result.temporaryPassword);
        toast.success('Moniteur ajouté avec succès');
        // Don't close the modal yet to show the temporary password
      }

      loadInstructors();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          currentInstructor
            ? 'Erreur lors de la mise à jour du moniteur'
            : "Erreur lors de l'ajout du moniteur"
        );
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce moniteur ?')) {
      try {
        await deleteInstructor(id);
        toast.success('Moniteur supprimé avec succès');
        loadInstructors();
      } catch (error) {
        toast.error('Erreur lors de la suppression du moniteur');
      }
    }
  };

  // Filter instructors based on search term
  const filteredInstructors = instructors.filter((instructor) => {
    const matchesSearch =
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instructor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 transition-colors duration-200"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-200">
        Gestion des Moniteurs
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-gray-500 dark:text-gray-400 transition-colors duration-200"
            />
          </div>
          <input
            type="text"
            placeholder="Rechercher un moniteur..."
            className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-2 flex items-center justify-center gap-2 transition-colors duration-200"
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Ajouter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstructors.map((instructor) => (
          <div
            key={instructor.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold transition-colors duration-200">
                {instructor.name.charAt(0)}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg text-center text-gray-900 dark:text-white transition-colors duration-200">
                {instructor.name}
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300 text-sm mb-4 transition-colors duration-200">
                {instructor.specialty || 'Moniteur'}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                  <Calendar
                    size={16}
                    className="text-gray-500 dark:text-gray-400 mr-2 transition-colors duration-200"
                  />
                  <span>{instructor.years_experience} ans d'expérience</span>
                </div>
                {instructor.phone && (
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    <Phone
                      size={16}
                      className="text-gray-500 dark:text-gray-400 mr-2 transition-colors duration-200"
                    />
                    <span>{instructor.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-2 mt-4 pt-3 border-t dark:border-gray-700 transition-colors duration-200">
                <button
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                  onClick={() => openEditModal(instructor)}
                >
                  <Edit size={18} />
                </button>
                <button
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  onClick={() => handleDelete(instructor.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Instructor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-colors duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                {currentInstructor
                  ? 'Modifier le moniteur'
                  : 'Ajouter un moniteur'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                  >
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="years_experience"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Années d'expérience
                    </label>
                    <input
                      type="number"
                      id="years_experience"
                      name="years_experience"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      value={formData.years_experience}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                  >
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="specialty"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                  >
                    Spécialité
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="Ex: Conduite en ville"
                  />
                </div>

                {/* Show temporary password after successful creation */}
                {temporaryPassword && !currentInstructor && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md transition-colors duration-200">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2 transition-colors duration-200">
                      Mot de passe temporaire
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-200 font-mono transition-colors duration-200">
                      {temporaryPassword}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-2 transition-colors duration-200">
                      Veuillez communiquer ce mot de passe au moniteur. Il
                      pourra le changer lors de sa première connexion.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors duration-200"
                    onClick={() => {
                      setIsModalOpen(false);
                      setTemporaryPassword(null);
                    }}
                  >
                    {temporaryPassword ? 'Fermer' : 'Annuler'}
                  </button>
                  {(!temporaryPassword || currentInstructor) && (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      {currentInstructor ? 'Enregistrer' : 'Ajouter'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for no results */}
      {filteredInstructors.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
          <Users
            size={48}
            className="mx-auto text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-200"
          />
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2 transition-colors duration-200">
            Aucun moniteur trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Aucun moniteur ne correspond à vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement;
