import React, { useState, useEffect } from 'react';
import { UserRound, Plus, Edit, Trash2, Search, Check, X } from 'lucide-react';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  Student,
} from '../lib/students';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    address: '',
    drivingHours: 0,
    targetHours: 20,
    codeScore: 0,
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des élèves');
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
    setCurrentStudent(null);
    setTemporaryPassword(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthdate: '',
      address: '',
      drivingHours: 0,
      targetHours: 20,
      codeScore: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setCurrentStudent(student);
    setTemporaryPassword(null);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      birthdate: student.birthdate || '',
      address: student.address || '',
      drivingHours: student.progress?.drivingHours ?? 0,
      targetHours: student.progress?.targetHours ?? 20,
      codeScore: student.progress?.codeScore ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const studentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        birthdate: formData.birthdate || null,
        address: formData.address || null,
        progress: {
          drivingHours: Number(formData.drivingHours),
          targetHours: Number(formData.targetHours),
          codeScore: Number(formData.codeScore),
          maneuvers: {
            city: false,
            highway: false,
            parking: false,
            emergency: false,
            reverseParking: false,
          },
        },
      };

      if (currentStudent) {
        await updateStudent(currentStudent.id, studentData);
        toast.success('Élève mis à jour avec succès');
        setIsModalOpen(false);
      } else {
        const result = await createStudent(studentData);
        setTemporaryPassword(result.temporaryPassword);
        toast.success('Élève ajouté avec succès');
        // Don't close the modal yet to show the temporary password
      }

      loadStudents();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          currentStudent
            ? "Erreur lors de la mise à jour de l'élève"
            : "Erreur lors de l'ajout de l'élève"
        );
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      try {
        await deleteStudent(id);
        toast.success('Élève supprimé avec succès');
        loadStudents();
      } catch (error) {
        toast.error("Erreur lors de la suppression de l'élève");
      }
    }
  };

  const getStatusBadge = (student: Student) => {
    const { progress } = student;
    if (!progress?.maneuvers)
      return (
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs transition-colors duration-200">
          Nouveau
        </span>
      );

    const maneuversCompleted = Object.values(progress.maneuvers).filter(
      Boolean
    ).length;
    const totalManeuvers = Object.keys(progress.maneuvers).length;

    if (
      progress.drivingHours >= progress.targetHours &&
      progress.codeScore >= 35 &&
      maneuversCompleted === totalManeuvers
    ) {
      return (
        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs transition-colors duration-200">
          Prêt pour examen
        </span>
      );
    } else if (progress.drivingHours > 0 || progress.codeScore > 0) {
      return (
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs transition-colors duration-200">
          En formation
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs transition-colors duration-200">
          Nouveau
        </span>
      );
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

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
        Gestion des Élèves
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
            placeholder="Rechercher un élève..."
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200"
                >
                  Élève
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200"
                >
                  Progression
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200"
                >
                  Manœuvres
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200"
                >
                  Statut
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors duration-200">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1 text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">
                          <span>Conduite</span>
                          <span>
                            {student.progress?.drivingHours ?? 0}/
                            {student.progress?.targetHours ?? 20}h
                          </span>
                        </div>
                        <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 transition-colors duration-200">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-colors duration-200"
                            style={{
                              width: `${
                                ((student.progress?.drivingHours ?? 0) /
                                  (student.progress?.targetHours ?? 20)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">
                          <span>Code</span>
                          <span>{student.progress?.codeScore ?? 0}/40</span>
                        </div>
                        <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 transition-colors duration-200">
                          <div
                            className={`h-1.5 rounded-full transition-colors duration-200 ${
                              (student.progress?.codeScore ?? 0) >= 35
                                ? 'bg-green-600 dark:bg-green-500'
                                : 'bg-orange-500 dark:bg-orange-400'
                            }`}
                            style={{
                              width: `${
                                ((student.progress?.codeScore ?? 0) / 40) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="grid grid-cols-3 gap-1">
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        {student.progress?.maneuvers?.parking ? (
                          <Check
                            size={14}
                            className="text-green-500 dark:text-green-400 transition-colors duration-200"
                          />
                        ) : (
                          <X
                            size={14}
                            className="text-gray-300 dark:text-gray-600 transition-colors duration-200"
                          />
                        )}
                        <span className="ml-1">Créneau</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        {student.progress?.maneuvers?.highway ? (
                          <Check
                            size={14}
                            className="text-green-500 dark:text-green-400 transition-colors duration-200"
                          />
                        ) : (
                          <X
                            size={14}
                            className="text-gray-300 dark:text-gray-600 transition-colors duration-200"
                          />
                        )}
                        <span className="ml-1">Autoroute</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        {student.progress?.maneuvers?.city ? (
                          <Check
                            size={14}
                            className="text-green-500 dark:text-green-400 transition-colors duration-200"
                          />
                        ) : (
                          <X
                            size={14}
                            className="text-gray-300 dark:text-gray-600 transition-colors duration-200"
                          />
                        )}
                        <span className="ml-1">Ville</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        {student.progress?.maneuvers?.reverseParking ? (
                          <Check
                            size={14}
                            className="text-green-500 dark:text-green-400 transition-colors duration-200"
                          />
                        ) : (
                          <X
                            size={14}
                            className="text-gray-300 dark:text-gray-600 transition-colors duration-200"
                          />
                        )}
                        <span className="ml-1">Créneau retour</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        {student.progress?.maneuvers?.emergency ? (
                          <Check
                            size={14}
                            className="text-green-500 dark:text-green-400 transition-colors duration-200"
                          />
                        ) : (
                          <X
                            size={14}
                            className="text-gray-300 dark:text-gray-600 transition-colors duration-200"
                          />
                        )}
                        <span className="ml-1">Urgence</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(student)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                        onClick={() => openEditModal(student)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-colors duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                {currentStudent ? "Modifier l'élève" : 'Ajouter un élève'}
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
                      htmlFor="birthdate"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      value={formData.birthdate}
                      onChange={handleInputChange}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    Progression
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="drivingHours"
                        className="block text-xs text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200"
                      >
                        Heures de conduite
                      </label>
                      <input
                        type="number"
                        id="drivingHours"
                        name="drivingHours"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        value={formData.drivingHours}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="targetHours"
                        className="block text-xs text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200"
                      >
                        Objectif d'heures
                      </label>
                      <input
                        type="number"
                        id="targetHours"
                        name="targetHours"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        value={formData.targetHours}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                      />
                    </div>

                    <div className="col-span-2">
                      <label
                        htmlFor="codeScore"
                        className="block text-xs text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200"
                      >
                        Score au code (/40)
                      </label>
                      <input
                        type="number"
                        id="codeScore"
                        name="codeScore"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        value={formData.codeScore}
                        onChange={handleInputChange}
                        min="0"
                        max="40"
                      />
                    </div>
                  </div>
                </div>

                {/* Show temporary password after successful creation */}
                {temporaryPassword && !currentStudent && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md transition-colors duration-200">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2 transition-colors duration-200">
                      Mot de passe temporaire
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-200 font-mono transition-colors duration-200">
                      {temporaryPassword}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-2 transition-colors duration-200">
                      Veuillez communiquer ce mot de passe à l'élève. Il pourra
                      le changer lors de sa première connexion.
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
                  {(!temporaryPassword || currentStudent) && (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      {currentStudent ? 'Enregistrer' : 'Ajouter'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for no results */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
          <UserRound
            size={48}
            className="mx-auto text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-200"
          />
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2 transition-colors duration-200">
            Aucun élève trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Aucun élève ne correspond à vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
