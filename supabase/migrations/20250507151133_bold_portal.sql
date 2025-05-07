/*
  # Ajout des tables véhicules et leçons

  1. Nouvelles Tables
    - `vehicule`
      - `id` (uuid, primary key)
      - `model` (text)
      - `year` (integer)
      - `registration` (text, unique)
      - `type` (text: 'Manuelle'/'Automatique')
      - `fuel` (text: 'Essence'/'Diesel'/'Électrique'/'Hybride')
      - `status` (text: 'available'/'reserved'/'maintenance')
      - `image` (text)
      - `created_at` (timestamptz)

    - `lecon`
      - `id` (uuid, primary key)
      - `eleve_id` (uuid, foreign key)
      - `instructeur_id` (uuid, foreign key)
      - `vehicule_id` (uuid, foreign key)
      - `debut` (timestamptz)
      - `fin` (timestamptz)
      - `type` (text: 'driving'/'code'/'exam')
      - `status` (text: 'scheduled'/'completed'/'cancelled')
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Sécurité
    - RLS activé mais accès public pour le développement
*/

-- Create vehicule table
CREATE TABLE IF NOT EXISTS vehicule (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  model text NOT NULL,
  year integer NOT NULL,
  registration text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('Manuelle', 'Automatique')),
  fuel text NOT NULL CHECK (fuel IN ('Essence', 'Diesel', 'Électrique', 'Hybride')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'maintenance')),
  image text,
  created_at timestamptz DEFAULT now()
);

-- Create lecon table
CREATE TABLE IF NOT EXISTS lecon (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  eleve_id uuid REFERENCES utilisateur(id) ON DELETE CASCADE,
  instructeur_id uuid REFERENCES utilisateur(id) ON DELETE CASCADE,
  vehicule_id uuid REFERENCES vehicule(id) ON DELETE SET NULL,
  debut timestamptz NOT NULL,
  fin timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('driving', 'code', 'exam')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecon ENABLE ROW LEVEL SECURITY;

-- Create public access policies
CREATE POLICY "Allow public access to vehicule" ON vehicule FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to lecon" ON lecon FOR ALL USING (true) WITH CHECK (true);

-- Insert demo vehicles
INSERT INTO vehicule (model, year, registration, type, fuel, image)
VALUES
  ('Renault Clio', 2022, 'AB-123-CD', 'Manuelle', 'Diesel', 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Peugeot 208', 2023, 'EF-456-GH', 'Automatique', 'Essence', 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Citroën C3', 2023, 'IJ-789-KL', 'Manuelle', 'Essence', 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800');