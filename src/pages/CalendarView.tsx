import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentCalendarView from './StudentCalendarView';
import InstructorCalendarView from './InstructorCalendarView';

const CalendarView = () => {
  const { user } = useAuth();

  if (user?.role === 'eleve') {
    return <StudentCalendarView />;
  }

  if (user?.role === 'instructeur') {
    return <InstructorCalendarView />;
  }

  return null;
};

export default CalendarView;