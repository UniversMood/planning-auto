import { supabase } from './supabase';

export interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  specialty: string | null;
  years_experience: number;
  created_at: string;
}

export interface Instructor {
  id: string;
  email: string;
  name: string;
  role: 'instructeur';
  phone: string | null;
  address: string | null;
  specialty: string | null;
  years_experience: number;
  created_at: string;
}

export interface CreateInstructorData {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  specialty?: string | null;
  years_experience?: number;
}

function generateTemporaryPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export async function getInstructors(): Promise<Instructor[]> {
  const { data, error } = await supabase
    .from('utilisateur')
    .select('*')
    .eq('role', 'instructeur')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching instructors:', error);
    throw error;
  }

  return data || [];
}

export async function createInstructor(instructorData: CreateInstructorData): Promise<Instructor> {
  // Check if email already exists
  const { data: existingUsers, error: checkError } = await supabase
    .from('utilisateur')
    .select('id')
    .eq('email', instructorData.email);

  if (checkError) {
    throw new Error('Erreur lors de la vérification de l\'email');
  }

  if (existingUsers && existingUsers.length > 0) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  const temporaryPassword = generateTemporaryPassword();

  const instructor = {
    name: instructorData.name,
    email: instructorData.email,
    password: temporaryPassword,
    role: 'instructeur',
    phone: instructorData.phone || null,
    address: instructorData.address || null,
    specialty: instructorData.specialty || null,
    years_experience: instructorData.years_experience || 0
  };

  const { data, error } = await supabase
    .from('utilisateur')
    .insert([instructor])
    .select()
    .single();

  if (error) {
    console.error('Error creating instructor:', error);
    throw error;
  }

  // Return both the instructor data and the temporary password
  return { ...data, temporaryPassword };
}

export async function getInstructorProfile(id: string): Promise<InstructorProfile | null> {
  const { data, error } = await supabase
    .from('utilisateur')
    .select('*')
    .eq('id', id)
    .eq('role', 'instructeur')
    .single();

  if (error) throw error;
  return data;
}

export async function getInstructorStats(id: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  try {
    const [lessonsResult, studentsResult, vehicleResult] = await Promise.all([
      // Get monthly lessons
      supabase
        .from('lecon')
        .select('debut, fin')
        .eq('instructeur_id', id)
        .gte('debut', startOfMonth)
        .lte('fin', endOfMonth)
        .neq('status', 'cancelled'),

      // Get assigned students
      supabase
        .from('lecon')
        .select(`
          eleve:utilisateur!lecon_eleve_id_fkey(
            id,
            name,
            email,
            progress
          )
        `)
        .eq('instructeur_id', id)
        .neq('status', 'cancelled'),

      // Get assigned vehicle
      supabase
        .from('vehicule')
        .select('*')
        .eq('status', 'available')
        .limit(1)
    ]);

    if (lessonsResult.error) throw lessonsResult.error;
    if (studentsResult.error) throw studentsResult.error;
    if (vehicleResult.error) throw vehicleResult.error;

    // Calculate monthly hours
    const monthlyHours = lessonsResult.data.reduce((total, lesson) => {
      const start = new Date(lesson.debut);
      const end = new Date(lesson.fin);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);

    // Get unique students
    const uniqueStudents = Array.from(
      new Set(studentsResult.data.map(lesson => lesson.eleve.id))
    ).map(studentId => {
      const studentLesson = studentsResult.data.find(lesson => lesson.eleve.id === studentId);
      return studentLesson.eleve;
    });

    return {
      monthlyHours: Math.round(monthlyHours * 10) / 10,
      students: uniqueStudents,
      assignedVehicle: vehicleResult.data[0] || null
    };
  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    throw error;
  }
}

export async function getUpcomingLessons(id: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('lecon')
    .select(`
      id,
      debut,
      fin,
      type,
      eleve:utilisateur!lecon_eleve_id_fkey(name),
      vehicule:vehicule(model)
    `)
    .eq('instructeur_id', id)
    .gte('debut', now)
    .neq('status', 'cancelled')
    .order('debut', { ascending: true })
    .limit(5);

  if (error) throw error;
  return data || [];
}

export async function updateInstructorProfile(
  id: string,
  updates: Partial<InstructorProfile>
): Promise<InstructorProfile> {
  const { data, error } = await supabase
    .from('utilisateur')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInstructor(id: string, instructor: Partial<Omit<Instructor, 'id' | 'role'>>): Promise<Instructor> {
  const { data, error } = await supabase
    .from('utilisateur')
    .update(instructor)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating instructor:', error);
    throw error;
  }

  return data;
}

export async function deleteInstructor(id: string): Promise<void> {
  const { error } = await supabase
    .from('utilisateur')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting instructor:', error);
    throw error;
  }
}

export async function updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  // First verify current password
  const { data: user, error: verifyError } = await supabase
    .from('utilisateur')
    .select('id')
    .eq('id', id)
    .eq('password', currentPassword)
    .single();

  if (verifyError || !user) {
    throw new Error('Mot de passe actuel incorrect');
  }

  // Update password
  const { error: updateError } = await supabase
    .from('utilisateur')
    .update({ password: newPassword })
    .eq('id', id);

  if (updateError) throw updateError;
}