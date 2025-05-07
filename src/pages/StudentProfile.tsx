import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserRound,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Camera,
  Save,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getStudentProfile,
  getStudentStats,
  updateStudentProfile,
  updatePassword,
} from '../lib/students';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    birthdate: '',
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [profile, stats] = await Promise.all([
        getStudentProfile(user!.id),
        getStudentStats(user!.id),
      ]);

      if (profile) {
        setStudentData(profile);
        setFormData({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          address: profile.address || '',
          birthdate: profile.birthdate || '',
        });
      }

      setStudentStats(stats);
    } catch (error) {
      console.error('Error loading student data:', error);
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
      await updateStudentProfile(user!.id, formData);
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
      loadStudentData(); // Reload data
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 transition-colors duration-200"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">
          Données non disponibles
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-200">
        Mon Profil
      </h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-colors duration-200">
              {formData.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              <Camera
                size={18}
                className="text-gray-600 dark:text-gray-300 transition-colors duration-200"
              />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
              {formData.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
              {formData.email}
            </p>
            <p className="mt-1 inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs capitalize transition-colors duration-200">
              {user?.role}
            </p>
          </div>
        </div>

        <div>
          <button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-200"
            onClick={() => setIsChangingPassword(true)}
          >
            Changer de mot de passe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                Informations
              </h2>
              {!isEditing && (
                <button
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
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
                    />
                  </div>

                  <div>
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
                    />
                  </div>

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

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors duration-200"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-200"
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
                    className="text-blue-500 dark:text-blue-400 transition-colors duration-200"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Nom
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail
                    className="text-blue-500 dark:text-blue-400 transition-colors duration-200"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Email
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone
                    className="text-blue-500 dark:text-blue-400 transition-colors duration-200"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Téléphone
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.phone || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin
                    className="text-blue-500 dark:text-blue-400 transition-colors duration-200"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Adresse
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.address || 'Non renseignée'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar
                    className="text-blue-500 dark:text-blue-400 transition-colors duration-200"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Date de naissance
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.birthdate
                        ? new Date(formData.birthdate).toLocaleDateString(
                            'fr-FR'
                          )
                        : 'Non renseignée'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
              Progression
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    Heures de conduite
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    {studentData.progress?.drivingHours || 0}/
                    {studentData.progress?.targetHours || 20} heures
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 transition-colors duration-200">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-colors duration-200"
                    style={{
                      width: `${
                        ((studentData.progress?.drivingHours || 0) /
                          (studentData.progress?.targetHours || 20)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
                  {studentData.progress?.drivingHours >=
                  studentData.progress?.targetHours
                    ? 'Objectif atteint !'
                    : `Il vous reste ${
                        studentData.progress?.targetHours -
                        studentData.progress?.drivingHours
                      } heures à effectuer`}
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    Score au code
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    {studentData.progress?.codeScore || 0}/40 points
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 transition-colors duration-200">
                  <div
                    className={`h-2.5 rounded-full transition-colors duration-200 ${
                      (studentData.progress?.codeScore || 0) >= 35
                        ? 'bg-green-600 dark:bg-green-500'
                        : 'bg-orange-500 dark:bg-orange-400'
                    }`}
                    style={{
                      width: `${
                        ((studentData.progress?.codeScore || 0) / 40) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
                  {(studentData.progress?.codeScore || 0) >= 35
                    ? "Vous êtes prêt pour l'examen !"
                    : `Il vous faut encore ${
                        35 - (studentData.progress?.codeScore || 0)
                      } points pour atteindre le seuil d'examen`}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                  Manœuvres maîtrisées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(studentData.progress?.maneuvers || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border transition-colors duration-200 ${
                          value
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                            : 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 transition-colors duration-200 ${
                              value
                                ? 'bg-green-500 dark:bg-green-400'
                                : 'bg-gray-400 dark:bg-gray-500'
                            }`}
                          ></div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
                            {key === 'city'
                              ? 'Conduite en ville'
                              : key === 'highway'
                              ? 'Conduite sur autoroute'
                              : key === 'parking'
                              ? 'Créneau'
                              : key === 'reverseParking'
                              ? 'Créneau en marche arrière'
                              : key === 'emergency'
                              ? "Freinage d'urgence"
                              : key}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {studentStats?.instructor && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                  Votre moniteur
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold transition-colors duration-200">
                    {studentStats.instructor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white transition-colors duration-200">
                      {studentStats.instructor.name}
                    </h3>
                    {studentStats.instructor.specialty && (
                      <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                        {studentStats.instructor.specialty}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      {studentStats.instructor.years_experience} ans
                      d'expérience
                    </p>
                  </div>
                </div>
              </div>
            )}

            {studentStats?.vehicle && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
                <h2 className="text-xl font-semibold p-6 pb-4 text-gray-900 dark:text-white transition-colors duration-200">
                  Véhicule attribué
                </h2>
                <div className="vehicle-card">
                  <img
                    src={
                      studentStats.vehicle.image ||
                      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
                    }
                    alt={studentStats.vehicle.model}
                    className="w-full h-48 object-cover object-center"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white transition-colors duration-200">
                      {studentStats.vehicle.model}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">
                      {studentStats.vehicle.type} • {studentStats.vehicle.fuel}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="text-xs">
                        <span className="font-medium block text-gray-700 dark:text-gray-300 transition-colors duration-200">
                          Immatriculation
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                          {studentStats.vehicle.registration}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="font-medium block text-gray-700 dark:text-gray-300 transition-colors duration-200">
                          Modèle
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                          {studentStats.vehicle.year}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-colors duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                Changer le mot de passe
              </h2>

              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        name="currentPassword"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
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
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
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
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors duration-200"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200"
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

export default StudentProfile;
