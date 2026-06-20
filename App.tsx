import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout, PublicLayout } from './components/Layout';
import { Home, Doctors, Login, Facilities } from './pages/PublicPages';
import { PatientDashboard, BookAppointment, MedicalReports } from './pages/patient/PatientPortal';
import { AdminDashboard, ManageDoctors, AppointmentManagement } from './pages/admin/AdminPortal';
import { ManagePatients } from './pages/admin/ManagePatients';
import { VaccinationManager } from './pages/admin/VaccinationManager';
import { DoctorDashboard, DoctorSchedule, DoctorProfile } from './pages/doctor/DoctorPortal';
import { Role } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) {
    const isPatientRoute = allowedRoles.includes(Role.PATIENT) && !allowedRoles.includes(Role.DOCTOR) && !allowedRoles.includes(Role.ADMIN);
    const redirectUrl = isPatientRoute 
      ? `/login?role=PATIENT&redirect=${encodeURIComponent(location.pathname + location.search)}` 
      : `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectUrl} />;
  }
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/doctors" element={<PublicLayout><Doctors /></PublicLayout>} />
          <Route path="/facilities" element={<PublicLayout><Facilities /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Login /></PublicLayout>} />

          {/* Patient Routes */}
          <Route 
            path="/patient" 
            element={
              <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/book" 
            element={
              <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <BookAppointment />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/patient/appointments" 
            element={
              <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/profile" 
            element={
              <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                 <MedicalReports />
              </ProtectedRoute>
            } 
          />

          {/* Doctor Routes */}
          <Route 
            path="/doctor" 
            element={
              <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/doctor/schedule" 
            element={
              <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                 <DoctorSchedule />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/doctor/profile" 
            element={
              <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                 <DoctorProfile />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/doctors" 
            element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <ManageDoctors />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/appointments" 
            element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <AppointmentManagement />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/patients" 
            element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                 <ManagePatients />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/vaccinations" 
            element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                 <VaccinationManager />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;