import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { getStoredUser } from './services/authService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { AddAsset } from './pages/AddAsset';
import { EditAsset } from './pages/EditAsset';
import { AssetDetails } from './pages/AssetDetails';
import { Reports } from './pages/Reports';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  return (
    <BrowserRouter>
      {!currentUser ? (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={setCurrentUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
          {/* Top Government Navbar */}
          <Navbar currentUser={currentUser} onUserChange={setCurrentUser} />

          {/* Body Container: Sidebar + Page View */}
          <div className="flex-1 flex flex-col lg:flex-row">
            <Sidebar role={currentUser.role} />

            <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assets" element={<Assets userRole={currentUser.role} />} />
                <Route path="/assets/new" element={<AddAsset />} />
                <Route path="/assets/:id" element={<AssetDetails userRole={currentUser.role} currentUserName={currentUser.name} />} />
                <Route path="/assets/:id/edit" element={<EditAsset />} />
                <Route path="/assets/maintenance" element={<Assets userRole={currentUser.role} />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
};

export default App;
