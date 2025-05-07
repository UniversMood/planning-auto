import { supabase } from './supabase';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  birthdate: string | null;
  progress: {
    drivingHours: number;
    targetHours: number;
    codeScore: number;
    maneuvers: {
      parking: boolean;
      highway: boolean;
      city: boolean;
      reverseParking: boolean;
      emergency: boolean;
    };
  };
  created_at: string;
}

export const getStudentProfile = async (id: string): Promise<StudentProfile | null> => {
  const { data, error } = await supabase
    .from('utilisateur')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getStudentStats = async (id: string) => {
  const now = new Date().toISOString();

  // Get upcoming lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lecon')
    .select(`
      id,
      debut,
      fin,
      type,
      instructeur:utilisateur!lecon_instructeur_id_fkey(name),
      vehicule:vehicule(model)
    `)
    .eq('eleve_id', id)
    .gte('debut', now)
    .neq('status', 'cancelled')
    .order('debut', { ascending: true })
    .limit(5);

  if (lessonsError) throw lessonsError;

  // Get assigned instructor (most recent)
  const { data: instructorData, error: instructorError } = await supabase
    .from('lecon')
    .select(`
      instructeur:utilisateur!lecon_instructeur_id_fkey(
        id,
        name,
        specialty,
        years_experience
      )
    `)
    .eq('eleve_id', id)
    .neq('status', 'cancelled')
    .order('debut', { ascending: false })
    .limit(1)
    .single();

  if (instructorError && instructorError.code !== 'PGRST116') throw instructorError;

  // Get assigned vehicle (most recent)
  const { data: vehicleData, error: vehicleError } = await supabase
    .from('lecon')
    .select(`
      vehicule:vehicule(*)
    `)
    .eq('eleve_id', id)
    .neq('status', 'cancelled')
    .order('debut', { ascending: false })
    .limit(1)
    .single();

  if (vehicleError && vehicleError.code !== 'PGRST116') throw vehicleError;

  return {
    upcomingLessons: lessons || [],
    instructor: instructorData?.instructeur || null,
    vehicle: vehicleData?.vehicule || null
  };
};

export const updateStudentProfile = async (
  id: string,
  updates: Partial<StudentProfile>
): Promise<StudentProfile> => {
  const { data, error } = await supabase
    .from('utilisateur')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePassword = async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
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
};

// Keep existing functions
export interface Student {
  id: string;
  email: string;
  name: string;
  role: 'eleve';
  phone: string | null;
  address: string | null;
  birthdate: string | null;
  progress: {
    drivingHours: number;
    targetHours: number;
    codeScore: number;
    maneuvers: {
      parking: boolean;
      highway: boolean;
      city: boolean;
      reverseParking: boolean;
      emergency: boolean;
    };
  };
  created_at: string;
}

export interface CreateStudentData {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  birthdate?: string | null;
  progress?: {
    drivingHours: number;
    targetHours: number;
    codeScore: number;
  };
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

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('utilisateur')
    .select('*')
    .eq('role', 'eleve')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    throw error;
  }

  return data || [];
}

export async function createStudent(studentData: CreateStudentData): Promise<Student> {
  const { data: existingUsers, error: checkError } = await supabase
    .from('utilisateur')
    .select('id')
    .eq('email', studentData.email);

  if (checkError) {
    throw new Error('Erreur lors de la vérification de l\'email');
  }

  if (existingUsers && existingUsers.length > 0) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  const temporaryPassword = generateTemporaryPassword();

  const student = {
    name: studentData.name,
    email: studentData.email,
    password: temporaryPassword,
    role: 'eleve',
    phone: studentData.phone || null,
    address: studentData.address || null,
    birthdate: studentData.birthdate || null,
    progress: {
      drivingHours: studentData.progress?.drivingHours || 0,
      targetHours: studentData.progress?.targetHours || 20,
      codeScore: studentData.progress?.codeScore || 0,
      maneuvers: {
        parking: false,
        highway: false,
        city: false,
        reverseParking: false,
        emergency: false
      }
    }
  };

  const { data, error } = await supabase
    .from('utilisateur')
    .insert([student])
    .select()
    .single();

  if (error) {
    console.error('Error creating student:', error);
    throw error;
  }

  return { ...data, temporaryPassword };
}

export async function updateStudent(id: string, student: Partial<Omit<Student, 'id' | 'role'>>): Promise<Student> {
  const { data, error } = await supabase
    .from('utilisateur')
    .update(student)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating student:', error);
    throw error;
  }

  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase
    .from('utilisateur')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
}