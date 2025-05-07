/*
  # Initial Schema Setup

  1. Tables Created:
    - users (for students, instructors, and admins)
    - vehicles (for driving school cars)
    - instructor_availability (for instructor schedules)
    - lessons (for driving lessons and exams)
    - notifications (for system notifications)

  2. Security:
    - RLS enabled on all tables
    - Public policies added for development
    
  3. Features:
    - Automatic timestamp updates
    - Enum constraints for status fields
    - Foreign key relationships
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'instructeur', 'eleve')),
  phone text,
  address text,
  birthdate date,
  license_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  model text NOT NULL,
  year integer NOT NULL,
  registration text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('Manuelle', 'Automatique')),
  fuel text NOT NULL CHECK (fuel IN ('Essence', 'Diesel', 'Électrique', 'Hybride')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'maintenance')),
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);

-- Instructor availability table
CREATE TABLE IF NOT EXISTS instructor_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(instructor_id, day_of_week, start_time, end_time)
);

ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to instructor_availability" ON instructor_availability FOR ALL USING (true) WITH CHECK (true);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('driving', 'code', 'exam')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster overlap checks
CREATE INDEX lessons_instructor_time_idx ON lessons (instructor_id, start_time, end_time);
CREATE INDEX lessons_vehicle_time_idx ON lessons (vehicle_id, start_time, end_time);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to lessons" ON lessons FOR ALL USING (true) WITH CHECK (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check for lesson overlaps
CREATE OR REPLACE FUNCTION check_lesson_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for instructor overlap
  IF EXISTS (
    SELECT 1 FROM lessons
    WHERE instructor_id = NEW.instructor_id
    AND id != NEW.id
    AND status != 'cancelled'
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
  ) THEN
    RAISE EXCEPTION 'Instructor schedule overlap detected';
  END IF;

  -- Check for vehicle overlap if vehicle is assigned
  IF NEW.vehicle_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lessons
    WHERE vehicle_id = NEW.vehicle_id
    AND id != NEW.id
    AND status != 'cancelled'
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
  ) THEN
    RAISE EXCEPTION 'Vehicle schedule overlap detected';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add overlap check trigger
CREATE TRIGGER check_lesson_overlap_trigger
  BEFORE INSERT OR UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION check_lesson_overlap();