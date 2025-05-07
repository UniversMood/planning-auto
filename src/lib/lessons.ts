import { supabase } from './supabase';

export interface Lesson {
  id: string;
  eleve_id: string | null;
  instructeur_id: string | null;
  vehicule_id: string | null;
  debut: string;
  fin: string;
  type: 'driving' | 'code' | 'exam';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
}

export const getLessons = async () => {
  try {
    const { data, error } = await supabase
      .from('lecon')
      .select(`
        *,
        eleve:utilisateur!lecon_eleve_id_fkey(name),
        instructeur:utilisateur!lecon_instructeur_id_fkey(name),
        vehicule:vehicule(model)
      `)
      .neq('status', 'cancelled');

    if (error) throw error;

    // Transform the data to match the expected format in the Schedule component
    return data.map((lesson) => ({
      id: lesson.id,
      title:
        lesson.type === 'driving'
          ? 'Leçon de conduite'
          : lesson.type === 'code'
          ? 'Séance de code'
          : 'Examen blanc',
      student: lesson.eleve?.name || 'N/A',
      instructor: lesson.instructeur?.name || 'N/A',
      vehicle: lesson.vehicule?.model || null,
      start: lesson.debut,
      end: lesson.fin,
      type: lesson.type,
      status: lesson.status,
      notes: lesson.notes,
      eleve_id: lesson.eleve_id,
      instructeur_id: lesson.instructeur_id,
      vehicule_id: lesson.vehicule_id,
    }));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

export const createLesson = async (lessonData: any) => {
  try {
    // First, get the IDs for the student, instructor, and vehicle
    const [studentResult, instructorResult, vehicleResult] = await Promise.all([
      supabase
        .from('utilisateur')
        .select('id')
        .eq('name', lessonData.student)
        .single(),
      supabase
        .from('utilisateur')
        .select('id')
        .eq('name', lessonData.instructor)
        .single(),
      lessonData.vehicle
        ? supabase
            .from('vehicule')
            .select('id')
            .eq('model', lessonData.vehicle)
            .single()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (studentResult.error) throw studentResult.error;
    if (instructorResult.error) throw instructorResult.error;
    if (vehicleResult.error && lessonData.vehicle) throw vehicleResult.error;

    const newLesson = {
      eleve_id: studentResult.data.id,
      instructeur_id: instructorResult.data.id,
      vehicule_id: vehicleResult.data?.id || null,
      debut: lessonData.start,
      fin: lessonData.end,
      type: lessonData.type,
      status: 'scheduled',
      notes: null,
    };

    const { data, error } = await supabase
      .from('lecon')
      .insert([newLesson])
      .select(`
        *,
        eleve:utilisateur!lecon_eleve_id_fkey(name),
        instructeur:utilisateur!lecon_instructeur_id_fkey(name),
        vehicule:vehicule(model)
      `)
      .single();

    if (error) throw error;

    // Return the lesson in the format expected by the Schedule component
    return {
      id: data.id,
      title:
        data.type === 'driving'
          ? 'Leçon de conduite'
          : data.type === 'code'
          ? 'Séance de code'
          : 'Examen blanc',
      student: data.eleve.name,
      instructor: data.instructeur.name,
      vehicle: data.vehicule?.model || null,
      start: data.debut,
      end: data.fin,
      type: data.type,
      status: data.status,
      notes: data.notes,
      eleve_id: data.eleve_id,
      instructeur_id: data.instructeur_id,
      vehicule_id: data.vehicule_id,
    };
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

export const updateLesson = async (id: string, lessonData: any) => {
  try {
    const { data, error } = await supabase
      .from('lecon')
      .update(lessonData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

export const deleteLesson = async (id: string) => {
  try {
    const { error } = await supabase
      .from('lecon')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};