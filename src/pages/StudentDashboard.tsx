import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { getStudentProfile, getStudentStats } from '../lib/students';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profile, stats] = await Promise.all([
        getStudentProfile(user!.id),
        getStudentStats(user!.id),
      ]);

      setStudentData(profile);
      setStudentStats(stats);
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!studentData || !studentStats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Données non disponibles
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Bonjour, {studentData.name} 👋
      </h1>

      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Vos prochaines leçons
        </h2>
        <div className="space-y-4">
          {studentStats.upcomingLessons.map((lesson: any) => (
            <div
              key={lesson.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-lg border transition-colors duration-200 ${
                lesson.type === 'driving'
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                  : lesson.type === 'code'
                  ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700'
                  : 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700'
              }`}
            >
              <div className="flex-shrink-0 w-14 h-14 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold transition-colors duration-200">
                <div className="text-center">
                  <div className="text-xs">
                    {format(new Date(lesson.debut), 'MMM', {
                      locale: fr,
                    }).toUpperCase()}
                  </div>
                  <div className="text-lg">
                    {format(new Date(lesson.debut), 'dd')}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white transition-colors duration-200">
                  {lesson.type === 'driving'
                    ? 'Leçon de conduite'
                    : lesson.type === 'code'
                    ? 'Séance de code'
                    : 'Examen'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  {format(new Date(lesson.debut), 'HH:mm')} -{' '}
                  {format(new Date(lesson.fin), 'HH:mm')}
                  {lesson.instructeur && ` avec ${lesson.instructeur.name}`}
                </div>
                {lesson.vehicule && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 transition-colors duration-200">
                    <Car size={14} />
                    <span>{lesson.vehicule.model}</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <Link
                  to="/calendrier"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-3 py-1.5 transition-colors duration-200"
                >
                  Voir détails
                </Link>
              </div>
            </div>
          ))}

          {studentStats.upcomingLessons.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg transition-colors duration-200">
              <Calendar
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-200"
              />
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                Aucune leçon planifiée
              </p>
              <Link
                to="/calendrier"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-2 inline-block mt-4 transition-colors duration-200"
              >
                Réserver une leçon
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
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
          {studentStats.instructor && (
            <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
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
                    {studentStats.instructor.years_experience} ans d'expérience
                  </p>
                </div>
              </div>
            </div>
          )}

          {studentStats.vehicle && (
            <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
              <h2 className="text-lg font-semibold p-6 pb-4 text-gray-900 dark:text-white">
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
    </>
  );
};

export default StudentDashboard;
