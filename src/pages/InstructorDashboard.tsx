import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Calendar, Clock, Car } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import {
  getInstructorProfile,
  getInstructorStats,
  getUpcomingLessons,
} from '../lib/instructors';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [instructorData, setInstructorData] = useState<any>(null);
  const [instructorStats, setInstructorStats] = useState<any>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profile, stats, lessons] = await Promise.all([
        getInstructorProfile(user!.id),
        getInstructorStats(user!.id),
        getUpcomingLessons(user!.id),
      ]);

      setInstructorData(profile);
      setInstructorStats(stats);
      setUpcomingLessons(lessons);
    } catch (error) {
      console.error('Error loading instructor data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 transition-colors duration-200"></div>
      </div>
    );
  }

  if (!instructorData || !instructorStats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">
          Données non disponibles
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-200">
        Bienvenue, {instructorData.name} 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
              Élèves assignés
            </h3>
            <UserRound
              className="text-blue-500 dark:text-blue-400 transition-colors duration-200"
              size={24}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            {instructorStats.students.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            En formation
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
              Leçons aujourd'hui
            </h3>
            <Calendar
              className="text-orange-500 dark:text-orange-400 transition-colors duration-200"
              size={24}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            {upcomingLessons.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            {
              upcomingLessons.filter(
                (lesson) => new Date(lesson.debut) > new Date()
              ).length
            }{' '}
            restantes
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
              Heures ce mois
            </h3>
            <Clock
              className="text-purple-500 dark:text-purple-400 transition-colors duration-200"
              size={24}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            {instructorStats.monthlyHours}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            sur 60 prévues
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
            Programme du jour
          </h2>
          <div className="space-y-4">
            {upcomingLessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex flex-col sm:flex-row items-center gap-4 p-3 rounded-lg border transition-colors duration-200 ${
                  new Date(lesson.debut) < new Date()
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                }`}
              >
                <div className="flex-shrink-0 w-14 h-14 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold transition-colors duration-200">
                  <div className="text-center">
                    <div className="text-sm">
                      {format(new Date(lesson.debut), 'HH:mm', { locale: fr })}
                    </div>
                    <div className="text-xs">
                      {format(new Date(lesson.fin), 'HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white transition-colors duration-200">
                    {lesson.eleve?.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                    {lesson.type === 'driving'
                      ? 'Leçon de conduite'
                      : lesson.type === 'code'
                      ? 'Séance de code'
                      : 'Examen blanc'}
                    {lesson.vehicule && ` - ${lesson.vehicule.model}`}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs transition-colors duration-200 ${
                        new Date(lesson.debut) < new Date()
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {new Date(lesson.debut) < new Date()
                        ? 'Terminé'
                        : 'À venir'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {upcomingLessons.length === 0 && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                <Calendar
                  size={48}
                  className="mx-auto text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-200"
                />
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Aucune leçon prévue aujourd'hui
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link
              to="/calendrier"
              className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
            >
              Voir tout mon planning →
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
            Véhicule assigné aujourd'hui
          </h2>
          {instructorStats.assignedVehicle ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <img
                src={
                  instructorStats.assignedVehicle.image ||
                  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
                }
                alt={instructorStats.assignedVehicle.model}
                className="w-full h-48 object-cover object-center"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white transition-colors duration-200">
                  {instructorStats.assignedVehicle.model}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">
                  {instructorStats.assignedVehicle.type} •{' '}
                  {instructorStats.assignedVehicle.fuel}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-xs">
                    <span className="font-medium block text-gray-700 dark:text-gray-300 transition-colors duration-200">
                      Immatriculation
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      {instructorStats.assignedVehicle.registration}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium block text-gray-700 dark:text-gray-300 transition-colors duration-200">
                      Modèle
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      {instructorStats.assignedVehicle.year}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium block text-gray-700 dark:text-gray-300 transition-colors duration-200">
                      Carburant
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      {instructorStats.assignedVehicle.fuel}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium block text-gray-700 dark:text-gray-300 transition-colors duration-200">
                      Boîte
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      {instructorStats.assignedVehicle.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
              <Car
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-200"
              />
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                Aucun véhicule assigné aujourd'hui
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
            Mes élèves
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    Manœuvres
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                {instructorStats.students.map((student: any) => (
                  <tr key={student.id}>
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
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                          <span>{student.progress?.drivingHours || 0}h</span>
                          <span>{student.progress?.targetHours || 20}h</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 transition-colors duration-200">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-colors duration-200"
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
                        <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                          <span>{student.progress?.codeScore || 0}/40</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 transition-colors duration-200">
                          <div
                            className={`h-1.5 rounded-full transition-colors duration-200 ${
                              (student.progress?.codeScore || 0) >= 35
                                ? 'bg-green-600 dark:bg-green-500'
                                : 'bg-orange-500 dark:bg-orange-400'
                            }`}
                            style={{
                              width: `${
                                ((student.progress?.codeScore || 0) / 40) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(student.progress?.maneuvers || {}).map(
                          ([key, value]) => (
                            <span
                              key={key}
                              className={`px-2 py-0.5 rounded-full text-xs transition-colors duration-200 ${
                                value
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
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
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {instructorStats.students.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-200"
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
    </>
  );
};

export default InstructorDashboard;
