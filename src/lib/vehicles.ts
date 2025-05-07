import { supabase } from './supabase';

export interface Vehicle {
  id: string;
  model: string;
  year: number;
  registration: string;
  type: 'Manuelle' | 'Automatique';
  fuel: 'Essence' | 'Diesel' | 'Électrique' | 'Hybride';
  status: 'available' | 'reserved' | 'maintenance';
  image: string | null;
  created_at: string;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicule')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }

  return data || [];
}

export async function createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicule')
    .insert([vehicle])
    .select()
    .single();

  if (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }

  return data;
}

export async function updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicule')
    .update(vehicle)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }

  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase
    .from('vehicule')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}