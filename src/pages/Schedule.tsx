import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Car,
  User,
  Filter,
  Trash2,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  parseISO,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  Lesson,
} from '../lib/lessons';
import { getStudents } from '../lib/students';
import { getInstructors } from '../lib/instructors';
import { getVehicles } from '../lib/vehicles';
import toast from 'react-hot-toast';

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

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Utiliser la date actuelle
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [filterInstructor, setFilterInstructor] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    student: '',
    instructor: '',
    vehicle: '',
    start: '',
    end: '',
    type: 'driving',
  });

  // Effet de débogage pour surveiller les changements dans lessons
  useEffect(() => {
    console.log('État actuel des leçons:', lessons);
  }, [lessons]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [lessonsData, studentsData, instructorsData, vehiclesData] =
          await Promise.all([
            getLessons(),
            getStudents(),
            getInstructors(),
            getVehicles(),
          ]);

        console.log("Leçons récupérées de l'API:", lessonsData);

        setLessons(lessonsData);
        setStudents(studentsData);
        setInstructors(instructorsData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get current week's start and end dates
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday

  // Generate days of the week
  const getDaysOfWeek = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const daysOfWeek = getDaysOfWeek();

  // Navigate to previous week
  const previousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  // Navigate to next week
  const nextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  // Get lessons for a specific day and time
  const getLessonsForSlot = (day: Date, time: string) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const [hour, minute] = time.split(':');
    const slotDateTime = new Date(`${dayStr}T${hour}:${minute}:00`);

    return lessons.filter((lesson) => {
      // Filtrer selon les critères de sélection
      const matchesInstructor =
        filterInstructor === 'all' || lesson.instructor === filterInstructor;
      const matchesStudent =
        filterStudent === 'all' || lesson.student === filterStudent;
      const matchesVehicle =
        filterVehicle === 'all' ||
        lesson.vehicle === filterVehicle ||
        (!lesson.vehicle && filterVehicle === 'none');

      if (!matchesInstructor || !matchesStudent || !matchesVehicle) {
        return false;
      }

      // Convertir la date de début de la leçon en objet Date
      const lessonStartDate = new Date(lesson.start);

      // Vérifier si la leçon commence à ce créneau horaire
      // On compare les dates en vérifiant l'année, le mois, le jour, l'heure et les minutes
      return (
        lessonStartDate.getFullYear() === slotDateTime.getFullYear() &&
        lessonStartDate.getMonth() === slotDateTime.getMonth() &&
        lessonStartDate.getDate() === slotDateTime.getDate() &&
        lessonStartDate.getHours() === slotDateTime.getHours() &&
        lessonStartDate.getMinutes() === slotDateTime.getMinutes()
      );
    });
  };

  // Format date as string
  const formatDate = (date: Date) => {
    return (
      format(date, 'EEEE d MMMM', { locale: fr }).charAt(0).toUpperCase() +
      format(date, 'EEEE d MMMM', { locale: fr }).slice(1)
    );
  };

  // Open modal - either add new lesson or view existing lesson
  const handleSlotClick = (day: Date, time: string, lesson?: Lesson) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    setSelectedDate(dayStr);
    setSelectedTime(time);

    if (lesson) {
      // Si une leçon existe à ce créneau, ouvrir le modal de visualisation
      setSelectedLesson(lesson);
      setIsViewModalOpen(true);
    } else {
      // Sinon, ouvrir le modal d'ajout de leçon
      const [hour, minute] = time.split(':');
      const startTime = `${dayStr}T${hour}:${minute}:00`;

      // Calculate end time (1.5 hours later)
      const endHour = parseInt(hour) + 1;
      const endMinute = minute === '00' ? '30' : '00';
      const endHourStr = endHour.toString().padStart(2, '0');
      const endTime =
        endHour === 20 && endMinute === '00'
          ? `${dayStr}T19:30:00`
          : `${dayStr}T${endHourStr}:${endMinute}:00`;

      setFormData({
        title: 'Leçon de conduite',
        student: students.length > 0 ? students[0].name : '',
        instructor: instructors.length > 0 ? instructors[0].name : '',
        vehicle: vehicles.length > 0 ? vehicles[0].model : '',
        start: startTime,
        end: endTime,
        type: 'driving',
      });

      setIsModalOpen(true);
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update end time when start time changes
    if (name === 'start' && formData.start) {
      const startDateTime = new Date(value);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(startDateTime.getMinutes() + 90); // Add 1.5 hours

      setFormData({
        ...formData,
        [name]: value,
        end: endDateTime.toISOString().slice(0, 16),
      });
    } else if (name === 'type') {
      let title = formData.title;
      if (value === 'driving') title = 'Leçon de conduite';
      else if (value === 'code') title = 'Séance de code';
      else if (value === 'exam') title = 'Examen blanc';

      setFormData({
        ...formData,
        [name]: value,
        title: title,
        vehicle: value === 'code' ? '' : formData.vehicle,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Données du formulaire avant envoi:', formData);

    // Check for conflicts
    const conflicts = checkForConflicts(formData);

    if (conflicts.length > 0) {
      toast.error(`Conflit de réservation détecté:\n${conflicts.join('\n')}`);
      return;
    }

    try {
      const newLesson = await createLesson({
        title: formData.title,
        student: formData.student,
        instructor: formData.instructor,
        vehicle: formData.type === 'code' ? null : formData.vehicle,
        start: formData.start,
        end: formData.end,
        type: formData.type,
        status: 'scheduled',
      });

      console.log('Nouvelle leçon créée:', newLesson);

      // Forcer un rechargement des leçons depuis l'API
      const updatedLessons = await getLessons();
      console.log('Leçons rechargées après création:', updatedLessons);
      setLessons(updatedLessons);

      setIsModalOpen(false);
      toast.success('Leçon ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la leçon:', error);
      toast.error('Erreur lors de la création de la leçon');
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;

    setIsDeletingLesson(true);

    try {
      await deleteLesson(selectedLesson.id);

      // Mettre à jour la liste des leçons après suppression
      const updatedLessons = await getLessons();
      setLessons(updatedLessons);

      setIsViewModalOpen(false);
      toast.success('Leçon supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la leçon:', error);
      toast.error('Erreur lors de la suppression de la leçon');
    } finally {
      setIsDeletingLesson(false);
    }
  };

  // Check for scheduling conflicts
  const checkForConflicts = (newLesson: any) => {
    const conflicts = [];
    const newStart = new Date(newLesson.start);
    const newEnd = new Date(newLesson.end);

    for (const lesson of lessons) {
      const lessonStart = new Date(lesson.start);
      const lessonEnd = new Date(lesson.end);

      // Check for time overlap
      const timeOverlap =
        (newStart >= lessonStart && newStart < lessonEnd) ||
        (newEnd > lessonStart && newEnd <= lessonEnd) ||
        (newStart <= lessonStart && newEnd >= lessonEnd);

      if (timeOverlap) {
        // Check instructor conflict
        if (lesson.instructor === newLesson.instructor) {
          conflicts.push(
            `Le moniteur ${lesson.instructor} est déjà réservé de ${format(
              lessonStart,
              'HH:mm'
            )} à ${format(lessonEnd, 'HH:mm')}`
          );
        }

        // Check student conflict
        if (lesson.student === newLesson.student) {
          conflicts.push(
            `L'élève ${lesson.student} est déjà réservé de ${format(
              lessonStart,
              'HH:mm'
            )} à ${format(lessonEnd, 'HH:mm')}`
          );
        }

        // Check vehicle conflict
        if (
          lesson.vehicle &&
          newLesson.vehicle &&
          lesson.vehicle === newLesson.vehicle
        ) {
          conflicts.push(
            `Le véhicule ${lesson.vehicle} est déjà réservé de ${format(
              lessonStart,
              'HH:mm'
            )} à ${format(lessonEnd, 'HH:mm')}`
          );
        }
      }
    }

    return conflicts;
  };

  // Get background color for lesson type
  const getLessonColor = (type: string) => {
    switch (type) {
      case 'driving':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 transition-colors duration-200';
      case 'code':
        return 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 transition-colors duration-200';
      case 'exam':
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300 transition-colors duration-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 transition-colors duration-200';
    }
  };

  // Render a time slot cell with lessons
  const renderSlotCell = (day: Date, time: string) => {
    const slotLessons = getLessonsForSlot(day, time);
    const isCurrentDay = isToday(day);

    return (
      <div
        className={`border border-gray-200 dark:border-gray-700 p-1 min-h-[60px] transition-colors duration-200 ${
          isCurrentDay
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        onClick={() => {
          // Si aucune leçon n'existe à ce créneau, ouvrir le modal d'ajout
          if (slotLessons.length === 0) {
            handleSlotClick(day, time);
          }
        }}
      >
        {slotLessons.length > 0
          ? slotLessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-1 text-xs rounded border ${getLessonColor(
                  lesson.type
                )} mb-1 cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation(); // Empêcher le déclenchement du onClick du parent
                  handleSlotClick(day, time, lesson);
                }}
              >
                <div className="font-medium truncate">{lesson.title}</div>
                <div className="flex items-center gap-1 truncate">
                  <User size={10} />
                  <span>{lesson.student}</span>
                </div>
                {lesson.vehicle && (
                  <div className="flex items-center gap-1 truncate">
                    <Car size={10} />
                    <span>{lesson.vehicle}</span>
                  </div>
                )}
              </div>
            ))
          : null}
      </div>
    );
  };

  // Bouton pour actualiser manuellement les données
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const freshLessons = await getLessons();
      console.log('Leçons actualisées:', freshLessons);
      setLessons(freshLessons);
      toast.success('Données actualisées');
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-200">
        Planning des Leçons
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6 transition-colors duration-200">
        <div className="p-4 border-b dark:border-gray-700 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
                onClick={previousWeek}
              >
                <ChevronLeft size={20} />
              </button>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                {format(startDate, 'd MMM', { locale: fr })} -{' '}
                {format(endDate, 'd MMM yyyy', { locale: fr })}
              </h2>

              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
                onClick={nextWeek}
              >
                <ChevronRight size={20} />
              </button>

              {/* Bouton d'actualisation */}
              <button
                className="ml-4 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-800 dark:text-blue-300 flex items-center justify-center transition-colors duration-200"
                onClick={refreshData}
                disabled={isLoading}
              >
                <div className="flex items-center">
                  <svg
                    className={`w-4 h-4 mr-1 ${
                      isLoading ? 'animate-spin' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-xs">Actualiser</span>
                </div>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                value={filterInstructor}
                onChange={(e) => setFilterInstructor(e.target.value)}
              >
                <option value="all">Tous les moniteurs</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.name}>
                    {instructor.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
              >
                <option value="all">Tous les élèves</option>
                {students.map((student) => (
                  <option key={student.id} value={student.name}>
                    {student.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                value={filterVehicle}
                onChange={(e) => setFilterVehicle(e.target.value)}
              >
                <option value="all">Tous les véhicules</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.model}>
                    {vehicle.model}
                  </option>
                ))}
                <option value="none">Sans véhicule</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              <div className="p-2 border-r border-b border-gray-200 dark:border-gray-600 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10 transition-colors duration-200">
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
                      : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">
                    {format(day, 'EEEE', { locale: fr })
                      .charAt(0)
                      .toUpperCase() +
                      format(day, 'EEEE', { locale: fr }).slice(1, 3)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    {format(day, 'd MMM', { locale: fr })}
                  </div>
                </div>
              ))}
            </div>

            {timeSlots.map((time, timeIndex) => (
              <div key={timeIndex} className="grid grid-cols-8">
                <div className="p-2 border-r border-b border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 flex items-center sticky left-0 bg-white dark:bg-gray-800 z-10 transition-colors duration-200">
                  <Clock size={12} className="mr-1" />
                  {time}
                </div>
                {daysOfWeek.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="border-b border-gray-200 dark:border-gray-600 transition-colors duration-200"
                  >
                    {renderSlotCell(day, time)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-600 transition-colors duration-200"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
            Leçon de conduite
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-600 transition-colors duration-200"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
            Séance de code
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 dark:bg-orange-600 transition-colors duration-200"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
            Examen
          </span>
        </div>
      </div>

      {/* Add Lesson Modal */}
      {isModalOpen && selectedDate && selectedTime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-colors duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                Ajouter une leçon
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">
                {formatDate(new Date(selectedDate))} à {selectedTime}
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                  >
                    Type de leçon
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="driving">Leçon de conduite</option>
                    <option value="code">Séance de code</option>
                    <option value="exam">Examen blanc</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                  >
                    Titre
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="start"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Début
                    </label>
                    <input
                      type="datetime-local"
                      id="start"
                      name="start"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      value={formData.start}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="end"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Fin
                    </label>
                    <input
                      type="datetime-local"
                      id="end"
                      name="end"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      value={formData.end}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="student"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                  >
                    Élève
                  </label>
                  <select
                    id="student"
                    name="student"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    value={formData.student}
                    onChange={handleInputChange}
                    required
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.name}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="instructor"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                  >
                    Moniteur
                  </label>
                  <select
                    id="instructor"
                    name="instructor"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                  >
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.name}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.type !== 'code' && (
                  <div className="mb-4">
                    <label
                      htmlFor="vehicle"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200"
                    >
                      Véhicule
                    </label>
                    <select
                      id="vehicle"
                      name="vehicle"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      value={formData.vehicle}
                      onChange={handleInputChange}
                      required={formData.type !== 'code'}
                    >
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.model}>
                          {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors duration-200"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View/Delete Lesson Modal */}
      {isViewModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-colors duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                Détails de la leçon
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-200">
                  {selectedLesson.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Date:
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                      {format(new Date(selectedLesson.start), 'dd/MM/yyyy', {
                        locale: fr,
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Horaire:
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                      {format(new Date(selectedLesson.start), 'HH:mm', {
                        locale: fr,
                      })}{' '}
                      -
                      {format(new Date(selectedLesson.end), 'HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Élève:
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                      {selectedLesson.student}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Moniteur:
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                      {selectedLesson.instructor}
                    </p>
                  </div>

                  {selectedLesson.vehicle && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        Véhicule:
                      </p>
                      <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                        {selectedLesson.vehicle}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Statut:
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white capitalize transition-colors duration-200">
                      {selectedLesson.status === 'scheduled'
                        ? 'Planifiée'
                        : selectedLesson.status === 'completed'
                        ? 'Terminée'
                        : 'Annulée'}
                    </p>
                  </div>
                </div>

                {selectedLesson.notes && (
                  <div className="mt-4">
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Notes:
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white transition-colors duration-200">
                      {selectedLesson.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="flex items-center bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-700 dark:text-red-400 py-2 px-4 rounded-md transition-colors duration-200"
                  onClick={handleDeleteLesson}
                  disabled={isDeletingLesson}
                >
                  {isDeletingLesson ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700 dark:text-red-400 transition-colors duration-200"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-1" />
                      Supprimer
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md transition-colors duration-200"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
