import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout, PublicLayout } from './components/Layout';
import { Home, Doctors, Login, Register, Facilities } from './pages/PublicPages';
import { PatientDashboard, BookAppointment, MedicalReports, PatientProfile } from './pages/patient/PatientPortal';
import { AdminDashboard, ManageDoctors, AppointmentManagement } from './pages/admin/AdminPortal';
import { ManagePatients } from './pages/admin/ManagePatients';
import { VaccinationManager } from './pages/admin/VaccinationManager';
import { DoctorDashboard } from './pages/doctor/DoctorPortal';
import { Role } from './types';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/doctors" element={<PublicLayout><Doctors /></PublicLayout>} />
          <Route path="/facilities" element={<PublicLayout><Facilities /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

          <Route path="/patient" element={<ProtectedRoute allowedRoles={[Role.PATIENT]}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/book" element={<ProtectedRoute allowedRoles={[Role.PATIENT]}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={[Role.PATIENT]}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={[Role.PATIENT]}><PatientProfile /></ProtectedRoute>} />

          <Route path="/doctor" element={<ProtectedRoute allowedRoles={[Role.DOCTOR]}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={[Role.DOCTOR]}><div className="p-8 font-bold text-slate-400">Schedule Management Placeholder</div></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AppointmentManagement /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ManagePatients /></ProtectedRoute>} />
          <Route path="/admin/vaccinations" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><VaccinationManager /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;