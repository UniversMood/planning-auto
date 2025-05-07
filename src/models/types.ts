export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructeur' | 'eleve';
  phone?: string;
  address?: string;
  birthdate?: string;
  licenseNumber?: string;
  createdAt: Date;
}

export interface Student extends User {
  role: 'eleve';
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
  instructor?: string;
  vehicle?: string;
}

export interface Instructor extends User {
  role: 'instructeur';
  specialty?: string;
  yearsExperience?: number;
  availability?: WeeklySchedule;
  students?: string[];
  assignedVehicle?: string;
}

export interface Vehicle {
  id: string;
  model: string;
  year: number;
  registration: string;
  type: 'Manuelle' | 'Automatique';
  fuel: 'Essence' | 'Diesel' | 'Électrique' | 'Hybride';
  status: 'available' | 'reserved' | 'maintenance';
  image: string;
  lastMaintenance?: Date;
  fuelLevel?: number;
}

export interface Lesson {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'lesson' | 'code' | 'exam' | 'other';
  studentId: string;
  instructorId?: string;
  vehicleId?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // Format: "09:00"
  end: string; // Format: "10:30"
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: Date;
}