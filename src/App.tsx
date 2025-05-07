import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VehicleManagement from './pages/VehicleManagement';
import InstructorManagement from './pages/InstructorManagement';
import StudentManagement from './pages/StudentManagement';
import Schedule from './pages/Schedule';
import CalendarView from './pages/CalendarView';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="vehicules" element={<VehicleManagement />} />
              <Route path="moniteurs" element={<InstructorManagement />} />
              <Route path="eleves" element={<StudentManagement />} />
              <Route path="planning" element={<Schedule />} />
              <Route path="calendrier" element={<CalendarView />} />
              <Route path="profil" element={<Profile />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;