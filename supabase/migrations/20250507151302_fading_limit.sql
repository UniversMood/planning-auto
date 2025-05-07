/*
  # Ajouter la gestion des notifications

  1. Nouvelle Table
    - `notification`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence utilisateur)
      - `title` (text)
      - `message` (text)
      - `type` (text: info, warning, success, error)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS
    - Politique d'accès public pour le développement
*/

-- Create notification table
CREATE TABLE IF NOT EXISTS notification (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES utilisateur(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- Create public access policy
CREATE POLICY "Allow public access to notification" ON notification FOR ALL USING (true) WITH CHECK (true);

-- Insert some demo notifications
INSERT INTO notification (user_id, title, message, type)
SELECT 
  id as user_id,
  'Bienvenue sur AutoÉcole Pro' as title,
  'Nous sommes ravis de vous accueillir sur notre plateforme.' as message,
  'info' as type
FROM utilisateur
WHERE role = 'eleve';