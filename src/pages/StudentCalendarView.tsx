import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Car, User } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const StudentCalendarView = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

      // Fetch lessons for the current week
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lecon')
        .select(
          `
          *,
          instructeur:utilisateur!lecon_instructeur_id_fkey(name),
          vehicule:vehicule(model)
        `
        )
        .eq('eleve_id', user.id)
        .gte('debut', startDate.toISOString())
        .lte('fin', endDate.toISOString())
        .neq('status', 'cancelled')
        .order('debut', { ascending: true });

      if (lessonsError) throw lessonsError;

      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 19; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get current week's days
  const getDaysOfWeek = () => {
    const days = [];
    let day = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday

    while (days.length < 7) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const daysOfWeek = getDaysOfWeek();

  // Get lessons for a specific day and time
  const getLessonsForSlot = (day: Date, time: string) => {
    const [hour, minute] = time.split(':');
    const slotDateTime = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      parseInt(hour),
      parseInt(minute)
    );

    return lessons.filter((lesson) => {
      const lessonStart = new Date(lesson.debut);
      return (
        lessonStart.getFullYear() === slotDateTime.getFullYear() &&
        lessonStart.getMonth() === slotDateTime.getMonth() &&
        lessonStart.getDate() === slotDateTime.getDate() &&
        lessonStart.getHours() === slotDateTime.getHours() &&
        lessonStart.getMinutes() === slotDateTime.getMinutes()
      );
    });
  };

  // Handle slot click
  const handleSlotClick = (day: Date, time: string, lesson?: any) => {
    if (lesson) {
      setSelectedLesson(lesson);
      setIsViewModalOpen(true);
    }
  };

  // Handle lesson cancellation
  const handleCancelLesson = async () => {
    if (!selectedLesson) return;

    try {
      const { error } = await supabase
        .from('lecon')
        .update({ status: 'cancelled' })
        .eq('id', selectedLesson.id);

      if (error) throw error;

      toast.success('Leçon annulée avec succès');
      setIsViewModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      toast.error("Erreur lors de l'annulation de la leçon");
    }
  };

  // Get background color for lesson type
  const getLessonColor = (type: string) => {
    switch (type) {
      case 'driving':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'code':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'exam':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Mon Calendrier
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            >
              <ChevronLeft size={20} />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', {
                locale: fr,
              })}{' '}
              -{' '}
              {format(
                endOfWeek(currentDate, { weekStartsOn: 1 }),
                'd MMM yyyy',
                { locale: fr }
              )}
            </h2>

            <button
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <Link
            to="/planning"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-200"
          >
            Réserver une leçon
          </Link>
        </div>

        <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
          <div className="p-2 border-r border-b border-gray-200 dark:border-gray-600 transition-colors duration-200">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors duration-200">
              Heure
            </div>
          </div>
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className={`p-2 text-center border-b border-gray-200 dark:border-gray-600 transition-colors duration-200 ${
                isToday(day)
                  ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold'
                  : 'dark:bg-gray-700'
              }`}
            >
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
                {format(day, 'EEEE', { locale: fr }).charAt(0).toUpperCase() +
                  format(day, 'EEEE', { locale: fr }).slice(1, 3)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                {format(day, 'd MMM', { locale: fr })}
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {timeSlots.map((time, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-8">
              <div className="p-2 border-r border-b border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 flex items-center transition-colors duration-200">
                <Clock size={12} className="mr-1" />
                {time}
              </div>
              {daysOfWeek.map((day, dayIndex) => {
                const slotLessons = getLessonsForSlot(day, time);
                return (
                  <div
                    key={dayIndex}
                    className={`border-b border-gray-200 dark:border-gray-600 p-1 min-h-[60px] transition-colors duration-200 ${
                      isToday(day)
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'dark:bg-gray-800'
                    }`}
                  >
                    {slotLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`p-2 rounded text-xs mb-1 cursor-pointer transition-colors duration-200 ${getLessonColor(
                          lesson.type
                        )}`}
                        onClick={() => handleSlotClick(day, time, lesson)}
                      >
                        <div className="font-medium truncate">
                          {lesson.type === 'driving'
                            ? 'Leçon de conduite'
                            : lesson.type === 'code'
                            ? 'Séance de code'
                            : 'Examen'}
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <User size={10} />
                          <span>{lesson.instructeur?.name}</span>
                        </div>
                        {lesson.vehicule && (
                          <div className="flex items-center gap-1 truncate">
                            <Car size={10} />
                            <span>{lesson.vehicule.model}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* View Lesson Modal */}
      {isViewModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-colors duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                Détails de la leçon
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    Type
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                    {selectedLesson.type === 'driving'
                      ? 'Leçon de conduite'
                      : selectedLesson.type === 'code'
                      ? 'Séance de code'
                      : 'Examen'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    Moniteur
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                    {selectedLesson.instructeur?.name}
                  </p>
                </div>

                {selectedLesson.vehicule && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      Véhicule
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                      {selectedLesson.vehicule.model}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    Horaire
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                    {format(
                      new Date(selectedLesson.debut),
                      'dd/MM/yyyy HH:mm',
                      { locale: fr }
                    )}{' '}
                    -{' '}
                    {format(new Date(selectedLesson.fin), 'HH:mm', {
                      locale: fr,
                    })}
                  </p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors duration-200"
                    onClick={handleCancelLesson}
                  >
                    Annuler la leçon
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCalendarView;
