import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentProfile from './StudentProfile';
import InstructorProfile from './InstructorProfile';

const Profile = () => {
  const { user } = useAuth();

  if (user?.role === 'eleve') {
    return <StudentProfile />;
  }

  if (user?.role === 'instructeur') {
    return <InstructorProfile />;
  }

  return null;
};

export default Profile;