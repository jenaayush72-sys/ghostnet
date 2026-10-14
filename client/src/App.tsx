import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { NewInvestigation } from './pages/NewInvestigation';
import { Courtroom } from './pages/Courtroom';
import { CaseHistory } from './pages/CaseHistory';
import { EvidenceVault } from './pages/EvidenceVault';
import { HallucinationLab } from './pages/HallucinationLab';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#090B0E] text-gray-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/investigate" element={<NewInvestigation />} />
            <Route path="/courtroom/:caseId" element={<Courtroom />} />
            <Route path="/history" element={<CaseHistory />} />
            <Route path="/evidence" element={<EvidenceVault />} />
            <Route path="/lab" element={<HallucinationLab />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
