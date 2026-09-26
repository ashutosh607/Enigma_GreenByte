import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import { fetchCurrentUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransitionCurtain from './components/PageTransitionCurtain';

// Pages
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import MaterialDetailPage from './pages/MaterialDetailPage';
import AiDiscoveryPage from './pages/AiDiscoveryPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import DealWorkspacePage from './pages/DealWorkspacePage';
import DashboardPage from './pages/DashboardPage';
import AdminPortalPage from './pages/AdminPortalPage';
import RegisterPage from './pages/RegisterPage';

function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return children;
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] text-[#101010] selection:bg-[#E3DBCC] selection:text-[#101010]">
      {/* Editorial Minimal Navbar */}
      <Navbar />

      {/* Cinematic Full-Page Transition Curtain */}
      <PageTransitionCurtain />

      {/* Main Content Area - padded on non-home routes so floating glassmorphic navbar doesn't obscure content */}
      <main className={`flex-1 w-full ${isHome ? '' : 'pt-20 sm:pt-24'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/materials/:id" element={<MaterialDetailPage />} />
          <Route path="/ai-discovery" element={<AiDiscoveryPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="/deals/:id" element={<DealWorkspacePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPortalPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/signup" element={<RegisterPage />} />
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