import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === 'admin' && <AdminDashboard />}
      {user?.role === 'eleve' && <StudentDashboard />}
      {user?.role === 'instructeur' && <InstructorDashboard />}
    </div>
  );
};

export default Dashboard;