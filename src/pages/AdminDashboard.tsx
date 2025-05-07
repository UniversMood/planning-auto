import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Users, Car, BookOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    newStudentsThisWeek: 0,
    totalInstructors: 0,
    totalVehicles: 0,
    vehiclesInMaintenance: 0,
    todayLessons: 0,
    remainingLessons: 0,
    upcomingLessons: [],
    availableVehicles: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get current date boundaries
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();

      // Fetch all required data in parallel
      const [
        studentsResult,
        newStudentsResult,
        instructorsResult,
        vehiclesResult,
        maintenanceVehiclesResult,
        todayLessonsResult,
        upcomingLessonsResult,
        availableVehiclesResult
      ] = await Promise.all([
        // Total students
        supabase
          .from('utilisateur')
          .select('count')
          .eq('role', 'eleve')
          .single(),

        // New students this week
        supabase
          .from('utilisateur')
          .select('count')
          .eq('role', 'eleve')
          .gte('created_at', weekAgo)
          .single(),

        // Total instructors
        supabase
          .from('utilisateur')
          .select('count')
          .eq('role', 'instructeur')
          .single(),

        // Total vehicles
        supabase
          .from('vehicule')
          .select('count')
          .single(),

        // Vehicles in maintenance
        supabase
          .from('vehicule')
          .select('count')
          .eq('status', 'maintenance')
          .single(),

        // Today's lessons
        supabase
          .from('lecon')
          .select('count')
          .gte('debut', startOfDay)
          .lte('fin', endOfDay)
          .neq('status', 'cancelled')
          .single(),

        // Upcoming lessons with details
        supabase
          .from('lecon')
          .select(`
            *,
            eleve:utilisateur!lecon_eleve_id_fkey(name),
            instructeur:utilisateur!lecon_instructeur_id_fkey(name),
            vehicule:vehicule(model)
          `)
          .gte('debut', startOfDay)
          .neq('status', 'cancelled')
          .order('debut', { ascending: true })
          .limit(3),

        // Available vehicles
        supabase
          .from('vehicule')
          .select('*')
          .eq('status', 'available')
          .limit(2)
      ]);

      // Calculate remaining lessons for today
      const now24Hour = new Date().getHours();
      const remainingLessons = todayLessonsResult.data?.count 
        ? Math.max(0, todayLessonsResult.data.count - Math.floor((now24Hour - 8) / 1.5))
        : 0;

      setStats({
        totalStudents: studentsResult.data?.count || 0,
        newStudentsThisWeek: newStudentsResult.data?.count || 0,
        totalInstructors: instructorsResult.data?.count || 0,
        totalVehicles: vehiclesResult.data?.count || 0,
        vehiclesInMaintenance: maintenanceVehiclesResult.data?.count || 0,
        todayLessons: todayLessonsResult.data?.count || 0,
        remainingLessons,
        upcomingLessons: upcomingLessonsResult.data || [],
        availableVehicles: availableVehiclesResult.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="dashboard-stat">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-600 font-medium">Élèves</h3>
            <UserRound className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
          <p className="text-sm text-green-600">+{stats.newStudentsThisWeek} cette semaine</p>
        </div>
        
        <div className="dashboard-stat">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-600 font-medium">Moniteurs</h3>
            <Users className="text-orange-500" size={24} />
          </div>
          <p className="text-2xl font-bold">{stats.totalInstructors}</p>
          <p className="text-sm text-gray-500">
            {stats.totalInstructors > 0 ? 'Équipe complète' : 'Recrutement en cours'}
          </p>
        </div>
        
        <div className="dashboard-stat">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-600 font-medium">Véhicules</h3>
            <Car className="text-green-500" size={24} />
          </div>
          <p className="text-2xl font-bold">{stats.totalVehicles}</p>
          <p className="text-sm text-red-500">
            {stats.vehiclesInMaintenance > 0 ? 
              `-${stats.vehiclesInMaintenance} en maintenance` : 
              'Tous opérationnels'}
          </p>
        </div>
        
        <div className="dashboard-stat">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-600 font-medium">Leçons du jour</h3>
            <BookOpen className="text-purple-500" size={24} />
          </div>
          <p className="text-2xl font-bold">{stats.todayLessons}</p>
          <p className="text-sm text-gray-500">{stats.remainingLessons} restantes</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title">Leçons à venir</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Élève</th>
                  <th>Moniteur</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingLessons.map(lesson => (
                  <tr key={lesson.id}>
                    <td className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {format(new Date(lesson.debut), 'HH:mm', { locale: fr })} - {format(new Date(lesson.fin), 'HH:mm', { locale: fr })}
                    </td>
                    <td>{lesson.eleve?.name || 'N/A'}</td>
                    <td>{lesson.instructeur?.name || 'N/A'}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        lesson.type === 'driving' ? 'bg-blue-100 text-blue-800' :
                        lesson.type === 'code' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {lesson.type === 'driving' ? 'Conduite' :
                         lesson.type === 'code' ? 'Code' : 'Examen'}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.upcomingLessons.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-4">
                      Aucune leçon à venir aujourd'hui
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link to="/planning" className="text-blue-600 hover:underline">
              Voir tout le planning →
            </Link>
          </div>
        </div>
        
        <div className="card">
          <h2 className="section-title">Véhicules disponibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.availableVehicles.map(vehicle => (
              <div key={vehicle.id} className="vehicle-card">
                <img 
                  src={vehicle.image || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                  alt={vehicle.model} 
                  className="vehicle-image" 
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{vehicle.model}</h3>
                  <p className="text-gray-600 text-sm">{vehicle.type} • {vehicle.fuel}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                      Disponible
                    </span>
                    <span className="text-gray-500 text-sm">{vehicle.registration}</span>
                  </div>
                </div>
              </div>
            ))}
            {stats.availableVehicles.length === 0 && (
              <div className="col-span-2 text-center py-8 bg-gray-50 rounded-lg">
                <Car size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Aucun véhicule disponible actuellement</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link to="/vehicules" className="text-blue-600 hover:underline">
              Voir tous les véhicules →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;