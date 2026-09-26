import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import { fetchCurrentUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import MaterialDetailPage from './pages/MaterialDetailPage';
import AiDiscoveryPage from './pages/AiDiscoveryPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import DealWorkspacePage from './pages/DealWorkspacePage';
import DashboardPage from './pages/DashboardPage';
import ImpactPage from './pages/ImpactPage';
import AdminPortalPage from './pages/AdminPortalPage';

function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] text-[#101010] selection:bg-[#E3DBCC] selection:text-[#101010]">
      {/* Editorial Minimal Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/materials/:id" element={<MaterialDetailPage />} />
          <Route path="/ai-discovery" element={<AiDiscoveryPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="/deals/:id" element={<DealWorkspacePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/admin" element={<AdminPortalPage />} />
        </Routes>
      </main>

      {/* Institutional Editorial Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppInitializer>
          <AppContent />
        </AppInitializer>
      </Router>
    </Provider>
  );
}