/*
  # Custom Authentication Setup

  1. New Tables
    - `utilisateur` table with authentication fields
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `name` (text)
      - `role` (text)
      - Other profile fields

  2. Security
    - Enable RLS but make table publicly accessible
    - Add policy for public access

  3. Demo Data
    - Create demo users with passwords
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS utilisateur CASCADE;

-- Create utilisateur table with password field
CREATE TABLE utilisateur (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'instructeur', 'eleve')),
  phone text,
  address text,
  birthdate date,
  progress jsonb DEFAULT '{
    "codeScore": 0,
    "maneuvers": {
      "city": false,
      "highway": false,
      "parking": false,
      "emergency": false,
      "reverseParking": false
    },
    "targetHours": 20,
    "drivingHours": 0
  }'::jsonb,
  specialty text,
  years_experience integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS but make table publicly accessible
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to utilisateur" ON utilisateur FOR ALL USING (true) WITH CHECK (true);

-- Insert demo users with passwords
INSERT INTO utilisateur (email, password, name, role, specialty, years_experience)
VALUES 
  ('admin@demo.com', 'demo123', 'Admin Demo', 'admin', NULL, NULL),
  ('instructor@demo.com', 'demo123', 'Jean Dupont', 'instructeur', 'Conduite en ville', 8),
  ('student@demo.com', 'demo123', 'Marie Martin', 'eleve', NULL, NULL);