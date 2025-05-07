import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Edit,
  Camera,
  Save,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getInstructorProfile,
  getInstructorStats,
  updateInstructorProfile,
  updatePassword,
} from '../lib/instructors';
import toast from 'react-hot-toast';

const InstructorProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [instructorData, setInstructorData] = useState<any>(null);
  const [instructorStats, setInstructorStats] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    specialty: '',
    years_experience: 0,
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadInstructorData();
    }
  }, [user]);

  const loadInstructorData = async () => {
    try {
      setLoading(true);
      const [profile, stats] = await Promise.all([
        getInstructorProfile(user!.id),
        getInstructorStats(user!.id),
      ]);

      if (profile) {
        setInstructorData(profile);
        setFormData({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          address: profile.address || '',
          specialty: profile.specialty || '',
          years_experience: profile.years_experience || 0,
        });
      }

      setInstructorStats(stats);
    } catch (error) {
      console.error('Error loading instructor data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateInstructorProfile(user!.id, formData);
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
      loadInstructorData(); // Reload data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await updatePassword(
        user!.id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success('Mot de passe mis à jour avec succès');
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du mot de passe'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!instructorData) {
    return (
      <div className="text-center py-12 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Données non disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Mon Profil</h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Camera size={18} className="dark:text-gray-300" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold dark:text-white">
              {formData.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{formData.email}</p>
            <p className="mt-1 inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        <div>
          <button
            className="btn-primary dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
            onClick={() => setIsChangingPassword(true)}
          >
            Changer de mot de passe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-950/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-white">
                Informations
              </h2>
              {!isEditing && (
                <button
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit size={18} />
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="specialty"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Spécialité
                    </label>
                    <input
                      type="text"
                      id="specialty"
                      name="specialty"
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.specialty}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="years_experience"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Années d'expérience
                    </label>
                    <input
                      type="number"
                      id="years_experience"
                      name="years_experience"
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.years_experience}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="btn-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex items-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      <Save size={18} />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserRound
                    className="text-blue-500 dark:text-blue-400"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nom
                    </p>
                    <p className="font-medium dark:text-white">
                      {formData.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail
                    className="text-blue-500 dark:text-blue-400"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium dark:text-white">
                      {formData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone
                    className="text-blue-500 dark:text-blue-400"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Téléphone
                    </p>
                    <p className="font-medium dark:text-white">
                      {formData.phone || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin
                    className="text-blue-500 dark:text-blue-400"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Adresse
                    </p>
                    <p className="font-medium dark:text-white">
                      {formData.address || 'Non renseignée'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star
                    className="text-blue-500 dark:text-blue-400"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Spécialité
                    </p>
                    <p className="font-medium dark:text-white">
                      {formData.specialty || 'Non renseignée'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserRound
                    className="text-blue-500 dark:text-blue-400"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Expérience
                    </p>
                    <p className="font-medium dark:text-white">
                      {formData.years_experience} ans
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-950/50 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Statistiques
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                  {instructorStats.students.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Élèves actuels
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-1">
                  {formData.years_experience}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Années d'expérience
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                  {instructorStats.monthlyHours}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Heures ce mois
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-950/50 p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Élèves assignés
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Progression
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Manœuvres
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {instructorStats.students.map((student: any) => (
                    <tr key={student.id} className="dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
                            {student.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1 dark:text-gray-300">
                            <span>{student.progress?.drivingHours || 0}h</span>
                            <span>{student.progress?.targetHours || 20}h</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full"
                              style={{
                                width: `${
                                  ((student.progress?.drivingHours || 0) /
                                    (student.progress?.targetHours || 20)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1 dark:text-gray-300">
                            <span>{student.progress?.codeScore || 0}/40</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                (student.progress?.codeScore || 0) >= 35
                                  ? 'bg-green-600 dark:bg-green-500'
                                  : 'bg-orange-500 dark:bg-orange-400'
                              }`}
                              style={{
                                width: `${
                                  ((student.progress?.codeScore || 0) / 40) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(
                            student.progress?.maneuvers || {}
                          ).map(([key, value]) => (
                            <span
                              key={key}
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                value
                                  ? 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {key === 'city'
                                ? 'Ville'
                                : key === 'highway'
                                ? 'Autoroute'
                                : key === 'parking'
                                ? 'Créneau'
                                : key === 'reverseParking'
                                ? 'Créneau retour'
                                : key === 'emergency'
                                ? 'Urgence'
                                : key}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {instructorStats.students.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        Aucun élève assigné
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Changer le mot de passe
              </h2>

              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        name="currentPassword"
                        className="input-field pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        className="input-field pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="btn-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn-primary dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      Changer le mot de passe
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorProfile;
